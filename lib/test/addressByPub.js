const nuls = require('../index');

/**
 * @disc: 根据公钥获取地址
 * @date: 2019-10-18 10:27
 * @author: Wave
 */

let addressInfo = {
  pri: '78e098edce7e73402e39f3b52c58cb57fe7b8305a2bd7d38c7fa178513f54fdd',
  pub: '0272325dc69c640904fd167dffb631c5b6008cc35e8215340da4412026b1b81b3a',
  address: 'TNVTdN9i6N4LERn4iAHhnaFyJNfG8L4hCBBTN'
};
let address = nuls.getAddressByPub(4, 1, addressInfo.pub, 'TNVT');
console.log(address);
console.log(address === addressInfo.address);