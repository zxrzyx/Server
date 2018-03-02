const { message: { checkSignature } } = require('../qcloud')
const { mysql: config } = require('../config')

var array = null;




/**
 * 响应 GET 请求（响应微信配置时的签名检查请求）
 */
async function get (ctx, next) {
    const { signature, timestamp, nonce, echostr } = ctx.query
    if (checkSignature(signature, timestamp, nonce)) ctx.body = echostr
    else ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

    const body = ctx.query;
    var roomId = body.roomId;

    var knex = require('knex')({
      client: 'mysql', //指明数据库类型，还可以是mysql，sqlite3等等
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.pass,
        database: config.db,
        charset: config.char,
        multipleStatements: true
      }
    });

    var result = await knex('room').where({
      id: roomId,
    }).select().then(res => {
      console.log(res);
      return res;
    });

    if (result != null) {
      ctx.body = result[0];
    } else {
      ctx.body = "Null room";
    }
}

async function post (ctx, next) {
    // 检查签名，确认是微信发出的请求
    const { signature, timestamp, nonce } = ctx.query
    if (!checkSignature(signature, timestamp, nonce)) ctx.body = 'ERR_WHEN_CHECK_SIGNATURE'

    /**
     * 解析微信发送过来的请求体
     * 可查看微信文档：https://mp.weixin.qq.com/debug/wxadoc/dev/api/custommsg/receive.html#接收消息和事件
     */
    const body = ctx.request.body;
    const value = JSON.stringify(body);
    //array[0] = body;

    var knex = require('knex')({
      client: 'mysql', //指明数据库类型，还可以是mysql，sqlite3等等
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.pass,
        database: config.db,
        charset: config.char,
        multipleStatements: true
      }
    });

    knex('room').insert({
      id: body.roomId,
      master: body.userInfo,
      role: body.info
      }).then(res => {
      console.log(res);
    });

    ctx.body = body;
}

module.exports = {
    post,
    get
}
