const config = require('./config')
const mysql = require("mysql");


// 使用连接池，提升性能
let pool = mysql.createPool(config);

module.exports = pool;