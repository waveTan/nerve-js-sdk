'use strict';

var nuls = require('../index');
var sdk = require('../api/sdk');

var _require = require('./api/util'),
    getBalance = _require.getBalance,
    countFee = _require.countFee,
    inputsOrOutputs = _require.inputsOrOutputs,
    validateTx = _require.validateTx,
    broadcastTx = _require.broadcastTx;

/**
 * @disc: 创建交易对 dome
 * @params:
 * @date: 2019-12-9 10:38
 * @author: vivi
 */

var pri = '4100e2f88c3dba08e5000ed3e8da1ae4f1e0041b856c09d35a26fb399550f530';
var pub = '020e19418ed26700b0dba720dcc95483cb4adb1b5f8a103818dab17d5b05231854';
var fromAddress = "tNULSeBaMu38g1vnJsSZUCwTDU9GsE5TVNUtpD";
//创建交易对收款地址
var toAddress = 'tNULSeBaMqywZjfSrKNQKBfuQtVxAHBQ8rB2Zn';
//创建交易对需要金额
var amount = 2000000000000;
var remark = 'create coinTrading....';
var txType = 28;

var coinTradingInfo = {
    quoteAssetChainId: 2, //计价货币chainId
    quoteAssetId: 1, //计价货币assetId
    quoteMinDecimal: 5, //计价货币交易允许最小小数位
    quoteMinSize: 1000000, //计价货币允许最小交易量
    baseAssetChainId: 2, //交易货币chainId
    baseAssetId: 2, //交易货币assetId
    baseMinDecimal: 5, //交易货币交易允许最小小数位
    baseMinSize: 1000000 //交易货币允许最小交易量
};

var transferInfo = {
    fromAddress: fromAddress,
    toAddress: toAddress,
    assetsChainId: 2,
    assetsId: 1,
    amount: amount,
    remark: remark,
    fee: 1000000
};

//调用设置别名
coinTrading(transferInfo, coinTradingInfo);

/**
 * 设置别名
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
async function coinTrading(transferInfo, coinTradingInfo) {
    //账户转出资产余额
    //console.log(transferInfo);
    var balanceInfo = await getBalance(transferInfo.assetsChainId, transferInfo.assetsChainId, transferInfo.assetsId, transferInfo.fromAddress);

    var inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, txType);

    //交易组装
    var tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, txType, coinTradingInfo);
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

    /*let getHex = await  sdk.appSplicingPub(txSignature);
    console.log(getHex);
      let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
    console.log(txhex);*/
    // let result = await validateTx(txhex.toString('hex'));
    // console.log(result);
    // if (result) {
    //     console.log(result.data.value);
    //     let results = await broadcastTx(txhex);
    //     if (results && result.data.value) {
    //         console.log("交易完成")
    //     } else {
    //         console.log("广播交易失败")
    //     }
    // } else {
    //     console.log("验证交易失败")
    // }
}