const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randFloat = (min, max) => +(Math.random() * (max - min) + min).toFixed(2)

const genericProducts = [
  'Premium Service Plan', 'Enterprise Suite', 'Starter Package',
  'Analytics Dashboard', 'Cloud Storage Pro', 'Team Collaboration',
  'Security Shield', 'Custom Integration', 'API Access Tier',
  'Support Plus', 'Data Insights', 'Mobile App Pro'
]

const statuses = ['Complete', 'Processing', 'Shipped', 'Cancelled', 'Returned']
const statusColors = ['#34d399', '#67e8f9', '#a3e635', '#fb7185', '#c4b5fd']

const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'IN', 'MX']
const states = ['Active', 'Pending', 'Suspended', 'Trial', 'Churned']

const firstNames = ['James', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'Daniel', 'Sophia', 'Alex', 'Mia', 'Chris', 'Lily', 'Tom', 'Ava', 'Ryan']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Lee', 'Chen']

export function generateKPIs() {
  return {
    newUsers: rand(80, 300),
    lifetimeSpend: randFloat(20, 120),
    avgProcessingTime: randFloat(1.5, 8),
    totalSales: rand(8000, 50000),
    itemsCount: rand(100, 800),
    usersCount: rand(150, 1000),
    avgDaysToShip: rand(2, 9),
  }
}

export function generateOrdersChart() {
  const data = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const entry = {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
    statuses.forEach(s => { entry[s] = rand(1, 22) })
    data.push(entry)
  }
  return { data, statuses, statusColors }
}

export function generateTopProducts(brandProducts) {
  const names = brandProducts.length > 0
    ? brandProducts.map(p => p.name)
    : genericProducts.slice(0, 6)

  return names.slice(0, 6).map((name, i) => ({
    rank: i + 1,
    name,
    revenue: rand(200, 6000),
    image: brandProducts[i]?.image || '',
    rating: randFloat(3.5, 5.0),
  }))
}

export function generateInventory(brandProducts) {
  const names = brandProducts.length > 0
    ? brandProducts.map(p => p.name)
    : genericProducts

  return names.slice(0, 12).map((name, i) => ({
    id: `SKU-${String(1000 + i).padStart(4, '0')}`,
    name,
    category: ['Electronics', 'Apparel', 'Services', 'Software', 'Hardware'][i % 5],
    stock: rand(0, 500),
    price: randFloat(9.99, 299.99),
    status: rand(0, 100) > 15 ? 'In Stock' : 'Low Stock',
  }))
}

export function generateRevenueChart() {
  const data = []
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today)
    d.setMonth(d.getMonth() - i)
    data.push({
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      revenue: rand(5000, 45000),
      orders: rand(50, 400),
    })
  }
  return data
}

export function generateTrafficChart() {
  const data = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    data.push({
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      visitors: rand(200, 2000),
      pageViews: rand(500, 5000),
      bounceRate: randFloat(20, 60),
    })
  }
  return data
}

export function generateCategoryBreakdown() {
  const categories = ['Electronics', 'Apparel', 'Home & Garden', 'Sports', 'Books', 'Other']
  return categories.map(name => ({
    name,
    value: rand(500, 5000),
  }))
}

export function generateUsers() {
  return Array.from({ length: 20 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[(i * 3) % lastNames.length]
    const daysAgo = rand(0, 90)
    const joinDate = new Date()
    joinDate.setDate(joinDate.getDate() - daysAgo)
    return {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      country: countries[i % countries.length],
      status: states[i % states.length],
      orders: rand(0, 50),
      spent: randFloat(0, 2000),
      joined: joinDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    }
  })
}

export function generateSparkline(points = 8) {
  const data = []
  let val = rand(20, 80)
  for (let i = 0; i < points; i++) {
    val = Math.max(5, Math.min(100, val + rand(-15, 15)))
    data.push({ v: val })
  }
  return data
}
