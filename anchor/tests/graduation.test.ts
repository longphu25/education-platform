import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";
import { expect } from "chai";

describe("graduation", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>;

  it("Successfully claims graduation NFT", async () => {
    // TODO: Implement test
  });

  it("Verifies all required courses completed", async () => {
    // TODO: Implement test
  });

  it("Stores graduation NFT in student profile", async () => {
    // TODO: Implement test
  });

  it("Fails when requirements not met", async () => {
    // TODO: Implement test
  });

  it("Fails when graduation already claimed", async () => {
    // TODO: Implement test
  });
});
