
var user=require('../controllers/userController');

/*用户路径*/
exports.route=function(app){
    /*用户登录*/
    app.get('/user/login',user.login);
    app.get('/user/userinfos',user.userinfos)
    app.get('/user/memberinfo',user.userinfomember)
    app.get('/user/savememberinfo',user.saveuserinfo)
    app.get('/user/searchpack',user.searchpack)
    app.get('/user/packdetail',user.packdetail)
    app.get('/user/searchitems',user.searchitems)
    app.get('/user/testbegin',user.testbegin)
    app.get('/user/testinfo',user.testinfo)
    app.get('/user/saveanswer',user.saveanswer)
    app.get('/user/keycode',user.keycode)
    app.get('/user/checktestcenter',user.checktestcenter)
    app.get('/user/postcode',user.postcode)
    app.post('/user/upload',user.upload)
}
