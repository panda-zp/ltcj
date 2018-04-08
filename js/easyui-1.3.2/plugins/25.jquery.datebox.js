/**
 * datebox - jQuery EasyUI
 * 
 * Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
 *
 * Licensed under the GPL or commercial licenses
 * To use it on other terms please contact us: jeasyui@gmail.com
 * http://www.gnu.org/licenses/gpl.txt
 * http://www.jeasyui.com/license_commercial.php
 * 
 * Dependencies:
 * 	 calendar
 *   combo
 * 
 */
(function($){
	/**
	 * create date box
	 */
	function createBox(target){
		var state = $.data(target, 'datebox');
		var opts = state.options;
		
		$(target).addClass('datebox-f');
		$(target).combo($.extend({}, opts, {
			onShowPanel:function(){
				var c = getCalendar(target);
				c.calendar('resize');
				var value = $(target).combo('getValue');
				c.calendar('moveTo', opts.parser(value));
				opts.onShowPanel.call(target);
			}
		}));
		$(target).combo('textbox').parent().addClass('datebox');
		var $text = $(target).combo('textbox').val(opts.value);
		//自动解析日期
		$text.off(".datebox").on("keydown.datebox",function(e){
			var code = parseInt(e.keyCode || -1);
			if( code == 13 ){
				return true;
			}
			if( !$.isDateKey(code) ){
				return false;
			}
		}).on("keyup.datebox",function(e){
			var code = parseInt(e.keyCode || -1);
			if( $.isDateKey(code) ) {
				var text = $(this).val();
				if( text.length == 8 && !isNaN(text) ){
					var date = Date.parseDate(text);
					if( date ){
						var value = opts.formatter.call(target, date);
						$(target).combo('setValue', value).combo('setText', value);
						var c = getCalendar(target);
						c.calendar('moveTo', date);
						opts.onSelect.call(target, date);
					}
				}
			}
			return true;
		}).on("blur.datebox",function(e){
			var that = this;
			setTimeout(function(){
				var text = $(that).val();
				var date = Date.parseDate(text);
				if( date ){
					var value = opts.formatter.call(target, date);
					$(target).combo('setValue', value).combo('setText', value);
				}else{
					$(target).combo('setValue', "").combo('setText', "");
				}
			},100);
		});
	}
	
	//取得日历
	function getCalendar(target){
		var state = $.data(target, 'datebox');
		var opts = state.options;
		if( !state.calendar ){
			state.calendar = createCalendar(target);
		}
		return state.calendar;
	}
	
	function createCalendar(target){
		var state = $.data(target, 'datebox');
		var opts = state.options;
		var panel = $(target).combo('panel');
		state.calendar = $('<div></div>').appendTo(panel).wrap('<div class="datebox-calendar-inner"></div>');
		state.calendar.calendar({
			fit:true,
			border:false,
			onSelect:function(date){
				var value = opts.formatter.call(target,date);
				setValue(target, value);
				$(target).combo('hidePanel');
				opts.onSelect.call(target, date);
			},
			minDate:opts.minDate,
			maxDate:opts.maxDate
		});
		
		var button = $('<div class="datebox-button"></div>').appendTo(panel);
		$('<a href="javascript:void(0)" class="datebox-current"></a>').html(opts.currentText).appendTo(button);
		$('<a href="javascript:void(0)" class="datebox-close"></a>').html(opts.closeText).appendTo(button);
		$('<a href="javascript:void(0)" class="datebox-clear" style="float:right;margin-right:5px;"></a>').html(opts.clearText).appendTo(button);
		button.find('.datebox-current,.datebox-close').hover(
				function(){$(this).addClass('datebox-button-hover');},
				function(){$(this).removeClass('datebox-button-hover');}
		);
		button.find('.datebox-current').click(function(){
			state.calendar.calendar({
				year:new Date().getFullYear(),
				month:new Date().getMonth()+1,
				current:new Date()
			});
		});
		button.find('.datebox-close').click(function(){
			$(target).combo('hidePanel');
		});
		button.find('.datebox-clear').click(function(){
			$(target).combo('hidePanel');
			$(target).combo('setValue', "").combo('setText', "");
		});
		return state.calendar;
	}
	
	/**
	 * called when user inputs some value in text box
	 */
	function doQuery(target, q){
		setValue(target, q);
	}
	
	/**
	 * called when user press enter key
	 */
	function doEnter(target){
		var opts = $.data(target, 'datebox').options;
		var c = getCalendar(target);
		var value = opts.formatter.call(target, c.calendar('options').current);
		setValue(target, value);
		$(target).combo('hidePanel');
	}
	
	function setValue(target, value){
		var state = $.data(target, 'datebox');
		var opts = state.options;
		var c = getCalendar(target);
		$(target).combo('setValue', value).combo('setText', value);
	}
	
	$.fn.datebox = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.datebox.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}
		
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'datebox');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'datebox', {
					options: $.extend({}, $.fn.datebox.defaults, $.fn.datebox.parseOptions(this), options)
				});
			}
			createBox(this);
		});
	};
	
	$.fn.datebox.methods = {
		options: function(jq){
			var opts = $.data(jq[0], 'datebox').options;
			opts.originalValue = jq.combo('options').originalValue;
			return opts;
		},
		calendar: function(jq){	// get the calendar object
			return getCalendar(jq[0]);
		},
		setValue: function(jq, value){
			return jq.each(function(){
				setValue(this, value);
			});
		},
		reset: function(jq){
			return jq.each(function(){
				var opts = $(this).datebox('options');
				$(this).datebox('setValue', opts.originalValue);
			});
		}
	};
	
	$.fn.datebox.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, $.fn.combo.parseOptions(target), {
		});
	};
	
	$.fn.datebox.defaults = $.extend({}, $.fn.combo.defaults, {
		panelWidth:180,
		panelHeight:'auto',
		format:"yyyy-MM-dd",
		editable:true,
		keyHandler: {
			up:function(){},
			down:function(){},
			enter:function(){doEnter(this);},
			query:function(q){doQuery(this, q);}
		},
		
		currentText:'Today',
		closeText:'Close',
		clearText:'置空',
		okText:'Ok',
		formatter:function(date){
			var format = $(this).data("datebox").options.format;
			return date.toString(format || "yyyy-MM-dd");
		},
		parser:function(s){
			var date = Date.parseDate(s);
			if( date ){
				return date;
			}
			return new Date();
		},
		
		onSelect:function(date){}
	});
})(jQuery);