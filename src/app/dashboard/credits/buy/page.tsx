'use client'

import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  CreditCard,
  Zap,
  Calculator,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useWalletUi, type UiWalletAccount } from '@wallet-ui/react'
import {
  useAcademicChainProgram,
  usePurchaseCredits,
} from '@/features/academic/use-purchase-credits'
import { lamportsToSol } from '@/lib/academic-chain-client'

const CREDIT_PACKAGES = [
  { credits: 10, bonus: 0, popular: false },
  { credits: 25, bonus: 2, popular: true },
  { credits: 50, bonus: 5, popular: false },
  { credits: 100, bonus: 15, popular: false },
]

const SOL_PRICE_ESTIMATE = 150 // USD approximation used for display

type PurchaseLayoutProps = {
  selectedPackage: string
  onSelectPackage: (value: string) => void
  customAmount: string
  onCustomAmountChange: (value: string) => void
  paymentMethod: string
  onPaymentMethodChange: (value: string) => void
  baseCredits: number
  bonusCredits: number
  totalCredits: number
  costSol: string | null
  costUsd: string | null
  onPurchase: () => void
  purchaseDisabled: boolean
  isProcessing: boolean
  walletWarning?: string
  balanceInfo: {
    loading: boolean
    balanceText: string
    totalSpentText: string
    emptyState?: string
  }
  configLoading: boolean
  configError?: unknown
  creditPriceInSol: string | null
  creditPriceLamports?: bigint | null
  lastPurchase?: { signature: string; amount: number } | null
  onViewExplorer?: (signature: string) => void
  purchaseError?: Error | null
}

export default function BuyCreditsPage() {
  const { connected, account } = useWalletUi()
  const [selectedPackage, setSelectedPackage] = useState('25')
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('SOL')

  const {
    creditPrice,
    creditPriceInSol,
    isLoading: configLoading,
    error: configError,
  } = useAcademicChainProgram()

  const baseCredits = useMemo(() => {
    if (selectedPackage === 'custom') {
      const parsed = Number.parseInt(customAmount, 10)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    }
    const parsed = Number.parseInt(selectedPackage, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
  }, [selectedPackage, customAmount])

  const selectedPackageInfo = useMemo(
    () => CREDIT_PACKAGES.find((pkg) => pkg.credits === baseCredits),
    [baseCredits]
  )
  const bonusCredits = selectedPackageInfo?.bonus ?? 0
  const totalCredits = baseCredits > 0 ? baseCredits + bonusCredits : 0

  const totalCostLamports =
    creditPrice && baseCredits > 0 ? creditPrice * BigInt(baseCredits) : null
  const costSol =
    totalCostLamports !== null ? lamportsToSol(totalCostLamports) : null
  const costUsd =
    costSol && !Number.isNaN(Number.parseFloat(costSol))
      ? (Number.parseFloat(costSol) * SOL_PRICE_ESTIMATE).toFixed(2)
      : null

  const layoutSharedProps = {
    selectedPackage,
    onSelectPackage: (value: string) => setSelectedPackage(value),
    customAmount,
    onCustomAmountChange: (value: string) => setCustomAmount(value),
    paymentMethod,
    onPaymentMethodChange: (value: string) => setPaymentMethod(value),
    baseCredits,
    bonusCredits,
    totalCredits,
    costSol,
    costUsd,
    configLoading,
    configError,
    creditPriceInSol,
    creditPriceLamports: creditPrice ?? null,
  } satisfies Omit<
    PurchaseLayoutProps,
    | 'onPurchase'
    | 'purchaseDisabled'
    | 'isProcessing'
    | 'walletWarning'
    | 'balanceInfo'
    | 'lastPurchase'
    | 'onViewExplorer'
    | 'purchaseError'
  >

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buy Credits</h1>
        <p className="text-muted-foreground">
          Purchase credits to enroll in courses on Solana
        </p>
      </div>

      {connected && account ? (
        <ConnectedPurchaseSection
          account={account}
          {...layoutSharedProps}
          onResetSelection={() => {
            setSelectedPackage('25')
            setCustomAmount('')
            setPaymentMethod('SOL')
          }}
        />
      ) : (
        <DisconnectedPurchaseSection {...layoutSharedProps} />
      )}
    </div>
  )
}

