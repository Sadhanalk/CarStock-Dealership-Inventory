/** Categories offered in the admin form and the filter dropdown (data may add more). */
export const BASE_CATEGORIES = ['Electric', 'SUV', 'Sport', 'Compact', 'Sedan', 'Truck', 'Hatchback']

/** A listing with this many units or fewer is flagged as "low stock". */
export const LOW_STOCK_THRESHOLD = 2

export const emptyFilters = { query: '', category: '', min_price: '', max_price: '' }

export const formatPrice = (price) => `$${Number(price).toLocaleString('en-US')}`
