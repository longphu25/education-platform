/**
 * Academic Chain Program Client Utilities
 * Helper functions for interacting with the academic_chain program on devnet
 */

import {
  getPurchaseCreditsInstructionAsync,
  fetchProgramConfig,
  fetchStudentProfile,
  ACADEMIC_CHAIN_PROGRAM_ADDRESS,
} from '../../anchor/src/client/js/academic-chain'
import {
  address,
  createSolanaRpc,
  getAddressEncoder,
  createTransaction,
  signAndSendTransactionMessageWithSigners,
  getBase58Decoder,
  type TransactionSigner,
  type Address,
} from 'gill'
import {
  getAssociatedTokenAccountAddress,
  getCreateAssociatedTokenIdempotentInstruction,
} from 'gill/programs/token'

// export const DEVNET_RPC_URL = 'https://api.devnet.solana.com'
export const DEVNET_RPC_URL = 'https://devnet.helius-rpc.com/?api-key=b5f8c1a8-7580-49f7-8197-ed0d48aaa178'
export const DEVNET_WS_URL = 'wss://api.devnet.solana.com'

export interface PurchaseCreditsParams {
  student: TransactionSigner
  amount: number
  rpcUrl?: string
  rpc?: ReturnType<typeof createSolanaRpc> // Optional: pass RPC client directly
}

export interface PurchaseCreditsResult {
  signature: string
  amount: number
  totalCost: bigint
}

/**
 * Purchase credits for a student account
 */
export async function purchaseCredits(
  params: PurchaseCreditsParams
): Promise<PurchaseCreditsResult> {
  const rpcUrl = params.rpcUrl || DEVNET_RPC_URL
  const rpc = params.rpc || createSolanaRpc(rpcUrl)

  try {
    console.log('🚀 Purchase credits initiated:', {
      studentAddress: params.student.address,
      amount: params.amount,
      rpcUrl,
      programId: ACADEMIC_CHAIN_PROGRAM_ADDRESS,
    })
    
    // Validate student signer
    if (!params.student || !params.student.address) {
      throw new Error('Invalid wallet signer. Please reconnect your wallet.')
    }

    // Fetch program config
    console.log('📋 Fetching program configuration...')
    const [configPda] = await getProgramDerivedAddress({
      programAddress: address(ACADEMIC_CHAIN_PROGRAM_ADDRESS),
      seeds: [new TextEncoder().encode('config')],
    })
    
    console.log('📍 Config PDA:', configPda)

    let config
    try {
      config = await fetchProgramConfig(rpc, configPda)
    } catch (configError) {
      console.error('❌ Failed to fetch program config:', configError)
      throw new Error(
        'Program not initialized. The academic chain program needs to be initialized first. ' +
        'Please contact the administrator or check if you are connected to the correct network (devnet/mainnet).'
      )
    }
    console.log('✅ Config fetched:', {
      creditPrice: config.data.creditPrice.toString(),
      creditPriceSOL: lamportsToSol(config.data.creditPrice),
      treasury: config.data.treasury,
      creditMint: config.data.creditMint,
    })

    const mintInfoResponse = await rpc
      .getAccountInfo(config.data.creditMint, { encoding: 'base64' })
      .send()
    const mintOwner = mintInfoResponse.value?.owner
    console.log('🏷️  Mint owner:', mintOwner)
    const tokenProgramAddress =
      (mintOwner as Address | undefined) ??
      ('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address)

    // Calculate total cost
    const totalCost = config.data.creditPrice * BigInt(params.amount)
    console.log('💰 Total cost:', {
      lamports: totalCost.toString(),
      sol: lamportsToSol(totalCost),
    })

    // Check student balance
    console.log('💼 Checking student balance...')
    const balanceResponse = await rpc.getBalance(params.student.address).send()
    const studentBalance = balanceResponse.value
    console.log('Balance check:', {
      balance: studentBalance.toString(),
      balanceSOL: lamportsToSol(studentBalance),
      required: totalCost.toString(),
      requiredSOL: lamportsToSol(totalCost),
      hasEnough: studentBalance >= totalCost,
    })

    if (studentBalance < totalCost) {
      throw new Error(
        `Insufficient balance. You have ${lamportsToSol(studentBalance)} SOL but need ${lamportsToSol(totalCost)} SOL ` +
        `(plus rent and transaction fees ~0.005 SOL)`
      )
    }

    // Check if amount is valid
    if (params.amount <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    // Ensure associated token account exists
    console.log('🏦 Resolving student credit token account...')
    const studentCreditAccount = await getAssociatedTokenAccountAddress(
      config.data.creditMint,
      params.student.address,
      tokenProgramAddress
    )
    console.log('📍 Student credit ATA:', studentCreditAccount)

    const ataAccountInfo = await rpc
      .getAccountInfo(studentCreditAccount, { encoding: 'base64' })
      .send()
    const instructions: Parameters<typeof createTransaction>[0]['instructions'] = []

    if (!ataAccountInfo.value) {
      console.log('🆕 Associated token account not found, adding create instruction')
      instructions.push(
        getCreateAssociatedTokenIdempotentInstruction({
          payer: params.student,
          ata: studentCreditAccount,
          owner: params.student.address,
          mint: config.data.creditMint,
          tokenProgram: tokenProgramAddress,
        })
      )
    } else {
      console.log('✅ Associated token account already exists')
    }

    // Create purchase instruction
    console.log('📝 Creating purchase instruction...')
    const instruction = await getPurchaseCreditsInstructionAsync({
      student: params.student,
      treasury: config.data.treasury,
      creditMint: config.data.creditMint,
      studentCreditAccount,
      tokenProgram: tokenProgramAddress,
      amount: BigInt(params.amount),
    })
    instructions.push(instruction)

    console.log('✅ Instruction created:', {
      programAddress: instruction.programAddress,
      accountsCount: instruction.accounts.length,
      studentAccount: instruction.accounts[0],
    })

    // Verify the student signer
    console.log('🔍 Verifying student signer:', {
      address: params.student.address,
      signerType: 'signTransactions' in params.student ? 'signTransactions' : 'modifyAndSignTransactions',
    })

    // Build and send transaction
    console.log('🔗 Getting latest blockhash...')
    const { value: latestBlockhash } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send()
    console.log('✅ Blockhash retrieved:', {
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    })

    console.log('🏗️  Building transaction...')
    const transaction = createTransaction({
      feePayer: params.student,
      version: 0,
      latestBlockhash,
      instructions,
    })
    console.log('📤 Sending transaction to network...')
    console.log('Transaction details:', {
      feePayer: params.student.address,
      instructionCount: transaction.instructions.length,
      version: transaction.version,
    })

    console.log('✍️ Requesting wallet signature...')
    const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction)
    const signature = getBase58Decoder().decode(signatureBytes)
    console.log('✅ Transaction submitted:', signature)

    return {
      signature,
      amount: params.amount,
      totalCost,
    }
  } catch (error) {
    console.error('❌ Error in purchaseCredits:', error)
    
    // Log full error details for debugging
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2))
      if ('logs' in error) {
        console.error('Transaction logs:', error.logs)
      }
      if ('cause' in error) {
        console.error('Error cause:', error.cause)
      }
    }
    
    // Provide more helpful error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      
      // Simulation errors - provide detailed info
      if (errorMessage.includes('simulation') || errorMessage.includes('simulate')) {
        const errorStr = JSON.stringify(error, null, 2)
        console.error('Full simulation error:', errorStr)
        throw new Error(
          'Transaction simulation failed. This usually means:\n' +
          '1. Insufficient SOL balance for transaction + rent\n' +
          '2. Program account not initialized\n' +
          '3. Invalid program state\n' +
          `Original error: ${error.message}`
        )
      }
      
      // Wallet connection errors
      if (errorMessage.includes('wallet') || errorMessage.includes('signer')) {
        throw new Error('Wallet connection lost. Please reconnect your wallet and try again.')
      }
      
      // Balance errors
      if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
        throw new Error('Insufficient SOL balance. Please add more SOL to your wallet.')
      }
      
      // Transaction errors
      if (errorMessage.includes('blockhash') || errorMessage.includes('expired')) {
        throw new Error('Transaction expired. Please try again.')
      }
      
      // User rejection
      if (errorMessage.includes('user rejected') || errorMessage.includes('rejected')) {
        throw new Error('Transaction was rejected. Please approve the transaction in your wallet.')
      }
      
      // Signature verification errors
      if (errorMessage.includes('signature')) {
        throw new Error('Signature verification failed. Please try again.')
      }
      
      // Network errors
      if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        throw new Error('Network error. Please check your connection and try again.')
      }
      
      // Re-throw the original error if it's already user-friendly
      if (error.message.length < 100 && !errorMessage.includes('0x')) {
        throw error
      }
      
      // Generic error with original message
      throw new Error(`Failed to purchase credits: ${error.message}`)
    }
    
    throw new Error('Failed to purchase credits. Please try again.')
  }
}

