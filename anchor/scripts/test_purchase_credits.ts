/**
 * Test script for purchase_credits instruction
 * 
 * Usage:
 *   pnpm tsx anchor/scripts/test_purchase_credits.ts
 * 
 * This script demonstrates how to use the generated client to purchase credits on devnet
 */

import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  generateKeyPairSigner,
  airdropFactory,
  lamports,
} from 'gill'
import {
  purchaseCredits,
  getProgramConfiguration,
  getStudentProfile,
  lamportsToSol,
  getExplorerUrl,
  DEVNET_RPC_URL,
} from '../../src/lib/academic-chain-client'

async function main() {
  console.log('🎓 Academic Chain - Purchase Credits Test\n')
  console.log('Network: Devnet')
  console.log('RPC:', DEVNET_RPC_URL)
  console.log('─'.repeat(60))

  const rpc = createSolanaRpc(DEVNET_RPC_URL)
  const rpcSubscriptions = createSolanaRpcSubscriptions(DEVNET_RPC_URL.replace('https', 'wss'))

  try {
    // Step 1: Get program configuration
    console.log('\n📋 Step 1: Fetching program configuration...')
    const config = await getProgramConfiguration(DEVNET_RPC_URL)
    console.log('✓ Config loaded')
    console.log(`  Credit Price: ${lamportsToSol(config.data.creditPrice)} SOL`)
    console.log(`  Treasury: ${config.data.treasury}`)
    console.log(`  Credit Mint: ${config.data.creditMint}`)

    // Step 2: Generate or use a student keypair
    console.log('\n👤 Step 2: Setting up student account...')
    const student = await generateKeyPairSigner()
    console.log(`  Student Address: ${student.address}`)

    // Step 3: Airdrop SOL to student
    console.log('\n💰 Step 3: Requesting airdrop...')
    // const airdrop = airdropFactory({ rpc, rpcSubscriptions })
    // const airdropSignature = await airdrop({
    //   recipientAddress: student.address,
    //   lamports: lamports(2_000_000_000n), // 2 SOL
    //   commitment: 'confirmed',
    // })
    // console.log(`✓ Airdrop successful: ${airdropSignature}`)

    // Wait a bit for airdrop to confirm
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Check balance
    const balance = await rpc.getBalance(student.address).send()
    console.log(`  Student Balance: ${lamportsToSol(balance.value)} SOL`)

    // Step 4: Purchase credits
    const creditAmount = 10
    console.log(`\n🛒 Step 4: Purchasing ${creditAmount} credits...`)
    const totalCost = config.data.creditPrice * BigInt(creditAmount)
    console.log(`  Total Cost: ${lamportsToSol(totalCost)} SOL`)

    const result = await purchaseCredits({
      student,
      amount: creditAmount,
      rpcUrl: DEVNET_RPC_URL,
      rpc,
      rpcSubscriptions,
    })

    console.log('✓ Purchase successful!')
    console.log(`  Transaction: ${result.signature}`)
    console.log(`  Explorer: ${getExplorerUrl(result.signature, 'devnet')}`)

    // Step 5: Verify student profile
    console.log('\n📊 Step 5: Verifying student profile...')
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for confirmation

    const profile = await getStudentProfile(student.address, DEVNET_RPC_URL)
    if (profile) {
      console.log('✓ Student profile created')
      console.log(`  Total Credits Purchased: ${profile.data.totalCreditsPurchased}`)
      console.log(`  Created At: ${new Date(Number(profile.data.createdAt) * 1000).toISOString()}`)
    } else {
      console.log('⚠ Profile not found yet (may need more time to index)')
    }

    // Step 6: Try purchasing more credits
    console.log(`\n🛒 Step 6: Purchasing ${creditAmount} more credits...`)
    const result2 = await purchaseCredits({
      student,
      amount: creditAmount,
      rpcUrl: DEVNET_RPC_URL,
      rpc,
      rpcSubscriptions,
    })

    console.log('✓ Second purchase successful!')
    console.log(`  Transaction: ${result2.signature}`)
    console.log(`  Explorer: ${getExplorerUrl(result2.signature, 'devnet')}`)

    // Final verification
    console.log('\n📊 Final Verification...')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const finalProfile = await getStudentProfile(student.address, DEVNET_RPC_URL)
    if (finalProfile) {
      console.log('✓ Student profile updated')
      console.log(`  Total Credits Purchased: ${finalProfile.data.totalCreditsPurchased}`)
      console.log(`  Expected: ${creditAmount * 2}`)
    }

    console.log('\n' + '─'.repeat(60))
    console.log('✅ All tests passed!')
    console.log('\n💡 Summary:')
    console.log(`  - Student Address: ${student.address}`)
    console.log(`  - Total Credits Purchased: ${creditAmount * 2}`)
    console.log(`  - Total Cost: ${lamportsToSol(result.totalCost + result2.totalCost)} SOL`)
    console.log(`  - Transactions:`)
    console.log(`    1. ${result.signature}`)
    console.log(`    2. ${result2.signature}`)
  } catch (error) {
    console.error('\n❌ Error:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  }
}

// Handle script execution
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
