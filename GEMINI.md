# GEMINI.md

## Project Overview

This is a full-stack decentralized application (dApp) built on the Solana blockchain. The frontend is a Next.js application using React, TypeScript, and Tailwind CSS for styling. The backend is a Solana program written in Rust using the Anchor framework. The program implements a simple counter that can be incremented, decremented, and set to a specific value. The frontend provides a user interface for interacting with this on-chain program.

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

*   The project uses Prettier for code formatting.
*   ESLint is used for linting the code.
*   The frontend code is organized into features, with each feature having its own data access and UI components.
*   The project uses `codama` to generate a JavaScript/TypeScript SDK for the Anchor program.
