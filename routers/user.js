const md5 = require('blueimp-md5');
const {
  preSql,
  execTrans
} = require('../controller/DbController')

const {
  pageFilter,
  tts,
  _getNewSqlParamEntity
} = require('../utils/')
/* 
注册用户管理路由
*/
module.exports = function (router) {
  // 添加用户
  router.post('/manage/user/add', (req, res) => {
    // 读取请求参数数据
    const {
      accountname,
      password
    } = req.body

    // 处理: 判断用户是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
    // 查询(根据username)
    let qSql = 'SELECT ?? FROM ?? WHERE accountname = ?'
    let post = ['accountname', 'd_taiwan.accounts', accountname]
    preSql(qSql, post)
      .then(results => {
        let user = results[0]
        // 如果user有值(已存在)
        if (user) {
          // 返回提示错误的信息
          res.send({
            status: 1,
            data: 'no data',
            msg: '此用户已存在'
          })
          //中断promise链
          return new Promise(() => {})
        } else {
          //没找到用户名就可以插入
          let iSql = `INSERT INTO d_taiwan.accounts SET ?`;
          var post = {
            ...req.body,
            password: md5(password || '123456'),
            reg_date: new Date()
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
                //mod_tran 好像是哪个角色使用的
                // preSql(rechargeCeraSql, )
                // preSql(rechargePointSql, )

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
          msg: '添加用户异常, 请重新尝试'
        })
      })
  })


  // 更新用户
  router.post('/manage/user/update', (req, res) => {
    const user = req.body
    let updateSql = 'UPDATE d_taiwan.accounts SET accountname = ?,password = ?,qq = ?,role_id = ? WHERE UID = ?';
    var post = [
      user.accountname,
      md5(user.password),
      user.qq,
      user.role_id,
      user.UID
    ];
    preSql(updateSql, post)
      .then(results => {

        if (0 != results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: '更新用户成功'
          })
        } else {
          throw new Error('操作了0条数据')
        }
      })
      .catch(error => {
        res.send({
          status: 1,
          data: 'no data',
          msg: '更新用户异常'
        })
      })
  })



  // 删除用户
  router.post('/manage/user/delete', (req, res) => {
    const {
      uid
    } = req.body
    let sql = 'DELETE FROM ?? WHERE UID=?'
    let post = ['d_taiwan.accounts', uid]
    preSql(sql, post)
      .then((results) => {
        if (1 === results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: '删除用户成功'
          })
        } else {
          throw new Error('操作了0条数据')
        }
      })
      .catch(error => {
        res.send({
          status: 1,
          data: 'no data',
          msg: '删除用户异常'
        })
      })

  })

  // 账号工具
  router.post('/manage/user/acctool', (req, res) => {
    const {
      UID,
      type
    } = req.body
    let sql
    let post
    let msg

    let dungeon = '1|3,2|3,3|3,4|3,5|3,6|3,7|3,8|3,9|3,11|3,12|3,13|3,14|3,15|3,16|1,17|3,21|3,22|3,23|3,24|3,25|3,26|3,27|3,31|3,32|3,33|3,34|3,35|3,36|3,37|3,40|3,41|2,42|3,43|3,44|3,45|3,50|3,51|3,52|3,53|3,60|3,61|3,62|2,63|3,64|3,65|3,67|3,70|3,71|3,72|3,73|3,74|3,75|3,76|3,77|3,80|3,81|3,82|3,83|3,84|3,85|3,86|3,87|3,88|3,89|3,90|3,91|2,92|3,93|3,100|3,101|3,102|3,103|3,104|3,110|3,111|3,112|3,140|3,141|3,502|3,511|3,515|1,518|1,521|3,1000|3,1500|3,1501|3,1502|3,1507|1,3506|3,10000|3'
    switch (type) {
      case 'removeReg':
        sql = 'update d_taiwan.limit_create_character set count=? where m_id = ?'
        post = [0, UID]
        msg = '解除注册限制'
        break;
      case 'dungeonAll':
        sql = 'update taiwan_cain.member_dungeon set dungeon=? where m_id=?'
        post = [dungeon, UID]
        msg = '副本全开'
        break;
      case 'ban':
        sql = 'insert into d_taiwan.member_punish_info SET ?'
        post = {
          m_id: UID,
          punish_type: '1',
          occ_time: '2015-10-31 00:00:00',
          punish_value: '101',
          apply_flag: '2',
          start_time: '2015-10-31 00:00:00',
          end_time: '9999-12-31 23:59:59',
          reason: 'GM',
        }
        msg = '封禁用户'
        break;
      case 'unban':
        sql = 'DELETE FROM d_taiwan.member_punish_info WHERE m_id=?'
        post = [UID]
        msg = '解封用户'
        break;

      default:
        break;
    }
    preSql(sql, post)
      .then((results) => {

        if (1 === results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: msg + '成功'
          })
        } else {
          throw new Error('操作了0条数据')
        }
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: 1,
          data: 'no data',
          msg: msg + '异常'
        })
      })

  })
  // 角色工具
  router.post('/manage/user/gRoleTool', (req, res) => {
    const {
      mid,
      type
    } = req.body
    let sql
    let post
    let msg

    switch (type) {
      case 'openLR':
        sql = 'update taiwan_cain.charac_stat set add_slot_flag=? where charac_no=?'
        post = [3, mid]
        msg = '开启左右槽'
        break;
      case 'clearPets':
        sql = 'delete from taiwan_cain_2nd.creature_items where charac_no=?'
        post = [mid]
        msg = '清空宠物'
        break;
      case 'clearFashion':
        sql = 'delete from taiwan_cain_2nd.user_items where charac_no=?'
        post = [mid]
        msg = '清空时装'
        break;
      case 'clearBags':
        sql = 'update taiwan_cain_2nd.inventory set inventory=? where charac_no=?'
        post = ['', mid]
        msg = '清空背包'
        break;
        //这里不知道什么条件表中才有数据,应该先查一下有没有 有在删除插入 如果直接用更新语句会发生什么?
      case 'nolimitLevEq':
        sql1 = 'delete from taiwan_cain.charac_manage_info where charac_no =?'
        sql2 = 'insert into taiwan_cain.charac_manage_info SET?'
        post = {
          charac_no: mid,
          max_equip_level: '95'
        }
        preSql(sql1, [mid])
          .then((result) => {
            if (1 === result.affectedRows) {
              preSql(sql2, post)
                .then((result) => {
                  if (1 === result.affectedRows) {
                    res.send({
                      status: 0,
                      data: 'no data',
                      msg: '解除装备限制成功'
                    })
                  } else {
                    throw new Error('insert error');
                  }
                })
            } else {
              throw new Error('delete error');
            }
          })
          .catch(error => {
            console.log(error);
            res.send({
              status: 1,
              data: 'no data',
              msg: '解除装备限制异常'
            })
          })
        return;
      case 'Secondary':
        sql1 = 'select expert_job from taiwan_cain.charac_info where charac_no=? limit 1'
        sql2 = 'update taiwan_cain.charac_stat set expert_job_exp=? where charac_no=?'
        preSql(sql1, [mid])
          .then((result) => {

            if (0 !== result.affectedRows) {
              if (result[0].expert_job < 1) {
                res.send({
                  status: 1,
                  data: 'no data',
                  msg: '该角色没有学习副职业'
                })
              } else {
                preSql(sql2, [2054, mid])
                  .then((result) => {
                    if (1 === result.affectedRows) {
                      res.send({
                        status: 0,
                        data: 'no data',
                        msg: '满级了'
                      })
                    } else throw new Error('update expert_job error')
                  })
              }
            } else throw new Error('select expert_job error')
          })
          .catch(error => {
            console.log(error);
            res.send({
              status: 1,
              data: 'no data',
              msg: '开启异常,请检查是否选择角色'
            })
          })
        return;
      default:
        break;
    }

    preSql(sql, post)
      .then((results) => {

        if (0 !== results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: msg + '成功,请重新登录游戏'
          })
        } else {
          throw new Error('oper error')
        }
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: 1,
          data: 'no data',
          msg: msg + '异常,请查看是否重复操作'
        })
      })

  })

  // 角色转职
  router.post('/manage/user/grow', (req, res) => {
    const {
      charac_no,
      job,
      grow_type
    } = req.body
    let sql = 'update taiwan_cain.charac_info SET job=?,grow_type=? WHERE charac_no = ?'

    let post = [job, grow_type, charac_no]
    preSql(sql, post)
      .then((results) => {
        if (1 === results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: '转职成功,重新登陆游戏'
          })
        } else {
          throw new Error('更新了0条数据')
        }
      })
      .catch(error => {
        console.log(error);
        res.send({
          status: 1,
          data: 'no data',
          msg: '角色转职异常'
        })
      })

  })

  // 更新pk点
  router.post('/manage/user/updatePK', (req, res) => {
    const {
      pvp_grade,
      pvp_point,
      charac_no,
      win
    } = req.body
    let updateSql = 'UPDATE taiwan_cain.pvp_result SET pvp_grade = ?,win = ?,pvp_point = ?,win_point = ? WHERE charac_no = ?';
    var post = [
      pvp_grade,
      win,
      pvp_point,
      pvp_point,
      charac_no
    ];
    preSql(updateSql, post)
      .then(results => {

        if (0 != results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: '更新PK信息成功'
          })
        } else {
          throw new Error('操作了0条数据')
        }
      })
      .catch(error => {
        res.send({
          status: 1,
          data: 'no data',
          msg: '更新PK信息异常'
        })
      })
  })

  // 获取所有用户列表
  router.get('/manage/user/list', (req, res) => {
    let sql = 'SELECT ?? FROM d_taiwan.accounts WHERE accountname <> ?'
    let columns = ['UID', 'accountname', 'qq', 'ip', 'role_id', 'reg_date'];
    let post = [columns, 'conger']
    preSql(sql, post)
      .then(users => {

        let roleSql = 'select * from ??'
        preSql(roleSql, ['dnf_service.role'])
          .then(roles => {

            res.send({
              status: 0,
              data: {
                users,
                roles
              },
              msg: 'no msg'
            })
          })
      })
      .catch(error => {
        console.error('获取用户列表异常', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '获取用户列表异常, 请重新尝试'
        })
      })
  })


  //获取用户下的角色列表
  router.get('/manage/user/gRoleList', (req, res) => {
    const {
      pageNum,
      pageSize,
      UID
    } = req.query


    let sql = `select charac_no,charac_name,job,expert_job,lev,grow_type from taiwan_cain.charac_info where m_id=? and delete_flag<>1 order by charac_no asc`



    preSql(sql, [UID])
      .then(gRoles => {
        res.send({
          status: 0,
          data: pageFilter(tts(gRoles), pageNum, pageSize),
          msg: 'no msg'
        })
      })
      .catch(error => {
        console.error('获取用户角色异常', error)
        res.send({
          status: 1,
          msg: '获取用户角色异常, 请重新尝试'
        })
      })
  })

  // 获取所有在线角色
  router.get('/manage/user/getOnlineRoles', (req, res) => {
    let sql = 'select a.*,b.UID,b.accountname,c.charac_no,d.charac_name ' +
      'from taiwan_login.login_account_3 a ' +
      'join d_taiwan.accounts b on a.m_id = b.UID ' +
      'join taiwan_game_event.event_1306_account_reward c on a.m_id = c.m_id ' +
      'join taiwan_cain.charac_info d on c.charac_no = d.charac_no ' +
      'Where a.login_status = ?'
    let post = ['1']
    preSql(sql, post)
      .then(onlineRoles => {

        res.send({
          status: 0,
          data: tts(onlineRoles),
          msg: 'no msg'
        })


      })
      .catch(error => {
        console.error('获取在线列表异常', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '获取在线列表异常, 请重新尝试'
        })
      })
  })

  // 获取所有在线角色
  router.get('/manage/user/allGameRoles', (req, res) => {
    let sql = 'select charac_no,charac_name from ??'
    let post = ['taiwan_cain.charac_info']
    preSql(sql, post)
      .then(gameRoles => {

        res.send({
          status: 0,
          data: tts(gameRoles),
          msg: 'no msg'
        })
      })
      .catch(error => {
        console.error('获取在线列表异常', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '获取在线列表异常, 请重新尝试'
        })
      })
  })



}