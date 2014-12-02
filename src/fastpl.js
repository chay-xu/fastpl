/**
 * @file js templete
 * @author xucaiyu
 * @email 569455187@qq.com
 * @version 1.0.0
 * @date 2014-11-26
 * @license MIT License 
 */
(function() {
    var escapeHash = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2f;'
        },
        _cache = {};

    var escapeFn = function (s) {
        return escapeHash[s];
    };

    // 转义
    var _escape_ = function( html ){

        // return ("" + html ).split("<").join("&lt;").split(">").join("&gt;").split('"').join("&#34;").split("'").join("&#39;");
        if(typeof html !== 'string') return html;
var val = html.replace( /[&<>"']+/igm, escapeFn )
        return val
    }

    // 是否数组
    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };

    // each 循环
    var _each_ = function (data, min, max, callback) {
        var i = min,
            len = max;

        // if not min and max
        // if( typeof min === 'function' ){
        //     i = 0;
        //     len = data.length;
        //     callback = min;
        //     min = undefined;
        // }

        if (isArray(data)) {
            for (; i < len; i++) {
                callback.call(data, data[i], i, data);
            }
        } else {
            for (i in data) {
                callback.call(data, data[i], i);
            }
        }
    };
    // 日期时间格式化
    /**
      * 可以用 1-2 个占位符 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) * eg: * (new
        Date()).pattern("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423      
      * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04      
      * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04      
      * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04      
      * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18      
      */ 
    var date_format = function( date, fmt ){
        if( !date ) return;

        var dt = new Date( date ),
            o = {         
                "M+" : dt.getMonth()+1, //月份         
                "d+" : dt.getDate(), //日         
                "h+" : dt.getHours()%12 == 0 ? 12 : dt.getHours()%12, //12小时制         
                "H+" : dt.getHours(), //24小时制         
                "m+" : dt.getMinutes(), //分         
                "s+" : dt.getSeconds(), //秒         
                "q+" : Math.floor((dt.getMonth()+3)/3), //季度         
                "S" : dt.getMilliseconds() //毫秒         
            };         
        var week = {         
            "0" : "\u65e5",         
            "1" : "\u4e00",         
            "2" : "\u4e8c",         
            "3" : "\u4e09",         
            "4" : "\u56db",         
            "5" : "\u4e94",         
            "6" : "\u516d"        
        };         
        if(/(y+)/.test(fmt)){         
            fmt=fmt.replace(RegExp.$1, (dt.getFullYear()+"").substr(4 - RegExp.$1.length));         
        }         
        if(/(E+)/.test(fmt)){         
            fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[dt.getDay()+""]);         
        }         
        for(var k in o){         
            if(new RegExp("("+ k +")").test(fmt)){         
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
            }         
        }         
        return fmt;
    }
    // 数字格式化 货币
    var number_format = function( value ){

        if( !value ){
            return;
        }else{
            return value.replace( /\B(?=(?:\d{3})+$)/g, ',' )
        }
    };

    // 获取长度
    var count = function( o ){
        var t = typeof o;

        if(t === 'string'){
                return o.length;
        }else if(t === 'object'){
                var n = 0;
                for(var i in o){
                        n++;
                }
                return n;
        }
        return false;
    };

    var Tpl = function( tpl ){
        this._parse( tpl );
    };

    var tools = Tpl.tools = {
        _escape_: _escape_,
        _each_: _each_,
        count: count,
        date_format: date_format,
        number_format: number_format
    }

    Tpl.tags = {
        langOpen: '{{',
        langClose: '}}',
        varOpen: '\\${',
        varClose: '}',
        commentOpen: '<!--',
        commentClose: '-->'
    }
    Tpl.statement = {
        'if': function( args ){
            return 'if(' + args + '){'
        },
        'else if': function( args ){
            return '}else if(' + args + '){'
        },
        'else': function( args ){
            return '}else{'
        },
        '/if': function( args ){
            return '}'
        },
        'for': function( args, param ){
            var str = '';
                // temp = key ? key.substr(1) : (),
                isNum = param && /\d+/.test( param.split(',')[0] );
// console.log(param && /\d+/.test( param.split(',')[0] ), '+++++++++')
            if( isNum === false ){
                // str = 'for(var ' + temp + ' in ' + args + '){'
                //     + 'if(' + args + '.hasOwnProperty(' + temp + ')){'
                //     + 'var _value=' + args +'[' +temp+ '],'
                //     + '_index='+temp+';';

                // 参数为字母
                str = '_each_('+ args +',0,'+ args +'.length,function('+param+'){'
            }else if( isNum ){
                // range = args.slice(1,-1).split( ',' );
                // str = 'for (var '+ temp +' = '+range[0]+'; '+ temp +'< '+range[1]+'; '+ temp +'++) {{'
                // range = args.slice(1,-1);
                // 参数为数字
                str = '_each_([],'+ param +',function($value,'+args+'){'
            }else{
                // 无参数
                str = '_each_('+ args +',0,'+ args +'.length,function($value,$index){'
            }

            return str
        },
        '/for': function( args ){
            return '});'
        },
        'log': function( args ){
            return 'console.log(' +args+ ');'
        }
    }
    
    Tpl.pt = Tpl.prototype;
    // 编译成string语法
    Tpl.pt._compile = function( strTpl ){
        // regexp
        // '\\s*(\\/?\\w+(?:\\s*if)?)\\s*(?:([^\\(]*)(?:\\(([\\d\\w,]*)\\))?)\\s*'
        var reg = '\\s*(\\/?\\w+(?:\\s*if)?)\\s*(?:([^\\'+ Tpl.tags.langClose +'\\(]*)(?:\\(([\\d\\w,]*)\\))?)\\s*',
            // 语法操作正则
            operationReg = Tpl.tags.langOpen + reg + Tpl.tags.langClose,
            // 变量值正则
            variableReg = Tpl.tags.varOpen + '([=\\s]?)([^\\|]+?)(?:\\|([\\s\\S]+?))?' + Tpl.tags.varClose,
            // 变量值不转义正则
            //escapeReg = Tpl.tags.escapeOpen + '([\\s\\S]+?)\\s*(?:\\|([\\s\\S]+?))?' + Tpl.tags.escapeClose,
            // 注释
            commentReg = Tpl.tags.commentOpen + '[\\s\\S]*' + Tpl.tags.commentClose,
            operationPattern = new RegExp(operationReg, 'igm'),
            variablePattern = new RegExp(variableReg, 'igm'),
            //noneencodePattern = new RegExp(escapeReg, 'igm'),
            commentPattern = new RegExp(commentReg, 'igm'),
            headerCode = '',
            list = {},
            view;

        // 替换语法
        view = strTpl
            //.replace(/[\r\t\n]/g, '')
            .replace( commentPattern, '')
            .replace( operationPattern, function(all, type, args, param ){
                // console.log(all, type,'---' , args,param);
                var tag = Tpl.statement[ type ];
                if ( !tag ) {
                    throw "Unknown template tag: " + type;
                }
                //concat( args );
                // 逻辑
                return '\'; '+ tag( args, param )+' _str+=\'';
            })
            .replace( variablePattern, function(all, escape, value, args ){
                // console.log(all, escape, type, custom );
                // 转义变量
                if( escape !== '=' ){
                    value = '_escape_(' + value + ')'
                }

                // 自定义方法
                if( args ){
                    var split = args.split(':'),
                        name = split[0].replace(/\s/g, ''),
                        param = split[1] || undefined,
                        code;
                    // var args = custom.split(':');
                    
                    // if( tools[ args[0] ] ){
                    //     name = '$tools.'+args[0]+'('+args[1]+')';
                    // }
                    // value = concat( value, args );
                    // 执行自定义方法
                    value = name+'('+ value +','+ param+')'
                    concat( name );
                };
// console.log( value )                
                return '\'+'+value+ '+\'';
            })
            // .replace( noneencodePattern, function(all, type, format ){
            //     // 时间格式
            //     if( format ) type = '_format_(' + type + ','+ format +')';
            //     // 变量
            //     return '\'+' + type + '+\'';
            // })
            .replace(/[\r\t\n]/g,'');

        // 声明自定义函数
        function concat( name ){

            if( list[ name ] ) return;
            if( tools[ name ] ){
                code = '$tools.' + name;
            }
            headerCode += name + '=' + code + ',';
            list[ name ] = true;
        }
        view = 'var _escape_=$tools._escape_,_each_=$tools._each_,'+ headerCode +'_str = \'\';'
             +  'with($data){ _str+=\''+ view +'\'}; return new String(_str);';

        return view;
    }
    // 解析成js语法
    Tpl.pt._parse = function( tpl ){

        // 判断是否已经缓存
        if( _cache[ tpl ] ){
            var view = _cache[ tpl ];
        }else{
            var view = this._compile(tpl);
            _cache[ tpl ] = view;
        }
// console.log( view );
        
        // 返回解析但未渲染数据的函数
        try{
            this._tpl = new Function( '$data, $tools', view );
            
        }catch (e){
            throw( e )
        }
        // this._tpl.prototype = units; 

        return this;
    }
    // 渲染数据,返回html
    Tpl.pt.render = function( data ){
        var html = this._tpl( data, tools )
           // .join('')
           .replace(/(^\s*)|(\s*$)/g,'');

        return html;
    }

    var fasTpl = function( tpl, data ){
        if(typeof tpl !== 'string') throw('Template not found');

        var tplObj = new Tpl( tpl, data );

        return data === undefined ? tplObj : tplObj.render( data );
    };


    typeof define == "function" ? define(function() {
        return fasTpl;
    }) : typeof exports != "undefined" ? module.exports = fasTpl : window.fasTpl = fasTpl
    // return new Function( code.replace(/[\r\t\n]/g,'') ).apply(options);
})();