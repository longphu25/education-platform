'use client'

import { PurchaseCreditsCard } from '@/features/academic/purchase-credits-card'
import { useStudentStats, useAcademicChainProgram } from '@/features/academic/use-purchase-credits'
import { Card } from '@/components/ui/card'
import { useWalletUi } from '@wallet-ui/react'

export default function AcademicCreditsPage() {
  const { connected, account } = useWalletUi()
  const accountAddress = account?.address
  const { creditPriceInSol, treasury, creditMint } = useAcademicChainProgram()
  const {
    totalCreditsPurchased,
    creditsSpent,
    coursesCompleted,
    graduationNft,
    createdAt,
    hasProfile,
  } = useStudentStats(accountAddress)

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Academic Credits</h1>
        <p className="text-muted-foreground mt-2">
          Purchase credits to register for courses on the blockchain
        </p>
      </div>

      {/* Program Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Program Information</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">Solana Devnet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Program ID:</span>
            <span className="font-mono text-xs">9HuNte7WjS8GVHBKpE42y1QXq4C7e6uNvtjmDRM1G99F</span>
          </div>
          {creditPriceInSol && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credit Price:</span>
              <span className="font-medium">{creditPriceInSol} SOL</span>
            </div>
          )}
          {treasury && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Treasury:</span>
              <span className="font-mono text-xs">
                {String(treasury).slice(0, 8)}...{String(treasury).slice(-8)}
              </span>
            </div>
          )}
          {creditMint && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credit Mint:</span>
              <span className="font-mono text-xs">
                {String(creditMint).slice(0, 8)}...{String(creditMint).slice(-8)}
              </span>
            </div>
          )}
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Purchase Section */}
        <PurchaseCreditsCard />

        {/* Student Stats */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Statistics</h2>
          {!connected ? (
            <p className="text-muted-foreground text-center py-8">
              Connect wallet to view stats
            </p>
          ) : !hasProfile ? (
            <p className="text-muted-foreground text-center py-8">
              No activity yet. Purchase credits to get started!
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="text-2xl font-bold">
                    {totalCreditsPurchased.toString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Credits Purchased
                  </div>
                </div>
                <div className="rounded-lg bg-primary/10 p-4">
                  <div className="text-2xl font-bold">
                    {creditsSpent.toString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Credits Spent
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-xl font-bold">
                    {coursesCompleted.toString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Courses Completed
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="text-xl font-bold">
                    {graduationNft ? '✓' : '—'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Graduation NFT
                  </div>
                </div>
              </div>

              {createdAt && (
                <div className="pt-4 border-t text-sm text-muted-foreground">
                  Member since: {createdAt.toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* How it Works */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              1
            </div>
            <div>
              <h3 className="font-semibold">Purchase Credits</h3>
              <p className="text-sm text-muted-foreground">
                Buy academic credits using SOL. Credits are minted as Token-2022 tokens to your wallet.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              2
            </div>
            <div>
              <h3 className="font-semibold">Register for Courses</h3>
              <p className="text-sm text-muted-foreground">
                Use your credits to register for available courses. Credits are spent upon registration.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              3
            </div>
            <div>
              <h3 className="font-semibold">Complete & Earn Certificates</h3>
              <p className="text-sm text-muted-foreground">
                After completing courses, mint NFT certificates as proof of completion.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              4
            </div>
            <div>
              <h3 className="font-semibold">Claim Graduation NFT</h3>
              <p className="text-sm text-muted-foreground">
                Upon meeting graduation requirements, claim your unique graduation NFT.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Connected Wallet Info */}
      {connected && accountAddress && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Connected Wallet:</span>
            <span className="font-mono text-sm">
              {accountAddress.slice(0, 8)}...{accountAddress.slice(-8)}
            </span>
          </div>
        </Card>
      )}
    </div>
  )
}
