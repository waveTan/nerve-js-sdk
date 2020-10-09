const nuls = require('../index');

/**
 * @disc: 创建地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

let passWord = '';//密码为空 私钥会返回
const newAddress = nuls.newAddress(4, passWord, 'TNVT');
console.log(newAddress);

//验证地址
let result = nuls.verifyAddress(newAddress.address);
console.log(result);

