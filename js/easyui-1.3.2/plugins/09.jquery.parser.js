/**
 * parser - jQuery EasyUI
 * 
 * Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
 *
 * Licensed under the GPL or commercial licenses
 * To use it on other terms please contact us: jeasyui@gmail.com
 * http://www.gnu.org/licenses/gpl.txt
 * http://www.jeasyui.com/license_commercial.php
 * 
 */

(function($){
	$.parser = {
		auto: true,
		onComplete: function(context){},
		plugins:['queryform','editform','draggable','droppable','resizable','pagination',
		         'linkbutton','menu','menubutton','splitbutton','progressbar',
				 'tree','combobox','combotree','combogrid','numberbox','validatebox','searchbox',
				 'numberspinner','timespinner','calendar','datebox','datetimebox','slider',
				 'layout','panel','datagrid','propertygrid','treegrid','tabs','accordion',
				 'window','dialog','datepicker','uploadify','panelx','chooser','selectx','form',"table","cardview","search","number","chart",'select','panelx','comboregion','tooltip'
		],
		parse: function(context){
			Debug.begin("parse context");
			var aa = [];
			for(var i=0; i<$.parser.plugins.length; i++){
				var name = $.parser.plugins[i];
				var r = $('.easyui-' + name + "[parse!='false']", context);
				if (r.length){
					var debug = "	" + r.length + " " +  name;
					Debug.begin(debug);
					if ( r[name] ){
						r.each(function(){
							var $this = $(this), target = this;
							try{
								$this[name]();
							}catch(e){
								console.log(name + " init error. " + e.message, "\n", this);
								throw e;
							}
							var state = $this.data(name);
							if(state&&!state.options){
								state.options={};
							}
							var callback = state ? state.options.onParseComplete : $.noop;
							if( callback ){
								setTimeout(function(){
									callback.call($this, target);
								},0);
							}
						});
					} else {
						aa.push({name:name,jq:r});
					}
					Debug.end(debug);
				}
			}
			if (aa.length && window.easyloader){
				var names = [];
				for(var i=0; i<aa.length; i++){
					names.push(aa[i].name);
				}
				easyloader.load(names, function(){
					for(var i=0; i<aa.length; i++){
						var name = aa[i].name;
						var jq = aa[i].jq;
						jq[name]();
					}
					$.parser.onComplete.call($.parser, context);
				});
			} else {
				$.parser.onComplete.call($.parser, context);
			}
			Debug.end("parse context");
			Debug.print();
		},
		
		/**
		 * parse options, including standard 'data-options' attribute.
		 * 
		 * calling examples:
		 * $.parser.parseOptions(target);
		 * $.parser.parseOptions(target, ['id','title','width',{fit:'boolean',border:'boolean'},{min:'number'}]);
		 */
		parseOptions: function(target, properties){
			//see jquery.easyui.extend.js
		}
	};
	$(function(){
		if (!window.easyloader && $.parser.auto){
			$.parser.parse();
		}
	});
	
	/**
	 * extend plugin to set box model width
	 */
	$.fn._outerWidth = function(width){
		if (width == undefined){
			if (this[0] == window){
				return this.width() || document.body.clientWidth;
			}
			return this.outerWidth()||0;
		}
		return this.each(function(){
			if (!$.support.boxModel && $.browser.msie){
				$(this).width(width);
			} else {
				$(this).width(width - ($(this).outerWidth() - $(this).width()));
			}
		});
	};
	
	/**
	 * extend plugin to set box model height
	 */
	$.fn._outerHeight = function(height){
		if (height == undefined){
			if (this[0] == window){
				return this.height() || document.body.clientHeight;
			}
			return this.outerHeight()||0;
		}
		return this.each(function(){
			if (!$.support.boxModel && $.browser.msie){
				$(this).height(height);
			} else {
				$(this).height(height - ($(this).outerHeight() - $(this).height()));
			}
		});
	};
	
	$.fn._scrollLeft = function(left){
		if (left == undefined){
			return this.scrollLeft();
		} else {
			return this.each(function(){$(this).scrollLeft(left)});
		}
	}
	
	$.fn._propAttr = $.fn.prop || $.fn.attr;
	
	/**
	 * set or unset the fit property of parent container, return the width and height of parent container
	 */
	$.fn._fit = function(fit){
		fit = fit == undefined ? true : fit;
		var p = this.parent()[0];
		var t = this[0];
		var fcount = p.fcount || 0;
		if (fit){
			if (!t.fitted){
				t.fitted = true;
				p.fcount = fcount + 1;
				$(p).addClass('panel-noscroll');
				if (p.tagName == 'BODY'){
					$('html').addClass('panel-fit');
				}
			}
		} else {
			if (t.fitted){
				t.fitted = false;
				p.fcount = fcount - 1;
				if (p.fcount == 0){
					$(p).removeClass('panel-noscroll');
					if (p.tagName == 'BODY'){
						$('html').removeClass('panel-fit');
					}
				}
			}
		}
		return {
			width: $(p).width(),
			height: $(p).height()
		}
	}
	
})(jQuery);
