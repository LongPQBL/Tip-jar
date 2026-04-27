"use client";

import { useMutation } from "@tanstack/react-query";
import { sendXlm, networkPassphrase } from "@/lib/stellar";
import {
  invokeContract,
  addrArg,
  i128Arg,
  strArg,
  xlmToStroops,
} from "@/lib/soroban";
import { StellarWalletsKit } from "@/lib/wallets";

type Input = { to: string; amount: string; memo?: string };
type Output = { paymentHash: string; contractHash: string };

export function useSendTx(address: string | null) {
  return useMutation({
    mutationFn: async (input: Input): Promise<Output> => {
      if (!address) throw new Error("connect a wallet first");

      const contractId = process.env.NEXT_PUBLIC_TIP_JAR_CONTRACT_ID;
      if (!contractId) {
        throw new Error("NEXT_PUBLIC_TIP_JAR_CONTRACT_ID is not set");
      }

      const sign = async (xdr: string) => {
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
          address,
          networkPassphrase,
        });
        return signedTxXdr;
      };

      const payment = await sendXlm({
        from: address,
        to: input.to,
        amount: input.amount,
        memo: input.memo,
        signXdr: sign,
      });

      try {
        const contract = await invokeContract({
          contractId,
          method: "record_tip",
          args: [
            addrArg(address),
            addrArg(input.to),
            i128Arg(xlmToStroops(input.amount)),
            strArg(input.memo ?? ""),
          ],
          source: address,
          signXdr: sign,
        });
        return { paymentHash: payment.hash, contractHash: contract.hash };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        throw new Error(
          `payment sent (${payment.hash}) but on-chain log failed: ${msg}`
        );
      }
    },
  });
}
