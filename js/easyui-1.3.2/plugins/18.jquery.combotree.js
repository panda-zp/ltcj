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
		var opts = $.data(target, "combotree").options;
		var $tree = $.data(target, "combotree").tree;
		$(target).addClass("combotree-f");
		$(target).combo(opts);
		var $panel = $(target).combo("panel");
		if (!$tree) {
			$tree = $("<ul></ul>").appendTo($panel);
			$.data(target, "combotree").tree = $tree;
		}
		$tree.tree($.extend({}, opts, {
			checkbox : opts.multiple,
			onLoadSuccess : function(_6, _7) {
				var _8 = $(target).combotree("getValues");
				if (opts.multiple) {
					var _9 = $tree.tree("getChecked");
					for ( var i = 0; i < _9.length; i++) {
						var id = _9[i].id;
						(function() {
							for ( var i = 0; i < _8.length; i++) {
								if (id == _8[i]) {
									return;
								}
							}
							_8.push(id);
						})();
					}
				}
				$(target).combotree("setValues", _8);
				if( $(target).attr("text") ){
					$(target).combotree("setText",$(target).attr("text"));
				}
				opts.onLoadSuccess.call(this, _6, _7);
				opts.onSelectNode.call(target, $tree.tree("getSelected"));
			},
			onClick : function(_a) {
				selectNode(target);
				$(target).combo("hidePanel");
				opts.onClick.call(this, _a);
			},
			onCheck : function(_b, _c) {
				selectNode(target);
				opts.onCheck.call(this, _b, _c);
			}
		}));
	}
	;
	function selectNode(target) {
		var opts = $.data(target, "combotree").options;
		var $tree = $.data(target, "combotree").tree;
		var vv = [], ss = [];
		if (opts.multiple) {
			var _11 = $tree.tree("getChecked");
			for ( var i = 0; i < _11.length; i++) {
				vv.push(_11[i].id);
				ss.push( (_11.attributes && _11.attributes.text) ? _11.attributes.text : _11.text );
			}
		} else {
			var _12 = $tree.tree("getSelected");
			if (_12) {
				vv.push(_12.id);
				ss.push( (_12.attributes && _12.attributes.text) ? _12.attributes.text : _12.text );
			}
		}
		$(target).combo("setValues", vv).combo("setText", ss.join(opts.separator));
		opts.onSelectNode.call(target, $tree.tree("getSelected"));
	}
	;
	function setComboValue(_14, _15) {
		var _16 = $.data(_14, "combotree").options;
		var _17 = $.data(_14, "combotree").tree;
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
	$.fn.combotree = function(options, param) {
		if (typeof options == "string") {
			var method = $.fn.combotree.methods[options];
			if (method) {
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, "combotree");
			if (state) {
				$.extend(state.options, options);
			} else {
				$.data(this, "combotree", {
					options : $.extend({}, $.fn.combotree.defaults, $.fn.combotree.parseOptions(this), options)
				});
			}
			init(this);
		});
	};
	$.fn.combotree.methods = {
		options : function(jq) {
			var opts = $.data(jq[0], "combotree").options;
			opts.originalValue = jq.combo("options").originalValue;
			return opts;
		},
		tree : function(jq) {
			return $.data(jq[0], "combotree").tree;
		},
		loadData : function(jq, _1e) {
			return jq.each(function() {
				var _1f = $.data(this, "combotree").options;
				_1f.data = _1e;
				var _20 = $.data(this, "combotree").tree;
				_20.tree("loadData", _1e);
			});
		},
		reload : function(jq, url) {
			return jq.each(function() {
				var _21 = $.data(this, "combotree").options;
				var _22 = $.data(this, "combotree").tree;
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
				var $tree = $.data(this, "combotree").tree;
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
	$.fn.combotree.parseOptions = function(target) {
		return $.extend({}, $.fn.combo.parseOptions(target), $.fn.tree.parseOptions(target));
	};
	$.fn.combotree.defaults = $.extend({}, $.fn.combo.defaults, $.fn.tree.defaults, {
		editable : false,
		onSelectNode:function(){}
	});
})(jQuery);
