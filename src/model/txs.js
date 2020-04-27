const Serializers = require("../api/serializers");
const BufferReader = require("../utils/bufferreader");
const TxSignatures = require("./signatures");
const CoinData = require("./coindata");
const sdk = require("../api/sdk");
const bs58 = require('bs58');
const bufferFrom = require('buffer-from');

/**
 *
 * @param address
 * @returns {*}
 */
function addressToBytes(address) {
  let bytes = bs58.decode(address);
  return bufferFrom(bytes.subarray(0, 23));
}

/**
 *
 * @param bytes
 * @returns {*}
 */
function bytesToAddress(bytes) {
  let xor = 0x00;
  let temp = "";
  let tempBuffer = new Buffer(bytes.length + 1);
  for (let i = 0; i < bytes.length; i++) {
    temp = bytes[i];
    temp = temp > 127 ? temp - 256 : temp;
    tempBuffer[i] = temp;
    xor ^= temp
  }
  tempBuffer[bytes.length] = xor;
  return bs58.encode(tempBuffer)
}

let typeMap = {
  1: "共识奖励",
  2: "转账交易",
  3: "设置别名",
  4: "创建节点",
  5: "参与共识",
  6: "退出共识",
  7: "黄牌惩罚",
  8: "红牌惩罚",
  9: "注销节点",
  10: "跨链转账",
  11: "注册链",
  12: "注销链",
  13: "增加跨链资产",
  14: "注销跨链资产",
  15: "部署合约",
  16: "调用合约",
  17: "删除合约",
  18: "合约内部转账",
  19: "合约退费",
  20: "合约创建节点",
  21: "合约参与共识",
  22: "合约退出共识",
  23: "合约注销节点",
  24: "验证人变更",
  25: "验证人初始化",
  26: "合约转账",
  27: "资产注册登记",
  28: "追加保证金",
  29: "撤销保证金",
  30: "喂价",
  31: "最终交易",
  228: "创建交易对",
  229: "挂单委托",
  230: "挂单撤销",
  231: "挂单成交",
  232: "修改交易对",
  40: "确认虚拟银行变更",
  41: "虚拟银行变更",
  42: "链内充值",
  43: "提现",
  44: "确认提现成功",
  45: "发起提案",
  46: "提案投票",
  47: "异构链交易手续费补贴",
  48: "异构链合约资产注册",
  49: "虚拟银行初始化异构链",
};

/**
 * 所有交易的基础类
 * @constructor
 */
let Transaction = function () {
  this.hash = null;
  this.type = 0;//交易类型
  let times = (new Date()).valueOf();
  this.time = Number(times.toString().substr(0, times.toString().length - 3)); //交易时间
  this.remark = null;//备注
  this.txData = null;//业务数据
  this.coinData = [];//输入输出
  this.signatures = [];//签名列表

  this.parse = function (bufferReader) {
    this.type = bufferReader.readUInt16LE();
    this.time = bufferReader.readUInt32LE();
    this.remark = bufferReader.readBytesByLength();
    this.txData = bufferReader.readBytesByLength();
    this.coinData = bufferReader.readBytesByLength();
    this.signatures = bufferReader.readBytesByLength();
  };

  this.printInfo = function () {
    let signatures = new TxSignatures(new BufferReader(this.signatures, 0));
    let coinData = new CoinData(new BufferReader(this.coinData, 0));
  };
  this.getTxDataStr = function () {
    if (!this.txData || 0 === this.txData.length) {
      return "--";
    }
    return this.txData.toString('hex');
  };

  this.txSerialize = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
    bw.writeString(this.remark);
    bw.writeBytesWithLength(this.txData);//txData
    bw.writeBytesWithLength(this.coinData);
    bw.writeBytesWithLength(this.signatures);
    return bw.getBufWriter().toBuffer();
  };

  //序列化交易，不包含签名数据
  this.serializeForHash = function () {
    let bw = new Serializers();
    bw.getBufWriter().writeUInt16LE(this.type);
    bw.getBufWriter().writeUInt32LE(this.time);
    bw.writeString(this.remark);
    bw.writeBytesWithLength(this.txData);
    bw.writeBytesWithLength(this.coinData);
    return bw.getBufWriter().toBuffer();
  };

  this.calcHash = function () {
    return sdk.getTxHash(this);
  };
  this.setCoinData = function (inputs, outputs) {
    let bw = new Serializers();
    bw.getBufWriter().writeVarintNum(inputs.length);
    if (inputs.length > 0) {
      for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        bw.writeBytesWithLength(sdk.getBytesAddress(input.address));
        bw.getBufWriter().writeUInt16LE(input.assetsChainId);
        bw.getBufWriter().writeUInt16LE(input.assetsId);
        bw.writeBigInt(input.amount);
        bw.writeBytesWithLength(Buffer.from(input.nonce, 'hex'));
        bw.getBufWriter().write(Buffer.from([input.locked]));
      }
    }
    bw.getBufWriter().writeVarintNum(outputs.length);
    if (outputs.length > 0) {
      for (let i = 0; i < outputs.length; i++) {
        let output = outputs[i];
        bw.writeBytesWithLength(sdk.getBytesAddress(output.address));
        bw.getBufWriter().writeUInt16LE(output.assetsChainId);
        bw.getBufWriter().writeUInt16LE(output.assetsId);
        bw.writeBigInt(output.amount);
        if (output.lockTime === -1) {
          bw.getBufWriter().write(Buffer.from("ffffffffffffffff", "hex"));
        } else if (output.lockTime === -2) {
          bw.getBufWriter().write(Buffer.from("feffffffffffffff", "hex"));
        } else {
          bw.writeUInt64LE(output.lockTime);
        }
      }
    }
    this.coinData = bw.getBufWriter().toBuffer();
  };
  this.getHash = function () {
    if (this.hash) {
      return this.hash;
    }
    return this.calcHash();
  };
};