function ConnectedPurchaseSection(
  props: Omit<
    PurchaseLayoutProps,
    'onPurchase' | 'purchaseDisabled' | 'isProcessing' | 'walletWarning'
  > & {
    account: UiWalletAccount
    onResetSelection: () => void
  }
) {
  const {
    account,
    onResetSelection,
    baseCredits,
    bonusCredits,
    totalCredits,
    costSol,
    costUsd,
    configLoading,
    configError,
    creditPriceInSol,
    creditPriceLamports,
    selectedPackage,
    onSelectPackage,
    customAmount,
    onCustomAmountChange,
    paymentMethod,
    onPaymentMethodChange,
  } = props

  const {
    purchaseCreditsAsync,
    isPurchasing,
    studentProfile,
    profileLoading,
    lastPurchase,
    getExplorerUrl: explorerUrlFactory,
    purchaseError: mutationError,
  } = usePurchaseCredits({ account })

  const totalPurchased = studentProfile?.data.totalCreditsPurchased ?? 0n
  const totalSpent = studentProfile?.data.totalCreditsSpent ?? 0n
  const rawBalance = totalPurchased - totalSpent
  const currentBalance = rawBalance < 0n ? 0n : rawBalance

  const balanceInfo = {
    loading: profileLoading,
    balanceText: `${currentBalance.toString()} Credits`,
    totalSpentText: `Total spent: ${totalSpent.toString()} credits`,
    emptyState:
      !profileLoading && !studentProfile
        ? 'No on-chain activity yet. Your credits will appear after the first purchase.'
        : undefined,
  }

  const purchaseError =
    mutationError instanceof Error ? mutationError : null

  const paymentSupportsSol = paymentMethod === 'SOL'
  const hasValidAmount = baseCredits > 0
  const canPurchase =
    paymentSupportsSol &&
    hasValidAmount &&
    !!costSol &&
    !configError &&
    !configLoading

  let walletWarning: string | undefined
  if (!paymentSupportsSol) {
    walletWarning = 'USDC payments are coming soon. Please select SOL.'
  } else if (!hasValidAmount) {
    walletWarning = 'Enter the number of credits you want to purchase.'
  } else if (!costSol && !configLoading) {
    walletWarning =
      'Unable to calculate cost. Ensure the academic chain program is initialized.'
  }

  const handlePurchase = async () => {
    if (!canPurchase) {
      return
    }

    try {
      const result = await purchaseCreditsAsync(baseCredits)

      toast.success(`Purchased ${result.amount} credits`, {
        description: 'Transaction confirmed on Solana devnet.',
        action: {
          label: 'View on Explorer',
          onClick: () =>
            window.open(
              explorerUrlFactory(result.signature),
              '_blank',
              'noopener,noreferrer'
            ),
        },
        duration: 12000,
      })

      onResetSelection()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error('Purchase failed', { description: message })
    }
  }

  return (
    <PurchaseLayout
      selectedPackage={selectedPackage}
      onSelectPackage={onSelectPackage}
      customAmount={customAmount}
      onCustomAmountChange={onCustomAmountChange}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={onPaymentMethodChange}
      baseCredits={baseCredits}
      bonusCredits={bonusCredits}
      totalCredits={totalCredits}
      costSol={costSol}
      costUsd={costUsd}
      onPurchase={handlePurchase}
      purchaseDisabled={!canPurchase || isPurchasing}
      isProcessing={isPurchasing}
      walletWarning={walletWarning}
      balanceInfo={balanceInfo}
      configLoading={configLoading}
      configError={configError}
      creditPriceInSol={creditPriceInSol}
      creditPriceLamports={creditPriceLamports}
      lastPurchase={
        lastPurchase
          ? { signature: lastPurchase.signature, amount: lastPurchase.amount }
          : null
      }
      onViewExplorer={(signature) =>
        window.open(
          explorerUrlFactory(signature),
          '_blank',
          'noopener,noreferrer'
        )
      }
      purchaseError={purchaseError}
    />
  )
}

