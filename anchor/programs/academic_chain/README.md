# AcademicChain - Anchor Program

Decentralized academic credit and certification system built on Solana using Anchor framework.

## Features

- **Credit Purchase**: Students can purchase credit tokens with SOL
- **Course Registration**: Register for courses by spending credits
- **Course Completion**: Instructors can mark courses as completed with grades
- **Certificate NFTs**: Mint NFT certificates for completed courses
- **Graduation NFTs**: Claim graduation NFT after completing required courses

## Program Structure

```
programs/academic_chain/
├── src/
│   ├── lib.rs                    # Program entry point
│   ├── state.rs                  # Account state definitions
│   ├── errors.rs                 # Custom error codes
│   ├── constants.rs              # Program constants
│   ├── instructions/             # Instruction handlers
│   │   ├── initialize.rs
│   │   ├── purchase_credits.rs
│   │   ├── register_course.rs
│   │   ├── complete_course.rs
│   │   ├── mint_certificate.rs
│   │   └── claim_graduation.rs
│   └── utils/                    # Helper functions
│       ├── validations.rs
│       └── token_operations.rs
└── Cargo.toml                    # Dependencies
```

## Building and Testing

### Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Anchor CLI 0.31+
- Node.js 18+
- Yarn

### Install Dependencies

```bash
# Install Rust dependencies
cargo install --version 0.31.1 anchor-cli

# Install Node.js dependencies
yarn install
```

### Build

```bash
# Build the program
anchor build

# Generate TypeScript types
anchor build
```

### Test

```bash
# Run all tests
anchor test

# Run specific test file
anchor test tests/purchase_credits.test.ts
```

### Deploy

```bash
# Deploy to localnet (default)
anchor deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

## Program Instructions

### 1. Initialize

Initialize the program with configuration settings.

```typescript
await program.methods
  .initialize()
  .accounts({
    authority: provider.wallet.publicKey,
    config: configPDA,
    treasury: treasuryPubkey,
    creditMint: creditMintPubkey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 2. Purchase Credits

Students purchase credit tokens with SOL.

```typescript
await program.methods
  .purchaseCredits(new anchor.BN(10)) // 10 credits
  .accounts({
    student: provider.wallet.publicKey,
    config: configPDA,
    treasury: treasuryPubkey,
    creditMint: creditMintPubkey,
    studentCreditAccount: studentTokenAccount,
    studentProfile: studentProfilePDA,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 3. Register Course

Register for a course by spending credits.

```typescript
await program.methods
  .registerCourse("CS101")
  .accounts({
    student: provider.wallet.publicKey,
    course: coursePDA,
    enrollment: enrollmentPDA,
    studentProfile: studentProfilePDA,
    config: configPDA,
    creditMint: creditMintPubkey,
    studentCreditAccount: studentTokenAccount,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 4. Complete Course

Instructor marks a course as completed with a grade.

```typescript
await program.methods
  .completeCourse("CS101", 85) // grade: 85
  .accounts({
    instructor: provider.wallet.publicKey,
    course: coursePDA,
    student: studentPubkey,
    enrollment: enrollmentPDA,
    studentProfile: studentProfilePDA,
  })
  .rpc();
```

### 5. Mint Certificate

Mint an NFT certificate for a completed course.

```typescript
await program.methods
  .mintCertificate("CS101", "https://metadata-uri.com/cert.json")
  .accounts({
    student: provider.wallet.publicKey,
    course: coursePDA,
    enrollment: enrollmentPDA,
    certificateMint: certificateMintPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 6. Claim Graduation

Claim a graduation NFT after completing required courses.

```typescript
await program.methods
  .claimGraduation(["CS101", "CS102", "CS103"])
  .accounts({
    student: provider.wallet.publicKey,
    studentProfile: studentProfilePDA,
    graduationMint: graduationMintPDA,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Account Structures

### ProgramConfig

- `authority`: Program authority
- `credit_mint`: Credit token mint address
- `treasury`: Treasury account for SOL payments
- `credit_price`: Price per credit in lamports
- `bump`: PDA bump seed

### Course

- `course_id`: Unique course identifier
- `course_name`: Course name
- `instructor`: Instructor public key
- `required_credits`: Credits required to register
- `is_active`: Course status
- `created_at`: Creation timestamp
- `bump`: PDA bump seed

### CourseEnrollment

- `student`: Student public key
- `course_id`: Course identifier
- `credits_paid`: Credits paid for registration
- `enrollment_date`: Registration timestamp
- `completion_date`: Completion timestamp (optional)
- `is_completed`: Completion status
- `grade`: Final grade (0-100)
- `certificate_mint`: Certificate NFT mint (optional)
- `bump`: PDA bump seed

### StudentProfile

- `student`: Student public key
- `total_credits_purchased`: Total credits purchased
- `total_credits_spent`: Total credits spent
- `courses_completed`: Number of completed courses
- `graduation_nft`: Graduation NFT mint (optional)
- `created_at`: Profile creation timestamp
- `bump`: PDA bump seed

## Scripts

### Airdrop SOL

```bash
ts-node scripts/airdrop.ts
```

### Create Course

```bash
ts-node scripts/create_course.ts
```

### Mint Test Tokens

```bash
ts-node scripts/mint_test_tokens.ts
```

## Development Notes

- The program uses PDAs (Program Derived Addresses) for deterministic account creation
- Credit tokens are SPL tokens managed by the program
- Certificates and graduation diplomas are represented as NFTs
- All monetary amounts are in lamports (1 SOL = 1,000,000,000 lamports)

## Security Considerations

- Only instructors can mark courses as completed
- Students must have sufficient credits to register for courses
- Certificates can only be minted once per course completion
- Graduation NFTs require all specified courses to be completed

## License

MIT

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [SPL Token Documentation](https://spl.solana.com/token)
