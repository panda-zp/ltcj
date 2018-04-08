window.DialogWindow = function( dialogId ){
	this.id = dialogId;
	this.open = function(content, settings, queryParams){
		$("#" + this.id).html("");
		var $dialog = $("<div class='dialog-div'></div>").appendTo($("#" + this.id));
		var options = {title:'对话框',width:'640',height:'480'};
		$.extend(options, (settings || {}));
		//@see com.th.fastwork.web.tag.edit.FormTag
		queryParams = $.extend({}, {IN_DIALOG:true}, queryParams);
		$dialog.attr("page-params", true).data("page-params", queryParams);//设置参数
		if( content instanceof jQuery || content.startsWith("<") ){
			content = Page.getEvalHtml(content, queryParams);
			$(content).appendTo($dialog);
		}else {//URL格式
			var html = $.ajax({"url":content,"cache":false,"async":false,"data":(queryParams || {}),"type":"POST"}).responseText;
			if( !html || html.contains("<title>错误页面</title>") ){
				html = $("#ERROR").html();
			}
			html = Page.getEvalHtml(html, queryParams);
			$(html).appendTo($dialog);
		}
		//打开参数
		options.args = {"content":content, "settings":settings, "queryParams":queryParams};
		options.buttons = $("#dialog-buttons",$dialog);
		options.toolbar = $("#dialog-toolbar",$dialog);
		options.onCloseHandler = (options.onClose || function(){});
		options.onClose = function( param ){
			var args = param != undefined ? param : $(this).data("dialog-args");
			options.onCloseHandler.call(this, args);
			setTimeout(function(){
				$dialog.dialog('destroy');
			},200);
		};
		var _this = this;
		$dialog.dialog(options);
		//自动定位到第一个可见的输入框
		$(":text[input='true']", $dialog).not(":hidden").first().focus();
		return $dialog;
	};
	
	//关闭窗口
	this.close = function( element, param ){
		if( element == "all" ){
			$(".dialog-div").dialog("close", param);
		}else{
			var $dialog = element.target ? $(this).parents(".dialog-div") : $(element).parents(".dialog-div");
			$dialog.each(function(){
				$(this).dialog("close", param);
			});
		}
	};
	
	//遮罩
	this.mask = function(element, msg ){
		var $dialog = element ? $(element).parents(".dialog-div") : $(".dialog-div");
		$dialog.mask(msg);
	};
	
	//解除遮罩
	this.unmask = function(element){
		var $dialog = element ? $(element).parents(".dialog-div") : $(".dialog-div");
		$dialog.unmask();
	};
	
	//设置回调参数
	this.setArgs = function(element, args){
		var $dialog = $(element).parents(".dialog-div");
		$dialog.data("dialog-args", args)
	};
	
	//设置对话框的参数
	this.setOptions = function(element, options){
		var $dialog = $(element).parents(".dialog-div");
		$dialog.each(function(){
			var $this = $(this);
			if( $this.data("dialog") ){
				$.extend($this.dialog("options"), options);
			}else{
				$this.data("data-options", options);
			}
		})
	};
	//取得对话框对象
	this.getDialog = function(element){
		var $dialog = $(element).parents(".dialog-div");
		return $dialog;
	};
	
	//刷新对话框
	this.reload = function(element, params){
		var $dialog = $(element).parents(".dialog-div");
		var options = $dialog.dialog("options");
		var args = options.args;
		Dialog.close(element);
		var queryParams = $.extend({}, args.queryParams, params);
		Dialog.open.call(Dialog, args.content, args.settings, queryParams);
	};
};
//关闭
DialogWindow.close = function( type ){
	if( type == "top" ){
		var $top = $(".window:visible", "body").last();
		$top.find(".panel-tool-close").focus().click();
	}
};
//对话框
window.Dialog = new DialogWindow("dialogs");

window.Task = {};

//打开任务
Task.open = function( funId, funName, params ){
	Service.invoke("AdminService.getFunctional",{"id":funId},function(text){
		var fun = eval("(" + text + ")");
		Tab.open(funName,fun.execevent,true);
	});
};

//人员信息查询
var PeopleFinder = {};

