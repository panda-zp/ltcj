// 解析JSON
$.eval = function(s, target){
	if( !s ){
		return null;
	}
	if( !target ){
		return eval("(" + s + ")");
	}else{
		var action = th.getAction(target);;
		return $.parse(s, action);
	}
};

//解析对象类型的字符串
$.parse = function(s, scope){
	var options = {};
	if (s){
		if( s.match(/^(\w+):(.+)?/g) ){
			s = s.trim();
			s = s.startsWith("{") ? s : "{" + s;
			s = s.endsWith("}") ? s : s + "}";
		}
		if( scope ){
			options = (new Function("scope","with(scope){ this._result = " + s + "}; return this._result;"))(scope);
		}else{
			options = $.eval(s);
		}
	}
	return options;
};

//判断为空 null 或 undefined
$.isEmpty = function( value ){
	return value === null  || value === "" || (value == undefined);
};

//判断JSON格式
$.isJson = function(text){
	var json = (text || "").trim();
	return (json.startsWith("{") && json.endsWith("}")) 
	|| (json.startsWith("[") && json.endsWith("]"));
};

//初始化验证
$.initValid = function($c){
	//放到最前面，避免下面的组件初始化生成其他HTML
	$("input[input='true'],select[input='true'],textarea[input='true']",$c).each(function(){
		var $this = $(this), className = $this.attr("class") || "";
		if( !className.contains("easyui-combotree", "easyui-combobox",
				"easyui-selectx", "easyui-datebox", "easyui-search") ){
			$this.addClass("easyui-validatebox");
		}
	});
};

//设置dataOptions属性
$.setDataOptions = function(target, options){
	options = $.extend($(target).data("data-options") || {}, options);
	$(target).data("data-options", options);
	return options;
};

//元素是否存在
$.fn.hasAttr = function(name){
	var value = this.eq(0).attr(name);
	return $.type(value) != "undefined" && value != null;
};

//元素是否存在
$.fn.exist = function( selector ){
	return this.length > 0;
};

// 是否变更 @see jquery-easyui-min.js
$.fn.isValChange = function(){
	var oldValue = $(this).attr("oldValue");
	var nowValue = $(this).val();
	if( oldValue != nowValue ){
		$(this).attr("oldValue", nowValue);
		return true;
	}
	return false;
};

// 取得属性值 返回数组
$.fn.getAttrs = function( name ){
	var values = [];
	this.each(function(){
		values.push($(this).attr(name));
	});
	return values;
};


// 清除控件值
$.fn.clear = function(rule){
	if( rule != undefined ){
		var include = rule.include || [];
		var exclude = rule.exclude || [];
		$("input,select,textarea").each(function(){
			var name = $(this).attr("name");
			if(include){
				if( include.length > 0 && include.contains(name) ){
					$(this).val("");
				}
			}else{
				if( !exclude.contains(name) ){
					$(this).val("");
				}
			}
		});
	}else{
		$("input,select,textarea").each(function(){
			$(this).val("");
		});
	}
};

// 输入值变更
// callback 回调函数
// ing 是否立即触发事件
$.fn.modify = function(callbak,ing){
	this.each(function(){
		$(this).attr("oldValue", $(this).val());// 预设默认旧值
	});	
	if( ing ){
		this.each(function(){
			var time = null;
			$(this).focus(function(){
				var target = this;
				if (time){
					clearInterval(time);
				}
				time = setInterval(function(){
					var oldValue = $(target).attr("oldValue");
					var nowValue = $(target).val();
					if( oldValue != nowValue ){
						$(target).attr("oldValue", nowValue);
						callbak.call(target,(oldValue || ""), nowValue);
					}
				},500);
			}).blur(function(){
				clearInterval(time);
				time = null;
			});
		});
	}else{
		this.each(function(){
			$(this).change(function(){
				var oldValue = $(this).attr("oldValue");
				var nowValue = $(this).val();
				$(this).attr("oldValue", nowValue);
				callbak.call(this,(oldValue || ""), nowValue);
			});
		});
	}
};

