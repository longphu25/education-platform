import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AcademicChain } from "../target/types/academic_chain";
import { expect } from "chai";

describe("course_registration", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AcademicChain as Program<AcademicChain>;

  it("Successfully registers for an active course", async () => {
    // TODO: Implement test
  });

  it("Burns correct amount of credits", async () => {
    // TODO: Implement test
  });

  it("Creates enrollment record", async () => {
    // TODO: Implement test
  });

  it("Fails when course is not active", async () => {
    // TODO: Implement test
  });

  it("Fails with insufficient credits", async () => {
    // TODO: Implement test
  });

  it("Fails when already enrolled", async () => {
    // TODO: Implement test
  });
});
