let pool = require('../db/index')
var async = require("async");
module.exports = {
  db: (sql) => {
    return new Promise((r, j) => {
      pool.query(sql, (error, results) => {
        if (error) {
          return j(error)
        };
        r(results)
      })
    })
  },
  //预编译
  preSql: (sql, post) => {

    return new Promise((r, j) => {
      //查看完成sql
      let query = pool.query(sql, post, (error, results) => {

        if (error) {
          return j(error)
        };
        r(results)
      })
      // console.log(query.sql);
    })
  },
  //处理事务的方法 https://www.php.cn/mysql-tutorials-363926.html
  execTrans: (sqlparamsEntities, callback) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        return callback(err, null);
      }
      connection.beginTransaction(function (err) {
        if (err) {
          return callback(err, null);
        }
        console.log("开始执行transaction，共执行" + sqlparamsEntities.length + "条数据");
        var funcAry = [];
        sqlparamsEntities.forEach(function (sql_param) {
          var temp = function (cb) {
            var sql = sql_param.sql;
            var param = sql_param.params;
            connection.query(sql, param, function (tErr, rows, fields) {
              if (tErr) {
                connection.rollback(function () {
                  console.log("事务失败，" + sql_param + "，ERROR：" + tErr);
                  throw tErr;
                });
              } else {
                return cb(null, 'ok');
              }
            })
          };
          funcAry.push(temp);
        });

        async.series(funcAry, function (err, result) {
          console.log("transaction error: " + err);
          if (err) {
            connection.rollback(function (err) {
              console.log("transaction error: " + err);
              connection.release();
              return callback(err, null);
            });
          } else {
            connection.commit(function (err, info) {
              console.log("transaction info: " + JSON.stringify(info));
              if (err) {
                console.log("执行事务失败，" + err);
                connection.rollback(function (err) {
                  console.log("transaction error: " + err);
                  connection.release();
                  return callback(err, null);
                });
              } else {
                connection.release();
                return callback(null, info);
              }
            })
          }
        })
      });
    });
  }
}