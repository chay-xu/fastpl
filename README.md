## 简要
fastpl 是一个高效、轻量的Javascript模板引擎，性能卓越、支持预编译、语法简洁，支持所有流行的浏览器。

## 快速使用
> 数据

      var data = {
      	list: ["js", "html", "css"],
      	showList: true，
      	person: {
      	      name: 'json',
      	      age: 18
      	}
      	dataTime: '2014-12-1 14:14:14',
      	number: 12345678
      }
      
> 模板语法

      <script type="text/tmpl" id="test">
        {{ if showList }}
          {{for list}}
            <a href="#"> ${ $value } </a>
          {{/for}}
          <span>${ dataTime }</span>
        {{/if }}
      </script>
      
> 渲染模板

      var tpl = fasTpl( document.getElementById( 'test' ).innerHTML ),
          html = tpl.render( data );
      // 快捷写法
      // var html = fasTpl( document.getElementById( 'test' ).innerHTML, data );
      
## 语法详解
语法四种写法，方便区分逻辑和变量。

      逻辑语法：{{ }}
      变量名语法：${}
      变量值不转义语法：${=}
      注释语法：<!-- -->

#### 变量 ${ }
变量语法，用来输出变量，提供`判断语法`和`自定义方法`。

      <p>${ dateTimes || '不存在dateTimes' }</p>
      
下面是3个默认提供格式化方法。

      <p>${ dateTime| date_format:'yyyy-MM-dd' }</p>
      <p>${ person|count }</p>
      <p>${ number|number_format }</p>
  
 结果：

      2014-12-01
      2
      12,345,678
      
下面是`date_format`详细的格式参数：
      
       // y 年
      // M 月
      // d 日
      // E 星期
      // h 时 12小时制
      // H 时 24小时制
      // m 分
      // s 秒
      // q 季度
      // S 毫秒

> 添加自定义方法

__fastpl.tools( name, callback );__

      fastpl.tools( 'toString', function( val, args ){ 
            return String( val ).toString();
      })
      
#### 变量 ${= }
如果不想html转义输出数据，使用`${= }`

#### 注释 <!-- -->
注释中的语句将不会渲染，和html原生注释用法一样。

      <!-- <span>${ dateTime|'yyyy-MM-dd' }</span> -->

##### 逻辑语法 
下面是逻辑语法

###### {{ if }}

      {{ if showList != true }}
        <a href="#"></a>
      {{else if showList == true }}
        <a href="#"></a>
      {{else}}
        a href="#"></a>
      {{/if }}
      
###### {{ for }}
默认值2个值 `$value` 和 `$index` ，分别是值和索引。

      {{ for list }}
        <a href="${$value}"> ${ $index} </a>
      {{/for }}
      
自定义变量名

      {{ for list(v,i) }}
        <a href="${v}"> ${i} </a>
      {{/for }}
      
自定义循环，list现在是索引值，循环显示结果为0-999值。

      {{ for list(0,1000) }}
        <a href="#"> ${list} </a>
      {{/for }}
      
###### {{ log }}
console.log日志输出，可以用来调试。

        <a href="#"> {{log '123'}} </a>
      
