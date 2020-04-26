'use strict';

var tx = require('../model/txs');
var inputs = [];
inputs.push({
  address: 'LINcjJR16WwP7a7irS3T4p1td7QAd2MSUEqk',
  assetsChainId: 8,
  assetsId: 1,
  amount: 3300000000,
  locked: 0,
  nonce: '9673f2fdd28de29f'
});
inputs.push({
  address: 'LINcjJR16WwP7a7irS3T4p1td7QAd2MSUEqk',
  assetsChainId: 2,
  assetsId: 1,
  amount: 1000000,
  locked: 0,
  nonce: '9673f2fdd28de29f'
});
var outputs = [];
outputs.push({
  address: 'tNULSeBaMvEtDfvZuukDf2mVyfGo3DdiN8KLRG',
  assetsChainId: 8,
  assetsId: 1,
  amount: 3300000000,
  lockTime: 0
});
var temp = new tx.CrossChainTransaction();
temp.setCoinData(inputs, outputs);
console.log(temp.coinData.toString('hex'));