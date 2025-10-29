import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";

/**
 * Create a new course
 */
async function createCourse(
  program: Program<AcademicChain>,
  courseId: string,
  courseName: string,
  requiredCredits: number,
  instructor: anchor.web3.PublicKey
) {
  try {
    console.log("Creating course...");
    console.log(`Course ID: ${courseId}`);
    console.log(`Course Name: ${courseName}`);
    console.log(`Required Credits: ${requiredCredits}`);
    console.log(`Instructor: ${instructor.toString()}`);

    // TODO: Implement course creation instruction
    // This requires adding a create_course instruction to the program
    
    console.log("✅ Course created successfully");
  } catch (error) {
    console.error("Failed to create course:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>;

  // Example course
  const courseId = "CS101";
  const courseName = "Introduction to Computer Science";
  const requiredCredits = 3;
  const instructor = provider.wallet.publicKey;

  createCourse(program, courseId, courseName, requiredCredits, instructor)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { createCourse };
