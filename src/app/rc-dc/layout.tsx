import type { Metadata } from 'next'
import { RCDCProvider } from '@/store/rc-dc-store'

export const metadata: Metadata = {
  title: 'Resonara — RC en CC',
  description: 'Simulador interactivo de carga de capacitor en circuito RC de corriente continua.',
}

export default function RCDCLayout({ children }: { children: React.ReactNode }) {
  return <RCDCProvider>{children}</RCDCProvider>
}
