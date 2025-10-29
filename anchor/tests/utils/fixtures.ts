import * as anchor from "@coral-xyz/anchor";

export const COURSE_FIXTURES = {
  SOL101: {
    id: "SOL101",
    name: "Solana Blockchain Fundamentals",
    requiredCredits: 5,
  },
  SOL102: {
    id: "SOL102",
    name: "Advanced Solana Development",
    requiredCredits: 8,
  },
  WEB301: {
    id: "WEB301",
    name: "Web3 Frontend Development",
    requiredCredits: 6,
  },
  RUST201: {
    id: "RUST201",
    name: "Rust Programming for Blockchain",
    requiredCredits: 7,
  },
  DEFI101: {
    id: "DEFI101",
    name: "DeFi Fundamentals",
    requiredCredits: 5,
  },
};

export const STUDENT_FIXTURES = {
  student1: {
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
  },
  student2: {
    name: "Trần Thị Bình",
    email: "tranthibinh@example.com",
  },
};

export const CREDIT_PRICE = 0.005 * anchor.web3.LAMPORTS_PER_SOL; // 0.005 SOL per credit

export const METADATA_URI = "https://ipfs.io/ipfs/QmTestMetadata";
