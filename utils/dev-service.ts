import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  Mint,
  mintTo,
} from "@solana/spl-token";
import {
  Cluster,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

const mintMore = async (
  cluster: Cluster,
  account: Keypair,
  mint: Mint,
  amount: bigint
) => {
  const payer = account;
  const mintAuthority = account;

  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint.address,
    payer.publicKey
  );

  await mintTo(
    connection,
    payer,
    mint.address,
    tokenAccount.address,
    mintAuthority,
    amount * BigInt(Math.pow(10, mint.decimals))
  );

  return mint;
};

const mint = async (
  cluster: Cluster,
  account: Keypair,
  amount: bigint,
  decimals: number
): Promise<Mint> => {
  const payer = account;
  const mintAuthority = account;
  const freezeAuthority = account;

  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    decimals
  );

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    mintAuthority,
    amount * BigInt(Math.pow(10, decimals))
  );

  return getMint(connection, mint);
};

const drop = async (
  cluster: Cluster,
  account: PublicKey | null
): Promise<void> => {
  // This line ensures the function returns before running if no account has been set
  if (!account || cluster !== "devnet") return;

  try {
    const connection = new Connection(clusterApiUrl(cluster), "confirmed");
    const airdropSignature = await connection.requestAirdrop(
      account,
      LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature, "confirmed");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Error";
    throw new Error(`Airdrop failed: ${errorMessage}`);
  }
};

export const DevService = { mint, mintMore, drop };
