(function($){
	
	//重置tabs状态，设置为未加载，并且刷新当前选中的tab和主页面
	var reset = function(target){
		var $tabs = $(".easyui-tabs",target);
		$tabs.tabs("reset");
		refreshMain(target);
	};
	
	//刷新主页面
	var refreshMain = function(target, param){
		var region = $(target).attr("mregion");
		var $panel = $(target).layout("panel",region);
		if( typeof param == "string"){
			$panel.panel("options").href = param;
		}else if( typeof param == "object"){
			var params = $.extend(($panel.panel("options").params || {}),param);
			$panel.panel("options").params = params;
		}
		$panel.panel('refresh');
	};
	
	//添加Main参数
	var addMainParam = function(target, param){
		var region = $(target).attr("mregion");
		var $panel = $(target).layout("panel",region);
		var params = $.extend(($panel.panel("options").params || {}),param);
		$panel.panel("options").params = params;
	};
	
	//刷新Tab
	var refreshTab = function(target, title, param){
		var $tabs = $(".easyui-tabs",target);
		var tab = $tabs.tabs("getTab",title);
		if( typeof param == "string"){
			$tabs.tabs('update',{tab:tab,options:{"href":param}});
		}else if( typeof param == "object"){
			var href = tab.panel("options").href;
			var params = $.extend((tab.panel("options").params || {}),param);
			tab.panel("options").params = params;
			$tabs.tabs('update',{tab:tab,options:{"href":href}});
		}
		tab.panel('refresh');
	};
	
	//添加Tab参数
	var addTabParam = function(target, title, param){
		var $tabs = $(".easyui-tabs",target);
		var tab = $tabs.tabs("getTab",title);
		if( tab ){
			var params = $.extend((tab.panel("options").params || {}),param);
			tab.panel("options").params = params;
		}
	};
	
	//setTabLoaded
	var setTabLoaded = function(target, title, isLoaded){
		var $tabs = $(".easyui-tabs", target);
		$tabs.tabs("setTabLoaded", title, isLoaded);
	};

	//selectTab
	var selectTab = function(target, title){
		var $tabs = $(".easyui-tabs",target);
		var tab = $tabs.tabs("select",title);
	};
	
	//getTab
	var getTab = function(target, title){
		var $tabs = $(".easyui-tabs",target);
		var tab = $tabs.tabs("getTab",title);
		return tab;
	};
	
	//getSelected
	var getSelected = function(target) {
		var $tabs = $(".easyui-tabs",target);
		var tab = $tabs.tabs('getSelected');
		return tab;
	};
	
	//getTab
	var getTabPanel = function(target, title){
		var tab = getTab(target, title);
		return tab.panel('panel');
	};
	
	//closeTab
	var closeTab = function(target, title){
		var $tabs = $(".easyui-tabs",target);
		var tab = $tabs.tabs("close",title);
	};
	
	//addTab
	var addTab = function(target, options){
		var $tabs = $(".easyui-tabs",target);
		$tabs.tabs("add",options);
	};
	
	//enableTab
	var enableTab = function(target, title){
		var $tabs = $(".easyui-tabs",target);
		$tabs.tabs("enableTab",title);
	};
	
	//enableTab
	var disableTab = function(target, title){
		var $tabs = $(".easyui-tabs",target);
		$tabs.tabs("disableTab",title);
	};
	
	//tabPosition
	var tabPosition = function(target, position){
		var $tabs = $(".easyui-tabs",target);
		$tabs.tabs({"tabPosition":position});
	};
	
	//initialize
	var init = function( target ){
	};

	$.fn.page = function(options, param, properties){
		if (typeof options == 'string'){
			return $.fn.page.methods[options](this, param, properties);
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'page');
			if (state){
				$.extend(state, options);
			} else {
				state = $.data(this, 'page', $.extend({},$.fn.page.defaults,options));
				init(this);
			}
		});
	};
	
	$.fn.page.methods = {
		refreshMain:function(jq, param, properties){
			return jq.each(function(){
				refreshMain(this, param, properties);
			});
		},refreshTab:function(jq, param, properties){
			return jq.each(function(){
				refreshTab(this, param, properties);
			});
		},addTabParam:function(jq, param, properties){
			return jq.each(function(){
				addTabParam(this, param, properties);
			});
		},setTabParam:function(jq, param, properties){
			return jq.each(function(){
				addTabParam(this, param, properties);
			});
		},addMainParam:function(jq, param, properties){
			return jq.each(function(){
				addMainParam(this, param, properties);
			});
		},selectTab:function(jq, param, properties){
			return jq.each(function(){
				selectTab(this, param, properties);
			});
		},getSelected:function(jq){
			return getSelected(jq[0]);
		},closeTab:function(jq, param, properties){
			return jq.each(function(){
				closeTab(this, param, properties);
			});
		},addTab:function(jq, param, properties){
			return jq.each(function(){
				addTab(this, param, properties);
			});
		},getTab:function(jq, param, properties){
			return jq.each(function(){
				getTab(this, param, properties);
			});
		},getTabPanel:function(jq, param, properties){
			return jq.each(function(){
				getTabPanel(this, param, properties);
			});
		},enableTab:function(jq, param, properties){
			return jq.each(function(){
				enableTab(this, param, properties);
			});
		},disableTab:function(jq, param, properties){
			return jq.each(function(){
				disableTab(this, param, properties);
			});
		},tabPosition:function(jq, param, properties){
			return jq.each(function(){
				tabPosition(this, param, properties);
			});
		},setTabLoaded:function(jq, param, properties){
			return jq.each(function(){
				setTabLoaded(this, param, properties);
			});
		},reset:function(jq, param, properties){
			return jq.each(function(){
				reset(this, param, properties);
			});
		}
	};
	
	$.fn.page.defaults = {
	};
})(jQuery);