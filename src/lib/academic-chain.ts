/**
 * Academic Chain Program Utilities
 * Helper functions for interacting with the Academic Chain Solana program
 */

import { AnchorProvider, Program, web3 } from '@coral-xyz/anchor';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';
import IDL from '../../anchor/target/idl/academic_chain.json';
import type { AcademicChain } from '../../anchor/target/types/academic_chain';

// Define a wallet interface compatible with Anchor
export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

// Program ID from deployed program
export const ACADEMIC_CHAIN_PROGRAM_ID = new PublicKey(
  '9HuNte7WjS8GVHBKpE42y1QXq4C7e6uNvtjmDRM1G99F'
);

// RPC endpoint - use env variable with fallback
export const RPC_ENDPOINT = 
  process.env.NEXT_PUBLIC_RPC_URL || 
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  'https://api.devnet.solana.com';

/**
 * Get connection to Solana
 */
export function getConnection(): Connection {
  return new Connection(RPC_ENDPOINT, 'confirmed');
}

/**
 * Get Anchor program instance
 */
export function getProgram(wallet: AnchorWallet): Program<AcademicChain> {
  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  
  return new Program(IDL as AcademicChain, provider);
}

/**
 * PDA Helper Functions
 */

// Get config PDA
export function getConfigPda(programId: PublicKey = ACADEMIC_CHAIN_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );
}

// Get course PDA
export function getCoursePda(
  courseId: string,
  programId: PublicKey = ACADEMIC_CHAIN_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('course'), Buffer.from(courseId)],
    programId
  );
}

// Get enrollment PDA
export function getEnrollmentPda(
  studentPubkey: PublicKey,
  courseId: string,
  programId: PublicKey = ACADEMIC_CHAIN_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('enrollment'),
      studentPubkey.toBuffer(),
      Buffer.from(courseId)
    ],
    programId
  );
}

// Get student profile PDA
export function getStudentProfilePda(
  studentPubkey: PublicKey,
  programId: PublicKey = ACADEMIC_CHAIN_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('student_profile'), studentPubkey.toBuffer()],
    programId
  );
}

// Get certificate mint PDA
export function getCertificateMintPda(
  studentPubkey: PublicKey,
  courseId: string,
  programId: PublicKey = ACADEMIC_CHAIN_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('certificate_mint'),
      studentPubkey.toBuffer(),
      Buffer.from(courseId)
    ],
    programId
  );
}

// Get graduation mint PDA
export function getGraduationMintPda(
  studentPubkey: PublicKey,
  programId: PublicKey = ACADEMIC_CHAIN_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('graduation_mint'), studentPubkey.toBuffer()],
    programId
  );
}

/**
 * Account fetching helpers
 */

// Fetch config account
export async function fetchConfig(program: Program<AcademicChain>) {
  const [configPda] = getConfigPda(program.programId);
  
  console.log('🔍 Fetching program config from PDA:', configPda.toString());
  
  try {
    const config = await program.account.programConfig.fetch(configPda);
    
    console.log('✅ Program config fetched:', {
      creditMint: config.creditMint.toString(),
      treasury: config.treasury.toString(),
      authority: config.authority.toString(),
    });
    
    return config;
  } catch (error) {
    console.error('❌ Failed to fetch program config:', error);
    throw error;
  }
}

// Fetch course account
export async function fetchCourse(program: Program<AcademicChain>, courseId: string) {
  const [coursePda] = getCoursePda(courseId, program.programId);
  try {
    return await program.account.course.fetch(coursePda);
  } catch {
    // Course doesn't exist
    return null;
  }
}

// Fetch enrollment account
export async function fetchEnrollment(
  program: Program<AcademicChain>,
  studentPubkey: PublicKey,
  courseId: string
) {
  const [enrollmentPda] = getEnrollmentPda(studentPubkey, courseId, program.programId);
  try {
    return await program.account.courseEnrollment.fetch(enrollmentPda);
  } catch {
    // Enrollment doesn't exist
    return null;
  }
}

