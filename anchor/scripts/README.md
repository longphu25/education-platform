# Anchor Scripts

This directory contains utility scripts for managing the Academic Chain program.

## Available Scripts

### 🚀 init-simple.ts

Initialize the Academic Chain program on devnet (recommended). This must be run before any transactions can be made.

```bash
cd anchor
npx tsx scripts/init-simple.ts
```

**What it does:**
- Creates the program configuration PDA
- Creates the credit token mint
- Configures the treasury and authority  
- Sets the credit price (default from program)

**Requirements:**
- Solana CLI keypair at `~/.config/solana/id.json`
- At least 0.1 SOL in your wallet for transaction fees
- Program deployed to devnet
- Anchor workspace configured

**Output:**
- Creates `treasury.json` (keep this safe!)
- Displays program configuration
- Provides transaction signature and explorer link

### 🚀 initialize-program.ts (Advanced)

Alternative initialization using Gill SDK directly.

```bash
cd anchor
npx tsx scripts/initialize-program.ts
```

### 🔍 check-program-init.ts

Check if the program is initialized and view its configuration.

```bash
npx tsx scripts/check-program-init.ts
```

**What it does:**
- Derives the config PDA
- Checks if the account exists
- Displays configuration if initialized
- Provides troubleshooting guidance if not

### 💰 airdrop.ts

Request SOL airdrops on devnet for testing.

```bash
npx tsx scripts/airdrop.ts
```

### 🎓 create_course.ts

Create a test course in the academic chain.

```bash
npx tsx scripts/create_course.ts
```

### 🪙 mint_test_tokens.ts

Mint test credit tokens for development.

```bash
npx tsx scripts/mint_test_tokens.ts
```

### 🧪 test_purchase_credits.ts

Comprehensive test script for the purchase credits functionality. Tests the complete flow from airdrop to profile verification.

```bash
npx tsx scripts/test_purchase_credits.ts
```

**What it does:**
1. Fetches program configuration from devnet
2. Generates a new test student keypair
3. Airdrops 2 SOL to the student account
4. Purchases 10 credits (first transaction)
5. Verifies student profile creation
6. Purchases 10 more credits (second transaction)
7. Verifies final profile state with 20 total credits

**Requirements:**
- Program must be initialized on devnet (run `init-simple.ts` first)
- Internet connection for devnet RPC access
- Takes ~15-20 seconds to complete

**Output:**
- Detailed step-by-step progress logs
- Transaction signatures and explorer links
- Student profile verification
- Total cost summary

**Example Output:**
```
🎓 Academic Chain - Purchase Credits Test

Network: Devnet
RPC: https://api.devnet.solana.com
────────────────────────────────────────────────────────────

📋 Step 1: Fetching program configuration...
✓ Config loaded
  Credit Price: 0.001 SOL
  Treasury: 7xK...abc
  Credit Mint: 8yH...xyz

👤 Step 2: Setting up student account...
  Student Address: 9zM...def

💰 Step 3: Requesting airdrop...
✓ Airdrop successful: 5fK...ghi
  Student Balance: 2 SOL

🛒 Step 4: Purchasing 10 credits...
  Total Cost: 0.01 SOL
✓ Purchase successful!
  Transaction: 3aL...jkl
  Explorer: https://explorer.solana.com/tx/3aL...jkl?cluster=devnet

📊 Step 5: Verifying student profile...
✓ Student profile created
  Total Credits Purchased: 10
  Created At: 2025-10-30T...

🛒 Step 6: Purchasing 10 more credits...
✓ Second purchase successful!
  Transaction: 4bM...mno
  Explorer: https://explorer.solana.com/tx/4bM...mno?cluster=devnet

📊 Final Verification...
✓ Student profile updated
  Total Credits Purchased: 20
  Expected: 20

────────────────────────────────────────────────────────────
✅ All tests passed!

💡 Summary:
  - Student Address: 9zM...def
  - Total Credits Purchased: 20
  - Total Cost: 0.02 SOL
  - Transactions:
    1. 3aL...jkl
    2. 4bM...mno
```

**Use Cases:**
- Verify program is working correctly
- Test end-to-end purchase flow
- Generate test data for development
- Validate recent changes haven't broken functionality
- Debug transaction issues

**Troubleshooting:**
- If "Program not initialized" error: Run `init-simple.ts` first
- If airdrop fails: Wait 30 seconds and try again (rate limits)
- If transaction fails: Check devnet status and your RPC connection

## Quick Start Guide

### First Time Setup

1. **Deploy the program:**
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
   npx tsx scripts/check-program-init.ts
   ```

5. **Start the web app:**
   ```bash
   cd ..
   npm run dev
   ```

### Troubleshooting

#### "Program not initialized" error

Run the initialization script:
```bash
cd anchor
npx tsx scripts/init-simple.ts
```

#### "Insufficient funds" error

Request SOL from devnet:
```bash
solana airdrop 2 --url devnet
```

#### "Account not found" error

Make sure the program is deployed:
```bash
solana program show 9HuNte7WjS8GVHBKpE42y1QXq4C7e6uNvtjmDRM1G99F --url devnet
```

If not deployed:
```bash
cd anchor
anchor build
anchor deploy --provider.cluster devnet
```

#### Check your wallet balance

```bash
solana balance --url devnet
```

## Important Files

- **treasury.json** - Treasury keypair (created by initialize-program.ts)
  - ⚠️ Keep this secure in production!
  - Receives SOL payments from credit purchases

- **~/.config/solana/id.json** - Your Solana CLI keypair
  - Used as the program authority
  - Must have SOL for transaction fees

## Program Configuration

After initialization, the program will have:

- **Config PDA**: Derived from `["config"]`
- **Credit Price**: 0.01 SOL per credit (10,000,000 lamports)
- **Authority**: Your Solana CLI keypair
- **Treasury**: Generated keypair (saved to treasury.json)
- **Credit Mint**: SPL Token mint for academic credits

## Development Workflow

1. Make changes to the program
2. Rebuild: `anchor build`
3. Redeploy: `anchor deploy --provider.cluster devnet`
4. If you need to reinitialize, you'll need to use a new program ID
   (or close the existing config account)

## Testing

Run all tests:
```bash
anchor test
```

Run specific test:
```bash
anchor test --skip-deploy -- --run academic_chain.test.ts
```

## Local Development

For faster iteration, use a local validator:

```bash
# Terminal 1: Start validator
solana-test-validator

# Terminal 2: Deploy and test
cd anchor
anchor build
anchor deploy --provider.cluster localnet
npx tsx scripts/initialize-program.ts  # Update RPC to localhost

# Terminal 3: Run web app
npm run dev
```

## Production Deployment

When deploying to mainnet:

1. Update all RPC URLs to mainnet
2. Use a secure keypair management system
3. Set appropriate credit prices
4. Secure the treasury keypair
5. Consider multi-sig for authority
6. Test thoroughly on devnet first!

## Need Help?

- Check the [troubleshooting guide](../../docs/PROGRAM_INITIALIZATION.md)
- Review the [purchase credits workflow](../../docs/PURCHASE_CREDITS_WORKFLOW.md)
- Look at test files in `anchor/tests/`
- Check program logs: `solana logs --url devnet`
