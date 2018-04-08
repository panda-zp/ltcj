if( $.parser ){
	$.parser._parse = $.parser.parse;
	$.parser.parse = function(context, parse){
		if( parse ){//禁止自动解析
			$.parser._parse(context);
		}
	};
	//扩展解析器，支持按作用域解析
	$.parser.parseOptions = function(target, properties){
		var t = $(target);
		var options = {};
		var s = $.trim(t.attr('data-options'));
		if (s){
			var $data = $(target).closest("[data-action]");
			var action = $data.data("action");
			options = $.parse(s, action);
		}
		if (properties){
			var opts = {};
			for(var i=0; i<properties.length; i++){
				var pp = properties[i];
				if (typeof pp == 'string'){
					if (pp == 'width' || pp == 'height' || pp == 'left' || pp == 'top'){
						opts[pp] = parseInt(target.style[pp]) || undefined;
					} else {
						opts[pp] = t.attr(pp);
					}
				} else {
					for(var name in pp){
						var type = pp[name];
						if (type == 'boolean'){
							opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
						} else if (type == 'number'){
							opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
						}else if (type == 'object'){
							opts[name] = t.attr(name) ? $.parse( t.attr(name) ) : undefined;
						}else if (type == 'array'){
							var v = t.attr(name) || "[]";
							opts[name] = v.startsWith("[") ? $.eval(v) : v.split(/,/g);
						}
					}
				}
			}
			$.extend(options, opts);
		}
		if( t.data("data-options") ){//data中定义的配置
			$.extend(options, t.data("data-options"));
		}
		return options;
	}
}

window.EasyUI = {};

window.HandlerProxy = function(handler,proxy){
	//当兼容handler字符类型和函数类型
	this.handler = (typeof handler == 'string') ? eval('(' + handler + ')') : handler;
	this.proxy = proxy;
	this.invoke = function(){
		this.handler.call(this.proxy);
	};
};

//代理
EasyUI.proxy = function(fun, target){
	return function(){
		var proxy = new HandlerProxy(fun, target);
		proxy.invoke();
	};
};

//checkbox:true,onContextMenu:Manager.onRowContextMenu,onChecked:onChecked
EasyUI.getOption = function(t,name){
	var value = t.attr(name);
	var option = undefined;
	if( value ){
		try{
			var action = th.getAction(t);
			option = $.parse(value, action);
		}catch(E){
			return value;
		}
		if(name == "toolbar"){//调用对象转换为当前的$datagrid对象
			$.each(option, function(i,opt){
				if( opt.handler ){
					var _handler = opt.handler;
					opt.handler = function(){
						_handler.call(t);
					}
				}
			});
		}else if(name == "pageOptions"){
			var buttons = option ? (option.buttons || []) : [];
			$.each( buttons, function(i,opt){
				var _handler = opt.handler;
				opt.handler = function(){
					_handler.call(t);
				}
			});
		}
	}
	return option;
};

//扩展Options
EasyUI.extendOptions = function(method, after){
	var objectName = method.substring(0,method.lastIndexOf("."));
	var methodName = method.substring(method.lastIndexOf(".") + 1, method.length);
	var object = eval(objectName);
	var proceed = object[methodName];
	object[methodName] = function(){
		var options = proceed.apply(this, arguments);
		var extendOptions = after.apply(this, arguments);
		return $.extend({}, options, extendOptions);
	};
};

EasyUI.extendOptions("$.fn.datagrid.parseOptions",function(target){
	var t = $(target);
	var uid = t.attr("uid");
	var options = {
		queryParams : EasyUI.getOption(t,"queryParams"),
		onClickRow : EasyUI.getOption(t,"onClickRow"),
		onDblClickRow : EasyUI.getOption(t,"onDblClickRow"),
		onSelect : EasyUI.getOption(t,"onSelect"),
		onBeforeLoad : EasyUI.getOption(t,"onBeforeLoad"),
		onLoadSuccess : EasyUI.getOption(t,"onLoadSuccess"),
		input : t.attr("input"),
		editable : (t.attr("editable") == "true"),
		showFooter : (t.attr("showFooter") == "true"),
		toolbar : EasyUI.getOption(t,"toolbar"),
		pageOptions : EasyUI.getOption(t,"pageOptions"),
		placeholder : ($("#placeholder-" + uid).val() || "").trim()
	};
	return options;
});

