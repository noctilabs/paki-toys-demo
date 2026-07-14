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
  return lines.reduce((total, line) => total + line.quantity, 0)
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.product.price * line.quantity, 0)
}
