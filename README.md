# edu-app

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

### Installation

#### Download the template

```shell
npx create-solana-dapp@latest -t gh:solana-foundation/templates/gill/edu-app
```

#### Install Dependencies

```shell
npm install
```

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

## Requirment [Build on APEC education ecosystem using Solana](https://earn.superteam.fun/listing/build-on-apec-education-ecosystem-using-solana)
