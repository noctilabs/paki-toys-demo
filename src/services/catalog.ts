import type { Product } from "../domain/catalog"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function toHandle(value: string) {
  return normalize(value).replace(/&/g, "e").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function filterProducts(products: Product[], query: string, category: string) {
  const normalizedQuery = normalize(query)

  return products.filter((product) => {
    const matchesCategory = category === "all" || toHandle(product.category) === category
    const searchable = normalize(`${product.title} ${product.category} ${product.description}`)
    return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
  })
}
