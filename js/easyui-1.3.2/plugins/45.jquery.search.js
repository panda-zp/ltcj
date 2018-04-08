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
			scrollTo(target, $("thead",panel));
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
		var state = $.data(target, 'search');
		var panel = getPanel(target);
		panel.panel("close");
		state.options.onHidePanel.call(target);
	};
	
	//取得顶部位置
	var getTop = function( target ) {
		var state = $.data(target, 'search');
		var panel = getPanel(target);
		var combo = state.combo;
		var top = combo.offset().top + combo._outerHeight();
		if (top + combo._outerHeight() > $(window)._outerHeight() + $(document).scrollTop()) {
			top = combo.offset().top - panel._outerHeight();
		}
		if (top < $(document).scrollTop()) {
			top = combo.offset().top + combo._outerHeight();
		}
		return top;
	};
	
	//取得面板
	var getPanel = function(target){
		var state = $.data(target, 'search');
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
	
	//显示面板
	var showPanel = function(target, refresh){
		//console.log(new Date().getTime() + " showPanel....");
		var state = $.data(target, 'search'), opts = state.options;
		var panel = getPanel(target);
		var key = state.text.val();
		if( refresh  ){
			opts.loaded = true;
			opts.loader(target, function(data){
				state.list = data.rows;
				renderPanel(target, state.list);//渲染面板
			});
		}else{
			renderPanel(target, state.list);//渲染面板
		}
	};
	
	//渲染面板
	var renderPanel = function(target, list){
		var state = $.data(target, 'search'), opts = state.options;
		var panel = getPanel(target);
		if( !list.length ){
			panel.panel("close");
			return;
		}
		panel.panel("panel").css("z-index", $.fn.window.defaults.zIndex++);
		panel.panel("move", {
			left : state.combo.offset().left,
			top : getTop(target) - 1//避免出现边框在一起很难看
		});
		panel.panel("open");
		if( !$(".search-table", panel).exist() ){
			opts.table.appendTo(panel);
		}
		var table = [];
		panel.css("border","none");
		var height = list.length*24 || 120;
		opts.panelHeight = (height > 200 ? 200 : height) + 30;
		opts.panelWidth = opts.panelWidth ? opts.panelWidth : (opts.columns.length * 80);
		var template = th.template(opts.template);
		opts.tbody.empty();
		$.each(list, function(i, data){
			var html = template(data);
			var item = $(html).appendTo(opts.tbody);
			item.addClass("combobox-item");
			item.attr("value", data[opts.valueField]);
			item.data('data', data);
			item.bind("mousedown.combo",function(e){
				e.preventDefault();
				setValue(target, data[opts.valueField]);
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
		var state = $.data(target, 'search');
		var opts = state.options;
		var panel = getPanel(target);
		var oldValue = $(target).val();
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
		if( state.text.data("validatebox") ){
			state.text.validatebox("validate");//执行验证
		}
		setComboText(target, data ? data[opts.textField] : "");//设置文本显示
	};
	
	//取得值
	var getValue = function(target){
		return $(target).val();
	};

	//设置显示值
	var setComboText = function(target, text){
		var state = $.data(target, 'search');
		var opts = state.options;
		if( text == undefined ){
			var value = $(target).val();
			var data = getData(target, value);
			text = (data != null ? data[opts.textField] : "");
			state.text.val(text);
		}else{
			state.text.val(text);
		}
	};

	//找到数据
	var getData = function(target, value){
		var state = $.data(target, 'search'), opts = state.options;
		if( value == ""){
			return {value:"", text:""};
		}
		if( state ){
			var list = state.list || [];
			for(var i = 0; i < list.length; i++ ){
				if( list[i][opts.valueField]== value ){
					return list[i];
				}
			}
		}
		return null;
	};
	
	//设置有效状态
	var setDisabled = function(target, disabled ){
		var state = $.data(target, 'search');
		var $text = state.text;
		if( disabled ){
			$text.attr("disabled", true);
		}else{
			$text.removeAttr("disabled");
		}
	};
	
	//是否必选
	var required = function( target, required ){
		var state = $.data(target, 'search');
		var $text = state.text;
		$text.validatebox({required:required});
	};
	
	//触发TAB效果
	var pressTab = function(target){
		var state = $.data(target, 'search');
		var $text = state.text;
		//Page.tab($text.get(0));
	};
	
	//设置异步查询的参数
	var setQueryParams = function(target, queryParams){
		var state = $.data(target, 'search'), opts = state.options;
		opts.queryParams = $.extend({}, opts.queryParams, queryParams || {});
	};

	//initialize
	var init = function( target ){
		var state = $.data(target, 'search');
		var opts = state.options;
		var $text = state.text;
		if( $text.data("validatebox") || opts.required || opts.validType){
			$text.validatebox(opts);
		}
		$text.off(".combo").on("focus.combo click.combo",function(e){
			th.delay(function(){
				$("div.combo-panel").not(state.panel).panel("close");
				showPanel(target, !opts.loaded);
				$text.select();//获取焦点时选择文本
			},100);
		}).on("keydown.combo", function(e) {
			switch (e.keyCode) {
				case 38://上箭头
					selectPrev(target);
					break;
				case 40://下箭头
					if( !opts.loaded ){//没有数据加载数据
						showPanel(target, true);
					}else{
						selectNext(target);
					}
					break;
				case 9://TAB键盘
					hidePanel(target);
					break;
				case 13://回车键
					e.preventDefault();
					if( !state.list.length ){//没有数据加载数据
						//showPanel(target, true);
						//return false;//不跳到下个输入框
					}else if(state.panel.is(":hidden")){
						//showPanel(target, false);
						//return false;//不跳到下个输入框
					}else{//有数据选中数据
						var value = $(".combobox-item-selected:first",state.panel).attr("value");
						setValue(target, value);
						hidePanel(target);
						pressTab(target);//跳掉下个输入框
					}
					return true;
					break;
			}
		}).on("blur.combo",function(e){
			setComboText(target);//失去焦点重新设置文本值
		}).on("keyup.combo",function(e){
			var code = parseInt(e.keyCode || -1);
			if( (code >=48 && code <=90) || (code >=96 && code <=111) //0-9 A-Z
					|| [8,46,32].contains(e.keyCode)){//backspace,del,space
				th.delay(function(){
					showPanel(target, true);
					if( $text.val() == "" ){//空值清空
						setValue(target, "");
					}
				},500);
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
		setComboText(target, opts.text || undefined);
	};
	
	//重新加载数据
	var reload = function(target, params){
		var state = $.data(target, 'search'), opts = state.options;
		opts.queryParams = params || opts.queryParams;
		opts.loader(target, function(data){
			state.list = data.rows;
			renderPanel(target, state.list);//渲染面板
		});
	};
	
	//加载数据
	var loadData = function(target, list){
		state.list = list;//重新设置数据
	};
	
	//取得选中行数据
	var getSelected = function(target, param){
		var value = $(target).val();
		var data = getData(target, value);
		return data;
	};
	
	//销毁组件
	var destroy = function(target){
		var state = $.data(target, 'search');
		if( state.panel ){
			state.panel.panel("destroy");
		}
		state.combo.remove();
	};

	$.fn.search = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.search.methods[options](this, param);
			return method;
		}
		options = options || {};
		return this.each(function(){
			var target = this;
			var state = $.data(target, 'search');
			if (state){
				$.extend(state.options, options);
				init(target);
			} else {
				var opts = $.extend({}, $.fn.search.defaults, $.fn.validatebox.parseOptions(target), $.fn.search.parseOptions(target), options);
				var comp = getComponent(target, opts);
				state = $.data(this, 'search', {
					combo: comp.combo,
					panel: comp.panel,
					data: comp.data,//[{id:'1',text:'小米',selected:true}]
					options: opts,
					text: $("input", comp.combo)
				});
				init(target);
				state.list = [];//空数据
			}
		});
	};
	
	var getComponent = function(target, opts ){
		var $combo = $("<span class='combo'/>").insertAfter(target);
		var $text = $("<input type='text' class='text search-text search-enable' validType=\"" + opts.validType + "\"/>").appendTo($combo);//文本显示
		$combo.cssText( $(target).cssText() + ";border:0px;" );//设置CSS样式
		$text.css({"width":"100%"});
		$text.attr("placeholder", $(target).attr("placeholder") );
		$(target).addClass("search-f hidden").removeAttr("required").removeAttr("validType");//隐藏自己
		return {"panel":null, "combo":$combo};
	};
	
	$.fn.search.methods = {
		options:function(jq, param){
			return $.data(jq[0],"search").options
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
		},setText:function(jq, param){
			return jq.each(function(){
				setComboText(this, param);
			});
		},getText:function(jq, param){
			return $.data(jq[0],"search").text.val();
		},loadData:function(jq, param){
			return jq.each(function(){
				loadData(this, param);
			});
		},reload:function(jq, param){
			return jq.each(function(){
				reload(this, param);
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
					$(_this).data("search").text.focus();
					showPanel(_this, param);
				},0);
			});
		}
	};
	
	$.fn.search.parseOptions = function(target){
		var opts = $.parser.parseOptions(target,["name","url","style","uid","valueField","textField","panelWidth","panelHeight"
		    ,"validType","text",{"onSelect":"object","required":"boolean","server":"boolean","queryColumns":'object',"queryParams":'object'
		    	,"maxRows":"number","includes":"array","excludes":"array"}]);
		opts.disabled = $(target).hasAttr("readonly");
		opts.required = $(target).hasAttr("required");
		opts.table = $( $("#table-" + opts.uid).text() );
		opts.tbody = $("<tbody></tbody>").appendTo(opts.table);
		var panelWidth = 0;
		opts.columns = (function(text){
			var cols = [];
			$(text).find("th").each(function(){
				var $this = $(this);
				var col = {};
				col.title = $this.text();
				col.field = $this.attr("field");
				col.width = parseInt($this.attr("width") || "80");
				panelWidth += col.width;
				cols.push(col);
			});
			return cols;
		})(opts.table);
		opts.panelWidth = panelWidth;
		opts.template = (function(){
			var tr= ["<tr>\n"];
			for( var i = 0 ; i < opts.columns.length; i++ ){
				var col = opts.columns[i];
				tr.push("<td width='" + col.width + "'>");
				tr.push("#=" + col.field + "#");
				tr.push("</td>\n");
			}
			tr.push("</tr>\n");
			return tr.join("");
		})();
		return opts;
	};
	
	$.fn.search.defaults = {
		panelWidth:0,
		panelHeight:0,
		maxRows:50,
		readonly:false,
		required:false,
		valueField:"value",
		textField:"text",
		loaded:false,
		queryParams:{},
		autoQuery:false,
		onShowPanel : function(){},
		onHidePanel : function(){},
		onSelect : function(){},
		onBeforeChange : function(value, old){
			//console.log("selectx onBeforeChange value=" + value + ";old=" + old);
		},
		onChange : function(value, old){
			console.log("search onChange value=" + value + ";old=" + old);
		},
		filter:function(list){
			var target = this;
			var state = $.data(target, 'search');
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
			var state = $.data(target, 'search'), opts = state.options;
			var parameters = [], cols = opts.queryColumns;
			var key = state.text.val();
			for(var i = 0; i < cols.length; i = i + 2){
				parameters.push({"name":cols[i], "op":cols[i+1], "value":key, "type":"$OR"});
			}
			parameters = parameters.concat( th.toQueryParams(opts.queryParams || {}) );
			$.post(opts.url, {"parameters":$.toJSON(parameters),"maxRows":opts.maxRows},function(text){
				var data = $.eval(text);
				state.list = data.rows;
				state.total = data.total;
				success ? success(data) : null;
			});
		}
	};
})(jQuery);