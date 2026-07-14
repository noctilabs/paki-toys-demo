import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react"
import type { CartLine } from "../domain/catalog"
import type { CheckoutDraft, CompanyDetails, DeliveryAddress, OrderTotals, PaymentTerm } from "../domain/checkout"
import { validateCheckoutStep, type CheckoutStep } from "../services/checkout"
import { OrderSummary } from "./order-summary"

const steps: Array<{ key: CheckoutStep; number: string; label: string }> = [
  { key: "company", number: "01", label: "Empresa" },
  { key: "delivery", number: "02", label: "Entrega" },
  { key: "terms", number: "03", label: "Condições" },
  { key: "review", number: "04", label: "Revisão" },
]

const termOptions: Array<{ value: PaymentTerm; title: string; detail: string; tag: string }> = [
  { value: "pix", title: "PIX à vista", detail: "Condição sujeita à confirmação comercial. Nenhum pagamento é coletado nesta demonstração.", tag: "Agilidade" },
  { value: "boleto-28", title: "Boleto faturado em 28 dias", detail: "Liberação após análise cadastral e aprovação de crédito pela equipe Paki.", tag: "Para sua loja" },
  { value: "commercial", title: "Negociação comercial", detail: "A equipe entra em contato para definir volumes, prazos e condições personalizadas.", tag: "Sob medida" },
]

type CheckoutProps = {
  lines: CartLine[]
  totals: OrderTotals
  draft: CheckoutDraft
  submitting: boolean
  submitError: string
  onDraftChange: (draft: CheckoutDraft) => void
  onSubmit: () => void
  onCancel: () => void
}

type FieldProps = {
  name: string
  label: string
  value: string
  error?: string
  required?: boolean
  autoComplete?: string
  inputMode?: "text" | "email" | "tel" | "numeric"
  placeholder?: string
  onChange: (value: string) => void
}

function Field({ name, label, value, error, required, autoComplete, inputMode, placeholder, onChange }: FieldProps) {
  const errorId = `${name}-error`
  return (
    <label className={`field${error ? " field--error" : ""}`}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input
        id={name}
        data-field={name}
        name={name}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <small id={errorId} className="field-error">{error}</small>}
    </label>
  )
}

function ReviewBlock({ title, action, children }: { title: string; action: () => void; children: ReactNode }) {
  return (
    <section className="review-block">
      <div><h3>{title}</h3><button type="button" onClick={action}>Editar</button></div>
      {children}
    </section>
  )
}

