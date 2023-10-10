import axios from "axios";
import { MsgWithdrawDelegatorReward } from "cosmjs-types/cosmos/distribution/v1beta1/tx.js";

export const getDelegatorValidators = async(address: string) => {
    const res = await axios.get(`https://umee-api.w3coins.io/cosmos/distribution/v1beta1/delegators/${address}/validators`);
    return res.data.validators;
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