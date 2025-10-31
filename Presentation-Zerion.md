# Zerion SDK for Student Profile

---

## Agenda

1.  **Introduction**: What is Zerion SDK?
2.  **Initialization**: How to get started.
3.  **Fetching Data**: Getting a student's on-chain profile.
4.  **Data Deep Dive**: Understanding the profile data.
5.  **Use Case**: Building a rich student profile.

---

## 1. Introduction: What is Zerion SDK?

A powerful toolkit to access on-chain data from multiple blockchains.

- **Wallet Profiling**: Get a complete picture of a user's wallet.
- **Asset Tracking**: Track tokens, NFTs, and DeFi positions.
- **Transaction History**: Access a user's complete transaction history.

---

## 2. Initialization

First, initialize the `ZerionSDK` with your API key.

```typescript
import { ZerionSDK } from '@/lib/zerion-sdk';

const zerion = new ZerionSDK({
  apiKey: 'YOUR_ZERION_API_KEY',
});
```

---

## 3. Fetching a Student's Profile

Use `getPortfolioAnalysis` to get a comprehensive overview of a student's wallet.

```typescript
async function getStudentProfile(walletAddress: string) {
  try {
    const profile = await zerion.getPortfolioAnalysis(walletAddress);
    return profile;
  } catch (error) {
    console.error('Error fetching student profile:', error);
  }
}
```

---

## 4. Data Deep Dive

The `getPortfolioAnalysis` method returns a rich data object:

- **`summary`**: High-level portfolio metrics.
- **`positions`**: All token holdings.
- **`nftPortfolio`**: All NFTs (our certificates!).
- **`recentActivity`**: Latest transactions.
- **`chainDistribution`**: Assets across different chains.
- **`topAssets`**: Most valuable assets.

---

## 5. Use Case: Building a Rich Student Profile

Combine AcademicChain data with Zerion's on-chain data to create a holistic student profile.

- **Display On-Chain Certificates**: Show NFTs from our platform and others.
- **Showcase DeFi Skills**: Display participation in DeFi protocols.
- **Verify On-Chain Activity**: Corroborate a student's experience.

---

## Q&A