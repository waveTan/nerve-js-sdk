'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 创建节点 dome
 * @date: 2019-10-18 10:37
 * @author: Wave
 */

var pri = '10d8804991ceaafa5d19dfa30d79c5091767a48da8e66b73494f0b6af8554618';
var pub = '024bafc4a364659db1674d888bd3e0e7ab11cc4ca02dca95d548637c6b66d63f42';
var fromAddress = "TNVTdN9iJcMNiTttfV4Wdi6wUp3k8NteoebYo";
var amount = 2000100000000;
var remark = 'new agent...';

var agent = {
  agentAddress: fromAddress,
  packingAddress: "TNVTdN9i3GqhhTXjzqBEqmcp28yYx3BPGkQDB",
  rewardAddress: fromAddress,
  deposit: 2000100000000
};

//调用创建节点
newAgent(pri, pub, fromAddress, 4, 1, amount, agent);

/**
 * 创建节点
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param agent
 * @returns {Promise<*>}
 */
async function newAgent(pri, pub, fromAddress, assetsChainId, assetsId, amount, agent) {
  var balanceInfo = await getNulsBalance(fromAddress);
  //console.log(balanceInfo);
  if (!balanceInfo.success) {
    console.log("获取账户balanceInfo错误");
    return;
  }

  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  var newAmount = transferInfo.amount + transferInfo.fee;
  if (balanceInfo.data.balance < newAmount) {
    console.log("余额不住，请更换账户");
    return;
  }

  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 4);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }
  //console.log(inOrOutputs);
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 4, agent);
  var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  //console.log(txhex);
  var result = await validateTx(txhex);
  //console.log(result);
  if (result) {
    console.log(result.data.value);
    var results = await broadcastTx(txhex);
    if (results && result.data.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}