# Install
```bash
$ npm i nerve-sdk-js
```

# Usage
```js
const nuls = require('./index');

let chainId = 4; //链ID 3:NVT主网 4：TNVT测试网
let passWord = "";
let prefix = "TNVT"; //链前缀

//创建地址
const newAddress = nuls.newAddress(chainId, passWord, prefix);
console.log(newAddress);

//导入地址
const key ="";
const importAddress = nuls.importByKey(chainId, key, passWord,prefix);
console.log(importAddress);



