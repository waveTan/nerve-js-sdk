const nuls = require('../index');

/**
 * @disc: 导入地址 dome
 * @date: 2019-10-18 10:36
 * @author: Wave
 */

let passWord = '';
const pri = "33027cb348f51d0909021343c3374b23cf011cadab0f24c1718bf6a382ce7a30";
const importAddress = nuls.importByKey(4, pri, passWord, "TNVT");
console.log(importAddress);
console.log(importAddress.address === 'TNVTdN9i4JSE9C1PrZZzuQpvrzdhXakSw3UxY');
