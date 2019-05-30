
var userRoute=require('./userRoute');

module.exports=function(app){
    userRoute.route(app);
}