// Fetch student profile
export async function fetchStudentProfile(
  program: Program<AcademicChain>,
  studentPubkey: PublicKey
) {
  const [studentProfilePda] = getStudentProfilePda(studentPubkey, program.programId);
  try {
    return await program.account.studentProfile.fetch(studentProfilePda);
  } catch {
    // Profile doesn't exist
    return null;
  }
}

/**
 * Token account helpers
 */

// Get student credit token account
export function getStudentCreditAccount(
  creditMint: PublicKey,
  studentPubkey: PublicKey
): PublicKey {
  return getAssociatedTokenAddressSync(
    creditMint,
    studentPubkey,
    false,
    TOKEN_2022_PROGRAM_ID
  );
}

// Get student certificate token account
export function getStudentCertificateAccount(
  certificateMint: PublicKey,
  studentPubkey: PublicKey
): PublicKey {
  return getAssociatedTokenAddressSync(
    certificateMint,
    studentPubkey,
    false,
    TOKEN_2022_PROGRAM_ID
  );
}

/**
 * Balance checking
 */

// Get credit balance
export async function getCreditBalance(
  connection: Connection,
  creditMint: PublicKey,
  studentPubkey: PublicKey
): Promise<number> {
  try {
    const tokenAccount = getStudentCreditAccount(creditMint, studentPubkey);
    
    console.log('🔍 Fetching credit balance for:', {
      studentPubkey: studentPubkey.toString(),
      tokenAccount: tokenAccount.toString(),
      creditMint: creditMint.toString(),
    });
    
    // Check if account exists first
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.log('⚠️ Token account does not exist yet. Balance: 0');
      return 0;
    }
    
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    const amount = Number(balance.value.amount);
    
    console.log('✅ Credit balance fetched:', amount);
    
    return amount;
  } catch (error) {
    console.error('❌ Failed to get credit balance:', error);
    return 0;
  }
}

/**
 * Error handling helpers
 */

export function parseAnchorError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);
    
    // Extract anchor error code if present
    const anchorErrorMatch = message.match(/custom program error: (0x[0-9a-f]+)/i);
    if (anchorErrorMatch) {
      const errorCode = parseInt(anchorErrorMatch[1], 16);
      return getAcademicChainErrorMessage(errorCode);
    }
    
    // Check for specific error messages
    if (message.includes('Insufficient credits')) {
      return 'Insufficient credits to register for this course.';
    }
    if (message.includes('already in use')) {
      return 'You are already enrolled in this course.';
    }
    if (message.includes('Course not active')) {
      return 'This course is not currently active.';
    }
    if (message.includes('User rejected')) {
      return 'Transaction was rejected by user.';
    }
    
    return message;
  }
  
  return 'An unknown error occurred.';
}

// Map error codes to messages
function getAcademicChainErrorMessage(code: number): string {
  const errorMessages: Record<number, string> = {
    0x1770: 'Insufficient credits to register for this course',
    0x1771: 'Course is not active',
    0x1772: 'Student already enrolled in this course',
    0x1773: 'Course not completed yet',
    0x1774: 'Invalid grade value (must be 0-100)',
    0x1775: 'Unauthorized: Only instructor can perform this action',
    0x1776: 'Certificate already minted for this course',
    0x1777: 'Requirements not met for graduation',
    0x1778: 'Invalid course ID',
    0x1779: 'Arithmetic overflow occurred',
  };
  
  return errorMessages[code] || `Program error: 0x${code.toString(16)}`;
}

/**
 * Transaction helpers
 */

// Wait for transaction confirmation with timeout
export async function confirmTransaction(
  connection: Connection,
  signature: string,
  commitment: web3.Commitment = 'confirmed',
  timeoutMs: number = 30000
): Promise<void> {
  const start = Date.now();
  
  while (Date.now() - start < timeoutMs) {
    const status = await connection.getSignatureStatus(signature);
    
    if (status.value?.confirmationStatus === commitment) {
      if (status.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
      }
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Transaction confirmation timeout');
}

/**
 * Utility functions
 */

// Format SOL amount
export function formatSOL(lamports: number): string {
  return (lamports / web3.LAMPORTS_PER_SOL).toFixed(4);
}

// Format credits (assuming 0 decimals)
export function formatCredits(amount: number | bigint): string {
  return amount.toString();
}

// Shorten address for display
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
