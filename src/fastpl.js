/**
 * @file js template
 * @author xucaiyu
 * @email 569455187@qq.com
 * @version 3.0
 * @date 2015-03-30
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

        if(typeof html !== 'string') return html;

        return html.replace( /[&<>"']+/igm, escapeFn )
    }

    // 是否数组
    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };

    // each 循环
    var _each_ = function (data, min, max, callback) {
        var i, len;

        // if not min and max
        // if( typeof min === 'function' ){
        //     i = 0;
        //     len = data.length;
        //     callback = min;
        //     min = undefined;
        // }

        if (isArray(data)) {
            i = min;
            len = max;
            for (; i < len; i++) {
                callback.call(data, data[i], i, data);
            }
        } else {
            for (i in data) {
                callback.call(data, data[i], i);
            }
        }
    };
    // if判断是否存在值
    function _ifEmpty_( val, newVal ){
        if( val )
            return val;
        else
            return newVal;
    }
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

        var dt = new Date( date.replace(/\-/g, '/') ),
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
            fmt=fmt.replace(RegExp.$1, (dt.getFullYear()+"").substring(4 - RegExp.$1.length));        
        }         
        if(/(E+)/.test(fmt)){         
            fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[dt.getDay()+""]);         
        }         
        for(var k in o){         
            if(new RegExp("("+ k +")").test(fmt)){         
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substring((""+ o[k]).length)));         
            }         
        }
                 
        return fmt;
    }
    // 数字格式化 货币
    var number_format = function( value ){

        if( !value ){
            return;
        }else{
            return String(value).replace( /\B(?=(?:\d{3})+$)/g, ',' )
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

    // fast tpl function
    var fasTpl = function( tpl, data ){
        if(typeof tpl !== 'string') throw('Template not found');

        var tplObj = fasTpl._parse.call( fasTpl, tpl );

        return data === undefined ? tplObj : tplObj.render( data );
    };

    var tools = {
        _escape_: _escape_,
        _each_: _each_,
        _ifEmpty_: _ifEmpty_,
        count: count,
        date_format: date_format,
        number_format: number_format
    }

    fasTpl.tools = function( name, fn ){
        if(typeof name === 'object' ){
            for(var n in name ){
                tools[ n ] = name[ n ];
            }
        }else{
            tools[ name ] = fn;
        }
    }

    fasTpl.getTools = function(){
        return tools;
    }

    fasTpl.tags = {
        langOpen: '{{',
        langClose: '}}',
        varOpen: '\\${',
        varClose: '}',
        commentOpen: '<!--',
        commentClose: '-->'
    }
    fasTpl.version = '3.0';
    fasTpl.uid = '1';
    fasTpl.statement = {
        'var': function( args ){
            return 'var ' + args + ';'
        },
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
        'for': function( args ){
            var str = '',
                args = args.replace( /\s/g, '' ),
                tempArr = args.split( '(' ),
                obj = tempArr[0],
                val = tempArr[1] ? tempArr[1] : '',
                params, isNum;

      // console.log( tempArr );    
            if( val === '' ){
                // 无参数
                str = '_each_('+ obj +',0,'+obj+'.length,function(v, i){'
            }else if( val !== '' ){
                params = val.split( ')' )[0].split( ',' );
                isNum = /\d+/.test( params[0] ) || /\d+/.test( params[1] );

                if( !isNum ){
                    // 参数为字母
                    str = '_each_('+ obj +',0,'+ obj +'.length,function('+params+'){';
                }else{
                    // 参数为数字
                    str = '_each_([],'+ params +',function(data,'+ (obj ? obj : 'i') +'){';
                }
            }else{
                str = 'for'+ args;
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
    
    // 编译成string语法
    fasTpl._compile = function( strTpl ){
        // regexp
        // var reg = '\\s*(\\/?\\w+(?:\\s*if)?)\\s*(?:([^\\'+ fasTpl.tags.langClose +'\\(]*)(?:\\(([\\d\\w,]*)\\))?)\\s*',
        var reg = '\\s*(\\/?\\w+(?:\\s*if)?)\\s*([^'+ fasTpl.tags.langClose +']*)',
            // 过滤正则
            literalReg = fasTpl.tags.langOpen + 'literal' + fasTpl.tags.langClose + '([\\s\\S]*)' + fasTpl.tags.langOpen + '/literal' + fasTpl.tags.langClose,
            // 语法操作正则
            operationReg = fasTpl.tags.langOpen + reg + fasTpl.tags.langClose,
            // 变量值正则
            variableReg = fasTpl.tags.varOpen + '([=\\s]?)([^\\|]+?)\\s*(?:(\\|+)([\\s\\S]+?))?' + fasTpl.tags.varClose,
            // 变量值不转义正则
            //escapeReg = fasTpl.tags.escapeOpen + '([\\s\\S]+?)\\s*(?:\\|([\\s\\S]+?))?' + fasTpl.tags.escapeClose,
            // 注释
            commentReg = fasTpl.tags.commentOpen + '[\\s\\S]*' + fasTpl.tags.commentClose,
            literalPattern = new RegExp(literalReg, 'igm'),
            operationPattern = new RegExp(operationReg, 'igm'),
            variablePattern = new RegExp(variableReg, 'igm'),
            //noneencodePattern = new RegExp(escapeReg, 'igm'),
            commentPattern = new RegExp(commentReg, 'igm'),
            headerCode = 'var _escape_=$tools._escape_,_each_=$tools._each_,_ifEmpty_=$tools._ifEmpty_,',
            footerCode = '',
            list = {},
            view;

        // 声明自定义函数
        function concat( name ){
            var val;
            if( !name || list[ name ] ) return;
            if( tools[ name ] ){
                val = '$tools.' + name;
            }else{
                val = '_data.' + name;
            }
            headerCode += name + '=' + val + ',';
            list[ name ] = true;
        }

        // 替换语法
        view = strTpl
            .replace(/[\r\t\n]/g, '')
            // 去掉注释
            .replace( commentPattern, '')
            .replace( literalPattern, function(all, args){
                var key = '_literal_'+ (fasTpl.uid++);

                headerCode += key + '=\'' + args + '\',';
                return '\';_str+=' + key + '+\'';
            })
            .replace( operationPattern, function(all, type, args ){
                // console.log(all, type,'---' , args,param);
                // console.log( type, args )
                var tag = fasTpl.statement[ type ];
                if ( !tag ) {
                    throw "Unknown template tag: " + type;
                }
                
                // 逻辑
                return '\'; '+ tag( args )+' _str+=\'';
            })
            .replace( variablePattern, function(all, escape, value, symbol, args ){
                // console.log(all, escape, type, custom );
                
                // || 判断语句
                if( symbol == '||' ){
                    // 防止未定义的变量报错
                    if( value.indexOf( '.' ) === -1 ){
                        concat( value );
                    }

                    value = '_ifEmpty_('+ value + ','+args+')';
                }
                // 转义变量
                if( escape !== '=' ){
                    value = '_escape_(' + value + ')'
                }

                // | 自定义方法
                if( symbol == '|' ){
                    if( args ){
                        var split = args.split(':'),
                            name = split[0].replace(/\s/g, ''),
                            param = split[1] || undefined,
                            code;

                        // 执行自定义方法
                        value = name+'('+ value +','+ param+')'
                        concat( name );
                    };
                }
// console.log( value )                
                return '\'+'+value+ '+\'';
            })
            .replace(/[\r\t\n]/g,'');

        // view = 'var _escape_=$tools._escape_,_each_=$tools._each_,'+ headerCode +'_str = \'\';'
        //      +  ' _str+=\''+ view +'\'; return new String(_str);';
        // headerCode = ''+ headerCode;
        footerCode = '_str = \'\';_str+=\''+ view +'\'; return new String(_str);';

        return function( data ){
            var dataCode = '', code;

            // 循环数据keyname，声明成变量,方便直接读取
            // _data.name
            tools._each_(data,0,0, function( value, name ){
                dataCode += name + '=_data.' + name+',';
            })
            // 组合代码
            code = headerCode + dataCode + footerCode;
            // console.log( code );
            return (new Function( '_data, $tools', code ))(data, tools);
        }
    }
    // 解析成js语法
    fasTpl._parse = function( tpl ){
        var viewFn;
// console.log( this );
        // 判断是否已经缓存
        if( _cache[ tpl ] ){
            viewFn = _cache[ tpl ];
        }else{
            // 返回解析但未渲染数据的函数
            viewFn = this._compile(tpl);
            _cache[ tpl ] = viewFn;
        }
// console.log( viewFn );
        
        // 生成新的渲染函数
        function render(){
            this._tpl = viewFn;
            this.render = function( data ){
                try{
                    // 渲染数据,返回html
                    return this._tpl( data ).replace(/(^\s*)|(\s*$)/g,'');
                    // this._tpl = new Function( '$data, $tools', view );
                    
                }catch (e){

                    throw( e )
                }
            }
            
        }

        return new render();
    }

    typeof define == "function" ? define(function() {
        return fasTpl;
    }) : typeof exports != "undefined" ? module.exports = fasTpl : window.fasTpl = fasTpl
    // return new Function( code.replace(/[\r\t\n]/g,'') ).apply(options);
})();