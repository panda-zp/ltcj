(function($){

	//设置标题
	var setTitle = function(target, param){
		var state = getState(target);
		$(".panelx-title0", state.header).empty().append(param);
	};
	
	//设置子标题
	var setTitle1 = function(target, param){
		var state = getState(target);
		$(".panelx-title1", state.header).empty().append(param);
	};
	
	//设置子标题
	var setTitle2 = function(target, param){
		var state = getState(target);
		$(".panelx-title2", state.header).empty().append(param);
	};
	
	//添加工具栏
	var addTool = function(target, param){
		var state = getState(target);
		$(".panelx-tool", state.header).prepend(param);
	};
	
	//设置参数
	var setParams = function(target, param){
		var opts = getOptions(target);
		opts.params = $.extend({}, param);
	};
	
	//设置Body内容
	var setBodyHtml = function(target, param){
		var state = getState(target);
		state.body.html(param);
	};
	
	//设置Body CSS
	var setBodyCss = function(target, style){
		var state = getState(target);
		state.body.css(style);
	};
	
	//设置是否已经加载
	var setLoaded = function(target, param){
		var state = getState(target);
		state.loaded = param;
	};
	
	//设置折叠状态
	var setCollapsed = function(target, collapsed){
		var state = getState(target);
		state.collapsed = collapsed;
		var icon = $(".panelx-tool-expand,.panelx-tool-collapse",state.header);
		if( collapsed ){
			icon.removeClass("panelx-tool-expand").addClass("panelx-tool-collapse");
		}else{
			icon.removeClass("panelx-tool-collapse").addClass("panelx-tool-expand");
		}
	};
	
	//刷新
	var refresh = function( target, param ){
		var state = getState(target);
		var opts = state.options;
		if( $.type(param) == "string" ){
			opts.url = param;
		}else if( $.type(param) == "object" ){
			setParams(target, param);
		}
		state.loaded = false;
		expand(target, false);
	};
	
	//加载，但不展开
	var load = function(target){
		var state = getState(target);
		if( !state.loaded ){
			expand(target, function(){
				state.body.hide();
				state.collapsed = true;
			});
		}
	};
	
	var toggle = function(target){
		var state = getState(target);
		if( state.collapsed ){
			expand(target);
		}else{
			collapse(target, true);
		}
	};
	
	//展开
	var expand = function( target , callback ){
		var state = getState(target);
		var opts = state.options;
		state.body.show();
		setCollapsed(target, false);
		if( !state.loaded ){
			//state.body.html("正在加载数据...");
			opts.loader(target, function(text){
				state.body.html(opts.extractor.call(target,text));
				opts.onBeforeParse.call(target, target);
				$.parser.parse(state.body, true);
				opts.onParse.call(target, target);
				(callback || function(){}).call(this);
				opts.onLoadSuccess.call(target, text);
			});
			state.loaded = true;
		}
	};
	
	//收缩
	var collapse = function( target, animate ){
		var state = getState(target);
		setCollapsed(target, true);
		animate ? state.body.slideUp("fast") : state.body.hide();
	};
	
	//取得配置
	var getOptions = function(target, param){
		var state = $.data(target, 'panelx');
		return state.options;
	};
	
	//取得状态
	var getState = function(target, param){
		var state = $.data(target, 'panelx');
		return state;
	};

    //重置
    var reset = function (target, param) {
        var state = $.data(target, 'panelx');
        var tool = $(".panelx-tool span", state.header);
        if (tool && tool.length > 0)
            tool.remove();
        $(".panelx-title1", state.header).html("&nbsp;");
        $(".panelx-title2", state.header).html("&nbsp;");
        state.loaded = false;
        state.collapsed = true;
        state.body.empty();
    };

    var removeToolBar = function(target, param) {
        var state = $.data(target, 'panelx');
        var tool = $(".panelx-tool span", state.header);
        if (tool && tool.length > 0)
            tool.remove();
    };

	//initialize
	var init = function( target ){
		var state = getState(target);
		var opts = state.options;
		state.loaded = !opts.url;
		if( opts.collapsed ){//如果折叠状态
			state.body.hide();//隐藏
			setCollapsed(target, true);
		}else{
			if( opts.url ){//从URL加载
				expand(target, false);
			}
			setCollapsed(target, false);
		}
		state.header.click(function(){
			toggle(target);
		});
	};

	$.fn.panelx = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.panelx.methods[options](this, param);
			return method;
		}
		options = options || {};
		return this.each(function(){
			var target = this;
			var state = $.data(target, 'panelx');
			if (state){
				$.extend(state, options);
			} else {
				state = $.data(this, 'panelx', {
					options: $.extend({}, $.fn.panelx.defaults, $.fn.panelx.parseOptions(target), options),
					header : $(".panelx-header", target),
					body : $(".panelx-body", target)
				});
				init(target);
			}
		});
	};
	
	$.fn.panelx.methods = {
		options:function(jq, param){
			return getOptions(jq[0], param);
		},load:function(jq){
			return jq.each(function(){
				load(this);
			});
		},refresh:function(jq, param){
			return jq.each(function(){
				refresh(this, param);
			});
		},setLoaded:function(jq, param){
			return jq.each(function(){
				setLoaded(this, param);
			});
		},setParams:function(jq, param){
			return jq.each(function(){
				setParams(this, param);
			});
		},setBodyHtml:function(jq, param){
			return jq.each(function(){
				setBodyHtml(this, param);
			});
		},setBodyCss:function(jq, param){
			return jq.each(function(){
				setBodyCss(this, param);
			});
		},setTitle:function(jq, param){
			return jq.each(function(){
				setTitle(this, param);
			});
		},setTitle1:function(jq, param){
			return jq.each(function(){
				setTitle1(this, param);
			});
		},setTitle2:function(jq, param){
			return jq.each(function(){
				setTitle2(this, param);
			});
		},addTool:function(jq, param){
			return jq.each(function(){
				addTool(this, param);
			});
		},expand:function(jq, param){
			return jq.each(function(){
				expand(this, param);
			});
		},collapse:function(jq, param){
			return jq.each(function(){
				collapse(this, param);
			});
		},toggle:function(jq, param){
			return jq.each(function(){
				toggle(this, param);
			});
		},reset:function(jq, param){
			return jq.each(function(){
				reset(this, param);
			});
		},removeToolBar:function(jq, param){
			return jq.each(function(){
                removeToolBar(this, param);
			});
		}
	};
	
	$.fn.panelx.parseOptions = function(target){
		var options = $.parser.parseOptions(target,["name","style","iconCls","title","subTitle","titleStyle","subTitleStyle","url",{"collapsed":"boolean","cache":"boolean","params":'object'}]);
		return options;
	};
	
	$.fn.panelx.pages = {};
	
	$.fn.panelx.defaults = {
		pages:{},
		collapsed:false,
		animate:true,
		cache:false,
		onLoadSuccess:function(){},
		onBeforeParse:function(target){},
		onParse:function(target){},
		extractor:function(html){return html;},
		loader:function(target, success, error){//数据加载
			var pages = $.fn.panelx.pages;
			var options = $(target).data("panelx").options;
			var data = options.params || {};
			var url = options.url;
			var text = pages[url];
			if( options.cache && text ){
				var html = Page.getEvalHtml(text, data);
				success.call(target, html);
			}else{
				$.post(url, data, function(text){
					pages[url] = text;
					var html = Page.getEvalHtml(text, data);
					success.call(target, html);
				});
			}
		}
	};
})(jQuery);