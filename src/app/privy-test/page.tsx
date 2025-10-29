import { PrivySolanaConnectionTester } from '@/components/privy-solana-tester'

export default function PrivySolanaTestPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Privy Solana Devnet Connection Test</h1>
        <p className="text-muted-foreground mt-2">
          Test and validate your Privy integration with Solana devnet
        </p>
      </div>
      
      <PrivySolanaConnectionTester />
    </div>
  )
}