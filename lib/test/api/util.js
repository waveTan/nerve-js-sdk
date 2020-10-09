"use strict";

var http = require('./https.js');

module.exports = {

  /**
   * 判断是否为主网
   * @param chainId
   **/
  isMainNet: function isMainNet(chainId) {
    if (chainId === 2) {
      return true;
    }
    return false;
  },


  /**
   * 计算手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countFee: function countFee(tx, signatrueCount) {
    var txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 100000 * Math.ceil(txSize / 1024);
  },


  /**
   * 计算跨链交易手续费
   * @param tx
   * @param signatrueCount 签名数量，默认为1
   **/
  countCtxFee: function countCtxFee(tx, signatrueCount) {
    var txSize = tx.txSerialize().length;
    txSize += signatrueCount * 110;
    return 1000000 * Math.ceil(txSize / 1024);
  },


  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type
   * @returns {*}
   */
  mutiInputsOrOutputs: function mutiInputsOrOutputs(transferInfo, balanceInfo, type) {
    var newAmount = transferInfo.from.amount + transferInfo.fee;
    var newLocked = 0;
    var newNonce = balanceInfo.nonce;
    if (balanceInfo.balance < newAmount) {
      return { success: false, data: "Your balance is not enough." };
    }
    var inputs = [{
      address: transferInfo.from.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    }];
    var outputs = [];
    for (var i = 0; i < transferInfo.to.length; i++) {
      var to = transferInfo.to[i];
      outputs.push({
        address: to.toAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: to.amount,
        lockTime: to.lockTime ? to.lockTime : 0
      });
    }
    return { success: true, data: { inputs: inputs, outputs: outputs } };
  },


  /**
   * 获取inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param type 2:转账 4:创建节点 5:加入staking 6:退出staking 9:注销节点 28:追加保证金 29:退出保证金
   * @returns {*}
   */
  inputsOrOutputs: function inputsOrOutputs(transferInfo, balanceInfo, type) {
    var newAmount = transferInfo.amount + transferInfo.fee;
    var newLocked = 0;
    var newNonce = balanceInfo.nonce;
    var newoutputAmount = transferInfo.amount;
    var newLockTime = 0;
    var inputs = [];
    var outputs = [];

    if (type === 4) {
      newLockTime = -1;
    } else if (type === 5) {
      if (transferInfo.defaultAssetsInfo) {
        // 加入的资产不是nvt input组装两个
        var newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: 0,
          nonce: balanceInfo.nonce
        };
        inputs.push(newArr);
        var feeArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.defaultAssetsInfo.chainId,
          assetsId: transferInfo.defaultAssetsInfo.assetsId,
          amount: transferInfo.fee,
          locked: 0,
          nonce: transferInfo.feeBalanceInfo.nonce
        };
        inputs.push(feeArr);
      } else {
        // 加入的资产是nvt 合并amount+fee
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount + transferInfo.fee,
          locked: 0,
          nonce: balanceInfo.nonce
        });
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: transferInfo.amount,
        lockTime: transferInfo.locked
      });
      return { success: true, data: { inputs: inputs, outputs: outputs } };
    } else if (type === 6) {
      if (transferInfo.defaultAssetsInfo) {
        // 加入的资产不是nvt input组装两个
        var _newArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: -1,
          nonce: balanceInfo.nonce
        };
        inputs.push(_newArr);
        var _feeArr = {
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.defaultAssetsInfo.chainId,
          assetsId: transferInfo.defaultAssetsInfo.assetsId,
          amount: transferInfo.fee,
          locked: -1,
          nonce: transferInfo.feeBalanceInfo.nonce
        };
        inputs.push(_feeArr);
        outputs.push({
          address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          lockTime: 0
        });
      } else {
        // 加入的资产是nvt 合并amount+fee
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: -1,
          nonce: balanceInfo.nonce
        });
        outputs.push({
          address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount - transferInfo.fee,
          lockTime: 0
        });
      }

      return { success: true, data: { inputs: inputs, outputs: outputs } };
    } else if (type === 9) {
      //注销节点
      newoutputAmount = transferInfo.amount - transferInfo.fee;
      var times = new Date().valueOf() + 3600000 * 72; //锁定三天
      newLockTime = Number(times.toString().substr(0, times.toString().length - 3));
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = transferInfo.nonceList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          var _newArr2 = {
            address: transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: item.deposit,
            locked: -1,
            nonce: item.nonce
          };
          inputs.push(_newArr2);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newoutputAmount,
        lockTime: newLockTime
      });
      return { success: true, data: { inputs: inputs, outputs: outputs } };
    } else if (type === 28) {
      //追加保证金
      newLockTime = -1;
    } else if (type === 29) {
      //退出保证金
      newoutputAmount = transferInfo.amount - transferInfo.fee;
      //锁定三天
      var _times = new Date().valueOf() + 3600000 * 72;
      newLockTime = Number(_times.toString().substr(0, _times.toString().length - 3));

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = transferInfo.nonceList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _item = _step2.value;

          var _newArr3 = {
            address: transferInfo.fromAddress,
            assetsChainId: transferInfo.assetsChainId,
            assetsId: transferInfo.assetsId,
            amount: _item.deposit,
            locked: -1,
            nonce: _item.nonce
          };
          inputs.push(_newArr3);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newoutputAmount,
        lockTime: newLockTime
      });
      var allAmount = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = transferInfo.nonceList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _item2 = _step3.value;

          allAmount = allAmount + Number(_item2.deposit);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      outputs.push({
        address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: allAmount - transferInfo.amount,
        lockTime: -1
      });

      return { success: true, data: { inputs: inputs, outputs: outputs } };
    }

    inputs.push({
      address: transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newAmount,
      locked: newLocked,
      nonce: newNonce
    });

    outputs.push({
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: newoutputAmount,
      lockTime: newLockTime
    });

    /*console.log(inputs);
    console.log(outputs);*/
    return { success: true, data: { inputs: inputs, outputs: outputs } };
  },


  /**
   * 获取跨链交易inputs 、 outputs
   * @param transferInfo
   * @param balanceInfo
   * @param chainId
   * @returns {*}
   */
  ctxInputsOrOutputs: async function ctxInputsOrOutputs(transferInfo, balanceInfo, chainId) {
    var inputs = [];
    var outputs = [{
      address: transferInfo.toAddress ? transferInfo.toAddress : transferInfo.fromAddress,
      assetsChainId: transferInfo.assetsChainId,
      assetsId: transferInfo.assetsId,
      amount: transferInfo.amount,
      lockTime: 0
    }];

    var mainNetBalanceInfo = await this.getBalance(chainId, 2, 1, transferInfo.fromAddress);
    var localBalanceInfo = void 0;
    //如果不是主网需要收取NULS手续费
    if (!isMainNet(chainId)) {
      if (mainNetBalanceInfo.balance < transferInfo.fee) {
        console.log("余额不足");
        return;
      }
    }

    //如果转出资产为本链主资产，则直接将手续费加到转出金额上
    if (chainId === transferInfo.assetsChainId && transferInfo.assetsId === 1) {
      var newAmount = transferInfo.amount + transferInfo.fee;
      if (balanceInfo.balance < transferInfo.amount + transferInfo.fee) {
        console.log("余额不足");
        return;
      }
      //转出的本链资产 = 转出资产amount + 本链手续费
      inputs.push({
        address: transferInfo.fromAddress,
        assetsChainId: transferInfo.assetsChainId,
        assetsId: transferInfo.assetsId,
        amount: newAmount,
        locked: 0,
        nonce: balanceInfo.nonce
      });
      //如果不是主网需收取主网NULS手续费
      if (!isMainNet(chainId)) {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
    } else {
      localBalanceInfo = await this.getBalance(chainId, chainId, 1, transferInfo.fromAddress);
      if (localBalanceInfo.balance < transferInfo.fee) {
        console.log("该账户本链主资产不足够支付手续费！");
        return;
      }
      //如果转出的是NULS，则需要把NULS手续费添加到转出金额上
      if (transferInfo.assetsChainId === 2 && transferInfo.assetsId === 1) {
        var _newAmount = transferInfo.amount + transferInfo.fee;
        if (mainNetBalanceInfo.balance < _newAmount) {
          console.log("余额不足");
          return;
        }
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: _newAmount,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      } else {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: transferInfo.assetsChainId,
          assetsId: transferInfo.assetsId,
          amount: transferInfo.amount,
          locked: 0,
          nonce: balanceInfo.nonce
        });
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: 2,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: mainNetBalanceInfo.nonce
        });
      }
      //本链主资产手续费
      if (!isMainNet(chainId)) {
        inputs.push({
          address: transferInfo.fromAddress,
          assetsChainId: chainId,
          assetsId: 1,
          amount: transferInfo.fee,
          locked: 0,
          nonce: localBalanceInfo.nonce
        });
      }
    }
    return { success: true, data: { inputs: inputs, outputs: outputs } };
  },


  /**
   * 获取账户的余额及nonce
   * @param address
   * @param chainId
   * @param assetChainId
   * @param assetId
   * @returns {Promise<AxiosResponse<any>>}
   */
  getBalance: async function getBalance(chainId) {
    var assetChainId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var assetId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    var address = arguments[3];

    return await http.postComplete('/', 'getAccountBalance', [chainId, assetChainId, assetId, address]).then(function (response) {
      //console.log(response);
      return { 'balance': response.result.balance, 'nonce': response.result.nonce };
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 获取账户的余额及nonce
   * @param address
   * @returns {Promise<AxiosResponse<any>>}
   */
  getNulsBalance: async function getNulsBalance(address) {
    var chainId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var assetId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    return await http.post('/', 'getAccountBalance', [chainId, assetId, address]).then(function (response) {
      return { success: true, data: { 'balance': response.result.balance, 'nonce': response.result.nonce } };
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 获取合约代码构造函数
   * @param contractCodeHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  getContractConstructor: async function getContractConstructor(contractCodeHex) {
    return await http.post('/', 'getContractConstructor', [contractCodeHex]).then(function (response) {
      //console.log(response);
      if (response.hasOwnProperty("result")) {
        return { success: true, data: response.result };
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 获取合约指定函数的参数类型
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @returns {Promise<AxiosResponse<any>>}
   */
  getContractMethodArgsTypes: async function getContractMethodArgsTypes(contractAddress, methodName, methodDesc) {
    return await http.post('/', 'getContractMethodArgsTypes', [contractAddress, methodName, methodDesc]).then(function (response) {
      if (response.hasOwnProperty("result")) {
        return { success: true, data: response.result };
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 验证创建合约交易
   * @param sender
   * @param gasLimit
   * @param price
   * @param contractCode
   * @param args
   * @returns {Promise<T>}
   */
  validateContractCreate: async function validateContractCreate(sender, gasLimit, price, contractCode, args) {
    return await http.post('/', 'validateContractCreate', [sender, gasLimit, price, contractCode, args]).then(function (response) {
      //console.log(response.result);
      return response.result;
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 预估创建合约交易的gas
   * @param sender
   * @param contractCode
   * @param args
   * @returns {Promise<T>}
   */
  imputedContractCreateGas: async function imputedContractCreateGas(sender, contractCode, args) {
    return await http.post('/', 'imputedContractCreateGas', [sender, contractCode, args]).then(function (response) {
      //console.log(response);
      if (response.hasOwnProperty("result")) {
        return response.result.gasLimit;
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 验证调用合约交易
   * @param sender
   * @param value
   * @param gasLimit
   * @param price
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<T>}
   */
  validateContractCall: async function validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
    return await http.post('/', 'validateContractCall', [sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args]).then(function (response) {
      if (response.hasOwnProperty("result")) {
        return { success: true, data: response.result };
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 预估调用合约交易的gas
   * @param sender
   * @param value
   * @param contractAddress
   * @param methodName
   * @param methodDesc
   * @param args
   * @returns {Promise<T>}
   */
  imputedContractCallGas: async function imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
    return await http.post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args]).then(function (response) {
      if (response.hasOwnProperty("result")) {
        return { success: true, data: response.result };
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 验证删除合约交易
   * @param sender
   * @param contractAddress
   * @returns {Promise<T>}
   */
  validateContractDelete: async function validateContractDelete(sender, contractAddress) {
    return await http.post('/', 'validateContractDelete', [sender, contractAddress]).then(function (response) {
      if (response.hasOwnProperty("result")) {
        return { success: true, data: response.result };
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 验证交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  validateTx: async function validateTx(txHex) {
    return await http.post('/', 'validateTx', [txHex]).then(function (response) {
      //console.log(response);
      if (response.hasOwnProperty("result")) {
        return { success: true, data: response.result };
      } else {
        return { success: false, error: response.error };
      }
    }).catch(function (error) {
      return { success: false, error: error };
    });
  },


  /**
   * 获取所有地址前缀映射关系
   * @returns {Promise<AxiosResponse<any>>}
   */
  getAllAddressPrefix: async function getAllAddressPrefix() {
    return await http.post('/', 'getAllAddressPrefix', []).then(function (response) {
      console.log(response);
      if (response.hasOwnProperty("result")) {
        var data = {};

        for (var i = 0; i < response.result.length; i++) {
          data[response.result[i].chainId] = response.result[i].addressPrefix;
        }

        return { success: true, data: data };
      } else {
        return { success: false, data: response.error };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 广播交易
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  broadcastTx: async function broadcastTx(txHex) {
    return await http.post('/', 'broadcastTx', [txHex]).then(function (response) {
      if (response.hasOwnProperty("result")) {
        return response.result;
      } else {
        return response.error;
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 跨链交易广播
   * @param txHex
   * @returns {Promise<AxiosResponse<any>>}
   */
  sendCrossTx: async function sendCrossTx(txHex) {
    return await http.post('/', 'sendCrossTx', [8, txHex]).then(function (response) {
      console.log(response);
      return response.result;
    }).catch(function (error) {
      return { success: false, data: error };
    });
  },


  /**
   * 获取节点详细信息
   * @param agentHash
   * @returns {Promise<AxiosResponse<any>>}
   */
  getConsensusNode: async function getConsensusNode(agentHash) {
    return await http.post('/', 'getConsensusNode', [agentHash]).then(function (response) {
      if (response.hasOwnProperty('result')) {
        return { success: true, data: response.result };
      } else {
        return { success: false, data: response };
      }
    }).catch(function (error) {
      return { success: false, data: error };
    });
  }
};