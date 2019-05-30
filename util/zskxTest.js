(function($) {
	$.extend({
		zskxTest : function(json, saveKey, u, condition) {
			var key = saveKey + '_test_answer';
			var q = $.extend(true, {}, json);
			var answer = [];//答案
			var i = 0;//当前下标
			var qs = json.questions;
			var user = u;//{"age":26,"gender":"FEMALE","id":126,"name":"G26"};
			if(!user){
				uesr = {};
			}
			var beginIndex = -1;
			var endIndex = -1;
			var qNums = [];
			if(condition){
				q.misfit = eval('(function(user){'+condition+'})(u);');
			}

			            /**
             * parse the variable question.autoFillAnswer
             */
            var parseQuestion = function(_question) {
                var autoFillAnswer = _question.autoFillAnswer;
                autoFillAnswer = autoFillAnswer && typeof autoFillAnswer === "string" && JSON.parse(autoFillAnswer) || autoFillAnswer;
                _question.autoFillAnswer_key = autoFillAnswer && autoFillAnswer.key || "";
                _question.autoFillAnswer_value = autoFillAnswer && autoFillAnswer.value && JSON.stringify(autoFillAnswer.value) || "";
                return _question
            }
			
			var getQ = function(i){
				  try {
                    var value = json.questions[i];
                    value = parseQuestion(value);
                } catch (e) {
                    console.log(e)
                }
				if(value.commChoice){
					var temp = json.commChoices[value.commChoice];
					//value.type = temp.type;
					value = $.extend({}, value, temp);
					delete value.commChoice;
				}
				//数轴特殊一些
				if(value.type == "NUMBERAXIS" && !value.count){
					var temp = "";
					var count = 0;
					for(var key in value.choiceGroup){
						var cs = value.choiceGroup[key];
						for(var i in cs.choices){
							temp = cs.choices[i].title;
							if(count==0){
								value.minDesc = temp;
							}
							count ++;
						}
					}
					value.maxDesc = temp;
					value.count = count;
				}
				return value;
			};
			
			var exeScript = function(script){//目的是能取到User
				if(!script){
					return true;
				}
				if(script.search('return')==-1){
					script = 'return ' + script;
				}
				return eval('((function(){' + script + '})())');
			};
			
			(function(){
				for(var i=0; i<qs.length; i++){
					var t = qs[i];
					var skip = exeScript(t.beforeScript);
					if(skip !== false){
						endIndex = i;
						qNums.push(i);
						if(beginIndex < 0){
							beginIndex = i;
						}
					}
				}
			})();
			
			var save = function(){
				var temp = null;
				if(answer && answer.length){
					temp = JSON.stringify(answer);
				}
				//保存
				if(window.localStorage){//支持 localStorage
					if(temp){
						localStorage.setItem(key, temp);
					}else{
						localStorage.removeItem(key);
					}
				}else{
					//只能用cookie了
					$.cookie(key, temp);
				}
			};

			q.setUser = function(u){
				user = u;
			};
			
			/**
			 * 移除答案
			 */
			q.removeAnswer = function(){
				answer = [];
				save();
			};
			
			/**
			 * 开始测试
			 */
			q.beginTest = function(){
				answer = [];
				i = 0;
				save();
				return getQ(qNums[i]);
			};
			
			/**
			 * 继续测试
			 */
			q.continueTest = function(){
				var index = answer.length-1;
				var j=0;
				for(; j<qNums.length; j++){
					if(index == qNums[j]){
						i=j;
						break;
					}
				}
				return getQ(qNums[i]);
			};
			
			/**
			 * 是否完成测试
			 */
			q.isFinsh = function(){
				//判断最后一题是否有答案
				return (i==qNums.length-1) && answer[qNums[i]] && answer[qNums[i]].length>0;
			};
			
			/**
			 * 返回true表示可以进行下一题测试
			 */
			q.isContinue = function(){
				
			};
			/**
			 * 取得测试总题数
			 */
			q.count = function(){
				return qNums.length;
			};
			/**
			 * 取得下一题
			 * 如果上一题未答, 返回 undifiend
			 */
			q.nextQuestion = function(){
				var temp = qNums[i];
				if(answer[temp]){
					i++;
					temp = qNums[i];
					return getQ(temp);
				}
			};
			/**
			 * 保存答案
			 * 参数必须为数组,如[A]
			 */
			q.answer = function(a){
				answer[qNums[i]] = a;
				save();
			};
			
			/**
			 * 取得答案
			 */
			q.getAnswer = function(){
				return answer[qNums[i]];
			};
			
			/**
			 * 取出所有答案
			 */
			q.allAnswer = function(){
				return $.extend(true, [], answer);//复制一份,以防页面损坏
			};
			
			/**
			 * 取得答案字符串
			 */
			q.allAnswerStr = function(){
				return JSON.stringify(answer);//复制一份,以防页面损坏
			};
			
			/**
			 * 从本地读取得答案
			 */
			q.readAnswerLocal = function(){
				var string2Json = function(str){
					return eval('(' + str + ')');
				};
				var retVal = null;
				if(window.localStorage){//支持 localStorage
					retVal = localStorage.getItem(key);
				}else{
					retVal = $.cookie(key);
				}
				if(retVal == null){
					return [];
				}
				return string2Json(retVal);
			};
			answer = q.readAnswerLocal();//重新获取答案
			
			/**
			 * 取得上一题
			 */
			q.upQuestion = function(){
				
				var temp = qNums[i];
				if(temp > 0){
					i--;
					temp = qNums[i];
					return getQ(temp);
				}
			};
			
			/**
			 * 取得测试题的类型
			 */
			q.nowType = function(){
				return qs[qNums[i]].type;
			};
			/**
			 * 取得测试题索引
			 */
			q.nowIndex = function(){
				return i;
			};
			/**
			 * 开始个数
			 */
			q.upCount = function(){
				return i;
			};
			/**
			 * 结束个数
			 */
			q.lastCount = function(){
				return qNums.length - 1 - i;
			};
			
			return q;
		}
	});
})(jQuery);
