/*
  权限token验证的中间件
 */
const jwt = require('jsonwebtoken');
const { PRIVATE_KEY, UN_CHECK_PATHS } = require('../config');

module.exports = function (req, res, next) {
  const url = req.url;

  console.log(UN_CHECK_PATHS, url)
  console.log(url);
  //验证码请求带了url参数
  let str = url.split('?')[0]
  console.log(str);
  // 如果是登录请求，不进行验证~
  // 此处可以配置白名单
  if (UN_CHECK_PATHS.indexOf(str) !==-1) {
    return next();
  }

  // 其他所有请求都要验证token
  let token = req.headers['authorization'];  // dof_token值

  // 没有token
  if (!token) {
    return res.status(401).json({
      status: 1,
      msg: '你没有登录，需要登录才能使用'
    })
  }
  //在这里做一个权限管理token里的role不同能请求的数据不同
  

  // 一开始值： dof_token  --> 截取后面token
  token = token.slice(4);

  // 有token进行校验
  jwt.verify(token, PRIVATE_KEY, (err, data) => {
    if (err) {
      // 验证失败~
      console.log('token验证失败', err.message);

      return res.status(401).json({
        status: 2,
        msg: 'token过期失效'
      })
    } else {
      // 验证通过，添加到req上
      req.user = data; // {id: 12}
 
      return next();
    }
  })

};