'use strict';

var nuls = require('../index');

/**
 * @disc: 创建地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

var passWord = ''; //密码为空 私钥会返回
var newAddress = nuls.newAddress(4, passWord, 'TNVT');
console.log(newAddress);

//验证地址
var result = nuls.verifyAddress(newAddress.address);
console.log(result);