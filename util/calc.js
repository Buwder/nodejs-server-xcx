/********************
 *
 * @fileName: calc.js
 * @version: 1.1
 * @description: 分数计算
 * 在report.html中调用: calcQuestionScore(), calcGeneScore(), getAppraise()
 *
 * @main Function List:
 * 1.calcScore() 计算分数
 * 2.calcQuestionScore() 计算题目的分数
 * 3.calcGeneScore() 计算因子的分数
 * 4.getAppraise() 取得因子评语
 * 5.getQuestionScore()  取得原始分数
 * 6.getGeneScore()  取得因子分
 * 7.getAppraiseJava() 
 * 8.getGeneInfoJava() 
 *
 * @history 修改记录
 *
 *
 *
 ********************/

 /**
  * calcScore 计算原始分数
  * @param  {Objdect} checked   选中项选中项及分数
  * @param  {String} script    计算脚本
  * @param   gene
  * @param  {Object} user      用户
  * @param  {String} when      
  * @param  {Array} answer    所有题目答案
  * @param  {Array} highScore  所有题目最高分
  * @return {Number}  retVal    题目或因子分数
  *
  * @history 修改记录
  * 新增rate()计算得分率的方法
  */
  calcScore = function (checked, script, gene, user, when, answer, highScore){
	//var checked = {'A':'2','B':'1','C':'9'};
	var getArgs = function(args){
		var retVal = {};
		if(args.length==0){
			retVal = checked;
		} else {
			for(var i =0; i<args.length; i++){
				var v = args[i];
				if((typeof v) == 'number'){
					retVal[k] = v;
				}
				if((typeof v) == 'object'){
					for(var k in v){
						if((typeof v[k]) == 'number'){
							retVal[k] = v[k];
						}
					}
				};
			}
		}
		return retVal;
	};
	var sum = function(){ // 题目总分
		var args = getArgs(arguments);
		var sum = 0;
		for(var key in args){
			sum = sum + parseFloat(args[key]);
		}
		return sum;
	},
	avg = function(){ // 平均分
		var args = getArgs(arguments);
		if(args.length==0){
			args = checked;
		}
		var sum = 0;
		var count = 0;
		for(var key in args){
			sum = sum + parseFloat(args[key]);
			count ++;
		}
		return sum/count;
	},
	count = function(){ // 题目个数
		var args = getArgs(arguments);
		if(args.length==0){
			args = checked;
		}
		var count = 0;
		var key = null;//去除警告
		for(key in args){
			count ++;
		}
		return count;
	},
	min = function(){ // 最小分
		var args = getArgs(arguments);
		if(args.length==0){
			args = checked;
		}
		var min = null;
		for(var key in args){
			var value = parseFloat(args[key]);
			if(min){
				if(min > value){
					min = value;
				}
			}else{
				min = value;
			}
		}
		return min;
	},
	max = function(){ // 最大分
		var args = getArgs(arguments);
		if(args.length==0){
			args = checked;
		}
		var max = null;
		for(var key in args){
			var value = parseFloat(args[key]);
			if(max){
				if(max < value){
					max = value;
				}
			}else{
				max = value;
			}
		}
		return max;
	},
	/**
	 * rate 得分率(题目总分/所有题目最高分之和)，例8003量表
	 * @return {String}  '50@' 得分率
	 */
	rate = function(){
		var args=getArgs(arguments);
		if(args.length==0){
			args=checked;
		}
		var sum=0,highSum=0;
		for(var key in args){
			sum+=parseFloat(args[key]);
			highSum+=parseFloat(highScore[key]);
		}
		var result=parseFloat(((sum/highSum)*100).toFixed(2));
		return result+'@';		
	};
	if(1==2){//去除警告
		sum();avg();count();min();max();rate();
	}
	if(!script){
		script = 'return sum();';
	}
	if(script.search('return')==-1){
		script = 'return ' + script;
	}
	//不破坏全局
	var retVal = eval('((function(){' + script + '})())');
	if((typeof retVal) == "number"){
		retVal = parseFloat(retVal.toFixed(2));
	}
	return retVal;
}

 eduLevel=function(edu){
	var eduArray = ["PRIMARY", "JUNIOR", "SENIOR", "SECONDARY", "COLLEGE", "UNDERGRADUATE", "MASTER", "DOCTOR", "POSTDOCTORAL"];
	for(var i=0; i<eduArray.length; i++){
		if(edu == eduArray[i]){
			return i+1;
		}
	}
}

