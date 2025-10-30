# 🧠 Memory Context - Edu App

## 🎯 **Project Overview**
This is a **Solana-based educational application** built for the APEC education ecosystem hackathon. It's a full-stack DApp demonstrating a counter program with modern web technologies.

## 🏗️ **Architecture Stack**

### **Frontend (Next.js 15)**
- **Framework**: Next.js 15 with Turbopack and React 19
- **Styling**: Tailwind CSS + Shadcn UI + Reka UI components
- **State Management**: Jotai for global state, React Query for server state
- **Wallet Integration**: Wallet UI components with Gill Solana SDK
- **Theme**: Dark/light mode support with next-themes

### **AcademicChain Pages Structure**
- **Dashboard System**: Complete educational platform UI
  - Dashboard Home with stats and quick actions
  - Credit purchase system with package selection
  - Course browsing with search and filters
  - Course registration with balance validation
  - Certificate NFT gallery with graduation tracking
- **Mock Data**: Comprehensive mock data for development
  - Students, courses, enrollments, certificates, transactions
  - 4 diverse courses (Solana, Web3, Rust, Advanced)
  - Progress tracking and completion certificates
- **API Routes**: Mock API endpoints for courses, certificates, transactions

### **Blockchain (Solana)**
- **Program**: Anchor-based Rust program (`eduapp`)
- **Program ID**: `Count3AcZucFDPSFBAeHkQ6AvttieKUkyJ8HiQGhQwe`
- **Functionality**: Simple counter with increment/decrement/set/close operations
- **Account Structure**: Single `Eduapp` account storing a `u8` count value

### **Development Tools**
- **SDK Generation**: Codama for generating TypeScript client from IDL
- **Package Manager**: PNPM
- **Testing**: Vitest + Anchor testing framework
- **Code Quality**: ESLint + Prettier

## 📁 **Key File Structure**

### **Anchor Program** (`/anchor/`)
- `programs/eduapp/src/lib.rs` - Main Rust program with 5 instructions
- `target/idl/eduapp.json` - Generated IDL
- `target/types/eduapp.ts` - TypeScript types
- `src/eduapp-exports.ts` - Custom exports and helper functions

### **Frontend** (`/src/`)

- **App Structure**:
  - `app/layout.tsx` - Root layout with providers
  - `app/page.tsx` - Home page
  - `app/eduapp/page.tsx` - Main program interface
  - `app/account/` - Account management pages

- **AcademicChain Dashboard** (`/app/dashboard/`):
  - `layout.tsx` - Dashboard layout with sidebar navigation
  - `page.tsx` - Dashboard home with stats and quick actions
  - `courses/page.tsx` - Course browsing with search and filters
  - `courses/[courseId]/register/page.tsx` - Course registration flow
  - `credits/buy/page.tsx` - Credit purchase system
  - `certificates/page.tsx` - NFT certificates and graduation tracking

- **Type Definitions** (`/types/`):
  - Student, Course, CourseEnrollment, Certificate, Transaction interfaces
  - Complete TypeScript type coverage for educational platform

- **Mock Data** (`/lib/mockData.ts`):
  - Comprehensive mock data for development
  - Students, courses, enrollments, certificates, transactions
  - 4 diverse courses: Solana fundamentals, Advanced Solana, Web3 Frontend, Rust for Blockchain

- **Features** (Modular architecture):
  - `features/eduapp/` - Main program interaction logic
    - `data-access/` - React Query hooks and mutations
    - `ui/` - Program-specific UI components
  - `features/account/` - Wallet account management
  - `features/cluster/` - Solana cluster management

- **Components**:
  - `components/` - Reusable UI components
  - `components/solana/` - Solana-specific components
  - `components/ui/` - Shadcn UI components

## 🔄 **Core Data Flow**

### **Program Interaction Pattern**:
```
UI Component → Mutation Hook → Generated Instruction → Wallet Sign → Blockchain
```

### **State Management**:
- React Query for caching blockchain data
- Automatic invalidation after mutations
- Toast notifications for transaction status

### **Wallet Integration**:
- Wallet UI components for connection/disconnection
- Gill SDK for Solana client operations
- Mobile wallet adapter support

## 🎮 **Program Operations**