//查询成都基本信息库
PeopleFinder.getPip = function( callback , params ){
	var url = ctx + "/common/pip.jsp?callback=" + callback;
	var options = {title:"查询人员信息",modal:true,width:850,height:420};
	Dialog.open(url, options, params);
};

//查询成都基本信息库
PeopleFinder.getBase = function( callback , params){
	var url = ctx + "/common/base.jsp?callback=" + callback;
	var options = {title:"查询人员信息",modal:true,width:640,height:400};
	Dialog.open(url, options, params);
};

var FileManager = {};

//文件上传
//setting 设置
FileManager.upload = function(setting){
	var url = ctx + "/common/upload.jsp";
	var options = {title:(setting.title || "附件上传"),modal:true,width:560,height:300};
	Dialog.open(url, options, setting);
};
//文件下载
FileManager.download = function( fileId ){
	var url = ctx + "/file/download.do?id=" + fileId;
	window.open(url);
};
//上传测试
FileManager.test = function(){
	var setting = {sys:"S",code:"S512012901010101",service:"FileService.doOther({cid:'S5101292012000012'})",callback:"WfsyEditAction.uploadSuccess"};
	FileManager.upload(setting);
};

//导入EXCEL
FileManager.importExcel = function( setting ){
	var url = ctx + "/common/import.jsp";
	var options = {title:(setting.title || "导入数据"),modal:true,width:560,height:300};
	Dialog.open(url, options, setting);
};

//选择文件
FileManager.select = function(params, callback){
	var url = ctx + "/common/icons.jsp";
	var options = {title: (params.title || "请选择"),modal:true,width:680,height:400,onClose:function(icon){
		if( icon ){
			callback(icon);
		}
	}};
	Dialog.open(url, options, params);
};

window.Datagrid = {};

Datagrid.init = function($table, $form){
	if($form && $form.length){//有查询条件和表格的情况
		$("[name='_search'],#search-button", $form).click(function(){
			Datagrid.query($table, $form);
		});
		if( $form.attr("validate") == "true" ){
			$.initValid($form);
		}
		if( $table.attr("custom") == "true" ){
			QueryForm.custom($table, $form);
		}
	}
	//组件解析完成
	$.setDataOptions($table,{onParseComplete:function(target){
		var $t = $(target);
		if( $t.attr("autoQuery") != "true" ) return;
		if( $form && $form.length){//有表单情况
			Datagrid.query($t, $form);
		}else{//只有表格的情况
			var opts = $table.data("datagrid").options;
			Datagrid.reload($t, opts.queryParams);
		}
	}});
	Datagrid.bindAutoQuery($form);
	Datagrid.bindCustom($table);
	Datagrid.register($table);
};

//注册Datagrid
Datagrid.register = function(target){
	var url = $(target).attr("url");
	if( url ){//JSP标签模式直接会生成URL
		return;
	}
	var columns = [];
	$("th", target).each(function(){
		var th = $(this);
		var column = {
			field : th.attr("field"),
			title : th.text() || th.attr("title"),
			dict : th.attr("dict"),
			format : th.attr("format"),
			renderer : th.attr("renderer"),
			checkbox : th.attr("checkbox"),
			width : th.attr("width"),
			align : th.attr("align")
		};
		columns.push(column);
	});
	var xsql = $(target).attr("xsql");
	var dataService = $(target).attr("dataService");
	var data = {"xsql":xsql, "dataService": dataService, "columns": $.toJSON(columns)};
	var pageId = $.ajax({"url":(ctx + "/page/datagrid_register.do"),"cache":false,"async":false,"data":data,"type":"POST"}).responseText;
	$(target).attr("pageId", pageId);
	$(target).attr("url", ctx + "/page/datagrid.do?pageId=" + pageId);
	return pageId;
};

//绑定快速检索
Datagrid.bindCustom = function($table){
	var $page = $table.parents("div[page='true']:first");
	var $combo = $("[custom='true']", $page);
	$.setDataOptions($combo, {onSelect:function(record){
		$table.datagrid("setParams",{"custom":record.value});
		Datagrid.reload($table);
	}});
};

