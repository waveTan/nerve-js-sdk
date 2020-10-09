let TxSignatures = function (bufferReader) {
  this.list = [];
  while (!bufferReader.isFinished()) {
    this.list.push(new Item(bufferReader));
  }
};
let Item = function (bufferReader) {
  let length = bufferReader.readUInt8();
  this.publicKey = bufferReader.slice(length);
  this.signData = bufferReader.readBytesByLength();
};

TxSignatures.prototype.getPrintInfo = function () {
  let result = "[";
  for (let i = 0; i < this.list.length; i++) {
    if (i > 0) {
      result += ",";
    }
    result += this.list[i].getPrintInfo();
  }
  result += "]";
  return result;
};
Item.prototype.getPrintInfo = function () {
  let result = "{\n";
  result += "       pubkey : " + this.publicKey.toString('hex') + ',\n';
  result += "     signData : " + this.signData.toString('hex') + '\n';
  result += "    }";
  return result;
};

module.exports = TxSignatures;