function copy(src){
	var retVal = {};
	for(var i in src){
		retVal[i] = src[i];
	}
	return retVal;
}

/**
 * calcQuestionScore 计算题目的分数
 * @param  {Object} calc   题目信息
 * @param  {Array} answer 答案eg: [['A'], ['B']...]
 * @param  {Object} user   用户信息
 * @return {Array} scoreArray  所有题目分数eg: [1,2,0,5...]
 */
 calcQuestionScore = function(calc, answer, user){
	/**
	 * getCalc 取得题目
	 * @param  {*} key 下标
	 * @return {Object} retVal  题目
	 */
	
	
	 getCalc = function(key){
		var temp = calc.question[key].commChoice;
		var retVal = calc.question[key];
		if(temp){
			var t = copy(calc.commChoices[temp]);
			if(retVal.beforeScript){
				t.beforeScript = retVal.beforeScript;
			}
			retVal = t;
		}
		return retVal;
	};
	/**
	 * getAnswerScore 取得题目答案及分数
	 * @param  {*} key 下标
	 * @return {Object}  t  答案及分数eg: {A: '1'}
	 */
	 getAnswerScore = function(key){
		var t = {};
		var value = answer[key];
		for(var i in value){
			t[value[i]] = getCalc(key).choices[value[i]];
		}
		return t;
	};
	 exeScript = function(script){//目的是能取到User
		if(!script){
			return true;
		}
		if(script.search('return')==-1){
			script = 'return ' + script;
		}
		return eval('((function(){' + script + '})())');
	};
	
	var scoreArray = []; // 存储所有题目分数

	// 遍历所有题目计算分数
	for(var key in calc.question){
		var temp = getCalc(key);
		var canCalc = true;
		if(temp.beforeScript){
			canCalc = exeScript(temp.beforeScript);
		}
		if(canCalc !== false){
			if(!answer[key]){
				scoreArray.push(0);
				try{
					window.console.log("The question index " + key + " no answer.");
				}catch (e) {}
			}else{
				try{
					scoreArray.push(calcScore(getAnswerScore(key), temp.calcScript, null, user));
				}catch (e) {
					throw "The question index " + key + " calcScript error. Script:[" + temp.calcScript + "]";
				}
			}
			
		}else{
			scoreArray.push(null);
		}
	}
	return scoreArray;
}

/**
 * calcGeneScore 计算因子分
 * @param  {Array} gene 所有因子
 * @param  {Array} questionScoreArray 所有题目分数
 * @param  {Object} user 用户信息
 * @param  {Array} answer 所有题目答案
 * @param  {Object} questions 所有题目
 * @return {Array} genescoreArray 所有因子分数
 */
