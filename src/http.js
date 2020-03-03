import Vue from 'vue'
import axios from 'axios'
import config from './config'

axios.defaults.baseURL = "http://127.0.0.1:8081";
axios.defaults.timeout = 2000000;

axios.interceptors.request.use(function (config) {
  // console.log(config);
  return config;
})

Vue.prototype.$http = axios;
