const sdk = require("../api/sdk");
let CoinData = function (bufferReader) {
  this.fromList = [];
  this.toList = [];
  let fromCount = bufferReader.readVarInt();
  for (let i = 0; i < fromCount; i++) {
    this.fromList.push(new CoinFrom(bufferReader));
  }
  let toCount = bufferReader.readVarInt();
  for (let i = 0; i < toCount; i++) {
    this.toList.push(new CoinTo(bufferReader));
  }
};
let CoinFrom = function (bufferReader) {
  this.address = bufferReader.readBytesByLength();
  this.assetsChainId = bufferReader.readUInt16LE();
  this.assetsId = bufferReader.readUInt16LE();
  this.amount = bufferReader.readBigInteger();
  this.nonce = bufferReader.readBytesByLength();
  this.locked = bufferReader.readBoolean();
};
let CoinTo = function (bufferReader) {
  this.address = bufferReader.readBytesByLength();
  this.assetsChainId = bufferReader.readUInt16LE();
  this.assetsId = bufferReader.readUInt16LE();
  this.amount = bufferReader.readBigInteger();
  this.lockTime = bufferReader.readUInt64LE();
};


CoinData.prototype.getPrintInfo = function () {
  let result = "{\n      fromList: [";
  for (let i = 0; i < this.fromList.length; i++) {
    if (i > 0) {
      result += ",";
    }
    result += this.fromList[i].getPrintInfo();

  }
  result += "]\n";
  result += "     toList : [";
  for (let i = 0; i < this.toList.length; i++) {
    if (i > 0) {
      result += ",";
    }
    result += this.toList[i].getPrintInfo();
  }
  result += "]\n     }";
  return result;
};

CoinFrom.prototype.getPrintInfo = function () {
  let result = "{\n";
  result += "      address : " + sdk.getStringAddressByBytes(this.address) + ',\n';
  result += "assetsChainId : " + this.assetsChainId + '\n';
  result += "     assetsId : " + this.assetsId + '\n';
  result += "       amount : " + this.amount + '\n';
  result += "        nonce : " + this.nonce.toString('hex') + '\n';
  result += "       locked : " + this.locked + '\n';
  result += "    }";
  return result;
};
CoinTo.prototype.getPrintInfo = function () {
  let result = "{\n";
  result += "      address : " + sdk.getStringAddressByBytes(this.address) + ',\n';
  result += "assetsChainId : " + this.assetsChainId + '\n';
  result += "     assetsId : " + this.assetsId + '\n';
  result += "       amount : " + this.amount + '\n';
  result += "     loctTime : " + this.lockTime + '\n';
  result += "    }";
  return result;
};
module.exports = CoinData;