EasyUI.extendOptions("$.fn.combobox.parseOptions",function(target){
	var t = $(target);
	var options = {"onSelect":EasyUI.getOption(t,"onSelect")};
	return options;
});

EasyUI.extendOptions("$.fn.tabs.parseOptions",function(target){
	var t = $(target);
	var options = {tools:EasyUI.getOption(t,"tools")};
	return options;
});

EasyUI.extendOptions("$.fn.tree.parseOptions",function(target){
	var t = $(target);
	var options = {
			"onSelect":EasyUI.getOption(t,"onSelect"),
			"params":EasyUI.getOption(t,"params"),
			"includes":EasyUI.getOption(t,"includes"),
			"excludes":EasyUI.getOption(t,"excludes"),
			"onSelectNode":EasyUI.getOption(t,"onSelectNode")//主要用于区域树，避免onSelect冲突
	};
	return options;
});

EasyUI.extendOptions("$.fn.panel.parseOptions",function(target){
	var t = $(target);
	var options = {"params":eval("(" + (t.attr("params") || "{}") + ")")};
	return options;
});

EasyUI.extendOptions("$.fn.combo.parseOptions",function(target){
	var t = $(target);
	var object = t.val() || "";//兼容IE8下select多个值的情况下返回Array对象
	var value = ($.type(object) == "array" ? $.toJSON(object) : object); //统一转换为字符串
	var options = {
		"textName" : t.attr("textName"),
		"value" : (value.startsWith("[") ? $.eval(value) : value)
	};
	return options;
});

//禁用组件
$.fn.disable = function(){
	this.each(function(){
		var $this = $(this);
		if( $.data(this,"datebox") != null ){
			$this.datebox("disable");
		}else if( $.data(this,"combo") != null ){
			$this.combo("disable");
		}else if( $.data(this,"selectx") != null ){
			$this.selectx("disable");
		}else if( $.data(this,"search") != null ){
			$this.search("disable");
		}else if( $this.is(":text") ){
			$this.attr("disabled", true);
		}else if( $this.is(":radio") || $this.is(":checkbox") ){
			$this.attr("disabled", true);
		}else{
			$this.attr("disabled", true);
		}
	});
};
//启用组件
$.fn.enable = function(){
	this.each(function(){
		var $this = $(this);
		if( $.data(this,"datebox") != null ){
			$this.datebox("enable");
		}else if( $.data(this,"combo") != null ){
			$this.combo("enable");
		}else if( $.data(this,"selectx") != null ){
			$this.selectx("enable");
		}else if( $.data(this,"search") != null ){
			$this.search("enable");
		}else if( $this.is(":text") ){
			$this.removeAttr("disabled");
		}else if( $this.is(":radio") || $this.is(":checkbox") ){
			$this.removeAttr("disabled");
		}else{
			$this.removeAttr("disabled");
		}
	});
};

//是否验证
$.fn.required = function( required ){
	if(typeof required == "undefined"){
		required = true;
	}
	this.each(function(){
		var $this = $(this);
		if( $.data(this,"datebox") != null ){
			$this.datebox({"required":required});
		}else if($.data(this,"combobox") != null ){
			$this.combobox({"required":required});
		}else if($.data(this,"combotree") != null){
			$this.combotree({"required":required});
		}else if($.data(this,"selectx") != null){
			$this.selectx({"required":required});
		}else if($.data(this,"search") != null){
			$this.search({"required":required});
		}else if( $this.is("select") || $this.is("input") || $this.is("textarea")){
			$this.validatebox({"required":required});
		}
	});
};

