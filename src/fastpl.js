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

        return html.replace( /[&<>"']+/igm, escapeFn )
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

    // 获取长度
    var _count_ = function( o ){
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

    var units = {
        escape: _escape_,
        each: _each_,
        count: _count_
    }

    var Tpl = function( tpl ){
        this._parse( tpl );
    };

    Tpl.tags = {
        langOpen: '{{',
        langClose: '}}',
        varOpen: '\\${',
        varClose: '}',
        escapeOpen: '\\$\\${',
        escapeClose: '}',
        commentOpen: '\\{#',
        commentClose: '\\}'
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
            var str = '',
                // temp = key ? key.substr(1) : (),
                temp = param && param.split(',')[0];

            if( param && /[a-z]+/igm.test(temp) ){
                // str = 'for(var ' + temp + ' in ' + args + '){'
                //     + 'if(' + args + '.hasOwnProperty(' + temp + ')){'
                //     + 'var _value=' + args +'[' +temp+ '],'
                //     + '_index='+temp+';';
console.log(temp)
                // 参数为字母
                str = '_each_('+ args +',0,'+ args +'.length,function('+param+'){'
            }else if( param && /\d+/.test(temp) ){
                // range = args.slice(1,-1).split( ',' );
                // str = 'for (var '+ temp +' = '+range[0]+'; '+ temp +'< '+range[1]+'; '+ temp +'++) {{'
                // range = args.slice(1,-1);
                // 参数为数字
                str = '_each_([],'+ param +',function(_value,'+args+'){'
            }else{
                // 无参数
                str = '_each_('+ args +',0,'+ args +'.length,function(_value,_index){'
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
        // (,\\s*[\\w\\d]*?)?
        var reg = '\\s*(\\/?\\w+(?:\\s*if)?)\\s*(?:([^\\'+ Tpl.tags.langClose +'\\(]*)(?:\\(([\\d\\w,]*)\\))?)\\s*',
            // 语法操作正则
            operationReg = Tpl.tags.langOpen + reg + Tpl.tags.langClose,
            // 变量值正则
            variableReg = Tpl.tags.varOpen + '([\\s\\S]+?)' + Tpl.tags.varClose,
            // 变量值不转义正则
            escapeReg = Tpl.tags.escapeOpen + '([\\s\\S]+?)' + Tpl.tags.escapeClose,
            operationPattern = new RegExp(operationReg, 'igm'),
            variablePattern = new RegExp(variableReg, 'igm'),
            noneencodePattern = new RegExp(escapeReg, 'igm'),
            view;

        // 替换语法
        view = strTpl
            //.replace(/[\r\t\n]/g, '')
            .replace( operationPattern, function(all, type, args, param ){
                // console.log(all, type,'---' , args,param);
                var tag = Tpl.statement[ type ];
                if ( !tag ) {
                    throw "Unknown template tag: " + type;
                }
                // 逻辑
                return '\'; '+ tag( args, param )+' _str+=\'';
            })
            .replace( variablePattern, function(all, type ){
                // console.log(all, type, str, args, news);
                // 转义变量
                return '\'+_escape_(' + type + ')+\'';
            })
            .replace( noneencodePattern, function(all, type ){
                // 变量
                return '\'+' + type + '+\'';
            })
            .replace(/[\r\t\n]/g,'');

        view = 'var _str = \'\',_escape_=units.escape,_each_=units.each; with(data){ _str+=\''+ view +'\'}; return new String(_str);';

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
            this._tpl = new Function( 'data, units', view );
            
        }catch (e){
            throw( e )
        }
        // this._tpl.prototype = units; 

        return this;
    }
    // 渲染数据,返回html
    Tpl.pt.render = function( data ){
        var html = this._tpl( data, units )
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