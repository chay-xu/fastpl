/**
 * @file fastpl plus tools
 * @date 2015-10-09
 */
(function() {
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
                "h+" : dt.getHours()%12 === 0 ? 12 : dt.getHours()%12, //12小时制         
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
    };
    // 数字格式化 货币
    var number_format = function( value ){

        if( !value ){
            return;
        }else{
            return String(value).replace( /\B(?=(?:\d{3})+$)/g, ',' );
        }
    };

    fasTpl.tools({
        date_format: date_format,
        number_format: number_format
    });

})();