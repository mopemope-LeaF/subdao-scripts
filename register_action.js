// Required imports
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import voteAbi from './target/auth_v0.1.json';

import { cryptoWaitReady } from '@polkadot/util-crypto';

const keyring = new Keyring({ type: 'sr25519' });
const address = "5FixYvpokhmmkKUYBCpoQ5hHNmM6aFPP69vG6vwvJ8p7BoNt";
const provider = new WsProvider('ws://39.101.70.206:39944');
const gasLimit = 100000n * 1000000n;

async function register_action(api, contract_name, function_name, action) {
    let abi = voteAbi;
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);
    let alicePair = keyring.createFromUri('//Alice');

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);

    // call auth register actions
    const authContract = new ContractPromise(api, abi, address);
    console.log("======= begin to call auth contrace code");
    let nonce = await api.rpc.system.accountNextIndex(alicePair.address);
    await authContract.tx.registerAction({value: 0, gasLimit}, contract_name, function_name, action)
    .signAndSend(alicePair, { nonce: nonce }, (result) => {
        if (result.status.isFinalized) {
            console.log('inblock', result);
        } else {
            console.log('result');
        }
    });
}

async function query_contract_actions(api, contract_name) {
    let abi = voteAbi;
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);
    let alicePair = keyring.createFromUri('//Alice');

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
    const authContract = new ContractPromise(api, abi, address);
    console.log("======= begin to query auth actions"); 

    let data = await authContract.query.showActionsByContract(alicePair.address, {value: 0, gasLimit}, contract_name);
    console.log(data);
}

// main().catch(console.error).finally(() => process.exit());
(async () => {
    await cryptoWaitReady(); // wait for crypto initializing
    const api = await ApiPromise.create({ provider: provider, types: { "Address": "MultiAddress", "LookupSource": "MultiAddress" } });
    // let _ = await register_action(api, "hello", "world", "access");
    await query_contract_actions(api, 'hello');
})();