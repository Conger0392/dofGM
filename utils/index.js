const {
  t2s
} = require('simplebig')

const svgCaptcha = require('svg-captcha');

module.exports = {
  /*
得到指定数组的分页信息对象
 */
  pageFilter: (arr, pageNum, pageSize) => {
    pageNum = pageNum * 1
    pageSize = pageSize * 1
    const total = arr.length
    const pages = Math.floor((total + pageSize - 1) / pageSize)
    const start = pageSize * (pageNum - 1)
    const end = start + pageSize <= total ? start + pageSize : total
    const list = []
    for (var i = start; i < end; i++) {
      list.push(arr[i])
    }

    return {
      pageNum,
      total,
      pages,
      pageSize,
      list
    }
  },

  pageMysqlFilter: (results, pageNum, pageSize) => {
    // console.log(results);
    let total = results[0][0]['COUNT(*)'];
    let pages = Math.floor((total + pageSize - 1) / pageSize)
    let list = results[1];
    return {
      total,
      pages,
      list,
      pageNum,
      pageSize
    }
  },
  //将传进来的名字繁体转成简体
  tts: (result) => {
    result.map((item) => {

      item.charac_name = t2s(item.charac_name)
    })
    return result

  },
  _getNewSqlParamEntity: (sql, params, callback) => {
    if (callback) {
      return callback(null, {
        sql: sql,
        params: params
      });
    }
    return {
      sql: sql,
      params: params
    };
  },
  getCaptcha: () => {
    var captcha = svgCaptcha.create({
      // 翻转颜色 
      inverse: false,
      // 字体大小 
      fontSize: 36,
      // 噪声线条数 
      noise: 2,
      // 宽度 
      width: 80,
      // 高度 
      height: 30,
    });

    return {
      text: captcha.text.toLowerCase(),
      captchaData: captcha.data
    }
  },
}