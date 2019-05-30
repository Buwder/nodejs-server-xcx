(function($){
	function hiddens(){
		$("#messages").css('visibility','hidden')
	}
	$.fn.zskxTestUI = function(setting){
		var con = this;
		var options=[],options2=[];
		var ps = $.extend({
			question: null,
			itemId: null,
			customer : null,						//{"age": '', "gender": '', "edu": ''},
			guideTmpl: "#guide-tmpl", //简介模板
			testTmpl: "#test-tmpl", //测试
			endTmpl: "#end-tmpl", //结束
			singleTmpl: "#single-tmpl", //单选
			numberaxisTmpl: "#numberaxis-tmpl", //数轴
			ravenTmpl: "#raven-tmpl", //瑞文
			childTmpl: "#child-tmpl", //子题
		    onNext: function(current, total) { },	//下一题
		    onSubmit: function(param) { },			//questionId, version, itemId, answer
		    onBeginTest: function(){ },
		    onCloseTest: function(){ }
		}, setting);
		
		for(var i in ps){
			var v = ps[i];
			if((i+"").indexOf('Tmpl') != -1){
				ps[i] = (typeof v == 'string' ? $(v) : v);
			}
		}
		
		var context = {};
		var submitCount = 0;
		var submit = function(){
			submitCount ++ ;
			con.find('[data-test=btnDown]').html('正在提交...');
			if(submitCount == 1){
				//TODO 提交....
				var param = {
					questionId : ps.question.id,
					version : ps.question.version,
					itemId : ps.itemId,
					answer : t.allAnswerStr()
				};
				ps.onSubmit(param, function(json){
					//结束页
					document.getElementById("lb-title").style.display='none'
					ps.endTmpl.tmpl(json).appendTo(con.empty());
				}, function(){
					t.removeAnswer();//删除答案
				});
			}else if(submitCount > 3){
				//alert('不用那么费劲啦，点击一下就够了:)');
				$("#messages").html('不用那么费劲啦，点击一下就够了:)');
				$("#messages").css('visibility','inherit');
				setTimeout(hiddens,2000)
			}
		};
		
		//修改路径
		
		//题目信息
		var t = $.zskxTest(ps.question.question, ps.itemId, ps.customer, ps.question.condition);
		(function(){
			var qinfo = $.extend({}, ps.question);
			if(t.misfit){
				var gender = {
					MALE : '男',
					FEMALE : '女'
				};
				qinfo.misfit = t.misfit;
				var temp = $.extend({}, ps.customer);
				temp.gender = gender[temp.gender];
				var edus = {"UNDERPRIMARY":"小学以下", "PRIMARY":"小学", "JUNIOR":"中学", "SENIOR":"高中", "SECONDARY":"中专", 
						"COLLEGE":"大专", "UNDERGRADUATE":"本科", "MASTER":"硕士", "DOCTOR":"博士", "POSTDOCTORAL":"博士后"};
				temp.edu = edus[temp.edu];
				qinfo.customer = temp;
			}
			ps.guideTmpl.tmpl(qinfo).appendTo(con.empty());
		})();
		
		var isContinue = function(){
			if(t.allAnswer().length){
				con.find('[data-test=continueQuestion]').show();
			}else{
				con.find('[data-test=continueQuestion]').hide();
			}
		};
		isContinue();
		
		/** 开始测试　*/
		var beginTest = function(isContinue){
			if(t.misfit){
				alert(t.misfit);
				return ;
			}
			//TODO 开始测试回调
			ps.onBeginTest();
			con.empty();
			ps.testTmpl.tmpl({count:t.count()}).appendTo(con);
			ps.testPanel = con.find('[data-test=test_panel]');
			ps.btnUp = con.find('[data-test=btnUp]');
			ps.btnDown = con.find('[data-test=btnDown]');
			ps.progressNow = con.find('[data-test=progressNow]');
			ps.progressPercent = con.find('[data-test=progressPercent]');
			if(isContinue){
				paddingData(t.continueTest());
			}else{
				paddingData(t.beginTest());
			}
			location.hash="#continue";
		};
		
		var paddingData = function(json){
			//修改进度
			context.nowQuestion = json;
			var index = t.nowIndex() + 1;//当前题
			var total = t.count();//总题数
			ps.onNext(index, total);
			json.id=ps.question.id;	
			ps.progressNow.css('width', (index/total*100)+"%");
			ps.progressPercent.html(index + " / " + total);
			
			var questionType = json.type;
			if(questionType == 'SINGLE' || questionType =='MORE'){
				ps.testPanel.empty().append(ps.singleTmpl.tmpl(json));
				if(json.id == "8002" || json.id== "8003" || json.id == "8004"){
					var titles_8002 = ps.testPanel.find("img").attr("src");
					ps.testPanel.find("img").attr("src","test"+titles_8002)
					ps.testPanel.find("img").css({"width":"auto"})
				}
			}
			else if(questionType == 'NUMBERAXIS'){
				ps.testPanel.empty().append(ps.numberaxisTmpl.tmpl(json));
				number = $("[data-choice=NUMBERAXIS]").mobileNumber({
					beginStep : 0,//起始
					endStep : json.count-1,//结束
					onPageChange:function(number){
						var answer = [];
						answer.push(number);
						t.answer(answer);
						toNext();
					}
				 });
			}else if(questionType == 'RAVEN'){
				ps.testPanel.empty().append(ps.ravenTmpl.tmpl(json));
			}else if(questionType == 'CHILD'){
				ps.testPanel.empty().append(ps.childTmpl.tmpl(json));
				var myselect = $("select");
				//myselect[0].selectedIndex = 0;
				myselect.selectmenu();
				myselect.selectmenu('refresh');

				var o1=['5A', '5B', '5C', '5D', '5E', '5F', '5G', '5H', '5I', '5J', '5K', '5L', '5M'];
				var o2=['5Z', '5X'];
				for(var i =0; i<o1.length; i++){
					var a=con.find('[data-out=' + o1[i] + ']');
					options.push(a);
				}
				for(var i =0; i<o2.length; i++){
					var a=con.find('[data-out=' + o2[i] + ']');
					options2.push(a);
				}
			}
			
			//填充答案
			var answer = t.getAnswer();
			if(questionType == 'SINGLE' || questionType =='MORE' || questionType =='MUTEX'){
				for(var key in answer){
					con.find('a[value=' + answer[key] + ']').addClass('test_selected');
				}
			}else if(questionType == 'NUMBERAXIS'){
				if(number){
					var temp = 0;
					if(answer && answer.length>0){
						temp = answer[0];
					}
					$('#knob').val(temp).trigger('change');
					number.moveToPage(temp);
				}
			}else if(questionType == 'RAVEN'){
				for(var key in answer){
					con.find('[choiceValue=' + answer[key] + ']').addClass('sub_s_select');
				}
			}else if(questionType == 'CHILD'){
				for(var key in answer){
					con.find('input[value=' + answer[key] + ']').attr("checked",'checked');
				}
			}
			if(t.lastCount()==0 && (t.isFinsh() ||typeof t.isFinsh() == 'undefined')){
				$('#downButton').html('提交测试');
			};
		};
		
		function toNext(){
			//判断是否完成
			if(t.lastCount() != 0){
				//下一题
				var json = t.nextQuestion();
				if(json){
					setTimeout(function(){
						paddingData(json);
					}, 100);
					return true;
				}
				return false;
			}
			//if(confirm("确认提交答案吗？")){
				submit();
			//}
			
		}
		
		//delegate
		con.delegate('[data-test=startQuestion]', 'click', function(){
			//开始答题
			beginTest(false);
		});
		con.delegate('[data-test=continueQuestion]', 'click', function(){
			//继续答题
			beginTest(true);
		});
		
		//答题 (选择题)
		con.delegate('[data-choice=SINGLE]', 'click', function(){
			var group = $(this).attr('group');
			if($(this).hasClass("test_selected")){
				if($(this).siblings('.test_selected').length != 0){
					$(this).removeClass('test_selected');
				}
				return ;
			}
			$(this).addClass('test_selected').siblings('[group!=' + group + ']').removeClass('test_selected');
			//如果选项组全部选中, 自动进入下一题
			var finshed = true;
			$(this).siblings('[group=' + group + ']').each(function(){
				if(!$(this).hasClass("test_selected")){
					finshed = false;
				}
			});
			
			if(t.lastCount()==0 && t.isFinsh()){
				ps.btnDown.html('提交测试');
			}
			
			var answer = [];
			con.find('.test_selected').each(function(){
				answer.push($(this).attr('value'));
			});
			t.answer(answer);
			
			if(finshed){
				toNext();
			}
		});
		
		// 选择日期并存至答案[['1990-01-01']]  eg: 2071量表
        con.delegate('#wdate', 'focus', function(event) {
            var inputVal = $(this).val();
            if(inputVal !== ''){
                t.answer([inputVal]);
            }else{
                t.answer();
            }
        });	
		//瑞文
		con.delegate("[data-choice=RAVEN]", 'click', function(){
			$(this).addClass('sub_s_select').siblings().removeClass('sub_s_select');
			var answer = [];
			answer.push($(this).attr('choiceValue'));
			t.answer(answer);
			toNext();
			return false;
		});
		
		//子题
		(function(){
			var p = con;
			var hide = function(){
				for(var i =0; i<arguments.length; i++){
					var choice = arguments[i];
					p.find('[data-out=' + choice + ']').remove();
				}
			};
			var show = function(){
				$("#countSelect #myselect").empty();
				for(var i =0; i<arguments.length; i++){
					var choice = arguments[i];
					var a=p.find('[data-out=' + choice + ']');
					if(arguments.length>2){
						$("#countSelect #myselect").append(options[i]);
					}else{
						$("#countSelect #myselect").append(options2[i]);
					}
				}
			};
			var disabled = function(){
				/*
				for(var i =0; i<arguments.length; i++){
					var choice = arguments[i];
					p.find('[value=' + choice + ']').attr('disabled', true);
				}
				*/
			};
			var undisabled = function(){
				for(var i =0; i<arguments.length; i++){
					var choice = arguments[i];
					p.find('[value=' + choice + ']').attr('disabled', false);
				}
			};
			var change = function(){
				$("#countSelect").find("[data-out]").attr("selected",false);
				for(var i =0; i<arguments.length; i++){
					var choice = arguments[i];
					p.find('[value=' + choice + ']').attr("selected","selected");
					var myselect = $("select");
					myselect.selectmenu();
					myselect.selectmenu('refresh');
				}
				getAnswer();
			};
			var answer = [];
			var getAnswer = function(){
				answer = [];
				p.find(":selected[value!='']").each(function(){
					answer.push($(this).val());
				});
			};
			
			p.delegate("select", "change", function(){
				getAnswer();
				var nowAnswer = $(this).val();
				var script = context.nowQuestion.changeAnswer;
				if(script){
					retVal = eval('(function(){'+ script +'})()');
					if(retVal == 'NEXT'){
						t.answer(answer);
						toNext();
					}else if(retVal == 'OK'){
						t.answer(answer);
					}
				}
			});
			
		})();



		//上一题
		con.delegate('[data-test=btnUp]', 'click', function(){
			if(submitCount >0){
				//alert('呃...答案已提交至服务器:)');
				$("#messages").html('呃...答案已提交至服务器:)');
				$("#messages").css('visibility','inherit');
				setTimeout(hiddens,2000)
				return ;
			}
			if(t.upCount() == 0){
				//第一道题
				 //alert('已经是第一道题了！');
				 $("#messages").html('已经是第一道题了！');
				$("#messages").css('visibility','inherit');
				setTimeout(hiddens,2000)
			}else{
				paddingData(t.upQuestion());
				con.find('[data-test=btnDown]').html('下一题');
			}
			return false;
		});
		//下一题
		con.delegate('[data-test=btnDown]', 'click', function(){
			if(t.lastCount() == 0){
				if(t.isFinsh()){
					//完成, 点击提交
					//if(confirm("确认提交答案吗？")){
						submit();
					//}
					
				}
			}else{
				if(!toNext()){
					$("#messages").html('请选择答案');
					$("#messages").css('visibility','inherit');
					setTimeout(hiddens,2000)
					//alert('请选择答案');
				}
			}
		});
		//关闭
		con.delegate('[data-test=close]', 'click', function(){
			//TODO close call back
			ps.onCloseTest();
			ps.guideTmpl.tmpl(ps.question).appendTo(con.empty());
			isContinue();
		});
		
		//hash
		var hash = location.hash;
	    if(hash == '#restart'){
		    beginTest(false);
	    }else if(hash == '#continue'){
		    beginTest(true);
	    }else{
		    isContinue();
	    }
		return this;
	};
	
})(jQuery);