$.fn.readonly = function( readonly ){
	if(typeof readonly == "undefined"){
		readonly = true;
	}
	this.each(function(){
		var $this = $(this);
		if( $.data(this,"combo") != null ){
			$this.combo("readonly",readonly);
		}else if($.data(this,"chooser") != null ){
			$this.chooser( readonly ? "disable" : "enable");
		}else if($.data(this,"selectx") != null){
			$(this).selectx(readonly ? "disable" : "enable");
		}else if($.data(this,"search") != null){
			$(this).search(readonly ? "disable" : "enable");
		}else if( $this.hasClass("easyui-calendar") ){
			if( readonly ){
				$this.removeClass("datebox");
				$this.addClass("readonly");
			}else{
				$this.addClass("datebox");
				$this.removeClass("readonly");
			}
		}else if( $this.is("select") ){
			if( readonly ){
				$("option",$this).attr("disabled",true);
			    $("option:selected",$this).attr("disabled",false);
			    $this.addClass("readonly");
			}else{
				$("option",$this).attr("disabled",false);
				$this.removeClass("readonly");
			}
		}else if( $this.is(":text") ){
			readonly ? $this.attr("readonly", true) : $this.removeAttr("readonly");
		}else if( $this.is(":radio") || $this.is(":checkbox") ){
			readonly ? $this.attr("disabled", true) : $this.removeAttr("disabled");
		}
	});
};

//是否启用验证
$.fn.validate = function( enable ){
	this.each(function(){
		var $this = $(this);
		$this.removeClass("validatebox-invalid");
		if($.data(this,"combobox") != null || $.data(this,"combotree") != null){
			$this.combo( enable ? "enable" : "disable");
		}else{
			$this.attr("disabled", !enable);
		}
	});
};

//修改editor.text的默认初始化行为
$.extend( $.fn.datagrid.defaults.editors["text"], {init: function(container, opts){
	var $text = $("<input type=\"text\" class=\"datagrid-editable-input\">").appendTo(container);
	opts = opts || {};
	if( opts.focus != false ){
		setTimeout(function(){
			$text.focus().select();
		},0);
	}
	return $text;
}});

//下拉列表框
$.fn.datagrid.defaults.editors["select"] = {
	init : function(container, options) {
		var excludes = options.excludes ? options.excludes.split(",") : [];
		var includes = options.includes ? options.includes.split(",") : [];
		var list = Source.getData(options.source);
		var html = "<select class='datagrid-editable-input' style='padding:3px 0px 3px 0px;border-right:0px;'>";
		if( !options.required || options.choose)
			html += "<option value=''></option>";
		for(var i = 0 ; i < list.length ; i++ ){
			if( excludes.contains(list[i].value) ){
				continue;
			}
			if( includes.length >0 && !includes.contains(list[i].value) ){
				continue;
			}
			if( list[i].value == options.value )
				html += "<option value=\"" + list[i].value + "\" selected='selected'>" + list[i].text + "</option>";
			else
				html += "<option value=\"" + list[i].value + "\">" + list[i].text + "</option>";
		}
		html += "</select>";
		var $select = $(html).appendTo(container);
		 $select.width(container.width());
		 $select.validatebox(options);
		return $select;
	},
	getValue : function(target) {
		return $(target).val();
	},
	destroy : function(target) {
		$(target).validatebox("destroy");
	},
	setValue : function(target, value) {
		$(target).val(value);
	},
	resize : function(target, width) {
		$(target)._outerWidth(width);
	}
};

$.fn.datagrid.defaults.editors['datepicker']  = {
	init : function(container, options) {
		var input = $("<input type=\"text\">").appendTo(container);
		input.datepicker(options);
		return input;
	},
	destroy : function(target) {
	},
	getValue : function(target) {
		return $(target).val();
	},
	setValue : function(target, value) {
		$(target).val(value);
	},
	resize : function(_18f, _190) {
		
	}
};

//区域编辑器
$.fn.datagrid.defaults.editors['region'] = {
	init : function(container, options, value) {
		options = options || {};
		var url = (ctx || "") + "/udb/region.do?value=" + (value || "") + "&root=" + (options.root || "");
		var input = $("<input type='text' url='" + url + "'/>").appendTo(container);
		input.combotree(options);
		return input;
	},
	destroy : function(target) {
		$(target).combotree("destroy");
	},
	getValue : function(target) {
		return $(target).combotree("getValue");
	},
	setValue : function(target, value) {
		$(target).combotree("setValue", value);
	},
	resize : function(target, size) {
		$(target).combotree("resize", size);
	}
};

