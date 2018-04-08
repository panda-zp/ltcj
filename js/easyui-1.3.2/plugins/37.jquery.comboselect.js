/**
 * jQuery EasyUI 1.3.2
 * 
 * Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
 * 
 * Licensed under the GPL or commercial licenses To use it on other terms please
 * contact us: jeasyui@gmail.com http://www.gnu.org/licenses/gpl.txt
 * http://www.jeasyui.com/license_commercial.php
 * 
 */
(function($) {
	function init(target) {
		var opts = $.data(target, "comboselect").options;
		var $select = $.data(target, "comboselect").select;
		$(target).addClass("combotree-f");
		$(target).combo(opts);
		var $panel = $(target).combo("panel");
		if (!$select) {
			$select = $("<ul></ul>").appendTo($panel);
			$.data(target, "comboselect").select = $select;
		}
	}
	
	function transformData(target){
		var opts = $.data(target, "comboselect").options;
		var data = [];
		$('>option', target).each(function(){
			var item = {};
			item[opts.valueField] = $(this).attr('value')!=undefined ? $(this).attr('value') : $(this).html();
			item[opts.textField] = $(this).html();
			item['selected'] = $(this).attr('selected');
			data.push(item);
		});
		return data;
	}
	
	/**
	 * load data, the old list items will be removed.
	 */
	function loadData(target, data, remainText){
		var opts = $.data(target, "comboselect").options;
		var panel = $(target).combo('panel');
		$.data(target, "comboselect").data = data;
		var selected = $(target).comboselect('getValues');
		panel.empty();	// clear old data
		var table = "<table width='100%'>";
		for(var i=0; i<data.length; i++){
			var value = data[i][opts.valueField];
			var text = data[i][opts.textField];
			if (opts.formatter ){
				text = (opts.formatter.call(target, data[i]));
			}
			if( opts.multiple ){
				table += "<tr style='height:20px;'><td><input type='checkbox' value='" + value + "'/></td><td>" + text + "</td></tr>";
			}else{
				table += "<tr><td></td><td>" + text + "</td></tr>";
			}
			var item = $('<div class="combobox-item"></div>').appendTo(panel);
			item.attr('value', v);
			if (data[i]['selected']){
				(function(){
					for(var i=0; i<selected.length; i++){
						if (v == selected[i]) return;
					}
					selected.push(v);
				})();
			}
		}
		table += "</table>";
		var $table = $(table).appendTo(panel);
		$table.find("tr").hover(function(){
			
		},function(){
			
		});
		if (opts.multiple){
			setValues(target, selected, remainText);
		} else {
			if (selected.length){
				setValues(target, [selected[selected.length-1]], remainText);
			} else {
				setValues(target, [], remainText);
			}
		}
		
		opts.onLoadSuccess.call(target, data);
		
		$('.comboselect-item', panel).hover(
			function(){$(this).addClass('combobox-item-hover');},
			function(){$(this).removeClass('combobox-item-hover');}
		).click(function(){
			var item = $(this);
			if (opts.multiple){
				if (item.hasClass('combobox-item-selected')){
					unselect(target, item.attr('value'));
				} else {
					select(target, item.attr('value'));
				}
			} else {
				select(target, item.attr('value'));
				$(target).combo('hidePanel');
			}
		});
	}

	function setComboValue(_14, _15) {
		var _16 = $.data(_14, "comboselect").options;
		var _17 = $.data(_14, "comboselect").tree;
		_17.find("span.tree-checkbox").addClass("tree-checkbox0").removeClass("tree-checkbox1 tree-checkbox2");
		var vv = [], ss = [];
		for ( var i = 0; i < _15.length; i++) {
			var v = _15[i];
			var s = v;
			var _18 = _17.tree("find", v);
			if (_18) {
				s = (_18.attributes && _18.attributes.text) ? _18.attributes.text : _18.text;
				_17.tree("check", _18.target);
				_17.tree("select", _18.target);
			}
			vv.push(v);
			ss.push(s);
		}
		$(_14).combo("setValues", vv).combo("setText", ss.join(_16.separator));
	}
	;
	
	$.fn.comboselect = function(options, param) {
		if (typeof options == "string") {
			var method = $.fn.comboselect.methods[options];
			if (method) {
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, "comboselect");
			if (state) {
				$.extend(state.options, options);
			} else {
				$.data(this, "comboselect", {
					options : $.extend({}, $.fn.comboselect.defaults, $.fn.comboselect.parseOptions(this), options)
				});
			}
			init(this);
		});
	};
	
	$.fn.comboselect.methods = {
		options : function(jq) {
			var opts = $.data(jq[0], "comboselect").options;
			opts.originalValue = jq.combo("options").originalValue;
			return opts;
		},
		loadData : function(jq, _1e) {
			return jq.each(function() {
				var _1f = $.data(this, "comboselect").options;
				_1f.data = _1e;
				var _20 = $.data(this, "comboselect").tree;
				_20.tree("loadData", _1e);
			});
		},
		reload : function(jq, url) {
			return jq.each(function() {
				var _21 = $.data(this, "comboselect").options;
				var _22 = $.data(this, "comboselect").tree;
				if (url) {
					_21.url = url;
				}
				_22.tree({
					url : _21.url
				});
			});
		},
		setValues : function(jq, values) {
			return jq.each(function() {
				setComboValue(this, values);
			});
		},
		setValue : function(jq, value) {
			return jq.each(function() {
				setComboValue(this, [ value ]);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				var $tree = $.data(this, "comboselect").tree;
				$tree.find("div.tree-node-selected").removeClass("tree-node-selected");
				var cc = $tree.tree("getChecked");
				for ( var i = 0; i < cc.length; i++) {
					$tree.tree("uncheck", cc[i].target);
				}
				$(this).combo("clear");
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				var opts = $(this).combotree("options");
				if (opts.multiple) {
					$(this).combotree("setValues", opts.originalValue);
				} else {
					$(this).combotree("setValue", opts.originalValue);
				}
			});
		}
	};
	
	$.fn.comboselect.parseOptions = function(target) {
		return $.extend({}, $.fn.combo.parseOptions(target), {});
	};
	
	$.fn.comboselect.defaults = $.extend({}, $.fn.combo.defaults, {
		valueField: 'value',
		textField: 'text',
		mode: 'local',	// or 'remote'
		method: 'post',
		url: null,
		data: null,
		keyHandler: {
			up: function(){selectPrev(this);},
			down: function(){selectNext(this);},
			enter: function(){
				var values = $(this).comboselect('getValues');
				$(this).comboselect('setValues', values);
				$(this).comboselect('hidePanel');
			},
			query: function(q){doQuery(this, q);}
		},
		filter: function(q, row){
			var opts = $(this).comboselect('options');
			return row[opts.textField].indexOf(q) == 0;
		},
		formatter: function(row){
			var opts = $(this).comboselect('options');
			return row[opts.textField];
		},
		loader: function(param, success, error){
			var opts = $(this).comboselect('options');
			if (!opts.url) return false;
			$.ajax({
				type: opts.method,
				url: opts.url,
				data: param,
				dataType: 'json',
				success: function(data){
					success(data);
				},
				error: function(){
					error.apply(this, arguments);
				}
			});
		},
		onBeforeLoad: function(param){},
		onLoadSuccess: function(){},
		onLoadError: function(){},
		onSelect: function(record){},
		onUnselect: function(record){}
	});
})(jQuery);
