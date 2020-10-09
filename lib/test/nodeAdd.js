const nuls = require('../index');
const { getNulsBalance, inputsOrOutputs, validateTx, broadcastTx } = require('./api/util');

/**
 * @disc: 追加保证金
 * @date: 2019-10-18 10:34
 * @author: Wave
 */

let pri = '10d8804991ceaafa5d19dfa30d79c5091767a48da8e66b73494f0b6af8554618';
let pub = '024bafc4a364659db1674d888bd3e0e7ab11cc4ca02dca95d548637c6b66d63f42';
let fromAddress = "TNVTdN9iJcMNiTttfV4Wdi6wUp3k8NteoebYo";
let amount = 200000000000;
let remark = 'additional margin ....';

let deposit = {
  address: fromAddress,
  agentHash: '8e4310bbdb846abbb2ebe01f85f649927d43bd0183739bde2512ae6fb27b5ef5',
  amount: amount
};
//调用追加保证金
addNode(pri, pub, fromAddress, 4, 1, amount, deposit);

async function addNode(pri, pub, fromAddress, assetsChainId, assetsId, amount, deposit) {
  const balanceInfo = await getNulsBalance(fromAddress);
  //console.log(balanceInfo);
  if (!balanceInfo.success) {
    console.log("获取账户balanceInfo错误");
    return;
  }

  let transferInfo = {
    fromAddress: fromAddress,
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

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 28);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 28, deposit);
  //console.log(tAssemble);
  let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  //console.log(txhex);
  let result = await validateTx(txhex);
  //console.log(result);
  if (result.success) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && result.data.value) {
      console.log("交易完成");
    } else {
      console.log("广播交易失败");
    }
  } else {
    console.log("验证交易失败");
  }
}