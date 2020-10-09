'use strict';

var axios = require('axios');
var API_CHAIN_ID = 5;
axios.defaults.timeout = 9000;
axios.defaults.baseURL = 'http://beta.public.nerve.network';
axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * 封装post请求
 * Encapsulation post method
 * @param url
 * @param methodName
 * @param data
 * @returns {Promise}
 */
module.exports = {
  post: function post(url, methodName) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    return new Promise(function (resolve, reject) {
      data.unshift(API_CHAIN_ID);
      var params = { "jsonrpc": "2.0", "method": methodName, "params": data, "id": Math.floor(Math.random() * 1000) };
      axios.post(url, params).then(function (response) {
        resolve(response.data);
      }, function (err) {
        reject(err);
      });
    });
  },
  postComplete: function postComplete(url, methodName) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    return new Promise(function (resolve, reject) {
      var params = { "jsonrpc": "2.0", "method": methodName, "params": data, "id": Math.floor(Math.random() * 1000) };
      axios.post(url, params).then(function (response) {
        resolve(response.data);
      }, function (err) {
        reject(err);
      });
    });
  }
};