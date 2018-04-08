(function($){

	//取得状态
	var togglePanel = function(target, param){
		var state = $.data(target, 'chooser');
		if( !state.options.disabled ){
			if ( state.panel.panel("options").closed ) {
				showPanel(target, param);
			}else{
				hidePanel(target, param);
			}
		}
	};
	
	//显示面板
	var showPanel = function(target, param){
		var state = $.data(target, 'chooser');
		setPanelPostion(target, param);
		state.panel.panel("open");
		state.options.onShowPanel.call(target);
	};
	
	//重新定位Panel
	var setPanelPostion = function(target){
		var state = $.data(target, 'chooser');
		state.panel.panel("panel").css("z-index", $.fn.window.defaults.zIndex++);
		state.panel.panel("move", {
			left : state.combo.offset().left,
			top : getTop(target) - 2//避免出现边框在一起很难看
		});
	};
	
	//取得顶部位置
	var getTop = function( target ) {
		var state = $.data(target, 'chooser');
		var combo = state.combo;
		var top = combo.offset().top + combo._outerHeight();
		if (top + combo._outerHeight() > $(window)._outerHeight() + $(document).scrollTop()) {
			top = combo.offset().top - state.panel._outerHeight();
		}
		if (top < $(document).scrollTop()) {
			top = combo.offset().top + combo._outerHeight();
		}
		return top;
	};
	
	//设置值value
	var setValue = function( target, value ){
		setValues([value]);
	};
	
	//设置值values
	var setValues = function( target, values ){
		for( var i = 0 ; i < values.length; i++ ){
			var data = getData(target, values[i]);
			if( data ){
				addSelectItem(target, data);
			}
		}
	};
	
	//设置选中的值
	var saveChooserValue = function(target){
		var state = $.data(target, 'chooser');
		var values = [];
		$("a.item",state.combo).each(function(){
			values.push($(this).attr("value"));
		});
		$(".chooser-value", state.combo).val($.toJSON(values));
	};
	
	//找到数据
	var getData = function( target, id){
		var state = $.data(target, 'chooser');
		var data = state.data;
		for(var i = 0; i < data.length; i++ ){
			if( data[i].id == id ){
				return data[i];
			}
		}
		return null;
	};
	
	//隐藏面板
	var hidePanel = function(target, param) {
		var state = $.data(target, 'chooser');
		state.panel.panel("close");
		state.options.onHidePanel.call(target);
	};
	
	//添加选中的item
	var addSelectItem = function(target , data){
		var state = $.data(target, 'chooser');
		var count = $(".item",state.combo).length;
		if( count >= state.options.max ){//选择数量限制
			return;
		}
		var $select = $("<a class='item' href='#' value='" + data.id + "'><span class='item-text'>" + data.text + "</span><span class='item-del'></span></a>");
		$select.appendTo(state.combo);
		$select.find(".item-del").click(function(e){
			e.preventDefault();
			removeSelectItem(target, data.id);
			return false;
		});
		data.selected = true;
		state.panel.find("a[value='" + data.id + "']").addClass("item-selected");
		saveChooserValue(target);
		setPanelPostion(target);
		state.options.onSelect.call(target, data);
	};
	
	// 删除选中的item
	var removeSelectItem = function(target , id){
		var data = getData(target, id);
		if( data ){
			var state = $.data(target, 'chooser');
			state.combo.find("a[value='" + data.id + "']").remove();
			state.panel.find("a[value='" + data.id + "']").removeClass("item-selected");
			data.selected = false;
		}
		saveChooserValue(target);
		setPanelPostion(target);
	};
	
	//设置有效状态
	var setDisabled = function(target, disabled ){
		var state = $.data(target, 'chooser');
		if( disabled ){
			state.combo.removeClass("easyui-chooser-enable");
			state.combo.find(".item-del").hide();
		}else{
			state.combo.addClass("easyui-chooser-enable");
			state.combo.find(".item-del").show();
		}
		state.options.disabled = disabled;
	};

	//initialize
	var init = function( target ){
		var state = $.data(target, 'chooser');
		var opts = state.options;
		var width = opts.panelWidth || state.combo.outerWidth();
		var height = opts.panelHeight || 100;
		var $panel = state.panel;
		$panel.panel("resize", {
			width : width,
			height : height
		});
		state.combo.click(function(){
			togglePanel(target);
		});
		$panel.empty();
		var $title = $('<div class="chooser-title"></div>').appendTo($panel);
		var $body = $('<div class="chooser-body"></div>').appendTo($panel);
		var $footer = $('<div class="chooser-footer"></div>').appendTo($panel);
		$title.html( opts.title || "");
		$footer.html( opts.footer || "");
		var data = state.data;
		for(var i = 0; i < data.length; i++ ){
			var $item = $("<a class='body-item' href='#' value='" + data[i].id + "'>" + data[i].text + "</a>").appendTo($body);
			$item.data("data", data[i]);
			if( data[i].selected ){
				$item.addClass("item-selected");
				addSelectItem(target, data[i]);
			}
		}
		$(".body-item", $panel).click(function(){
			var data = $(this).data("data");
			if( $(this).hasClass("item-selected") ){
				removeSelectItem(target, data.id );
			}else{
				addSelectItem(target, data );
			}
		});
		$(document).unbind(".combo").bind("mousedown.combo", function(e) {
			var p = $(e.target).closest("div.easyui-chooser,div.combo-panel");
			if (p.length) {
				return;
			}
			var $panel = $("body>div.combo-p>div.combo-panel");
			$panel.panel("close");
		});
		setDisabled(target, opts.disabled);
	};
	
	//销毁组件
	var destroy = function(target){
		var state = $.data(target, 'chooser');
		state.panel.panel("destroy");
	};

	$.fn.chooser = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.chooser.methods[options](this, param);
			return method;
		}
		options = options || {};
		return this.each(function(){
			var target = this;
			var state = $.data(target, 'chooser');
			if (state){
				$.extend(state, options);
			} else {
				var comp = getComponent(target);
				state = $.data(this, 'chooser', {
					combo: comp.combo,
					panel: comp.panel,
					data: comp.data,//[{id:'1',text:'小米',selected:true}]
					options: $.extend({}, $.fn.chooser.defaults, $.fn.chooser.parseOptions(target), options)
				});
				init(target);
			}
		});
	};
	
	var getComponent = function( target ){
		var $combo = $("<div class='easyui-chooser'></div>").insertAfter(target);
		$combo.cssText( $(target).cssText() );//设置CSS样式
		$combo.css("width", $(target).width() );//设置宽度
		$(target).addClass("chooser-f").hide();//隐藏自己
		var name = $(target).attr("name");
		$(target).removeAttr("name");
		$("<input type=\"hidden\" name=\"" + name + "\" class=\"chooser-value\">").appendTo($combo).val("[]");//默认为[]
		var iframe = "<iframe name='kill_activex' frameborder='0' style='position: absolute; z-index: -1; width: 100%; height: 100%; top: 0;left:0;scrolling:no;'></iframe>";
		var panel = $("<div class=\"combo-panel\">" + iframe + "</div>").appendTo("body");
		panel.panel({
			doSize : false,
			closed : true,
			cls : "combo-p",
			style : {
				position : "absolute",
				zIndex : 10
			},
			onOpen : function() {
				$(this).panel("resize");
			}
		});
		var data = getChooserData(target);
		return {"panel":panel, "data":data, "combo":$combo};
	};
	
	//取得数据
	var getChooserData = function( target ){
		var data = [];
		$("option", target).each(function(){
			data.push({"id":$(this).attr("value"),"text":$(this).text(),"selected":$(this).attr("selected")});
		});
		return data;
	};
	
	$.fn.chooser.methods = {
		options:function(jq, param){
			return getOptions(jq[0], param);
		},refresh:function(jq, param){
			return jq.each(function(){
				refresh(this, param);
			});
		},enable:function(jq, param){
			return jq.each(function(){
				setDisabled(this, false);
			});
		},disable:function(jq, param){
			return jq.each(function(){
				setDisabled(this, true);
			});
		},destroy:function(jq, param){
			return jq.each(function(){
				destroy(this);
			});
		},setValue:function(jq, param){
			return jq.each(function(){
				setValue(this, param);
			});
		},setValues:function(jq, param){
			return jq.each(function(){
				setValues(this, param);
			});
		}
	};
	
	$.fn.chooser.parseOptions = function(target){
		var options = $.parser.parseOptions(target,["name","style","iconCls","panelWidth","panelHeight","onHidePanel","onShowPanel","title","footer","url",{"params":'object',"max":"number"}]);
		options.disabled = $(target).attr("readonly");
		return options;
	};
	
	$.fn.chooser.defaults = {
		panelWidth:0,
		panelHeight:0,
		max:100,
		readonly:false,
		onShowPanel : function(){},
		onHidePanel : function(){},
		onSelect : function(){}
	};
})(jQuery);