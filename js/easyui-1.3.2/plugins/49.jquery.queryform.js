(function($){
	
	//根据cols动态渲染table布局
	var init = function(target){
		var state = getState(target), opts = state.options;
		var inputs = $(">", target).not(":hidden,#search-button");
		var hiddens = $(">:hidden", target);
		var $search = $("#search-button", target);
		hiddens.each(function(i){
			$(this).appendTo(target);
		});
		var table = getTable(target);
		var $table = $(table).appendTo(target);
		$(".td1", $table).each(function(i, item){
			var label = $(inputs[i]).attr("label") || "";
			if( label ){
				$("<span class='label'>"+ label + "：</span>").appendTo(this);
			}
		});
		$(".td2", $table).each(function(i, item){
			if( inputs[i] ){
				$(inputs[i]).appendTo(this);
			}
		});
		if( opts.showButton ){
			$search.appendTo($(".td3", target));
		}
	};
	
	
	var getTable = function(target){
		var state = getState(target), opts = state.options;
		var rows = $(">", target).not(":hidden").length;
		var cols = opts.cols;
		var count = getItemsCount(rows, cols);
		var table = [];
		table.push('<table class="' + opts.className + '">');
		for(var i = 0,  k = 1; i < count; i++,k++ ){
			if (k == 1) {
				table.push("<tr>\n");
			}
			table.push('<td class="td1"></td>\n');
			table.push('<td class="td2"></td>\n');
			if (k == cols) {
				if(i <= cols){
					table.push('<td class="td3">\n');
					table.push("</td>\n");
				}else{
					table.push("<td></td>\n");
				}
				table.push("</tr>\n");
				k = 0; // 因为进入下一轮循环前会执行i++, k++
			}
		}
		table.push('</table>');
		return table.join("");
	};
	
	//布局数
	var getItemsCount = function(rows, cols){
		var more = rows % cols;
		if (more > 0)
			more = cols - more; //补齐
		return rows + more;
	};
	
	//清除指定target的内容
	var clear = function(target, title){
		$(target).empty();
	};
	
	//取得当前节点的数据状态
	var getState = function(target){
		return $.data(target, "queryform");
	};

	$.fn.queryform = function(options, param, properties){
		if (typeof options == 'string'){
			var method = $.fn.queryform.methods[options](this, param);
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
				var opts = $.extend({}, $.fn.queryform.defaults, $.parser.parseOptions(target,["cols"]), options);
				state = $.data(target, 'queryform', {options: opts});
				init(target);//初始化
			}
		});
	};
	
	$.fn.queryform.methods = {
		init:function(jq, param, properties){
			return jq.each(function(){
				render(this, param, properties);
			});
		},
		clear:function(jq, param, properties){
			return jq.each(function(){
				clear(this, param, properties);
			});
		}
	};
	
	$.fn.queryform.defaults = {
		cols:4,
		showButton:true,
		className:'query-table'
	};
})(jQuery);