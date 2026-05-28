import { RLCProvider } from '@/store/rlc-store'

export default function ACLayout({ children }: { children: React.ReactNode }) {
  return <RLCProvider>{children}</RLCProvider>
}