The `eduapp` program supports:
- **Initialize**: Create new counter account (requires payer signature)
- **Increment**: Add 1 to counter (checked_add for safety)
- **Decrement**: Subtract 1 from counter (checked_sub for safety)
- **Set**: Set counter to specific value (u8 parameter)
- **Close**: Close account and reclaim rent to payer

### **Account Structure**:
```rust
#[account]
#[derive(InitSpace)]
pub struct Eduapp {
    count: u8,
}
```

## 🚀 **Development Workflow**

### **Setup Commands**:
- `npm run setup` - Sync program ID and build everything
- `npm run anchor-build` - Build Anchor program
- `npm run anchor-localnet` - Start local validator with deployed program
- `npm run anchor-test` - Run Anchor tests
- `npm run codama:js` - Regenerate TypeScript client from IDL

### **Frontend Commands**:
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run format` - Prettier formatting

## 📦 **Key Dependencies**

### **Blockchain**:
- `gill` (v0.11.0) - Solana SDK
- `@wallet-ui/react` & `@wallet-ui/react-gill` - Wallet components
- `codama` - IDL to TypeScript generation

### **Frontend**:
- `next` (v15.5.6) - React framework
- `@tanstack/react-query` (v5.89.0) - Server state management
- `jotai` (v2.14.0) - Client state management
- `tailwindcss` (v4.1.13) - Styling
- `reka-ui` (v2.6.0) - Additional UI components

## 🎨 **UI Component Architecture**

### **Feature-based Organization**:
Each feature has its own `data-access/` and `ui/` folders:

- **Data Access Hooks**:
  - `use-eduapp-program.ts` - Program account query
  - `use-eduapp-accounts-query.ts` - All program accounts
  - `use-eduapp-*-mutation.ts` - Individual instruction mutations

- **UI Components**:
  - `eduapp-ui-list.tsx` - List all accounts
  - `eduapp-ui-card.tsx` - Individual account display
  - `eduapp-ui-button-*.tsx` - Action buttons for each instruction

## 🔧 **Generated Code Pattern**

The project uses Codama to generate TypeScript bindings:
- IDL → TypeScript types and instruction builders
- Automatic discriminator handling
- Type-safe instruction creation
- Account decoder utilities

## 🌐 **Deployment Context**

- **Template Source**: Solana Foundation's fullstack counter boilerplate
- **Target**: APEC education ecosystem
- **Purpose**: Educational demonstration of Solana DApp development
- **Deployment**: Supports local, devnet, and mainnet clusters

## 📝 **Development Notes**

- Uses modern React patterns (hooks, suspense-ready)
- Type-safe throughout with TypeScript
- Responsive design with Tailwind
- Error boundaries for graceful failure handling
- BigInt serialization patch for JSON logging
- Mobile wallet support included

## 🎓 **AcademicChain Educational Platform**

### **Complete Dashboard System**

The project includes a full educational platform dashboard with:

- **Dashboard Home**: Overview with stats (credits, active courses, certificates, progress)
- **Credit System**: Purchase credits with bonus packages (10, 25, 50, 100 credits)
- **Course Management**: 
  - Browse courses with search and difficulty filters
  - Course registration with balance validation
  - Progress tracking for enrolled courses
- **Certificate System**:
  - NFT certificate gallery with blockchain verification
  - Graduation progress tracking (5 courses required)
  - Completion status and grades

### **Mock Data Architecture**

Complete mock data for development (`src/lib/mockData.ts`):
- **Students**: Profile with credit balance and completion stats
- **Courses**: 4 diverse courses (Solana Fundamentals, Advanced Solana, Web3 Frontend, Rust for Blockchain)
- **Enrollments**: Progress tracking with completion status
- **Certificates**: Course completion certificates with grades and mint addresses
- **Transactions**: Credit purchases, course registrations, certificate minting

### **UI Implementation**

- Sidebar navigation with active route highlighting
- Responsive card-based layouts
- Progress bars for course and graduation tracking
- Badge system for status indicators
- Search and filter functionality
- Mock transaction flows with loading states

### **Ready for Blockchain Integration**

All pages are designed to integrate with real Solana programs:
- Type-safe interfaces for blockchain data
- Mock API routes ready to be replaced with real queries
- Transaction patterns implemented
- Wallet integration points prepared

---

*Updated on October 29, 2025 - Solana Edu App Memory Context with AcademicChain Dashboard*