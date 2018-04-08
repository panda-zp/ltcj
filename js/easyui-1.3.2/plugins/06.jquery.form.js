/**
 * form - jQuery EasyUI
 * 
 * Copyright (c) 2009-2013 www.jeasyui.com. All rights reserved.
 *
 * Licensed under the GPL or commercial licenses
 * To use it on other terms please contact us: jeasyui@gmail.com
 * http://www.gnu.org/licenses/gpl.txt
 * http://www.jeasyui.com/license_commercial.php
 */
(function($){
	
	/**
	 * submit the form
	 */
	function iframeSubmit(target, options){
		options = options || {};
		var state = $.data(target, 'form');
		var param = {};
		
		if (options.onSubmit){
			if (options.onSubmit.call(target, param) == false) {
				return;
			}
		}
		
		if (options.onBeforeSubmit){
			if (options.onBeforeSubmit.call(target, param) == false) {
				return;
			}
		}
		var $t = $(target);
		//校验表单提交前后是否有变更
		if( options.validateChange ){
			if( state.old == JSON.stringify($t.serializeArray()) ){
				$.messager.alert("提示","表单数据没有修改.","info");
				return;
			}
		}
		
		var prid = window.Page ? Page.getPrid(target) : "";
		if( prid ){//提交表单前设置PRID
			param["PRID"] = prid;
		}
		var model = th.getModel($t);
		if( model ){
			param["MODEL"] = model.json();
		}
		
		var form = $(target);
		if (options.url){
			form.attr('action', options.url);
		}
		var frameId = 'easyui_frame_' + (new Date().getTime());
		var frame = $('<iframe id='+frameId+' name='+frameId+'></iframe>')
				.attr('src', window.ActiveXObject ? 'javascript:false' : 'about:blank')
				.css({
					position:'absolute',
					top:-1000,
					left:-1000
				});
		var t = form.attr('target'), a = form.attr('action');
		form.attr('target', frameId);
		
		var paramFields = $();
		var $mask = $(target).parents("div[page=true]:first");
		try {
			frame.appendTo('body');
			frame.bind('load', cb);
			for(var n in param){
				var f = $('<input type="hidden" name="' + n + '">').val(param[n]).appendTo(form);
				paramFields = paramFields.add(f);
			}
			if( !$(target).attr("submited") ){
				$(target).attr("submited", true);
				$mask.mask("正在提交数据...")
				form[0].submit();
			}else{
				alert("表单正在提交中，请勿重复提交！ ");
			}
		} finally {
			form.attr('action', a);
			t ? form.attr('target', t) : form.removeAttr('target');
			paramFields.remove();
		}
		
		var checkCount = 10;
		function cb(){
			frame.unbind();
			var body = $('#'+frameId).contents().find('body');
			var data = body.html();
			if (data == ''){
				if (--checkCount){
					setTimeout(cb, 100);
					return;
				}
				return;
			}
			$mask.unmask();
			var exception = data.indexOf("@exception") != -1;
			if( exception ){
				options.onError(data);
			}
			
			if (!exception && options.success){
				options.success(data);
			}
			$(target).attr("submited",null);//防重复提交
			setTimeout(function(){
				frame.unbind();
				frame.remove();
			}, 100);
		}
	};
	
	//ajax同步提交表单, options.success options.error
	function ajaxSubmit(target, param){
		var options = $.extend({}, $.data(target, 'form').options, param);
		if (options.onSubmit.call(target) == false) {
			return;
		}
		var url = $(target).attr('action');
		var paramFields = $();
		var model = th.getModel(target);
		if( model ){
			var field = $('<input type="hidden" name="MODEL">').appendTo(target);
			field.val(model.json());
			paramFields = paramFields.add(field);
		}
		function alertError(){
			$.messager.alert("错误", "表单提交失败，请稍后重试...", "error");
		}
		options.error = options.error || alertError;
		try{
			var data = $(target).serialize();
			var _success = options.success;
			options = $.extend(options, {"url":url,"cache":false,"async":false,"data":data,"type":"POST",success:function(text){
				if( (text || "").contains("!!exception") ){
					alertError();
				}else{
					_success(text);
				}
			}});
			var text = $.ajax(options).responseText;
			return text;
		}finally{
			paramFields.remove();
		}
	};
	
	/**
	 * load form data
	 * if data is a URL string type load from remote site, 
	 * otherwise load from local data object. 
	 */
	function load(target, data){
		if (!$.data(target, 'form')){
			$.data(target, 'form', {
				options: $.extend({}, $.fn.form.defaults)
			});
		}
		var opts = $.data(target, 'form').options;
		
		if (typeof data == 'string'){
			var param = {};
			if (opts.onBeforeLoad.call(target, param) == false) return;
			
			$.ajax({
				url: data,
				data: param,
				dataType: 'json',
				success: function(data){
					_load(data);
				},
				error: function(){
					opts.onLoadError.apply(target, arguments);
				}
			});
		} else {
			_load(data);
		}
		
		function _load(data){
			var form = $(target);
			for(var name in data){
				var val = data[name];
				var rr = _checkField(name, val);
				if (!rr.length){
					var f = form.find('input[numberboxName="'+name+'"]');
					if (f.length){
						f.numberbox('setValue', val);	// set numberbox value
					} else {
						$('input[name="'+name+'"]', form).val(val);
						$('textarea[name="'+name+'"]', form).val(val);
						$('select[name="'+name+'"]', form).val(val);
					}
				}
				_loadCombo(name, val);
			}
			opts.onLoadSuccess.call(target, data);
			validate(target);
		}
		
		/**
		 * check the checkbox and radio fields
		 */
		function _checkField(name, val){
			var form = $(target);
			var rr = $('input[name="'+name+'"][type=radio], input[name="'+name+'"][type=checkbox]', form);
			$.fn.prop ? rr.prop('checked',false) : rr.attr('checked',false);
			rr.each(function(){
				var f = $(this);
				if (f.val() == String(val)){
					$.fn.prop ? f.prop('checked',true) : f.attr('checked',true);
				}
			});
			return rr;
		}
		
		function _loadCombo(name, val){
			var form = $(target);
			var cc = ['combobox','combotree','combogrid','datetimebox','datebox','combo'];
			var c = form.find('[comboName="' + name + '"]');
			if (c.length){
				for(var i=0; i<cc.length; i++){
					var type = cc[i];
					if (c.hasClass(type+'-f')){
						if (c[type]('options').multiple){
							c[type]('setValues', val);
						} else {
							c[type]('setValue', val);
						}
						return;
					}
				}
			}
		}
	}
	
	/**
	 * clear the form fields
	 */
	function clear(target){
		$('input,select,textarea', target).each(function(){
			var t = this.type, tag = this.tagName.toLowerCase();
			if (t == 'text' || t == 'hidden' || t == 'password' || tag == 'textarea'){
				this.value = '';
			} else if (t == 'file'){
				var file = $(this);
				file.after(file.clone().val(''));
				file.remove();
			} else if (t == 'checkbox' || t == 'radio'){
				this.checked = false;
			} else if (tag == 'select'){
				this.selectedIndex = -1;
			}
			
		});
		if ($.fn.combo) $('.combo-f', target).combo('clear');
		if ($.fn.combobox) $('.combobox-f', target).combobox('clear');
		if ($.fn.combotree) $('.combotree-f', target).combotree('clear');
		if ($.fn.combogrid) $('.combogrid-f', target).combogrid('clear');
		validate(target);
	}
	
	function reset(target){
		target.reset();
		var t = $(target);
		if ($.fn.combo){t.find('.combo-f').combo('reset');}
		if ($.fn.combobox){t.find('.combobox-f').combobox('reset');}
		if ($.fn.combotree){t.find('.combotree-f').combotree('reset');}
		if ($.fn.combogrid){t.find('.combogrid-f').combogrid('reset');}
		if ($.fn.spinner){t.find('.spinner-f').spinner('reset');}
		if ($.fn.timespinner){t.find('.timespinner-f').timespinner('reset');}
		if ($.fn.numberbox){t.find('.numberbox-f').numberbox('reset');}
		if ($.fn.numberspinner){t.find('.numberspinner-f').numberspinner('reset');}
		validate(target);
	}
	
	/**
	 * set the form to make it can submit with ajax.
	 */
	function setForm(target){
		var state = $.data(target, 'form');
		var options = state.options;
		var form = $(target);
		form.unbind('.form').bind('submit.form', function(){
			th.delay(function(){
				iframeSubmit(target, options);
			}, 200);
			return false;
		});
		state.old = JSON.stringify(form.serializeArray());
	}
	
	function validate(target){
		if ($.fn.validatebox){
			var t = $(target);
			t.find('.validatebox-text:not(:disabled)').validatebox('validate');
			var invalidbox = t.find('.validatebox-invalid');
			invalidbox.filter(':not(:disabled):first').focus();
			return invalidbox.length == 0;
		}
		return true;
	}
	
	$.fn.form = function(options, param){
		if (typeof options == 'string'){
			return $.fn.form.methods[options](this, param);
		}
		
		options = options || {};
		return this.each(function(){
			if (!$.data(this, 'form')){
				$.data(this, 'form', {
					options: $.extend({}, $.fn.form.defaults, $.parser.parseOptions(this), options)
				});
			}
			setForm(this);
		});
	};
	
	$.fn.form.methods = {
		submit: function(jq, options){
			return jq.each(function(){
				iframeSubmit(this, $.extend({}, $.fn.form.defaults, options||{}));
			});
		},
		ajaxSubmit: function(jq, options){
			return ajaxSubmit(jq[0], options);
		},
		load: function(jq, data){
			return jq.each(function(){
				load(this, data);
			});
		},
		clear: function(jq){
			return jq.each(function(){
				clear(this);
			});
		},
		reset: function(jq){
			return jq.each(function(){
				reset(this);
			});
		},
		validate: function(jq){
			return validate(jq[0]);
		},
		options: function(jq){
			return $(jq[0]).data('form').options;
		}
	};
	
	$.fn.form.defaults = {
		url: null,
		validateChange:true,
		onSubmit: function(param){return $(this).form('validate');},
		success: function(data){},
		onBeforeLoad: function(param){},
		onLoadSuccess: function(data){},
		onLoadError: function(){},
		onLoad: function(){},
		errorMessage:"表单提交失败!",
		onError:function(text){
			Service.validateError(text);
		}
	};
})(jQuery);
