import { PrivyConfigDiagnostic } from '@/components/privy-config-diagnostic'

export default function PrivyDiagnosticPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Privy Configuration Diagnostic</h1>
        <p className="text-muted-foreground mt-2">
          Diagnose and fix the 403 Forbidden error from Privy authentication
        </p>
      </div>
      
      <PrivyConfigDiagnostic />
    </div>
  )
}