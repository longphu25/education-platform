# Privy Integration Guide

This guide explains how to set up and use Privy.io authentication in your edu-app.

## Setup Instructions

### 1. Get Your Privy App ID

1. Visit [Privy.io](https://privy.io) and create an account
2. Create a new app in your Privy dashboard
3. Copy your App ID from the dashboard

### 2. Configure Environment Variables

Add your Privy credentials to `.env.local`:

```bash
# Required: Your Privy App ID
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Optional: Privy App Secret (for server-side operations)
PRIVY_APP_SECRET=your_privy_app_secret_here

# Solana network configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

### 3. Install Required Dependencies

```bash
pnpm add @privy-io/react-auth @privy-io/wagmi
```

## Features

### Authentication Methods (User Identity)
- ✅ Email/Password
- ✅ SMS/Phone
- ✅ Social Logins (Google, Twitter, Discord, GitHub, LinkedIn)
- ❌ Wallet Connect (Disabled - EVM focused)
- ❌ Embedded Wallets (Disabled - EVM focused)

### Integration Points
- **Privy Provider**: Wraps the entire app for authentication context
- **Privy Login Button**: Complete authentication UI component
- **usePrivyAuth Hook**: Custom hook for user identity (separate from Solana wallet)
- **User Status Card**: Shows both Privy auth and Solana wallet status
- **Environment Configuration**: Centralized config management

### Architecture
- **User Identity**: Handled by Privy (email, social, SMS)
- **Solana Transactions**: Handled by existing Wallet UI components
- **Separation of Concerns**: Authentication ≠ Wallet Connection

## Usage

### Basic Authentication

```tsx
import { usePrivyAuth } from '@/components/auth/use-privy-auth'

function MyComponent() {
  const { authenticated, user, login, logout } = usePrivyAuth()
  
  if (!authenticated) {
    return <button onClick={login}>Login with Privy</button>
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Combined Auth + Solana Status

```tsx
import { usePrivyAuth } from '@/components/auth/use-privy-auth'
import { UserStatusCard } from '@/components/auth/user-status-card'

function MyComponent() {
  const { authenticated, getUserDisplayName, solana } = usePrivyAuth()
  const { account } = solana
  
  return (
    <div>
      <UserStatusCard />
      
      {authenticated && account && (
        <div>
          <p>User: {getUserDisplayName()}</p>
          <p>Wallet: {account.address}</p>
          <p>Ready for transactions!</p>
        </div>
      )}
    </div>
  )
}
```

## Configuration

### Customize Appearance

Edit `src/lib/privy-config.ts`:

```typescript
export const privyConfig = {
  appearance: {
    theme: 'dark', // 'light' | 'dark'
    accentColor: '#your-color' as `#${string}`,
    logo: 'https://your-logo-url.com/logo.png',
  },
  loginMethods: ['email', 'wallet', 'google'], // Customize available methods
  // ... other options
}
```

### Enable/Disable Features

```typescript
features: {
  email: true,
  sms: true, // SMS authentication
  socialLogins: true,
  walletConnect: false, // Disabled for Solana - use separate wallet UI
  embeddedWallets: false, // Disabled - EVM focused
}
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **App Secret**: Only use `PRIVY_APP_SECRET` on the server side
3. **HTTPS**: Always use HTTPS in production
4. **Validation**: Validate user sessions on your backend

## Troubleshooting

### Common Issues

1. **"App ID not found"**: Check your `.env.local` file
2. **Build errors**: Ensure all dependencies are installed
3. **Authentication not working**: Verify your App ID in Privy dashboard

### Debug Mode

Enable debug logging by adding to your environment:

```bash
NEXT_PUBLIC_DEBUG_PRIVY=true
```

## Integration with Solana

The Privy integration is designed to work alongside existing Solana wallet connections:

1. Users can authenticate with Privy (email, social, etc.)
2. Create embedded wallets for Solana transactions
3. Link external Solana wallets to their Privy account
4. Seamless experience between traditional auth and crypto wallets

## Support

- [Privy Documentation](https://docs.privy.io)
- [Privy Discord](https://discord.gg/privy)
- [GitHub Issues](https://github.com/your-repo/issues)