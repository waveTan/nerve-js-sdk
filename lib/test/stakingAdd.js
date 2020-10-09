const nuls = require('../index');
const { getNulsBalance, inputsOrOutputs, validateTx, broadcastTx } = require('./api/util');

/**
 * @disc: 加入staking dome
 * @date: 2019-10-18 10:34
 * @author: Wave
 */

let pri = '33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30';
let pub = '0243a092a010f668680238546f2b68b598bb8c606820f0d5051435adaff59e95b9';
let fromAddress = "TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY";
let amount = 200000000000;
let remark = 'add staking ....';

let timeMap = [0, 1]; //【活期，定期】
let timeType = [0, 1, 2, 3, 4, 5, 6]; //【三个月，半年，一年，两年，三年，五年，十年】

let deposit = {
  deposit: 200000000000,
  address: fromAddress,
  assetsChainId: 4, //链ID
  assetsId: 1, //资产ID
  depositType: timeMap[0], //委托类型
  timeType: timeType[0] //委托时长
};
//调用加入staking
addStaking(pri, pub, fromAddress, 4, 1, amount, deposit);

async function addStaking(pri, pub, fromAddress, assetsChainId, assetsId, amount, deposit) {
  let defaultAssetsInfo = { chainId: 4, assetsId: 1 };
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  let balanceInfo = {};
  let feeBalanceInfo = {};

  if (defaultAssetsInfo.chainId === assetsChainId && defaultAssetsInfo.assetsId === assetsId) {
    //资产信息相同合并 amount+fee
    balanceInfo = await getNulsBalance(fromAddress, assetsChainId, assetsId);
    //console.log(balanceInfo);
    if (!balanceInfo.success) {
      console.log("获取账户balanceInfo错误");
      return;
    }
  } else {
    feeBalanceInfo = await getNulsBalance(fromAddress, defaultAssetsInfo.chainId, defaultAssetsInfo.assetsId);
    //console.log(feeBalanceInfo);
    if (!feeBalanceInfo.success) {
      console.log("获取账户feeBalanceInfo错误");
      return;
    }
    transferInfo.feeBalanceInfo = feeBalanceInfo.data;
    transferInfo.defaultAssetsInfo = defaultAssetsInfo;
  }

  //根据委托类型设置锁定时间
  transferInfo.locked = -1;

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 5);
  //console.log(inOrOutputs);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }
  /*console.log(inOrOutputs.data.inputs);
  console.log(inOrOutputs.data.outputs);*/

  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 5, deposit);
  //console.log(tAssemble);
  let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  //console.log(txhex);
  let result = await validateTx(txhex);
  //console.log(result);
  if (result) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && results.hash) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}