export function Checkout({ lines, totals, draft, submitting, submitError, onDraftChange, onSubmit, onCancel }: CheckoutProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const headingRef = useRef<HTMLHeadingElement>(null)
  const step = steps[stepIndex]

  useEffect(() => {
    headingRef.current?.focus()
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [stepIndex])

  function updateCompany(field: keyof CompanyDetails, value: string) {
    onDraftChange({ ...draft, company: { ...draft.company, [field]: value } })
    setErrors((current) => ({ ...current, [field]: "" }))
  }

  function updateDelivery(field: keyof DeliveryAddress, value: string) {
    onDraftChange({ ...draft, delivery: { ...draft.delivery, [field]: field === "state" ? value.toUpperCase().slice(0, 2) : value } })
    setErrors((current) => ({ ...current, [field]: "" }))
  }

  function goToStep(index: number) {
    setErrors({})
    setStepIndex(index)
  }

  function advance() {
    const nextErrors = validateCheckoutStep(step.key, draft) as Record<string, string>
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const firstField = Object.keys(nextErrors)[0]
      window.setTimeout(() => document.querySelector<HTMLElement>(`[data-field="${firstField}"]`)?.focus(), 0)
      return
    }
    goToStep(Math.min(stepIndex + 1, steps.length - 1))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (step.key === "review") onSubmit()
    else advance()
  }

  return (
    <main className="checkout-page">
      <header className="checkout-topbar">
        <button className="checkout-brand" type="button" onClick={onCancel} aria-label="Voltar à loja Paki Toys">
          <img src="/paki/logo.webp" alt="" /><span>Pedido para lojistas</span>
        </button>
        <span className="demo-pill">Demonstração segura · sem cobrança</span>
      </header>

      <div className="checkout-progress" aria-label="Etapas do pedido">
        {steps.map((item, index) => (
          <div className={index < stepIndex ? "is-complete" : index === stepIndex ? "is-current" : ""} key={item.key} aria-current={index === stepIndex ? "step" : undefined}>
            <span>{index < stepIndex ? "✓" : item.number}</span><b>{item.label}</b>
          </div>
        ))}
      </div>

      <div className="checkout-shell">
        <form className="checkout-panel" noValidate onSubmit={handleSubmit}>
          <div className="checkout-panel__intro">
            <span className="section-kicker">Etapa {stepIndex + 1} de {steps.length}</span>
            <h1 ref={headingRef} tabIndex={-1}>
              {step.key === "company" && "Conte sobre a sua loja"}
              {step.key === "delivery" && "Onde devemos entregar?"}
              {step.key === "terms" && "Escolha uma condição"}
              {step.key === "review" && "Revise antes de enviar"}
            </h1>
            <p>
              {step.key === "company" && "Usamos estes dados apenas para simular a análise comercial deste pedido."}
              {step.key === "delivery" && "O frete e o prazo serão calculados pela equipe Paki após o envio."}
              {step.key === "terms" && "A seleção registra sua preferência e não representa aprovação de crédito ou cobrança."}
              {step.key === "review" && "O envio cria uma solicitação de compra para análise, sem pagamento nesta etapa."}
            </p>
          </div>

          {step.key === "company" && (
            <div className="field-grid">
              <Field name="cnpj" label="CNPJ" value={draft.company.cnpj} error={errors.cnpj} required inputMode="numeric" autoComplete="organization" placeholder="11.222.333/0001-81" onChange={(value) => updateCompany("cnpj", value)} />
              <Field name="stateRegistration" label="Inscrição estadual" value={draft.company.stateRegistration} autoComplete="off" placeholder="Opcional" onChange={(value) => updateCompany("stateRegistration", value)} />
              <div className="field--wide"><Field name="legalName" label="Razão social" value={draft.company.legalName} error={errors.legalName} required autoComplete="organization" onChange={(value) => updateCompany("legalName", value)} /></div>
              <div className="field--wide"><Field name="tradeName" label="Nome fantasia" value={draft.company.tradeName} autoComplete="organization" placeholder="Opcional" onChange={(value) => updateCompany("tradeName", value)} /></div>
              <Field name="buyerName" label="Nome do comprador" value={draft.company.buyerName} error={errors.buyerName} required autoComplete="name" onChange={(value) => updateCompany("buyerName", value)} />
              <Field name="phone" label="Telefone / WhatsApp" value={draft.company.phone} error={errors.phone} required inputMode="tel" autoComplete="tel" placeholder="(11) 99876-5432" onChange={(value) => updateCompany("phone", value)} />
              <div className="field--wide"><Field name="email" label="E-mail comercial" value={draft.company.email} error={errors.email} required inputMode="email" autoComplete="email" placeholder="compras@sualoja.com.br" onChange={(value) => updateCompany("email", value)} /></div>
            </div>
          )}

          {step.key === "delivery" && (
            <div className="field-grid">
              <Field name="postalCode" label="CEP" value={draft.delivery.postalCode} error={errors.postalCode} required inputMode="numeric" autoComplete="postal-code" placeholder="01310-100" onChange={(value) => updateDelivery("postalCode", value)} />
              <Field name="state" label="UF" value={draft.delivery.state} error={errors.state} required autoComplete="address-level1" placeholder="SP" onChange={(value) => updateDelivery("state", value)} />
              <div className="field--wide"><Field name="street" label="Endereço" value={draft.delivery.street} error={errors.street} required autoComplete="address-line1" onChange={(value) => updateDelivery("street", value)} /></div>
              <Field name="number" label="Número" value={draft.delivery.number} error={errors.number} required autoComplete="address-line2" onChange={(value) => updateDelivery("number", value)} />
              <Field name="complement" label="Complemento" value={draft.delivery.complement} autoComplete="address-line2" placeholder="Opcional" onChange={(value) => updateDelivery("complement", value)} />
              <Field name="neighborhood" label="Bairro" value={draft.delivery.neighborhood} error={errors.neighborhood} required autoComplete="address-level3" onChange={(value) => updateDelivery("neighborhood", value)} />
              <Field name="city" label="Cidade" value={draft.delivery.city} error={errors.city} required autoComplete="address-level2" onChange={(value) => updateDelivery("city", value)} />
              <div className="field--wide"><Field name="contactName" label="Contato no recebimento" value={draft.delivery.contactName} error={errors.contactName} required autoComplete="name" onChange={(value) => updateDelivery("contactName", value)} /></div>
              <label className="field field--wide"><span>Instruções de entrega</span><textarea value={draft.delivery.instructions} placeholder="Opcional: doca, horários ou referências" onChange={(event) => updateDelivery("instructions", event.target.value)} /></label>
            </div>
          )}

          {step.key === "terms" && (
            <div className="terms-grid">
              {termOptions.map((option) => (
                <label className={draft.paymentTerm === option.value ? "term-card is-selected" : "term-card"} key={option.value}>
                  <input type="radio" name="paymentTerm" data-field="paymentTerm" value={option.value} checked={draft.paymentTerm === option.value} onChange={() => { onDraftChange({ ...draft, paymentTerm: option.value }); setErrors({}) }} />
                  <span className="term-card__tag">{option.tag}</span><strong>{option.title}</strong><p>{option.detail}</p><i aria-hidden="true">{draft.paymentTerm === option.value ? "✓" : ""}</i>
                </label>
              ))}
              {errors.paymentTerm && <p className="field-error terms-error" role="alert">{errors.paymentTerm}</p>}
            </div>
          )}

          {step.key === "review" && (
            <div className="review-grid">
              <ReviewBlock title="Empresa" action={() => goToStep(0)}><p><strong>{draft.company.tradeName || draft.company.legalName}</strong><br />{draft.company.legalName}<br />CNPJ {draft.company.cnpj}<br />{draft.company.buyerName} · {draft.company.email}<br />{draft.company.phone}</p></ReviewBlock>
              <ReviewBlock title="Entrega" action={() => goToStep(1)}><p><strong>{draft.delivery.street}, {draft.delivery.number}</strong>{draft.delivery.complement && ` · ${draft.delivery.complement}`}<br />{draft.delivery.neighborhood} · {draft.delivery.city}/{draft.delivery.state}<br />CEP {draft.delivery.postalCode}<br />Contato: {draft.delivery.contactName}</p></ReviewBlock>
              <ReviewBlock title="Condição comercial" action={() => goToStep(2)}><p><strong>{termOptions.find(({ value }) => value === draft.paymentTerm)?.title}</strong><br />Preferência sujeita à análise e confirmação da Paki Toys.</p></ReviewBlock>
              <div className="review-notice"><strong>Este é um ambiente de demonstração.</strong><p>Ao enviar, nenhum pedido real, cobrança ou reserva de estoque será criado.</p></div>
            </div>
          )}

          {submitError && <div className="submit-error" role="alert"><strong>Não foi possível salvar o pedido.</strong><span>{submitError}</span></div>}

          <div className="checkout-actions">
            <button className="button button--ghost" type="button" disabled={submitting} onClick={() => stepIndex === 0 ? onCancel() : goToStep(stepIndex - 1)}>{stepIndex === 0 ? "Voltar à loja" : "Voltar"}</button>
            <button className="button button--red" type="submit" disabled={submitting}>{step.key === "review" ? (submitting ? "Enviando pedido…" : "Enviar pedido para análise") : "Continuar"}</button>
          </div>
        </form>

        <aside className="checkout-summary"><OrderSummary cartLines={lines} totals={totals} compact /></aside>
      </div>
    </main>
  )
}
