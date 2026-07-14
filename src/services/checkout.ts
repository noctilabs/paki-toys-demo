import type { CartLine, Product } from "../domain/catalog"
import type {
  CheckoutDraft,
  CompanyDetails,
  DeliveryAddress,
  FieldErrors,
  OrderStatusStep,
  PaymentTerm,
  WholesaleOrder,
  WholesaleOrderLine,
  WholesaleOrderStatus,
} from "../domain/checkout"
import { cartBoxCount, cartLineSubtotal, cartSubtotal, cartUnitCount } from "./cart"

const statusDefinitions: Array<Pick<OrderStatusStep, "status" | "label" | "description">> = [
  { status: "received", label: "Pedido recebido", description: "Recebemos sua solicitação para análise." },
  { status: "commercial-review", label: "Análise comercial", description: "Cadastro, estoque e condições em validação." },
  { status: "freight-confirmed", label: "Frete confirmado", description: "Valor e prazo de entrega confirmados." },
  { status: "approved", label: "Pedido aprovado", description: "Pedido liberado para faturamento." },
  { status: "invoiced", label: "Faturado", description: "Nota fiscal e volumes preparados." },
  { status: "shipped", label: "Enviado", description: "Mercadoria entregue à transportadora." },
]

const paymentTermLabels: Record<PaymentTerm, string> = {
  pix: "PIX à vista",
  "boleto-28": "Boleto faturado em 28 dias",
  commercial: "Negociação comercial",
}

export const emptyCheckoutDraft: CheckoutDraft = {
  company: {
    cnpj: "",
    legalName: "",
    tradeName: "",
    stateRegistration: "",
    buyerName: "",
    email: "",
    phone: "",
  },
  delivery: {
    postalCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    contactName: "",
    instructions: "",
  },
  paymentTerm: "",
}

export function normalizeDigits(value: string) {
  return value.replace(/\D/g, "")
}

function cnpjCheckDigit(base: string, weights: number[]) {
  const sum = base.split("").reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string) {
  const digits = normalizeDigits(value)
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false

  const first = cnpjCheckDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  const second = cnpjCheckDigit(`${digits.slice(0, 12)}${first}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return digits.endsWith(`${first}${second}`)
}

export function validateCompany(company: CompanyDetails): FieldErrors<CompanyDetails> {
  const errors: FieldErrors<CompanyDetails> = {}
  if (!isValidCnpj(company.cnpj)) errors.cnpj = "Informe um CNPJ válido."
  if (!company.legalName.trim()) errors.legalName = "Informe a razão social."
  if (!company.buyerName.trim()) errors.buyerName = "Informe o nome do comprador."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email.trim())) errors.email = "Informe um e-mail válido."
  const phone = normalizeDigits(company.phone)
  if (phone.length < 10 || phone.length > 11) errors.phone = "Informe um telefone com DDD."
  return errors
}

export function validateDelivery(delivery: DeliveryAddress): FieldErrors<DeliveryAddress> {
  const errors: FieldErrors<DeliveryAddress> = {}
  if (normalizeDigits(delivery.postalCode).length !== 8) errors.postalCode = "Informe um CEP válido."
  if (!delivery.street.trim()) errors.street = "Informe o endereço."
  if (!delivery.number.trim()) errors.number = "Informe o número."
  if (!delivery.neighborhood.trim()) errors.neighborhood = "Informe o bairro."
  if (!delivery.city.trim()) errors.city = "Informe a cidade."
  if (!/^[A-Z]{2}$/.test(delivery.state.trim().toUpperCase())) errors.state = "Use a sigla de duas letras do estado."
  if (!delivery.contactName.trim()) errors.contactName = "Informe o contato de recebimento."
  return errors
}

export function validateTerms(paymentTerm: PaymentTerm | "") {
  return paymentTerm ? {} : { paymentTerm: "Escolha uma condição comercial." }
}

export function paymentTermLabel(paymentTerm: PaymentTerm) {
  return paymentTermLabels[paymentTerm]
}

export type CheckoutStep = "company" | "delivery" | "terms" | "review"

export function validateCheckoutStep(step: CheckoutStep, draft: CheckoutDraft) {
  if (step === "company") return validateCompany(draft.company)
  if (step === "delivery") return validateDelivery(draft.delivery)
  if (step === "terms") return validateTerms(draft.paymentTerm)
  return {}
}

export function canSubmitCheckout(draft: CheckoutDraft, lines: CartLine[]) {
  return lines.length > 0
    && Object.keys(validateCompany(draft.company)).length === 0
    && Object.keys(validateDelivery(draft.delivery)).length === 0
    && Object.keys(validateTerms(draft.paymentTerm)).length === 0
}

function createOrderLine({ product, quantity }: CartLine): WholesaleOrderLine {
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    category: product.category,
    image: product.image,
    unitPrice: product.price,
    unitsPerBox: product.masterQuantity,
    boxCount: quantity,
    totalUnits: product.masterQuantity * quantity,
    lineSubtotal: cartLineSubtotal({ product, quantity }),
  }
}

function createOrderId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `order-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function createReference() {
  const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
    .replace(/[^a-z0-9]/gi, "")
    .slice(-8)
    .padStart(8, "0")
    .toUpperCase()
  return `PK-${token}`
}

type CreateOrderOptions = {
  id?: string
  reference?: string
  createdAt?: string
}

export function createWholesaleOrder(
  draft: CheckoutDraft,
  lines: CartLine[],
  options: CreateOrderOptions = {},
): WholesaleOrder {
  if (!canSubmitCheckout(draft, lines) || !draft.paymentTerm) {
    throw new Error("Checkout incompleto.")
  }

  return {
    id: options.id ?? createOrderId(),
    reference: options.reference ?? createReference(),
    createdAt: options.createdAt ?? new Date().toISOString(),
    status: "received",
    freightStatus: "pending",
    company: { ...draft.company },
    delivery: { ...draft.delivery, state: draft.delivery.state.toUpperCase() },
    paymentTerm: draft.paymentTerm,
    lines: lines.map(createOrderLine),
    totals: {
      boxCount: cartBoxCount(lines),
      unitCount: cartUnitCount(lines),
      merchandiseSubtotal: cartSubtotal(lines),
    },
  }
}

export function orderStatusSteps(currentStatus: WholesaleOrderStatus): OrderStatusStep[] {
  const currentIndex = statusDefinitions.findIndex(({ status }) => status === currentStatus)
  return statusDefinitions.map((definition, index) => ({
    ...definition,
    state: index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming",
  }))
}

export function restoreOrderCart(order: WholesaleOrder, products: Product[]) {
  const productById = new Map(products.map((product) => [product.id, product]))
  const lines: CartLine[] = []
  const missingProductTitles: string[] = []

  order.lines.forEach((orderLine) => {
    const product = productById.get(orderLine.productId)
    if (product) lines.push({ product, quantity: orderLine.boxCount })
    else missingProductTitles.push(orderLine.title)
  })

  return { lines, missingProductTitles }
}
