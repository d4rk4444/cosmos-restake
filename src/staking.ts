import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx.js";

export const dataDelegate = async(delegator: string, validator: string, amount: string) => {
    const msg: MsgDelegate = {
        delegatorAddress: delegator,
        validatorAddress: validator,
        amount: { denom: "uumee", amount: amount },
    };

    const data = {
        typeUrl: '/cosmos.staking.v1beta1.MsgDelegate',
        value: msg,
    };

    return data;
}