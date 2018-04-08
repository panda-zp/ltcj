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
	function _resize(target, offset) {
		var opts = $.data(target, "combo").options;
		var $combo = $.data(target, "combo").combo;
		var $panel = $.data(target, "combo").panel;
		opts.width = offset || opts.width;
		$combo.appendTo("body");
		var $text = $combo.find("input.combo-text");
		var $arrow = $combo.find(".combo-arrow");
		var width = opts.hasDownArrow ? $arrow._outerWidth() : 0;
		$combo._outerWidth(opts.width)._outerHeight(opts.height);
		$text._outerWidth($combo.width() - width);
		$text.css({
			height : $combo.height() + "px",
			lineHeight : $combo.height() + "px"
		});
		$arrow._outerHeight($combo.height());
		$combo.insertAfter(target);
	}
	;
	function _setComboArrow(_b) {
		var _c = $.data(_b, "combo").options;
		var _d = $.data(_b, "combo").combo;
		if (_c.hasDownArrow) {
			_d.find(".combo-arrow").show();
		} else {
			_d.find(".combo-arrow").hide();
		}
	}
	;
	function _init(target, opts) {
		var textName = $(target).attr("textName") || "";
		$(target).addClass("combo-f").hide();
		var $combo = $("<span class=\"combo\" style=\"" + (opts.comboStyle || "") + "\"></span>").insertAfter(target);
		var $text = $("<input name='" + textName + "' type=\"text\" class=\"combo-text\" style='cursor:default;'>").appendTo($combo);
		$text.attr("title", opts.title || "");
		$("<span><span class=\"combo-arrow\"></span></span>").appendTo($combo);
		$("<input type=\"hidden\" class=\"combo-value\">").appendTo($combo);
		var name = $(target).attr("name");
		if (name) {
			$combo.find("input.combo-value").attr("name", name);
			$(target).removeAttr("name").attr("comboName", name);
		}
		$text.attr("autocomplete", "off");
		return {combo : $combo};
	}
	;
	
	function getPanel(target){
		var state = $.data(target, "combo"), opts = state.options;
		if(!state.panel){
			var iframeHtml = "<iframe name='kill_activex' frameborder='0' style='position: absolute; z-index: -1; width: 100%; height: 100%; top: 0;left:0;scrolling:no;'></iframe>";
			var clearHtml = "<div class='combo-clear' style='right:0px;top:0px;position:absolute;padding:2px;cursor:pointer;color:blue;display:none;'>清空</div>\n";
			var $panel = $("<div class=\"combo-panel\">" + iframeHtml + clearHtml +  "</div>").appendTo("body");
			state.panel = $panel.panel({
				doSize : false,
				closed : true,
				cls : "combo-p",
				style : {
					position : "absolute",
					zIndex : 10
				},
				onOpen : function() {
					$(this).panel("resize");
				}
			});
			if( opts.hasClear ){
				$(".combo-clear", state.panel).show().click(function(){
					_clear(target);
					state.panel.panel("close");
				});
			}
		}
		return state.panel;
	};
	
	
	function _14(target) {
		var state = $.data(target, "combo");
		var _16 = $.data(target, "combo").combo.find("input.combo-text");
		_16.validatebox("destroy");
		if( state.panel ){
			state.panel.panel("destroy");
		}
		$.data(target, "combo").combo.remove();
		$(target).remove();
	}
	;
	
	function _bindEvent(target) {
		var _19 = $.data(target, "combo");
		var _1a = _19.options;
		var _1b = $.data(target, "combo").combo;
		//var _1c = $.data(target, "combo").panel;
		var $text = _1b.find(".combo-text");
		var _1e = _1b.find(".combo-arrow");
		$(document).unbind(".combo").bind("mousedown.combo", function(e) {
			var p = $(e.target).closest("span.combo,div.combo-panel");
			if (p.length) {
				return;
			}
			var _1f = $("body>div.combo-p>div.combo-panel");
			_1f.panel("close");
		});
		_1b.unbind(".combo");
		$text.unbind(".combo");
		_1e.unbind(".combo");
		if (!_1a.disabled) {
			$text.bind("mousedown.combo", function(e) {
				var panel = getPanel(target);
				$("div.combo-panel").not(panel).panel("close");
				e.stopPropagation();
			}).bind("keydown.combo", function(e) {
				switch (e.keyCode) {
				case 38:
					_1a.keyHandler.up.call(target);
					break;
				case 40:
					_1a.keyHandler.down.call(target);
					break;
				case 13:
					e.preventDefault();
					_1a.keyHandler.enter.call(target);
					return true;
				case 9:
				case 27:
					_28(target);
					break;
				default:
					if (_1a.editable) {
						if (_19.timer) {
							clearTimeout(_19.timer);
						}
						_19.timer = setTimeout(function() {
							var q = $text.val();
							if (_19.previousValue != q) {
								_19.previousValue = q;
								$(target).combo("showPanel");
								_1a.keyHandler.query.call(target, $text.val());
								_2c(target, true);
							}
						}, _1a.delay);
					}
				}
			}).bind("focus.combo",function(){
				$("div.combo-panel").panel("close");
				$(target).combo("showPanel");
				$text.select();
			});
			_1e.bind("click.combo", function() {
				var panel = getPanel(target);
				if (panel.is(":visible")) {
					_28(target);
				} else {
					$("div.combo-panel").panel("close");
					$(target).combo("showPanel");
				}
				$text.focus();
				$text.select();
			}).bind("mouseenter.combo", function() {
				$(this).addClass("combo-arrow-hover");
			}).bind("mouseleave.combo", function() {
				$(this).removeClass("combo-arrow-hover");
			}).bind("mousedown.combo", function() {
			});
		}
	}
	;
	function _showPanel(target) {
		var opts = $.data(target, "combo").options;
		var $combo = $.data(target, "combo").combo;
		var $panel = $.data(target, "combo").panel;
		var state = $.data(target, "combo");
		var $text = $combo.find("input.combo-text");
		//if( $text.attr("readonly") || $text.attr("disabled") ) return;
		if( !$panel ) return;//如果面板没初始化则不显示
		if ($.fn.window) {
			$panel.panel("panel").css("z-index", $.fn.window.defaults.zIndex++);
		}
		$panel.panel("move", {
			left : $combo.offset().left,
			top : _top()
		});
		if ($panel.panel("options").closed) {
			$panel.panel("resize", {
				width : (opts.panelWidth ? opts.panelWidth : $combo.outerWidth()),
				height : opts.panelHeight
			});
			$panel.panel("open");
			opts.onShowPanel.call(target);
		}
		(function() {
			if ($panel.is(":visible")) {
				$panel.panel("move", {
					left : _left(),
					top : _top()
				});
				setTimeout(arguments.callee, 200);
			}
		})();
		function _left() {
			var _27 = $combo.offset().left;
			if (_27 + $panel._outerWidth() > $(window)._outerWidth() + $(document).scrollLeft()) {
				_27 = $(window)._outerWidth() + $(document).scrollLeft() - $panel._outerWidth();
			}
			if (_27 < 0) {
				_27 = 0;
			}
			return _27;
		}
		;
		function _top() {
			var top = $combo.offset().top + $combo._outerHeight();
			if (top + $panel._outerHeight() > $(window)._outerHeight() + $(document).scrollTop()) {
				top = $combo.offset().top - $panel._outerHeight();
			}
			if (top < $(document).scrollTop()) {
				top = $combo.offset().top + $combo._outerHeight();
			}
			return top;
		}
		;
	}
	;
	function _28(_29) {
		var _2a = $.data(_29, "combo").options;
		var _2b = $.data(_29, "combo").panel;
		_2b.panel("close");
		_2a.onHidePanel.call(_29);
	}
	;
	function _2c(_2d, _2e) {
		var _2f = $.data(_2d, "combo").options;
		var _30 = $.data(_2d, "combo").combo.find("input.combo-text");
		_30.validatebox(_2f);
		if (_2e) {
			_30.validatebox("validate");
		}
	}
	;
	
	function readonly(target, read){
		var state = $.data(target, "combo");
		var opts = state.options;
		var $combo = state.combo;
		var $arrow = $combo.find(".combo-arrow");
		var $text = $combo.find(".combo-text");
		if( read ){
			$text.attr("disabled", true);
			$text.width($text.width() + 20);
			$arrow.hide();
		}else{
			$arrow.show();
			$text.removeAttr("disabled");
			$text.width($text.width() - 20);
		}
	}
	
	function _setDisabled(_32, _33) {
		var _34 = $.data(_32, "combo").options;
		var _35 = $.data(_32, "combo").combo;
		if (_33) {
			_34.disabled = true;
			$(_32).attr("disabled", true);
			_35.find(".combo-value").attr("disabled", true);
			_35.find(".combo-text").attr("disabled", true);
		} else {
			_34.disabled = false;
			$(_32).removeAttr("disabled");
			_35.find(".combo-value").removeAttr("disabled");
			_35.find(".combo-text").removeAttr("disabled");
		}
	}
	;
	function _clear(_37) {
		var _38 = $.data(_37, "combo").options;
		var _39 = $.data(_37, "combo").combo;
		if (_38.multiple) {
			_39.find("input.combo-value").remove();
		} else {
			_39.find("input.combo-value").val("");
		}
		_39.find("input.combo-text").val("");
	}
	;
	function _3a(_3b) {
		var _3c = $.data(_3b, "combo").combo;
		return _3c.find("input.combo-text").val();
	}
	;
	function _3d(_3e, _3f) {
		var _40 = $.data(_3e, "combo").combo;
		_40.find("input.combo-text").val(_3f);
		_40.find("input.combo-text").attr("title",_3f);
		_2c(_3e, true);
		$.data(_3e, "combo").previousValue = _3f;
	}
	;
	function _41(_42) {
		var _43 = [];
		var _44 = $.data(_42, "combo").combo;
		_44.find("input.combo-value").each(function() {
			_43.push($(this).val());
		});
		return _43;
	}
	;
	function _45(_46, _47) {
		var _48 = $.data(_46, "combo").options;
		var _49 = _41(_46);
		var _4a = $.data(_46, "combo").combo;
		_4a.find("input.combo-value").remove();
		var _4b = $(_46).attr("comboName");
		for ( var i = 0; i < _47.length; i++) {
			var _4c = $("<input type=\"hidden\" class=\"combo-value\">").appendTo(_4a);
			if (_4b) {
				_4c.attr("name", _4b);
			}
			_4c.val(_47[i]);
		}
		var tmp = [];
		for ( var i = 0; i < _49.length; i++) {
			tmp[i] = _49[i];
		}
		var aa = [];
		for ( var i = 0; i < _47.length; i++) {
			for ( var j = 0; j < tmp.length; j++) {
				if (_47[i] == tmp[j]) {
					aa.push(_47[i]);
					tmp.splice(j, 1);
					break;
				}
			}
		}
		if (aa.length != _47.length || _47.length != _49.length) {
			if (_48.multiple) {
				_48.onChange.call(_46, _47, _49);
			} else {
				_48.onChange.call(_46, _47[0], _49[0]);
			}
		}
	}
	;
	function _4d(_4e) {
		var _4f = _41(_4e);
		return _4f[0];
	}
	;
	function _50(_51, _52) {
		_45(_51, [ _52 ]);
	}
	;
	function _53(_54) {
		var _55 = $.data(_54, "combo").options;
		var fn = _55.onChange;
		_55.onChange = function() {
		};
		if (_55.multiple) {
			if (_55.value) {
				if (typeof _55.value == "object") {
					_45(_54, _55.value);
				} else {
					_50(_54, _55.value);
				}
			} else {
				_45(_54, []);
			}
			_55.originalValue = _41(_54);
		} else {
			_50(_54, _55.value);
			_55.originalValue = _55.value;
		}
		_55.onChange = fn;
	}
	;
	$.fn.combo = function(options, param) {
		if (typeof options == "string") {
			return $.fn.combo.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, "combo");
			if (state) {
				$.extend(state.options, options);
			} else {
				var opts = $.extend({}, $.fn.combo.defaults, $.fn.combo.parseOptions(this), options);
				var r = _init(this, opts);
				state = $.data(this, "combo", {
					options : opts,
					combo : r.combo,
					//panel : r.panel,延迟加载
					previousValue : null
				});
				$(this).removeAttr("disabled");
			}
			$("input.combo-text", state.combo).attr("readonly", !state.options.editable);
			_setComboArrow(this);
			_setDisabled(this, state.options.disabled);
			_resize(this);
			_bindEvent(this);
			_2c(this);
			_53(this);
		});
	};
	$.fn.combo.methods = {
		options : function(jq) {
			return $.data(jq[0], "combo").options;
		},
		panel : function(jq) {
			return getPanel(jq[0]);
		},
		textbox : function(jq) {
			return $.data(jq[0], "combo").combo.find("input.combo-text");
		},
		destroy : function(jq) {
			return jq.each(function() {
				_14(this);
			});
		},
		resize : function(jq, _59) {
			return jq.each(function() {
				_resize(this, _59);
			});
		},
		showPanel : function(jq) {
			return jq.each(function() {
				_showPanel(this);
			});
		},
		hidePanel : function(jq) {
			return jq.each(function() {
				_28(this);
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				_setDisabled(this, true);
				_bindEvent(this);
			});
		},
		enable : function(jq) {
			return jq.each(function() {
				_setDisabled(this, false);
				_bindEvent(this);
			});
		},readonly : function(jq, param) {
			return jq.each(function() {
				readonly(this, param);
			});
		},
		validate : function(jq) {
			return jq.each(function() {
				_2c(this, true);
			});
		},
		isValid : function(jq) {
			var _5a = $.data(jq[0], "combo").combo.find("input.combo-text");
			return _5a.validatebox("isValid");
		},
		clear : function(jq) {
			return jq.each(function() {
				_clear(this);
			});
		},
		reset : function(jq) {
			return jq.each(function() {
				var _5b = $.data(this, "combo").options;
				if (_5b.multiple) {
					$(this).combo("setValues", _5b.originalValue);
				} else {
					$(this).combo("setValue", _5b.originalValue);
				}
			});
		},
		getText : function(jq) {
			return _3a(jq[0]);
		},
		setText : function(jq, _5c) {
			return jq.each(function() {
				_3d(this, _5c);
			});
		},
		getValues : function(jq) {
			return _41(jq[0]);
		},
		setValues : function(jq, _5d) {
			return jq.each(function() {
				_45(this, _5d);
			});
		},
		getValue : function(jq) {
			return _4d(jq[0]);
		},
		setValue : function(jq, _5e) {
			return jq.each(function() {
				_50(this, _5e);
			});
		}
	};
	$.fn.combo.parseOptions = function(_5f) {
		var t = $(_5f);
		return $.extend({}, $.fn.validatebox.parseOptions(_5f), $.parser.parseOptions(_5f, [ "width", "height", "separator","comboStyle", {
			panelWidth : "number",
			editable : "boolean",
			hasDownArrow : "boolean",
			delay : "number"
		} ]), {
			panelHeight : (t.attr("panelHeight") == "auto" ? "auto" : parseInt(t.attr("panelHeight")) || undefined),
			multiple : (t.attr("multiple") ? true : undefined),
			disabled : (t.attr("disabled") || t.attr("readonly") ? true : undefined),
			value : (t.val() || undefined),
			tooltip : t.attr("tooltip"),
			title : t.attr("title")
		});
	};
	$.fn.combo.defaults = $.extend({}, $.fn.validatebox.defaults, {
		width : "auto",
		height : 22,
		panelWidth : null,
		panelHeight : 200,
		multiple : false,
		separator : ",",
		editable : false,
		disabled : false,
		hasDownArrow : true,
		hasClear : false,
		value : "",
		delay : 200,
		keyHandler : {
			up : function() {
			},
			down : function() {
			},
			enter : function() {
			},
			query : function(q) {
			}
		},
		onShowPanel : function() {
		},
		onHidePanel : function() {
		},
		onChange : function(_60, _61) {
		}
	});
})(jQuery);