//绑定自动查询
Datagrid.bindAutoQuery = function($form){
	if( !$form || !$form.length ) return;
	var $button = $("[name='_search'],#search-button", $form);
	var $inputs = $("[autoQuery='true']", $form);
	$inputs.each(function(i){
		var $this = $(this);
		var type = $this.attr("type");
		$this.off(".form");
		var _class = $this.attr("class");
		if( $this.is("select") ){
			$this.on("change.form",function(){
				$button.click();
			});
		}else if( $this.hasClass("easyui-selectx") ){
			$this.data("data-options", {onChange:function(){
				$button.click();
			}});
		} else if( type == "text" || type == "search" || type == "number"){
			$this.on("keydown.form",function(e){
				if( e.keyCode == 13 ){
					$button.click();
					return false;
				}
			});
		}else if( $this.is(":checkbox") || $this.is(":radio") ){
			$this.on("click.form",function(){
				$button.click();
			});
		}
	});
};

//执行查询
Datagrid.query = function($table,$form){
	var isValidate = $form.attr("validate") == "true";//是否需要验证查询表单
	if( isValidate && !$form.form("validate") ){
		return false;
	}
	var options = $.parser.parseOptions($form,[{"onBeforeSubmit":"object"}]);
	if( options.onBeforeSubmit ){
		var params = Form.getParams($form);
		if( options.onBeforeSubmit.call($form, params) == false ){
			return;
		}
	}
	var parameters = Form.getQueryParams($form);//表单参数
	$table.datagrid("setParams",{"parameters":parameters});
	var prid = Page.getPrid($form);//取得分区ID
	$table.datagrid("setParams",{"PRID":prid});//设置分区ID
	if( $table.datagrid("options").pagination ){//每次点击查询重置为第一页
		$table.datagrid("options").pageNumber = 1;
		$table.datagrid("getPager").pagination({pageNumber:1});
	}
	$table.datagrid("setParams",{"orderBy":""});//清空排序
	Datagrid.reload($table);
};

//重置分页
Datagrid.resetPage = function( $table ){
	if( $table.datagrid("options").pagination ){//每次点击查询重置为第一页
		$table.datagrid("options").pageNumber = 1;
		$table.datagrid("getPager").pagination({pageNumber:1});
	}
};

//删除一行
Datagrid.removeRow = function($table, id){
	if( id ){
		$table.datagrid("removeRow", id);
	}
};

//取得一行输数据
Datagrid.getRow = function($table, id){
	return $table.datagrid("getRow", id);
};

//更新行
Datagrid.updateRow = function($table, row){
	var index = $table.datagrid("getRowIndex", row);
	$table.datagrid("updateRow", {"index":index,"row":row});
};

//重新加载数据
Datagrid.reload = function( $table, params){
	if( $.type(params) == "object"){
		var parameters = [];
		for(var name in params){
			parameters.push({"name":name,"value":params[name]});
		}
		$table.datagrid("setParams",{"parameters":$.toJSON(parameters)});
	}else if( $.type(params) ==  "array"){
		$table.datagrid("setParams",{"parameters":$.toJSON(params)});
	}
	$table.data("total",null);
	$table.datagrid("clearSelections");
	$table.datagrid("reload");
};

//能否排序
Datagrid.isSortable = function(target, field){
	var mapping = $(target).data("field-mapping");
	var sortable = $(target).attr("serverSort") == "true";
	return sortable && mapping && mapping[field]; 
};

//服务器端排序
Datagrid.sort = function( $table, field, sort ){
	var mapping = $table.data("field-mapping");
	var orderBy = mapping[field] + " " + sort;
	$table.datagrid("setParams",{"orderBy":orderBy});
	$table.data("total",null);
	$table.datagrid("clearSelections");
	$table.datagrid("reload");
};

//数据字典格式化函数
Datagrid.getDictFormatter = function( source ){
	if( $.type(source) == "array" ){
		return function(value, row, index){
			for(var i = 0 ; i < source.length; i++){
				if( source[i] == value ){
					return source[i + 1];
				}
			}
			return "";
		};
	}else if( $.type(source) == "object" ){
		return function(value, row, index){
			return source[value] || "";
		};
	}else{
		return function(value, row, index){
			return value ? Source.getName(source + "", value) : "";
		};
	}
};

