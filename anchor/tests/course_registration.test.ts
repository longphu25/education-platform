import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { beforeAll, describe, it } from "vitest";
import { createTestEnvironment, TestEnvironment } from "./setup";
import { findPda, getTokenBalance, createCourse } from "./utils/helpers";
import { COURSE_FIXTURES } from "./utils/fixtures";
import { 
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

describe("Course Registration", () => {
  let env: TestEnvironment;
  let sol101CoursePda: anchor.web3.PublicKey;
  
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
    
    // Create test course
    sol101CoursePda = await createCourse(
      env.program,
      env.authority,
      COURSE_FIXTURES.SOL101.id,
      COURSE_FIXTURES.SOL101.name,
      env.instructor.publicKey,
      COURSE_FIXTURES.SOL101.requiredCredits
    );
    
    // Student purchases credits
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
    
    await env.program.methods
      .purchaseCredits(new anchor.BN(30))
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
  });

  describe("Successful Registration", () => {
    it("Student registers for SOL101 course", async () => {
      const courseId = COURSE_FIXTURES.SOL101.id;
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [enrollmentPda] = await findPda(
        [
          Buffer.from("enrollment"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(courseId)
        ],
        env.program.programId
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const creditBalanceBefore = await getTokenBalance(env.connection, studentCreditAccount);
      
      const tx = await env.program.methods
        .registerCourse(courseId)
        .accounts({
          student: env.student1.publicKey,
          config: env.configPda,
          course: sol101CoursePda,
          enrollment: enrollmentPda,
          studentCreditAccount: studentCreditAccount,
          creditMint: config.creditMint,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.student1])
        .rpc();
      
      console.log("Register course transaction:", tx);
      
      // Verify credits burned
      const creditBalanceAfter = await getTokenBalance(env.connection, studentCreditAccount);
      expect(creditBalanceBefore - creditBalanceAfter).to.equal(
        COURSE_FIXTURES.SOL101.requiredCredits
      );
      
      // Verify enrollment PDA
      const enrollment = await env.program.account.courseEnrollment.fetch(enrollmentPda);
      expect(enrollment.student.toString()).to.equal(env.student1.publicKey.toString());
      expect(enrollment.courseId).to.equal(courseId);
      expect(enrollment.creditsPaid.toNumber()).to.equal(COURSE_FIXTURES.SOL101.requiredCredits);
      expect(enrollment.isCompleted).to.be.false;
      
      // Verify student profile updated
      const studentProfile = await env.program.account.studentProfile.fetch(studentProfilePda);
      expect(studentProfile.totalCreditsSpent.toNumber()).to.equal(
        COURSE_FIXTURES.SOL101.requiredCredits
      );
      
      console.log("✅ Student registered for SOL101 successfully");
    });
    
    it("Student registers for second course", async () => {
      // Create WEB301 course
      const web301CoursePda = await createCourse(
        env.program,
        env.authority,
        COURSE_FIXTURES.WEB301.id,
        COURSE_FIXTURES.WEB301.name,
        env.instructor.publicKey,
        COURSE_FIXTURES.WEB301.requiredCredits
      );
      
      const courseId = COURSE_FIXTURES.WEB301.id;
      const config = await env.program.account.programConfig.fetch(env.configPda);
      
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [enrollmentPda] = await findPda(
        [
          Buffer.from("enrollment"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(courseId)
        ],
        env.program.programId
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      await env.program.methods
        .registerCourse(courseId)
        .accounts({
          student: env.student1.publicKey,
          config: env.configPda,
          course: web301CoursePda,
          enrollment: enrollmentPda,
          studentCreditAccount: studentCreditAccount,
          creditMint: config.creditMint,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.student1])
        .rpc();
      
      const enrollment = await env.program.account.courseEnrollment.fetch(enrollmentPda);
      expect(enrollment.courseId).to.equal(courseId);
      
      const studentProfile = await env.program.account.studentProfile.fetch(studentProfilePda);
      expect(studentProfile.totalCreditsSpent.toNumber()).to.equal(
        COURSE_FIXTURES.SOL101.requiredCredits + COURSE_FIXTURES.WEB301.requiredCredits
      );
      
      console.log("✅ Student registered for WEB301 successfully");
    });
  });

  describe("Error Cases", () => {
    it("Fails with insufficient credits", async () => {
      const poorStudent = anchor.web3.Keypair.generate();
      await env.airdrop(poorStudent.publicKey, 1);
      
      const config = await env.program.account.programConfig.fetch(env.configPda);
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        poorStudent.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [enrollmentPda] = await findPda(
        [
          Buffer.from("enrollment"),
          poorStudent.publicKey.toBuffer(),
          Buffer.from(COURSE_FIXTURES.SOL101.id)
        ],
        env.program.programId
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), poorStudent.publicKey.toBuffer()],
        env.program.programId
      );
      
      // Purchase only 2 credits (SOL101 requires 5)
      await env.program.methods
        .purchaseCredits(new anchor.BN(2))
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
      
      try {
        await env.program.methods
          .registerCourse(COURSE_FIXTURES.SOL101.id)
          .accounts({
            student: poorStudent.publicKey,
            config: env.configPda,
            course: sol101CoursePda,
            enrollment: enrollmentPda,
            studentCreditAccount: studentCreditAccount,
            creditMint: config.creditMint,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([poorStudent])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.error.errorMessage).to.include("Insufficient credits");
      }
    });
    
    it("Fails when already enrolled", async () => {
      const config = await env.program.account.programConfig.fetch(env.configPda);
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [enrollmentPda] = await findPda(
        [
          Buffer.from("enrollment"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(COURSE_FIXTURES.SOL101.id)
        ],
        env.program.programId
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      try {
        await env.program.methods
          .registerCourse(COURSE_FIXTURES.SOL101.id)
          .accounts({
            student: env.student1.publicKey,
            config: env.configPda,
            course: sol101CoursePda,
            enrollment: enrollmentPda,
            studentCreditAccount: studentCreditAccount,
            creditMint: config.creditMint,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([env.student1])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).to.include("already in use");
      }
    });
  });
});
