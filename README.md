## 简要
fastpl 是一个高效、轻量的Javascript模板引擎，能快速上手，语法简洁、性能卓越、支持预编译，支持所有主流的浏览器。
* 速度快，对比几个主流模板引擎，速度优秀
* 体积小，压缩后只有4kb不到
* 语法简洁，宽松写法减少错误，提供很多简洁的语法糖
* 入门快，与主流js、node和后端smarty等模板引擎语法接近，上手简单
* 自定义函数，提供方便的格式化函数，可添加自定义函数

## 快速使用
> 数据
```js
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
```      
> 模板语法
```js
      <script type="text/tmpl" id="test">
        {{ if showList }}
          {{for list}}
            <a href="#"> ${ v } </a>
          {{/for}}
          <span>${ dataTime }</span>
        {{/if }}
      </script>
```      
> 渲染模板
```js
      var tpl = fasTpl( document.getElementById( 'test' ).innerHTML ),
          html = tpl.render( data );
      // 快捷写法
      // var html = fasTpl( document.getElementById( 'test' ).innerHTML, data );
```      
## 语法详解
语法四种写法，方便区分逻辑和变量。

      逻辑语法：{{ }}
      变量名语法：${}
      变量值不转义语法：${=}
      注释语法：<!-- -->

> 修改默认语法
```js
      fasTpl.tags = {
        langOpen: '{{',
        langClose: '}}',
        varOpen: '\\${',
        varClose: '}',
        commentOpen: '<!--',
        commentClose: '-->'
      }
```    
#### 变量 ${ }
变量语法，用来输出变量，提供`逻辑语法`和`自定义方法`。
```js
      <p>${ dateTimes || '不存在dateTimes' }</p>
      <p>${ dateTimes ? 存在dateTimes : '不存在dateTimes' }</p>
```      
下面是3个默认提供格式化方法。
```js
      <p>${ dateTime| date_format:'yyyy-MM-dd' }</p>
      <p>${ person|count }</p>
      <p>${ number|number_format }</p>
```  
 结果：
```js
      2014-12-01
      2
      12,345,678
```      
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

__fastpl.tools( string|object, [callback] );__
```js
      fastpl.tools( 'toString', function( val, args ){ 
            return String( val ).toString();
      })
      // 或者
      fastpl.tools({
            'toString': function( val, args ){ 
                  return String( val ).toString();
            }
      })
 ```     
获取全部自定义方法
__fastpl.getTools();__

#### 变量 ${= }
如果不想html转义输出数据，使用`${= }`

#### 注释 <!-- -->
注释中的语句将不会渲染，和html原生注释用法一样。

      <!-- <span>${ dateTime|'yyyy-MM-dd' }</span> -->

##### 逻辑语法 
下面是逻辑语法

###### {{ if }}
{{if}}在php smarty模板中会冲突，所以可以修改`fasTpl.tags`
```js
      {{ if showList != true }}
        <a href="#"></a>
      {{else if showList == true }}
        <a href="#"></a>
      {{else}}
        a href="#"></a>
      {{/if }}
```      
###### {{ for }}
1.0版默认值已废弃是 ~~$value~~ 和 ~~$index~~ （为了兼容后端模板）。  
2.0版默认值 `v` 和 `i` ，分别是值和索引。  
访问数据全局变量可使用`_data`。
```js
      {{ for list }}
        <a href="${v}"> ${i} </a>
      {{/for }}
```      
自定义变量名
```js
      {{ for list(v,i) }}
        <a href="${v}"> ${i} </a>
      {{/for }}
```      
自定义循环，list现在是索引值，循环显示结果为0-999值。
```js
      {{ for list(0,1000) }}
        <a href="#"> ${list} </a>
      {{/for }}
```      
###### {{ var }}
申明一个或多个变量。
```js
	{{var i = 10}}
	{{for (1,i) }}
		<a href="#"> ${ i }  </a>
	{{/for}}
```
###### {{ log }}
console.log日志输出，可以用来调试。
```js
        <a href="#"> {{log '123'}} </a>
```      
