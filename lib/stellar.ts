import { Horizon, Networks } from "@stellar/stellar-sdk";

const HORIZON_URL =
  process.env.NEXT_PUBLIC_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const networkPassphrase =
  process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? Networks.TESTNET;

export const horizon = new Horizon.Server(HORIZON_URL);

export async function getXlmBalance(publicKey: string): Promise<string> {
  const account = await horizon.loadAccount(publicKey);
  const native = account.balances.find((b) => b.asset_type === "native");
  return native?.balance ?? "0";
}
