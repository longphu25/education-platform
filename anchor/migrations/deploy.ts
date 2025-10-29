import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";

/**
 * Deployment script for AcademicChain program
 */
async function deploy() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>;

  console.log("Deploying AcademicChain program...");
  console.log(`Program ID: ${program.programId.toString()}`);
  console.log(`Cluster: ${provider.connection.rpcEndpoint}`);

  // TODO: Add initialization logic here
  // - Initialize program config
  // - Create credit token mint
  // - Set up treasury account
  
  console.log("✅ Deployment completed");
}

deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
