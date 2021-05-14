// 开发/生产环境的标识
// const isDev = process.env.NODE_ENV === 'development';

// 服务器相关配置
let SERVER_CONFIG



// 服务器配置
SERVER_CONFIG = {
  port: 5000,
};



/* 
配置token检查白名单
不需要进行检查token的所有路径的数组
*/
const UN_CHECK_PATHS = ['/test', '/manage/login','/userRegister','/cdk','/imgcode'];

// token签名加密的私钥
const PRIVATE_KEY = 'dof_token';

module.exports = {
  SERVER_CONFIG,
  PRIVATE_KEY,
  UN_CHECK_PATHS
};
