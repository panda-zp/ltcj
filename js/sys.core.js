var ctx= "";
window.Constant = {};

//触发重置大小 @see 03.jquery.panel.js triggerResize
Constant.PANEL_TRIGGER_RESIZE = false;

window.Source = {cache:{}, dict:{}};
//取得资源
Source.getData = function( source ){
	source = source.contains(":") ? source : "dict:" + source;
	var data = this.cache[source];
	if( !data ){
		var text = Service.invoke("ResourceService.getSource",{"source":source});
		data = $.eval(text);
		this.cache[source] = data;
	}
	return data;
};

//清除资源
Source.clear = function(sources){
	for(var i = 0; i < sources.length; i++ ){
		var name = sources[i];
		var source = name.contains(":") ? name : "dict:" + name;
		this.cache[source] = null;
		this.dict[name] = null;
	}
};

//通过值取得名称
Source.getName = function(source, value){
	var items = Source.getData(source);
	for(var i = 0 ; i < items.length; i++ ){
		if(items[i].value == value){
			return items[i].text;
		}
	}
	return "";
};

//取得字典项目
Source.getItem = function(source, value){
	var items = Source.getData(source);
	for(var i = 0 ; i < items.length; i++ ){
		if(items[i].value == value){
			return items[i];
		}
	}
	return null;
};

var DictConfig = {};

//取得字典文本
DictConfig.getText = function(code, value){
	code = code || "";
	if( code.startsWith("DATA.") ){//数据速查
		if( !Source.dict[code] ){
			Source.dict[code] = {};
		}
		text = Source.dict[code][value];
		if( text == undefined && value){
			text = Service.invoke("ResourceService.getDictText",{"code":code,"value":value});
			Source.dict[code][value] = text;
		}
		return text || "";
	}else{
		return Source.getName(code, value);
	}
};

//取得字典项
DictConfig.getItem = function(code, value){
	var item = Source.getItem(code, value);
	return item;
};


//取得字典项
DictConfig.getItems = function(code){
	return Source.getData("dict:" + code);
};

//刷新字典
DictConfig.clear = function(code){
	return Source.clear([code]);
};

var RegionConfig = {};
//取得区域名称
RegionConfig.getName = function(code){
	var source = "region:" + code;
	var data = Source.getData(source);
	return data ? data.name : null;
};

//取得字典项
RegionConfig.getFullName = function(code){
	var source = "region:" + code;
	var data = Source.getData(source);
	return data ? data.fullname : null;
};

var Config = {cache:{}};

/**
 * 获取系统参数配置
 * @param code 参数编码
 * @param defValue 默认值
 */
Config.getValue = function(code, defValue){
	var config = Config.cache[code];
	if( !config ){
		config = Config.cache[code] = Service.getJSON("ConfigService.getConfigByCode", {"code":code});
	}
	if( !config ) return defValue;
	var value = config.configValue;
	return value;
};

window.Service = {};
Service.url = ctx + "/service/invoke.do";
Service.invoke = function(service, parameters, callback){
	var args = Service.getArgs(parameters);
	var data = $.extend({}, {"service":service,"args":args});
	if( callback ){
		$.post(Service.url, data, function(text){
			if( Service.validateError(text) ){
				callback(text);
			}
		});
	}else{
		var text = $.ajax({"url":Service.url,"cache":false,"async":false,"data":data,"type":"POST"}).responseText;
		return Service.validateError(text) ? text : null;
	}
};
//取得JSON 自动解析文本
Service.getJSON = function(service, parameters, callback){
	if(callback){
		Service.invoke(service, parameters, function(text){
			var json = Service.parseJSON(text);
			callback(json);
		});
	}else{
		var text = Service.invoke(service, parameters);
		var json = Service.parseJSON(text);
		return json;
	}
};

//解析JSON数据
Service.parseJSON = function(text){
	var json = null;
	text = text ? text.trim() : "";
	if( text.startsWith("{") || text.startsWith("[") ){
		json = $.eval(text);
	}
	return json;
};

