import { describe, expect, it } from "vitest"
import type { Product } from "../domain/catalog"
import { pakiProducts } from "../data/paki-catalog"
import {
  buildExampleCart,
  calculateCommercialTotals,
  calculateMinimumProgress,
  getDemoRetailerDraft,
  getFreightOption,
  getProductAvailability,
  getVolumeTier,
  isAvailabilityUnderReview,
  priceCommercialLine,
} from "./commercial"

const product = (price = 10): Product => ({
  id: "test-product",
  handle: "test-product",
  title: "Produto de teste",
  category: "Teste",
  description: "Produto usado nos testes.",
  image: "/test.webp",
  price,
  age: "+3 a",
  ref: "TEST",
  ean: "0000000000000",
  dun: "00000000000000",
  masterQuantity: 6,
  productDimensions: "10 x 10 x 10 cm",
  masterDimensions: "20 x 20 x 20 cm",
  weightKg: "1,000",
  cubage: "0,0100",
})

describe("commercial pricing", () => {
  it("selects the configured tier by carton count", () => {
    expect(getVolumeTier(1).discountRate).toBe(0)
    expect(getVolumeTier(2).discountRate).toBe(0)
    expect(getVolumeTier(3).discountRate).toBe(0.05)
    expect(getVolumeTier(5).discountRate).toBe(0.05)
    expect(getVolumeTier(6).discountRate).toBe(0.08)
  })

  it("prices a commercial line with its volume discount", () => {
    expect(priceCommercialLine({ product: product(), quantity: 3 })).toMatchObject({
      listValue: 180,
      discountRate: 0.05,
      savings: 9,
      netSubtotal: 171,
    })
  })

  it("rounds commercial values to cents at line level", () => {
    expect(priceCommercialLine({ product: product(19.99), quantity: 3 })).toMatchObject({
      listValue: 359.82,
      savings: 17.99,
      netSubtotal: 341.83,
    })
  })

  it("adds freight without changing merchandise pricing", () => {
    const lines = [{ product: product(), quantity: 3 }]
    const withoutFreight = calculateCommercialTotals(lines)
    const withFreight = calculateCommercialTotals(lines, "express")

    expect(withFreight).toMatchObject({
      listValue: withoutFreight.listValue,
      savings: withoutFreight.savings,
      merchandiseSubtotal: withoutFreight.merchandiseSubtotal,
      freightTotal: 329,
      estimatedTotal: withoutFreight.merchandiseSubtotal + 329,
    })
  })
})

describe("demonstration commercial policy", () => {
  it("calculates progress below and above the illustrative minimum", () => {
    expect(calculateMinimumProgress(1200)).toEqual({
      minimum: 1500,
      current: 1200,
      remaining: 300,
      ratio: 0.8,
      reached: false,
    })
    expect(calculateMinimumProgress(1750)).toEqual({
      minimum: 1500,
      current: 1750,
      remaining: 0,
      ratio: 1,
      reached: true,
    })
  })

  it("reports configured and unknown availability safely", () => {
    expect(getProductAvailability("1214")).toBe(12)
    expect(getProductAvailability("unknown")).toBeUndefined()
    expect(isAvailabilityUnderReview("1214", 12)).toBe(false)
    expect(isAvailabilityUnderReview("1214", 13)).toBe(true)
    expect(isAvailabilityUnderReview("unknown", 1)).toBe(true)
  })

  it("resolves the configured freight options", () => {
    expect(getFreightOption("express")?.price).toBe(329)
    expect(getFreightOption("")).toBeUndefined()
  })

  it("builds the example cart and reports missing catalog products", () => {
    expect(buildExampleCart(pakiProducts).lines).toHaveLength(3)
    expect(buildExampleCart(pakiProducts).missingProductIds).toEqual([])

    const withoutDinoTruck = pakiProducts.filter(({ id }) => id !== "1214")
    const incomplete = buildExampleCart(withoutDinoTruck)
    expect(incomplete.lines).toHaveLength(2)
    expect(incomplete.missingProductIds).toEqual(["1214"])
  })

  it("returns a cloned demo retailer checkout draft", () => {
    const first = getDemoRetailerDraft()
    const second = getDemoRetailerDraft()

    expect(first.commercialTier).toBe("gold")
    expect(first.paymentTerm).toBe("")
    expect(first.freightOptionId).toBe("")
    expect(first.company).not.toBe(second.company)
    expect(first.delivery).not.toBe(second.delivery)
  })
})
