# GEMINI.md

## Project Overview

This is a full-stack decentralized application (dApp) built on the Solana blockchain for the **AcademicChain educational platform**. The frontend is a Next.js application using React, TypeScript, and Tailwind CSS for styling. The backend is a Solana program written in Rust using the Anchor framework.

### Core Components

1. **Simple Counter Program**: A basic Anchor program that can be incremented, decremented, and set to a specific value.
2. **AcademicChain Dashboard**: A complete educational platform with course management, credit system, and NFT certificates.

### AcademicChain Features

- **Dashboard Home**: Overview with stats (credit balance, active courses, certificates, graduation progress)
- **Credit System**: Purchase credits with bonus packages to enroll in courses
- **Course Management**: 
  - Browse 4 courses (Solana Fundamentals, Advanced Solana, Web3 Frontend, Rust for Blockchain)
  - Search and filter by difficulty level
  - Course registration with credit balance validation
  - Progress tracking for enrolled courses
- **Certificate System**: 
  - NFT certificate gallery with blockchain verification
  - Graduation tracking (5 courses required)
  - Completion status with grades
- **Mock Data**: Complete mock data system for development and demonstration

## Building and Running

**Prerequisites:**

*   Node.js and npm
*   Rust and Cargo
*   Solana CLI
*   Anchor CLI

**Installation:**

```bash
pnpm install
```

**Development:**

To start the development server for the Next.js application:

```bash
pnpm run dev
```

**Anchor Program:**

To build the Anchor program:

```bash
pnpm run anchor-build
```

To run the tests for the Anchor program:

```bash
pnpm run anchor-test
```

To deploy the program to a local test validator:

```bash
pnpm run anchor-localnet
```

## Development Conventions

- The project uses Prettier for code formatting.
- ESLint is used for linting the code.
- The frontend code is organized into features, with each feature having its own data access and UI components.
- The project uses `codama` to generate a JavaScript/TypeScript SDK for the Anchor program.

## AcademicChain File Structure

```
src/
├── types/index.ts                    # TypeScript interfaces for educational platform
├── lib/mockData.ts                   # Mock data for students, courses, certificates
├── components/ui/progress.tsx        # Progress bar component
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx               # Sidebar navigation layout
│   │   ├── page.tsx                 # Dashboard home page
│   │   ├── courses/
│   │   │   ├── page.tsx            # Course browsing page
│   │   │   └── [courseId]/
│   │   │       └── register/page.tsx # Course registration
│   │   ├── credits/
│   │   │   └── buy/page.tsx        # Credit purchase page
│   │   └── certificates/
│   │       └── page.tsx            # Certificates and graduation
│   └── api/mock/                    # Mock API endpoints
│       ├── courses/route.ts
│       ├── certificates/route.ts
│       └── transactions/route.ts
```

## Key Features

### Dashboard Pages

1. **Dashboard Home** (`/dashboard`)
   - Credit balance and spending stats
   - Active courses with progress tracking
   - Recent certificates display
   - Quick action buttons

2. **Buy Credits** (`/dashboard/credits/buy`)
   - Package selection (10, 25, 50, 100 credits)
   - Bonus credits for larger packages
   - Payment method selection (SOL/USDC)
   - Order summary with cost calculation

3. **Course List** (`/dashboard/courses`)
   - Search functionality
   - Difficulty filters (Beginner, Intermediate, Advanced)
   - Course cards with ratings and enrollment counts
   - Enrolled status indicators

4. **Course Registration** (`/dashboard/courses/[courseId]/register`)
   - Detailed course information
   - Learning outcomes and prerequisites
   - Credit balance validation
   - Registration confirmation flow

5. **Certificates** (`/dashboard/certificates`)
   - NFT certificate gallery
   - Graduation progress tracker (5 courses required)
   - Blockchain verification status
   - Download and view options

### Mock Data

Complete mock data system includes:
- Student profiles with credit balances
- 4 diverse courses (Solana, Web3, Rust, Advanced topics)
- Course enrollments with progress tracking
- NFT certificates with grades and mint addresses
- Transaction history (purchases, registrations, minting)

See `.doc/fe.md` for complete frontend architecture documentation.