// 取得URL中参数
$.getURLParam = function( url ){
	var entrys = url.split(/\?|\&/g);
	var param = {};
	for(var i = 0 ; i < entrys.length; i++){
		var entry = entrys[i];
		if(entry.indexOf("=") != -1){
			var values = entry.split(/=/g);
			param[values[0]] = values[1];
		}
	}
	return param;
};

// 添加URL参数
$.setURLParam = function(url, param){
	for(var name in param){
		var pair = name + "=" + param[name];
		if(url.indexOf(name + "=") != -1){
			var reg = new RegExp(name + "=\\w*","g");
			url = url.replace(reg, pair);
		}else{
			if( url.indexOf("?") == -1 ){
				url = url + "?" + pair;
			}else{
				url = url + "&" + pair;
			}
		}
	}
	return url;
};

//对象转换为JSON
$.toJSON = function( obj ){
	if(obj == null) {
		return null;
	}
	return JSON.stringify(obj);
};

// 编码URI
$.encodeURI = function( text ){
	var value = encodeURIComponent(text);
	return value;
};

$.fn.outerHtml = function(){
	return $("<p></p>").append(this.clone()).html(); 
};

// 显示身份证图片
$.fn.showPhoto = function( idcard ){
	this.each(function(){
		$(this).unbind("error.idcard").bind("error.idcard",function(){
			$(this).attr("src", ctx + "/css/global/nophoto.png");
		});
		$(this).attr("src", ctx + "/idcard/photo.do?idcard=" + idcard);
	});
	return this;
};

// 设置值,兼容各种组件
$.fn.setValue = function( value ){
	this.each(function(){
		var $this = $(this);
		if($this.data("combobox") || $this.data("combotree") || $this.data("datebox")){
			$this.combo("setValue", value);
		}if($this.data("selectx") ){
			$this.selectx("setValue", value);
		}else if( $this.is("select") ){
			var readonly = $this.attr("readonly") == "true";
			if( readonly ){
				$("option", $this).attr("disabled",false);
				$this.val(value);
				$("option[value='" + value + "']", $this).attr("selected",true);
				$("option[value!='" + value + "']", $this).attr("disabled",true);
			}else{
				$this.val(value);
			}
		}else{
			$this.val(value);
		}
	});
};
//设置值,兼容各种组件
$.fn.getValue = function(){
	var $this = $(this);
	if($this.data("combobox") || $this.data("combotree")
			|| $this.data("datebox") || $this.data("datetimebox")){
		return $this.combo("getValue");
	}if($this.data("selectx") ){
		return $this.selectx("getValue");
	}else{
		return $this.val();
	}
};

// 设置、获取样式
$.fn.cssText = function( text ){
	if( text ){
		this.each(function(){
			this.style.cssText = text;
		});
	}else{
		return this.get(0).style.cssText;
	}
};

// 设置映射值 nocover不覆盖已有的值
$.fn.setMapping = function(src, mapping, nocover){
	if( typeof mapping != "undefined"){
		this.each(function(){
			for(var name in mapping){
				var $input = $("#" + name, this);
				var object = mapping[name];
				if( nocover ){
					if( !$input.val() ){// 有值的情况下不做覆盖
						$.setMappingValue(src, $input, object);
					}
				}else{
					$.setMappingValue(src, $input, object);
				}
			}
		});
	}else{
		var mapping = {};
		for( var name in src ){
			mapping[name] = name;
		}
		this.setMapping(src,mapping);
	}
};

// 设置值
$.setMappingValue = function(src, $input, object){
	if( (typeof object == "object") ){// 如果是对象类型，组件设置值
		var type = object.type;
		for( var name in object ){
			if( name != "type" ){
				var value = src[object[name]];
				$input[type](name,value);
			}
		}
	}else if( $input.is("select") ){
		var value = src[object];
		if( $("option[value='" + value + "']",$input).length > 0 ){
			$input.setValue(value);
		}
	}else{
		$input.setValue(src[object]);
	}
};

//鼠标单击和双击事件组件
$.fn.onClick = function(onClick, onDblclick){ 
    return this.each(function(){
    	var timer = null;
        var target = this; 
        $(this).click(function(e){ 
            clearTimeout(timer); 
            timer = setTimeout(function(){
            	(onClick || $.noop).call(target, e);
            }, 400); 
        }).dblclick(function(e) { 
            clearTimeout(timer); 
            (onDblclick || $.noop).call(target, e); 
        });
    }); 
};

