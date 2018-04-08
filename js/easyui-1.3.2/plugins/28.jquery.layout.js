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
	var _1 = false;
	function _resize(_3) {
		var _4 = $.data(_3, "layout").options;
		var _5 = $.data(_3, "layout").panels;
		var cc = $(_3);
		_4.fit ? cc.css(cc._fit()) : cc._fit(false);
		var _6 = {
			top : 0,
			left : 0,
			width : cc.width(),
			height : cc.height()
		};
		function _7(pp) {
			if (pp.length == 0) {
				return;
			}
			pp.panel("resize", {
				width : cc.width(),
				height : pp.panel("options").height,
				left : 0,
				top : 0
			});
			_6.top += pp.panel("options").height;
			_6.height -= pp.panel("options").height;
		}
		;
		if (_b(_5.expandNorth)) {
			_7(_5.expandNorth);
		} else {
			_7(_5.north);
		}
		function _8(pp) {
			if (pp.length == 0) {
				return;
			}
			pp.panel("resize", {
				width : cc.width(),
				height : pp.panel("options").height,
				left : 0,
				top : cc.height() - pp.panel("options").height
			});
			_6.height -= pp.panel("options").height;
		}
		;
		if (_b(_5.expandSouth)) {
			_8(_5.expandSouth);
		} else {
			_8(_5.south);
		}
		function _9(pp) {
			if (pp.length == 0) {
				return;
			}
			pp.panel("resize", {
				width : pp.panel("options").width,
				height : _6.height,
				left : cc.width() - pp.panel("options").width,
				top : _6.top
			});
			_6.width -= pp.panel("options").width;
		}
		;
		if (_b(_5.expandEast)) {
			_9(_5.expandEast);
		} else {
			_9(_5.east);
		}
		function _a(pp) {
			if (pp.length == 0) {
				return;
			}
			pp.panel("resize", {
				width : pp.panel("options").width,
				height : _6.height,
				left : 0,
				top : _6.top
			});
			_6.left += pp.panel("options").width;
			_6.width -= pp.panel("options").width;
		}
		;
		if (_b(_5.expandWest)) {
			_a(_5.expandWest);
		} else {
			_a(_5.west);
		}
		_5.center.panel("resize", _6);
	}
	;
	function _init(target) {
		var cc = $(target);
		if (cc[0].tagName == "BODY") {
			$("html").addClass("panel-fit");
		}
		cc.addClass("layout");
		function _e(cc) {
			cc.children("div").each(function() {
				var _f = $.parser.parseOptions(this, [ "region" ]);
				var r = _f.region;
				if (r == "north" || r == "south" || r == "east" || r == "west" || r == "center") {
					
					_addPanel(target, {
						region : r
					}, this);
				}
			});
		}
		;
		cc.children("form").length ? _e(cc.children("form")) : _e(cc);
		$("<div class=\"layout-split-proxy-h\"></div>").appendTo(cc);
		$("<div class=\"layout-split-proxy-v\"></div>").appendTo(cc);
		cc.bind("_resize", function(e, forceResize) {
			var state = $.data(target, "layout").options;
			if (state.fit == true || forceResize) {
				_resize(target);
			}
			return false;
		});
	}
	;
	function _addPanel(target, param, _div) {
		param.region = param.region || "center";
		var _panels = $.data(target, "layout").panels;
		var $t = $(target);
		var dir = param.region;
		if (_panels[dir].length) {
			return;
		}
		var pp = $(_div);
		if (!pp.length) {
			pp = $("<div></div>").appendTo($t);
		}
		pp.panel($.extend({}, {
			width : (pp.length ? parseInt(pp[0].style.width) || pp.outerWidth() : "auto"),
			height : (pp.length ? parseInt(pp[0].style.height) || pp.outerHeight() : "auto"),
			split : (pp.attr("split") ? pp.attr("split") == "true" : undefined),
			doSize : false,
			cls : ("layout-panel layout-panel-" + dir),
			bodyCls : "layout-body",
			onOpen : function() {
				var _16 = {
					north : "up",
					south : "down",
					east : "right",
					west : "left"
				};
				if (!_16[dir]) {
					return;
				}
				var _17 = "layout-button-" + _16[dir];
				var _18 = $(this).panel("header").children("div.panel-tool");
				if (!_18.children("a." + _17).length) {
					var t = $("<a href=\"javascript:void(0)\"></a>").addClass(_17).appendTo(_18);
					t.bind("click", {
						dir : dir
					}, function(e) {
						_collapse(target, e.data.dir);
						return false;
					});
				}
			}
		}, param));
		_panels[dir] = pp;
		if (pp.panel("options").split) {
			var _19 = pp.panel("panel");
			_19.addClass("layout-split-" + dir);
			var _1a = "";
			if (dir == "north") {
				_1a = "s";
			}
			if (dir == "south") {
				_1a = "n";
			}
			if (dir == "east") {
				_1a = "w";
			}
			if (dir == "west") {
				_1a = "e";
			}
			_19.resizable({
				handles : _1a,
				onStartResize : function(e) {
					_1 = true;
					if (dir == "north" || dir == "south") {
						var _1b = $(">div.layout-split-proxy-v", target);
					} else {
						var _1b = $(">div.layout-split-proxy-h", target);
					}
					var top = 0, _1c = 0, _1d = 0, _1e = 0;
					var pos = {
						display : "block"
					};
					if (dir == "north") {
						pos.top = parseInt(_19.css("top")) + _19.outerHeight() - _1b.height();
						pos.left = parseInt(_19.css("left"));
						pos.width = _19.outerWidth();
						pos.height = _1b.height();
					} else {
						if (dir == "south") {
							pos.top = parseInt(_19.css("top"));
							pos.left = parseInt(_19.css("left"));
							pos.width = _19.outerWidth();
							pos.height = _1b.height();
						} else {
							if (dir == "east") {
								pos.top = parseInt(_19.css("top")) || 0;
								pos.left = parseInt(_19.css("left")) || 0;
								pos.width = _1b.width();
								pos.height = _19.outerHeight();
							} else {
								if (dir == "west") {
									pos.top = parseInt(_19.css("top")) || 0;
									pos.left = _19.outerWidth() - _1b.width();
									pos.width = _1b.width();
									pos.height = _19.outerHeight();
								}
							}
						}
					}
					_1b.css(pos);
					$("<div class=\"layout-mask\"></div>").css({
						left : 0,
						top : 0,
						width : $t.width(),
						height : $t.height()
					}).appendTo($t);
				},
				onResize : function(e) {
					if (dir == "north" || dir == "south") {
						var _1f = $(">div.layout-split-proxy-v", target);
						_1f.css("top", e.pageY - $(target).offset().top - _1f.height() / 2);
					} else {
						var _1f = $(">div.layout-split-proxy-h", target);
						_1f.css("left", e.pageX - $(target).offset().left - _1f.width() / 2);
					}
					return false;
				},
				onStopResize : function() {
					$(">div.layout-split-proxy-v", target).css("display", "none");
					$(">div.layout-split-proxy-h", target).css("display", "none");
					var _20 = pp.panel("options");
					_20.width = _19.outerWidth();
					_20.height = _19.outerHeight();
					_20.left = _19.css("left");
					_20.top = _19.css("top");
					pp.panel("resize");
					_resize(target);
					_1 = false;
					$t.find(">div.layout-mask").remove();
				}
			});
		}
	}
	;
	function _remove(_22, _23) {
		var _24 = $.data(_22, "layout").panels;
		if (_24[_23].length) {
			_24[_23].panel("destroy");
			_24[_23] = $();
			var _25 = "expand" + _23.substring(0, 1).toUpperCase() + _23.substring(1);
			if (_24[_25]) {
				_24[_25].panel("destroy");
				_24[_25] = undefined;
			}
		}
	}
	;
	function _collapse(_27, _28, _29) {
		if (_29 == undefined) {
			_29 = "normal";
		}
		var _2a = $.data(_27, "layout").panels;
		var p = _2a[_28];
		if (p.panel("options").onBeforeCollapse.call(p) == false) {
			return;
		}
		var _2b = "expand" + _28.substring(0, 1).toUpperCase() + _28.substring(1);
		if (!_2a[_2b]) {
			_2a[_2b] = _2c(_28);
			_2a[_2b].panel("panel").click(function() {
				var _2d = _2e();
				p.panel("expand", false).panel("open").panel("resize", _2d.collapse);
				p.panel("panel").animate(_2d.expand);
				return false;
			});
		}
		var _2f = _2e();
		if (!_b(_2a[_2b])) {
			_2a.center.panel("resize", _2f.resizeC);
		}
		p.panel("panel").animate(_2f.collapse, _29, function() {
			p.panel("collapse", false).panel("close");
			_2a[_2b].panel("open").panel("resize", _2f.expandP);
		});
		function _2c(dir) {
			var _30;
			if (dir == "east") {
				_30 = "layout-button-left";
			} else {
				if (dir == "west") {
					_30 = "layout-button-right";
				} else {
					if (dir == "north") {
						_30 = "layout-button-down";
					} else {
						if (dir == "south") {
							_30 = "layout-button-up";
						}
					}
				}
			}
			var p = null;
			if(dir=="west"){
				p = $("<div ></div>").appendTo(_27).panel({
					cls : "layout-expand",
					title : "&nbsp;",
					closed : true,
					doSize : false,
				});
				p.panel("panel").append("<div class='west-open'></div>");
				p.panel("panel").css({
				   overflow: "visible",
				   border:"none"
				})
				$(".panel-body,.panel-header",p.panel("panel")).css({border:"none"});
				p.panel("panel").click(function() {
					_expand(_27, _28);
					$(".west-close",$(".layout-panel-west")).show(); 
				});
			}else{
				p = $("<div></div>").appendTo(_27).panel({
					cls : "layout-expand",
					title : "&nbsp;",
					closed : true,
					doSize : false,
					tools : [ {
						iconCls : _30,
						handler : function() {
							_expand(_27, _28);
							return false;
						}
					} ]
				});
				p.panel("panel").hover(function() {
					$(this).addClass("layout-expand-over");
				}, function() {
					$(this).removeClass("layout-expand-over");
				});
			}
			
			return p;
		}
		;
		function _2e() {
			var cc = $(_27);
			if (_28 == "east") {
				return {
					resizeC : {
						width : _2a.center.panel("options").width + _2a["east"].panel("options").width - 28
					},
					expand : {
						left : cc.width() - _2a["east"].panel("options").width
					},
					expandP : {
						top : _2a["east"].panel("options").top,
						left : cc.width() - 28,
						width : 28,
						height : _2a["center"].panel("options").height
					},
					collapse : {
						left : cc.width()
					}
				};
			} else {
				if (_28 == "west") {
					return {
						resizeC : {
							width : _2a.center.panel("options").width + _2a["west"].panel("options").width - 1,
							left : 1
						},
						expand : {
							left : 0
						},
						expandP : {
							left : 0,
							top : _2a["west"].panel("options").top,
							width : 0.1,
							height : _2a["center"].panel("options").height
						},
						collapse : {
							left : -_2a["west"].panel("options").width
						}
					};
				} else {
					if (_28 == "north") {
						var hh = cc.height() - 28;
						if (_b(_2a.expandSouth)) {
							hh -= _2a.expandSouth.panel("options").height;
						} else {
							if (_b(_2a.south)) {
								hh -= _2a.south.panel("options").height;
							}
						}
						_2a.east.panel("resize", {
							top : 28,
							height : hh
						});
						_2a.west.panel("resize", {
							top : 28,
							height : hh
						});
						if (_b(_2a.expandEast)) {
							_2a.expandEast.panel("resize", {
								top : 28,
								height : hh
							});
						}
						if (_b(_2a.expandWest)) {
							_2a.expandWest.panel("resize", {
								top : 28,
								height : hh
							});
						}
						return {
							resizeC : {
								top : 28,
								height : hh
							},
							expand : {
								top : 0
							},
							expandP : {
								top : 0,
								left : 0,
								width : cc.width(),
								height : 28
							},
							collapse : {
								top : -_2a["north"].panel("options").height
							}
						};
					} else {
						if (_28 == "south") {
							var hh = cc.height() - 28;
							if (_b(_2a.expandNorth)) {
								hh -= _2a.expandNorth.panel("options").height;
							} else {
								if (_b(_2a.north)) {
									hh -= _2a.north.panel("options").height;
								}
							}
							_2a.east.panel("resize", {
								height : hh
							});
							_2a.west.panel("resize", {
								height : hh
							});
							if (_b(_2a.expandEast)) {
								_2a.expandEast.panel("resize", {
									height : hh
								});
							}
							if (_b(_2a.expandWest)) {
								_2a.expandWest.panel("resize", {
									height : hh
								});
							}
							return {
								resizeC : {
									height : hh
								},
								expand : {
									top : cc.height() - _2a["south"].panel("options").height
								},
								expandP : {
									top : cc.height() - 28,
									left : 0,
									width : cc.width(),
									height : 28
								},
								collapse : {
									top : cc.height()
								}
							};
						}
					}
				}
			}
		}
		;
	}
	;
	function _expand(_32, _33) {
		var _34 = $.data(_32, "layout").panels;
		var _35 = _36();
		var p = _34[_33];
		if (p.panel("options").onBeforeExpand.call(p) == false) {
			return;
		}
		var _37 = "expand" + _33.substring(0, 1).toUpperCase() + _33.substring(1);
		_34[_37].panel("close");
		p.panel("panel").stop(true, true);
		p.panel("expand", false).panel("open").panel("resize", _35.collapse);
		p.panel("panel").animate(_35.expand, function() {
			_resize(_32);
		});
		function _36() {
			var cc = $(_32);
			if (_33 == "east" && _34.expandEast) {
				return {
					collapse : {
						left : cc.width()
					},
					expand : {
						left : cc.width() - _34["east"].panel("options").width
					}
				};
			} else {
				if (_33 == "west" && _34.expandWest) {
					return {
						collapse : {
							left : -_34["west"].panel("options").width
						},
						expand : {
							left : 0
						}
					};
				} else {
					if (_33 == "north" && _34.expandNorth) {
						return {
							collapse : {
								top : -_34["north"].panel("options").height
							},
							expand : {
								top : 0
							}
						};
					} else {
						if (_33 == "south" && _34.expandSouth) {
							return {
								collapse : {
									top : cc.height()
								},
								expand : {
									top : cc.height() - _34["south"].panel("options").height
								}
							};
						}
					}
				}
			}
		}
		;
	}
	;
	function _initEvent(_39) {
		var _3a = $.data(_39, "layout").panels;
		var cc = $(_39);
		if (_3a.east.length) {
			_3a.east.panel("panel").bind("mouseover", "east", _3b);
		}
		if (_3a.west.length) {
			_3a.west.panel("panel").bind("mouseover", "west", _3b);
		}
		if (_3a.north.length) {
			_3a.north.panel("panel").bind("mouseover", "north", _3b);
		}
		if (_3a.south.length) {
			_3a.south.panel("panel").bind("mouseover", "south", _3b);
		}
		_3a.center.panel("panel").bind("mouseover", "center", _3b);
		function _3b(e) {
			if (_1 == true) {
				return;
			}
			if (e.data != "east" && _b(_3a.east) && _b(_3a.expandEast)) {
				_collapse(_39, "east");
			}
			if (e.data != "west" && _b(_3a.west) && _b(_3a.expandWest)) {
				_collapse(_39, "west");
			}
			if (e.data != "north" && _b(_3a.north) && _b(_3a.expandNorth)) {
				_collapse(_39, "north");
			}
			if (e.data != "south" && _b(_3a.south) && _b(_3a.expandSouth)) {
				_collapse(_39, "south");
			}
			return false;
		}
		;
	}
	;
	function _b(pp) {
		if (!pp) {
			return false;
		}
		if (pp.length) {
			return pp.panel("panel").is(":visible");
		} else {
			return false;
		}
	}
	;
	function _collapseAll(_3d) {
		var _3e = $.data(_3d, "layout").panels;
		if (_3e.east.length && _3e.east.panel("options").collapsed) {
			_collapse(_3d, "east", 0);
		}
		if (_3e.west.length && _3e.west.panel("options").collapsed) {
			_collapse(_3d, "west", 0);
		}
		if (_3e.north.length && _3e.north.panel("options").collapsed) {
			_collapse(_3d, "north", 0);
		}
		if (_3e.south.length && _3e.south.panel("options").collapsed) {
			_collapse(_3d, "south", 0);
		}
	}
	;
	$.fn.layout = function(_3f, _40) {
		if (typeof _3f == "string") {
			return $.fn.layout.methods[_3f](this, _40);
		}
		_3f = _3f || {};
		return this.each(function() {
			var _41 = $.data(this, "layout");
			if (_41) {
				$.extend(_41.options, _3f);
			} else {
				var _42 = $.extend({}, $.fn.layout.defaults, $.fn.layout.parseOptions(this), _3f);
				$.data(this, "layout", {
					options : _42,
					panels : {
						center : $(),
						north : $(),
						south : $(),
						east : $(),
						west : $()
					}
				});
				_init(this);
				_initEvent(this);
			}
			_resize(this);
			_collapseAll(this);
		});
	};
	$.fn.layout.methods = {
		resize : function(jq) {
			return jq.each(function() {
				_resize(this);
			});
		},
		panel : function(jq, region) {
			return $.data(jq[0], "layout").panels[region];
		},
		collapse : function(jq, _44) {
			return jq.each(function() {
				_collapse(this, _44);
			});
		},
		expand : function(jq, _45) {
			return jq.each(function() {
				_expand(this, _45);
			});
		},
		add : function(jq, _46) {
			return jq.each(function() {
				_addPanel(this, _46);
				_resize(this);
				if ($(this).layout("panel", _46.region).panel("options").collapsed) {
					_collapse(this, _46.region, 0);
				}
			});
		},
		remove : function(jq, _47) {
			return jq.each(function() {
				_remove(this, _47);
				_resize(this);
			});
		}
	};
	$.fn.layout.parseOptions = function(_48) {
		return $.extend({}, $.parser.parseOptions(_48, [ {
			fit : "boolean"
		} ]));
	};
	$.fn.layout.defaults = {
		fit : false
	};
})(jQuery);
