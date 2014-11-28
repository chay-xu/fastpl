## 简要
fastpl 是一个高效、轻量的Javascript模板引擎，性能卓越、支持预编译、语法简洁，支持所有流行的浏览器。

## 使用方法
> 数据

      var data = {
      	list: ["js", "html", "css"],
      	showList: true
      }
      
> 模板语法

      <script type="text/tmpl" id="test">
        {{ if showList }}
          {{for list}}
            <a href="#"> ${ _value } </a>
          {{/for}}
        {{/if }}
      </script>
      
> 渲染模板

      var tpl = fasTpl( document.getElementById( 'test' ).innerHTML ),
          html = tpl.render( data );
      // 快捷写法
      // var html = fasTpl( document.getElementById( 'test' ).innerHTML, data );
      
## API
##### 语法

      逻辑语法：{{ }}
      变量名语法：${}
      html不转义语法：$${}
      
##### {{ if }}

      {{ if showList != true }}
        <a href="#"></a>
      {{else if showList == true }}
        <a href="#"></a>
      {{else}}
        a href="#"></a>
      {{/if }}
      
##### {{ for }}
默认值2个值_value和_index，分别是值和索引。

      {{ for list }}
        <a href="${_value}"> ${_index} </a>
      {{/for }}
      
自定义变量名

      {{ for list(v,i) }}
        <a href="${v}"> ${i} </a>
      {{/for }}
      
自定义循环，list现在是索引值，循环显示结果为0-999值。

      {{ for list(0,1000) }}
        <a href="#"> ${name} </a>
      {{/for }}
      
##### {{ log }}
console.log日志输出，可以用来调试。

        <a href="#"> {{log '123'}} </a>
      