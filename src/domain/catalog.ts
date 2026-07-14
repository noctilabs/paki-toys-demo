export type CategoryAccent = "red" | "blue" | "yellow" | "green" | "sky"

export type Category = {
  name: string
  handle: string
  accent: CategoryAccent
}

export type Product = {
  id: string
  handle: string
  title: string
  category: string
  description: string
  image: string
  price: number
  age: string
  ref: string
  ean: string
  dun: string
  masterQuantity: number
  productDimensions: string
  masterDimensions: string
  weightKg: string
  cubage: string
  badge?: string
}

export type CartLine = {
  product: Product
  quantity: number
}
