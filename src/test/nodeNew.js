const nuls = require('../index');
const {getNulsBalance, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

/**
 * @disc: 创建节点 dome
 * @date: 2019-10-18 10:37
 * @author: Wave
 */

let pri = '10d8804991ceaafa5d19dfa30d79c5091767a48da8e66b73494f0b6af8554618';
let pub = '024bafc4a364659db1674d888bd3e0e7ab11cc4ca02dca95d548637c6b66d63f42';
let fromAddress = "TNVTdN9iJcMNiTttfV4Wdi6wUp3k8NteoebYo";
let amount = 2000100000000;
let remark = 'new agent...';

let agent = {
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

  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo.data, 4);
  if (!inOrOutputs.success) {
    console.log("inputOutputs组装失败!");
    return;
  }
  //console.log(inOrOutputs);
  let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 4, agent);
  let txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
  //console.log(txhex);
  let result = await validateTx(txhex);
  //console.log(result);
  if (result) {
    console.log(result.data.value);
    let results = await broadcastTx(txhex);
    if (results && result.data.value) {
      console.log("交易完成")
    } else {
      console.log("广播交易失败")
    }
  } else {
    console.log("验证交易失败")
  }
}

