
const {
  pageFilter,
  pageMysqlFilter
} = require('../utils')
const {
  preSql
} = require('../controller/DbController');
/* 
注册商品管理路由
*/
module.exports = function (router) {

  // 添加道具
  router.post('/manage/product/add', (req, res) => {
    const item = req.body
    let qSql = 'SELECT ?? FROM ?? WHERE itemName = ? OR itemCode =?'
    let post = ['itemName', 'dnf_service.pvf_item', item.ItemName, item.ItemCode]
    preSql(qSql, post)
      .then(results => {
        let item = results[0]
        // 如果user有值(已存在)
        if (item) {
          // 返回提示错误的信息
          res.send({
            status: 1,
            data: 'no data',
            msg: '此道具已存在'
          })
          //中断promise链
          return new Promise(() => {})
        } else {
          let iSql = `INSERT INTO dnf_service.pvf_item SET ?`;
          var post = {
            ...req.body
          }
          //插入操作
          preSql(iSql, post)
            .then(results => {

              if (0 != results.affectedRows) {
                // 返回包含user的json数据
                res.send({
                  status: 0,
                  data: 'no data',
                  msg: '添加道具成功'
                })
              }
            })
            .catch(error => {
              console.error('添加道具异常', error)
              res.send({
                status: 1,
                msg: '添加道具异常, 请重新尝试'
              })
            })
        }
      })

  })


  // 获取道具分页列表
  router.get('/manage/product/list', (req, res) => {

    const {
      pageNum,
      pageSize
    } = req.query

    let pageSql = 'SELECT COUNT(*) FROM ??;SELECT * FROM ?? ORDER BY id DESC LIMIT ?,? ';
    preSql(pageSql, ['dnf_service.pvf_item', 'dnf_service.pvf_item', (pageNum - 1) * pageSize, pageSize * 1])
      .then(results => {
        // 计算分页信息

        res.send({
          status: 0,
          data: pageMysqlFilter(results, pageNum, pageSize),
          msg: 'no msg'
        })
      })
      .catch(error => {
        console.error('获取商品列表异常', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '获取商品列表异常, 请重新尝试'
        })
      })
  })
 


  // 搜索道具列表
  router.get('/manage/product/search', (req, res) => {
    const {
      pageNum,
      pageSize,
      itemName,
      itemCode,
      email
    } = req.query
    let SearchSql
    let post

    if (itemName) {
      //通过名字模糊查询
      SearchSql = 'SELECT Id,ItemName,ItemCode FROM ?? where itemName like ? '
      post = ['dnf_service.pvf_item', '%' + itemName + '%']
    } else if (itemCode) {
      //通过代号模糊查询
      SearchSql = 'SELECT Id,ItemName,ItemCode FROM ?? where itemCode like ? '
      post = ['dnf_service.pvf_item', '%' + itemCode + '%']
    } else {
      //都没有证明空点击搜索
      SearchSql = 'SELECT COUNT(*) FROM ??; SELECT * FROM ?? LIMIT ?,?';
      post = ['dnf_service.pvf_item', 'dnf_service.pvf_item', (pageNum - 1) * pageSize, pageSize * 1]
    }

    preSql(SearchSql, post)
      .then(results => {

        if (itemName || itemCode) {
          //如果有email，代表是从发送邮件的select框发送的
          if (email === 'email') {
            //返回格式统一
            data = {
              list: results
            }
          } else {
            //暂时没想到其他方法分页,这样每次都需要将全部数据进行遍历（还好数据少）
            //如果超过1000条还是得写成下面的或者显示前100条
            data = pageFilter(results, pageNum, pageSize)
          }
        } else {
          
          data = pageMysqlFilter(results, pageNum, pageSize)
        }
        res.send({
          status: 0,
          data: data,
          msg: 'no msg'
        })
      })
      .catch(error => {
        console.error('搜索商品列表异常', error)
        res.send({
          status: 1,
          msg: '搜索商品列表异常, 请重新尝试'
        })
      })
  })

  // 更新道具
  router.post('/manage/product/update', (req, res) => {
    const product = req.body

    let updateSql = 'UPDATE ?? SET itemName = ?,itemCode = ? WHERE ID = ?';
    var post = [
      'dnf_service.pvf_item',
      product.ItemName,
      product.ItemCode,
      product.Id
    ];
    preSql(updateSql, post)
      .then(results => {

        if (0 != results.affectedRows) {

          res.send({
            status: 0,
            data: 'no data',
            msg: '更新道具成功'
          })
        }
      })
      .catch(error => {
        console.error('更新商品异常', error)
        res.send({
          status: 1,
          msg: '更新商品名称异常, 请重新尝试'
        })
      })
  })

  // 删除道具
  router.post('/manage/product/delete', (req, res) => {
    const {
      Id
    } = req.body
    let sql = 'DELETE FROM ?? WHERE Id=?'
    let post = ['dnf_service.pvf_item', Id]
    preSql(sql, post)
      .then((results) => {
        res.send({
          status: 0,
          data: 'no data',
          msg: '删除道具成功'
        })
      })
  })


}