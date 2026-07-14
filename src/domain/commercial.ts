import type { CartLine } from "./catalog"
import type { CompanyDetails, DeliveryAddress } from "./checkout"

export type CommercialTier = "gold"

export type VolumePricingTier = {
  minBoxes: number
  maxBoxes?: number
  discountRate: number
  label: string
}

export type ProductAvailability = {
  productId: string
  availableBoxes: number
}

export type DemoRetailerProfile = {
  company: CompanyDetails
  delivery: DeliveryAddress
  commercialTier: CommercialTier
}

export type FreightOption = {
  id: "economy" | "express" | "pickup"
  title: string
  price: number
  estimate: string
  description: string
}

export type DemoCommercialPolicy = {
  minimumOrder: number
  tiers: VolumePricingTier[]
  availability: Record<string, number>
  freightOptions: FreightOption[]
  exampleOrder: Array<{ productId: string; boxCount: number }>
  retailerProfile: DemoRetailerProfile
}

export type CommercialLinePricing = {
  productId: string
  listValue: number
  discountRate: number
  discountLabel: string
  savings: number
  netSubtotal: number
  availableBoxes?: number
  availabilityUnderReview: boolean
}

export type CommercialOrderTotals = {
  listValue: number
  savings: number
  merchandiseSubtotal: number
  freightTotal: number
  estimatedTotal: number
}

export type MinimumOrderProgress = {
  minimum: number
  current: number
  remaining: number
  ratio: number
  reached: boolean
}

export type CommercialCartLine = CartLine & {
  pricing: CommercialLinePricing
}