//区域格式化函数
Datagrid.getRegionFormatter = function( attr ){
	attr = attr || "name";
	return function(value, row, index){
		if( value ){
			var region = Source.getData("region:" + value);
			return region ? region[attr] : "";
		}
		return "";
	};
};

//清除数据
Datagrid.clear = function( $table ){
	$table.datagrid("clear");
};

//刷新一行
Datagrid.refreshRow = function($table, row){
	var index = $table.datagrid("getRowIndex", row);
	$table.datagrid("refreshRow", index);
};

//开始编辑所有行
Datagrid.beginEditAll = function($table){
	var rows = $table.datagrid("getRows");
	$.each(rows, function(i, row){
		$table.datagrid("beginEdit", i);
	});
};

//快速查询，有工具条的情况
Datagrid.search = function($table, params){
	var parameters = [], $toolbar = $table.parents(".datagrid");
	var $params = $("[data-type='params']", $toolbar);
	if( $.type(params) == "object" ){
		for( var name in params ){
			parameters.push({name:name, value:params[name]});
		}
	}else if( $.type(params) == "array" ){
		parameters = params;
	}else {
		parameters = $.eval($params.val() || "[]");
	}
	$params.val( $.toJSON(parameters) );
	var $key = $("[data-type='key']", $toolbar);
	var cols = JSON.parse($key.attr("data-columns") || "[]");
	var value = ($key.val() || "").trim();
	if( value ){
		var fields = [], type = "$OR";
		for(var i = 0; i < cols.length; i=i+2){
			var field = {name:cols[i], op:cols[i+1], value:value, type:type};
			fields.push(field);
		}
		parameters = parameters.concat(fields);
	}
	Datagrid.reload($table, parameters);
};

//快速查询
Datagrid._fast_query = function(){
	var $search = $("[data-type=search]", $(this).parents(".datagrid"));
	if( $search.exist() ){
		$search.click();
	}else{
		var $table = $(this).parents(".datagrid").find(".easyui-datagrid");
		Datagrid.search($table);	
	}
};

//回车查询
Datagrid._fast_keyquery = function(e){
	if( e.keyCode == 13 ){
		Datagrid._fast_query.call(this);
	}
};

//清除条件
Datagrid._fast_clear = function(){
	var $this = $(this);
	var $toolbar = $this.parent();
	$("[data-type='key']", $toolbar).val("");
};

//高级查询
Datagrid._fast_more = function(){
};

//导出数据
Datagrid.exportPage = function(){
	var $table = this;
	var params = $table.datagrid("getParams");
	var pager = $table.datagrid("getPager").pagination("options");
	var url = ctx + "/common/export.jsp";
	var options = {title:"数据导出",modal:true,width:350,height:140,onClose:function(reload){
	}};
	var table = {};
	table.pageId = $table.attr("pageId");
	table.title = $table.attr("title") || Tab.getSelectedTitle();
	table.total = pager.total;
	table.pageSize = pager.pageSize;
	table.pageNumber = pager.pageNumber;
	params["table"] = $.toJSON(table);
	Dialog.open(url, options, params);
};

//作用域范围内的表格进行联动
Datagrid.scrollLeftLink = function($c){
	//横向滚动条联动
	var $header = $('div.datagrid-view2 div.datagrid-header',$c);
	$header.scroll(function () {
	    $('div.datagrid-view2 div.datagrid-body', $c).prop({ scrollLeft: this.scrollLeft, scrollTop: this.scrollTop });
	    $header.not(this).prop({ scrollLeft: this.scrollLeft, scrollTop: this.scrollTop });
	});
};

//竖向滚动条联动
Datagrid.scrollTopLink = function($c){
    var $body = $('div.datagrid-body', $c);
    $body.scroll(function () {
    	$body.not(this).prop({scrollLeft: this.scrollLeft, scrollTop: this.scrollTop});
    });
};

window.Treegrid = {};

