import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
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

describe("Graduation", () => {
  let env: TestEnvironment;
  const requiredCourses = [
    COURSE_FIXTURES.SOL101,
    COURSE_FIXTURES.SOL102,
    COURSE_FIXTURES.WEB301,
    COURSE_FIXTURES.RUST201,
    COURSE_FIXTURES.DEFI101,
  ];
  
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
    
    // Student purchases enough credits
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
    
    const totalCreditsNeeded = requiredCourses.reduce(
      (sum, course) => sum + course.requiredCredits,
      0
    );
    
    await env.program.methods
      .purchaseCredits(new anchor.BN(totalCreditsNeeded + 10))
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
    
    // Complete all required courses
    for (const course of requiredCourses) {
      // Create course
      const coursePda = await createCourse(
        env.program,
        env.authority,
        course.id,
        course.name,
        env.instructor.publicKey,
        course.requiredCredits
      );
      
      // Register for course
      const [enrollmentPda] = await findPda(
        [
          Buffer.from("enrollment"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(course.id)
        ],
        env.program.programId
      );
      
      await env.program.methods
        .registerCourse(course.id)
        .accounts({
          student: env.student1.publicKey,
          config: env.configPda,
          course: coursePda,
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
        .completeCourse(course.id, 85)
        .accounts({
          instructor: env.instructor.publicKey,
          course: coursePda,
          enrollment: enrollmentPda,
        })
        .signers([env.instructor])
        .rpc();
      
      // Mint certificate
      const [certificateMintPda] = await findPda(
        [
          Buffer.from("certificate_mint"),
          env.student1.publicKey.toBuffer(),
          Buffer.from(course.id)
        ],
        env.program.programId
      );
      
      const studentCertificateAccount = getAssociatedTokenAddressSync(
        certificateMintPda,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      await env.program.methods
        .mintCertificate(course.id, METADATA_URI)
        .accounts({
          instructor: env.instructor.publicKey,
          student: env.student1.publicKey,
          course: coursePda,
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
      
      console.log(`✅ Completed course: ${course.id}`);
    }
  });

  describe("Successful Graduation", () => {
    it("Student claims graduation NFT after completing all courses", async () => {
      const [graduationMintPda] = await findPda(
        [
          Buffer.from("graduation_mint"),
          env.student1.publicKey.toBuffer()
        ],
        env.program.programId
      );
      
      const studentGraduationAccount = getAssociatedTokenAddressSync(
        graduationMintPda,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const requiredCourseIds = requiredCourses.map(c => c.id);
      
      const tx = await env.program.methods
        .claimGraduation(requiredCourseIds)
        .accounts({
          student: env.student1.publicKey,
          graduationMint: graduationMintPda,
          studentGraduationAccount: studentGraduationAccount,
          studentProfile: studentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .remainingAccounts(
          // Pass enrollment PDAs as remaining accounts
          requiredCourseIds.map(courseId => {
            const [enrollmentPda] = PublicKey.findProgramAddressSync(
              [
                Buffer.from("enrollment"),
                env.student1.publicKey.toBuffer(),
                Buffer.from(courseId)
              ],
              env.program.programId
            );
            return {
              pubkey: enrollmentPda,
              isWritable: false,
              isSigner: false,
            };
          })
        )
        .signers([env.student1])
        .rpc();
      
      console.log("Claim graduation transaction:", tx);
      
      // Verify graduation NFT minted
      const nftBalance = await getTokenBalance(env.connection, studentGraduationAccount);
      expect(nftBalance).to.equal(1);
      
      // Verify student profile updated
      const studentProfile = await env.program.account.studentProfile.fetch(studentProfilePda);
      expect(studentProfile.graduationNft?.toString()).to.equal(graduationMintPda.toString());
      
      console.log("✅ Graduation NFT claimed successfully!");
      console.log("   Mint Address:", graduationMintPda.toString());
    });
  });

  describe("Error Cases", () => {
    it("Fails when not all courses completed", async () => {
      // Create new student
      const newStudent = anchor.web3.Keypair.generate();
      await env.airdrop(newStudent.publicKey, 2);
      
      const config = await env.program.account.programConfig.fetch(env.configPda);
      const newStudentCreditAccount = getAssociatedTokenAddressSync(
        config.creditMint,
        newStudent.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [newStudentProfilePda] = await findPda(
        [Buffer.from("student_profile"), newStudent.publicKey.toBuffer()],
        env.program.programId
      );
      
      // Purchase credits
      await env.program.methods
        .purchaseCredits(new anchor.BN(50))
        .accounts({
          student: newStudent.publicKey,
          config: env.configPda,
          treasury: env.treasury.publicKey,
          creditMint: config.creditMint,
          studentCreditAccount: newStudentCreditAccount,
          studentProfile: newStudentProfilePda,
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([newStudent])
        .rpc();
      
      // Register and complete only 3 courses (not all 5)
      for (let i = 0; i < 3; i++) {
        const course = requiredCourses[i];
        const [coursePda] = await findPda(
          [Buffer.from("course"), Buffer.from(course.id)],
          env.program.programId
        );
        
        const [enrollmentPda] = await findPda(
          [
            Buffer.from("enrollment"),
            newStudent.publicKey.toBuffer(),
            Buffer.from(course.id)
          ],
          env.program.programId
        );
        
        await env.program.methods
          .registerCourse(course.id)
          .accounts({
            student: newStudent.publicKey,
            config: env.configPda,
            course: coursePda,
            enrollment: enrollmentPda,
            studentCreditAccount: newStudentCreditAccount,
            creditMint: config.creditMint,
            studentProfile: newStudentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([newStudent])
          .rpc();
        
        await env.program.methods
          .completeCourse(course.id, 75)
          .accounts({
            instructor: env.instructor.publicKey,
            course: coursePda,
            enrollment: enrollmentPda,
          })
          .signers([env.instructor])
          .rpc();
      }
      
      const [graduationMintPda] = await findPda(
        [Buffer.from("graduation_mint"), newStudent.publicKey.toBuffer()],
        env.program.programId
      );
      
      const studentGraduationAccount = getAssociatedTokenAddressSync(
        graduationMintPda,
        newStudent.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const requiredCourseIds = requiredCourses.map(c => c.id);
      
      try {
        await env.program.methods
          .claimGraduation(requiredCourseIds)
          .accounts({
            student: newStudent.publicKey,
            graduationMint: graduationMintPda,
            studentGraduationAccount: studentGraduationAccount,
            studentProfile: newStudentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .remainingAccounts(
            requiredCourseIds.map(courseId => {
              const [enrollmentPda] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("enrollment"),
                  newStudent.publicKey.toBuffer(),
                  Buffer.from(courseId)
                ],
                env.program.programId
              );
              return {
                pubkey: enrollmentPda,
                isWritable: false,
                isSigner: false,
              };
            })
          )
          .signers([newStudent])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.error.errorMessage).to.include("Requirements not met");
      }
    });
    
    it("Fails when already graduated", async () => {
      const [graduationMintPda] = await findPda(
        [Buffer.from("graduation_mint"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const studentGraduationAccount = getAssociatedTokenAddressSync(
        graduationMintPda,
        env.student1.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      const [studentProfilePda] = await findPda(
        [Buffer.from("student_profile"), env.student1.publicKey.toBuffer()],
        env.program.programId
      );
      
      const requiredCourseIds = requiredCourses.map(c => c.id);
      
      try {
        await env.program.methods
          .claimGraduation(requiredCourseIds)
          .accounts({
            student: env.student1.publicKey,
            graduationMint: graduationMintPda,
            studentGraduationAccount: studentGraduationAccount,
            studentProfile: studentProfilePda,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .remainingAccounts(
            requiredCourseIds.map(courseId => {
              const [enrollmentPda] = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("enrollment"),
                  env.student1.publicKey.toBuffer(),
                  Buffer.from(courseId)
                ],
                env.program.programId
              );
              return {
                pubkey: enrollmentPda,
                isWritable: false,
                isSigner: false,
              };
            })
          )
          .signers([env.student1])
          .rpc();
        
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).to.include("already in use");
      }
    });
  });
});
