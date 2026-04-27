#![no_std]

use soroban_sdk::{
    contract, contractclient, contracterror, contractimpl, contracttype,
    symbol_short, Address, Env, String,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AmountMustBePositive = 1,
    NotInitialized = 2,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Receipt,
    Total(Address),
    Count(Address),
}

#[contractclient(name = "ReceiptClient")]
pub trait ReceiptInterface {
    fn mint(env: Env, to: Address, amount: i128);
}

#[contract]
pub struct TipJar;

#[contractimpl]
impl TipJar {
    pub fn __constructor(env: Env, receipt: Address) {
        env.storage().instance().set(&DataKey::Receipt, &receipt);
    }

    pub fn record_tip(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
        memo: String,
    ) -> Result<(), Error> {
        from.require_auth();
        if amount <= 0 {
            return Err(Error::AmountMustBePositive);
        }

        let total_key = DataKey::Total(to.clone());
        let count_key = DataKey::Count(to.clone());

        let prev_total: i128 = env.storage().persistent().get(&total_key).unwrap_or(0);
        let prev_count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);

        env.storage()
            .persistent()
            .set(&total_key, &(prev_total + amount));
        env.storage()
            .persistent()
            .set(&count_key, &(prev_count + 1));

        // mint a receipt to the tipper. soulbound; just proves they tipped.
        let receipt_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::Receipt)
            .ok_or(Error::NotInitialized)?;
        let receipt = ReceiptClient::new(&env, &receipt_addr);
        receipt.mint(&from, &1i128);

        env.events()
            .publish((symbol_short!("tip"), from, to), (amount, memo));

        Ok(())
    }

    pub fn total_tipped(env: Env, to: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Total(to))
            .unwrap_or(0)
    }

    pub fn tip_count(env: Env, to: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Count(to))
            .unwrap_or(0)
    }

    pub fn receipt_contract(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Receipt)
            .ok_or(Error::NotInitialized)
    }
}

#[cfg(test)]
mod test;