/**
 * Get student profile information
 */
export async function getStudentProfile(
  studentAddress: Address,
  rpcUrl?: string
) {
  const rpc = createSolanaRpc(rpcUrl || DEVNET_RPC_URL)

  const [studentProfilePda] = await getProgramDerivedAddress({
    programAddress: address(ACADEMIC_CHAIN_PROGRAM_ADDRESS),
    seeds: [
      new TextEncoder().encode('student_profile'),
      new Uint8Array(getAddressEncoder().encode(studentAddress)),
    ],
  })

  try {
    const profile = await fetchStudentProfile(rpc, studentProfilePda)
    return profile
  } catch {
    // Profile doesn't exist yet
    return null
  }
}

/**
 * Get program configuration
 */
export async function getProgramConfiguration(rpcUrl?: string) {
  const rpc = createSolanaRpc(rpcUrl || DEVNET_RPC_URL)

  const [configPda] = await getProgramDerivedAddress({
    programAddress: address(ACADEMIC_CHAIN_PROGRAM_ADDRESS),
    seeds: [new TextEncoder().encode('config')],
  })

  const config = await fetchProgramConfig(rpc, configPda)
  return config
}

/**
 * Helper to derive program derived addresses
 */
async function getProgramDerivedAddress(params: {
  programAddress: ReturnType<typeof address>
  seeds: Uint8Array[]
}) {
  const { getProgramDerivedAddress: getPda, getBytesEncoder } = await import('gill')

  return getPda({
    programAddress: params.programAddress,
    seeds: params.seeds.map((seed) => getBytesEncoder().encode(seed)),
  })
}

/**
 * Format lamports to SOL
 */
export function lamportsToSol(lamports: bigint | number): string {
  const amount = typeof lamports === 'bigint' ? Number(lamports) : lamports
  return (amount / 1_000_000_000).toFixed(4)
}

/**
 * Format SOL to lamports
 */
export function solToLamports(sol: number): bigint {
  return BigInt(Math.floor(sol * 1_000_000_000))
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(
  signature: string,
  cluster: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'
): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(
  addressStr: string,
  cluster: 'devnet' | 'mainnet-beta' | 'testnet' = 'devnet'
): string {
  return `https://explorer.solana.com/address/${addressStr}?cluster=${cluster}`
}
