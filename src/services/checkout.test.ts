import { describe, expect, it } from "vitest"
import type { CartLine, Product } from "../domain/catalog"
import type { CheckoutDraft } from "../domain/checkout"
import {
  canSubmitCheckout,
  createWholesaleOrder,
  isValidCnpj,
  normalizeDigits,
  orderStatusSteps,
  restoreOrderCart,
  validateCheckoutStep,
  validateCompany,
  validateDelivery,
  validateTerms,
} from "./checkout"

const product: Product = {
  id: "1214",
  handle: "dino-truck",
  title: "Dino Truck",
  category: "Monta & Roda",
  description: "Caminhão com dinossauro para montar.",
  image: "/paki/products/1214-dino-truck.webp",
  price: 10,
  age: "+3 a",
  ref: "1214",
  ean: "1",
  dun: "2",
  masterQuantity: 6,
  productDimensions: "28 x 12 x 19",
  masterDimensions: "58 x 39 x 29",
  weightKg: "5,8",
  cubage: "0,0656",
}

const validDraft: CheckoutDraft = {
  company: {
    cnpj: "11.222.333/0001-81",
    legalName: "Brinquedos Aurora Ltda.",
    tradeName: "Aurora Kids",
    stateRegistration: "110.042.490.114",
    buyerName: "Marina Costa",
    email: "compras@aurorakids.com.br",
    phone: "(11) 99876-5432",
  },
  delivery: {
    postalCode: "01310-100",
    street: "Avenida Paulista",
    number: "1000",
    complement: "Loja 4",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    contactName: "Recebimento Aurora",
    instructions: "Entregar pela doca lateral.",
  },
  paymentTerm: "pix",
}

const cart: CartLine[] = [{ product, quantity: 2 }]

describe("checkout services", () => {
  it("normalizes digits and validates Brazilian CNPJ check digits", () => {
    expect(normalizeDigits("11.222.333/0001-81")).toBe("11222333000181")
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true)
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false)
    expect(isValidCnpj("11.222.333/0001-82")).toBe(false)
  })

  it("validates company details", () => {
    expect(validateCompany(validDraft.company)).toEqual({})
    expect(validateCompany({ ...validDraft.company, legalName: " ", email: "invalid", phone: "123" })).toEqual({
      legalName: "Informe a razão social.",
      email: "Informe um e-mail válido.",
      phone: "Informe um telefone com DDD.",
    })
  })

  it("validates delivery details and Brazilian state code", () => {
    expect(validateDelivery(validDraft.delivery)).toEqual({})
    expect(validateDelivery({ ...validDraft.delivery, postalCode: "123", state: "São Paulo", city: " " })).toEqual({
      postalCode: "Informe um CEP válido.",
      city: "Informe a cidade.",
      state: "Use a sigla de duas letras do estado.",
    })
  })

  it("requires a commercial payment term and complete cart", () => {
    expect(validateTerms("")).toEqual({ paymentTerm: "Escolha uma condição comercial." })
    expect(validateTerms("pix")).toEqual({})
    expect(canSubmitCheckout(validDraft, cart)).toBe(true)
    expect(canSubmitCheckout({ ...validDraft, paymentTerm: "" }, cart)).toBe(false)
    expect(canSubmitCheckout(validDraft, [])).toBe(false)
  })

  it("validates only the active checkout step", () => {
    expect(validateCheckoutStep("company", validDraft)).toEqual({})
    expect(validateCheckoutStep("delivery", validDraft)).toEqual({})
    expect(validateCheckoutStep("terms", validDraft)).toEqual({})
    expect(validateCheckoutStep("company", { ...validDraft, company: { ...validDraft.company, cnpj: "" } })).toEqual({
      cnpj: "Informe um CNPJ válido.",
    })
  })

  it("creates an immutable wholesale order snapshot", () => {
    const localProduct = { ...product }
    const order = createWholesaleOrder(validDraft, [{ product: localProduct, quantity: 2 }], {
      id: "order-1",
      reference: "PK-ABC12345",
      createdAt: "2026-07-14T20:00:00.000Z",
    })

    expect(order.id).toBe("order-1")
    expect(order.reference).toBe("PK-ABC12345")
    expect(order.status).toBe("received")
    expect(order.freightStatus).toBe("pending")
    expect(order.lines[0]).toMatchObject({
      productId: product.id,
      unitPrice: 10,
      unitsPerBox: 6,
      boxCount: 2,
      totalUnits: 12,
      lineSubtotal: 120,
    })
    expect(order.totals).toEqual({ boxCount: 2, unitCount: 12, merchandiseSubtotal: 120 })

    localProduct.title = "Alterado depois"
    expect(order.lines[0].title).toBe("Dino Truck")
  })

  it("derives ordered current and upcoming status steps", () => {
    expect(orderStatusSteps("received").map(({ status, state }) => ({ status, state }))).toEqual([
      { status: "received", state: "current" },
      { status: "commercial-review", state: "upcoming" },
      { status: "freight-confirmed", state: "upcoming" },
      { status: "approved", state: "upcoming" },
      { status: "invoiced", state: "upcoming" },
      { status: "shipped", state: "upcoming" },
    ])
  })

  it("restores available order products and reports missing products", () => {
    const order = createWholesaleOrder(validDraft, cart, {
      id: "order-2",
      reference: "PK-DEF67890",
      createdAt: "2026-07-14T21:00:00.000Z",
    })
    const restored = restoreOrderCart(order, [product])
    const missing = restoreOrderCart(order, [])

    expect(restored.lines).toEqual([{ product, quantity: 2 }])
    expect(restored.missingProductTitles).toEqual([])
    expect(missing.lines).toEqual([])
    expect(missing.missingProductTitles).toEqual(["Dino Truck"])
  })
})
