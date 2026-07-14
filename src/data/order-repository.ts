import type { WholesaleOrder } from "../domain/checkout"

const storageKey = "paki-wholesale-orders:v1"

export interface CheckoutRepository {
  placeOrder(order: WholesaleOrder): Promise<WholesaleOrder>
  listOrders(): Promise<WholesaleOrder[]>
  getOrder(orderId: string): Promise<WholesaleOrder | null>
}

export class LocalOrderRepository implements CheckoutRepository {
  constructor(private readonly storage: Storage) {}

  async placeOrder(order: WholesaleOrder) {
    const existing = this.readOrders().filter(({ id }) => id !== order.id)
    this.storage.setItem(storageKey, JSON.stringify([order, ...existing]))
    return order
  }

  async listOrders() {
    return this.readOrders().sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  }

  async getOrder(orderId: string) {
    return this.readOrders().find(({ id }) => id === orderId) ?? null
  }

  private readOrders(): WholesaleOrder[] {
    const saved = this.storage.getItem(storageKey)
    if (!saved) return []

    try {
      const parsed: unknown = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed as WholesaleOrder[] : []
    } catch {
      return []
    }
  }
}
