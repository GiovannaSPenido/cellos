import Image from 'next/image'

/** Natural proportions of logo-cellos.png (725 × 344). */
const RATIO = 725 / 344

export default function Logo({
  height = 30,
  className = '',
}: {
  height?: number
  className?: string
}) {
  return (
    <Image
      src="/logo-cellos.png"
      alt="Cellos — Comércio e Serviços em Planos de Saúde"
      height={height}
      width={Math.round(height * RATIO)}
      priority
      className={className}
    />
  )
}
