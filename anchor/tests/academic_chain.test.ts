import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";
import { 
  PublicKey, 
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { 
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";
import { beforeAll, describe, it } from "vitest";
import { createTestEnvironment, TestEnvironment } from "./setup";
import { findPda, getTokenBalance } from "./utils/helpers";
import { CREDIT_PRICE } from "./utils/fixtures";

describe("AcademicChain", () => {
  let env: TestEnvironment;
  
  beforeAll(async () => {
    env = await createTestEnvironment();
  });

  describe("Program Initialization", () => {
    it("Initializes the program configuration", async () => {
      const tx = await env.program.methods
        .initialize()
        .accounts({
          authority: env.authority.publicKey,
          config: env.configPda,
          treasury: env.treasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.authority])
        .rpc();
      
      console.log("Initialize transaction signature:", tx);
      
      // Verify config account
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      expect(config.authority.toString()).to.equal(env.authority.publicKey.toString());
      expect(config.treasury.toString()).to.equal(env.treasury.publicKey.toString());
      expect(config.creditPrice.toNumber()).to.equal(CREDIT_PRICE);
      
      console.log("✅ Program initialized successfully");
    });
    
    it("Fails to initialize twice", async () => {
      try {
        await env.program.methods
          .initialize()
          .accounts({
            authority: env.authority.publicKey,
            config: env.configPda,
            treasury: env.treasury.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([env.authority])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("Credit Mint", () => {
    it("Creates credit token mint", async () => {
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      expect(config.creditMint).to.not.be.null;
      
      console.log("✅ Credit mint created:", config.creditMint.toString());
    });
  });
});
