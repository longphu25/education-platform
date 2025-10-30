/**
 * Initialize Academic Chain Program on Devnet
 * Run: npx tsx scripts/initialize-program.ts
 */

import { 
  Connection,
  Keypair, 
  PublicKey, 
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  createMint,
} from "@solana/spl-token"
import {
  address,
  createSolanaRpc,
  getAddressEncoder,
} from 'gill'
import {
  getInitializeInstructionAsync,
  fetchMaybeProgramConfig,
  ACADEMIC_CHAIN_PROGRAM_ADDRESS,
} from '../src/client/js/academic-chain/index.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEVNET_RPC_URL = 'https://api.devnet.solana.com'
const CREDIT_PRICE = 10_000_000 // 0.01 SOL per credit

async function loadKeypair(keypairPath: string): Promise<Keypair> {
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'))
  return Keypair.fromSecretKey(Uint8Array.from(keypairData))
}

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

async function initializeProgram() {
  console.log('🚀 Academic Chain Program Initialization\n')
  console.log('═'.repeat(60))
  console.log('')

  // Load authority keypair (default Solana CLI keypair)
  const keypairPath = path.join(process.env.HOME || '~', '.config/solana/id.json')
  
  if (!fs.existsSync(keypairPath)) {
    console.error('❌ Keypair not found at:', keypairPath)
    console.log('\nPlease ensure you have a Solana CLI keypair set up.')
    console.log('Run: solana-keygen new')
    process.exit(1)
  }

  const authority = await loadKeypair(keypairPath)
  console.log('👤 Authority:', authority.publicKey.toBase58())

  // Create treasury keypair or load existing
  const treasuryPath = path.join(__dirname, 'treasury.json')
  let treasury: Keypair
  
  if (fs.existsSync(treasuryPath)) {
    console.log('💰 Loading existing treasury...')
    treasury = await loadKeypair(treasuryPath)
  } else {
    console.log('💰 Creating new treasury...')
    treasury = Keypair.generate()
    fs.writeFileSync(treasuryPath, JSON.stringify(Array.from(treasury.secretKey)))
  }
  console.log('💰 Treasury:', treasury.publicKey.toBase58())
  console.log('')

  // Setup connection
  const connection = new Connection(DEVNET_RPC_URL, 'confirmed')
  const rpc = createSolanaRpc(DEVNET_RPC_URL)

  const programId = address(ACADEMIC_CHAIN_PROGRAM_ADDRESS)
  console.log('📦 Program ID:', ACADEMIC_CHAIN_PROGRAM_ADDRESS)
  console.log('🌐 Network: Devnet')
  console.log('🔗 RPC:', DEVNET_RPC_URL)
  console.log('')

  // Check authority balance
  const authorityBalance = await connection.getBalance(authority.publicKey)
  console.log('💵 Authority Balance:', (authorityBalance / LAMPORTS_PER_SOL).toFixed(4), 'SOL')
  
  if (authorityBalance < 0.1 * LAMPORTS_PER_SOL) {
    console.log('')
    console.log('⚠️  Low balance! You may need more SOL for transaction fees.')
    console.log('   Request airdrop: solana airdrop 1 --url devnet')
    console.log('')
  }

  // Find config PDA
  const [configPda] = await getProgramDerivedAddress({
    programAddress: programId,
    seeds: [new TextEncoder().encode('config')],
  })
  
  console.log('📍 Config PDA:', configPda)
  console.log('')

  // Check if already initialized
  try {
    const existingConfig = await fetchMaybeProgramConfig(rpc, configPda)
    
    if (existingConfig.exists) {
      console.log('⚠️  Program is already initialized!')
      console.log('')
      console.log('Existing configuration:')
      console.log('  Authority:', existingConfig.data.authority)
      console.log('  Treasury:', existingConfig.data.treasury)
      console.log('  Credit Mint:', existingConfig.data.creditMint)
      console.log('  Credit Price:', existingConfig.data.creditPrice.toString(), 'lamports')
      console.log('  Credit Price:', (Number(existingConfig.data.creditPrice) / LAMPORTS_PER_SOL).toFixed(4), 'SOL')
      console.log('')
      console.log('✅ No action needed. Program is ready to use!')
      return
    }
  } catch {
    // Config doesn't exist, proceed with initialization
  }
  
  console.log('📋 Config account does not exist. Proceeding with initialization...')
  console.log('')

  // Step 1: Create credit token mint
  console.log('🪙 Creating credit token mint...')
  let creditMint: PublicKey
  
  try {
    creditMint = await createMint(
      connection,
      authority,
      new PublicKey(configPda), // Mint authority is the config PDA
      null, // No freeze authority
      0, // 0 decimals for whole number credits
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    )
    
    console.log('✅ Credit mint created:', creditMint.toBase58())
    console.log('')
  } catch (error) {
    console.error('❌ Failed to create credit mint:', error)
    throw error
  }

  // Step 2: Create the signer wrapper for Gill
  const authoritySigner = {
    address: authority.publicKey.toBase58() as ReturnType<typeof address>,
    signTransactions: async (transactions: any[]) => {
      return transactions.map(tx => {
        tx.sign([authority])
        return tx
      })
    }
  }

  // Step 3: Initialize the program
  try {
    console.log('🔧 Initializing program configuration...')
    console.log('   Credit Price:', CREDIT_PRICE, 'lamports (', (CREDIT_PRICE / LAMPORTS_PER_SOL).toFixed(4), 'SOL )')
    console.log('')

    const instruction = await getInitializeInstructionAsync({
      authority: authoritySigner as any,
      treasury: address(treasury.publicKey.toBase58()),
      creditMint: address(creditMint.toBase58()),
    })

    console.log('✅ Instruction created')
    console.log('📤 Sending transaction...')

    // Create and send transaction using web3.js
    const transaction = new Transaction().add({
      keys: instruction.accounts.map(acc => ({
        pubkey: new PublicKey(acc.address),
        isSigner: 'role' in acc && (acc.role === 1 || acc.role === 3),
        isWritable: 'role' in acc && (acc.role === 2 || acc.role === 3),
      })),
      programId: new PublicKey(instruction.programAddress),
      data: Buffer.from(instruction.data),
    })

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [authority],
      { commitment: 'confirmed' }
    )

    console.log('✅ Initialization successful!')
    console.log('')
    console.log('Transaction Details:')
    console.log('  Signature:', signature)
    console.log('  Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`)
    console.log('')

    // Fetch and display the configuration
    const config = await fetchMaybeProgramConfig(rpc, configPda)
    
    if (config.exists) {
      console.log('Program Configuration:')
      console.log('  Authority:', config.data.authority)
      console.log('  Treasury:', config.data.treasury)
      console.log('  Credit Mint:', config.data.creditMint)
      console.log('  Credit Price:', config.data.creditPrice.toString(), 'lamports')
      console.log('  Credit Price:', (Number(config.data.creditPrice) / LAMPORTS_PER_SOL).toFixed(4), 'SOL')
      console.log('  Bump:', config.data.bump)
    }
    
    console.log('')
    console.log('🎉 Program is now ready for use!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Start your web app: npm run dev')
    console.log('  2. Connect your wallet')
    console.log('  3. Purchase credits!')

  } catch (error: unknown) {
    console.error('❌ Initialization failed!')
    console.log('')
    
    const err = error as Error
    if (err.message?.includes('insufficient funds')) {
      console.log('Error: Insufficient funds')
      console.log('Solution: Request SOL from devnet faucet')
      console.log('  solana airdrop 2 --url devnet')
    } else if (err.message?.includes('already in use')) {
      console.log('Error: Account already exists')
      console.log('The program may already be initialized.')
      console.log('Run: npx tsx scripts/check-program-init.ts')
    } else {
      console.log('Error:', err.message || String(error))
      
      if ('logs' in err && Array.isArray((err as any).logs)) {
        console.log('\nProgram logs:')
        ;(err as any).logs.forEach((log: string) => console.log('  ', log))
      }
    }
    
    console.log('')
    process.exit(1)
  }

  console.log('═'.repeat(60))
}

// Run initialization
initializeProgram().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
