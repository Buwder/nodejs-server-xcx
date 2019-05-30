var uuid=require('node-uuid');
var math=require('../util/mathUtil');
var ejs=require('ejs');
var ms=require('../util/mysqlUtil');
var sql=require('../util/sqlMapUtil').sql;
var request = require('request');

exports.userreport = function(req,res,next){
    res.render('user/index')
}
exports.login = function(req,res,next){
    res.render('user/login')
}
exports.checklogin = function(req,res,next){
    res.send({code:0})
}
exports.list = function(req,res,next){
    ms.exc(ejs.render(sql.userSQL.userList),function(data){
        var result = {};
        if(data.length > 0){
            result['list'] = data;
            result['code'] = 0;
            res.render('user/list',result)
        }else{
            result['code'] = -1;
            res.render('user/list',result)
        }
    })
}
exports.report = function(req,res,next){
    var parm = req.query;
    ms.exc(ejs.render(sql.userSQL.report,parm),function(data){
        //计算
        //zzdarr专注度平均值
        //fsdarr放松度平均值
        //zzdmax专注度最大值
        //zzdmin专注度最小值 
        //fsdmax放松度最大值 
        //fsdmin放松度最小值
        //meditation放松度
        //attention专注度
        
        if(data.length > 0){
            var dataarr = JSON.parse(data[0].datasj)

        //训练时长
        var times = 0;
        var firstdata = new Date(dataarr[0].date.replace(/\-/g, "/"));
        var lastdata = new Date(dataarr[dataarr.length-1].date.replace(/\-/g, "/"));
        times = parseInt(lastdata-firstdata)/ 1000 
        
        //训练得分
        var zzdarr = [];
        var fsdarr = [];
        for(var i=0;i<dataarr.length;i++){
            fsdarr.push(parseInt(dataarr[i].meditation))
            zzdarr.push(parseInt(dataarr[i].attention))
        }
        var sum = eval(zzdarr.join("+"));
        var sums = eval(fsdarr.join("+"));
        var zzdmax=Math.max.apply(null,zzdarr),
            zzdmin=Math.min.apply(null,zzdarr),
            fsdmax=Math.max.apply(null,fsdarr),
            fsdmin=Math.min.apply(null,fsdarr),
            zzdafraid = ~~(sum/zzdarr.length*100)/100,
            fsdafraid = ~~(sums/fsdarr.length*100)/100;
        
        var score = (zzdafraid+fsdafraid)/2;
        //记录日期
        var recordate = dataarr[dataarr.length-1].date.substring(0,10);
        //开始时间
        var startime  = dataarr[0].date.substring(10,20);
        //结束时间
        var endtime = dataarr[dataarr.length-1].date.substring(10,20);
        //数据统计概率
        var zzdscore1=[],zzdscore2=[],zzdscore3=[],zzdscore4=[],zzdscore5=[];
        for(var i in zzdarr){
            if(zzdarr[i]>=1 && zzdarr[i]<=19){
            zzdscore1.push(zzdarr[i])
            }
            if(zzdarr[i]>=20 && zzdarr[i]<=39){
            zzdscore2.push(zzdarr[i])
            }
            if(zzdarr[i]>=40 && zzdarr[i]<=59){
            zzdscore3.push(zzdarr[i])
            }
            if(zzdarr[i]>=60 && zzdarr[i]<=79){
            zzdscore4.push(zzdarr[i])
            }
            if(zzdarr[i]>=80 && zzdarr[i]<=100){
            zzdscore5.push(zzdarr[i])
            }
        }
        zzdscore1 = ((zzdscore1.length/zzdarr.length)*100).toFixed(2) + "%";
        zzdscore2 = ((zzdscore2.length/zzdarr.length)*100).toFixed(2) + "%";
        zzdscore3 = ((zzdscore3.length/zzdarr.length)*100).toFixed(2) + "%";
        zzdscore4 = ((zzdscore4.length/zzdarr.length)*100).toFixed(2) + "%";
        zzdscore5 = ((zzdscore5.length/zzdarr.length)*100).toFixed(2) + "%";
        

        var fsdscore1=[],fsdscore2=[],fsdscore3=[],fsdscore4=[],fsdscore5=[];
        for(var i in fsdarr){
            if(fsdarr[i]>=1 && fsdarr[i]<=19){
            fsdscore1.push(fsdarr[i])
            }
            if(fsdarr[i]>=20 && fsdarr[i]<=39){
            fsdscore2.push(fsdarr[i])
            }
            if(fsdarr[i]>=40 && fsdarr[i]<=59){
            fsdscore3.push(fsdarr[i])
            }
            if(fsdarr[i]>=60 && fsdarr[i]<=79){
            fsdscore4.push(fsdarr[i])
            }
            if(fsdarr[i]>=80 && fsdarr[i]<=100){
            fsdscore5.push(fsdarr[i])
            }
        }
        fsdscore1 = ((fsdscore1.length/fsdarr.length)*100).toFixed(2) + "%";
        fsdscore2 = ((fsdscore2.length/fsdarr.length)*100).toFixed(2) + "%";
        fsdscore3 = ((fsdscore3.length/fsdarr.length)*100).toFixed(2) + "%";
        fsdscore4 = ((fsdscore4.length/fsdarr.length)*100).toFixed(2) + "%";
        fsdscore5 = ((fsdscore5.length/fsdarr.length)*100).toFixed(2) + "%";
        var newData = {
            username:data[0].username,
            sex:data[0].sex,
            age:data[0].age,
            module1:{
            "testtime":times,
            "testscore":score,
            "recordate":recordate,
            "startime":startime,
            "endtime":endtime,
            "zzdafraid":zzdafraid,
            "fsdafraid":fsdafraid,
            "zzdmax":zzdmax,
            "zzdmin":zzdmin,
            "fsdmax":fsdmax,
            "fsdmin":fsdmin,
            "zzdscore":{"zzdscore1":zzdscore1,"zzdscore2":zzdscore2,"zzdscore3":zzdscore3,"zzdscore4":zzdscore4,"zzdscore5":zzdscore5},
            "fsdscore":{"fsdscor1":fsdscore1,"fsdscore2":fsdscore2,"fsdscore3":fsdscore3,"fsdscore4":fsdscore4,"fsdscore5":fsdscore5}
            }
        };

        res.render('user/report',{info:newData,data:dataarr})
        }else{
            res.send('<script>alert("用户没有测评数据！");window.history.go(-1)</script>')
        }
        
    })
}