$.extend($.fn.validatebox.defaults.rules, {
	custom: {//自定义验证
        validator: function (value, args, target) {
        	var fun = $.eval(args[0], target);
        	if( fun ){
        		var msg = fun.call(this,value,target);
        		if( msg ){
	        		$.fn.validatebox.defaults.rules.custom.message = msg;
	        		return false;
        		}
        	}
        	return true;
        },
        message: '验证失败.'
    },required:{//必须填写
		validator:function(value, args) {
			if( $.isEmpty(value) ){
				$.fn.validatebox.defaults.rules.required.message = "不能为空";
				return false;
			}
			return true;
		},
		message:'不能为空'
	},maxLength:{//最大长度
		validator:function(value, args) {
			return value.length <= args[0];
		},
		message:'最多输入{0}个字符.'
	},minLength:{//最小长度
		validator:function(value, args) {
			return value.length >= args[0];
		},
		message:'最少输入{0}个字符.'
	},CHS: {//验证汉字
        validator: function (value,param) {
        	var isChs = /^[\u0391-\uFFE5]+$/.test(value);
        	if(isChs){
        		if( param.length == 1 ){
					if (value.length > param[0]) {
						$.fn.validatebox.defaults.rules.CHS.message = '最多输入' + param[0] + "个汉字";
						return false;
					}
					return true;
        		}else if( param.length == 2 ){
        			if (value.length < param[0] || value.length > param[1]) {
						$.fn.validatebox.defaults.rules.CHS.message = '请输入' + param[0] + "至" + param[1] + "个汉字";
						return false;
					}
					return true;
        		}
        	}else{
        		$.fn.validatebox.defaults.rules.CHS.message = '只能输入汉字.';
                return false;
        	}
        },
        message: '只能输入汉字.'
    },IP:{//验证IP
        validator: function (value) {
            return  /^([0-9]{1,3}\.{1}){3}[0-9]{1,3}$/.test(value);
        },
        message: 'IP地址格式不正确'
    },number: {//验证数字
        validator: function (value,args) {
        	var isNumber = /^\d+$/.test(value);
        	if( args && args.length == 2){
        		var valueLen = value.length;
        		var minLen = args[0];
        		var maxLen = args[1];
        		$.fn.validatebox.defaults.rules.number.message = '数字长度必须在' + args[0] + '至' + args[1] + '范围';
        		return isNumber && (valueLen >= minLen && valueLen <= maxLen);
        	}
        	$.fn.validatebox.defaults.rules.number.message = '只能输入数字.';
            return isNumber;
        },
        message: '只能输入数字.'
    },money: {//钱￥￥￥￥
        validator: function (value,args) {
        	if( !isNaN(value) ){
        		if( value.length > 18){
            		$.fn.validatebox.defaults.rules.money.message = '货币长度超长最多9位数字!';
            		return false;
            	}
        		if(value.indexOf(".") != -1){
        			var values = value.split(/\./g);
        			if(values[1].length > 2){
        				$.fn.validatebox.defaults.rules.money.message = '货币只能保留两位小数!如:198.20';
        				return false;
        			}
        		}
        		return true;
        	}
            return false;
        },
        message: '只能输入货币类型.如:198.20'
    },
    // 验证整数
    integer: {
    	validator: function(value, args) {
    		var config = $.fn.validatebox.defaults.rules.integer;
    		config.message = '只能输入整数.';
    		if( isNaN(value) || value.contains(".") ) {
    			return false;
    		}	
        	if( args && args.length == 2){
        		var min = args[0];
        		var max = args[1];
        		var val = parseInt(value);
        		config.message = '整数范围须在' + args[0] + '至' + args[1] + '';
        		var access = !(val < min || val > max);
        		return access;
        	}
    		return true;
    	},
    	message: '只能输入整数.'
    },
    //数字校验
    decimal: {
        validator: function (value, args) {
        	var config = $.fn.validatebox.defaults.rules.decimal;
        	config.message = '只能输入数字.';
        	if( isNaN(value) ) {
        		return false;
        	}
        	if( args && args.length == 2){
        		var min = args[0];
        		var max = args[1];
        		var val = parseFloat(value);
        		config.message = '数字范围须在' + args[0] + '至' + args[1] + '';
        		var access = !(val < min || val > max);
        		return access;
        	}
    		return true;
        },
        message: '只能输入数字.'
    },
    //移动手机号码验证
    mobile: {
        validator: function (value) {
            var reg = /^1[3|4|5|7|8|9]\d{9}$/;
            return reg.test(value);
        },
        message: '输入手机号码格式不准确.'
    },
    //电话号码
    telephone: {
        validator: function (value) {
        	return /^\d{11,11}$/.test(value);
        },
        message: '输入电话号码只能是11位数字'
    },
	phone:{
		validator: function (value) {
			var mobile = /^1[3|4|5|7|8|9]\d{9}$/.test(value);
			var telphone = /^[\d-]{7,13}$/.test(value);
        	return mobile || telphone;
        },
        message: '电话号码格式错误 手机：18817271721 座机：023-83727123'
		
	},
    //国内邮编验证
    zipcode: {
        validator: function (value) {
            var reg = /^[1-9]\d{5}$/;
            return reg.test(value);
        },
        message: '邮编必须是非0开始的6位数字.'
    },
    //身份证号码
    idcard: {
        validator: function (value) {
        	if(value.length < 18){
        		$.fn.validatebox.defaults.rules.idcard.message = "身份证号码不足18位。";
        		return false;
        	}
        	if(value.length > 18){
        		$.fn.validatebox.defaults.rules.idcard.message = "身份证号码超过了18位。";
        		return false;
        	}
    		var result = th.idcardCheck(value);
    		if( !result.success ){
    			$.fn.validatebox.defaults.rules.idcard.message = result.message;
    			return false;
    		}
    		return true;
        },
        message: '身份证号码格式错误.'
    },
    //用户账号验证(只能包括 _ 数字 字母) 
    account: {//param的值为[]中值
        validator: function (value, param) {
            if (value.length < param[0] || value.length > param[1]) {
                $.fn.validatebox.defaults.rules.account.message = '用户名长度必须在' + param[0] + '至' + param[1] + '范围';
                return false;
            } else {
                if (!/^[\w]+$/.test(value)) {
                    $.fn.validatebox.defaults.rules.account.message = '用户名只能数字、字母、下划线组成.';
                    return false;
                } else {
                    return true;
                }
            }
        }, message: ''
    },
    //日期比较
    date: {
    	validator: function (value,params,target) {
        	if( value.length != 10 ){ return false;}
        	var match = /^((((19|20)\d{2})-(0?(1|[3-9])|1[012])-(0?[1-9]|[12]\d|30))|(((19|20)\d{2})-(0?[13578]|1[02])-31)|(((19|20)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|((((19|20)([13579][26]|[2468][048]|0[48]))|(2000))-0?2-29))$/.test(value);
        	if( match ){
        		var opts = $.parser.parseOptions(target);
        		if( opts.maxDate && value > opts.maxDate ){
        			$.fn.validatebox.defaults.rules.date.message = "日期不能大于" + opts.maxDate + ".";
        			return false;
        		}
        		if( opts.minDate && value < opts.minDate ){
        			$.fn.validatebox.defaults.rules.date.message = "日期不能小于" + opts.minDate + ".";
        			return false;
        		}
        		return true;
        	}else{
        		$.fn.validatebox.defaults.rules.date.message = "日期格式错误(输入：20130801)";
        		return false;
        	}
        },
        message: '日期格式错误(示例：2013-08-01).'
    },
    //日期比较
    dateCompare: {
        validator: function (value,params,target) {
        	if( value == ""){ return true;}    	
          	var symbol = params[0];
        	var srcValue = parseInt(value.replace(/\D/g,''));
        	var $form = $(target).parents("form");
        	var compares = "";
        	for(var i = 0; i < params.length; i = i + 2){
        		var symbol = params[i];
        		var dest = $("#" + params[i+1], $form).val();
        		if( dest != ""){
        			var destValue = dest.replace(/\D/g,'');
        			compares += "(" + srcValue + symbol + destValue + ") &&";
        		}
        	}
        	compares += " true";
        	return eval("(" + compares + ")");
        },
        message: '日期校验错误!'
    },
    region:{//区域验证
		validator:function(text, args, target) {
			var value = $(".combo-value",$(target).parent()).val();
			if( args && args.length == 2){
				var op = args[0];
				var len = parseInt(args[1]);
				if( op == "=" && value.length != len){
					if(len == 4){
						$.fn.validatebox.defaults.rules.region.message = '请选择到市级!';
					}else if(len == 6){
						$.fn.validatebox.defaults.rules.region.message = '请选择到区县级!';
					}else if(len == 9){
						$.fn.validatebox.defaults.rules.region.message = '请选择到乡镇级!';
					}else if(len == 12){
						$.fn.validatebox.defaults.rules.region.message = '请选择到村社区级!';
					}else if(len == 15){
						$.fn.validatebox.defaults.rules.region.message = '请选择到组一级!';
					}
					return false;
				}else if( op == ">=" && !(value.length >= len) ){
					if(len == 4){
						$.fn.validatebox.defaults.rules.region.message = '请选择到市级及以下区域!';
					}else if(len == 6){
						$.fn.validatebox.defaults.rules.region.message = '请选择到区县级及以下区域!';
					}else if(len == 9){
						$.fn.validatebox.defaults.rules.region.message = '请选择到乡镇级及以下区域!';
					}else if(len == 12){
						$.fn.validatebox.defaults.rules.region.message = '请选择到村社区级以下区域!';
					}else if(len == 15){
						$.fn.validatebox.defaults.rules.region.message = '请选择到组以下区域!';
					}
					return false;
				}
			}
			return true;
		},
		message:'区域选择错误!'
	}
});