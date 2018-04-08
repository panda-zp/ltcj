(function($){
	
	//根据cols动态渲染table布局
	var render = function(target){
		var state = getState(target), opts = state.options,cols=parseInt(opts.cols);
		var table = $('<table class="edit-table"></table>').prependTo($(target));
		var len = state.inputs.length;
		var requires = state.inputs.getAttrs("required"),labels = state.inputs.getAttrs("label"),
			widths = state.inputs.getAttrs("width"),colspans = state.inputs.getAttrs("colspan");
		if(!cols){
			cols = 4;
		}
		var html = "",n = 0,rows = getRows(target,len,cols);
		for(var i = 0;i < rows;i++){
			var colspanTotal = 0;
			html+="<tr>";
			for(var j = 0;j < cols;j++){
				var m = n;
				var colspan = parseInt(colspans[m]);
				if(m > len-1) break;
				if(!isNaN(colspan)){
					html+="<td class='td1'></td><td class='td2' colspan='"+colspan+"'></td>";
					colspanTotal += colspan;
					n ++;
				}else{
					html+="<td class='td1'></td><td class='td2'></td>";
					colspanTotal ++;
					n ++;
				}
				if(cols <= colspanTotal){
					break;
				}
			}
			html+="</tr>";
		}
		$(html).appendTo(table);
		$(".td1", table).each(function(i, item){
			if(requires[i]){
				$("<span class='required'>*</span>").appendTo(this);
			}
			if(labels[i]){
				$("<span class='label'>"+labels[i]+"：</span>").appendTo(this);
			}
		});
		$(".td2", table).each(function(i, item){
			if(widths[i]){
				$(this).css("width",widths[i]);
			}
			$(state.inputs[i]).appendTo(this);
		});
		
	};
	//获取内容布局的行数
	var getRows = function(target,len,cols){
		var state = getState(target);
		var colspans = state.inputs.getAttrs("colspan"),count = 0,rows = 0;
		for(var i = 0;i < colspans.length;i++){
			var item = parseInt(colspans[i]);
			var count = parseInt((item-1)/2);
			if(!isNaN(item)){
				len += count;
			}
		}
		rows = parseInt(len/cols);
		rows = len % cols == 0 ? rows : rows + 1;
		return rows;
	};
	//根据id隐藏指定列
	var hideColumn = function(target,id){
		var subEl = $("#" + id, $(target));
		if( subEl.exist() ){
			var parentEl = subEl.parent(".td2");
			parentEl.prev().hide();
			parentEl.hide();
		}
	};
	//根据id显示指定列
	var showColumn =function(target,id){
		var subEl = $("#" + id, $(target));
		if( subEl.exist() ){
			var parentEl = subEl.parent(".td2");
			parentEl.prev().show();
			parentEl.show();
		}
	};
	//清除指定target的内容
	var clear = function(target, title){
		$(target).empty();
	};
	
	//取得当前节点的数据状态
	var getState = function(target){
		return $.data(target, "edit-form");
	};
	
	//初始化加载
	var init = function(target){
		render(target);
	};

	$.fn.editform = function(options, param, properties){
		if (typeof options == 'string'){
			var method = $.fn.editform.methods[options](this, param);
			return method;
		}
		options = options || {};
		return this.each(function(){
			var target = this;
			var state = getState(target);
			if (state){
				$.extend(state.options, options);
				init(target);
			} else {
				var opts = $.extend({}, $.parser.parseOptions(target,["cols"]), options);
				var inputs = $(target).children();
				state = $.data(target,'edit-form', {options: opts, "inputs":inputs});
				init(target);//初始化
			}
		});
	};
	
	$.fn.editform.methods = {
		reload:function(jq, param, properties){
			return jq.each(function(){
				render(this, param, properties);
			});
		},showColumn:function(jq,param){
			return jq.each(function(){
				showColumn(this, param);
			});
		},hideColumn:function(jq,param){
			return jq.each(function(){
				hideColumn(this, param);
			});
		}
	};
	
	$.fn.editform.defaults = {
	};
})(jQuery);