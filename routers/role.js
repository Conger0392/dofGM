
const {
  preSql
} = require('../controller/DbController');


/* 
注册权限管理路由
*/
module.exports = function (router) {
  // 添加权限
  router.post('/manage/role/add', (req, res) => {
    const {
      roleName
    } = req.body
    let sql = `INSERT INTO dnf_service.role SET ?`;
    var post = {
      name: roleName,
      //这里使用Date.now()插入的数据是0000-00-00 00:00:00
      create_time: new Date()
    };

    /**
     *  
     *  在主键自增的情况下，
     *  fieldCount: 0,  
        affectedRows: 1, 表示数据表中受影响的行数，数据插入成功则为1，失败则为0；
        insertId: 4,   是数据插入成功后对应的主键id，如果主键不自增，则insertId为0。
        serverStatus: 2,  
        warningCount: 0,  
        message: '',   
        protocol41: true,  
        changedRows: 0
     */
    preSql(sql, post)
      .then(result => {
        // console.log(result);
        res.send({
          status: 0,
          data: 'no data',
          msg: '添加权限成功'
        })
      })
      .catch(error => {
        console.error('添加权限异常', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '添加权限异常, 请重新尝试'
        })
      })
  })

  // 获取权限列表
  router.get('/manage/role/list', (req, res) => {
    //表名用??占位
    let sql = 'select * from ??'
    preSql(sql,['dnf_service.role'])
      .then(result => {
      
        res.send({
          status: 0,
          data: result,
          msg:'获取列表成功'
        })
      })
      .catch(error => {
        console.error('获取权限列表异常', error)
        res.send({
          status: 1,
          data: 'no data',
          msg: '获取权限列表异常, 请重新尝试'
        })
      })
  })

  // 更新权限(设置权限)
  router.post('/manage/role/update', (req, res) => {
    const role = req.body
 
    role.auth_time = new Date()
    
    let sql = 'UPDATE dnf_service.role SET menus = ?,auth_time = ?,auth_name=? WHERE rid = ?';
    var post = [
      role.menus.toString(),
      //这里使用Date.now()插入的数据是0000-00-00 00:00:00 不知为何?
      new Date(),
      role.auth_name,
      role.rid
    ];
    preSql(sql,post)
      .then(results => {
        
        res.send({
          status: 0,
          data: 'no data',
          msg:'设置成功'
        })
      })
      .catch(error => {
        console.error('更新权限异常', error)
        res.send({
          status: 1,
          msg: '更新权限异常, 请重新尝试'
        })
      })
  })
}