import { describe, expect, it } from "vitest"
import type { CartLine, Product } from "../domain/catalog"
import {
  addCartItem,
  cartBoxCount,
  cartItemCount,
  cartLineSubtotal,
  cartSubtotal,
  cartUnitCount,
  changeCartQuantity,
  removeCartItem,
} from "./cart"

const product: Product = {
  id: "1214",
  handle: "dino-truck",
  title: "Dino Truck",
  category: "Monta & Roda",
  description: "Caminhão com dinossauro para montar.",
  image: "/paki/products/1214-dino-truck.webp",
  price: 119.9,
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

describe("cart services", () => {
  it("adds a new product without mutating the original cart", () => {
    const cart: CartLine[] = []
    const next = addCartItem(cart, product)

    expect(next).toEqual([{ product, quantity: 1 }])
    expect(cart).toEqual([])
  })

  it("merges duplicate products by increasing quantity", () => {
    const next = addCartItem([{ product, quantity: 1 }], product)
    expect(next[0].quantity).toBe(2)
  })

  it("removes a line when its quantity reaches zero", () => {
    expect(changeCartQuantity([{ product, quantity: 1 }], product.id, -1)).toEqual([])
  })

  it("calculates quantity and subtotal", () => {
    const cart = [{ product, quantity: 2 }]
    expect(cartItemCount(cart)).toBe(2)
    expect(cartSubtotal(cart)).toBe(1438.8)
  })

  it("calculates wholesale cartons, units, and merchandise subtotal", () => {
    const cart = [{ product: { ...product, price: 10, masterQuantity: 6 }, quantity: 2 }]

    expect(cartBoxCount(cart)).toBe(2)
    expect(cartUnitCount(cart)).toBe(12)
    expect(cartLineSubtotal(cart[0])).toBe(120)
    expect(cartSubtotal(cart)).toBe(120)
  })

  it("removes a product explicitly", () => {
    expect(removeCartItem([{ product, quantity: 2 }], product.id)).toEqual([])
  })
})
