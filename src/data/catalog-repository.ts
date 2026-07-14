import type { Category, Product } from "../domain/catalog"
import { pakiCategories, pakiProducts } from "./paki-catalog"

export interface CatalogRepository {
  listProducts(): Promise<Product[]>
  listCategories(): Promise<Category[]>
  getProduct(handle: string): Promise<Product | undefined>
}

export const localCatalogRepository: CatalogRepository = {
  async listProducts() {
    return pakiProducts
  },
  async listCategories() {
    return pakiCategories
  },
  async getProduct(handle) {
    return pakiProducts.find((product) => product.handle === handle)
  },
}
