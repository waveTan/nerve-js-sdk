'use strict';

var nuls = require('../index');

var _require = require('./api/util'),
    getNulsBalance = _require.getNulsBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx,
    getConsensusNode = _require.getConsensusNode;

var axios = require('axios');

/**
 * @disc: 注销节点 dome
 * @date: 2019-10-18 10:38
 * @author: Wave
 */

var pri = '33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30';
var pub = '0243a092a010f668680238546f2b68b598bb8c606820f0d5051435adaff59e95b9';
var fromAddress = "TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY";
var remark = 'stop agent....';

//调用注销节点
stopAgent(pri, pub, fromAddress, 4, 1, '6e1f8aaa80f64244a024db0a1979495fb77455fa60650da48b01761e7defa908');

/**
 * 注销节点
 * @param pri
 * @param pub
 * @param fromAddress
 * @param assetsChainId
 * @param assetsId
 * @param agentHash
 * @returns {Promise<void>}
 */
async function stopAgent(pri, pub, fromAddress, assetsChainId, assetsId, agentHash) {
  var reduceNonceList = await getReduceNonceList(agentHash, '0', 1);
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

  var allAmount = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = reduceNonceList.data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      allAmount = allAmount + Number(item.deposit);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  var transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    nonceList: reduceNonceList.data,
    amount: allAmount,
    fee: 100000,
    depositHash: agentHash
  };
  //console.log(transferInfo);

  var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 9);
  //console.log(inOrOutputs);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }

  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 9, {
    address: fromAddress,
    agentHash: agentHash
  });
  //console.log(tAssemble);
  var txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  console.log(txhex);
  var result = await validateTx(txhex);
  //console.log(result);
  if (result.success) {
    console.log(result.data.value);
    var results = await broadcastTx(txhex);
    //console.log(results);
    if (results && results.value) {
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