import { QueryClient, setupDistributionExtension } from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx.js";
import { config } from "../config.js";

export const getDelegatorValidators = async(address: string) => {
    const tmClient = await Tendermint34Client.connect(config.rpc);
    const client = QueryClient.withExtensions(tmClient, setupDistributionExtension);
    const res = await client.distribution.delegatorValidators(address);
    return res.validators;
}

export const dataClaimRewards = async(delegator: string, validator: string) => {
    const msg: MsgWithdrawDelegatorReward = {
        delegatorAddress: delegator,
        validatorAddress: validator
    };

    const data = {
        typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
        value: msg,
    };

    return data;
}