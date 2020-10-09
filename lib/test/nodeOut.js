'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    inputsOrOutputs = _require.inputsOrOutputs,
    getConsensusNode = _require.getConsensusNode,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

var axios = require('axios');
/**
 * @disc: 退出保证金 dome
 * @date: 2019-10-18 10:39
 * @author: Wave
 */

var pri = '10d8804991ceaafa5d19dfa30d79c5091767a48da8e66b73494f0b6af8554618';
var pub = '024bafc4a364659db1674d888bd3e0e7ab11cc4ca02dca95d548637c6b66d63f42';
var fromAddress = "TNVTdN9iJcMNiTttfV4Wdi6wUp3k8NteoebYo";
var amount = 300000000000;
var remark = 'out node....';

//退出保证金
nodeOut(pri, pub, fromAddress, 4, 1, amount, '8e4310bbdb846abbb2ebe01f85f649927d43bd0183739bde2512ae6fb27b5ef5');

/**
 * 退出保证金
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param amount
 * @param depositHash
 * @returns {Promise<void>}
 */
async function nodeOut(pri, pub, fromAddress, assetsChainId, assetsId, amount, depositHash) {
  var depositList = await getConsensusNode(depositHash);
  //console.log(depositList);
  if (!depositList.success) {
    console.log("获取节点信息错误");
    return;
  }
  var freeMargin = depositList.data.deposit - 2000000000000;
  if (freeMargin < amount) {
    console.log("您最多可以退" + freeMargin / 100000000 + "保证金");
    return;
  }

  var reduceNonceList = await getReduceNonceList(depositHash, amount, 0);
  //console.log(reduceNonceList);
  if (!reduceNonceList.success) {
    console.log("获取退出保证金ReduceNonceList错误");
    return;
  }

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
    fee: 100000,
    depositHash: depositHash,
    nonceList: reduceNonceList.data
  };

  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 29);
  console.log(inOrOutputs);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }

  var entity = { agentHash: depositHash, address: transferInfo.fromAddress, amount: transferInfo.amount };
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 29, entity);
  //console.log(tAssemble);
  var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  console.log(txhex);
  var result = await validateTx(txhex);
  console.log(result);
  if (result.success) {
    //console.log(result.data.value);
    var results = await broadcastTx(txhex);
    //console.log(results);
    if (results && results.hash) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}

/**
 * @disc: 获取退出节点/退出保证金对应的追加保证金交易列表
 * @params: agentHash 节点hash
 * @params: reduceAmount 退出金额
 * @params: quitAll  是否全部退出 0：部分 1：全部
 * @date: 2020-05-15 16:03
 * @author: Wave
 */
async function getReduceNonceList(agentHash, reduceAmount, quitAll) {
  var url = 'http://seede.nuls.io:17004/jsonrpc';
  var data = [4, agentHash, reduceAmount, quitAll];
  var params = {
    "jsonrpc": "2.0",
    "method": 'getReduceNonceList',
    "params": data,
    "id": Math.floor(Math.random() * 1000)
  };
  try {
    var res = await axios.post(url, params);
    //console.log(res.data);
    if (res.data.hasOwnProperty('result')) {
      return { success: true, data: res.data.result };
    } else {
      return { success: false, data: res.data };
    }
  } catch (err) {
    return { success: false, data: err };
  }
}