import { describe, expect, it } from "vitest"
import type { Product } from "../domain/catalog"
import { filterProducts } from "./catalog"

const products: Product[] = [
  {
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
  },
  {
    id: "4115",
    handle: "bingo-alfabeto",
    title: "Bingo Alfabeto",
    category: "Jogos",
    description: "Aprenda as letras brincando.",
    image: "/paki/products/4115-bingo-alfabeto.webp",
    price: 59.9,
    age: "+4 a",
    ref: "4115",
    ean: "3",
    dun: "4",
    masterQuantity: 6,
    productDimensions: "20 x 3,5 x 22",
    masterDimensions: "21,5 x 20,5 x 22,5",
    weightKg: "2,9",
    cubage: "0,0099",
  },
]

describe("filterProducts", () => {
  it("matches a normalized query across product content", () => {
    expect(filterProducts(products, "  DINO  ", "all")).toEqual([products[0]])
  })

  it("filters by a normalized category handle", () => {
    expect(filterProducts(products, "", "jogos")).toEqual([products[1]])
  })

  it("combines query and category filters", () => {
    expect(filterProducts(products, "dino", "jogos")).toEqual([])
  })

  it("returns an empty list when nothing matches", () => {
    expect(filterProducts(products, "xyz", "all")).toEqual([])
  })
})
