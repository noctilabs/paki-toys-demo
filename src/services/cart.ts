import type { CartLine, Product } from "../domain/catalog"

export function addCartItem(lines: CartLine[], product: Product): CartLine[] {
  const existing = lines.find((line) => line.product.id === product.id)

  if (!existing) {
    return [...lines, { product, quantity: 1 }]
  }

  return lines.map((line) =>
    line.product.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
  )
}

export function changeCartQuantity(lines: CartLine[], productId: string, delta: number): CartLine[] {
  return lines
    .map((line) =>
      line.product.id === productId ? { ...line, quantity: line.quantity + delta } : line,
    )
    .filter((line) => line.quantity > 0)
}

export function removeCartItem(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((line) => line.product.id !== productId)
}

export function cartItemCount(lines: CartLine[]) {
  return cartBoxCount(lines)
}

export function cartBoxCount(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0)
}

export function cartUnitCount(lines: CartLine[]) {
  return lines.reduce(
    (total, line) => total + line.quantity * line.product.masterQuantity,
    0,
  )
}

export function cartLineSubtotal(line: CartLine) {
  return Math.round(line.product.price * line.product.masterQuantity * line.quantity * 100) / 100
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + cartLineSubtotal(line), 0)
}
