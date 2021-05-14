const md5 = require('blueimp-md5');
const {
  getCaptcha,
  _getNewSqlParamEntity
} = require('../utils/')
const {
  preSql,
  execTrans
} = require('../controller/DbController')


module.exports = (router) => {
  let imgText
  let userIp
  //获取图片验证码
  router.get('/imgcode', (req, res) => {
    //获取玩家注册的ip
    userIp = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;
    console.log(userIp)

    let result = getCaptcha()
    imgText = result.text
    console.log(imgText);
    res.type('svg');
    res.status(200).send(result.captchaData);
  })

  // 一般玩家注册
  router.post('/register', (req, res) => {
    // 读取请求参数数据
    const {
      accountname,
      password,
      vcode,
    } = req.body
    console.log(imgText, vcode);
    //先判断验证码
    if (imgText !== vcode) {
      res.send({
        status: 1,
        msg: '验证码错误，请刷新重试'
      })
    } else {
      // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
      // 查询(根据username)
      let qSql = 'SELECT accountname,ip FROM ?? WHERE accountname = ? or ip =?'
      let post = ['d_taiwan.accounts', accountname, userIp]
      preSql(qSql, post)
        .then(results => {
          let user = results[0]
          // 如果user有值(已存在)
          if (user) {
            // 返回提示错误的信息
            res.send({
              status: 1,
              data: 'no data',
              msg: '此用户已存在,或该IP已经注册账号'
            })
            //中断promise链
            return new Promise(() => {})
          } else {
            //插入之前删除vcode
            delete req.body.vcode
            //没找到用户名就可以插入
            let iSql = `INSERT INTO d_taiwan.accounts SET ?`;
            var post = {
              ...req.body,
              password: md5(password || '123456'),
              reg_date: new Date(),
              ip:userIp
            };

            //插入操作
            preSql(iSql, post)
              .then(results => {
                //插入成功后初始化用户信息
                if (0 != results.affectedRows) {
                  //拿到刚插入的UID
                  post.UID = results.insertId
                  //返回数据不需要返回密码
                  delete post.password
                  const {
                    UID
                  } = post

                  initUserSql1 = 'INSERT INTO d_taiwan.member_info SET ?'
                  initUserSql2 = 'INSERT INTO d_taiwan.member_white_account SET ?'
                  initUserSql3 = 'INSERT INTO taiwan_login.member_login SET ?'
                  initUserSql4 = 'INSERT INTO taiwan_cain_2nd.member_avatar_coin SET ?'

                  //开局送点券，也是防止之后充值的时候没有记录无法执行更新语句
                  initUserSql5 = 'INSERT INTO taiwan_billing.cash_cera SET ?';
                  initUserSql6 = 'INSERT INTO taiwan_billing.cash_cera_point SET ?';
                 
                  //插入进行事务处理，否则玩家登录会提示信息错误
                  let sqlParamsEntity = [];
                  sqlParamsEntity.push(_getNewSqlParamEntity(initUserSql1, {
                    m_id: UID,
                    user_id: UID
                  }));
                  sqlParamsEntity.push(_getNewSqlParamEntity(initUserSql2, {
                    m_id: UID
                  }));
                  sqlParamsEntity.push(_getNewSqlParamEntity(initUserSql3, {
                    m_id: UID
                  }));
                  sqlParamsEntity.push(_getNewSqlParamEntity(initUserSql4, {
                    m_id: UID
                  }));
                  sqlParamsEntity.push(_getNewSqlParamEntity(initUserSql5, {
                    account: UID,
                    cera: 2000,
                    mod_tran: 0,
                    mod_date: new Date(),
                    reg_date: new Date()
                  }));
                  sqlParamsEntity.push(_getNewSqlParamEntity(initUserSql6, {
                    account: UID,
                    cera_point: 2000,
                    mod_date: new Date(),
                    reg_date: new Date()
                  }));

                  execTrans(sqlParamsEntity, (err, info) => {
                    if (err) {
                      //失败了删除刚刚插入的那一条记录
                      console.log('事务执行失败')
                      console.log(err);
                      let sql = 'DELETE FROM ?? WHERE UID=?'
                      preSql(sql, ['d_taiwan.accounts', UID])
                        .then(() => {
                          res.send({
                            status: 1,
                            data: 'no data',
                            msg: '用户初始化失败'
                          })
                        })
                    } else {
                      console.log('事务执行成功')
                      // 成功了返回数据
                      res.send({
                        status: 0,
                        data: post,
                        msg: '创建用户成功'
                      })
                    }

                  })
                }
              })
          }
        })
        .catch(error => {
          console.error('注册异常', error)
          res.send({
            status: 1,
            msg: '注册异常, 请重新尝试'
          })
        })
    }

  })
}