//下拉树编辑器
$.fn.datagrid.defaults.editors['combotree'] = {
	init : function(container, options, value) {
		options = options || {};
		var input = $("<input type='text'/>").appendTo(container);
		input.combotree(options);
		return input;
	},
	destroy : function(target) {
		$(target).combotree("destroy");
	},
	getValue : function(target) {
		return $(target).combotree("getValue");
	},
	setValue : function(target, value) {
		$(target).combotree("setValue", value);
	},
	resize : function(target, size) {
		$(target).combotree("resize", size);
	}
};

//查找器
$.fn.datagrid.defaults.editors["finder"] = {
	init : function(container, options) {
		var input = null;
		var style = (options.style || "");
		if( options.input == "textarea" ){
			input = $("<textarea style=\"" + style + "\" class=\"datagrid-editable-input\" readonly='readonly'></textarea>").appendTo(container);
		}else{
			input = $("<input type='text' style=\"" + style + "\" class='datagrid-editable-input' readonly='readonly'>").appendTo(container);
		}
		input.validatebox(options);
		input.addClass("hand");
		!options.readonly ? input.removeAttr("readonly") : null;
		var event = options.event || "click";
		input.bind(event, function(){
			var url = options.url;
			var title = options.title || "查找";
			var width = options.width || 640;
			var height = options.height || 400;
			var opts = {"title":title, modal:false, "width":width, "height":height, onClose:function(value){
				if( options.formatter ){
					value = options.formatter.call(input, value);
				}
				if( $.type(value) != "undefined" ){
					input.val(value);
				}
			}};
			var params = {};
			if( $.type(options.params) == "function" ){
				params = options.params.call(input);
			}else{
				params = options.params || {};
			}
			params.value = input.val();//默认提交参数 value
			Dialog.open(url, opts, params);
		});
		return input;
	},
	destroy : function(target) {
		$(target).validatebox("destroy");
	},
	getValue : function(target) {
		return $(target).val();
	},
	setValue : function(target, value) {
		$(target).val(value);
	},
	resize : function(target, value) {
		$(target)._outerWidth(value);
	}
};
//单选框
$.fn.datagrid.defaults.editors['radio']  = {
		init : function($td, options) {
			var $table = $td.parents(".datagrid-view").find(".easyui-datagrid");
			var fieldName = $td.parents("td[field]").attr("field");
			var radioName = $table.data(fieldName);
			if( !radioName ){
				radioName = "RADIO_" + new Date().getTime();
				$table.data(fieldName, radioName);
			}
			var $radio = $("<input name='" + radioName + "' type=\"radio\">").appendTo($td);
			$radio.val(options.on);
			$radio.attr("offval", options.off);
			return $radio;
		},
		getValue : function(target) {
			if ($(target).is(":checked")) {
				return $(target).val();
			} else {
				return $(target).attr("offval");
			}
		},
		setValue : function(target, val) {
			$(target).attr("checked", $(target).val() == val)
		}
};

//速选框
$.fn.datagrid.defaults.editors.selectx = {
	init : function(container, options) {
		var input = $("<input type='text'/>").appendTo(container);
		if(options.source ){
			options.source = $.isArray(options.source) ? options.source : DictConfig.getItems(options.source);
		}else{
			options.server = options.server || false;
			options.dict = options.dict || options.source;
		}
		input.selectx(options);
		return input;
	},
	getValue : function(target) {
		return $(target).val();
	},
	destroy : function(target) {
		$(target).selectx("destroy");
	},
	setValue : function(target, value) {
		$(target).val(value);
	},
	resize : function(target, width) {
		$(target)._outerWidth(width);
	}
};

//保存变更
$.fn.datagrid.methods.saveChanges = function(target){
	var rows = $(target).datagrid("getRows");
	for(var i = 0 ; i < rows.length; i++ ){
		var index = $(target).datagrid("getRowIndex",rows[i]);
		$(target).datagrid("endEdit",index);
	}
};

