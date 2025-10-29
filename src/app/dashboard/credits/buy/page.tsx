'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Wallet, CreditCard, Zap, Calculator } from 'lucide-react';
import { mockStudent } from '@/lib/mockData';

const CREDIT_PACKAGES = [
  { credits: 10, bonus: 0, popular: false },
  { credits: 25, bonus: 2, popular: true },
  { credits: 50, bonus: 5, popular: false },
  { credits: 100, bonus: 15, popular: false },
];

const CREDIT_PRICE = 0.005; // SOL per credit

export default function BuyCreditsPage() {
  const [selectedPackage, setSelectedPackage] = useState('25');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('SOL');
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateTotal = () => {
    const credits = selectedPackage === 'custom' 
      ? parseInt(customAmount) || 0 
      : parseInt(selectedPackage);
    
    const package_info = CREDIT_PACKAGES.find(p => p.credits === credits);
    const bonus = package_info?.bonus || 0;
    const totalCredits = credits + bonus;
    const cost = credits * CREDIT_PRICE;
    
    return { credits, bonus, totalCredits, cost };
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    
    // Show success message (you'd implement proper transaction handling)
    alert('Credits purchased successfully! (This is a mock transaction)');
  };

  const { credits, bonus, totalCredits, cost } = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buy Credits</h1>
        <p className="text-muted-foreground">
          Purchase credits to enroll in courses
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Purchase Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockStudent.creditBalance} Credits</div>
              <p className="text-sm text-muted-foreground">
                Total spent: {mockStudent.totalCreditsSpent} credits
              </p>
            </CardContent>
          </Card>

          {/* Package Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Package</CardTitle>
              <CardDescription>Choose a credit package or enter custom amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {CREDIT_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.credits}
                    onClick={() => setSelectedPackage(pkg.credits.toString())}
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
                      {(pkg.credits * CREDIT_PRICE).toFixed(3)} SOL
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="custom"
                    value="custom"
                    checked={selectedPackage === 'custom'}
                    onChange={() => setSelectedPackage('custom')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="custom">Custom Amount</Label>
                </div>
                {selectedPackage === 'custom' && (
                  <Input
                    type="number"
                    placeholder="Enter credits amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    min="1"
                    max="1000"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
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
                  onChange={() => setPaymentMethod('SOL')}
                  className="w-4 h-4"
                />
                <Label htmlFor="sol" className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-linear-to-r from-purple-400 to-pink-400 rounded-full"></div>
                  Solana (SOL)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="usdc"
                  value="USDC"
                  checked={paymentMethod === 'USDC'}
                  onChange={() => setPaymentMethod('USDC')}
                  className="w-4 h-4"
                />
                <Label htmlFor="usdc" className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                  USD Coin (USDC)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
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
                  <span>{credits}</span>
                </div>
                {bonus > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bonus Credits</span>
                    <span>+{bonus}</span>
                  </div>
                )}
                <div className="border-t my-2"></div>
                <div className="flex justify-between font-medium">
                  <span>Total Credits</span>
                  <span>{totalCredits}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost</span>
                  <span>{cost.toFixed(3)} {paymentMethod}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ ${(cost * 150).toFixed(2)} USD
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePurchase}
                disabled={isProcessing || credits === 0}
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

              <div className="text-xs text-muted-foreground text-center">
                Secure payment via Solana blockchain. 
                Transaction fees ≈ $0.001
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">About Credits</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Credits are used to enroll in courses</p>
              <p>• Each course requires different credit amounts</p>
              <p>• Credits are burned upon course enrollment</p>
              <p>• Bulk purchases include bonus credits</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
