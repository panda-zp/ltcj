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
	function getContentPanel(target) {
		var div = document.createElement("div");
		while (target.firstChild) {
			div.appendChild(target.firstChild);
		}
		target.appendChild(div);
		var $div = $(div);
		$div.attr("style", $(target).attr("style"));
		$(target).removeAttr("style").css("overflow", "hidden");
		$div.panel({
			border : false,
			doSize : false,
			bodyCls : "dialog-content"
		});
		return $div;
	}
	;
	function init(target) {
		var options = $.data(target, "dialog").options;
		var $contentPanel = $.data(target, "dialog").contentPanel;
		if (options.toolbar) {
			if (typeof options.toolbar == "string" || typeof options.toolbar == "object") {
				$(options.toolbar).addClass("dialog-toolbar").prependTo(target);
				$(options.toolbar).show();
			} else {
				$(target).find("div.dialog-toolbar").remove();
				var $toolbar = $("<div class=\"dialog-toolbar\"><table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table></div>").prependTo(target);
				var tr = $toolbar.find("tr");
				for ( var i = 0; i < options.toolbar.length; i++) {
					var bar = options.toolbar[i];
					if (bar == "-") {
						$("<td><div class=\"dialog-tool-separator\"></div></td>").appendTo(tr);
					} else {
						var td = $("<td></td>").appendTo(tr);
						var $a = $("<a href=\"javascript:void(0)\"></a>").appendTo(td);
						$a[0].onclick = eval(bar.handler || function() {
						});
						$a.linkbutton($.extend({}, bar, {
							plain : true
						}));
					}
				}
			}
		} else {
			$(target).find("div.dialog-toolbar").remove();
		}
		if (options.buttons) {
			if (typeof options.buttons == "string" || typeof options.buttons == "object") {
				$(options.buttons).addClass("dialog-button").appendTo(target);
				$(options.buttons).show();
			} else {
				$(target).find("div.dialog-button").remove();
				var $button = $("<div class=\"dialog-button\"></div>").appendTo(target);
				for ( var i = 0; i < options.buttons.length; i++) {
					var p = options.buttons[i];
					var $a = $("<a href=\"javascript:void(0)\"></a>").appendTo($button);
					if (p.handler) {
						$a[0].onclick = p.handler;
					}
					$a.linkbutton(p);
				}
			}
		} else {
			$(target).find("div.dialog-button").remove();
		}
		var href = options.href;
		var content = options.content;
		options.href = null;
		options.content = null;
		$contentPanel.panel({
			closed : options.closed,
			cache : options.cache,
			href : href,
			params:options.params,
			content : content,
			onLoad : function() {
				if (options.height == "auto") {
					$(target).window("resize");
				}
				options.onLoad.apply(target, arguments);
			}
		});
		$(target).window(
				$.extend({}, options, {
					onOpen : function() {
						if ($contentPanel.panel("options").closed) {
							$contentPanel.panel("open");
						}
						if (options.onOpen) {
							options.onOpen.call(target);
						}
					},
					onResize : function(width, height) {
						var $target = $(target);
						$contentPanel.panel("panel").show();
						$contentPanel.panel("resize", {
							width : $target.width(),
							height : (height == "auto") ? "auto" : $target.height() - $target.children("div.dialog-toolbar")._outerHeight()
									- $target.children("div.dialog-button")._outerHeight()
						});
						if (options.onResize) {
							options.onResize.call(target, width, height);
						}
					}
				}));
		options.href = href;
		options.content = content;
	}
	;
	function refresh(target, href) {
		var contentPanel = $.data(target, "dialog").contentPanel;
		contentPanel.panel("refresh", href);
	}
	;
	$.fn.dialog = function(options, param) {
		if (typeof options == "string") {
			var method = $.fn.dialog.methods[options];
			if (method) {
				return method(this, param);
			} else {
				return this.window(options, param);
			}
		}
		options = options || {};
		return this.each(function() {
			var state = $.data(this, "dialog");
			if (state) {
				$.extend(state.options, options);
			} else {
				$.data(this, "dialog", {
					options : $.extend({}, $.fn.dialog.defaults, $.fn.dialog.parseOptions(this), options),
					contentPanel : getContentPanel(this)
				});
			}
			init(this);
		});
	};
	$.fn.dialog.methods = {
		options : function(jq) {
			var options = $.data(jq[0], "dialog").options;
			var panelOptions = jq.panel("options");
			$.extend(options, {
				closed : panelOptions.closed,
				collapsed : panelOptions.collapsed,
				minimized : panelOptions.minimized,
				maximized : panelOptions.maximized
			});
			var contentPanel = $.data(jq[0], "dialog").contentPanel;
			return options;
		},
		dialog : function(jq) {
			return jq.window("window");
		},
		refresh : function(jq, href) {
			return jq.each(function() {
				refresh(this, href);
			});
		}
	};
	$.fn.dialog.parseOptions = function(target) {
		return $.extend({}, $.fn.window.parseOptions(target), $.parser.parseOptions(target, [ "toolbar", "buttons" ]));
	};
	$.fn.dialog.defaults = $.extend({}, $.fn.window.defaults, {
		title : "New Dialog",
		collapsible : false,
		minimizable : false,
		maximizable : false,
		resizable : false,
		toolbar : null,
		buttons : null
	});
})(jQuery);
