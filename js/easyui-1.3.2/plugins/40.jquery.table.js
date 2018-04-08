(function($){
	
	//禁用/启用Row
	var enableRow = function(target, param, enable){
		var state = getState(target), opts = state.options;
		var row = state.model.getRow(param);
		if( row ){
			row.tr.find("[input='true']").readonly(enable);
		}
	};
	
	//合并行
	var mergeRow = function(target, param){
		var state = getState(target), opts = state.options;
		var rowModel = state.model.getRowModel(param);
		if( rowModel ){
			rowModel.bind(param, true);
		}
	};
	
	//清空
	var clear = function(target){
		var state = getState(target), opts = state.options;
		if( state.model ){
			state.model.clear();
			state.input.val("");
		}
	};
	
	//取得数据
	var getRows = function(target, param){
		var state = getState(target);
		var opts = state.options;
		return state.model.getRows();
	};
	
	//取得变更数据
	var getChangeRows = function(target, param){
		var state = getState(target);
		var opts = state.options;
		return state.model.getChangeRows();
	};
	
	//取得行数
	var getRowsCount = function(target, param){
		return getRows(target, param).length;
	};
		
	//删除行
	var removeRow = function(target, param){
		var state = getState(target), opts = state.options;
		if( param instanceof jQuery ){
			var model = param.data("model");
			var row = model ? model.data : null;
			if( opts.onBeforeRemoveRow.call(target, row) == false ){
				return;
			}
		}
		state.model.remove(param);
	};
	
	//添加行
	var addRow = function(target, row){
		var state = getState(target), opts = state.options;
		if( opts.onBeforeAddRow.call(target, row) == false ){
			return;
		}
		var tr = state.model.add(row);
		var first = $("input:visible,select:visible", tr).first();
		th.delay(function(){//最后一个获取焦点
			first.focus();
		},500);
		return row;
	};
	
	//添加组
	var getGroup = function(target, text){
		var state = getState(target), opts = state.options;
		var groupId = "GROUP_" + text.hashCode();
		var $group = $("tr[group='" + groupId + "']", target);
		if( !$group.exist() ){
			var cols = state.columns;
			var html = "";
			html += "<tr group='" + groupId + "'>";
			html += "<td><div class='op-remove'>-</div></td>";
			html += "<td colspan='" + (cols.length-1) + "'>";
			html += "<div class='group-ctrl group-expand'>" + text + "</div>";
			html += "</td>";
			html += "</tr>";
			$group = $(html).appendTo(state.tbody);
			$(".op-remove", $group).click(function(){
				$group.remove();
				$("tr[group-parent='" + groupId + "']", target).each(function(){
					removeRow(target, $(this));
				});
			});
			$(".group-ctrl", $group).click(function(){
				if( $(this).hasClass("group-collapse") ){
					doExpand(target, text);
				}else{
					doCollapse(target, text);
				}
			});
			$group.click(function(){
				$(".row-selected",target).removeClass("row-selected");
				$(this).addClass("row-selected");
			});
			$group.data("group", {"id":groupId, "text":text, "tr": $group});
		}
		return $group.data("group");
	};
	
	//添加一行 供 Model 调用
	var addTr = function(target, row){
		var state = getState(target), opts = state.options;
		var $tr = null;
		if( opts.groupField ){
			var text = row[opts.groupField];
			if( text ){//数据中组属性不为空的情况
				var group = getGroup(target, text);
				var items = $("tr[group-parent='" + group.id + "']");
				if( items.exist() ){
					$tr = $(state.template).insertAfter(items.last());
				}else{
					$tr = $(state.template).insertAfter(group.tr);
				}
				$tr.data("group", group);
				$tr.attr("group-parent", group.id);
			}else{//数据中组属性为空，通常为添加一行数据
				var $after = $("tr.row-selected,tr:last", state.tbody).first();
				if( $after.exist() ){
					var group = $after.data("group");
					$tr = $(state.template).insertAfter($after);
					$tr.data("group", group);
					$tr.attr("group-parent", group.id);
				}else{
					var group = getGroup(target, "默认");
					$tr = $(state.template).insertAfter(group.tr);
					$tr.data("group", group)
					$tr.attr("group-parent", group.id);
				}
			}
		}else{
			$tr = $(state.template).appendTo(state.tbody);
		}
		$tr.click(function(){
			$(".row-selected",target).removeClass("row-selected");
			$(this).addClass("row-selected");
		})
		return $tr;
	};
	
	//展开
	var doExpand = function(target, text){
		var groupId = "GROUP_" + text.hashCode();
		var $group = $("tr[group='" + groupId + "']", target);
		$(".group-ctrl", $group).removeClass("group-collapse").addClass("group-expand");
		$("tr[group-parent='" + groupId + "']", target).show();
	};
	
	//折叠
	var doCollapse = function(target, text){
		var groupId = "GROUP_" + text.hashCode();
		var $group = $("tr[group='" + groupId + "']", target);
		$(".group-ctrl", $group).removeClass("group-expand").addClass("group-collapse");
		$("tr[group-parent='" + groupId + "']", target).hide();
	};
	
	//取得选中行
	var getSelected = function(target){
		var tr = $(".row-selected", target);
		var model = tr.data("model");
		return model ? model.data : null;
	};
	
	//取得绑定的数据
	var getSource = function(target){
		var state = getState(target), opts = state.options;
		var source = null;
		if( opts.bind ){
			var name = opts.bind.substring(opts.bind.indexOf(":") + 1).trim();
			var model = th.getModel(target);
			source = {"name":name, "rows":model.get(name)};
		}
		return source;
	};
	
	//取得状态
	var getState = function(target){
		return $.data(target, "table");
	};
	
	//保存数据
	var saveData = function(target){
		var state = getState(target), opts = state.options;
		var rows = [];
		if( opts.saveChange ){
			rows = state.model.getChangeRows();
		}else{
			rows = state.model.getRows();
		}
		var text = $.toJSON(rows);
		state.input.val(text);
		//console.log(text);
		var model = th.getModel(target);
		if( model ){
			model.data[opts.input] = rows;//放置input数据
			if( state.source ){//如果绑定了数据
				model.set(state.source.name, state.model.getRows());//绑定的数据
			}
		}
	};
	
	//加载数据
	var load = function(target, param){
		var state = getState(target), opts = state.options;
		if( $.type(param) == "array" ){
			var rows = param;
			state.model.bind(rows, opts.idField);
			saveData(target);
		}else {
			query(target, param);
		}
	};
	
	//刷新数据
	var refresh = function(target, param){
		clear(target)
		load(target, param);
	};
	
	//表格查询数据
	var query = function(target, param){
		var state = getState(target), opts = state.options;
		if( !opts.sql ){//没有SQL不查询
			return;
		}
		var args = $.extend(opts.queryParams, param || {});
		var parameters = th.toQueryParams(args);
		$.post(opts.url, {"parameters":$.toJSON(parameters)}, function(text){
			var result = $.eval(text);
			var rows = result.rows;
			state.model.bind(rows, opts.idField);
			saveData(target);
			if( opts.readonly ){
				readonly(target, true);
			}
			opts.onLoadSuccess.call(target, result);
		});
	};
	
	//只读
	var readonly = function(target, readonly){
		var state = getState(target), opts = state.options;
		if(typeof readonly == "undefined"){
			readonly = true;
		}
		opts.readonly = readonly;//保存只读属性
		if( readonly ){
			$("[name='op']", target).parent().hide();
			$("[input='true']", target).readonly();
		}else{
			$("[name='op']", target).parent().show();
			$("[input='true']", target).readonly(false);
		}
	};
	
	//initialize
	var init = function( target ){
		var state = getState(target), opts = state.options;
		if( !state.input ){//避免重复初始化的问题
			state.input = $("<input type='hidden' name='" + opts.input +"'/>").appendTo(target);
		}
		var columns = [];
		$("thead>tr>th",target).each(function(){
			var $this = $(this);
			var field = $this.attr("field");
			var width = $this.attr("width");
			var dataType = $this.attr("dataType");
			columns.push({"field":field,"width":width, "dataType":dataType});
		});
		state.columns = columns;
		var events = {
				onChange:function(){
					saveData(target);//保存变成数据
					opts.onChange.apply(target, arguments);
				},
				onAdd:opts.onAddRow,
				onUpdate:opts.onUpdateRow,
				onRemove:opts.onRemoveRow
		};
		state.model = new TableModel(target, state, events);
		if( opts.autoQuery ){//自动查询
			query(target);
		}
		if( opts.initRows ){//添加空行
			for( var i = 0 ; i < opts.initRows; i++ ){
				addRow(target,{});
			}
		}
		if( opts.showAddOperator ){
			$(".op-append", target).show();
		}else {
			$(".op-append", target).hide();
		}
		initKeyEvent(target);
	};
	
	// 初始化事件
	var initKeyEvent = function(target){
		var state = getState(target), opts = state.options;
		$(target).keydown(function(event){
			if(  event.keyCode == 13 ){//回车键
				if( opts.autoAddRow ){
					var element = $(event.target);
					if( element.is("input") || element.is("select") ){
						var next = Page.getNextInput(element, target);//取得下个输入框
						if( !next ){//如果是最后元素，增加一行
							addRow(target,{});
						}
					}
				}
				return true;
			}else if( event.keyCode == 38 ){//上箭头
				
			}else if( event.keyCode == 40 ){//下箭头
				
			}
		});
	};
	
	//main
	$.fn.table = function(options, param1, param2){
		if (typeof options == "string") {
			var method = $.fn.table.methods[options];
			return method(this, param1, param2);
		}
		options = options || {};
		return this.each(function(){
			var that = this;
			var state = $.data(that, 'table');
			if (state){
				$.extend(state.options, options);
				init(that);
			} else {
				state = $.data(that, 'table', {
					options : $.extend({},$.fn.table.defaults,$.fn.table.parseOptions(that))
				});
				state.template = $("#" + state.options.templateId).val();
				state.source = getSource(that);
				state.tbody = $("tbody", that).exist() ? $("tbody", that) : $("<tbody></tbody>").appendTo(that);
				init(that);
			}
		});
	};
	
	//解析属性
	$.fn.table.parseOptions = function(target) {
		var t = $(target);
		var options = $.extend({}, $.parser.parseOptions(t, 
				["url","templateId","idField","input","queryParams",
				 {"rowModel":"object","fit":"boolean","autoAddRow":"boolean","autoQuery":"boolean","saveChange":"boolean", "sql":"boolean","initRows":"number"}]));
		options.queryParams = $.parse(options.queryParams || "");
		options.input = options.input || "TABLE_CHANGE";
		options.bind = t.attr("data-bind");
		options.groupField = t.attr("groupField");
		return options;
	};
	
	$.fn.table.methods = {
		options:function(jq, param1, param2){
			return getState(jq[0]).options;
		},
		addRow:function(jq, param1, param2){
			return addRow(jq[0], param1, param2);
		},
		removeRow:function(jq, param1, param2){
			return jq.each(function(){
				removeRow(this, param1, param2);
			});
		},
		clear:function(jq, param1, param2){
			return jq.each(function(){
				clear(this, param1, param2);
			});
		},
		mergeRow:function(jq, param1, param2){
			return jq.each(function(){
				mergeRow(this, param1, param2);
			});
		},
		disableRow:function(jq, param1, param2){
			return jq.each(function(){
				disableRow(this, param1, param2);
			});
		},
		enableRow:function(jq, param1, param2){
			return jq.each(function(){
				enableRow(this, param1, param2);
			});
		},
		getRows:function(jq, param1, param2){
			return getRows(jq[0], param1, param2);
		},
		getRowsCount:function(jq, param1, param2){
			return getRowsCount(jq[0], param1, param2);
		},
		getChangeRows:function(jq, param1, param2){
			return getChangeRows(jq[0], param1, param2);
		},
		refresh:function(jq, param1, param2){
			return jq.each(function(){
				refresh(this, param1, param2);
			});
		},
		loadData:function(jq, param1, param2){
			return jq.each(function(){
				refresh(this, param1, param2);
			});
		},
		getSelected:function(jq, param1, param2){
			return getSelected(jq[0], param1, param2);
		},
		expand:function(jq, param1, param2){
			return jq.each(function(){
				doExpand(this, param1, param2);
			});
		},
		collapse:function(jq, param1, param2){
			return jq.each(function(){
				doCollapse(this, param1, param2);
			});
		},
		readonly:function(jq, param1, param2){
			return jq.each(function(){
				readonly(this, param1, param2);
			});
		}
	};
	
	$.fn.table.defaults = {
		idFiled : "id",
		saveChange : true,
		readonly: false,
		showAddOperator : true,
		groupField:"",//分组字段
		onLoadSuccess:function(){
			//数据加载完成
		},
		onChange : function(event, row, name, val, old){
			//console.log("onChange event=" + event + " name=" + name + "; val=" + val + "; old=" + old);
		},
		onAddRow:function(row){
			//console.log("onAddRow row=" + $.toJSON(row) );
		},
		onBeforeAddRow:function(row){
			//console.log("onBeforeAddRow row=" + $.toJSON(row) );
		},
		onUpdateRow:function(row, name, val, old){
			//console.log("onUpdateRow name=" + name + "; val=" + val + "; old=" + old);
		},
		onRemoveRow:function(row){
			//console.log("onRemoveRow row=" + $.toJSON(row) );
		},
		onBeforeRemoveRow:function(row){
			//console.log("onRemoveRow row=" + $.toJSON(row) );
		}
	};
	
	//表格模型
	var TableModel = Class.extend({
		init : function(table, state, events){
			var that = this;
			that.table = table;//上下文
			that.options = state.options;
			that.template = state.template;
			that.tbody = $("tbody", table);//tbody
			that.list = [];
			that.idField = "id";
			$.extend(that,{
				onAdd : function(row){},
				onUpdate : function(row, path, val, old){},
				onRemove : function(row){},
				onBind : function(rows){},
				onChange : function(event, row, path, val, old){}
			}, events);
			that.fire = function(name){
				var args = Array.prototype.slice.call(arguments, 1);
				var event = "on" + name.upperCaseFirstChar();
				that[event].apply(this, args);
				that.onChange.apply(this, arguments);
				//console.log(event + " row=" + $.toJSON( arguments[1]) );
				//console.log(event + " rows=" + $.toJSON(that.list) );
				//console.log( that.list );
				if( ["add","update"].contains(name) ){
					var row = arguments[1];
					that.setReadonly(row);
				}
			};
		},
		bind : function(list, idField){
			var that = this;
			that.idField = idField;
			if( that.list.isEmpty() ){
				that.list = list;
			}else{//这样做为了保持第一次的引用
				that.list.clear();
				that.list.pushAll(list);
			}
			that.tbody.empty();
			$.each(that.list, function(i, row){
				row = row || {};
				row.onChange = function(path, val, old){
					row.op = "update";
					that.fire("update", row, path, val, old);
				};
				var tr = that.newtr(row);
				that.wrap(row, tr);
				return tr;
			});
			that.fire("bind", that.list);
		},
		add : function(data){
			var that = this;
			var row = data || {};
			row.onChange = function(path, val, old){
				that.fire("update", row, path, val, old);
			};
			row.op = "insert";
			that.list.push(row);
			var tr = that.newtr(row);
			that.wrap(row, tr);
			that.fire("add", row);
			return tr;
		},
		wrap : function(row, tr){
			var that = this;
			$.extend(row, that.options.rowModel);//设置默认模型
			var model = tr.data("model");
			if( model ){
				model.bind(row);
			}else{
				model = new th.ViewModel(tr).bind(row);
			}
			tr.data("model", model);
			$.extend(row,{
				tr : function(){ return tr; },
				model : function(){ return tr.data("model"); },
				bind : function(data, append){
					//必须保留原有对象的引用，只能覆盖它的值
					//否则 that.list 数组中的对象引用就失效了。
					var model = tr.data("model");
					$.extend(model.data, data);
					model.refresh();
				},
				clear:function(){
					var model = tr.data("model");
					var op = model.data.op;//保存OP
					model.clear();//清除行数据
					model.data.op = op;//还原op
				},
				set: function(name, value, fire){
					var model = tr.data("model");
					model.set(name, value, fire);
				},
				refresh: function(){
					var model = tr.data("model");
					model.refresh();
				}
			});
			that.parse(tr);
			that.setReadonly(row);
			return model;
		},
		remove:function(tr){
			var that = this;
			var list = that.list;
			var index = 0;
			var row = null;
			for( ; index < list.length; index++ ){
				var item = list[index];
				if( item.tr().get(0) == tr.get(0) ){
					row = item;
					break;
				}
			}
			if( row && !row[that.idField] ){//后来增加的数据,没有ID
				var removed = list.splice(index, 1);//删除当前元素
			}
			if( row ){
				row.op = "delete";
				tr.remove();
				that.fire("remove", row);
			}
		},
		setReadonly : function(row){
			var model = row.model();
			var readonly = model.get("readonly");
			if( readonly ){
				$("[input='true']", row.tr()).readonly(true);
				$("[name='op']", row.tr()).hide();
			}
		},
		newtr:function(row){
			var that = this;
			return addTr(that.table, row);
		},
		getRowModel : function(param){
			var that = this;
			var row = that.getRow(param);
			return row ? row.tr().data("model") : null;
		},
		getRow:function(param){
			var that = this;
			var finder = {};
			var idField = that.idField;
			if( $.type(param) == "string" ){
				finder[idField] = param;
			}else if( param[idField] ){
				finder[idField] = param[idField];
			}else{
				finder = param;
			}
			var row = null;
			$.each(that.list, function(i, item){
				for( var name in finder ){
					if( finder[name] != item[name] ){
						return;
					}
				}
				row = item;
				return false;
			});
			return row;
		},
		getRows:function(){
			var that = this;
			var list = that.list;
			var rows = [];
			for(var i = 0; i < list.length; i++){
				if( list[i].op != "delete" ){
					rows.push(list[i]);
				}
			}
			return rows;
		},
		getChangeRows:function(){
			var that = this;
			var list = that.list;
			var rows = [];
			for(var i = 0; i < list.length; i++){
				if( ["insert","delete","update"].contains( list[i].op ) ){
					rows.push(list[i]);
				}
			}
			return rows;
		},
		clear:function(){
			var that = this;
			that.tbody.empty();
			that.list.clear();
		},
		parse:function(tr){
			$.initValid(tr);
			$.parser.parse(tr, true);
		},
		json : function(){
			var that = this;
			return JSON.stringify(that.list);
		}
	});
})(jQuery)