function DisconnectedPurchaseSection(
  props: Omit<
    PurchaseLayoutProps,
    | 'onPurchase'
    | 'purchaseDisabled'
    | 'isProcessing'
    | 'walletWarning'
    | 'balanceInfo'
    | 'lastPurchase'
    | 'onViewExplorer'
    | 'purchaseError'
  >
) {
  const {
    selectedPackage,
    onSelectPackage,
    customAmount,
    onCustomAmountChange,
    paymentMethod,
    onPaymentMethodChange,
    baseCredits,
    bonusCredits,
    totalCredits,
    costSol,
    costUsd,
    configLoading,
    configError,
    creditPriceInSol,
    creditPriceLamports,
  } = props

  const walletWarning =
    'Connect your wallet to purchase credits and view your on-chain balance.'

  const balanceInfo = {
    loading: false,
    balanceText: '—',
    totalSpentText: 'Total spent: —',
    emptyState: 'Connect a wallet to see your current credit balance.',
  }

  const handleGuardedPurchase = () => {
    toast.info('Connect your wallet to complete this purchase.')
  }

  return (
    <PurchaseLayout
      selectedPackage={selectedPackage}
      onSelectPackage={onSelectPackage}
      customAmount={customAmount}
      onCustomAmountChange={onCustomAmountChange}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={onPaymentMethodChange}
      baseCredits={baseCredits}
      bonusCredits={bonusCredits}
      totalCredits={totalCredits}
      costSol={costSol}
      costUsd={costUsd}
      onPurchase={handleGuardedPurchase}
      purchaseDisabled
      isProcessing={false}
      walletWarning={walletWarning}
      balanceInfo={balanceInfo}
      configLoading={configLoading}
      configError={configError}
      creditPriceInSol={creditPriceInSol}
      creditPriceLamports={creditPriceLamports}
    />
  )
}

