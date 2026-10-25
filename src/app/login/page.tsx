import { Suspense } from 'react'
import LoginForm from './LoginForm'
import Logo from '@/components/Logo'

export const metadata = {
  title: 'Área do corretor — Cellos',
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* formulário */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-[8%]">
        <div className="w-full max-w-[380px]">
          <Logo height={36} className="mb-9" />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">
            Área do corretor
          </p>
          <h1 className="mt-3 text-[34px] font-extrabold text-ink">Bem-vinda de volta</h1>
          <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted">
            Acesse o painel de gestão de leads e clientes da Cellos.
          </p>

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>

      {/* painel de marca */}
      <div className="relative hidden flex-col justify-center overflow-hidden bg-deep px-[8%] lg:flex">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-brand/15"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-brand/10"
        />
        <div className="relative max-w-[380px] text-white">
          <h2 className="text-[30px] font-extrabold leading-[1.15]">
            Sua agenda física, agora organizada e sempre com você.
          </h2>
          <p className="mt-4 text-[15.5px] leading-relaxed text-white/70">
            Centralize leads, acompanhe cada etapa da prospecção e nunca perca um retorno —
            sem deixar de lado o atendimento humano.
          </p>
        </div>
      </div>
    </div>
  )
}