Treegrid.init = function($table, $form){
	if($form && $form.length){//有查询条件和表格的情况
		$("[name='_search'],#search-button", $form).click(function(){
			Treegrid.query($table, $form);
		});
		if( $form.attr("validate") == "true" ){
			$.initValid($form);
		}
		if( $table.attr("custom") == "true" ){
			QueryForm.custom($table, $form);
		}
	}
	//组件解析完成
	$.setDataOptions($table,{onParseComplete:function(target){
		var $t = $(target);
		if( $t.attr("autoQuery") != "true" ) return;
		if( $form && $form.length){//有表单情况
			Treegrid.query($t, $form);
		}else{//只有表格的情况
			var opts = $table.data("treegrid").options;
			Treegrid.reload($t, opts.queryParams);
		}
	}});
	Datagrid.bindAutoQuery($form);
	Treegrid.register($table);
};

//执行查询
Treegrid.query = function($table, $form){
	if( !$form.form("validate") ){
		return false;
	}
	var options = $.parser.parseOptions($form,[{"onBeforeSubmit":"object"}]);
	if( options.onBeforeSubmit ){
		var params = Form.getParams($form);
		if( options.onBeforeSubmit.call($form, params) == false ){
			return;
		}
	}
	var parameters = Form.getQueryParams($form);//表单参数
	$table.treegrid("options").pageNumber = 1;//每次点击查询重置为第一页
	Treegrid.reload($table, parameters);
};

//重新加载数据
Treegrid.reload = function( $table, params ){
	var parameters = "[]";
	if( $.type(params) == "string" ){
		parameters = params;
	}else if( $.type(params) == "object" ){
		var array = [];
		for(var name in params){
			array.push({"name":name,"value":params[name]});
		}
		parameters = $.toJSON(array);
	}else if( $.type(params) ==  "array"){
		parameters = $.toJSON(params);
	}
	$table.data("doQuery",true);
	$table.data("total",null);
	$table.treegrid("clearSelections");
	var service = $table.attr("service");
	if( service ){//如果存在Service的情况用service加载数据
		$table.datagrid("loading");
		var params = $table.datagrid("getParams");
		var args = {"pageId":$table.attr("pageId"), "service":service, "parameters":(params.parameters || "[]")};
		Service.invoke("PageService.getTreegridData",args,function(data){
			$table.datagrid("loadData",$.eval(data));
			$table.datagrid("loaded");
		});
	}else{
		$table.treegrid("reload",{"parameters":parameters});
	}
};

//注册Datagrid
Treegrid.register = function(target){
	var url = $(target).attr("url");
	if( url ){//JSP标签模式直接会生成URL
		return;
	}
	var columns = [];
	$("th", target).each(function(){
		var th = $(this);
		var column = {
			field : th.attr("field"),
			title : th.text() || th.attr("title"),
			dict : th.attr("dict"),
			format : th.attr("format"),
			renderer : th.attr("renderer"),
			checkbox : th.attr("checkbox"),
			width : th.attr("width"),
			align : th.attr("align")
		};
		columns.push(column);
	});
	var xsql = $(target).attr("xsql");
	var dataService = $(target).attr("dataService");
	var data = {"xsql":xsql, "dataService": dataService, "columns": $.toJSON(columns)};
	var pageId = $.ajax({"url":(ctx + "/page/treegrid_register.do"),"cache":false,"async":false,"data":data,"type":"POST"}).responseText;
	var idField = $(target).attr("idField");
	var pidField = $(target).attr("pidField");
	var sortField = $(target).attr("sortField") || idField;
	var params = "pageId=" + pageId + "&idField=" + idField + "&pidField=" + pidField + "&sortField=" + sortField;
	$(target).attr("url", ctx + "/page/treegrid.do?" + params);
	return pageId;
};

// CardView
window.CardView = {};

CardView.init = function($view, $form) {
	if ($form && $form.length > 0) {
		$("[name='_search']",$form).click(function(){
			CardView.query($view, $form);
		});
		Datagrid.bindAutoQuery($form);
		CardView.query($view, $form);
	} else {
		CardView.query($view);
	}
};

