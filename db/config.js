module.exports = {
  host: "ip地址",
  user: "用户名",
  password: "密码",
  charset:'latin1',
  connectionLimit: 10,
  //连接等待时间 连接池将立即返回错误
  waitForConnections: false,
  //使用连接池
  useConnectionPooling: true,
  //支持多语句
  multipleStatements:true
}
