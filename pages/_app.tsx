import React, { useState } from "react";
import { Cluster, Keypair } from "@solana/web3.js";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { DropAccount, GlobalContext } from "../context";
import { Layout } from "../components/layout";
import { drop, getBalance } from "../utils";

function MyApp({ Component, pageProps }: AppProps) {
  const [network, setNetwork] = useState<Cluster>("devnet");
  const [account, setAccount] = useState<Keypair | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [dropAccounts, setDropAccounts] = useState<DropAccount[]>([]);
  const [beforeMap, setBeforeMap] = useState<{ [key in string]: number }>({});
  const [afterMap, setAfterMap] = useState<{ [key in string]: number }>({});

  const onDropAccountSet = (accounts: DropAccount[]) => {
    setDropAccounts(accounts);

    accounts.reduce(async (agg, { accountId }) => {
      const balanceMap = await agg;
      const balance = await getBalance(network, accountId);
      setBeforeMap({ ...balanceMap, [accountId]: balance });

      return { ...balanceMap, [accountId]: balance };
    }, Promise.resolve({}));
  };

  const onDrop = async (accounts: DropAccount[]) => {
    if (!account) {
      return "";
    }
    const signature = await drop(network, account, accounts);

    accounts.reduce(async (agg, { accountId }) => {
      const balanceMap = await agg;
      const balance = await getBalance(network, accountId);
      setAfterMap({ ...balanceMap, [accountId]: balance });

      return { ...balanceMap, [accountId]: balance };
    }, Promise.resolve({}));
    return signature;
  };

  return (
    <GlobalContext.Provider
      value={{
        network,
        setNetwork,
        account,
        setAccount,
        mnemonic,
        setMnemonic,
        balance,
        setBalance,
        dropAccounts,
        setDropAccounts: onDropAccountSet,
        beforeMap,
        afterMap,
        drop: onDrop,
      }}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </GlobalContext.Provider>
  );
}
export default MyApp;
