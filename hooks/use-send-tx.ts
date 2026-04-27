"use client";

import { useMutation } from "@tanstack/react-query";
import { sendXlm, networkPassphrase } from "@/lib/stellar";
import { StellarWalletsKit } from "@/lib/wallets";

type Input = { to: string; amount: string; memo?: string };

export function useSendTx(address: string | null) {
  return useMutation({
    mutationFn: async (input: Input): Promise<{ hash: string }> => {
      if (!address) throw new Error("connect a wallet first");
      return sendXlm({
        from: address,
        to: input.to,
        amount: input.amount,
        memo: input.memo,
        signXdr: async (xdr) => {
          const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
            address,
            networkPassphrase,
          });
          return signedTxXdr;
        },
      });
    },
  });
}