function calcGeneScore(gene, questionScoreArray, user,answer,questions){
	/*
	* 计算每道题目的最高分
	* @param highScore = [1,2,5,3,0,2]
	*/
	var highScore=[];
	if(questions){
		for(var i in questions.question){
			var temp=null;
			var q=questions.question[i];
			if(q.commChoice){
				var key=q.commChoice;
				temp=questions.commChoices[key].choices;
			}else{
			            temp=q.choices;	
			}
			var max=0;
			for(var t in temp){
				var value=parseInt(temp[t]);
				if(value>max){
					max=value;
				}
			}
			highScore.push(max);
		}
	}


	var genescoreArray = []; // 所有因子成绩
	var genescores = {};
	for(var key in gene){
		var genescore = {};
		var g = gene[key];
		var score = '-';
		var isView=true;
		if(g.questions){
			var array = g.questions.split(',');
			var temp = {};
			for(var k in array){
				var t = parseInt(array[k]);
				var value = questionScoreArray[t];
				if(value !== null){//跳题运算
					temp[t] = value;
				}
			}
			try{
				score = calcScore(temp, g.calcScript, genescores, user, 'calcGeneScore',answer,highScore);
			}catch (e) {
				throw "Gene [" + g.key + "] calcScript Error."; 
			}
		}else if(g.calcScript){
			try{
				score = calcScore(genescores, g.calcScript, genescores, user, 'calcGeneScore',answer,highScore);
			}catch (e) {
				throw "Gene [" + g.key + "] calcScript Error."; 
			}
		}

		/**
		 * 执行量表库中因子判断脚本
		 * @param  temp.calcScript2 [因子判断脚本]
		 */
		if(g.calcScript2){
			try{
				eval('(function(temp){'+g.calcScript2+'}).call(gene,g);');
			}catch (e) {}
		}
		
		/**
		 * [if 因子分数是否显示]
		 */
		if(g.viewScore){
			isView=true;
		}else{
			isView=false;
		}
		genescores[g.key] = score;
		genescore.key = g.key; 
		genescore.score = score; 
		genescore.isView=isView;
		// eg: genescore: {isView: true,key: "F1",score: 3.67}
		genescoreArray.push(genescore);
	}
	return genescoreArray;
}

function string2Json(str){
	return eval('(' + str + ')');
}
/**
 * getAppraise 取得因子评语
 * @param  {Array} gene  所有因子
 * @param  {Array} geneScore 因子分数
 * @param  {Object} warn  预警
 * @param  {Object} customer  新增用户对象
 * @param  {Object} answer  题目答案
 * @return {Array} retArray  得到评语后的因子
 */
function getAppraise(gene, geneScore, warn, user, answer){
	if(!warn){
		warn = {};
	}
	var geneScoreObj = {};
	for(var i in geneScore){
		var t = geneScore[i];
		geneScoreObj[t.key] = t.score;
	}
	var getScore = function(key){
		return geneScoreObj[key];
	};
	
	/**
	 * handelAppraise 处理评语
	 * @param  {Object} geneDetail  因子详细信息
	 * @param  {Array} scoreArray    因子分数 eg: [2.5]
	 * @param  {Object} retVal    因子分数 eg: {ascore: 3.17, key: "F1", score: 3.17, title: "躯体化"}
	 * @param  {Boolean} forceAppraise    是否强制显示评语
	 * @param warn  预警分数，此预警分数可以定制
	 */
	var handelAppraise = function(geneDetail, scoreArray, retVal, forceAppraise){
		//分数＆评语
		if(geneDetail.viewAppraise || forceAppraise){ //显示评语
			retVal['content'] = '';
			retVal['suggestion'] = '';
			var w = warn[retVal.key];
			if(!w){
				w = [];
			}
			for(var tempI=0; tempI<scoreArray.length; tempI++){
				var score = scoreArray[tempI];
				for(var i=0; i<w.length; i++){
					var o = w[i];
					if(score>=o.min && score<=o.max){
						retVal.warn = true;
						if(!retVal.warnInfo){
							retVal.warnInfo = [];
						}
						retVal.warnInfo.push(o);
					}
				}
				for(var a in geneDetail.appraise){
					var value = geneDetail.appraise[a];
					if(score>=value.minScore && score<=value.maxScore){
						retVal['content'] += value.content;
						retVal['suggestion'] += value.suggestion;
					}
				}
			}
		}
	};
	var get = function(key, scoreArray){
		var retVal = {};
		for(var i in gene){
			var temp = gene[i];
			if(temp.key == key){
				retVal.key = temp.key;
				retVal.title = temp.title;
				handelAppraise(temp, scoreArray, retVal, true);
			}
		}
		return retVal;
	};
	
	var retArray = [];
	for(var i in gene){
		var temp = gene[i];
		var retVal = {};
		retVal.key = temp.key;
		retVal.title = temp.title;
		/**
		 * 执行因子判断脚本
		 * @param  temp.calcScript2 [因子判断脚本]
		 */
		if(temp.calcScript2){
			try{
			eval('(function(){'+temp.calcScript2+'})();');
			}catch (e) {}
			temp=gene[i];
		}

		var scoreArray = getScore(temp.key);

		retVal.ascore=scoreArray;
		if(temp.viewScore){//显示分数
			retVal.score = scoreArray;
		}
		if(typeof scoreArray=="number"){
			scoreArray = [scoreArray];//匹配评语
		}

		if(scoreArray instanceof Array){
			handelAppraise(temp, scoreArray, retVal);
		}else{
			//get(因子代码, 分数)
			if(temp.calcScript){
				try{
					eval('(function(gene, appraise, get, when){'+temp.calcScript+'}).call(retVal, geneScoreObj, gene, get, "report");');
				}catch (e) {
				}
			}
		}		
		retArray.push(retVal);
	}
	return retArray;
}


