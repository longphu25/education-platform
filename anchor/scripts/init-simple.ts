/**
 * Initialize Academic Chain Program - Simple Version
 * Run: cd anchor && npx tsx scripts/init-simple.ts
 */

import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { AcademicChain } from "../target/types/academic_chain"
import { 
  Connection,
  Keypair, 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import {
  TOKEN_PROGRAM_ID,
  createMint,
} from "@solana/spl-token"
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DEVNET_RPC_URL = 'https://api.devnet.solana.com'

async function loadKeypair(keypairPath: string): Promise<Keypair> {
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'))
  return Keypair.fromSecretKey(Uint8Array.from(keypairData))
}

async function main() {
  console.log('🚀 Initializing Academic Chain Program\n')

  // Load authority
  const keypairPath = path.join(process.env.HOME || '~', '.config/solana/id.json')
  const authority = await loadKeypair(keypairPath)
  console.log('Authority:', authority.publicKey.toBase58())

  // Create/load treasury
  const treasuryPath = path.join(__dirname, 'treasury.json')
  let treasury: Keypair
  if (fs.existsSync(treasuryPath)) {
    treasury = await loadKeypair(treasuryPath)
  } else {
    treasury = Keypair.generate()
    fs.writeFileSync(treasuryPath, JSON.stringify(Array.from(treasury.secretKey)))
  }
  console.log('Treasury:', treasury.publicKey.toBase58())

  // Setup
  const connection = new Connection(DEVNET_RPC_URL, 'confirmed')
  const wallet = new anchor.Wallet(authority)
  const provider = new anchor.AnchorProvider(connection, wallet, { commitment: 'confirmed' })
  anchor.setProvider(provider)

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>
  console.log('Program ID:', program.programId.toBase58())

  // Find config PDA
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    program.programId
  )
  console.log('Config PDA:', configPda.toBase58())
  console.log('')

  // Check if already initialized
  try {
    const config = await program.account.programConfig.fetch(configPda)
    console.log('✅ Already initialized!')
    console.log('Credit Mint:', config.creditMint.toBase58())
    return
  } catch {
    console.log('Proceeding with initialization...\n')
  }

  // Create credit mint (authority will be config PDA)
  console.log('Creating credit mint...')
  const creditMint = await createMint(
    connection,
    authority,
    configPda, // mint authority
    null, // no freeze authority
    0, // 0 decimals
    undefined,
    undefined,
    TOKEN_PROGRAM_ID
  )
  console.log('Credit Mint:', creditMint.toBase58())
  console.log('')

  // Initialize program
  console.log('Initializing program...')
  const tx = await program.methods
    .initialize()
    .accounts({
      authority: authority.publicKey,
      config: configPda,
      treasury: treasury.publicKey,
      creditMint: creditMint,
      systemProgram: SystemProgram.programId,
    })
    .signers([authority])
    .rpc()

  console.log('\n✅ Success!')
  console.log('Transaction:', `https://explorer.solana.com/tx/${tx}?cluster=devnet`)

  // Verify
  const config = await program.account.programConfig.fetch(configPda)
  console.log('\nConfiguration:')
  console.log('  Credit Price:', (config.creditPrice.toNumber() / LAMPORTS_PER_SOL).toFixed(4), 'SOL')
  console.log('  Treasury:', config.treasury.toBase58())
  console.log('  Credit Mint:', config.creditMint.toBase58())
}

main().catch(console.error)