CardView.query = function($view, $form) {
	var params = null;
	if( $form && $form.length > 0 ) {
		params = Form.getQueryParams($form);
	}
	var queryParams = $view.cardview("options").queryParams;
	var array = [];
	if( params != null ) {
		array = eval('(' + params + ')');
	} 
	for( var name in queryParams) {
		if( name != 'parameters' ) {
			var parameter = {"name":name,"value":queryParams[name]};
			array.push(parameter);
		}
	}
	$view.cardview("reload", {"parameters" : $.toJSON(array)});
};


//登录中心
window.LoginCenter = Class.extend({
	init:function($c, options){
		var that = this;
		that.$c = $c;
		that.options = options;
		that.template = th.template( $(options.template, $c).text() );
		var $panel = that.panel = that.getPanel();
		that.combo = $(options.combo, $c)
		that.combo.off(".combo").on("focus.combo click.combo",function(){
			that.showHistory();
			setTimeout(function(){that.combo.select();}, 0);
		}).on("keyup.combo",function(e){
			var code = parseInt(e.keyCode || -1);
			var value = that.combo.val();
			if( (code >=48 && code <=90) //0-9 A-Z
					|| [8,46,32].contains(e.keyCode)){//backspace,del,space
				if( !value ){
					that.showHistory();
					return false;
				}
				if( !th.isPym(value) ){
					return false;
				}
				th.delay(function(){
					var text = $.ajax({"url":ctx+"/login/users.do","cache":false,"async":false,"data":{"pym":value},"type":"POST"}).responseText;
					var users = $.eval(text);
					that.show(users);
				},500);
			}
		}).on("keydown.combo", function(e) {
			if( e.keyCode == 13 ){
				var data = $(".combobox-item-selected", $panel).data("data");
				if( data ){
					that.onSelect(data);
				}
			}else if( e.keyCode == 38){
				that.selectPrev();
				return false;
			}else if( e.keyCode == 40){
				that.selectNext();
				return false;
			}
		}).on("blur.combo", function(e){
			$panel.panel("close");
		});
	},
	show: function(list){
		var that = this;
		var options = that.options;
		var combo = that.combo, $panel = that.panel;
		$panel.empty();
		if( !list.length ) {
			$panel.panel("close");
			return;
		}
		var $table = $("<table class='view-table'></table>").appendTo($panel);
		$.each(list, function(i, data){
			var html = that.template(data);
			var item = $(html).appendTo($table);
			item.addClass("combobox-item");
			item.data('data', data);
			item.bind("mousedown.combo", function(e){
				e.preventDefault();
				var data = $(this).data("data");
				that.onSelect(data);
				$panel.panel("close");
			}).hover(function(){
				$(this).addClass("combobox-item-hover");
			},function(){
				$(this).removeClass("combobox-item-hover");
			});
			if( i == 0 ){
				item.addClass("combobox-item-selected");
			}
		});
		$(".combobox-item-close", $table).bind("mousedown.combo", function(){
			var $tr = $(this).parents("tr:first");
			var data = $tr.data("data");
			LoginCenter.removeUser(data.loginName);
			$tr.remove();
			if( !$("tr", $table).exist() ){
				$panel.panel("close");//全部被删除了...
			}
			return false;
		}).css({fontSize:"8px", cursor:"pointer", textAlign:"center"});
		$("td", $table).css({"border":"none"});
		var top = combo.offset().top + combo._outerHeight();
		var left = combo.offset().left;
		$panel.panel("panel").css("z-index", $.fn.window.defaults.zIndex++);
		$panel.panel("open");
		$panel.panel("move", {left: combo.offset().left, top: top - 1});
	},
	showHistory: function(){
		var that = this, $combo = that.combo;
		var users = LoginCenter.getUsers();
		that.show(users);
	},
	selectPrev: function(){
		var that = this, $panel = that.panel;
		var $select = $(".combobox-item-selected", $panel);
		var $item = $select.exist() ? $select : $();
		var $prev = $item.prev(':visible');
		if( $prev.exist() ){
			$select.removeClass("combobox-item-selected");
			$prev.addClass("combobox-item-selected");
		}
	},
	selectNext: function(){
		var that = this, $panel = that.panel;
		var $select = $(".combobox-item-selected", $panel);
		var $next = $select.exist() ? $select.next() : $();
		if( $next.exist() ){
			$select.removeClass("combobox-item-selected");
			$next.addClass("combobox-item-selected");
		}
	},
	getPanel: function(){
		var that = this, combo = that.combo;
		if( !that.panel ){
			var panel = that.panel = $("<div class=\"combo-panel\"></div>").appendTo("body");
			panel.panel({doSize: false, closed: true, cls: "combo-p",
				style : {position: "absolute", zIndex: 10},
				onOpen : function() {$(this).panel("resize");}
			});
		}
		return that.panel;
	},
	onSelect:function( data ){
		var that = this, $combo = that.combo;
		var options = that.options;
		(options.onSelect || $.noop).call($combo, data);
	}
});

