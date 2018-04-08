(function($){
	
	//上一步
	var pre = function(target){
		var state = $.data(target, 'wizard');
		if( state.step.pre )
			goStep(target, state.step.pre, false);
	};
	
	//下一步
	var next = function(target){
		var state = $.data(target, 'wizard');
		var $c = $("#" + state.step.name, target);
		if( !$c.form("validate") ){//先验证下
			return;
		}
		var step = state.step;
		if( step.onBeforeNext ){
			var data = getParameter(target, step);//取得当前步骤的参数
			var next = step.onBeforeNext.call(target, step, data);
			if( next == false){
				return false;
			}
		}
		if( step.next ){
			goStep(target, step.next, true);
		}
	};
	
	//关闭
	var close = function(target){
		Dialog.close(target, false);
	};
	
	//步骤添加参数
	var addParams = function(target, param){
		var steps = $.data(target, 'wizard').steps;
		for( var i = 0 ; i < steps.length; i++ ){
			if( steps[i].name == param.step ){
				$.extend(steps[i].params, param.params);
			}
		}
	};
	
	//步骤添加参数
	var setTitle = function(target, title){
		$(".wizard-title",target).html(title);
	};
	
	//设置子标题
	var setSubTitle = function(target, param){
		$(".wizard-title-sub",target).html(param);
	};
	
	//设置子Footer
	var setSubFooter = function(target, param){
		$(".wizard-footer-sub",target).html(param);
	};
	
	//跳转到指定步骤
	var goStep = function(target, step, reload){
		var $c = target;
		var state = $.data(target, 'wizard');
		var url = ctx + step.jsp;
		$(".wizard-title",$c).html(step.title);
		$(".wizard-next",$c).val(step.button || step.title);
		var $content = $(".wizard-content",$c);
		$content.children().hide();
		var div = $("#" + step.name, $content);
		var data = getParameter(target, step.pre);//取得上一个页面的参数
		if( !div.exist() || reload){
			div.remove();//删除之前已经存在的DIV
			$(target).parent().mask("正在加载数据...");
			$.post(url, data, function(text){
				var $div = $("<div id='" + step.name + "' style='height:100%;'>" + text + "</div>");
				$div.appendTo($content);
				$.initValid($("#" + step.name, $content));
				if( !text.contains("Page.init(") ){
					Page.parse($div);//如果没有初始化页面则需要初始化
				}
				if( step.onLoad ){
					step.onLoad.call(target, step, data);
				}
				if( step.pre && step.pre.onNext ){
					step.pre.onNext.call(target, step, data);
				}
				$(target).parent().unmask();
			});
		}else{
			$("#" + step.name ,$content).show();
		}
		state.step = step;
		if( step.first ){
			$(".wizard-pre",$c).hide();
		}else{
			$(".wizard-pre",$c).show();
		}
		return data;
	};
	
	//取得参数
	var getParameter = function(target, step){
		var params = $.data(target, 'wizard').params || {};
		if( step ){
			var $c = $("#" + step.name, target);
			var parameter = Form.getParams($c);
			return $.extend(parameter, params, step.params);
		}
		return params;
	};
	
	//取得参数
	var getOptions = function(target, step){
		var options = $.data(target, 'wizard');
		return options;
	};
	
	//步骤是否存在
	var getStep = function(target, name){
		var steps = $.data(target, 'wizard').steps;
		for( var i = 0 ; i < steps.length; i++ ){
			if( steps[i].name == name ){
				return steps[i];
			}
		}
		return null;
	};
	
	//添加步骤
	var addStep = function(target, param){
		var steps = $.data(target, 'wizard').steps;
		if( param.after ){
			var step = getStep(target, param.step.name);
			if( step == null){//步骤不存在则添加
				var list = [];
				for(var i = 0; i < steps.length; i++){
					list.push(steps[i]);
					if( steps[i].name == param.after ){//在指定步骤后插入
						list.push(param.step);
					}
				}
				$.data(target, 'wizard').steps = list;
				initSteps(target);
				return true;
			}else{
				$.extend(step, param.step);//覆盖当前步骤的参数
				initSteps(target);
			}
		}
		return false;
	};
	
	//删除步骤
	var removeStep = function(target, name){
		var list = [];
		var removedStep = null;
		var steps = $.data(target, 'wizard').steps;
		for(var i = 0; i < steps.length; i++){
			if( steps[i].name == name ){
				removedStep = steps[i];
			}else{
				list.push(steps[i]);
			}
		}
		$.data(target, 'wizard').steps = list;
		initSteps(target);
		return removedStep;
	};
	
	//初始化步骤链表
	var initSteps = function( target ){
		var steps = $.data(target, 'wizard').steps;
		for(var i = 0, previous = null ; i < steps.length; i++){
			steps[i].pre = previous;
			previous ? previous.next = steps[i] : null;
			previous = steps[i];
			steps[i].params = steps[i].params || {};
		}
		steps[0].first = true;
		steps[steps.length - 1].last = true;
	};

	//initialize
	var init = function( target ){
		var $c = target;
		$(".wizard-pre",$c).click(function(){
			pre(target);
		});
		$(".wizard-next",$c).click(function(){
			next(target);
		});
		$(".wizard-close",$c).click(function(){
			close(target);
		});
		initSteps(target);
	};

	$.fn.wizard = function(options, param){
		if (typeof options == 'string'){
			return $.fn.wizard.methods[options](this, param);
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'wizard');
			if (state){
				$.extend(state, options);
			} else {
				state = $.data(this, 'wizard', $.extend({}, $.fn.wizard.defaults, $.fn.wizard.parseOptions(this), options));
				init(this);
			}
			goStep(this, state.steps[0]);
		});
	};
	
	$.fn.wizard.methods = {
		options:function(jq, param){
			return getOptions(jq[0], param);
		},
		next:function(jq){
			return jq.each(function(){
				next(this);
			});
		},pre:function(jq){
			return jq.each(function(){
				pre(this);
			});
		},close:function(jq){
			return jq.each(function(){
				close(this);
			});
		},addParams:function(jq, param){
			return jq.each(function(){
				addParams(this, param);
			});
		},setTitle:function(jq, param){
			return jq.each(function(){
				setTitle(this, param);
			});
		},setSubTitle:function(jq, param){
			return jq.each(function(){
				setSubTitle(this, param);
			});
		},setSubFooter:function(jq, param){
			return jq.each(function(){
				setSubFooter(this, param);
			});
		},addStep:function(jq, param){
			return jq.each(function(){
				addStep(this, param);
			});
		},removeStep:function(jq, param){
			return jq.each(function(){
				removeStep(this, param);
			});
		}
	};
	
	$.fn.wizard.parseOptions = function(target){
		var params = $(".wizard-params",target).val() || "{}";
		var options = $.parser.parseOptions(target,[{steps:'object'}]);
		options.params = $.eval(params);
		return options;
	};
	
	$.fn.wizard.defaults = {
	};
})(jQuery);