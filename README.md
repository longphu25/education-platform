# edu-app

An educational platform built on Solana with academic credit purchases, course enrollment, and NFT certificates.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build and deploy program
cd anchor
anchor build
anchor deploy --provider.cluster devnet

# 3. Get devnet SOL
solana airdrop 2 --url devnet

# 4. Initialize program (required!)
npx tsx scripts/init-simple.ts

# 5. Verify setup
cd ..
npx tsx scripts/check-program-init.ts

# 6. Start the app
npm run dev
```

Visit http://localhost:3000 and connect your wallet to purchase credits!

## 📋 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Program Initialization](#️-important-program-initialization)
- [Purchase Credits](#-purchase-credits-feature)
- [Smart Wallet Workflow](#-smart-wallet-workflow-with-privy)
- [AcademicChain Pages](#-academicchain-frontend-pages)
- [Architecture](#apps)

## ✨ Features

- 💳 **Purchase Credits**: Buy academic credits using SOL
- 📚 **Course Management**: Browse and enroll in courses
- 🏆 **NFT Certificates**: Earn blockchain-verified certificates
- 👛 **Smart Wallet**: Embedded wallets via Privy or external wallets
- 🎨 **Modern UI**: Beautiful interface with Tailwind + shadcn/ui
- ⚡ **Solana Program**: Secure on-chain logic with Anchor
- 🔧 **Type-Safe**: Full TypeScript coverage
- 📊 **Real-time Updates**: React Query for state management

## 🛠 Tech Stack

This is a Next.js app containing:

- Template : [Fullstack Counter Boilerplate](https://templates.solana.com/solana/gill-next-tailwind-counter)
- Tailwind and Shadcn UI for styling
- [Gill](https://gill.site/) Solana SDK
- Shadcn [Wallet UI](https://registry.wallet-ui.dev) components
- A basic Counter Solana program written in Anchor
- [codama](https://github.com/codama-idl/codama) to generate a JS sdk for the program
- UI components for interacting with the program
- UI [Reka UI](https://github.com/unovue/reka-ui)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Solana CLI tools
- Anchor framework
- At least 1 SOL on devnet for testing

### Installation

#### Download the template

```shell
npx create-solana-dapp@latest -t gh:solana-foundation/templates/gill/edu-app
```

#### Install Dependencies

```shell
npm install
```

### ⚠️ Important: Program Initialization

**Before you can use the app**, you must initialize the Academic Chain program. This is a one-time setup.

#### Quick Setup (5 minutes)

1. **Build and deploy the program:**
   ```bash
   cd anchor
   anchor build
   anchor deploy --provider.cluster devnet
   ```

2. **Get devnet SOL:**
   ```bash
   solana airdrop 2 --url devnet
   ```

3. **Initialize the program:**
   ```bash
   npx tsx scripts/init-simple.ts
   ```

4. **Verify initialization:**
   ```bash
   cd ..
   npx tsx scripts/check-program-init.ts
   ```

You should see:
```
✅ Program is INITIALIZED!
Configuration Details:
  Credit Price: 0.0010 SOL
  Treasury: ...
  Credit Mint: ...
```

Now you're ready to use the app!

### Troubleshooting

If you see "Account not found" or "Program not initialized" errors:

- Run: `cd anchor && npx tsx scripts/init-simple.ts`
- Check: `npx tsx scripts/check-program-init.ts`
- See: [Program Initialization Guide](./docs/PROGRAM_INITIALIZATION.md)

For more details:
- 📖 [Program Initialization Guide](./docs/PROGRAM_INITIALIZATION.md)
- 📖 [Purchase Credits Workflow](./docs/PURCHASE_CREDITS_WORKFLOW.md)
- 📖 [Fix: Account Not Found](./docs/FIX_ACCOUNT_NOT_FOUND.md)

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the
command with `npm`, eg: `npm run anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the
Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program. This will also update
the constant in the `anchor/src/counter-exports.ts` file.

```shell
npm run setup
```

#### Build the program:

```shell
npm run anchor-build
```

#### Start the test validator with the program deployed:

```shell
npm run anchor-localnet
```

#### Run the tests

```shell
npm run anchor-test
```

#### Deploy to Devnet