//java--------------------------------------------
var js2Java = null;
js2Java = function(o){
	if(o instanceof Array){
		var list = new Packages.java.util.ArrayList();
		for(var i=0; i<o.length; i++){
			var t = o[i];
			list.add(js2Java(t));
		}
		return list;
	}
	else if(o instanceof Object){
		var map = new Packages.java.util.LinkedHashMap();
		for(var k in o){
			map.put(k, js2Java(o[k]));
		}
		return map;
	}else{
		return o;
	}
};

/**
 * 取得原始分数
 * @param calc
 * @param answer
 * @param list
 */
function getQuestionScore(calc, answer, list, user){
	if((typeof calc) == 'string'){
		calc = string2Json(calc);
	}
	if((typeof answer) == 'string'){
		answer = string2Json(answer);
	}
	if((typeof user) == 'string'){
		user = string2Json(user);
	}
	var score = calcQuestionScore(calc, answer, user);
	for(var key in score){
		list.add(score[key]);
	}
}

/**
 * 取得因子分
 * @param gene
 * @param questionScore
 * @param list
 */
function getGeneScore(gene, questionScore, list, user,answer,questions){
	if((typeof gene) == 'string'){
		gene = string2Json(gene);
	}
	if((typeof questionScore) == 'string') {
		questionScore = string2Json(questionScore);
	}
	if((typeof user) == 'string'){
		user = string2Json(user);
	}
	if((typeof answer) == 'string'){
		answer = string2Json(answer);
	}
	if((typeof questions) == 'string'){
		questions = string2Json(questions);
	}
	var array = calcGeneScore(gene, questionScore, user,answer,questions);
	for(var key in array){
		var value = array[key];
		var map = new Packages.java.util.LinkedHashMap();
		for(var k in value){
			map.put(k, value[k]);
		}
		list.add(map);
	}
}



//new
// java中调用
function getAppraiseJava(gene, geneScore, list, warn, user, answer){
	if((typeof gene) == 'string'){
		gene = string2Json(gene);
	}
	if((typeof geneScore) == 'string'){
		geneScore = string2Json(geneScore);
	}
	if((typeof warn) == 'string'){
		warn = string2Json(warn);
	}
	if((typeof user) == 'string'){
		user = string2Json(user);
	}
	if((typeof answer) == 'string'){
		answer = string2Json(answer);
	}
	var array = getAppraise(gene, geneScore, warn, user, answer);
	//遍历因子的目的是保证顺序
	for(var i=0; i<array.length; i++){
		var value = array[i];
		list.add(js2Java(value));
	}
}

function getGeneInfoJava(gene, list){
	if ((typeof gene) == 'string') {
		gene = string2Json(gene);
	}
	
	//遍历因子的目的是保证顺序
	for(var i=0; i<gene.length; i++){
		var g = gene[i];
//		if(!g.viewScore){
//			continue;
//		}
		var array = g.appraise;
		if((!array) || array.length==0){
			continue;
		}
		var min = 99999;
		var max = -99999;
		for(var k=0; k<array.length; k++){
			var a = array[k];
			if(a.minScore < min){
				min = a.minScore;
			}
			if(a.maxScore > max){
				max = a.maxScore;
			}
		}
		var map = new Packages.java.util.LinkedHashMap();
		map.put("minScore", min);
		map.put("maxScore", max);
		map.put("key", g.key);
		map.put("title", g.title);
		list.add(map);
	};
}

