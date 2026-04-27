import { rpc, xdr, scValToNative } from "@stellar/stellar-sdk";
import { sorobanRpc } from "./soroban";

export type TipEvent = {
  id: string;
  ledger: number;
  ledgerClosedAt: string;
  txHash: string;
  from: string;
  to: string;
  amount: bigint;
  memo: string;
};

export async function getRecentTipEvents(
  contractId: string,
  windowLedgers = 5000
): Promise<TipEvent[]> {
  const latest = await sorobanRpc.getLatestLedger();
  const startLedger = Math.max(1, latest.sequence - windowLedgers);

  const tipTopic = xdr.ScVal.scvSymbol("tip").toXDR("base64");
  const res = await sorobanRpc.getEvents({
    startLedger,
    filters: [
      {
        type: "contract",
        contractIds: [contractId],
        topics: [[tipTopic, "*", "*"]],
      },
    ],
    limit: 50,
  });

  return res.events.map(decodeTipEvent).reverse();
}

function decodeTipEvent(e: rpc.Api.EventResponse): TipEvent {
  const from = scValToNative(e.topic[1]) as string;
  const to = scValToNative(e.topic[2]) as string;
  const value = scValToNative(e.value) as [bigint, string] | [bigint];
  return {
    id: e.id,
    ledger: e.ledger,
    ledgerClosedAt: e.ledgerClosedAt,
    txHash: e.txHash,
    from,
    to,
    amount: BigInt(value[0]),
    memo: (value[1] as string) ?? "",
  };
}
