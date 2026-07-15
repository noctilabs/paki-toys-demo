import { describe, expect, it } from "vitest"
import type { WholesaleOrder } from "../domain/checkout"
import { LocalOrderRepository } from "./order-repository"

class MemoryStorage implements Storage {
  protected values = new Map<string, string>()

  get length() { return this.values.size }
  clear() { this.values.clear() }
  getItem(key: string) { return this.values.get(key) ?? null }
  key(index: number) { return [...this.values.keys()][index] ?? null }
  removeItem(key: string) { this.values.delete(key) }
  setItem(key: string, value: string) { this.values.set(key, value) }
}

class ThrowingStorage extends MemoryStorage {
  setItem() { throw new Error("quota exceeded") }
}

function makeOrder(id: string, createdAt: string): WholesaleOrder {
  return {
    id,
    reference: `PK-${id.toUpperCase().padEnd(8, "0").slice(0, 8)}`,
    createdAt,
    status: "received",
    freightStatus: "pending",
    company: {
      cnpj: "11.222.333/0001-81",
      legalName: "Brinquedos Aurora Ltda.",
      tradeName: "Aurora Kids",
      stateRegistration: "",
      buyerName: "Marina Costa",
      email: "compras@aurora.com.br",
      phone: "11998765432",
    },
    delivery: {
      postalCode: "01310100",
      street: "Avenida Paulista",
      number: "1000",
      complement: "",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      contactName: "Recebimento",
      instructions: "",
    },
    paymentTerm: "pix",
    commercialTier: "gold",
    freight: {
      id: "economy",
      title: "Transportadora econômica",
      price: 189,
      estimate: "5–7 dias úteis",
      description: "Melhor equilíbrio entre prazo e custo.",
    },
    lines: [],
    totals: { boxCount: 0, unitCount: 0, merchandiseSubtotal: 0 },
    commercialTotals: {
      listValue: 0,
      savings: 0,
      merchandiseSubtotal: 0,
      freightTotal: 189,
      estimatedTotal: 189,
    },
  }
}

describe("local order repository", () => {
  it("places, lists newest first, and retrieves orders", async () => {
    const repository = new LocalOrderRepository(new MemoryStorage())
    const older = makeOrder("one", "2026-07-14T19:00:00.000Z")
    const newer = makeOrder("two", "2026-07-14T20:00:00.000Z")

    await repository.placeOrder(older)
    await repository.placeOrder(newer)

    expect(await repository.listOrders()).toEqual([newer, older])
    expect(await repository.getOrder("one")).toEqual(older)
    expect(await repository.getOrder("missing")).toBeNull()
  })

  it("recovers malformed saved data as an empty order list", async () => {
    const storage = new MemoryStorage()
    storage.setItem("paki-wholesale-orders:v1", "not-json")
    const repository = new LocalOrderRepository(storage)

    expect(await repository.listOrders()).toEqual([])
  })

  it("propagates storage write failures", async () => {
    const repository = new LocalOrderRepository(new ThrowingStorage())

    await expect(repository.placeOrder(makeOrder("one", "2026-07-14T19:00:00.000Z")))
      .rejects.toThrow("quota exceeded")
  })
})
