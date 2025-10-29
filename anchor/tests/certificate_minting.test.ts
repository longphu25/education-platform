import * as anchor from "@coral-xyz/anchor";
import { expect } from "chai";
import { beforeAll, describe, it } from "vitest";
import { createTestEnvironment, TestEnvironment } from "./setup";
import { findPda, getTokenBalance, createCourse } from "./utils/helpers";
import { COURSE_FIXTURES, METADATA_URI } from "./utils/fixtures";
import { 
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

describe("Certificate Minting", () => {
  let env: TestEnvironment;
  let sol101CoursePda: anchor.web3.PublicKey;
  let enrollmentPda: anchor.web3.PublicKey;
  
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
    
    // Create course
    sol101CoursePda = await createCourse(
      env.program,
      env.authority,
      COURSE_FIXTURES.SOL101.id,
      COURSE_FIXTURES.SOL101.name,
      env.instructor.publicKey,
      COURSE_FIXTURES.SOL101.requiredCredits
    );
    
    // Student purchases credits and registers
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
    
    [enrollmentPda] = await findPda(
      [
        Buffer.from("enrollment"),
        env.student1.publicKey.toBuffer(),
        Buffer.from(COURSE_FIXTURES.SOL101.id)
      ],
      env.program.programId
    );
    
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
    
    // Complete course
    await env.program.methods
      .completeCourse(COURSE_FIXTURES.SOL101.id, 85)
      .accounts({
        instructor: env.instructor.publicKey,
        course: sol101CoursePda,
        enrollment: enrollmentPda,
      })
      .signers([env.instructor])
      .rpc();
  });

  describe("Successful Certificate Minting", () => {
    it("Instructor mints certificate NFT for completed course", async () => {
      const [certificateMintPda] = await findPda(
        [
          Buffer.from("certificate_mint"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(COURSE_FIXTURES.SOL101.id)
        ],
        env.program.programId
      );
      
      const studentCertificateAccount = getAssociatedTokenAddressSync(
        certificateMintPda,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const tx = await env.program.methods
        .mintCertificate(COURSE_FIXTURES.SOL101.id, METADATA_URI)
        .accounts({
          instructor: env.instructor.publicKey,
          student: env.student1.publicKey,
          course: sol101CoursePda,
          enrollment: enrollmentPda,
          certificateMint: certificateMintPda,
          studentCertificateAccount: studentCertificateAccount,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.instructor])
        .rpc();
      
      console.log("Mint certificate transaction:", tx);
      
      // Verify NFT minted (balance = 1)
      const nftBalance = await getTokenBalance(env.connection, studentCertificateAccount);
      expect(nftBalance).to.equal(1);
      
      // Verify enrollment updated with certificate mint
      const enrollment = await env.program.account.courseEnrollment.fetch(enrollmentPda);
      expect(enrollment.certificateMint?.toString()).to.equal(certificateMintPda.toString());
      
      // Verify student profile updated
      const studentProfile = await env.program.account.studentProfile.fetch(studentProfilePda);
      expect(studentProfile.coursesCompleted).to.equal(1);
      
      console.log("✅ Certificate NFT minted successfully");
      console.log("   Mint Address:", certificateMintPda.toString());
    });
  });

  describe("Error Cases", () => {
    it("Fails when course not completed", async () => {
      // Create new course and enroll (but don't complete)
      const sol102CoursePda = await createCourse(
        env.program,
        env.authority,
        COURSE_FIXTURES.SOL102.id,
        COURSE_FIXTURES.SOL102.name,
        env.instructor.publicKey,
        COURSE_FIXTURES.SOL102.requiredCredits
      );
      
      const config = await env.program.account.programConfig.fetch(env.configPda);
      const studentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [enrollment2Pda] = await findPda(
        [
          Buffer.from("enrollment"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(COURSE_FIXTURES.SOL102.id)
        ],
        env.program.programId
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      await env.program.methods
        .registerCourse(COURSE_FIXTURES.SOL102.id)
        .accounts({
          student: env.student1.publicKey,
          config: env.configPda,
          course: sol102CoursePda,
          enrollment: enrollment2Pda,
          studentCreditAccount: studentCreditAccount,
          creditMint: config.creditMint,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([env.student1])
        .rpc();
      
      const [certificate2MintPda] = await findPda(
        [
          Buffer.from("certificate_mint"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(COURSE_FIXTURES.SOL102.id)
        ],
        env.program.programId
      );
      
      const studentCertificate2Account = getAssociatedTokenAddressSync(
        certificate2MintPda,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      try {
        await env.program.methods
          .mintCertificate(COURSE_FIXTURES.SOL102.id, METADATA_URI)
          .accounts({
            instructor: env.instructor.publicKey,
            student: env.student1.publicKey,
            course: sol102CoursePda,
            enrollment: enrollment2Pda,
            certificateMint: certificate2MintPda,
            studentCertificateAccount: studentCertificate2Account,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([env.instructor])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.error.errorMessage).to.include("Course not completed");
      }
    });
    
    it("Fails when certificate already minted", async () => {
      const [certificateMintPda] = await findPda(
        [
          Buffer.from("certificate_mint"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(COURSE_FIXTURES.SOL101.id)
        ],
        env.program.programId
      );
      
      const studentCertificateAccount = getAssociatedTokenAddressSync(
        certificateMintPda,
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
          .mintCertificate(COURSE_FIXTURES.SOL101.id, METADATA_URI)
          .accounts({
            instructor: env.instructor.publicKey,
            student: env.student1.publicKey,
            course: sol101CoursePda,
            enrollment: enrollmentPda,
            certificateMint: certificateMintPda,
            studentCertificateAccount: studentCertificateAccount,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([env.instructor])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.error.errorMessage).to.include("Certificate already minted");
      }
    });
  });
});
