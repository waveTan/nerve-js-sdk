const nuls = require('../index');
const {getNulsBalance, inputsOrOutputs, validateTx, broadcastTx} = require('./api/util');

/**
 * @disc: 创建节点 dome
 * @date: 2019-10-18 10:37
 * @author: Wave
 */

let pri = '33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30';
let pub = '0243a092a010f668680238546f2b68b598bb8c606820f0d5051435adaff59e95b9';
let fromAddress = "TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY";
let amount = 2000100000000;
let remark = 'new agent...';

let agent = {
  agentAddress: fromAddress,
  packingAddress: "TNVTdN9iJVX42PxxzvhnkC7vFmTuoPnRAgtyA",
  rewardAddress: fromAddress,
  deposit: 2000100000000
};

//调用新建节点
newAgent(pri, pub, fromAddress, 4, 1, amount, agent);

/**
 * 新建节点
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
  let transferInfo = {
    fromAddress: fromAddress,
    assetsChainId: assetsChainId,
    assetsId: assetsId,
    amount: amount,
    fee: 100000
  };
  let inOrOutputs = await inputsOrOutputs(transferInfo, balanceInfo, 4);
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