//取得请求参数
Service.getArgs = function(args){
	var params = {} , args = args || {};
	for(var name in args){
		var value = args[name];
		if( $.type(value) == "object" || $.type(value) == "array" ){
			params[name] = JSON.stringify(value);
		}else if( $.type(value) == "number" ){
			params[name] = (value + "");//转为字符串
		}else{
			params[name] = value;
		}
	}
	return JSON.stringify(params);
};

//验证异常
Service.validateError = function( text ){
	if( $.isJson(text) && text.contains("@exception") ){
		var result = $.eval(text);
		var message = null;
		if( result["@exception"] == "ServiceException" ){
			message = result.message;
		}else{
			message = "系统服务调用失败，请稍后再试！ <br/>" + result.message;
		}
		$.messager.alert("提示", message, "error");
		return false;
	}
	return true;
};

//取得服务名
Service.getServiceName = function(service){
	var name = service.substring(0, service.indexOf("("));
	return name
};

//取得服务参数
Service.getServiceArgs = function(service){
	var text = service.substring(service.indexOf("(") + 1, service.lastIndexOf(")"));
	text = text.trim();
	var args = {};
	if( text ){
		var values = text.split(",");
		for(var i = 0 ; i < values.length; i++ ){
			args["P" + i] = values[i].trim();
		}
	}
	return args;
};

//执行查询
Service.query = function(sqlId, params, callback){
	return Service.getJSON("QueryService.query", {"sqlId":sqlId, "params": $.toJSON(params)}, callback);
};


//跨服务器查询
Service.queryApi = function(server, sqlId, params, callback){
	var host = DictConfig.getText("SERVER", server) || server;
	var args = {"sqlId":sqlId, "params": JSON.stringify(params)};
	var data = {"service":"QueryService.query", "args": JSON.stringify(args), "loginId":$.cookie("loginId")};
	var url = (host.startsWith("http://") ? "" : "http://") + host + "/service/invoke.api?callback=?";
	$.getJSON(url, data, function(obj){
		callback(obj);
	});
};

window.CardReader = {};

CardReader.READER_ID = 'IDCardReader';

//身份证读取
CardReader.read = function( callback, errorcall ){
	errorcall = errorcall || function(){};
	 var reader = document.getElementById("IDCardReader");
	 try{
	     var status = reader.StartRead();
	     var icard = null;
		 switch(status){
			case 102:
			case 103:{
				idcard = {};
		    	idcard["name"] = reader.Name;//姓名 
		    	idcard["sex"] = reader.SexCode;//性别代码 {1;2}
		    	idcard["sexName"] = reader.Sex;//性别中文  {男;女}
		    	idcard["nation"] = reader.NationCode;//民族代码 {01}
		    	idcard["nationName"] = reader.Nation;//民族中文 {汉}
		    	idcard["birthday"] = this.format(reader.Birthday);//出生日期 {1983-08-13}
		    	idcard["address"] = reader.Address;//地址 {成都市锦江区三圣乡粮丰村１组}
		    	idcard["cardNo"] = reader.IDC;//身份证号 {510104199308234572}
		    	idcard["police"]= reader.RegOrg;//签发机关 {成都市公安局锦江区分局}
		    	idcard["beginDate"] = this.format(reader.StartDate);//有效期限开始 {2005-03-25}
		    	idcard["endDate"] = this.format(reader.EndDate);//有效期限结束{2015-03-25}
		    	idcard["photoPath"] = reader.IDCZpPath;//照片文件路径 {C:\yinan\zp\510129198201020417.bmp}
		    	callback(idcard);
		    	setTimeout(function(){
		    		CardReader.upload(idcard);
		    	},50);
			}
			break;
			case 71:
			errorcall("请插入身份证读卡器。");
			break;
			case 72:
			errorcall("请放置或重新放置身份证到读卡器上。");
			break;
		  }
	}catch(E){
		 errorcall("请安装身份证扫描控件。[code：" + status + "]");
	}
};

//转换日期格式
CardReader.format = function( value ){
	return value.substring(0,4) + "-" + value.substring(4,6) + "-" + value.substring(6,8);
};

