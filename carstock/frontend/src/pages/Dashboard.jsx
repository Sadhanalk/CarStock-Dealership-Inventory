import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { vehiclesApi } from '../api/client'
import AppShell from '../components/AppShell'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import FilterBar from '../components/FilterBar'
import LoadingGrid from '../components/LoadingGrid'
import NoticeBanner from '../components/NoticeBanner'
import RestockModal from '../components/RestockModal'
import Stat from '../components/Stat'
import VehicleCard from '../components/VehicleCard'
import VehicleFormModal from '../components/VehicleFormModal'
import { BASE_CATEGORIES, LOW_STOCK_THRESHOLD, emptyFilters } from '../constants'
import { useAuth } from '../context/AuthContext'
import { useDebounce } from '../hooks/useDebounce'
import { useNotice } from '../hooks/useNotice'

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth()
  const { notice, success, error, dismiss } = useNotice()

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(emptyFilters)
  const [extraCategories, setExtraCategories] = useState([])
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Dialogs: formTarget is undefined (closed), null (add) or a vehicle (edit).
  const [formTarget, setFormTarget] = useState(undefined)
  const [restockTarget, setRestockTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Wait for the user to stop typing before asking the API.
  const debouncedFilters = useDebounce(filters)

  useEffect(() => {
    let cancelled = false // ignore a slow response that arrives after a newer one
    setLoading(true)
    vehiclesApi
      .search({ q: debouncedFilters.query.trim(), category: debouncedFilters.category, min_price: debouncedFilters.min_price, max_price: debouncedFilters.max_price })
      .then((data) => {
        if (cancelled) return
        setVehicles(data)
        // Remember categories seen so far so the dropdown keeps every option while filtering.
        setExtraCategories((known) => [...new Set([...known, ...data.map((vehicle) => vehicle.category)])])
      })
      .catch((err) => !cancelled && error(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [debouncedFilters, reloadKey, error])

  const categories = useMemo(() => [...new Set([...BASE_CATEGORIES, ...extraCategories])].sort(), [extraCategories])
  const stats = useMemo(
    () => ({
      total: vehicles.length,
      units: vehicles.reduce((sum, vehicle) => sum + vehicle.quantity, 0),
      low: vehicles.filter((vehicle) => vehicle.quantity > 0 && vehicle.quantity <= LOW_STOCK_THRESHOLD).length
    }),
    [vehicles]
  )

  const replaceVehicle = (updated) => setVehicles((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  const refresh = () => setReloadKey((key) => key + 1)

  const purchase = async (vehicle) => {
    setBusyId(vehicle.id)
    try {
      const updated = await vehiclesApi.purchase(vehicle.id)
      replaceVehicle(updated)
      success(`${updated.make} ${updated.model} reserved from stock.`)
    } catch (err) {
      error(err.message)
      refresh() // someone else may have bought it first: show the real stock
    } finally {
      setBusyId(null)
    }
  }

  const saveVehicle = async (values) => {
    setSaving(true)
    try {
      const editing = formTarget && formTarget.id
      const saved = editing ? await vehiclesApi.update(formTarget.id, values) : await vehiclesApi.create(values)
      setFormTarget(undefined)
      success(`${saved.make} ${saved.model} ${editing ? 'updated' : 'is now on the floor'}.`)
      refresh()
    } catch (err) {
      error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const restock = async (quantity) => {
    setSaving(true)
    try {
      const updated = await vehiclesApi.restock(restockTarget.id, quantity)
      replaceVehicle(updated)
      setRestockTarget(null)
      success(`${quantity} unit${quantity === 1 ? '' : 's'} added to ${updated.make} ${updated.model}.`)
    } catch (err) {
      error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    setSaving(true)
    try {
      await vehiclesApi.remove(deleteTarget.id)
      setVehicles((current) => current.filter((item) => item.id !== deleteTarget.id))
      success(`${deleteTarget.make} ${deleteTarget.model} removed from inventory.`)
      setDeleteTarget(null)
    } catch (err) {
      error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell user={user} onSignOut={logout}>
      <div className="flex flex-col justify-between gap-6 border-b border-ink/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">CarStock / 01 — Inventory</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-6xl">
            Move the right <span className="text-moss">metal.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-ink/60">A calm, decisive control room for every vehicle on the floor. Find it, reserve it, keep the line moving.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setFormTarget(null)} className="button-secondary self-start lg:self-auto">
            <Plus size={16} /> Add vehicle
          </button>
        )}
      </div>

      <NoticeBanner notice={notice} onDismiss={dismiss} />

      <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
        <Stat label="Listings" value={stats.total} />
        <Stat label="Units on floor" value={stats.units} />
        <Stat label="Low stock" value={stats.low} accent />
      </div>

      <section className="mt-10">
        <p className="eyebrow">Stock explorer</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">What are you looking for?</h2>
        <FilterBar filters={filters} categories={categories} onChange={setFilters} onClear={() => setFilters(emptyFilters)} />
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="eyebrow">Available now</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">The floor</h2>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink/40">{loading ? 'Scanning…' : `${vehicles.length} results`}</span>
        </div>
        {loading && vehicles.length === 0 ? (
          <LoadingGrid />
        ) : vehicles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin={isAdmin} busy={busyId === vehicle.id} onPurchase={purchase} onEdit={setFormTarget} onRestock={setRestockTarget} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}
      </section>

      {formTarget !== undefined && <VehicleFormModal vehicle={formTarget} busy={saving} onSave={saveVehicle} onClose={() => setFormTarget(undefined)} />}
      {restockTarget && <RestockModal vehicle={restockTarget} busy={saving} onSubmit={restock} onClose={() => setRestockTarget(null)} />}
      {deleteTarget && (
        <ConfirmModal
          title={`Delete ${deleteTarget.make} ${deleteTarget.model}?`}
          message="This permanently removes the listing from the inventory."
          confirmLabel="Delete listing"
          busy={saving}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AppShell>
  )
}
