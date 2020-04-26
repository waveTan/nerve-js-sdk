'use strict';

var nuls = require('../index');
var sdk = require('../api/sdk');

/**
 * @disc: 撤销委托挂单 dome
 * @date: 2019-12-9 10:38
 * @author: vivi
 */

var pri = '9ce21dad67e0f0af2599b41b515a7f7018059418bab892a7b68f283d489abc4b';
var pub = '03958b790c331954ed367d37bac901de5c2f06ac8368b37d7bd6cd5ae143c1d7e3';
var address = "tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG";
var remark = 'cancel tradingOrder....';
var txType = 30;
var fee = 100000; //手续费
//本链默认资产，用于生成手续费
var defaultAsset = { assetsChainId: 2, assetsId: 1 };

//正常情况，这个数据是通过查询orderHash的nonce值接口查询到
var tradingOrderInfo = {
  orderHash: 'f4ef24c225cc2af33902a3f7d147760d21407039ee98ec6dd74303f969171a5d', //委托挂单hash
  address: address, //撤销挂单委托人
  orderType: 1, //委托挂单类型 1:买单，2:卖单
  nonce: "69db314e5fd02b6b", //通过解决接口查询nonce
  leftAmount: 88700391787 //撤销金额

};

//正常情况，这个数据是通过交易对详情接口查询出来的
var coinTrading = {
  baseAssetChainId: 2,
  baseAssetId: 2,
  quoteAssetChainId: 2,
  quoteAssetId: 1
};

//调用委托挂单
tradingOrderCancel(tradingOrderInfo);

/**
 * 委托挂单
 * @param tradingOrderInfo
 * @returns {Promise<void>}
 */
async function tradingOrderCancel(tradingOrderInfo) {
  var inOrOutputs = await createCoinData(tradingOrderInfo, coinTrading);
  //交易组装
  var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, txType, tradingOrderInfo);
  console.log(tAssemble);
  //获取hash
  var hash = await tAssemble.getHash();
  console.log(hash);
  //交易签名
  var txSignature = await sdk.getSignData(hash.toString('hex'), pri);
  console.log(txSignature);
  //通过拼接签名、公钥获取HEX
  var signData = await sdk.appSplicingPub(txSignature.signValue, pub);
  tAssemble.signatures = signData;
  var txhex = tAssemble.txSerialize().toString("hex");
  console.log(txhex.toString('hex'));
}

async function createCoinData(tradingOrderInfo, coinTrading) {
  var inputs = [],
      outputs = [];
  //首先通过订单信息组装解锁from
  var orderInput = {
    address: tradingOrderInfo.address,
    assetsChainId: coinTrading.baseAssetChainId,
    assetsId: coinTrading.baseAssetId,
    amount: tradingOrderInfo.leftAmount,
    locked: -1,
    nonce: tradingOrderInfo.nonce
  };
  if (tradingOrderInfo.type === 1) {
    orderInput.assetsChainId = coinTrading.quoteAssetChainId;
    orderInput.assetsId = coinTrading.quoteAssetId;
  }
  inputs.push(orderInput);

  //如果手续费不足，需要添加手续费
  if (orderInput.assetsChainId !== defaultAsset.assetsChainId || orderInput.assetsId !== defaultAsset.assetsId || orderInput.amount < fee) {
    //通过获取用户当前余额组装手续费from
    // const balanceInfo = await getBalance(defaultAsset.assetsChainId, defaultAsset.assetsChainId, defaultAsset.assetsId, tradingOrderInfo.address);
    inputs.push({
      address: tradingOrderInfo.address,
      assetsChainId: defaultAsset.assetsChainId,
      assetsId: defaultAsset.assetsId,
      amount: fee,
      locked: 0,
      nonce: "85e00519bbb5f5d8"
    });
  }

  //组装to
  if (orderInput.assetsChainId !== defaultAsset.assetsChainId || orderInput.assetsId !== defaultAsset.assetsId || orderInput.amount < fee) {
    outputs.push({
      address: tradingOrderInfo.address,
      assetsChainId: orderInput.assetsChainId,
      assetsId: orderInput.assetsId,
      amount: orderInput.amount,
      lockTime: 0
    });
  } else {
    outputs.push({
      address: tradingOrderInfo.address,
      assetsChainId: orderInput.assetsChainId,
      assetsId: orderInput.assetsId,
      amount: orderInput.amount - fee,
      lockTime: 0
    });
  }

  return { success: true, data: { inputs: inputs, outputs: outputs } };
}