```shell
npm run anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the app

```shell
npm run dev
```

Build the app

```shell
npm run build
```

## 🎯 Smart Wallet Workflow with Privy

This app implements a **smart wallet workflow** using [Privy.io](https://privy.io) that adapts based on how users login:

### 🔄 **Login Method → Wallet Type Mapping**

| Login Method | Result | Wallet Type | Description |
|-------------|--------|-------------|-------------|
| 📧 **Email** | Auto-creates embedded wallet | `embedded` | Secure wallet managed by Privy |
| 📱 **Phone/SMS** | Auto-creates embedded wallet | `embedded` | No seed phrases to manage |
| 🔗 **Social** (Google, Twitter, etc.) | Auto-creates embedded wallet | `embedded` | One-click authentication |
| 👛 **Wallet** | Uses existing wallet | `external` | Phantom, Solflare, etc. |

### ✅ **Complete Implementation Status**

- ✅ **Multi-login support**: Email, SMS, Social, Wallet
- ✅ **Smart wallet detection**: Auto-determines embedded vs external
- ✅ **Embedded wallet creation**: Simulated for non-wallet users
- ✅ **External wallet integration**: Works with existing Solana wallets
- ✅ **Dynamic UI**: Different interface based on wallet type
- ✅ **Transaction compatibility**: Ready for program interactions
- ✅ **Type-safe integration**: Full TypeScript support

### 🚀 **User Experience Flow**

1. **User visits app** → Sees login options
2. **Chooses login method**:
   - **Email/Social/SMS** → Embedded wallet created automatically
   - **Wallet** → Connects existing Solana wallet
3. **Wallet ready** → Can interact with Solana programs
4. **Seamless transactions** → Different signing methods based on wallet type

### 🛠 **Setup**

1. Get your App ID from [Privy Dashboard](https://console.privy.io)
2. Add to `.env.local`:

   ```bash
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   ```

3. Dependencies included:

   ```bash
   @privy-io/react-auth (configured for Solana)
   ```

### 🏗 **Architecture**

- **Smart Hook**: `useSolana()` detects login method and wallet type
- **Adaptive Components**: UI changes based on wallet type
- **Utility Functions**: Helper functions for wallet management
- **Type Safety**: Full TypeScript coverage for all wallet operations
- **Compatibility**: Works with existing Solana program components

See [PRIVY_INTEGRATION.md](./PRIVY_INTEGRATION.md) for detailed setup instructions.

## 💳 Purchase Credits Feature

The app includes a complete **purchase credits system** for buying academic credits with SOL:

### **Features**

- ✅ **Wallet Integration**: Automatic wallet detection and connection
- ✅ **Real-time Pricing**: Dynamic cost calculation based on amount
- ✅ **Transaction Handling**: Complete transaction flow with error handling
- ✅ **SPL Token Minting**: Credits minted as SPL tokens to user's wallet
- ✅ **Profile Tracking**: Automatic student profile creation and updates
- ✅ **Explorer Links**: View transactions on Solana Explorer
- ✅ **Error Recovery**: User-friendly error messages and retry options

### **How It Works**

1. **Connect Wallet** → User connects via Privy or external wallet
2. **Enter Amount** → Specify number of credits to purchase
3. **Review Cost** → See total SOL cost with current credit price
4. **Approve Transaction** → Confirm in wallet
5. **Credits Received** → SPL tokens minted to wallet
6. **Profile Updated** → Purchase history tracked on-chain

### **Technical Stack**

- **Frontend**: React hooks with React Query for state management
- **SDK**: Gill SDK for Solana interactions
- **Smart Contract**: Anchor program on Solana
- **Token**: SPL Token standard for academic credits

### **Pages**

- 📍 `/academic-credits` - Main purchase interface
- 📊 Real-time balance and transaction history
- 🔍 Solana Explorer integration

### **Documentation**

- 📖 [Complete Workflow Guide](./docs/PURCHASE_CREDITS_WORKFLOW.md)
- 📖 [Sequence Diagrams](./docs/PURCHASE_CREDITS_SEQUENCE.md)
- 📖 [Integration Examples](./docs/PURCHASE_CREDITS_EXAMPLES.tsx)
- 📖 [Update Summary](./docs/PURCHASE_CREDITS_UPDATES.md)

### **Key Files**

```
src/
├── lib/
│   ├── academic-chain-client.ts      # Core SDK functions
│   └── wallet-validation.ts          # Validation utilities
├── features/academic/
│   ├── use-purchase-credits.ts       # React hooks
│   └── purchase-credits-card.tsx     # UI component
└── app/academic-credits/page.tsx     # Purchase page
```

## 📚 AcademicChain Frontend Pages

This project includes a complete **dashboard and pages structure** for the AcademicChain educational platform:

### **Pages Implemented**

- 🏠 **Dashboard Home** (`/dashboard`) - Overview with stats, active courses, and certificates
- 💳 **Buy Credits** (`/dashboard/credits/buy`) - Purchase credits with package selection and payment flow
- 📚 **Course List** (`/dashboard/courses`) - Browse courses with search and filters
- 📝 **Course Registration** (`/dashboard/courses/[courseId]/register`) - Enroll in courses with balance validation
- 🏆 **Certificates** (`/dashboard/certificates`) - NFT certificate gallery and graduation tracking

### **Features**

- ✅ Complete mock data workflow (students, courses, enrollments, certificates)
- ✅ Credit purchase system with bonus packages
- ✅ Course browsing with search and difficulty filters
- ✅ Course registration with credit balance validation
- ✅ Certificate NFT gallery with blockchain verification
- ✅ Graduation progress tracking system
- ✅ Responsive design with TailwindCSS + shadcn/ui
- ✅ Type-safe TypeScript throughout
- ✅ Mock API routes for development

### **Mock Data Structure**

Located in `src/lib/mockData.ts`:
- Student profiles with credit balances
- 4 diverse courses (Solana, Web3, Rust, Advanced topics)
- Student enrollments with progress tracking
- Course completion certificates
- Transaction history
- Dashboard metrics

### **Key Files**

```
src/
├── types/index.ts                    # TypeScript interfaces
├── lib/mockData.ts                   # Mock data
├── components/ui/progress.tsx        # Progress bar component
├── app/
│   ├── dashboard/
│   │   ├── layout.tsx               # Sidebar navigation
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── courses/
│   │   │   ├── page.tsx            # Course list
│   │   │   └── [courseId]/register/page.tsx
│   │   ├── credits/buy/page.tsx    # Buy credits
│   │   └── certificates/page.tsx   # Certificates & graduation
│   └── api/mock/                    # Mock API routes
│       ├── courses/route.ts
│       ├── certificates/route.ts
│       └── transactions/route.ts
```

See [.doc/fe.md](./.doc/fe.md) for complete frontend architecture documentation.

## Requirment [Build on APEC education ecosystem using Solana](https://earn.superteam.fun/listing/build-on-apec-education-ecosystem-using-solana)