//验证数据
$.fn.datagrid.methods.validateRows = function(target){
	var rows = $(target).datagrid("getRows");
	for( var i = 0 ; i < rows.length; i++ ){
		var index = $(target).datagrid("getRowIndex",rows[i]);
		var pass = $(target).datagrid("validateRow",index);
		if( !pass ){
			return false;
		}
	}
	return true;
};

//设置查询参数
$.fn.datagrid.methods.setParams = function(target, param){
	var queryParams = $(target).datagrid("options").queryParams;
	$.extend(queryParams, param); 
};

//取得查询参数
$.fn.datagrid.methods.getParams = function(target, param){
	var options = $(target).datagrid("options");
	options.queryParams = options.queryParams || {};
	return options.queryParams;
};

//取得改变行
$.fn.datagrid.methods.getChangeRows = function(target, param){
	$(target).datagrid("saveChanges");
	var inserted = $(target).datagrid("getChanges","inserted");
	$.each(inserted,function(i, e){
		e["op"] = "insert";
	});
	var deleted = $(target).datagrid("getChanges","deleted");
	$.each(deleted,function(i, e){
		e["op"] = "delete";
	});
	var updated = $(target).datagrid("getChanges","updated");
	$.each(updated,function(i, e){
		e["op"] = "update";
	});
	var changes = [].concat(inserted,deleted,updated);
	return changes;
};

//清除表格数据
$.fn.datagrid.methods.clear = function(target, param){
	$(target).datagrid("loadData",[]);
};

//删除一行
$.fn.datagrid.methods.removeRow = function(target, param){
	var ids = $.type(param) == "array" ? param : [param];
	for(var i = 0 ; i < ids.length ; i++ ){
		var index = $(target).datagrid("getRowIndex",ids[i]);
		$(target).datagrid("deleteRow",index);
	}
};

//取得行
$.fn.datagrid.methods.getRowByIndex = function(target, index){
	var options = $(target).datagrid("options");
	var row = options.finder.getRow($(target).get(0), index);
	return row;
};

//取得行 "10" 或 {"id":"10"}
$.fn.datagrid.methods.getRow = function(target, param){
	var rows = $(target).datagrid("getRows");
	if( $.type(param) == "object" ){
		for(var i = 0 ; i < rows.length ; i++ ){
			for( var name in param){
				if( rows[i][name] == param[name] ){
					return rows[i];
				}
			}
		}
	}else {
		var opts = $(target).datagrid("options");
		for(var i = 0 ; i < rows.length ; i++ ){
			if( rows[i][opts.idField] == param ){
				return rows[i];
			}
		}
	}
	return null;
};

//默认点击行事件，控制表格编辑
$.fn.datagrid.defaults.onClickRow = function(rowIndex, row){
	var $table = $(this);
	var options = $table.datagrid("options");
	if( options.editable ){//编辑的情况下
		var lastIndex = $table.data("_last_index");
		if (lastIndex != rowIndex){
			$table.datagrid('endEdit', lastIndex);
		}
		$table.datagrid('beginEdit', rowIndex);
		$table.data("_last_index", rowIndex);
	}
};

//保存表格当前的数据
$.fn.datagrid.methods.saveRows = function(target){
	var $table = $(target);
	$table.datagrid("saveChanges");
	var rows = $.toJSON($table.datagrid("getRows"));
	var options = $table.datagrid("options");
	if( options.input ){//编辑的情况下
		$("#" + options.input, $table).val(rows);
	}
	return rows;
};

//保存表格变更的数据
$.fn.datagrid.methods.saveChangeRows = function(target){
	var $table = $(target);
	$table.datagrid("saveChanges");
	var rows = $.toJSON($table.datagrid("getChangeRows"));
	var options = $table.datagrid("options");
	if( options.input ){//编辑的情况下
		$("#" + options.input, $table).val(rows);
	}
	return rows;
};

