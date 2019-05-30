var math=require('../util/mathUtil');
var ejs=require('ejs');
var ms=require('../util/mysqlUtil');
var sql=require('../util/sqlMapUtil').sql;
var request = require('request');
var fs = require('fs');

/*用户登录*/
exports.login=function(req,res,next){
    var postParam=req.query;
	
    ms.exc(ejs.render(sql.userSQL.userInfoSelf,postParam),function(userInfo){
        var result={code:1};
        console.log(userInfo[0].status);
        if(userInfo.length>0){
            if(userInfo[0].status == 'EXPIRED'){
                result['code'] = -1;
                result['msg'] = '用户已过期';
                res.send(result);
            }else{
                /*放入session*/
                result['code']=0;
                result['msg']='success';
                result['user_id'] = userInfo[0].id;
                result['completed'] = userInfo[0].completed;
                result['brief_name'] = userInfo[0].brief_name;
                result['test_center_name'] = userInfo[0].test_center_name;
                res.send(result);
            }
	 }else{
            result['code'] = 1;
            result['msg'] = '用户名或密码错误';
            res.send(result);
        }
    })
}
//
exports.userinfos = function(req,res,next){
    var parm = req.query;
    ms.exc(ejs.render(sql.userSQL.userinfos,parm),function(userinfo){
        res.send(userinfo)
    })  
}
//查询用户信息
exports.userinfomember = function(req,res,next){
    var memberparm = req.query;
    ms.exc(ejs.render(sql.userSQL.usermemberinfo,memberparm),function(memberinfo){
        res.send(memberinfo);
    })
}
//保存用户信息
exports.saveuserinfo = function(req,res,next){
    var parm = req.query;
	if(parm.password == undefined){
	    ms.exc(ejs.render(sql.userSQL.savememberinfos,parm),function(data){
        	if(data.protocol41 == true){
            	res.send({'msg':"success",'code':0})
        	}else{
            	res.send({'msg':"fali","code":1})
        	}
    	   })
	}else{
	    ms.exc(ejs.render(sql.userSQL.savememberinfo,parm),function(data){
		console.log(data,parm);
        	if(data.protocol41 == true){
            	res.send({'msg':"success",'code':0})
        	}else{
            	res.send({'msg':"fali","code":1})
        	}
	    })

	}
}
//查询干预套餐
exports.searchpack = function(req,res,next){
    ms.exc(ejs.render(sql.userSQL.packlist),function(packdata){
        res.send(packdata)
    })
}
//通过干预套餐id去查询分类下的所有干预资源
exports.packdetail = function(req,res,next){
    var parm = req.query;
    var parmdetail = {};
    var decomparm = {"packageid":parm.packageid,"type":"DECOMPRESSANIME"};
    ms.exc(ejs.render(sql.userSQL.packlistdetail,decomparm),function(data){
        parmdetail.decom = data;
        var musicparm = {"packageid":parm.packageid,"type":"MUSIC"};
        ms.exc(ejs.render(sql.userSQL.packlistdetail,musicparm),function(data){
            parmdetail.music = data;
            var trainparm = {"packageid":parm.packageid,"type":"TRAINANIME"};
            ms.exc(ejs.render(sql.userSQL.packlistdetail,trainparm),function(data){
                parmdetail.train = data;
                res.send(parmdetail);
            })
        })
    })
}
//查询量表信息
exports.searchitems= function(req,res,next){
    var parm = req.query
    ms.exc(ejs.render(sql.userSQL.searchitems,parm),function(data){
        res.send(data);
    })
}

//用户查看报告nodejs渲染
exports.testbegin = function(req,res,next){
    var parm = req.query;
    ms.exc(ejs.render(sql.userSQL.searchitems,parm),function(info){
	        
        var userid = {'userid':info[0].user_id};
        ms.exc(ejs.render(sql.userSQL.usermemberinfo,userid),function(data){
            info[0].itemid = parm.itemid;
            delete info[0].test_answer
            res.render('user/report',{"jsons":JSON.stringify(info[0]),"nowUser":data[0]});
        })
    })
}
//开始答题
exports.testinfo =function(req,res,next){
    var parm  = req.query;
   
    ms.exc(ejs.render(sql.userSQL.searchitems,parm),function(data){
        
        var userid = {'userid':data[0].user_id};
	 ms.exc(ejs.render(sql.userSQL.usermemberinfo,userid),function(userinfo){
            
	    delete data[0].test_answer
            
            userinfo[0].itemid = parm.itemid;
            delete userinfo[0].test_answer

            res.render('user/test',{"jsons":JSON.stringify(data[0]),"nowUser":JSON.stringify(userinfo[0]),"userid":userid});
        })
    })
}
//保存答案
exports.saveanswer = function(req,res,next){
       var parm = req.query;
    request.post('',{"form": parm},function(error,response){
        
	res.send({"data":response.body});
    })
} 
//查询小程序token
exports.keycode = function(req,res,next){
    var assurl = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx0cf9e170be2f058e&secret=250f89270e3cc4383188dc4418c1b883';
    request(assurl, function (error, response) {
        if (!error && response.statusCode == 200) {
            res.render('user/keycode',{"xcxtoken":response.body})
        }
    })
}
//根据简称查询是否存在医院
exports.checktestcenter = function(req,res,next){
    var parm = req.query;
    ms.exc(ejs.render(sql.userSQL.checktestcentername,parm),function(data){
        if(data.length < 1){
            res.send({'data':'-1'});
        }else{
            res.send({'data':data[0]});
        }  
    })
}
//生成机构小程序码
exports.postcode = function(req,res,next){
    var parm = req.query;   
    var newparm = JSON.stringify({'path':parm.path,'width':parm.width,is_hyaline:true}); 
    request({method:'POST',url: parm.urls,body: newparm }).pipe(fs.createWriteStream('./util/images/keycode/'+parm.testcenter+'.png'));
    fs.exists('./util/images/keycode/'+parm.testcenter+'.png', function(exists) {  
        if(exists){
            res.send({"code":"0"})
        }
    }); 
    
}   

//文件上传
exports.upload = function(req,res,next){
    var multer=require('multer');
    //设置文件上传的public/upload路径
    var uploadDir='./util/tmp/';
    
    //规定只上传一张图片 使用single 多个用array
    var upload=multer({dest:uploadDir}).array('thumbnailon',2);
    //多个文件上传
    upload(req,res,function(err){
        if(err){
            res.send(JSON.stringify("<script>alert('文件上传失败');window.history.back()</script>"));
            console.error(err);
        }else{
            //循环处理
            var fileCount=req.files.length;
             req.files.forEach(function(i){
                 //设置存储的文件路径
                 var uploadFilePath=uploadDir+i.originalname;
                 //获取临时文件的存储路径
                 var uploadTmpPath=i.path;
                 //读取临时文件
                 fs.readFile(uploadTmpPath,function(err,data){
                     if(err){
                        console.error('[System] '+err.message);
                     }else{
                         //读取成功将内容写入到上传的路径中，文件名为上面构造的文件名
                         fs.writeFile(uploadFilePath,data,function(err){
                             if(err){
                                console.error('[System] '+err.message);
                             }else{
                                 //写入成功,删除临时文件
                                 fs.unlink(uploadTmpPath,function(err){
                                     if(err){
                                        console.error('[System] '+err.message);
                                     }else{
                                        console.log('[System] '+'Delete '+uploadTmpPath+' successfully!');
                                     }
                                 });
                             }
                         });
                     }
                 });
            });
            //返回
            res.send(JSON.stringify("<script>alert('文件上传成功');window.history.back()</script>"));
        }
    });
}