import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";
import { expect } from "chai";

describe("purchase_credits", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>;

  it("Successfully purchases credits with SOL", async () => {
    // TODO: Implement test
  });

  it("Updates student profile after purchase", async () => {
    // TODO: Implement test
  });

  it("Mints credit tokens to student account", async () => {
    // TODO: Implement test
  });

  it("Fails with insufficient SOL", async () => {
    // TODO: Implement test
  });
});
