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

        return html.replace( /[&<>"'/]/igm, escapeFn )
    }

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
            headerCode = 'var _escape_=$tools._escape_,_each_=$tools._each_,_logical_=$tools._logical_,',
            footerCode = '',
            list = {},
            view;

        // 声明自定义函数
        function concat( name ){
            var val;
            // name不存在或者list中存在name
            if( !name || list[ name ] ) return;
            // 添加name
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
            .replace( operationPattern, function(all, type, args){
                // console.log(all, type,'---' , args,param);
                // console.log( type, args )
                var tag = fasTpl.statement[ type ];
                if ( !tag ) {
                    throw "Unknown template tag: " + type;
                }
                
                // 逻辑
                return '\'; '+ tag( args )+' _str+=\'';
            })
            .replace( variablePattern, function(all, escape, value, symbol, args){
                // console.log(all, '--', escape, '--',value, '--', symbol, '--', args);
                
                // || 判断语句
                if( symbol && symbol !== '|' ){
                    // 防止未定义的变量报错
                    if( value.indexOf( '.' ) === -1 ){
                        concat( value );
                    }

                    value = '_logical_('+ value + symbol + args+')';
                }else{
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
                // 转义变量
                if( escape !== '=' ){
                    value = '_escape_(' + value + ')'
                }
               
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