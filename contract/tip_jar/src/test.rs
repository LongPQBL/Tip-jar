#![cfg(test)]

use super::{Error, TipJar, TipJarClient};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup() -> (Env, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(TipJar, ());
    (env, contract_id)
}

#[test]
fn record_a_tip_increases_total_and_count() {
    let (env, contract_id) = setup();
    let client = TipJarClient::new(&env, &contract_id);

    let from = Address::generate(&env);
    let to = Address::generate(&env);
    let memo = String::from_str(&env, "thanks!");

    client.record_tip(&from, &to, &100_000_000, &memo);

    assert_eq!(client.total_tipped(&to), 100_000_000);
    assert_eq!(client.tip_count(&to), 1);
}

#[test]
fn multiple_tips_accumulate() {
    let (env, contract_id) = setup();
    let client = TipJarClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let recipient = Address::generate(&env);
    let memo = String::from_str(&env, "");

    client.record_tip(&alice, &recipient, &50_000_000, &memo);
    client.record_tip(&bob, &recipient, &75_000_000, &memo);
    client.record_tip(&alice, &recipient, &25_000_000, &memo);

    assert_eq!(client.total_tipped(&recipient), 150_000_000);
    assert_eq!(client.tip_count(&recipient), 3);
}

#[test]
fn negative_amount_returns_error() {
    let (env, contract_id) = setup();
    let client = TipJarClient::new(&env, &contract_id);

    let from = Address::generate(&env);
    let to = Address::generate(&env);
    let memo = String::from_str(&env, "");

    let result = client.try_record_tip(&from, &to, &-1, &memo);
    assert!(matches!(result, Err(Ok(Error::AmountMustBePositive))));
}

#[test]
fn unrelated_addresses_have_zero_total() {
    let (env, contract_id) = setup();
    let client = TipJarClient::new(&env, &contract_id);

    let stranger = Address::generate(&env);
    assert_eq!(client.total_tipped(&stranger), 0);
    assert_eq!(client.tip_count(&stranger), 0);
}
