import type { CommercialOrderTotals, CommercialTier, FreightOption } from "./commercial"

export type PaymentTerm = "pix" | "boleto-28" | "commercial"

export type WholesaleOrderStatus =
  | "received"
  | "commercial-review"
  | "freight-confirmed"
  | "approved"
  | "invoiced"
  | "shipped"

export type CompanyDetails = {
  cnpj: string
  legalName: string
  tradeName: string
  stateRegistration: string
  buyerName: string
  email: string
  phone: string
}

export type DeliveryAddress = {
  postalCode: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  contactName: string
  instructions: string
}

export type CheckoutDraft = {
  company: CompanyDetails
  delivery: DeliveryAddress
  commercialTier: CommercialTier
  freightOptionId: FreightOption["id"] | ""
  paymentTerm: PaymentTerm | ""
}

export type WholesaleOrderLine = {
  productId: string
  handle: string
  title: string
  category: string
  image: string
  unitPrice: number
  unitsPerBox: number
  boxCount: number
  totalUnits: number
  lineSubtotal: number
  listValue: number
  discountRate: number
  discountLabel: string
  savings: number
  netSubtotal: number
}

export type OrderTotals = {
  boxCount: number
  unitCount: number
  merchandiseSubtotal: number
}

export type WholesaleOrder = {
  id: string
  reference: string
  createdAt: string
  status: WholesaleOrderStatus
  freightStatus: "pending"
  company: CompanyDetails
  delivery: DeliveryAddress
  paymentTerm: PaymentTerm
  commercialTier: CommercialTier
  freight: FreightOption
  lines: WholesaleOrderLine[]
  totals: OrderTotals
  commercialTotals: CommercialOrderTotals
}

export type StatusStepState = "complete" | "current" | "upcoming"

export type OrderStatusStep = {
  status: WholesaleOrderStatus
  label: string
  description: string
  state: StatusStepState
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>
