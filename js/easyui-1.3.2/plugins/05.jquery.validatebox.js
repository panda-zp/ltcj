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
	function _1(_2) {
		$(_2).addClass("validatebox-text");
	}
	;
	function _3(_4) {
		var _5 = $.data(_4, "validatebox");
		_5.validating = false;
		var _6 = _5.tip;
		if (_6) {
			_6.remove();
		}
		$(_4).unbind();
		$(_4).remove();
	}
	;
	function init(target) {
		var $t = $(target);
		var state = $.data(target, "validatebox");
		if( state.options.required ){
			$t.addClass("validatebox-required");
		}else{
			$t.removeClass("validatebox-required");
		}
		$t.unbind(".validatebox").bind("focus.validatebox", function() {
			state.validating = true;
			state.value = undefined;
			(function() {
				if (state.validating) {
					if (state.value != $t.val()) {
						state.value = $t.val();
						if (state.timer) {
							clearTimeout(state.timer);
						}
						state.timer = setTimeout(function() {
							$(target).validatebox("validate");
						}, state.options.delay);
					} else {
						_10(target);
					}
					setTimeout(arguments.callee, 200);
				}
			})();
		}).bind("blur.validatebox", function() {
			if (state.timer) {
				clearTimeout(state.timer);
				state.timer = undefined;
			}
			state.validating = false;
			_b(target);
		}).bind("mouseenter.validatebox", function() {
			if ($t.hasClass("validatebox-invalid")) {
				showTipMessage(target);
			}
		}).bind("mouseleave.validatebox", function() {
			if (!state.validating) {
				_b(target);
			}
		});
	}
	;
	function showTipMessage(_d) {
		var _e = $.data(_d, "validatebox").message;
		var _f = $.data(_d, "validatebox").tip;
		if (!_f) {
			_f = $(
					"<div class=\"validatebox-tip\">" + "<span class=\"validatebox-tip-content\">" + "</span>" + "<span class=\"validatebox-tip-pointer\">"
							+ "</span>" + "</div>").appendTo("body");
			$.data(_d, "validatebox").tip = _f;
		}
		_f.find(".validatebox-tip-content").html(_e);
		_10(_d);
	}
	;
	function _10(_11) {
		var _12 = $.data(_11, "validatebox");
		if (!_12) {
			return;
		}
		var tip = _12.tip;
		if (tip) {
			var box = $(_11);
			var _13 = tip.find(".validatebox-tip-pointer");
			var _14 = tip.find(".validatebox-tip-content");
			tip.show();
			tip.css("top", box.offset().top - (_14._outerHeight() - box._outerHeight()) / 2);
			if (_12.options.tipPosition == "left") {
				tip.css("left", box.offset().left - tip._outerWidth());
				tip.addClass("validatebox-tip-left");
			} else {
				tip.css("left", box.offset().left + box._outerWidth());
				tip.removeClass("validatebox-tip-left");
			}
			_13.css("top", (_14._outerHeight() - _13._outerHeight()) / 2);
		}
	}
	;
	function _b(_15) {
		var tip = $.data(_15, "validatebox").tip;
		if (tip) {
			tip.remove();
			$.data(_15, "validatebox").tip = null;
		}
	}
	;
	
	//取得输入框所属组件
	function getOwner( t ){
		if( t.hasClass("selectx-text") || t.hasClass("combo-text") ){
			return t.parent().prev();
		}
		return t;
	};
	
	function _16(_17) {
		var _state = $.data(_17, "validatebox");
		if( !_state ){//没有初始化验证
			return true;
		}
		var _19 = _state.options;
		var tip = _state.tip;
		var box = $(_17);
		if( box.is(":hidden") || box.parents("div:hidden").exist() ){
			return true;
		}
		var _1a = box.val();
		var owner= getOwner($(_17));
		function _1b(msg) {
			_state.message = msg;
		}
		;
		function _1c(rule) {
			rule = rule || "";
			var _1e = /([a-zA-Z_]+)(.*)/.exec(rule) || "";
			var _1f = _19.rules[_1e[1]];
			if ((_1f && _1a) || rule.contains("custom[") ) {
				var _20 = eval(_1e[2]);
				var invalid = !_1f["validator"].call(owner, _1a, _20, _17);
				if ( invalid ) {
					box.addClass("validatebox-invalid");
					var _21 = _1f["message"];
					if (_20) {
						for ( var i = 0; i < _20.length; i++) {
							_21 = _21.replace(new RegExp("\\{" + i + "\\}", "g"), _20[i]);
						}
					}
					_1b(_19.invalidMessage || _21);
					if (_state.validating) {
						showTipMessage(_17);
					}
					return false;
				}
			}
			return true;
		}
		;
		if (_19.required) {
			if (_1a == "") {
				box.addClass("validatebox-invalid");
				_1b(_19.missingMessage);
				if (_state.validating) {
					showTipMessage(_17);
				}
				return false;
			}
		}
		if (_19.validType) {
			var type = _19.validType;
			if (typeof _19.validType == "string") {
				var types = type.split("&&");
				for ( var i = 0; i < types.length; i++) {
					if (!_1c(types[i].trim())) {
						return false;
					}
				}
			} if (typeof _19.validType == "function") {
				var message = _19.validType.call(_17, _1a);
				if( !message ){
					_b(_17);
					box.removeClass("validatebox-invalid");
					return true;
				}else{
					box.addClass("validatebox-invalid");
					_1b(message);
					if (_state.validating) {
						showTipMessage(_17);
					}
					return false;
				}
				return false;
			}else {
				for ( var i = 0; i < _19.validType.length; i++) {
					if (!_1c(_19.validType[i])) {
						return false;
					}
				}
			}
		}
		box.removeClass("validatebox-invalid");
		_b(_17);
		return true;
	};
	
	var promptTip = function(target, message){
		var state = $.data(target, "validatebox");
		var box = $(target);
		box.addClass("validatebox-invalid");
		state.message = message;
		if (state.validating) {
			showTipMessage(target);
		}
	};
	
	$.fn.validatebox = function(_22, _23) {
		if (typeof _22 == "string") {
			return $.fn.validatebox.methods[_22](this, _23);
		}
		_22 = _22 || {};
		return this.each(function() {
			var _24 = $.data(this, "validatebox");
			if (_24) {
				$.extend(_24.options, _22);
			} else {
				_1(this);
				$.data(this, "validatebox", {
					options : $.extend({}, $.fn.validatebox.defaults, $.fn.validatebox.parseOptions(this), _22)
				});
			}
			init(this);
		});
	};
	$.fn.validatebox.methods = {
		destroy : function(jq) {
			return jq.each(function() {
				_3(this);
			});
		},
		validate : function(jq) {
			return jq.each(function() {
				_16(this);
			});
		},
		isValid : function(jq) {
			return _16(jq[0]);
		}
	};
	$.fn.validatebox.parseOptions = function(_25) {
		var t = $(_25);
		return $.extend({}, $.parser.parseOptions(_25, [ "validType", "missingMessage", "invalidMessage", "tipPosition", {
			delay : "number"
		} ]), {
			required : (t.attr("required") ? true : undefined)
		});
	};
	$.fn.validatebox.defaults = {
		required : false,
		validType : null,
		delay : 500,
		missingMessage : "This field is required.",
		invalidMessage : null,
		tipPosition : "right",
		rules : {
			email : {
				validator : function(_26) {
					return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i
							.test(_26);
				},
				message : "Please enter a valid email address."
			},
			url : {
				validator : function(_27) {
					return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
							.test(_27);
				},
				message : "Please enter a valid URL."
			},
			length : {
				validator : function(_28, _29) {
					var len = $.trim(_28).length;
					return len >= _29[0] && len <= _29[1];
				},
				message : "Please enter a value between {0} and {1}."
			},
			remote : {
				validator : function(_2a, _2b) {
					var _2c = {};
					_2c[_2b[1]] = _2a;
					var _2d = $.ajax({
						url : _2b[0],
						dataType : "json",
						data : _2c,
						async : false,
						cache : false,
						type : "post"
					}).responseText;
					return _2d == "true";
				},
				message : "Please fix this field."
			}
		}
	};
})(jQuery);
