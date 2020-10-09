'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 加入staking dome
 * @date: 2019-10-18 10:34
 * @author: Wave
 */

var pri = '33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30';
var pub = '0243a092a010f668680238546f2b68b598bb8c606820f0d5051435adaff59e95b9';
var fromAddress = "TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY";
var amount = 200000000000;
var remark = 'add staking ....';

var timeMap = [0, 1]; //【活期，定期】
var timeType = [0, 1, 2, 3, 4, 5, 6]; //【三个月，半年，一年，两年，三年，五年，十年】

var deposit = {
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
  var defaultAssetsInfo = { chainId: 4, assetsId: 1 };
  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  var balanceInfo = {};
  var feeBalanceInfo = {};

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

  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 5);
  //console.log(inOrOutputs);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }
  /*console.log(inOrOutputs.data.inputs);
  console.log(inOrOutputs.data.outputs);*/

  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 5, deposit);
  //console.log(tAssemble);
  var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  //console.log(txhex);
  var result = await validateTx(txhex);
  //console.log(result);
  if (result) {
    console.log(result.data.value);
    var results = await broadcastTx(txhex);
    if (results && results.hash) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}