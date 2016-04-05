/**
 * @file js template
 * @author xucaiyu
 * @email 569455187@qq.com
 * @version 4.0
 * @date 2015-10-09
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

        return html.replace( /[&<>"'/]/igm, escapeFn );
    };

    // 是否数组
    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };

    // each 循环
    var _each_ = function (data, min, max, callback) {
        var i, len;

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
    // 逻辑判断是否存在值
    function _logical_( val ){
        return val;
    }

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
        _logical_: _logical_,
        count: count
    };

    fasTpl.tools = function( name, fn ){
        if(typeof name === 'object' ){
            for(var n in name ){
                tools[ n ] = name[ n ];
            }
        }else{
            tools[ name ] = fn;
        }
    };

    fasTpl.getTools = function(){
        return tools;
    };

    fasTpl.tags = {
        langOpen: '{{',
        langClose: '}}',
        varOpen: '\\${',
        varClose: '}',
        commentOpen: '{!--',
        commentClose: '--}'
    };

    fasTpl.version = '4.0';
    fasTpl.uid = '1';
    fasTpl.statement = {
        'var': function( args ){
            return 'var ' + args + ';\r\n';
        },
        'if': function( args ){
            return 'if(' + args + '){\r\n';
        },
        'else if': function( args ){
            return '}else if(' + args + '){\r\n';
        },
        'else': function( args ){
            return '}else{\r\n';
        },
        '/if': function( args ){
            return '}\r\n';
        },
        'for': function( args ){
            var str = '',
                arg = args.replace( /\s/g, '' ),
                tempArr = arg.split( '(' ),
                obj = tempArr[0],
                val = tempArr[1] ? tempArr[1] : '',
                params, isNum;

            // 无参数
            if( !args ){
                throw "{{for}}: is not arguments";
            }

            if( val === '' ){
                // 无参数
                str = '_each_('+ obj +',0,'+obj+'.length,function(v, i){';
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
                str = 'for'+ arg;
            }

            return '\r\n'+str+'\r\n';
        },
        '/for': function( args ){
            return '\r\n});\r\n';
        },
        'log': function( args ){
            return 'console.log(' +args+ ');\r\n';
        }
    };
    
    // 编译成string语法
    fasTpl._compile = function( strTpl ){
        // regexp
        // var reg = '\\s*(\\/?\\w+(?:\\s*if)?)\\s*(?:([^\\'+ fasTpl.tags.langClose +'\\(]*)(?:\\(([\\d\\w,]*)\\))?)\\s*',
        var reg = '\\s*(\\/?\\w+(?:\\s*if)?)\\s*([^'+ fasTpl.tags.langClose +']*)',
            // 过滤语法的正则
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
            headerCode = 'var _tools_=_tools,\r\n_escape_=_tools_._escape_,\r\n_each_=_tools_._each_,\r\n_logical_=_tools_._logical_,\r\n',
            footerCode = '',
            list = {},
            view;

        // 声明自定义函数
        function concat( name ){
            var val;
            // name不存在或者list中存在name
            if( !name || list[ name ] ) return;
            // 添加name
            val = '_data.' + name;
            headerCode += name + '=' + val + ',\r\n';
            list[ name ] = true;
        }

        // 替换语法
        view = strTpl
            .replace(/[\r\t\n]/g, '')
            // 去掉注释
            .replace( commentPattern, '')
            // 原模板输出
            .replace( literalPattern, function(all, args){
                var literalVar = '_literal_'+ (fasTpl.uid++);

                // 赋值变量
                headerCode += literalVar + '=\'' + args + '\',';

                return '\';\r\n_str+=' + literalVar + '+\'';
            })
            .replace( operationPattern, function(all, type, args){
                // console.log(all, type,'---' , args,param);
                // console.log( type, args )
                var tag = fasTpl.statement[ type ];
                if ( !tag ) {
                    throw "Unknown template tag: " + type;
                }
                
                // 逻辑
                return '\'; '+ tag( args )+'_str+=\'';
            })
            .replace( variablePattern, function(all, escape, value, symbol, args){
                // console.log(all, '--', escape, '--',value, '--', symbol, '--', args);
                if ( !value ) {
                    throw "Unknown template tag: " + value;
                }
                
                // || 判断语句
                if( symbol && symbol !== '|' ){
                    // 防止未定义的变量报错
                    if( value.indexOf( '.' ) === -1 ){
                        concat( value );
                    }

                    value = '_logical_('+ value + symbol + args+')';
                }else if( symbol ){
                    if( args ){
                        // var split = args.split(':'),
                        //     name = split[0].replace(/\s/g, ''), // 自定义函数名
                        //     param = split[1] || undefined,      // 参数
                        //     code;
                        var indexof = args.indexOf(':'),
                            name = args.split(':')[0].replace(/\s/g, ''), // 自定义函数名
                            param = undefined,      // 参数
                            code;

                        if( indexof !== -1 ){
                            param = args.slice( indexof + 1 );
                        }

                        // 不存在的自定义函数
                        if( !tools[ name ] ){
                            throw "Unknown template method: " + name;
                        }
                        // 执行自定义方法
                        value = '_tools_.'+name+'('+ value +','+ param+')';
                        // value = name+'('+ value +','+ param+')'
                        // concat( name );
                    }
                }
                // 转义变量
                if( escape !== '=' ){
                    value = '_escape_(' + value + ')';
                }
               
                return '\'+'+value+ '+\'';
            });
            // .replace(/[\r\t\n]/g,'');

        footerCode = '_str = \'\';\r\n_str+=\''+ view +'\';\r\nreturn new String(_str);';

        return function( data ){
            var dataCode = '', code;

            // 循环数据keyname，声明成变量,方便直接读取
            // _data.name
            tools._each_(data,0,0, function( value, name ){
                dataCode += name + '=_data.' + name+',\r\n';
            });
            // 组合代码
            code = headerCode + dataCode + footerCode;
            code.replace(/\_str\+\=\'\'\;/g, '');

            return code;
        };
    };
    // 解析成js语法
    fasTpl._parse = function( tpl ){
        var viewFn;

        // 判断是否已经缓存
        if( _cache[ tpl ] ){
            viewFn = _cache[ tpl ];
        }else{
            // 返回解析但未渲染数据的函数
            viewFn = this._compile(tpl);
            _cache[ tpl ] = viewFn;
        }
        
        // 生成新的渲染函数
        function render(){
            this._tpl = viewFn;
            this.render = function( data ){
                var code;

                try{
                    // 渲染数据,返回html
                    code = this._tpl( data );

                    return (new Function( '_data, _tools',  code ))(data, tools).replace(/(^\s*)|(\s*$)/g,'');
                    
                }catch (e){
                    if( e.name == 'ReferenceError' ){
                        throw e;
                    }else{
                        // VM输出错误
                        eval( code );
                    }                    
                }
            };
            
        }

        return new render();
    };

    typeof define == "function" ? define(function() {
        return fasTpl;
    }) : typeof exports != "undefined" ? module.exports = fasTpl : window.fasTpl = fasTpl;
    // return new Function( code.replace(/[\r\t\n]/g,'') ).apply(options);
})();
