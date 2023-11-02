import { log, parseFile, timeout } from "./src/other.js";
import { GetBalance, GetEstimateGas, GetWallet, SendTx } from "./src/tools.js";
import { config } from "./config.js";
import { dataClaimRewards, getDelegatorValidators } from "./src/distribution.js";
import { dataDelegate } from "./src/staking.js";
import { EncodeObject, coins } from "@cosmjs/proto-signing";

const ClaimRewards = async(mnemonic: string) => {
    const rpc = config.rpc;
    const address = (await GetWallet(rpc, mnemonic)).address;
    const validators = await getDelegatorValidators(address);

    let dataMsg: EncodeObject[] = [];
    for (let validator of validators) {
        const msg = await dataClaimRewards(address, validator);
        dataMsg.push(msg);
    }
    const gasLimit = (Math.floor(await GetEstimateGas(rpc, dataMsg, mnemonic) * 1.2)).toString();
    const amountFee = Math.ceil(Number(gasLimit) * Number(config.gasPrice));
    const result = await SendTx(rpc, dataMsg, mnemonic, { amount: coins(amountFee, config.coin), gas: gasLimit }, '');

    return result
}

const DelegateTokens = async(mnemonic: string) => {
    const rpc = config.rpc;
    const address = (await GetWallet(rpc, mnemonic)).address;
    const validator = config.stakingValidator;

    const balance = parseInt((await GetBalance(rpc, address)).amount);
    let msg = await dataDelegate(address, validator, '1000');
    const gasLimit = Math.floor(await GetEstimateGas(rpc, [msg], mnemonic) * 1.2);
    const fee = Math.floor(gasLimit * Number(config.gasPrice) * 10);
    const amount = balance - Math.floor(balance * 0.99) >= fee ? Math.floor(balance * 0.99) : balance - fee;
    if (amount <= 0) {
        log('warn', 'There\'s not enough balance', 'red');
        return;
    }

    msg = await dataDelegate(address, validator, amount.toString());
    const amountFee = Math.ceil(gasLimit * Number(config.gasPrice)) + 1;;
    const result = await SendTx(rpc, [msg], mnemonic, { amount: coins(amountFee, config.coin), gas: gasLimit.toString() }, '');

    return { result, amount }
}

(async() => {
    const mnemonic = parseFile('mnemonic.txt');
    const pauseTime = config.pauseTime * 1000;

    while(true) {
        for (let i = 0; i < mnemonic.length; i++) {
            try {
                log('log', `Start ${i+1} Wallet`);
                await ClaimRewards(mnemonic[i]).then(res => {
                    log('log', `Claim! Hash: ${res.hash}`, 'green');
                });
                await timeout(1000);
                await DelegateTokens(mnemonic[i]).then(res => {
                    log('log', `Delegate ${res?.amount} ${config.coin}! Hash: ${res?.result.hash}`, 'green');
                });
                log('info', `Start Pause ${pauseTime/1000} sec.`);
            } catch (err: any) {
                log('warn', err.message, 'red');
            }
        }
        await timeout(pauseTime);
    }
})();