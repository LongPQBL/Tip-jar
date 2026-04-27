# tip jar

a small stellar dapp on testnet for sending xlm tips. connects a wallet (freighter or anything else via stellar wallets kit), sends the payment, records the tip on a soroban contract, and mints a soulbound "receipt" token to the tipper as proof. live feed of recent tips pulled straight from contract events.

[![ci](https://github.com/LongPQBL/Tip-jar/actions/workflows/ci.yml/badge.svg)](https://github.com/LongPQBL/Tip-jar/actions)

- live: <DEMO_URL>
- demo video: <DEMO_VIDEO_URL>
- tip jar contract: [`CDBKD2U2…SV4Y`](https://stellar.expert/explorer/testnet/contract/CDBKD2U27Y73EI42LC6HMAS53PGVB6CUZK7DFPNWTOODSYOHD6L3SV4Y)
- receipt contract: [`CBO2AVI6…J7XT`](https://stellar.expert/explorer/testnet/contract/CBO2AVI6YI5A27Z3A7WB36544DUM37SZ7QN3G6BMENJQY2YZ5DVVJ7XT)

## what's in here

```
.
├── app/                 # next.js app router (page, layout, providers)
├── components/          # wallet button, balance card, send form, event feed, receipts
├── hooks/               # react query hooks (balance, send, events, receipts)
├── lib/
│   ├── stellar.ts       # horizon client + send-xlm helper
│   ├── soroban.ts       # rpc client + invokeContract + scval helpers
│   ├── wallets.ts       # stellar wallets kit init (4 wallets, lazy, browser-only)
│   ├── events.ts        # getEvents -> TipEvent[]
│   └── errors.ts        # WalletNotFound / UserRejected / InsufficientBalance
├── contract/
│   ├── Cargo.toml       # workspace
│   ├── tip_jar/         # records tips, calls receipt.mint, emits events
│   └── receipt/         # soulbound SEP-41 receipt token
└── scripts/
    └── deploy.sh        # build both, deploy, transfer admin, rewrite .env.local
```

## stack

- next.js 15 + react 19 + tailwind v4 (dark fintech theme)
- @stellar/stellar-sdk (horizon + soroban rpc)
- @creit.tech/stellar-wallets-kit (freighter, xbull, lobstr, albedo)
- soroban-sdk 22 (rust)
- @tanstack/react-query (balance polling, event polling, caching, loading states)

## how it works

every "send tip" click does two on-chain things in sequence:

1. an xlm payment via horizon. the recipient gets the funds.
2. a soroban call to `tip_jar.record_tip(from, to, amount, memo)`. that function:
   - bumps per-recipient totals + count in the tip_jar contract
   - calls `receipt.mint(from, 1)` (inter-contract call) to drop a soulbound receipt token into the tipper's account
   - emits a `tip` event with `(from, to, amount, memo)` so the live feed picks it up

the receipt token is non-transferable on purpose: there's nothing to redeem with it, it's just proof you tipped. open the page in two browsers and a tip from one shows up in the other within ~6 seconds.

```
       wallet
         │
   sign  │  payment + record_tip
         ▼
   ┌─────────────────────────┐         ┌──────────────────┐
   │      tip_jar            │ ──────► │ receipt token    │
   │  - record_tip()         │  mint() │  - mint(to, 1)   │
   │  - total_tipped(addr)   │         │  - balance(addr) │
   │  - tip_count(addr)      │         │  (soulbound)     │
   │  - emits 'tip' event    │         └──────────────────┘
   └─────────────────────────┘
              │
              ▼
        soroban rpc
              │
              ▼
   getEvents → live feed in ui
```

## try it locally

you'll need:

- node 22+
- rust stable + the stellar cli (`stellar` v25+, `wasm32v1-none` target installed)
- a stellar testnet wallet ([freighter](https://www.freighter.app/) is fine; lobstr / albedo / xbull all work via the kit)
- a funded testnet account (freighter has a one-click friendbot)

```bash
git clone https://github.com/LongPQBL/Tip-jar.git
cd Tip-jar
npm install
cp .env.example .env.local
# already has the deployed contract ids; works as is
npm run dev
```

then open http://localhost:3000, hit "connect wallet", pick freighter, send yourself a tip.

## deploying your own contracts

if you want fresh contracts under your own admin key:

```bash
stellar keys generate alice --network testnet --fund   # if you don't have a key
./scripts/deploy.sh alice
```

what the script does:

1. builds both wasms (`stellar contract build` per crate)
2. deploys receipt with the deployer as initial admin
3. deploys tip_jar pointing at receipt
4. calls `receipt.set_admin(tip_jar_address)` so future mints are authorized
5. rewrites `NEXT_PUBLIC_TIP_JAR_CONTRACT_ID` and `NEXT_PUBLIC_RECEIPT_CONTRACT_ID` in `.env.local`
6. prints stellar.expert links to both contracts

## tests

```bash
cargo test
```

12 tests across both contracts:

**tip_jar** (6)

- `record_a_tip_increases_total_and_count`
- `each_tip_mints_a_receipt_to_the_tipper` (verifies the inter-contract call)
- `multiple_tips_accumulate`
- `negative_amount_returns_error`
- `unrelated_addresses_have_zero_total`
- `receipt_contract_address_matches_minter`

**receipt** (6)

- `mint_increases_balance_and_supply`
- `multiple_mints_accumulate`
- `negative_mint_returns_error`
- `unminted_address_has_zero_balance`
- `metadata_is_correct`
- `admin_can_be_transferred`

ci runs them on every push (see `.github/workflows/ci.yml`).

## error handling

three typed errors in `lib/errors.ts` cover the failure modes the wallet kit + horizon throw at us:

- `WalletNotFoundError` — no extension, no kit-supported wallet
- `UserRejectedError` — user closed the popup
- `InsufficientBalanceError` — op_underfunded / not enough xlm

`toError(e)` inspects raw thrown values and maps them. the send form switches on `instanceof` to render a friendly message instead of a stack trace.

## screenshots

| | |
|---|---|
| wallet picker | ![wallet picker](docs/screenshots/wallet-picker.png) |
| balance loaded | ![balance](docs/screenshots/balance.png) |
| sending | ![sending](docs/screenshots/sending.png) |
| sent (payment + on-chain log) | ![sent](docs/screenshots/sent.png) |
| live tip feed | ![events](docs/screenshots/events.png) |
| receipts panel | ![receipts](docs/screenshots/receipts.png) |
| mobile view | ![mobile](docs/screenshots/mobile.png) |
| ci passing | ![ci](docs/screenshots/ci.png) |
| cargo test output | ![tests](docs/screenshots/tests.png) |

## notes

- amounts on the contract are i128 stroops. the frontend converts via `xlmToStroops("1.5")` so there's no float drift.
- the tip_jar contract doesn't move the xlm; the payment goes through a regular horizon op. the contract is the on-chain ledger of "who tipped whom, how much, with what memo" plus the inter-contract mint. simpler than wiring sac transfers, and arguably more honest about what's happening.
- if the second signature is rejected after the payment goes through, the form surfaces both the payment hash and the failure so you can verify funds.
- receipts are soulbound (no transfer function on the receipt contract) because they're just proof, not an asset.
