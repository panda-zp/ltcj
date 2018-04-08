(function(){
//数据模型
var ViewModel = th.ViewModel = Class.extend({
	init : function(context){
		var that = this;
		that.data = {};
		that.context = context;//上下文
		that.elements = [];
		that.onChange = function(path, val, old){
			//console.log("onChange " + path + " new=" + val + " old=" + old);
		};
	},
	bind : function(data, append){
		var that = this;
		if( !append ){
			//如果不是补充模式清空原有的数据
			that.clear(false);
		}
		that.data = $.extend(data, $.extend({}, that.data, data) );//注意先后顺序，一定要保持data对象的引用
		//that.data = $.extend(data, that.data, data);
		that.onChange = data.onChange || that.onChange;//onChange 事件
		that.elements = $("[data-bind]", that.context);
		that.elements.each(function() {
			var $element = $(this);
			var bindText = $element.attr("data-bind");
			var map = th.toOptionsMap(bindText);
			var binds = []; 
			for(var name in map ){
				if( binders[name] ){
					var path = map[name];
					that._setTransfer(path);
					that._setDefault(name, $element, path);
					var bind = new binders[name](that, $element, path);
					binds.push(bind);
				}else{
					console.log($element);
					console.log("数据绑定错误，不支持绑定 " + name + ".");
				}
			}
			$element.data("binds", binds);
		});
		that.refresh();
		return this;
	},
	_setDefault:function(name, $element, path){//设置默认值
		var that = this;
		var value = th.get(that.data, path);
		if( $.type(value) != "undefined" ){
			return;
		}
		if( name == "value" ){//支持默认值
			that._set(path, $element.val());
		}else if( name == "checked" ){
			var inputName = $element.attr("name"), type = $element.attr("type");
			var values = $("[name='"+ inputName +"']:checked", that.context).getAttrs("value");
			that._set(path, (type == "checkbox" ? values : values[0]));
		}else if( name == "text" ){
			that._set(path, $element.text());
		}else if( name == "html" ){
			that._set(path, $element.html());
		}
	},
	_setTransfer : function(path){//设置转换器
		var that = this;
		var transfer = th.transfers.get(path, that);
		if( transfer ){//需要转换
			that.data[path] = function(){//转换为函数
				return transfer(that.data, path);
			};
		}
	},
	_set : function(path, value) {
		var that = this;//改变对象的值，但是不触发任何事件和变更
		th.set(that.data, path, value);
	},
	set : function(path, value, fire) {
		var that = this;
		var old = th.get(that.data, path);
		if( !$.isFunction(old) ){//绑定的是函数,避免被自己覆盖
			th.set(that.data, path, value);
		}
		if( old !== value ){
			if( fire == undefined || fire ){
				that.onChange(path, value, old);
				var eventName = th.toEventName(path);;
				var change = that.data["on" + eventName + "Change"];
				if( change ){
					change.call(this, path, value, old);
				}
			}
			that.refresh(path);
		}
	},
	get : function(path) {
		var that = this;
		var value = th.get(that.data, path);
		if( $.isFunction(value) ){
			value = value.call(that);
		}
		return value;
	},
	refresh : function(path){
		var that = this;
		//节点的刷新顺序，会影响函数计算结果
		var refreshs = [];
		that.elements.each(function() {
			var $element = $(this);
			var binders = $element.data("binds") || [];
			for(var i = 0; i < binders.length; i++){
				if( that.isRefresh(binders[i], path) ){
					refreshs.push(binders[i]);
				}
			}
		});
		$.each(refreshs, function(i, binder){
			binder.refresh();
			var msg = i + " refresh input=" + binder.inputName + " bind=" + binder.element.attr("data-bind") +  " path=" + path;
			//console.log(msg);
		});
		//console.log(th.string(that.data));
	},
	isRefresh : function(binder, path){
		var that = this;
		if( $.type(path) == "undefined" ){//未指定属性全部刷新
			return true;
		}
		var value = th.get(that.data, binder.path);
		//如果绑定属性一致或绑定的是函数就会刷新
		if( path == binder.path || $.isFunction(value)){
			return true;
		}
		return false;
	},
	clear : function( refresh ){//清除模型数据
		var that = this;
		for(var name in that.data){
			if( !$.isFunction(that.data[name]) ){
				that.data[name] = undefined;
				//that.data[name] = null;不能设置为NULL会造成覆盖为NULL？？
			}
		}
		if( refresh == undefined || refresh){
			that.refresh()
		}
	},
	json : function(){
		return JSON.stringify(this.data);
	}
});

//基本绑定器
var Binder = th.Binder = Class.extend({
	init : function(model, element, path){
		var that = this;
		that.model = model;
		that.element = element;
		that.path = path;
		that.inputName = element.attr("name");
		that.format = element.attr("format");
	},
	refresh : function(){
		//subclass implements
	},
	change : function(value){
		var that = this;
		that.set(value);
	}
	,
	get : function(){
		var that = this;
		var value = that.model.get(that.path);
		if( that.format ){
			value = th.format(value, that.format);
		}
		return value;
	}
	,
	set : function(value){
		var that = this;
		that.model.set(that.path, value);
	}
});

var binders = th.binders = {};
binders.value = Binder.extend({
	init : function(model, element, path){
		var that = this;
		Binder.fn.init.call(this, model, element, path);
		var _class = element.attr("class") || "";
		if( _class.contains("easyui-") ){
			that._easyui_init(model, element, path, _class);
		}else{
			element.off(".binders").on("change.binders",function(){
				that.change($(this).val());
			});
		}
	},
	//EasyUI的情况单独处理
	_easyui_init:function(model, element, path, _class){
		var that = this;
		var handler = function(newValue, oldValue){
			if( newValue != oldValue ){
				that.change(newValue);
			}
		};
		if( _class.contains("easyui-combo") || _class.contains("easyui-datebox") 
				|| _class.contains("easyui-datetimebox") ){
			element.data("_change", handler);
		}else if( _class.contains("easyui-numberbox") || _class.contains("easyui-numberspinner")){
			element.data("_change", handler);
		}else if( _class.contains("easyui-selectx")  ){
			element.data("_change", handler);
		}else if( _class.contains("easyui-search")  ){
			element.data("_change", handler);
		}else if( _class.contains("easyui-number")  ){//自定义number组件
			element.off(".binders").on("change.binders",function(){
				that.change($(this).val());
			});
		}
	},
	refresh : function(){
		var that = this;
		var value = that.get();
		var element = that.element;
		element.data("_fire_change", false);//设置不触发事件
		try{
			if( element.data("datebox") || element.data("datetimebox") ){//easyui组合框组件
				element.datebox("setValue", value);
			} else if( element.data("numberspinner") ){
				element.numberspinner("setValue", value);
			}else if( element.data("timespinner") ){
				element.timespinner("setValue", value);
			}else if( that.element.data("numberbox") ){
				element.numberbox("setValue", value);
			}else if( element.data("combotree") ){
				$.isArray(value) ? element.combotree("setValues", value) : element.combotree("setValue", value);
			}else if( element.data("combobox") ){
				$.isArray(value) ? element.combobox("setValues", value) : element.combobox("setValue", value);
			}else if( element.data("selectx") ){
				element.selectx("setValue", value);
			}else if( element.data("search") ){
				element.search("setValue", value);
			}else{
				that.element.val(value);
			}
		}finally{
			element.data("_fire_change", true);
		}
	}
});

//checkbox, radio
binders.checked = Binder.extend({
	init : function(model, element, path){
		var that = this;
		Binder.fn.init.call(this, model, element, path);
		that.element.off(".binders").on("change.binders",function(e){
			var values = $("[name='"+ that.inputName +"']:checked", that.model.context).getAttrs("value");
			var type = that.element.attr("type");
			if( type == "checkbox" ){
				that.change(values);
			}else if( type == "radio" ){
				that.change(values[0] || null);
			}
		});
	},
	refresh : function(){
		var that = this;
		var values = that.get() || [];
		$("[name='"+ that.inputName +"']", that.model.context).each(function(){
			var $this = $(this);
			//没有，号也分割，防止13会勾选1,3,13的问题
			//要区分字符串和数组的包含比较
			if( $.type(values) == "string" ){
				if( values == $this.val()){
					$this.attr("checked", true);
				}else{
					$this.attr("checked", false);
				}
			} else {
				if( values.contains($this.val())){
					$this.attr("checked", true);
				}else{
					$this.attr("checked", false);
				}
			}
		});
	},
	get : function(){//重写默认的get
		var that = this;
		var value = that.model.get(that.path);
		if( $.type(value) == "string" && value.contains(",")){
			value = value.split(",");//解决,号分割数据的问题
			that.model._set(that.path, value);//改变对象的值，但是不触发
		}
		return value;
	}
});

//样式绑定
binders.style = Binder.extend({
	refresh : function(){
		var that = this;
		that.element.css( that.get() || {} );
	}
});

//文本绑定
binders.text = Binder.extend({
	refresh : function(){
		var that = this;
		that.element.text( that.get() );
	}
});

//html绑定
binders.html = Binder.extend({
	refresh : function(){
		var that = this;
		that.element.html( that.get() );
	}
});

//只读绑定
binders.readonly = Binder.extend({
	refresh : function(){
		var that = this;
		var readonly = that.get();
		if( readonly ){
			that.element.readonly(true);
		}else{
			that.element.readonly(false);
		}
	}
});

//禁用绑定
binders.disabled = Binder.extend({
	refresh : function(){
		var that = this;
		var disbaled = that.get();
		if( disbaled ){
			that.element.disable();
		}else{
			that.element.enable();
		}
	}
});

binders.source = Binder.extend({
	refresh : function(){
	}
});

if( $.fn.combotree ){
	$.fn.search.defaults.onChange =
	$.fn.selectx.defaults.onChange = 
	$.fn.numberbox.defaults.onChange =
	$.fn.numberspinner.defaults.onChange =
	$.fn.combotree.defaults.onChange =
	$.fn.datetimebox.defaults.onChange = 
	$.fn.datebox.defaults.onChange = 
	$.fn.combogrid.defaults.onChange = 
	$.fn.combobox.defaults.onChange = function(newValue, oldValue){
		//console.log( newValue + ';' + oldValue);
		var $this = $(this);
		//检查是否触发事件 @see refresh 方法
		if( $this.data("_fire_change") != false ){
			var _change = $this.data("_change") || $.noop;
			_change.call(this, newValue, oldValue);
		}
	}
}
})();