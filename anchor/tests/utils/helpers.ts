import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../../target/types/academic_chain";
import { 
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

export async function findPda(
  seeds: (Buffer | Uint8Array)[],
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync(seeds, programId);
}

export async function getTokenBalance(
  connection: anchor.web3.Connection,
  tokenAccount: PublicKey
): Promise<number> {
  try {
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount);
  } catch (error) {
    return 0;
  }
}

export async function createCourse(
  program: Program<AcademicChain>,
  authority: Keypair,
  courseId: string,
  courseName: string,
  instructor: PublicKey,
  requiredCredits: number
) {
  const [coursePda, courseBump] = await findPda(
    [Buffer.from("course"), Buffer.from(courseId)],
    program.programId
  );
  
  await program.methods
    .createCourse(courseId, courseName, requiredCredits)
    .accounts({
      authority: authority.publicKey,
      course: coursePda,
      instructor: instructor,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([authority])
    .rpc();
  
  return coursePda;
}

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function assertError(error: any, expectedError: string) {
  const errorMessage = error.error?.errorMessage || error.message || "";
  if (!errorMessage.includes(expectedError)) {
    throw new Error(
      `Expected error containing "${expectedError}", got: ${errorMessage}`
    );
  }
}