function PurchaseLayout(props: PurchaseLayoutProps) {
  const {
    selectedPackage,
    onSelectPackage,
    customAmount,
    onCustomAmountChange,
    paymentMethod,
    onPaymentMethodChange,
    baseCredits,
    bonusCredits,
    totalCredits,
    costSol,
    costUsd,
    onPurchase,
    purchaseDisabled,
    isProcessing,
    walletWarning,
    balanceInfo,
    configLoading,
    configError,
    creditPriceInSol,
    creditPriceLamports,
    lastPurchase,
    onViewExplorer,
    purchaseError,
  } = props

  const formattedCostSol = formatSol(costSol)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceInfo.loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : (
              <div>
                <div className="text-3xl font-bold">
                  {balanceInfo.balanceText}
                </div>
                <p className="text-sm text-muted-foreground">
                  {balanceInfo.totalSpentText}
                </p>
                {balanceInfo.emptyState ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {balanceInfo.emptyState}
                  </p>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Package</CardTitle>
            <CardDescription>
              Choose a credit package or enter a custom amount
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {CREDIT_PACKAGES.map((pkg) => (
                <button
                  key={pkg.credits}
                  onClick={() => onSelectPackage(pkg.credits.toString())}
                  className={`relative flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent transition-colors ${
                    selectedPackage === pkg.credits.toString()
                      ? 'border-primary bg-accent'
                      : 'border-muted'
                  }`}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-2">Popular</Badge>
                  )}
                  <div className="text-2xl font-bold">{pkg.credits}</div>
                  <div className="text-sm text-muted-foreground">Credits</div>
                  {pkg.bonus > 0 && (
                    <Badge variant="secondary" className="mt-2">
                      +{pkg.bonus} Bonus
                    </Badge>
                  )}
                  <div className="text-sm font-medium mt-2">
                    {creditPriceLamports !== null &&
                    creditPriceLamports !== undefined
                      ? `${formatSol(
                          lamportsToSol(
                            creditPriceLamports * BigInt(pkg.credits)
                          )
                        ) ?? '--'} SOL`
                      : configLoading
                      ? 'Loading...'
                      : '--'}
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom"
                  value="custom"
                  checked={selectedPackage === 'custom'}
                  onChange={() => onSelectPackage('custom')}
                  className="h-4 w-4"
                />
                <Label htmlFor="custom">Custom Amount</Label>
              </div>
              {selectedPackage === 'custom' && (
                <Input
                  type="number"
                  placeholder="Enter credits amount"
                  value={customAmount}
                  onChange={(event) => onCustomAmountChange(event.target.value)}
                  min="1"
                  max="1000"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="sol"
                value="SOL"
                checked={paymentMethod === 'SOL'}
                onChange={() => onPaymentMethodChange('SOL')}
                className="h-4 w-4"
              />
              <Label htmlFor="sol" className="flex items-center gap-2">
                <div className="w-6 h-6 bg-linear-to-r from-purple-400 to-pink-400 rounded-full" />
                Solana (SOL)
              </Label>
            </div>
            <div className="flex items-center space-x-2 opacity-60">
              <input
                type="radio"
                id="usdc"
                value="USDC"
                checked={paymentMethod === 'USDC'}
                onChange={() => onPaymentMethodChange('USDC')}
                className="h-4 w-4"
                disabled
              />
              <Label htmlFor="usdc" className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full" />
                USD Coin (USDC)
                <span className="text-xs text-muted-foreground">(coming soon)</span>
              </Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Credits</span>
                <span>{baseCredits}</span>
              </div>
              {bonusCredits > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Bonus Credits</span>
                  <span>+{bonusCredits}</span>
                </div>
              )}
              <div className="border-t my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Credits</span>
                <span>{totalCredits}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total Cost</span>
                <span>
                  {formattedCostSol
                    ? `${formattedCostSol} SOL`
                    : configLoading
                    ? 'Calculating...'
                    : '--'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {costUsd
                  ? `≈ $${costUsd} USD`
                  : 'Select a package or enter a custom amount.'}
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={onPurchase}
              disabled={purchaseDisabled}
            >
              {isProcessing ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Credits
                </>
              )}
            </Button>

            {walletWarning ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{walletWarning}</span>
                </div>
              </div>
            ) : null}

            {purchaseError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{purchaseError.message}</span>
                </div>
              </div>
            ) : null}

            {configError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>
                    Program configuration unavailable. Ensure the academic chain
                    program is initialized before purchasing credits.
                  </span>
                </div>
                <details className="mt-2 text-[11px] leading-relaxed text-destructive/90">
                  <summary className="cursor-pointer underline underline-offset-2">
                    Technical details
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap break-words">
                    {String(configError)}
                  </pre>
                </details>
              </div>
            ) : null}

            {lastPurchase && onViewExplorer ? (
              <div className="rounded-md border border-muted p-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last purchase</span>
                  <span className="font-medium">
                    {lastPurchase.amount} credits
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => onViewExplorer(lastPurchase.signature)}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                  View transaction
                </Button>
              </div>
            ) : null}

            <div className="text-xs text-muted-foreground text-center">
              Secure payment via Solana blockchain. Transaction fees are typically
              less than $0.01.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">About Credits</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>• Credits are minted to your wallet as Token-2022 assets.</p>
            <p>• Use credits to enroll in courses and unlock new modules.</p>
            <p>• Bonus credits apply automatically to eligible packages.</p>
            <p>• View transactions on Solana Explorer for full transparency.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatSol(value: string | null, fractionDigits = 3) {
  if (!value) return null
  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) return null
  return parsed.toFixed(fractionDigits)
}