//开始编辑一行
$.fn.datagrid.methods.editRow = function(target, param){
	var $table = $(target);
	var row = $table.datagrid("getRow", param );
	var index = $table.datagrid("getRowIndex", row);
	$table.datagrid("beginEdit", index);
};

//启用按钮
$.fn.datagrid.methods.enableToolbar = function(jq, text){
	jq.each(function(){
		var state = $.data(this, "datagrid");
		if( state.panel ){
			$(".l-btn", state.panel).each(function(){
				if( text ){
					var opts = $(this).linkbutton("options");
					if( text.contains(opts.text) ){
						$(this).linkbutton("enable");
					}
				}else{
					$(this).linkbutton("enable");
				}
			});
			$(".button", state.panel).each(function(){
				if( text ){
					if( text.contains($(this).text()) ){
						$(this).removeAttr("disabled");
					}
				}else{
					$(this).removeAttr("disabled");
				}
			});
		}
	});
};

//禁用按钮
$.fn.datagrid.methods.disableToolbar = function(jq, text){
	jq.each(function(){
		var state = $.data(this, "datagrid");
		if( state.panel ){
			$(".l-btn", state.panel).each(function(){
				if( text ){
					var opts = $(this).linkbutton("options");
					if( opts.text == text ){
						$(this).linkbutton("disable");
					}
				}else{
					$(this).linkbutton("disable");
				}
			});
			$(".button", state.panel).each(function(){
				if( text ){
					if( text.contains($(this).text()) ){
						$(this).attr("disabled",true);
					}
				}else{
					$(this).attr("disabled",true);
				}
			});
		}
	});
};

//删除工具栏
$.fn.datagrid.methods.removeToolbar = function(jq){
	jq.each(function(){
		var state = $.data(this, "datagrid");
		if( state.panel ){
			$(".datagrid-toolbar", state.panel).remove();
		}
	});
};

// datagrid 加载器 如果请求中没有 parameters 参数则阻止请求
$.fn.datagrid.defaults.loader = function(data, success, error) {
	var $this = $(this);
	var opts = $(this).datagrid("options");
	if (!opts.url || !data.parameters) {
		return false;
	}
	data.service = $(this).attr("service") || "";//service获取数据
	data.total = data.total || $this.data("total");//增加总数参数
	if( $this.data("loading") ){
		//$.messager.alert("提示","正在查询数据...请勿重复提交。");
		return false;
	}
	$.ajax({
		type : opts.method,
		url : opts.url,
		data : data,
		dataType : "json",
		beforeSend:function(){
			$this.data("loading", true);//标记加载状态，避免重复请求
		},
		success : function(result) {
			$this.data("loading", false);
			if( result.error ){
				$.messager.alert("提示", result.error);
			}
			if( result.mapping ){//保存字段映射关系
				$(this).data("field-mapping", result.mapping);
			}
			$this.data("total", result.total);//保存总数
			success(result);
		},
		error : function() {
			$this.data("loading", false);
			$.messager.alert("提示","数据加载失败...");
			error.apply(this, arguments);
		}
	});
};

// treegrid 加载器 如果请求中没有 parameters 参数则阻止请求
$.fn.treegrid.defaults.loader = function(data, success, error) {
	var $this = $(this);
	var opts = $(this).treegrid("options");
	if (!opts.url || !data.parameters) {
		return false;
	}
	data.service = $(this).attr("service") || "";//service获取数据
	data.total = data.total || $this.data("total");//增加总数参数
	$.ajax({
		type : opts.method,
		url : opts.url,
		data : data,
		dataType : "json",
		success : function(result) {
			$this.data("total", result.total);//保存总数
			if( result.error ){
				$.messager.alert("提示", result.error, "warning");
			}
			if( result.mapping ){//保存字段映射关系
				$(this).data("field-mapping", result.mapping);
			}
			success(result);
		},
		error : function() {
			$.messager.alert("提示","数据加载失败...", "warning");
			error.apply(this, arguments);
		}
	});
};


