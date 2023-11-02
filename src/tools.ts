import { DirectSecp256k1HdWallet, EncodeObject } from "@cosmjs/proto-signing";
import { SigningStargateClient, GasPrice, StargateClient, StdFee } from "@cosmjs/stargate";
import { config } from "../config.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import { log } from "./other.js";

export const GetSignClient = async(rpc: string, mnemonic: string) => {
    const wallet = (await GetWallet(rpc, mnemonic)).wallet;
    const client = await SigningStargateClient.connectWithSigner(rpc, wallet, { gasPrice: GasPrice.fromString(config.gasPrice + config.coin) });
    return client;
}

export const GetWallet = async(rpc: string, mnemonic: string, prefix?: string) => {
    const chain = prefix ? prefix : await GetChain(rpc);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, { prefix: chain });
    const [firstAccount] = await wallet.getAccounts();

    return { wallet, address: firstAccount.address };
}

export const GetClient = async(rpc: string) => {
    const client = await StargateClient.connect(rpc);
    return client;
}

export const GetChain = async(rpc: string) => {
    const client = await GetClient(rpc);
    const chain = (await client.getChainId()).replace(/[^A-Za-z]/g, '');
    return chain;
}

export const GetBalance = async(rpc: string, address: string) => {
    const client = await GetClient(rpc);
    const balance = await client.getBalance(address, config.coin)
    return balance;
}

export const GetEstimateGas = async(rpc: string, msg: EncodeObject[], mnemonic: string) => {
    const client = await GetSignClient(rpc, mnemonic);
    const wallet = await GetWallet(rpc, mnemonic);

    const estimateGas = await client.simulate(
        wallet.address,
        msg,
        undefined
    );

    return estimateGas;
}

export const SendTx = async(rpc: string, msg: EncodeObject[], mnemonic: string, fee: StdFee, memo: string) => {
    const client = await GetSignClient(rpc, mnemonic);
    const wallet = await GetWallet(rpc, mnemonic);

    const dataTx = await client.sign(
        wallet.address,
        msg,
        fee,
        memo
    );
    log('log', `Tx Ready ${wallet.address}`);

    const result = await client.broadcastTx(Uint8Array.from(TxRaw.encode(dataTx).finish()));
    return { rawLog: result.rawLog, hash: result.transactionHash };
}