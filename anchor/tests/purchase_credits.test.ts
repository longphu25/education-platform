import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { beforeAll, describe, it } from "vitest";
import { createTestEnvironment, TestEnvironment } from "./setup";
import { findPda, getTokenBalance } from "./utils/helpers";
import { CREDIT_PRICE } from "./utils/fixtures";
import { 
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("Purchase Credits", () => {
  let env: TestEnvironment;
  
  beforeAll(async () => {
    env = await createTestEnvironment();
    
    // Initialize program
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
  });

  describe("Successful Purchase", () => {
    it("Student purchases 10 credits", async () => {
      const amount = 10;
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const treasuryBalanceBefore = await env.getBalance(env.treasury.publicKey);
      const studentBalanceBefore = await env.getBalance(env.student1.publicKey);
      
      const tx = await env.program.methods
        .purchaseCredits(new anchor.BN(amount))
        .accounts({
          student: env.student1.publicKey,
          config: env.configPda,
          treasury: env.treasury.publicKey,
          creditMint: config.creditMint,
          studentCreditAccount: studentCreditAccount,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.student1])
        .rpc();
      
      console.log("Purchase credits transaction:", tx);
      
      // Verify token balance
      const creditBalance = await getTokenBalance(env.connection, studentCreditAccount);
      expect(creditBalance).to.equal(amount);
      
      // Verify SOL transferred to treasury
      const treasuryBalanceAfter = await env.getBalance(env.treasury.publicKey);
      const expectedTransfer = amount * CREDIT_PRICE;
      expect(treasuryBalanceAfter - treasuryBalanceBefore).to.be.closeTo(
        expectedTransfer,
        0.001 * LAMPORTS_PER_SOL // Allow for transaction fees
      );
      
      // Verify student profile
      const studentProfile = await env.program.account.studentProfile.fetch(studentProfilePda);
      expect(studentProfile.totalCreditsPurchased.toNumber()).to.equal(amount);
      expect(studentProfile.student.toString()).to.equal(env.student1.publicKey.toString());
      
      console.log("✅ Student purchased 10 credits successfully");
    });
    
    it("Student purchases 25 credits (bulk)", async () => {
      const amount = 25;
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const balanceBefore = await getTokenBalance(env.connection, studentCreditAccount);
      
      await env.program.methods
        .purchaseCredits(new anchor.BN(amount))
        .accounts({
          student: env.student1.publicKey,
          config: env.configPda,
          treasury: env.treasury.publicKey,
          creditMint: config.creditMint,
          studentCreditAccount: studentCreditAccount,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.student1])
        .rpc();
      
      const balanceAfter = await getTokenBalance(env.connection, studentCreditAccount);
      expect(balanceAfter - balanceBefore).to.equal(amount);
      
      const studentProfile = await env.program.account.studentProfile.fetch(studentProfilePda);
      expect(studentProfile.totalCreditsPurchased.toNumber()).to.equal(35); // 10 + 25
      
      console.log("✅ Student purchased 25 more credits (total: 35)");
    });
  });

  describe("Error Cases", () => {
    it("Fails with insufficient SOL", async () => {
      const poorStudent = anchor.web3.Keypair.generate();
      
      // Airdrop very small amount (not enough for purchase)
      await env.airdrop(poorStudent.publicKey, 0.01);
      
      const config = await env.program.account.programConfig.fetch(env.configPda);
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        poorStudent.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), poorStudent.publicKey.toBuffer()],
        env.program.programId
      );
      
      try {
        await env.program.methods
          .purchaseCredits(new anchor.BN(100))
          .accounts({
            student: poorStudent.publicKey,
            config: env.configPda,
            treasury: env.treasury.publicKey,
            creditMint: config.creditMint,
            studentCreditAccount: studentCreditAccount,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorStudent])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).to.include("insufficient");
      }
    });
    
    it("Fails with zero amount", async () => {
      const config = await env.program.account.programConfig.fetch(env.configPda);
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      try {
        await env.program.methods
          .purchaseCredits(new anchor.BN(0))
          .accounts({
            student: env.student1.publicKey,
            config: env.configPda,
            treasury: env.treasury.publicKey,
            creditMint: config.creditMint,
            studentCreditAccount: studentCreditAccount,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([env.student1])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error).to.exist;
      }
    });
  });

  describe("Multiple Students", () => {
    it("Student 2 purchases credits independently", async () => {
      const amount = 20;
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      const student2CreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student2.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [student2ProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student2.publicKey.toBuffer()],
        env.program.programId
      );
      
      await env.program.methods
        .purchaseCredits(new anchor.BN(amount))
        .accounts({
          student: env.student2.publicKey,
          config: env.configPda,
          treasury: env.treasury.publicKey,
          creditMint: config.creditMint,
          studentCreditAccount: student2CreditAccount,
          studentProfile: student2ProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.student2])
        .rpc();
      
      const balance = await getTokenBalance(env.connection, student2CreditAccount);
      expect(balance).to.equal(amount);
      
      const studentProfile = await env.program.account.studentProfile.fetch(student2ProfilePda);
      expect(studentProfile.totalCreditsPurchased.toNumber()).to.equal(amount);
      
      console.log("✅ Student 2 purchased 20 credits independently");
    });
  });
});
