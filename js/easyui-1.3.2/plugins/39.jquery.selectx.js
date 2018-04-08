(function($){

	function scrollTo(target, item){
		var panel = getPanel(target);
		if (item.length){
			if (item.position().top <= 0){
				var h = panel.scrollTop() + item.position().top;
				panel.scrollTop(h);
			} else if (item.position().top + item.outerHeight() > panel.height()){
				var h = panel.scrollTop() + item.position().top + item.outerHeight() - panel.height();
				panel.scrollTop(h);
			}
		}
	};
	
	//选择上
	function selectPrev(target){
		var panel = getPanel(target);
		if( panel.is(":hidden") ){
			showPanel(target, false);//隐藏的时候，先显示了再说
			return;
		}
		var $selected = $(".combobox-item-selected", panel);
		var $item = $selected.exist() ? $selected : $(".combobox-item:first",panel).first();
		var $prev = $item.prev(':visible');
		if( $prev.exist() ){
			$selected.removeClass("combobox-item-selected");
			$prev.addClass("combobox-item-selected");
			scrollTo(target, $prev);
		}else{
			scrollTo(target, $("thead",panel));//表格的情况
		}
	};
	
	// 选择下
	function selectNext(target){
		var panel = getPanel(target);
		if( panel.is(":hidden") ){
			showPanel(target, false);//隐藏的时候，先显示了再说
			return;
		}
		var $select = $(".combobox-item-selected", panel);
		var $next = $select.exist() ? $select.next() : $(".combobox-item:first",panel).first();
		if( $next.exist() ){
			$select.removeClass("combobox-item-selected");
			$next.addClass("combobox-item-selected");
			scrollTo(target, $next);
		}
	};
	
	//隐藏面板
	var hidePanel = function(target) {
		var state = $.data(target, 'selectx');
		var panel = getPanel(target);
		panel.panel("close");
		state.options.onHidePanel.call(target);
	};
	
	//取得顶部位置
	var getTop = function( target ) {
		var state = $.data(target, 'selectx');
		var $panel = getPanel(target);
		var $combo = state.combo;
		var top = $combo.offset().top + $combo._outerHeight();
		if (top + $panel._outerHeight() > $(window)._outerHeight() + $(document).scrollTop()) {
			top = $combo.offset().top - $panel._outerHeight();
		}
		if (top < $(document).scrollTop()) {
			top = $combo.offset().top + $combo._outerHeight();
		}
		return top;
	};
	
	//取得面板
	var getPanel = function(target){
		var state = $.data(target, 'selectx');
		if( state.panel ){
			return state.panel;
		}
		var panel = state.panel = $("<div class=\"combo-panel\"></div>").appendTo("body");
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
		return panel;
	};
	
	//编辑模式
	var isEditable = function(target){
		var state = $.data(target, 'selectx'), opts = state.options;
		var editable = $.isFunction(opts.editable) ? opts.editable(target) : opts.editable;
		return editable;
	};
	
	//显示面板   refresh 刷新数据  match 是否进行一次匹配
	var showPanel = function(target, refresh, match){
		var state = $.data(target, 'selectx'), opts = state.options;
		if( isEditable(target) || state.text.attr("readonly") ) return;//编辑模式或只读
		var panel = getPanel(target);
		panel.panel("panel").css("z-index", $.fn.window.defaults.zIndex++);
		panel.panel("move", {
			left : state.combo.offset().left,
			top : getTop(target) - 1//避免出现边框在一起很难看
		});
		var $combo = $.data(target, 'selectx').combo;
		var key = state.text.val();
		if( (refresh || !opts.loaded) && opts.server && opts.dict ){
			opts.loaded = true;
			opts.loader(target,function(list){
				state.list = list;
				var list = match ? getMatchList(target, key) : state.list;//匹配数据
				renderPanel(target, opts.filter.call(target, list));//渲染面板
			});//加载数据
		}else{
			var list = match ? getMatchList(target, key) : state.list;//匹配数据
			renderPanel(target, opts.filter.call(target, list));//渲染面板
		}
	};
	
	//渲染面板
	var renderPanel = function(target, list){
		var state = $.data(target, 'selectx'), opts = state.options;
		var panel = getPanel(target);
		if( !list.length ){
			panel.panel("close");
			return;
		}
		panel.panel("open");
		(function() {
			if (panel.is(":visible")) {
				panel.panel("move", {
					left : state.combo.offset().left,
					top : getTop(target) - 1//避免出现边框在一起很难看
				});
				setTimeout(arguments.callee, 200);
			}
		})();
		var container = panel.empty();
		if( opts.template.contains("</tr>") ){
			var table = [];
			table.push("<table class='view-table'>\n");
			table.push("<thead>\n");
			table.push("<tr>\n");
			for( var i = 0 ; i < opts.columns.length; i++ ){
				var col = opts.columns[i];
				table.push("<th width='" + col.width + "'>" + col.title + "</th>\n");
			}
			table.push("</tr>\n");
			table.push("</thead>\n");
			table.push("</table>\n");
			$(table.join("")).appendTo(panel);
			container = panel.find(".view-table");
			panel.css("border","none");
			var height = list.length*24 || 120;
			opts.panelHeight = (height > 200 ? 200 : height) + 30;
		}
		var template = th.template(opts.template);
		$.each(list, function(i, data){
			var html = template(data);
			var item = $(html).appendTo(container);
			item.addClass("combobox-item");
			item.attr("value", data.value);
			item.data('data', data);
			item.bind("mousedown.combo",function(e){
				e.preventDefault();
				setValue(target, data.value);
				hidePanel(target);
				//pressTab(target);
			}).hover(function(){
				$(this).addClass("combobox-item-hover");
			},function(){
				$(this).removeClass("combobox-item-hover");
			});	
		});
		var width = opts.panelWidth || state.combo.outerWidth();
		var height = opts.panelHeight || 120;
		panel.panel("resize", {width:width, height:height});
		var value = $(target).val();
		var $item = $("[value='" + value + "']", panel);
		if( !$item.exist() ){
			$item = $(".combobox-item:first", panel);
		}
		$item.addClass("combobox-item-selected");
		scrollTo(target, $item);
		state.options.onShowPanel.call(target);
	}
	
	//设置值value
	var setValue = function(target, value ){
		var state = $.data(target, 'selectx'),opts = state.options;
		var panel = getPanel(target);
		var oldValue = $(target).val();
		var $text = state.text;
		if( value != oldValue){
			var result = opts.onBeforeChange.call(target, value, oldValue);
			if( result === false){
				return;
			}
		}
		$(".combobox-item-selected", panel).removeClass("combobox-item-selected");
		$("[value='" + value + "']", panel).addClass("combobox-item-selected");
		$(target).val(value);
		var data = getData(target, value);
		opts.onSelect.call(target, value, oldValue, data);
		if( oldValue != value){
			opts.onChange.call(target, value, oldValue, data);
		}
		if( $text.data("validatebox") ){
			$text.validatebox("validate");//执行验证
		}
		setComboText(target, (data ? data.text : undefined) );//设置文本显示
	};

	//找到数据
	var getData = function(target, value){
		var state = $.data(target, 'selectx');
		if( value == "" || value == undefined){
			return {value:"", text:""};
		}
		if( isEditable(target) ){//编辑模式
			return {value:state.text.val(), text:state.text.val(), editable:true};
		}
		if( state ){
			var data = state.list;
			for(var i = 0; i < data.length; i++ ){
				if( data[i].value == value ){
					return data[i];
				}
			}
		}
		return null;
	};
	
	//取得值
	var getValue = function(target){
		return $(target).val();
	};
	
	//设置selectx-text显示值
	var setComboText = function(target, text){
		var state = $.data(target, 'selectx'), opts = state.options;
		var $text = state.text;
		if( text == undefined ){
			var value = $(target).val();
			if( opts.dict ){//数据字典,从缓存中获取
				var text = DictConfig.getText(opts.dict, value);
				$text.val(text);
			}else{
				var data = getData(target, value);
				text = (data != null ? data.text : "");
				$text.val(text);
			}
		}else{
			$text.val(text);
		}
	};
	
	//找到匹配的数据
	var getMatchList = function(target, key){
		var state = $.data(target, 'selectx'), opts = state.options;
		var data = opts.filter.call(target, state.list);//过滤数据
		if( key == null || key == "" ){
			return data;//为空返回全部数据
		}
		var matchs = [];
		for(var i = 0; i < data.length; i++ ){
			var pym = data[i].pym || "", text = data[i].text || "";
			if( pym.contains(key.toUpperCase()) || text.contains(key) ){
				matchs.push(data[i]);
			}
		}
		return matchs;
	};
	
	//设置有效状态
	var setDisabled = function(target, disabled ){
		var state = $.data(target, 'selectx');
		var $text = state.text;
		if( disabled ){
			$text.removeClass("selectx-enable").removeClass("validatebox-invalid")
				.addClass("selectx-disable").attr("readonly", true);
		}else{
			$text.removeClass("selectx-disable").addClass("selectx-enable").removeAttr("readonly");
		}
	};
	
	//是否必选
	var required = function( target, required ){
		var state = $.data(target, 'selectx');
		var $text = state.text;
		$text.validatebox({required:required});
	};
	
	//触发TAB效果
	var pressTab = function(target){
		var state = $.data(target, 'selectx');
		var $text = state.text;
		//Page.tab($text.get(0));
	};
	
	//设置异步查询的参数
	var setQueryParams = function(target, queryParams){
		var state = $.data(target, 'selectx'), opts = state.options;
		opts.queryParams = $.extend({}, opts.queryParams, queryParams || {});
	};
	
	//是否需要加载
	var isLoadable = function(target){
		var state = $.data(target, 'selectx'), opts = state.options;
		return !opts.loaded && opts.server && opts.dict 
	};

	//initialize
	var init = function( target ){
		var state = $.data(target, 'selectx');
		var opts = state.options;
		var $text = state.text;
		if( $text.data("validatebox") || opts.required || opts.validType){
			$text.validatebox(opts);
		}
		$text.off(".combo").on("focus.combo click.combo",function(e){
			if( !isEditable(target) ){//选择模式
				th.delay(function(){
					$("div.combo-panel").not(state.panel).panel("close");
					showPanel(target, isLoadable(target),false);
					setTimeout(function(){$text.select();},0);//选中文本
				},100, target);
			}
		}).on("keydown.combo", function(e) {
			switch (e.keyCode) {
				case 38://上箭头
					selectPrev(target);
					break;
				case 40://下箭头
					if( isLoadable(target) ){//没有数据加载数据
						showPanel(target, true);
					}else{
						selectNext(target);
					}
					break;
				case 9://TAB键盘
					hidePanel(target);
					break;
				case 13://回车键
					if( isEditable(target) ){//编辑模式
						pressTab(target);//跳掉下个输入框
					}else{//选择模式
						e.preventDefault();
						if( !state.list.length ){//没有数据加载数据
							//showPanel(target, true);
							//return false;//不跳到下个输入框
						}else{
							var value = $(".combobox-item-selected:first",state.panel).attr("value");
							setValue(target, value);
							hidePanel(target);
							pressTab(target);//跳掉下个输入框
						}
					}
					return true;
					break;
			}
		}).on("blur.combo",function(e){
			setComboText(target, isEditable(target) ? $text.val() : undefined);//失去焦点重新设置文本值
		}).on("keyup.combo",function(e){
			var code = parseInt(e.keyCode || -1);
			if( (code >=48 && code <=90) || (code >=96 && code <=111) //0-9 A-Z
					|| [8,46,32].contains(code)){//backspace,del,space
				if( isEditable(target) ){//编辑模式
					th.delay(function(){
						setValue(target, $text.val());//当前输入文本为值
					},500);
				}else{//选择模式
					th.delay(function(){
						showPanel(target, true, true);//刷新，匹配数据
						if( $text.val() == "" ){//空值清空
							setValue(target, "");
						}
					},500);
				}
			}
		});
		target.onpropertychange = function(e){//IE浏览器
			setComboText(target);
		};
		$(document).unbind(".combo").bind("mousedown.combo", function(e) {
			var p = $(e.target).closest("span.combo,div.combo-panel");
			if (p.length) {
				return;
			}
			$("body>div.combo-p>div.combo-panel").panel("close");
		});
		setDisabled(target, opts.disabled);
		var value = getDefaultValue(target);//取得初始化的默认值
		$(target).val(value);//设置为默认值
		setComboText(target, isEditable(target) ? value : undefined);
	};
	
	//初始化时取得默认值
	var getDefaultValue = function(target){
		var state = $.data(target, 'selectx');
		var opts = state.options;
		var value = $(target).val();
		if( value ){
			return value;
		}
		var list = state.list || [];
		if( opts.selectIndex == "first" ){
			value = (list[0] || {}).value;
		}else if( opts.selectIndex == "last" ){
			value = (list[list.length-1] || {}).value;
		}else  if( !$.isEmpty(opts.selectIndex) ){
			value = (list[opts.selectIndex] || {}).value;
		}
		return value;
	};

    //加载数据
    var loadData = function(target, param, reset){
        var oldVal = getValue(target);
        var list = [];
        var state = $.data(target, 'selectx');
        var opts = state.options;

        if( $.type(param) == "array" ){
            list = param;
            $.each(list, function(i, item){
                item.pym = item.pym || th.getPym(item.text || "");
            });
        }else if( opts.source ){//默认数据，减少使用eval
        	if( $.isArray(opts.source) ){
        		list = opts.source;
        	}else if( opts.source.match(/^\w+([.:\w]*?)\w$/) ){
            	list = DictConfig.getItems(opts.source);
           	}else{
        		list = $.eval(opts.source);
        	}
        }
        if( reset ){
            opts.dict = null;//数据字典属性置空，单独加载后原来的就失效了
        }
        state.list = list;//重新设置数据
        if(oldVal) setValue(target,oldVal);
    };
	
	//根据参数加载数据
	var reload = function(target, param){
		var state = $.data(target, 'selectx'), opts = state.options;
		setQueryParams(target, param);
		opts.loader(target, function(list){//加载数据
			state.list = list;
		});
	};
	
	//取得选中行数据
	var getSelected = function(target, param){
		var value = $(target).val();
		var data = getData(target, value);
		return data;
	};
	
	//销毁组件
	var destroy = function(target){
		var state = $.data(target, 'selectx');
		if( state.panel ){
			state.panel.panel("destroy");
		}
		state.combo.remove();
	};
	
	$.fn.selectx = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.selectx.methods[options](this, param);
			return method;
		}
		options = options || {};
		return this.each(function(){
			var target = this;
			var state = $.data(target, 'selectx');
			if (state){
				$.extend(state.options, options);
				init(target);
			} else {
				var opts = $.extend({}, $.fn.selectx.defaults, $.fn.validatebox.parseOptions(target), $.fn.selectx.parseOptions(target), options);
				var comp = getComponent(target, opts);
				state = $.data(this, 'selectx', {
					combo: comp.combo,
					panel: comp.panel,
					list: comp.list,//[{id:'1',text:'小米',selected:true}]
					text: comp.text,
					options: opts
				});
				loadData(target);//加载数据
				init(target);//初始化
			}
		});
	};
	
	var getComponent = function( target, opts ){
		var $combo = $("<span class='combo'/>").insertAfter(target);
		var type = (opts.clearable && !opts.required) ? "search" : "text";
		var $text = $("<input type='" + type + "' class='text selectx-text selectx-enable' validType=\"" + opts.validType + "\"/>").appendTo($combo);//文本显示
		if( opts.textField ){
			$text.attr("id", opts.textField).attr("name", opts.textField);
		}
		$combo.cssText( $(target).cssText() + ";border:0px;" );//设置CSS样式
		$text.css({"width":"100%"});
		$text.attr("placeholder", $(target).attr("placeholder") );
		$(target).addClass("select-f hidden").removeAttr("required").removeAttr("validType");//隐藏自己
		if( opts.clearable && !opts.required ){
			$text.off(".combo").on("search", function(){
				setValue(target, "");
			});
		}
		return {"panel":null, "combo":$combo, list:[], "text":$text};
	};
	
	$.fn.selectx.methods = {
		options:function(jq, param){
			var options = $(jq[0]).data("selectx").options;
			return options;
		},required:function(jq, param){
			return jq.each(function(){
				required(this, param);
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
		},getValue:function(jq, param){
			return getValue(jq[0], param);
		},getText:function(jq, param){
			return $(jq[0]).data("selectx").text.val();
		},loadData:function(jq, param){
			return jq.each(function(){
				loadData(this, param, true);
			});
		},getSelected:function(jq, param){
			return getSelected(jq[0], param);
		},setQueryParams:function(jq, param){
			return jq.each(function(){
				setQueryParams(this, param);
			});
		},focus:function(jq, param){
			return jq.each(function(){
				var _this = this;
				setTimeout(function(){
					$(_this).data("selectx").text.focus();
					showPanel(_this, param);
				},0);
			});
		},reload:function(jq, param){//仅用于异步数据查询
			return jq.each(function(){
				reload(this, param);
			});
		}
	};
	
	$.fn.selectx.parseOptions = function(target){
		var opts = $.parser.parseOptions(target,["name","style","dict","uid","iconCls","source","panelWidth","panelHeight","validType","selectIndex","clearable",{"onSelect":"object","required":"boolean","server":"boolean","queryParams":'object',"maxRows":"number","includes":"array","excludes":"array"}]);
		opts.disabled = $(target).hasAttr("readonly");
		opts.required = $(target).hasAttr("required");
		opts.template = $("#template-" + opts.uid).text() || "<div>#=text#</div>";
		var panelWidth = 0;
		opts.columns = (function(text){
			var cols = [];
			if( text.contains("</tr>") ){
				$(text).find("td").each(function(){
					var $this = $(this);
					var col = {};
					col.title = $this.attr("title") || $this.text();
					col.width = parseInt($this.attr("width") || "80");
					panelWidth += col.width;
					cols.push(col);
				});
			}
			return cols;
		})(opts.template);
		opts.panelWidth = opts.panelWidth || panelWidth;
		opts.source = opts.source || $("#source-" + opts.uid).text();
		return opts;
	};
	
	$.fn.selectx.defaults = {
		textField:null,
		panelWidth:0,
		panelHeight:0,
		maxRows:100,
		readonly:false,
		required:false,
		loaded:false,
		clearable:false,
		editable:false,//允许编辑输入
		selectIndex:"",//默认选择值 first, last, 0,1,2,3,4,5
		queryParams:{},
		onShowPanel : function(){},
		onHidePanel : function(){},
		onSelect : function(value, oldValue, data){},
		onBeforeChange : function(value, old){
			//console.log("selectx onBeforeChange value=" + value + ";old=" + old);
		},
		onChange : function(value, old){
			console.log("selectx onChange value=" + value + ";old=" + old);
		},
		filter:function(list){
			var target = this;
			var state = $.data(target, 'selectx');
			var opts = state.options;
			var data = [];
			var includes = opts.includes || [], excludes = opts.excludes || [];
			for( var i = 0 ; i < list.length; i++ ){
				var value = list[i].value;
				if( excludes.contains(value) ){
					continue;
				}
				if( !includes.isEmpty() && !includes.contains(value) ){
					continue;
				}
				if( "0" == list[i].status ){//编辑隐藏
					continue;
				}
				data.push(list[i]);
			}
			return data;
		},
		loader:function(target, success, error){
			var state = $.data(target, 'selectx'), opts = state.options;
			var text = state.text.val();
			var key = text || "";
			var maxRows = opts.maxRows || "";
			//第一次不过滤
			var data = {"code":opts.dict, "key": key, "queryParams":$.toJSON(opts.queryParams), "maxRows":maxRows};
			Service.invoke("DictService.find", data, function(text){
				var list = $.eval(text) || [];
				success(list);
			});
		}
	};
})(jQuery);