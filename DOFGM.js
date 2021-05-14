/*
应用的启动模块
1. 通过express启动服务器
2. 使用中间件
 */

const express = require('express')
const app = express() // 产生应用对象

let pool = require('./db/index')


// 声明使用静态中间件
app.use(express.static('public'))

// 声明使用解析post请求的中间件
app.use(express.urlencoded({
  extended: true
})) // 请求体参数是: name=tom&pwd=123
// app.use(express.json()) // 请求体参数是json结构: {name: tom, pwd: 123}

// 声明使用解析cookie数据的中间件
const cookieParser = require('cookie-parser')
const session = require('express-session');
app.use(cookieParser())

// 声明使用token验证的中间件
app.use(require('./middleware/token-verify'))

app.use(session({
  secret: "ekybocat",
  name: "sessionId",
  resave: false,
  saveUninitalized: false,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));

// 声明使用路由器中间件
const indexRouter = require('./routers')
app.use('/', indexRouter)

app.get('/test', function (req, res) {
  res.send({
    code: 0,
    data: 'hello react test'
  })
})


const {
  SERVER_CONFIG
} = require('./config')


pool.getConnection((err, connection) => {
  if (err) {
    console.error('连接数据库失败： ' + err.stack);
    return;
  }
  console.log('连接数据库成功!!!')
  //连接不再使用，返回到连接池
  connection.release()
  // 只有当连接上数据库后才去启动服务器
  app.listen(SERVER_CONFIG.port, () => {
    console.log(`服务器启动成功, 请访问: http://localhost:${SERVER_CONFIG.port}`)
  })
});