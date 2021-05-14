/*
用来定义路由的路由器模块
 */
let {preSql} = require('../controller/DbController');
const express = require('express')
const md5 = require('blueimp-md5')
const jwt = require('jsonwebtoken')


const {
   PRIVATE_KEY
} = require('../config')

// 得到路由器对象
const router = express.Router()

// 登陆
router.post('/manage/login', (req, res) => {
   const {
      username,
      password
   } = req.body
   // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息(包含user)
   let sql = `select * from ?? where accountname=? and password=? limit 1`;
   let post = ['d_taiwan.accounts',username,md5(password)]
   preSql(sql,post)
      .then(result => {
         if (result.length <= 0) {
            // 登陆失败
            res.send({
               status: 1,
               data:'no data',
               msg: '用户名或密码不正确!'
            })
         } else {
            // 登陆成功
            let user = result[0]
            delete user.password
            //签发token 指定过期时间 7 天
            const token = jwt.sign({
               id: user.UID
            }, PRIVATE_KEY, {
               expiresIn: '3 days'
            });
            //const token = jwt.sign({id: user._id}, PRIVATE_KEY, { expiresIn: '15 s' });

            //0是默认值 1GM 2玩家 3代理

            let roleSql = 'SELECT * from dnf_service.role WHERE rid =?';
            let post = [user.role_id]
            preSql(roleSql,post)
               .then(result => {
                  let role = result[0]
                  
                  user.role = role.menus.split(",")
                  // 返回登陆成功信息(包含user和token)
                  res.send({
                     status: 0,
                     data: {
                        user,
                        token
                     },
                     msg:'no msg'
                  })
               })
         }
      })
      .catch(error => {
         console.error('登陆异常', error)
         res.send({
            status: 1,
            data:'no data',
            msg: '登陆异常, 请重新尝试'
         })
      })
})

//检查token
router.post('/check_token', (req, res) => {
   res.status(200).json({
      status: 0,
      data:'no data',
      msg: 'token有效'
   })
})


require('./player')(router)
require('./product')(router)
require('./role')(router)
require('./user')(router)
require('./credit')(router)

module.exports = router