//表头右键菜单
$.fn.datagrid.defaults.onHeaderContextMenu = function(e, field){
	if( Datagrid.isSortable(this, field) ){
		e.preventDefault();
		var target = this;
		var $menu = $(this).data("context.menu");
		if ( !$menu ){
			var html = "";
			html += ("<div style='width:120px;'>   \n");
			html += ("    <div name='asc' iconCls='icon-asc'>升序</div>\n");
			html += ("    <div name='desc' iconCls='icon-desc'>降序</div>\n");
			html += ("    <div>取消</div>   \n");
			html += ("</div> \n");
			$menu = $(html).insertAfter(target);
			$(this).data("context.menu", $menu);
		}
		$menu.menu({onClick:function(item){
			var state = $.data(target, "datagrid");
			var dc = state.dc;
			state.options.sortName = null;//取消当前排序
			var header = dc.header1.add(dc.header2);
			header.find("div.datagrid-cell").removeClass("datagrid-sort-asc datagrid-sort-desc");
			if( item.name == "asc" ){
				$(e.target).closest(".datagrid-cell").addClass("datagrid-sort-asc");
				Datagrid.sort($(target), field, "asc");
			}else if( item.name == "desc" ){
				$(e.target).closest(".datagrid-cell").addClass("datagrid-sort-desc");
				Datagrid.sort($(target), field, "desc");
			}
		}});
		$menu.menu('show', {
			left:e.pageX,
			top:e.pageY
		});
	}
};

//设置Panel的请求参数
$.fn.panel.methods["setParams"] = function(target, param){
	var state = $(target).data("panel");
	state.options.params = param || {};
};

//设置Panel的标题
$.fn.panel.methods["setTitle"] = function(target, title){
	var $this = $(target);
	var opts = $this.data("panel").options;
	opts.title = title;
	$this.panel("header").find("div.panel-title").html(title);
}

//取得区域节点
$.fn.combotree.methods["getRegionNode"] = function(target, id){
	var $tree = $(target).combotree("tree");
	return $tree.tree("getRegionNode");
};

//取得区域节点
$.fn.tree.methods["getRegionNode"] = function(target, id){
	var $tree = $(target);
	var node = $tree.tree("getSelected");
	if( !node ){
		return null;
	}
	node.getPathNodes = function(){
		var nodes = [node];
		var pnode = node;
		while( pnode = $tree.tree("getParent", pnode.target)  ){
			nodes.push(pnode);
		}
		nodes.reverse();
		return nodes;
	};
	var nodes = node.getPathNodes();
	node.getPath = function( split ){
		var paths = [];
		for(var i = 0 ; i < nodes.length; i++ ){
			paths.push(nodes[i].text);
		}
		return paths.join(split || "");
	};
	node.getVillage = function(){
		for(var i = 0 ; i < nodes.length; i++ ){
			var id = nodes[i].id;
			if( id.length == 12 && !isNaN(id.charAt(0)) ){
				return nodes[i];
			}
		}
		return null;
	};
	node.getGroup = function(){
		for(var i = 0 ; i < nodes.length; i++ ){
			if( nodes[i].id.startWith("J") ){
				return nodes[i];
			}
		}
		return null;
	};
	node.getDoor = function(){
		for(var i = 0 ; i < nodes.length; i++ ){
			if( nodes[i].id.startWith("D") ){
				return nodes[i];
			}
		}
		return null;
	};
	node.getFloor = function(){
		for(var i = 0 ; i < nodes.length; i++ ){
			if( nodes[i].id.startWith("F") ){
				return nodes[i];
			}
		}
		return null;
	};
	node.getHouse = function(){
		for(var i = 0 ; i < nodes.length; i++ ){
			if( nodes[i].id.startWith("H") ){
				return nodes[i];
			}
		}
		return null;
	};
	return node;
};

