import type { CartLine, Product } from "../domain/catalog"
import type { FreightOption } from "../domain/commercial"
import { demoCommercialPolicy } from "../data/demo-commercial-policy"

const money = (value: number) => Math.round(value * 100) / 100

export function getVolumeTier(boxCount: number) {
  return demoCommercialPolicy.tiers.find(
    (tier) =>
      boxCount >= tier.minBoxes
      && (tier.maxBoxes === undefined || boxCount <= tier.maxBoxes),
  ) ?? demoCommercialPolicy.tiers[0]
}

export function getProductAvailability(productId: string): number | undefined {
  return demoCommercialPolicy.availability[productId]
}

export function isAvailabilityUnderReview(productId: string, boxCount: number) {
  const available = getProductAvailability(productId)
  return available === undefined || boxCount > available
}

export function priceCommercialLine(line: CartLine) {
  const listValue = money(line.product.price * line.product.masterQuantity * line.quantity)
  const tier = getVolumeTier(line.quantity)
  const savings = money(listValue * tier.discountRate)
  const availableBoxes = getProductAvailability(line.product.id)

  return {
    productId: line.product.id,
    listValue,
    discountRate: tier.discountRate,
    discountLabel: tier.label,
    savings,
    netSubtotal: money(listValue - savings),
    availableBoxes,
    availabilityUnderReview: availableBoxes === undefined || line.quantity > availableBoxes,
  }
}

export function getFreightOption(id: FreightOption["id"] | "") {
  return demoCommercialPolicy.freightOptions.find((option) => option.id === id)
}

export function calculateCommercialTotals(
  lines: CartLine[],
  freightOptionId: FreightOption["id"] | "" = "",
) {
  const priced = lines.map(priceCommercialLine)
  const listValue = money(priced.reduce((total, line) => total + line.listValue, 0))
  const savings = money(priced.reduce((total, line) => total + line.savings, 0))
  const merchandiseSubtotal = money(
    priced.reduce((total, line) => total + line.netSubtotal, 0),
  )
  const freightTotal = getFreightOption(freightOptionId)?.price ?? 0

  return {
    listValue,
    savings,
    merchandiseSubtotal,
    freightTotal,
    estimatedTotal: money(merchandiseSubtotal + freightTotal),
  }
}

export function calculateMinimumProgress(current: number) {
  const minimum = demoCommercialPolicy.minimumOrder
  const roundedCurrent = money(current)
  return {
    minimum,
    current: roundedCurrent,
    remaining: money(Math.max(0, minimum - roundedCurrent)),
    ratio: Math.min(1, roundedCurrent / minimum),
    reached: roundedCurrent >= minimum,
  }
}

export function buildExampleCart(products: Product[]) {
  const byId = new Map(products.map((product) => [product.id, product]))
  const lines: CartLine[] = []
  const missingProductIds: string[] = []

  demoCommercialPolicy.exampleOrder.forEach(({ productId, boxCount }) => {
    const product = byId.get(productId)
    if (product) lines.push({ product, quantity: boxCount })
    else missingProductIds.push(productId)
  })

  return { lines, missingProductIds }
}

export function getDemoRetailerDraft() {
  const profile = demoCommercialPolicy.retailerProfile
  return {
    company: { ...profile.company },
    delivery: { ...profile.delivery },
    commercialTier: profile.commercialTier,
    paymentTerm: "" as const,
    freightOptionId: "" as const,
  }
}
