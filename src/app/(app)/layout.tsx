import { AppFrame } from '@/components/shared/AppFrame'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>
}
