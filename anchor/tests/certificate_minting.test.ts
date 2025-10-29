import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";
import { expect } from "chai";

describe("certificate_minting", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>;

  it("Successfully mints certificate NFT after course completion", async () => {
    // TODO: Implement test
  });

  it("Stores certificate mint address in enrollment", async () => {
    // TODO: Implement test
  });

  it("Fails when course not completed", async () => {
    // TODO: Implement test
  });

  it("Fails when certificate already minted", async () => {
    // TODO: Implement test
  });

  it("Contains correct metadata", async () => {
    // TODO: Implement test
  });
});
