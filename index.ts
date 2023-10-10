import { log, parseFile } from "./src/other.js";
import { GetBalance, GetEstimateGas, GetWallet, SendTx } from "./src/tools.js";
import { config } from "./config.js";
import { dataClaimRewards, getDelegatorValidators } from "./src/distribution.js";
import { dataDelegate } from "./src/staking.js";

const mnemonic = parseFile('mnemonic.txt')[0];

const ClaimRewards = async(mnemonic: string) => {
    const rpc = config.rpc;
    const address = (await GetWallet(rpc, mnemonic)).address;
    const validators = await getDelegatorValidators(address);

    let dataMsg = [];
    for (let validator of validators) {
        const msg = await dataClaimRewards(address, validator);
        dataMsg.push(msg);
    }
    const result = await SendTx(rpc, dataMsg, mnemonic);

    return { result }
}

const DelegateTokens = async(mnemonic: string) => {
    const rpc = config.rpc;
    const address = (await GetWallet(rpc, mnemonic)).address;
    const validator = config.stakingValidator;

    const balance = parseInt((await GetBalance(rpc, address)).amount);
    let msg = await dataDelegate(address, validator, '1000');
    const gasLimit = await GetEstimateGas(rpc, [msg], mnemonic);
    const fee = Math.floor(gasLimit * 0.3);
    const amount = balance - Math.floor(balance * 0.99) >= fee ? Math.floor(balance * 0.99) : balance - fee;
    if (amount <= 0) {
        log('warn', 'There\'s not enough balance', 'red');
        return;
    }

    msg = await dataDelegate(address, validator, amount.toString());
    const result = await SendTx(rpc, [msg], mnemonic);

    return { result, amount}
}

(async() => {

})();