//添加登录成功的用户
LoginCenter.addUser = function(loginName, jgmc){
	var users = $.eval(LocalData.get("USERS") || "[]");
	var list = [];
	$.each(users, function(index, user){
		if( user.loginName != loginName ){
			list.push(user);
		}
	});
	var pym = th.getPym(loginName);
	var user = {"loginName":loginName, "jgmc":jgmc, "pym":pym};
	list.push(user);
	list.reverse();
	LocalData.put("USERS", list);
};
//删除用户
LoginCenter.removeUser = function(loginName){
	var users = $.eval(LocalData.get("USERS") || "[]");
	var list = [];
	$.each(users, function(index, user){
		if( user.loginName != loginName ){
			list.push(user);
		}
	});
	LocalData.put("USERS", list);
};
//取得登录用户
LoginCenter.getUsers = function(){
	var users = $.eval(LocalData.get("USERS") || "[]");
	return users;
};

//图表组件
var Chart = {};
Chart.init = function($chart, $form){
	if($form && $form.length){//有查询条件和表格的情况
		$("[name='_search']", $form).click(function(){
			$chart.chart("reload", Form.getQueryParams($form));
		});
		$chart.data("form", $form);//图表DIV绑定表单
		if( $form.attr("validate") == "true" ){
			$.initValid($form);
		}
	}
	//组件解析完成
	$.setDataOptions($chart, {onParseComplete:function(target){
		var $t = $(target);
		if( $t.attr("autoQuery") != "true" ) return;
		if( $form && $form.length){//有表单情况
			$chart.chart("reload", Form.getQueryParams($form));
		}else{//只有图表的情况
			$chart.chart("reload");
		}
	}});
	Datagrid.bindAutoQuery($form);
};

//格式化器
window.Formatter = {};

//数据字典格式化函数
Formatter.dict = function( source ){
	if( $.type(source) == "array" ){
		return function(value, row, index){
			for(var i = 0 ; i < source.length; i++){
				if( source[i] == value ){
					return source[i + 1];
				}
			}
			return "";
		};
	}else{
		return function(value, row, index){
			if(!value){
				return "";
			}
			value += "";
			source = source + "";
			var valueArray = value.split(",");
			var text = [];
			$.each(valueArray, function(i, item){
				text.push(DictConfig.getText(source, item));
			});
			return text.join();
		};
	}
};

//原样显示格式化
Formatter.pre = function(height){
	return function(value, row, index){
		value = $.isEmpty(value) ? "" : value;
		return "<pre style='max-height:" + (height || "") + "px;font-family:Microsoft YaHei;'>" + value + "</pre>";
	};
};

//原样显示格式化
Formatter.html = function(height){
	return function(value, row, index){
		return "<div style='max-height:" + (height || "") + "px;font-family:Microsoft YaHei;'>" + value + "</div>";
	};
};

//转换为文本
Formatter.text = function(height){
	return function(value, row, index){
		var text = utils.toText(value);
		return "<div style='max-height:" + (height || "") + "px;font-family:Microsoft YaHei;'>" + text + "</div>";
	};
};

//转换为Json字符串
Formatter.toJSON = function(height){
	return function(value, row, index){
		var text = $.toJSON(value);
		return text;
	};
};