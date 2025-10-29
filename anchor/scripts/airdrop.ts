import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

/**
 * Airdrop SOL to a wallet for testing
 */
async function airdropSol(
  connection: Connection,
  publicKey: anchor.web3.PublicKey,
  amount: number = 2
) {
  try {
    console.log(`Requesting airdrop of ${amount} SOL...`);
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    await connection.confirmTransaction(signature);
    console.log(`✅ Airdropped ${amount} SOL to ${publicKey.toString()}`);
    
    const balance = await connection.getBalance(publicKey);
    console.log(`Current balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  } catch (error) {
    console.error("Airdrop failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  
  airdropSol(provider.connection, provider.wallet.publicKey)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { airdropSol };
