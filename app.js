var express = require('express');
var bodyParser=require('body-parser');
var cookieParser=require('cookie-parser');
var session = require('express-session')
var http = require('http');
var path = require('path');
var ejs=require('ejs');

var otherConfig=require('./configFiles/config').otherConfig;

var routes = require('./routes');

var initSQL=require('./util/sqlMapUtil').initSQL;

var app = express();
var server=http.createServer(app);

var util = require('util');
//监听端口
app.set('port', process.env.PORT || otherConfig.port);

//视图设置
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html',ejs.__express);
//静态文件
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'util')));
//post请求拿参数支持
app.use(bodyParser.urlencoded({extended: true}));
//cookie支持，session支持需要cookie支持
app.use(cookieParser());
//session支持
app.use(session({
    secret:'snowPanther',
    name: 'sid',
    cookie: {maxAge: 1000*60*60*24 },
    resave: false,
    saveUninitialized: true
}));
//路由控制
routes(app);
//启动监听
server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
    /*初始化sql*/
    initSQL();

    //处理全局未捕获错误
    process.on('uncaughtException', function (err) {
        console.log("错误:" + err);
        console.log("错误调用栈:" + err.stack);
    });
    
    //监控内存信息
    console.log(util.inspect(process.memoryUsage()));
});