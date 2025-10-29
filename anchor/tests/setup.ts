import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";
import { 
  Keypair, 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { 
  TOKEN_2022_PROGRAM_ID,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

export class TestEnvironment {
  provider: anchor.AnchorProvider;
  program: Program<AcademicChain>;
  connection: anchor.web3.Connection;
  
  // Test accounts
  authority: Keypair;
  treasury: Keypair;
  student1: Keypair;
  student2: Keypair;
  instructor: Keypair;
  
  // Program accounts
  creditMint: PublicKey;
  configPda: PublicKey;
  configBump: number;
  
  constructor() {
    this.provider = anchor.AnchorProvider.env();
    anchor.setProvider(this.provider);
    
    this.program = anchor.workspace.AcademicChain as Program<AcademicChain>;
    this.connection = this.provider.connection;
    
    // Initialize keypairs
    this.authority = Keypair.generate();
    this.treasury = Keypair.generate();
    this.student1 = Keypair.generate();
    this.student2 = Keypair.generate();
    this.instructor = Keypair.generate();
  }
  
  async setup() {
    // Airdrop SOL to test accounts
    await this.airdrop(this.authority.publicKey, 10);
    await this.airdrop(this.treasury.publicKey, 5);
    await this.airdrop(this.student1.publicKey, 5);
    await this.airdrop(this.student2.publicKey, 5);
    await this.airdrop(this.instructor.publicKey, 5);
    
    // Find PDA for config
    [this.configPda, this.configBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      this.program.programId
    );
    
    console.log("✅ Test environment setup complete");
  }
  
  async airdrop(publicKey: PublicKey, amount: number) {
    const signature = await this.connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    await this.connection.confirmTransaction(signature, "confirmed");
  }
  
  async getBalance(publicKey: PublicKey): Promise<number> {
    return await this.connection.getBalance(publicKey);
  }
}

export const createTestEnvironment = async (): Promise<TestEnvironment> => {
  const env = new TestEnvironment();
  await env.setup();
  return env;
};
