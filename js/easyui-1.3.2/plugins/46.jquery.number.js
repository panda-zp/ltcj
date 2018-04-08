(function($){
	
	//initialize
	var init = function(target){
		var $text = $(target);
		$text.off(".number").on("blur.number",function(e){
			var val = $text.val();
			if( isNaN(val) ){//不是数字
				$text.val("");
			}
		}).on("keydown.number",function(e){
			var code = parseInt(e.keyCode || -1);
			if( $.isNumberKey(code) //0-9
					|| [13,8,173,190,32,109,110].contains(code)){//enter,backspace,减号,小数点,del，小键盘(-.)
				return true;
			}
			return false;
		});
	};

	$.fn.number = function(options, param, properties){
		if (typeof options == 'string'){
			return $.fn.number.methods[options](this, param, properties);
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'number');
			if (state){
				$.extend(state, options);
			}
			state = $.data(this, 'number', {options:$.extend({},$.fn.number.defaults,options)} );
			init(this);
		});
	};
	
	$.fn.number.methods = {
	};
	
	$.fn.number.defaults = {
	};
})(jQuery);