// 加载JS
$.loadJs = function( url, callback){
	var done = false;
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.language = 'javascript';
	script.src = url;
	script.onload = script.onreadystatechange = function(){
		if (!done && (!script.readyState || script.readyState == 'loaded' || script.readyState == 'complete')){
			done = true;
			script.onload = script.onreadystatechange = null;
			if (callback){
				callback.call(script);
			}
		}
	};
	document.getElementsByTagName("head")[0].appendChild(script);
};

// 加载CSS
$.loadCss = function(url, callback){
	var link = document.createElement('link');
	link.rel = 'stylesheet';
	link.type = 'text/css';
	link.media = 'screen';
	link.href = url;
	document.getElementsByTagName('head')[0].appendChild(link);
	if (callback){
		callback.call(link);
	}
};

//校验数字输入
$.isNumberKey = function( code ){
	return (code >=48 && code <=57) /*0-9主键盘*/ || (code >=96 && code <=105)/*0-9小键盘*/;
};

//校验日期输入
$.isDateKey = function( code ){
	return (code >=48 && code <=57) /*0-9主键盘*/ 
	|| (code >=96 && code <=105)/*0-9小键盘*/
	|| [32,8,46,109,173].contains(code);//space,backspace,del,小键盘-,大键盘-
};

$.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        options.expires = options.expires || 7;// 默认7天过期
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires
															// attribute,
															// max-age is not
															// supported by IE
        }
        var path = options.path ? '; path=' + options.path : '';
        var domain = options.domain ? '; domain=' + options.domain : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

(function($){
	$.fn.mask = function(label){
		$(this).each(function() {
			$.maskElement($(this), label);
		});
	};

	$.fn.unmask = function(){
		$(this).each(function() {
			$.unmaskElement($(this));
		});
	};
	
	$.fn.isMasked = function(){
		return this.hasClass("masked");
	};

	$.maskElement = function(element, label){
		if(element.isMasked()) {
			$.unmaskElement(element);
		}
		if(element.css("position") == "static") {
			element.addClass("masked-relative");
		}
		element.addClass("masked");
		var maskDiv = $('<div class="loadmask"></div>').appendTo(element);
		var table = $("<table class='loadmask-table' style='display:none;'><tr><td class='loadmask-table-content'></td></tr></table>").appendTo(element);
		var content = $(".loadmask-table-content", table);
		if( $.type(label) == "string" ){
			maskDiv.addClass("loadmask-opacity");
			element.attr("mask-type", "string");
			$('<span class="loadmask-msg">' + label + '</span>').appendTo(content);
		}else if( label instanceof jQuery ){
			element.attr("mask-type", "jquery");
			label.show().appendTo(content);
			th.bindEvent(content);
		}
		table.show();
	};
	
	$.unmaskElement = function(element){
		element.find(".loadmask-msg,.loadmask-table,.loadmask").remove();
		element.removeClass("masked");
		element.removeClass("masked-relative");
	};
 
})(jQuery);


//mousewheel
(function (factory) {
    if ( typeof define === 'function' && define.amd ) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));

(function ($) {
    'use strict';

    /*
    * Add integers, wrapping at 2^32. This uses 16-bit operations internally
    * to work around bugs in some JS interpreters.
    */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
    * Bitwise rotate a 32-bit number to the left.
    */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
    * These functions implement the four basic operations the algorithm uses.
    */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
    * Calculate the MD5 of an array of little-endian words, and a bit length.
    */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
    * Convert an array of little-endian words to a string
    */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
    * Convert a raw string to an array of little-endian words
    * Characters >255 have their high-byte silently ignored.
    */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
    * Calculate the MD5 of a raw string
    */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
    * Calculate the HMAC-MD5, of a key and some data (raw strings)
    */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
    * Convert a raw string to a hex string
    */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
    * Encode a string as utf-8
    */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
    * Take string arguments and return either raw or hex encoded strings
    */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return md5;
        });
    } else {
        $.md5 = md5;
    }
}($));