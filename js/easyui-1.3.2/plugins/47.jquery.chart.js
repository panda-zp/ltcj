(function($){
	
	//显示图表
	var show = function(target, refresh){
		var state = $.data(target, 'chart'), opts = state.options;
		if( refresh && opts.url ){
			opts.loaded = true;
			state.chart.showLoading({text: '正在努力的读取数据中...', effect:"bar"});
			opts.loader(target, function(data){
				state.data = data.rows;
				render(target, state.data);//渲染面板
				state.chart.hideLoading();
			});
		}else{
			render(target, state.data);//渲染面板
		}
	};
	
	//渲染图表
	var render = function(target, data){
		var state = $.data(target, 'chart'), opts = state.options;
		var option = state.option;
		if( opts.onBeforeRender.call(target, data) == false ){
			return;
		}
		if( (option.contains("$data") || option.contains("$list")) && !data){
			return;//如果配置有变量，但是无数据直接返回不做渲染
		}
		var $list = new $List([]), $data = data;
		if( $.type(data) == "array" ){
			if( !data.length ){
				$(target).mask($("<div>暂无数据.</div>"));
				return;
			}
			$list = new $List(data);
		}
		try{
			$(target).unmask();
			var options = (new Function("$list, $data"," return " + option + ";"))($list, data);
			setChartOption(target, options, true);
		}catch(E){
			$(target).mask($("<div>暂无数据.</div>"));
		}
	}
	
	//设置图表属性
	var setChartOption = function(target, option, merge){
		var state = $.data(target, 'chart'), opts = state.options;
		if( state.chart && !$.isEmptyObject(option) ){
			state.chart.setOption(option, merge);
		}
	};
	
	//设置异步查询的参数
	var setQueryParams = function(target, queryParams){
		var state = $.data(target, 'chart'), opts = state.options;
		opts.queryParams = $.extend(opts.queryParams, queryParams || {});
	};

	//重新加载数据
	var reload = function(target, params){
		var state = $.data(target, 'chart'), opts = state.options;
		opts.queryParams = params || opts.queryParams;
		show(target, true);
	};
	
	//加载数据
	var loadData = function(target, data){
		var state = $.data(target, 'chart'), opts = state.options;
		opts.loaded = true;
		state.data = data;
		render(target, state.data);//渲染面板
	};
	
	//取得图表配置
	var getChartOption = function(target){
		var state = $.data(target, 'chart'), opts = state.options;
		var option = ($("#options-" + opts.uid).text() || "").trim();
		option = (option.startsWith("{") ? "" : "{") + option + (option.endsWith("}") ? "" : "}");
		return option;
	}
	
	//取得图表对象
	var getChart = function(target){
		var state = $.data(target, 'chart');
		return state.chart;
	};

	//initialize
	var init = function( target ){
		var state = $.data(target, 'chart'), opts = state.options;
		state.chart = echarts.init(target, echarts.theme);
		state.chart.un(echarts.config.EVENT.CLICK);
		state.chart.on(echarts.config.EVENT.CLICK, opts.onClickChart);
		show(target, opts.autoQuery);
	};
	
	//销毁组件
	var destroy = function(target){
		var state = $.data(target, 'chart');
		if( state.chart ){
			state.chart.dispose();
		}
		$(target).remove();
	};
	
	$.fn.chart = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.chart.methods[options](this, param);
			return method;
		}
		options = options || {};
		return this.each(function(){
			var target = this;
			var state = $.data(target, 'chart');
			if (state){
				$.extend(state.options, options);
				init(target);
			} else {
				var opts = $.extend({}, $.fn.chart.defaults, $.fn.chart.parseOptions(target), options);
				state = $.data(this, 'chart', {options: opts});
				state.option = getChartOption(this);
				init(target);
			}
		});
	};
	
	$.fn.chart.methods = {
		options:function(jq, param){
			return $.data(jq[0],"chart").options
		},destroy:function(jq, param){
			return jq.each(function(){
				destroy(this);
			});
		},loadData:function(jq, param){
			return jq.each(function(){
				loadData(this, param);
			});
		},reload:function(jq, param){
			return jq.each(function(){
				reload(this, param);
			});
		},setQueryParams:function(jq, param){
			return jq.each(function(){
				setQueryParams(this, param);
			});
		},getChart:function(jq, param){
			return getChart(jq[0], param);
		}
	};
	
	$.fn.chart.parseOptions = function(target){
		var opts = $.parser.parseOptions(target,["name", "url", "style", "uid", {"maxRows":"number","autoQuery":"boolean"}]);
		opts.queryParams = $.parse($(target).attr("queryParams"));
		return opts;
	};
	
	$.fn.chart.defaults = {
		maxRows:50,
		loaded:false,
		queryParams:{},
		autoQuery:false,
		onBeforeRender:function(){},
		onClickChart:function(param){console.log(param.data);},
		loader:function(target, success, error){
			var state = $.data(target, 'chart'), opts = state.options;
			var parameters = th.toQueryParams(opts.queryParams || {});
			$.post(opts.url, {"parameters":$.toJSON(parameters),"maxRows":opts.maxRows},function(text){
				var data = $.eval(text);
				state.list = data.rows;
				state.total = data.total;
				success ? success(data) : null;
			});
		}
	};
})(jQuery);