//上传身份证信息
CardReader.upload = function( card ) {
	try{
		var person = {};
		person.idcard = card.cardNo;
		person.name = card.name;
		person.sex = card.sex;
		person.sexName = card.sexName;
		person.nation = card.nation;
		person.nationName = card.nationName;
		person.birthday = card.birthday;
		person.address = card.address;
		person.police = card.police;
		person.beginDate = card.beginDate;
		person.endDate = card.endDate;
		var content = encodeURIComponent($.toJSON(person));
		var reader = document.getElementById("IDCardReader");
		var url = $(reader).attr("url");
		var request = CardReader.getRequest(url);
		var uri = request.path + "&content=" + content;
		//alert($.toJSON(request));
		var state = reader.UploadWithPort(card.photoPath, request.host, request.port, uri);
	}catch(E){
	}
};

//取得主机信息
CardReader.getRequest = function( url ){
	url = url.replace("http://","");
	var site = url.substring(0, url.indexOf("/"));
	var host = site.contains(":") ? site.substring(0,site.indexOf(":")) : site;
	var port = site.contains(":") ? site.substring(site.indexOf(":") + 1) : "80";
	var path = url.substring(url.indexOf("/"));
	return {"host":host,"port":parseInt(port),"path":path};
};

//消息中心
window.MessageCenter = { map:{} };
/**
* 添加监听
* name 监听名
* listener 监听器
* one 触发一次就失效 默认false
*/
MessageCenter.addListener = function(name, listener, one){
	var map = this.map;
	listener.one = one;
	var listeners = map[name];
	if( !listeners ) {
		listeners = [];
		map[name] = listeners;
	}
	for( var i = 0 ; i < listeners.length; i++ ){
		if( listeners[i] == listener ){
			return;
		}
	}
	listeners.push(listener);
};

/**
* 通知消息
* name 监听名
* args 通知参数
*/
MessageCenter.notify = function(name, args){
	var map = this.map;
	var listeners = map[name] || [];
	for( var i = 0 ; i < listeners.length; i++ ){
		listeners[i].apply(this, Array.prototype.slice.call(arguments,1));
	}
};

//MessageCenter.addListener("/admin/user/user_main",function(type){
//	console.log("/admin/user/user_main type=" + type);
//});
//MessageCenter.notify("/admin/user/user_main", "remove");

//本地数据缓存
window.LocalData = {};

LocalData.put = function(key, value){
	if( $.type(value) == "string" ){
		localStorage.setItem(key, value);
	}else{
		localStorage.setItem(key, $.toJSON(value));
	}
};

//取得数据
LocalData.get = function(key){
	var data = localStorage.getItem(key);
	return data;
};

//查找数据
LocalData.find = function(key, source){
};

//本地数据缓存
window.LocalSession = {};

LocalSession.put = function(key, value){
	if( $.type(value) == "string" ){
		sessionStorage.setItem(key, value);
	}else{
		sessionStorage.setItem(key, $.toJSON(value));
	}
};

//取得数据
LocalSession.get = function(key){
	var data = sessionStorage.getItem(key);
	return data;
};

//浏览器事件监听
window.thcef_send_msg= function(cmd, params,succssCallback,failCailback) {
	var message = cmd;
	if (typeof params != 'undefined'&&params!=null)
		message += ':' + params;
	if(window.cefQuery==null){
		return;
	}
	window.cefQuery({
		request: message,
		onSuccess: function (response) {
			succssCallback(response,message);
		},
		onFailure: function (error_code, error_message) { 
			failCailback(error_code,error_message,message);
		}
	}
	);
};

//监听页面关闭事件
window.thcef_listener = function(cmd,params){
	if(cmd==null||cmd=='undefined')
	return;//命令为空则返回
	switch(cmd){
	case 0x00F1F4:
		$.messager.confirm("提示","是否关闭窗口？",function(r){
			if(r){
				thcef_send_msg('Thinterceptor.UI.AllClose');
			}
		});
	break;
	default:return;
	}
};
