/**
 * CardView
 * 
 * @author 沈飞
 * @since 1.0 2014-06-12
 */
(function($) {

	// 渲染组件
	function render(target) {
		var caption = $("<div class='cardview-caption'></div>").appendTo(target);
		var container = $("<div style='width:100%;height:auto;overflow-y:auto;max-height:100%;'></div>").insertAfter(caption);
		var table = $("<table class='cardview-table'></table>").appendTo(container);
		var pagination = $("<div class='cardview-pagenation'></div>").insertAfter(container);
		return {
			caption : caption,
			container : container,
			table : table,
			pagination : pagination
		};
	}

	// 加载数据
	function init(target, parameters) {
		var options = $.data(target, "cardview").options;
		var pagination = $(target).cardview('getPager');
		// 缓存查询参数，在参数不存在的情况下就会使用上一次的查询参数
		_cacheParams(target, parameters);
		// 加载数据回调
		options.loader.call(target, parameters, function(json) {
			$(target).cardview("loading");
			var total = json.total;
			// 渲染组件
			_render(target, total);
			// 加载数据同时取得卡片数组
			_bind(target, json.rows);
			// 重置控件大小
			resize(target);
			// 加载成功
			if (options.onLoadSuccess) {
				var cards = $.data(target, "cardview").cards;
				options.onLoadSuccess.call(target, cards);
			}
			$.data(target, "cardview").rows = json.rows;
			$(target).cardview("loaded");
		});

		// 缓存查询参数
		function _cacheParams(target, parameters) {
			var options = $.data(target, "cardview").options;
			// 缓存查询参数，在参数不存在的情况下就会使用上一次的查询参数
			options.queryParams = $.extend({}, options.queryParams, parameters);
			if (options.queryParams.pageNumber) {
				options.queryParams.pageNumber = options.pageNumber;
			}
			if (options.queryParams.pageSize) {
				var pageSize = options.rowNumber * options.columnNumber;
				options.queryParams.pageSize = pageSize;
			}
		}

		// 渲染控件
		function _render(target, total) {
			var options = $.data(target, "cardview").options;
			var table = $(target).cardview("getTable");
			var rowNumber = null;
			var columnNumber = options.columnNumber;
			var pageable = options.pagination;
			if (pageable == true) {
				rowNumber = options.rowNumber;
			} else {
				rowNumber = total / options.columnNumber;
			}
			var cells = [];
			$(table).empty();
			for (var i = 0; i < rowNumber; i++) {
				var tr = $("<tr></tr>").appendTo(table);
				for (var n = 0; n < columnNumber; n++) {
					var td = $("<td align='center'></td>").appendTo(tr);
					var cell = $("<div class='cardview-card cardview-noborder'></div>").appendTo(td);
					cells.push(cell);
				}
			}
			if (options.pagination) {
				pagination.pagination({
					total : total
				});
			}
			table.data('cells', cells);
		}

		// 绑定卡片
		function _bind(target, rows) {
			_clear(target);
			var table = $(target).cardview("getTable");
			var options = $.data(target, "cardview").options;
			var template = options.template;
			var cells = table.data('cells');
			var cardArray = [];
			for (var i = 0; i < rows.length; i++) {
				var cell = cells[i];
				if (i < cells.length) {
					var data = rows[i];
					if (template) {
						var temp = th.template(template);
						var html = temp(data);
						$(cell).append(html);
					}
					cardArray.push(cell);
					$(cell).removeClass("cardview-noborder").addClass("cardview-unselected");
					$(cell).css('cursor', 'pointer');
					$(cell).data('data', data);
					// 绑定事件
					_bindEvent(target, cell, cardArray);
					// 渲染行样式
					_rowStyler(target, cell, data);
				}
			}
			$.data(target, "cardview").cards = cardArray;
		}

		// 渲染行样式
		function _rowStyler(target, cell, data) {
			var options = $.data(target, "cardview").options;
			if (options.rowStyler) {
				var style = options.rowStyler.call(target, data);
				for ( var prop in style) {
					$(cell).css(prop, style[prop]);
				}
			}
		}

		// 绑定事件
		function _bindEvent(target, cell, cardArray) {
			var options = $.data(target, "cardview").options;
			var singleSelect = options.singleSelect;
			$(cell).bind('click', function() {
				var data = $(this).data('data');
				if (singleSelect == true) {
					$(cardArray).each(function() {
						$(this).removeClass("cardview-selected").addClass("cardview-unselected");
					});
				}
				if ($(this).hasClass("cardview-selected")) {
					$(this).addClass("cardview-unselected").removeClass("cardview-selected");
				} else if ($(this).hasClass("cardview-unselected")) {
					$(this).addClass("cardview-selected").removeClass("cardview-unselected");
					if (options.onSelect) {
						options.onSelect.call(target, $(this));
					}
				}
				if (options.onClick) {
					options.onClick.call(target, $(this));
				}
			});
			$(cell).bind('dblclick', function() {
				if (options.onDbClick) {
					options.onDbClick.call(target, $(this));
				}
			});
		}

		// 清除控件
		function _clear(target) {
			var table = $(target).cardview("getTable");
			var cells = table.data('cells');
			$(cells).each(function() {
				$(this).addClass("cardview-noborder").removeClass("cardview-unselected");
				$(this).empty();
			});
		}
	}

	// 初始化分页控件
	function pagination(target) {
		var options = $.data(target, "cardview").options;
		var size = options.rowNumber * options.columnNumber;
		if (options.pagination == true) {
			var pagination = $(target).cardview('getPager');
			pagination.pagination({
				pageSize : size,
				// pageList : [ size, size * 2, size * 3 ],
				showPageList : false,
				onSelectPage : function(pageNumber, pageSize) {
					var parameters = options.queryParams;
					if (parameters) {
						var params = $.extend({}, parameters, {
							pageNumber : pageNumber,
							pageSize : pageSize
						});
						init(target, params);
					}
				}
			});
		}
	}

	// 重新计算控件大小
	function resize(target) {
		var options = $.data(target, "cardview").options;
		// 自动填充到上层控件
		var parent = $(target).parent();
		if (options.fit == true) {
			var width = parent.width();
			var height = parent.height();
			$(target).width(width);
			$(target).height(height);
		}
		_resizePanel(target);
		_resizeCard(target);

		// 重新定义View控件高宽
		function _resizePanel(target) {
			var options = $.data(target, "cardview").options;
			var container = $(target).cardview("getContainer");
			var table = $(target).cardview("getTable");
			var pagination = $(target).cardview('getPager');
			var caption = $(target).cardview("getCaption");
			var targetHeight = $(target).outerHeight();
			var captionHeight = caption.outerHeight();
			var pageHeight = pagination.outerHeight();
			var otherHeight = captionHeight + pageHeight;
			var tableHeight = targetHeight - otherHeight;
			container.height(tableHeight);
			if (options.pagination == true) {
				table.css("height", tableHeight);
			} else {
				table.css("max-height", tableHeight);
			}
		}

		// 重新定义卡片控件的高宽
		function _resizeCard(target) {
			var options = $.data(target, "cardview").options;
			var table = $(target).cardview("getTable");
			var parent = $(target).parent();
			var cwidth = (parent.width() / options.columnNumber) * 0.90;
			var cheight = (table.height() / options.rowNumber) * 0.90;
			if (options.pagination == false) {
				cheight = (table.parent().height() / options.rowNumber) * 0.90;
			}
			var cells = table.data('cells');
			// var realHeight = [];
			$(cells).each(function() {
				$(this).width(cwidth);
				if (options.pagination == false) {
					$(this).css("min-height", cheight + "px");
				} else {
					$(this).height(cheight);
				}
				// $(this).css("min-height", cheight + "px");
				// realHeight.push($(this).height());
			});
			/*
			 * var maxHeight = _max(realHeight); $(cells).each(function() {
			 * $(this).height(maxHeight); });
			 */
		}

		// 取数组最大值
		/*
		 * function _max(array) { var max = parseInt(array[0]); var len =
		 * array.length; for (var i = 1; i < len; i++) { if (parseInt(array[i]) >
		 * max) { max = array[i]; } } return max; }
		 */
	}

	// 获得所有选中项目
	function getSelections(target) {
		var selections = [];
		var cards = $.data(target, "cardview").cards;
		for (var i = 0; i < cards.length; i++) {
			var card = cards[i];
			if (card.hasClass("cardview-selected")) {
				selections.push(card);
			}
		}
		return selections;
	}

	$.fn.cardview = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.cardview.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, "cardview");
			if (state) {
				$.extend(state.options, options);
			} else {
				var opts = $.extend({}, $.fn.cardview.defaults, $.fn.cardview.parseOptions(this), options);
				var _target = render(this);
				state = $.data(this, "cardview", {
					options : opts,
					caption : _target.caption,
					table : _target.table,
					pagination : _target.pagination,
					container : _target.container
				});
				init(this);
				pagination(this);
			}
		});
	};

	$.fn.cardview.methods = {
		options : function(jq) {
			var options = $.data(jq[0], 'cardview').options;
			var opts = $.extend({}, options);
			return opts;
		},
		resize : function(jq) {
			return jq.each(function() {
				resize(this);
			});
		},
		load : function(jq, parameters) {
			return jq.each(function() {
				var options = $.data(this, 'cardview').options;
				if (options.pagination == true) {
					var pagination = $(this).cardview('getPager');
					options.pageNumber = 1;
					pagination.pagination({
						pageNumber : 1
					});
				}
				init(this, parameters);
			});
		},
		reload : function(jq, parameters) {
			return $(jq).cardview("load", parameters);
		},
		getCards : function(jq) {
			return $.data(jq[0], "cardview").cards;
		},
		getSelections : function(jq) {
			return getSelections(jq[0]);
		},
		getSelected : function(jq) {
			var selections = getSelections(jq[0]);
			return selections[0];
		},
		getData : function(jq, card) {
			return card.data('data');
		},
		getContainer : function(jq) {
			return $.data(jq[0], "cardview").container;
		},
		getTable : function(jq) {
			return $.data(jq[0], "cardview").table;
		},
		getPager : function(jq) {
			return $.data(jq[0], "cardview").pagination;
		},
		getCaption : function(jq) {
			return $.data(jq[0], "cardview").caption;
		},
		loading : function(jq) {
			return jq.each(function() {
				var container = $(this).cardview("getContainer");
				container.mask("正在加载数据...");
			});
		},
		loaded : function(jq) {
			return jq.each(function() {
				var container = $(this).cardview("getContainer");
				setTimeout(function(){
					container.unmask();
				},100);
			});
		},
	};

	$.fn.cardview.parseOptions = function(target) {
		var options = $.extend({}, $.parser.parseOptions(target, [ "uid", "url", "queryParams", "template", "loadMsg", {
			fit : "boolean",
			panelWidth : "number",
			panelHeight : "number",
			rowNumber : "number",
			columnNumber : "number",
			pagination : "boolean",
			singleSelect : "boolean"
		} ]));
		if (options.uid) {
			options.template = $("#template-" + options.uid).text() || "";
		}
		if ($.type(options.queryParams) == 'string') {
			var parameters = eval('(' + options.queryParams + ')');
			options.queryParams = parameters;
		}
		return options;
	};

	$.fn.cardview.defaults = {
		url : null,
		method : 'post',
		pagination : true,
		pageNumber : 1,
		rowNumber : 4,
		columnNumber : 4,
		singleSelect : true,
		queryParams : {},
		template : null,
		loadMsg : "卡片加载中, 请稍候 ...",
		fit : true,
		loader : function(parameters, callback) {
			var opts = $(this).cardview("options");
			if (!opts.url) {
				return false;
			}
			parameters = parameters || {};
			var params = $.extend({}, opts.queryParams, parameters);
			$.ajax({
				type : opts.method,
				url : opts.url,
				data : params,
				dataType : "json",
				success : function(json) {
					if (json != null) {
						callback(json);
					}
				}
			});
		},
		rowStyler : function(data) {
		},
		onClick : function(card) {
		},
		onDbClick : function(card) {
		},
		onSelect : function(card) {
		},
		onLoadSuccess : function(cardArray) {
		}
	};

})(jQuery);
