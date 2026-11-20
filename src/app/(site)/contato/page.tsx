import { Suspense } from 'react'
import { MessageCircle, Mail } from 'lucide-react'
import ContactForm from '@/components/site/ContactForm'
import { CONTACT_CHANNELS } from '@/lib/corretora'

export const metadata = {
  title: 'Contato — Cellos',
  description:
    'Fale com um corretor da Cellos por telefone, WhatsApp ou e-mail, ou solicite um contato pelo formulário.',
}

// a corretora não possui telefone fixo, então o site não anuncia nenhum
const CHANNELS = CONTACT_CHANNELS.map((c) => ({
  ...c,
  Icon: c.kind === 'whatsapp' ? MessageCircle : Mail,
}))

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-14">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            Contato
          </p>
          <h1 className="mt-4 max-w-[420px] text-[clamp(30px,5vw,40px)] font-extrabold leading-tight">
            Vamos conversar sobre o seu plano
          </h1>
          <p className="mt-4 max-w-[420px] text-[16.5px] leading-relaxed text-ink-2">
            O relacionamento direto é o coração da Cellos. Escolha o canal que preferir — quem
            responde é gente, não robô.
          </p>

          <ul className="mt-9 flex flex-col gap-3.5">
            {CHANNELS.map(({ Icon, label, value, hint }) => (
              <li
                key={label}
                className="flex items-center gap-4 rounded-lg border border-line bg-surface p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-600">
                  <Icon size={22} aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] text-muted">{label}</span>
                  <span className="block break-all text-[17px] font-bold">{value}</span>
                  <span className="block text-[12.5px] text-muted">{hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </div>
  )
}
