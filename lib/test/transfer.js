const nuls = require('../index');
const { getNulsBalance, countFee, inputsOrOutputs, validateTx, broadcastTx } = require('./api/util');

/**
 * @disc: 转账 dome
 * @date: 2020-05-20 13:47
 * @author: Wave
 */
/*let pri = '477059f40708313626cccd26f276646e4466032cabceccbf571a7c46f954eb75';
let pub = '0318f683066b45e7a5225779061512e270044cc40a45c924afcf78bb7587758ca0';
let fromAddress = "TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz";
let toAddress = 'TNVTdTSPUZYyUW8ThLzJXWdgWaDFSy5trakjk';*/
let pri = 'dramaendorsepotterystingattitudejaguarslightsnakelemonamazin';
let pub = '03ac01bbb717f9f28db9b7d3ae62555060bf2024825d92259887ab12dbdd6c689e';
let fromAddress = "TNVTdTSPUZYyUW8ThLzJXWdgWaDFSy5trakjk";
let toAddress = 'TNVTdTSPNEpLq2wnbsBcD8UDTVMsArtkfxWgz';
let amount = 100000000;
let remark = 'transfer transaction remark...';
//调用
transferTransaction(pri, pub, fromAddress, toAddress, 5, 1, amount, remark);

/**
 * 转账交易
 * @param pri
 * @param pub
 * @param fromAddress
 * @param toAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param remark
 * @returns {Promise<void>}
 */
async function transferTransaction(pri, pub, fromAddress, toAddress, assetsChainId, assetsId, amount, remark) {
  const balanceInfo = await getNulsBalance(fromAddress);
  console.log(balanceInfo);
  if (!balanceInfo.success) {
    console.log("获取账户balanceInfo错误");
    return;
  }

  let transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };

  let newAmount = transferInfo.amount + transferInfo.fee;
  if (balanceInfo.data.balance < newAmount) {
    console.log("余额不住，请更换账户");
    return;
  }

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 2);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }

  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2); //交易组装
  let txhex = ""; //交易签名
  let newFee = countFee(tAssemble, 1); //获取手续费
  //手续费大于0.001的时候重新组装交易及签名
  if (transferInfo.fee !== newFee) {
    transferInfo.fee = newFee;
    inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 2);
    tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 2);
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  } else {
    txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  }
  console.log(txhex);

  let result = await validateTx(txhex);
  if (result.success) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && results.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败:" + JSON.stringify(result.error));
  }
}