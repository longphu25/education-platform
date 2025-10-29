import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo 
} from "@solana/spl-token";

/**
 * Mint test tokens for development/testing
 */
async function mintTestTokens(
  connection: anchor.web3.Connection,
  payer: anchor.web3.Keypair,
  mintAuthority: anchor.web3.PublicKey,
  decimals: number = 9
) {
  try {
    console.log("Creating test token mint...");
    
    // Create mint
    const mint = await createMint(
      connection,
      payer,
      mintAuthority,
      null,
      decimals
    );

    console.log(`✅ Token mint created: ${mint.toString()}`);

    // Create token account for payer
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mint,
      payer.publicKey
    );

    console.log(`✅ Token account created: ${tokenAccount.address.toString()}`);

    // Mint some tokens
    const amount = 1000 * Math.pow(10, decimals);
    await mintTo(
      connection,
      payer,
      mint,
      tokenAccount.address,
      mintAuthority,
      amount
    );

    console.log(`✅ Minted ${amount / Math.pow(10, decimals)} tokens`);

    return {
      mint,
      tokenAccount: tokenAccount.address,
    };
  } catch (error) {
    console.error("Failed to mint test tokens:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const payer = (provider.wallet as anchor.Wallet).payer;
  
  mintTestTokens(
    provider.connection,
    payer,
    payer.publicKey
  )
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { mintTestTokens };
