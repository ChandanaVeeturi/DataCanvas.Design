import type { Column, DataRow, Dataset } from '@/lib/types'

export interface SampleSpec {
  id: string
  title: string
  description: string
  generate: () => { columns: Column[]; rows: DataRow[] }
}

/** Seeded RNG so samples are stable across reloads. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function round(n: number, dp = 2) {
  const f = Math.pow(10, dp)
  return Math.round(n * f) / f
}

// ---------- Iris (abridged but realistic) ----------
const irisBase: Array<[number, number, number, number, string]> = [
  [5.1, 3.5, 1.4, 0.2, 'setosa'],
  [4.9, 3.0, 1.4, 0.2, 'setosa'],
  [4.7, 3.2, 1.3, 0.2, 'setosa'],
  [4.6, 3.1, 1.5, 0.2, 'setosa'],
  [5.0, 3.6, 1.4, 0.2, 'setosa'],
  [5.4, 3.9, 1.7, 0.4, 'setosa'],
  [4.6, 3.4, 1.4, 0.3, 'setosa'],
  [5.0, 3.4, 1.5, 0.2, 'setosa'],
  [4.4, 2.9, 1.4, 0.2, 'setosa'],
  [4.9, 3.1, 1.5, 0.1, 'setosa'],
  [7.0, 3.2, 4.7, 1.4, 'versicolor'],
  [6.4, 3.2, 4.5, 1.5, 'versicolor'],
  [6.9, 3.1, 4.9, 1.5, 'versicolor'],
  [5.5, 2.3, 4.0, 1.3, 'versicolor'],
  [6.5, 2.8, 4.6, 1.5, 'versicolor'],
  [5.7, 2.8, 4.5, 1.3, 'versicolor'],
  [6.3, 3.3, 4.7, 1.6, 'versicolor'],
  [4.9, 2.4, 3.3, 1.0, 'versicolor'],
  [6.6, 2.9, 4.6, 1.3, 'versicolor'],
  [5.2, 2.7, 3.9, 1.4, 'versicolor'],
  [6.3, 3.3, 6.0, 2.5, 'virginica'],
  [5.8, 2.7, 5.1, 1.9, 'virginica'],
  [7.1, 3.0, 5.9, 2.1, 'virginica'],
  [6.3, 2.9, 5.6, 1.8, 'virginica'],
  [6.5, 3.0, 5.8, 2.2, 'virginica'],
  [7.6, 3.0, 6.6, 2.1, 'virginica'],
  [4.9, 2.5, 4.5, 1.7, 'virginica'],
  [7.3, 2.9, 6.3, 1.8, 'virginica'],
  [6.7, 2.5, 5.8, 1.8, 'virginica'],
  [7.2, 3.6, 6.1, 2.5, 'virginica'],
]

function generateIris(): { columns: Column[]; rows: DataRow[] } {
  const rng = mulberry32(1)
  const rows: DataRow[] = []
  // Expand to ~150 rows with small jitter for variety
  for (let i = 0; i < 5; i++) {
    for (const [a, b, c, d, sp] of irisBase) {
      rows.push({
        sepal_length: round(a + (rng() - 0.5) * 0.4, 1),
        sepal_width: round(b + (rng() - 0.5) * 0.4, 1),
        petal_length: round(c + (rng() - 0.5) * 0.3, 1),
        petal_width: round(d + (rng() - 0.5) * 0.2, 1),
        species: sp,
      })
    }
  }
  return {
    columns: [
      { id: 'sepal_length', name: 'sepal_length', type: 'number' },
      { id: 'sepal_width', name: 'sepal_width', type: 'number' },
      { id: 'petal_length', name: 'petal_length', type: 'number' },
      { id: 'petal_width', name: 'petal_width', type: 'number' },
      { id: 'species', name: 'species', type: 'categorical' },
    ],
    rows,
  }
}

// ---------- Titanic-ish ----------
function generateTitanic(): { columns: Column[]; rows: DataRow[] } {
  const rng = mulberry32(2)
  const firstNames = ['John', 'Mary', 'James', 'Anna', 'William', 'Elizabeth', 'Thomas', 'Margaret', 'Charles', 'Rose']
  const lastNames = ['Smith', 'Brown', 'Wilson', 'Johnson', 'Andrews', 'Murphy', 'O\'Connor', 'Becker', 'Hart', 'Allen']
  const classes = [1, 2, 3]
  const embarked = ['C', 'Q', 'S']
  const rows: DataRow[] = []
  for (let i = 0; i < 120; i++) {
    const pclass = pick(rng, classes)
    const sex = rng() < 0.65 ? 'male' : 'female'
    const baseSurv = sex === 'female' ? 0.7 : 0.2
    const classBonus = pclass === 1 ? 0.2 : pclass === 2 ? 0.05 : -0.1
    const survived = rng() < baseSurv + classBonus ? 1 : 0
    const age = rng() < 0.08 ? null : round(15 + rng() * 50, 0)
    const fare = round(pclass === 1 ? 30 + rng() * 200 : pclass === 2 ? 10 + rng() * 30 : 5 + rng() * 15, 2)
    rows.push({
      passenger_id: i + 1,
      survived,
      pclass,
      name: `${pick(rng, lastNames)}, ${pick(rng, firstNames)}`,
      sex,
      age,
      sibsp: Math.floor(rng() * 3),
      parch: Math.floor(rng() * 3),
      fare,
      embarked: pick(rng, embarked),
    })
  }
  return {
    columns: [
      { id: 'passenger_id', name: 'passenger_id', type: 'number' },
      { id: 'survived', name: 'survived', type: 'number' },
      { id: 'pclass', name: 'pclass', type: 'number' },
      { id: 'name', name: 'name', type: 'string' },
      { id: 'sex', name: 'sex', type: 'categorical' },
      { id: 'age', name: 'age', type: 'number' },
      { id: 'sibsp', name: 'sibsp', type: 'number' },
      { id: 'parch', name: 'parch', type: 'number' },
      { id: 'fare', name: 'fare', type: 'number' },
      { id: 'embarked', name: 'embarked', type: 'categorical' },
    ],
    rows,
  }
}

// ---------- NYC Taxi sample ----------
function generateNycTaxi(): { columns: Column[]; rows: DataRow[] } {
  const rng = mulberry32(3)
  const payment = ['credit_card', 'cash', 'no_charge', 'dispute']
  const rows: DataRow[] = []
  const start = new Date('2024-01-01T00:00:00Z').getTime()
  for (let i = 0; i < 200; i++) {
    const pickup = new Date(start + Math.floor(rng() * 30 * 24 * 3600 * 1000))
    const tripMinutes = round(2 + rng() * 45, 1)
    const dropoff = new Date(pickup.getTime() + tripMinutes * 60 * 1000)
    const distance = round(0.4 + rng() * 12, 2)
    const passengers = 1 + Math.floor(rng() * 4)
    const fare = round(3 + distance * 2.5 + tripMinutes * 0.4, 2)
    const tip = round(rng() < 0.7 ? fare * (0.1 + rng() * 0.2) : 0, 2)
    const total = round(fare + tip + 2.5, 2)
    rows.push({
      trip_id: i + 1,
      pickup_at: pickup,
      dropoff_at: dropoff,
      trip_minutes: tripMinutes,
      distance_miles: distance,
      passengers,
      payment_type: pick(rng, payment),
      fare_amount: fare,
      tip_amount: tip,
      total_amount: total,
    })
  }
  return {
    columns: [
      { id: 'trip_id', name: 'trip_id', type: 'number' },
      { id: 'pickup_at', name: 'pickup_at', type: 'date' },
      { id: 'dropoff_at', name: 'dropoff_at', type: 'date' },
      { id: 'trip_minutes', name: 'trip_minutes', type: 'number' },
      { id: 'distance_miles', name: 'distance_miles', type: 'number' },
      { id: 'passengers', name: 'passengers', type: 'number' },
      { id: 'payment_type', name: 'payment_type', type: 'categorical' },
      { id: 'fare_amount', name: 'fare_amount', type: 'number' },
      { id: 'tip_amount', name: 'tip_amount', type: 'number' },
      { id: 'total_amount', name: 'total_amount', type: 'number' },
    ],
    rows,
  }
}

// ---------- Retail sales demo ----------
function generateSales(): { columns: Column[]; rows: DataRow[] } {
  const rng = mulberry32(4)
  const regions = ['North', 'South', 'East', 'West']
  const categories = ['Electronics', 'Apparel', 'Home', 'Sports', 'Beauty']
  const products: Record<string, string[]> = {
    Electronics: ['Headphones', 'Speaker', 'Smartwatch', 'Tablet'],
    Apparel: ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers'],
    Home: ['Lamp', 'Pillow', 'Mug Set', 'Cookware'],
    Sports: ['Yoga Mat', 'Dumbbells', 'Bike Helmet', 'Soccer Ball'],
    Beauty: ['Lipstick', 'Perfume', 'Face Cream', 'Shampoo'],
  }
  const channels = ['online', 'in_store']
  const rows: DataRow[] = []
  const start = new Date('2024-01-01').getTime()
  for (let i = 0; i < 200; i++) {
    const cat = pick(rng, categories)
    const product = pick(rng, products[cat])
    const orderDate = new Date(start + Math.floor(rng() * 365 * 24 * 3600 * 1000))
    const quantity = 1 + Math.floor(rng() * 5)
    const unitPrice = round(10 + rng() * 240, 2)
    const discount = round(rng() < 0.3 ? rng() * 0.25 : 0, 2)
    const revenue = round(quantity * unitPrice * (1 - discount), 2)
    rows.push({
      order_id: 1000 + i,
      order_date: orderDate,
      region: pick(rng, regions),
      channel: pick(rng, channels),
      category: cat,
      product,
      quantity,
      unit_price: unitPrice,
      discount,
      revenue,
    })
  }
  return {
    columns: [
      { id: 'order_id', name: 'order_id', type: 'number' },
      { id: 'order_date', name: 'order_date', type: 'date' },
      { id: 'region', name: 'region', type: 'categorical' },
      { id: 'channel', name: 'channel', type: 'categorical' },
      { id: 'category', name: 'category', type: 'categorical' },
      { id: 'product', name: 'product', type: 'string' },
      { id: 'quantity', name: 'quantity', type: 'number' },
      { id: 'unit_price', name: 'unit_price', type: 'number' },
      { id: 'discount', name: 'discount', type: 'number' },
      { id: 'revenue', name: 'revenue', type: 'number' },
    ],
    rows,
  }
}

export const SAMPLES: SampleSpec[] = [
  {
    id: 'iris',
    title: 'Iris',
    description: '150 flowers · 5 columns · classic classification dataset',
    generate: generateIris,
  },
  {
    id: 'titanic',
    title: 'Titanic passengers',
    description: '120 passengers · 10 columns · mixed types & missing values',
    generate: generateTitanic,
  },
  {
    id: 'nyc-taxi',
    title: 'NYC taxi sample',
    description: '200 trips · 10 columns · dates, durations, and money',
    generate: generateNycTaxi,
  },
  {
    id: 'sales-demo',
    title: 'Retail sales demo',
    description: '200 orders · 10 columns · perfect for pivots',
    generate: generateSales,
  },
]

export function buildSampleDataset(spec: SampleSpec): Dataset {
  const { columns, rows } = spec.generate()
  return {
    id: spec.id,
    name: spec.title,
    sourceFile: `${spec.id}.sample`,
    createdAt: Date.now(),
    rowCount: rows.length,
    columns,
    rows,
  }
}