//当combotree弹出显示时自动滚动到对应位置
$.fn.combotree.defaults.onShowPanel = function(){
	var panel = $(this).combo('panel');
	var value = $(this).combo("getValue");
	var item = panel.find("div[node-id='" + value + "']");
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

//格式化
$.fn.combobox.defaults.formatter = function(row){
	var multiple = $(this).attr("multiple");
	var opts = $(this).combobox('options');
	if( multiple ){
		return "<div class='hand'><input type='checkbox' class='valgin-input'/> " + row[opts.textField] + "</div>";
	}
	return "<div class='hand'>" + row[opts.textField] + "</div>";
};
//选择之后
$.fn.combobox.defaults.onAfterSelect = function(item){
	$(":checkbox",item).attr("checked",true);
};
//取消选择之后
$.fn.combobox.defaults.onAfterUnselect = function(item){
	$(":checkbox",item).attr("checked",null);
};

//取得选择的数据
$.fn.combobox.methods.getSelected = function(target, param){
	var value = $(target).combobox("getValue");
	var opts = $(target).combobox("options");
	var rows = $(target).combobox("getData");
	for(var i = 0; i < rows.length; i++){
		var row = rows[i];
		if(row[opts.valueField] == value){
			return row;
		}
	}
};

//设置Tab的加载状态
//$tabs.tabs("setTabLoaded",'人员信息', false);
$.fn.tabs.methods.setTabLoaded = function(jq, title, isLoaded){
	return jq.each(function(){
		var $tabs = $(this);
		var $panel = $tabs.tabs("getTab", title);
		if( $panel ){
			var state = $panel.data("panel");
			state.isLoaded = isLoaded;
		}
	});
};
//$tabs.tabs("reset"); 重置tabs状态，设置为未加载，并且刷新当前选中的tab
$.fn.tabs.methods.reset = function(jq, params){
	return jq.each(function(){
		var tabs = $(this).tabs("tabs");
		$.each(tabs, function(i, tab){
			var state = tab.data("panel");
			if( params ){
				tab.panel("options").params = $.extend({}, tab.panel("options").params, params);
			}
			state.isLoaded = false;//重置加载状态
		});
		$.each(tabs, function(i, tab){//刷新当前选中的
			var opts = tab.panel('options');
			if (opts.closed == false){
				tab.panel('refresh');
			}
		});
	});
};

//设置Tab的请求参数
//$tabs.tabs("setTabParams",'人员信息', {uuid:'12121221111'});
$.fn.tabs.methods.setTabParams = function(jq, title, params){
	return jq.each(function(){
		var $tabs = $(this);
		var tab = $tabs.tabs("getTab", title);
		if( tab ){
			var p = $.extend((tab.panel("options").params || {}), params);
			$panel.panel("options").params = p;
		}
	});
};

//刷新tab
//$tabs.tabs("refresh",'人员信息', {uuid:'12121221111'});
$.fn.tabs.methods.refresh = function(jq, title, params){
	return jq.each(function(){
		var $tabs = $(this);
		if( params ){
			$tabs.tabs("setTabParams", title, params);
		}
		var $panel = $tabs.tabs("getTab", title);
		if( $panel ){
			$panel.panel("refresh");
		}
	});
};

//$tabs.tabs("refreshAll"); 重置tabs状态，设置为未加载，并且刷新当前选中的tab
$.fn.tabs.methods.refreshAll = function(jq, params){
	return jq.each(function(){
		var tabs = $(this).tabs("tabs");
		$.each(tabs, function(i, tab){
			var state = tab.data("panel");
			if( params ){
				tab.panel("options").params = $.extend({}, tab.panel("options").params, params);
			}
			state.isLoaded = false;//重置加载状态
			if( tab.panel('options').closed == false ){
				tab.panel('refresh');
			}
		});
	});
};

$.extend($.fn.datagrid.defaults.view,{
	onRenderPlaceholder:function(target){
		var state = $.data(target, "datagrid"), opts = state.options;
		if( !opts.placeholder) {
			return;
		}
		var content = opts.placeholder;
		if( !state.holder ){
			if( content.startsWith(".") || content.startsWith("#") ){
				state.holder = Page.find(target, content);
			}else{
				state.holder = $(content);
			}
		}
		var rows = $(target).datagrid("getRows");
		if( rows.length == 0 ){
			state.dc.view.mask(state.holder);
		}else{
			state.dc.view.unmask();
		}
		th.bindEvent(state.holder);//绑定上下文的事件
	}
});