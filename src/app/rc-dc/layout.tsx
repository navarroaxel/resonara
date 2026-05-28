import { RCDCProvider } from '@/store/rc-dc-store'

export default function RCDCLayout({ children }: { children: React.ReactNode }) {
  return <RCDCProvider>{children}</RCDCProvider>
}
