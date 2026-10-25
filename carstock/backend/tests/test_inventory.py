import pytest

from app.errors import InsufficientStockError
from app.repositories.vehicle_repository import VehicleRepository
from app.services.inventory_service import InventoryService


class TestPurchase:
    def test_purchase_decreases_stock_by_one(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle(quantity=3)
        response = client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers)
        assert response.status_code == 200
        assert response.json()["quantity"] == 2

    def test_purchase_can_take_several_units(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle(quantity=5)
        response = client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers, json={"quantity": 3})
        assert response.json()["quantity"] == 2

    def test_last_unit_can_be_bought_and_then_it_is_out_of_stock(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle(quantity=1)
        assert client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers).json()["quantity"] == 0
        again = client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers)
        assert again.status_code == 409
        assert "out of stock" in again.json()["detail"].lower()

    def test_cannot_buy_more_than_available_and_stock_is_unchanged(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle(quantity=2)
        assert client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers, json={"quantity": 5}).status_code == 409
        stock = client.get("/api/vehicles", headers=user_headers).json()[0]["quantity"]
        assert stock == 2

    def test_zero_stock_vehicle_is_rejected(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle(quantity=0)
        assert client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers).status_code == 409

    def test_unknown_vehicle_is_404(self, client, user_headers):
        assert client.post("/api/vehicles/9999/purchase", headers=user_headers).status_code == 404

    @pytest.mark.parametrize("quantity", [0, -1, 1.5])
    def test_invalid_quantities_are_rejected(self, client, user_headers, make_vehicle, quantity):
        vehicle = make_vehicle(quantity=3)
        assert client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers, json={"quantity": quantity}).status_code == 422

    def test_stale_read_cannot_oversell(self, session_factory, make_vehicle):
        """Two sessions both saw quantity=1. The first buys it; the second must NOT also succeed,
        because the stock guard is inside the SQL UPDATE rather than based on the stale value."""
        vehicle = make_vehicle(quantity=1)
        with session_factory() as first, session_factory() as second:
            service_a = InventoryService(first, VehicleRepository(first))
            service_b = InventoryService(second, VehicleRepository(second))
            assert VehicleRepository(second).get(vehicle.id).quantity == 1  # second session now holds a stale copy
            assert service_a.purchase(vehicle.id).quantity == 0
            with pytest.raises(InsufficientStockError):
                service_b.purchase(vehicle.id)


class TestRestock:
    def test_admin_can_restock(self, client, admin_headers, make_vehicle):
        vehicle = make_vehicle(quantity=1)
        response = client.post(f"/api/vehicles/{vehicle.id}/restock", headers=admin_headers, json={"quantity": 10})
        assert response.status_code == 200
        assert response.json()["quantity"] == 11

    def test_restocking_a_sold_out_vehicle_makes_it_purchasable_again(self, client, admin_headers, user_headers, make_vehicle):
        vehicle = make_vehicle(quantity=0)
        client.post(f"/api/vehicles/{vehicle.id}/restock", headers=admin_headers, json={"quantity": 2})
        assert client.post(f"/api/vehicles/{vehicle.id}/purchase", headers=user_headers).status_code == 200

    def test_normal_user_is_forbidden(self, client, user_headers, make_vehicle):
        vehicle = make_vehicle()
        assert client.post(f"/api/vehicles/{vehicle.id}/restock", headers=user_headers, json={"quantity": 5}).status_code == 403

    @pytest.mark.parametrize("body", [{"quantity": 0}, {"quantity": -3}, {}])
    def test_invalid_amounts_are_rejected(self, client, admin_headers, make_vehicle, body):
        vehicle = make_vehicle()
        assert client.post(f"/api/vehicles/{vehicle.id}/restock", headers=admin_headers, json=body).status_code == 422

    def test_unknown_vehicle_is_404(self, client, admin_headers):
        assert client.post("/api/vehicles/9999/restock", headers=admin_headers, json={"quantity": 1}).status_code == 404
