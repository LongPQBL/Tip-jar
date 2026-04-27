#![cfg(test)]

use super::{Error, TipJar, TipJarClient};
use receipt_token::{ReceiptToken, ReceiptTokenClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

struct Ctx<'a> {
    env: Env,
    tip_jar: TipJarClient<'a>,
    receipt: ReceiptTokenClient<'a>,
}

fn setup<'a>() -> Ctx<'a> {
    let env = Env::default();
    env.mock_all_auths();

    // deploy receipt with a placeholder admin
    let placeholder = Address::generate(&env);
    let receipt_id = env.register(ReceiptToken, (placeholder,));

    // deploy tip_jar pointing at the receipt
    let tip_jar_id = env.register(TipJar, (receipt_id.clone(),));

    // hand the receipt's admin role over to tip_jar so it can mint
    let receipt = ReceiptTokenClient::new(&env, &receipt_id);
    receipt.set_admin(&tip_jar_id);

    Ctx {
        tip_jar: TipJarClient::new(&env, &tip_jar_id),
        receipt,
        env,
    }
}

#[test]
fn record_a_tip_increases_total_and_count() {
    let ctx = setup();
    let from = Address::generate(&ctx.env);
    let to = Address::generate(&ctx.env);
    let memo = String::from_str(&ctx.env, "thanks!");

    ctx.tip_jar.record_tip(&from, &to, &100_000_000, &memo);

    assert_eq!(ctx.tip_jar.total_tipped(&to), 100_000_000);
    assert_eq!(ctx.tip_jar.tip_count(&to), 1);
}

#[test]
fn each_tip_mints_a_receipt_to_the_tipper() {
    let ctx = setup();
    let from = Address::generate(&ctx.env);
    let to = Address::generate(&ctx.env);
    let memo = String::from_str(&ctx.env, "");

    ctx.tip_jar.record_tip(&from, &to, &50_000_000, &memo);
    ctx.tip_jar.record_tip(&from, &to, &10_000_000, &memo);
    ctx.tip_jar.record_tip(&from, &to, &5_000_000, &memo);

    // 3 tips -> 3 receipts to the tipper
    assert_eq!(ctx.receipt.balance(&from), 3);
    assert_eq!(ctx.receipt.total_supply(), 3);
}

#[test]
fn multiple_tips_accumulate() {
    let ctx = setup();
    let alice = Address::generate(&ctx.env);
    let bob = Address::generate(&ctx.env);
    let recipient = Address::generate(&ctx.env);
    let memo = String::from_str(&ctx.env, "");

    ctx.tip_jar.record_tip(&alice, &recipient, &50_000_000, &memo);
    ctx.tip_jar.record_tip(&bob, &recipient, &75_000_000, &memo);
    ctx.tip_jar.record_tip(&alice, &recipient, &25_000_000, &memo);

    assert_eq!(ctx.tip_jar.total_tipped(&recipient), 150_000_000);
    assert_eq!(ctx.tip_jar.tip_count(&recipient), 3);
    assert_eq!(ctx.receipt.balance(&alice), 2);
    assert_eq!(ctx.receipt.balance(&bob), 1);
}

#[test]
fn negative_amount_returns_error() {
    let ctx = setup();
    let from = Address::generate(&ctx.env);
    let to = Address::generate(&ctx.env);
    let memo = String::from_str(&ctx.env, "");

    let result = ctx.tip_jar.try_record_tip(&from, &to, &-1, &memo);
    assert!(matches!(result, Err(Ok(Error::AmountMustBePositive))));
}

#[test]
fn unrelated_addresses_have_zero_total() {
    let ctx = setup();
    let stranger = Address::generate(&ctx.env);
    assert_eq!(ctx.tip_jar.total_tipped(&stranger), 0);
    assert_eq!(ctx.tip_jar.tip_count(&stranger), 0);
}

#[test]
fn receipt_contract_address_matches_minter() {
    let ctx = setup();
    let from = Address::generate(&ctx.env);
    let to = Address::generate(&ctx.env);
    ctx.tip_jar
        .record_tip(&from, &to, &1, &String::from_str(&ctx.env, ""));

    // tip_jar exposes the configured receipt contract; calling balance on
    // that address should match what record_tip just minted.
    let cfg = ctx.tip_jar.receipt_contract();
    let direct = ReceiptTokenClient::new(&ctx.env, &cfg);
    assert_eq!(direct.balance(&from), 1);
}