module.exports = {
  Transaction,

  /**
   * 转账交易
   * @constructor
   */
  TransferTransaction: function () {
    Transaction.call(this);
    this.type = 2;
  },

  /**
   * 设置别名交易
   * @param address
   * @param alias
   * @constructor
   */
  AliasTransaction: function (address, alias) {
    Transaction.call(this);
    this.type = 3;
    let bw = new Serializers();
    bw.writeBytesWithLength(sdk.getBytesAddress(address));
    bw.writeString(alias);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 创建节点交易
   * @param agent
   * @constructor
   */
  CreateAgentTransaction: function (agent) {
    Transaction.call(this);
    //对象属性结构
    if (!agent || !agent.agentAddress || !agent.packingAddress || !agent.rewardAddress || !agent.deposit) {
      throw "Data wrong!";
    }
    this.type = 4;
    let bw = new Serializers();
    bw.writeBigInt(agent.deposit);
    bw.getBufWriter().write(sdk.getBytesAddress(agent.agentAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.packingAddress));
    bw.getBufWriter().write(sdk.getBytesAddress(agent.rewardAddress));
    //bw.getBufWriter().writeUInt8(agent.commissionRate);
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 追加委托节点交易
   * @param entity
   * @constructor
   */
  DepositTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.amount) {
      throw "Data Wrong!";
    }
    this.type = 28;
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.writeBigInt(entity.amount);
    bw.getBufWriter().write(Buffer.from(entity.agentHash, 'hex'));
    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 添加staking交易
   * @param entity
   * @constructor
   */
  addStakingTransaction: function (entity) {
    Transaction.call(this);
    //对象属性结构
    if (!entity || !entity.address || !entity.agentHash || !entity.deposit) {
      throw "Data Wrong!";
    }
    this.type = 28; //todo 类型待确定
    let bw = new Serializers();
    bw.getBufWriter().write(sdk.getBytesAddress(entity.address));
    bw.writeBigInt(entity.deposit);
    bw.getBufWriter().writeUInt16LE(entity.assetsChainId);
    bw.getBufWriter().writeUInt16LE(entity.assetsId);
    bw.getBufWriter().write(Buffer.from([entity.depositType]));
    bw.getBufWriter().write(Buffer.from([entity.timeType]));

    this.txData = bw.getBufWriter().toBuffer();
  },

  /**
   * 注销节点交易
   * @param agentHash
   * @constructor
   */
  StopAgentTransaction: function (agentHash, lockTime) {
    Transaction.call(this);
    if (!agentHash) {
      throw "Data wrong!";
    }
    this.type = 9;
    this.time = lockTime;
    this.txData = Buffer.from(agentHash, 'hex');
  },

};

