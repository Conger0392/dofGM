const {
  preSql,
  execTrans
} = require('../controller/DbController')

const {
} = require('../utils/')

/* 
充值邮件路由
*/
module.exports = function (router) {

  //这里为什么无法用let定义？
  
  //定义一个泡点定时器对象
  global.bubObj
  //定义一个泡点状态 0关闭 1开启
  let bubStatus = false
  global.bubTime
  global.bubamount


  // 充值D币D点等
  router.post('/manage/credit/recharge', (req, res) => {
    const {
      UID,
      reType,
      mid,
      amounts
    } = req.body

    let rechargeSql
    let post
    switch (reType) {
      case '0':
        //更新D币 在注册用户的时候提前插入数据就不用在这里查询再选择了
        rechargeSql = 'update taiwan_billing.cash_cera set cera=(cera+?) where account=?';
        post = [amounts, UID]
        break;
      case '1':
        //更新D点 在注册用户的时候提前插入数据就不用在这里查询再选择了
        rechargeSql = 'update taiwan_billing.cash_cera_point set cera_point=(cera_point+?) where account=?';
        post = [amounts, UID]
        break;
      case '2':
        //更新时装点 不知为何无效
        rechargeSql = 'update taiwan_cain_2nd.member_avatar_coin set avatar_coin=(avatar_coin+?) where m_id=?';
        post = [amounts, UID]
        break;
      case '3':
        //更新金币 不知为何无效

        rechargeSql = 'update taiwan_cain_2nd.inventory set money=(money+?) where charac_no=?';
        post = [amounts, mid]
        break;
      case '4':
        //更新SP点 不知为何无效
        rechargeSql = 'update taiwan_cain_2nd.skill set remain_sp=(remain_sp+?) where charac_no=?';
        post = [amounts, mid]
        break;
      case '5':
        //更新TP点 不知为何无效
        rechargeSql = 'update taiwan_cain_2nd.skill set remain_sfp_2nd=(remain_sfp_2nd+?) where charac_no=?';
        post = [amounts, mid]
        break;
      case '6':
        //更新QP点 不知为何无效
        rechargeSql = 'update taiwan_cain.charac_quest_shop set qp=(qp+?) where charac_no=?';
        post = [amounts, mid]
        break;
      default:
        //都没匹配到默认充值D点
        rechargeSql = 'update taiwan_billing.cash_cera_point set cera_point=(cera_point+?) where account=?';
        post = [amounts, UID]
        break;
    }

    preSql(rechargeSql, post)
      .then(results => {
        // console.log(result);
        if (0 != results.affectedRows) {
          res.send({
            status: 0,
            data: 'no data',
            msg: '充值成功'
          })
        } else {
          res.send({
            status: 1,
            data: 'no data',
            msg: '充值失败,请联系管理'
          })
        }

      })
      .catch(error => {
        console.error('充值系统故障', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '充值系统故障请联系管理'
        })
      })
  })

  // 发送邮件
  router.post('/manage/credit/postal', (req, res) => {
    const {
      item_id,
      amplify_option,
      amplify_value,
      upgrade,
      seperate_upgrade,
      gold,
      sealFlag,
      addInfo,
      mid
    } = req.body

    //发送邮件
    let postal = `insert into taiwan_cain_2nd.postal 
         (occ_time,send_charac_name,receive_charac_no,item_id,add_info,upgrade,amplify_option,amplify_value,gold,seal_flag,letter_id,seperate_upgrade)
          values 
          (?,?,?,?,?,?,?,?,?,?,?,?)`;

    post = [new Date(), 'GM大大', mid, item_id, addInfo, upgrade || 0, amplify_option, amplify_value || 0, gold || 0, sealFlag === 'true' ? true : false, '0', seperate_upgrade]

    preSql(postal, post)
      .then(results => {
        // console.log(result);
        if (0 != results.affectedRows) {
          res.send({
            status: 0,
            data: 'no data',
            msg: '发送成功'
          })
        } else {
          res.send({
            status: 1,
            data: 'no data',
            msg: '发送失败,请联系管理'
          })
        }

      })
      .catch(error => {
        console.error('邮件系统故障', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '邮件系统故障请联系管理'
        })
      })
  })


  // 在线邮件
  router.post('/manage/credit/postalOnline', (req, res) => {
    const {
      onlineItemId,
      onlineAddInfo,
      mids
    } = req.body


    let tmp = []
    if (typeof mids === 'string') {
      //目前有个问题前端传入单个id后端会自动变为string类型 暂时转换一下
      tmp.push(mids)
    }

    tmp = mids
    //发送邮件
    let postal = `insert into taiwan_cain_2nd.postal 
           (occ_time,send_charac_name,receive_charac_no,item_id,add_info,upgrade,amplify_option,amplify_value,gold,seal_flag,letter_id,seperate_upgrade)
            values 
            (?,?,?,?,?,?,?,?,?,?,?,?)`;

   
    tmp.forEach((item) => {
      post = [new Date(), 'GM大大', item, onlineItemId, onlineAddInfo, 0, 0, 0, 0, false, '0', 0]
      preSql(postal, post)
    })
    res.send({
      status: 0,
      data: 'no data',
      msg: '操作成功'
    })

  })
  // 泡点相关
  router.post('/manage/credit/bubble', (req, res) => {
    const {
      amounts,
      accounts,
      bubTime,
      bubOper
    } = req.body


    // console.log('后端拿到的类型是: '+ typeof accounts);
    let tmp = []
    if (typeof accounts === 'string') {
      //目前有个问题前端传入单个id后端会自动变为string类型 暂时转换一下
      tmp.push(accounts)

    }

    tmp = accounts

    switch (bubOper) {
      //如果泡点操作是get就返回当前泡点状态
      case 'get':
        currentBubTime = global.bubTime
        currentBubAmount = global.bubamount
        res.send({
          status: 0,
          data: {
            bubStatus,
            currentBubTime,
            currentBubAmount
          },
          msg: 'no msg'
        })
        break;
      case 'open':

        //如果当前状态是关闭
        if (!bubStatus) {
          global.bubTime = bubTime
          global.bubamount = amounts
          //每隔n秒发送一次泡点
          let sql
          let sqlParamsEntity = [];
          global.bubobj = setInterval(() => {
            
            tmp.forEach((item) => {
              sql = (`update taiwan_billing.cash_cera set cera = cera+${amounts} where account=?`)
              sqlParamsEntity.push({
                sql,
                params: [item]
              });

            })

           
           
            execTrans(sqlParamsEntity, (err, info) => {
              if (err) {
                //失败了删除刚刚插入的那一条记录
                console.log('事务执行失败')
                console.log(err);
              } else {
                console.log('事务执行成功')
                //执行成功清空数组,下一次重新开始
                sqlParamsEntity = []

              }

            })

          }, (bubTime || 30) * 1000);
          //进来之后把状态变成开启
          bubStatus = true
          res.send({
            status: 0,
            data: 'no data',
            msg: '泡点已开启'
          })
        } else {
          //如果状态已经是开启了
          res.send({
            status: 1,
            data: 'no data',
            msg: '泡点已开启，如果有误请联系管理'
          })
        }
        break;
      case 'close':

        //设置泡点状态
        bubStatus = false
        //清除定时器
        clearInterval(global.bubobj)
        res.send({
          status: 0,
          data: 'no data',
          msg: '已关闭泡点'
        })
        break;
      default:
        break;
    }
  })
}