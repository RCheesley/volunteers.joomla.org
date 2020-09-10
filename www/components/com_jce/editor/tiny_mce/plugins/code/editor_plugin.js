/* jce - 2.8.17 | 2020-08-27 | https://www.joomlacontenteditor.net | Copyright (C) 2006 - 2020 Ryan Demmer. All rights reserved | GNU/GPL Version 2 or later - http://www.gnu.org/licenses/gpl-2.0.html */
!function(){function clean(s){return s=s.replace(/^(\/\/ <!\[CDATA\[)/gi,""),s=s.replace(/(\n\/\/ \]\]>)$/g,""),s=s.replace(/^(<!--\n)/g,""),s=s.replace(/(\n-->)$/g,"")}var each=tinymce.each,JSON=tinymce.util.JSON,Node=tinymce.html.Node,VK=(tinymce.html.Entities,tinymce.VK),BACKSPACE=VK.BACKSPACE,DELETE=VK.DELETE;tinymce.create("tinymce.plugins.CodePlugin",{init:function(ed,url){function isCode(n){return ed.dom.is(n,'.mce-item-script, .mce-item-style, .mce-item-php, .mcePhp, style[data-mce-type="text/css"]')}function processShortcode(html){return html.length<4?html:html.replace(/(?:<(?:pre|code|samp)[^>]*>)?(?:\{|\[)([\w-]+)\b([^(\}\])]*?)(?:\}|\])(?:([\s\S]+?)(?:\{|\])\/\1(?:\}|\]))?/g,function(match,tag,attribs,content){if("{"!==match.charAt(0)&&"["!==match.charAt(0))return match;var start=match.charAt(0),end="["==start?"]":"}";if("["==start&&!content)return match;var data=start+tag+attribs+end;return content&&(/</.test(content)&&(content=ed.dom.encode(content)),data+=content,data+=start+"/"+tag+end),'<pre data-mce-shortcode="1">'+data+"</pre>"})}var self=this;this.editor=ed,this.url=url,ed.onNodeChange.add(function(ed,cm,n,co){ed.dom.removeClass(ed.dom.select(".mce-item-selected"),"mce-item-selected"),isCode(n)&&ed.dom.addClass(n,"mce-item-selected")}),ed.onKeyDown.add(function(ed,e){e.keyCode!==BACKSPACE&&e.keyCode!==DELETE||self._removeCode(e)}),ed.onPreInit.add(function(){ed.settings.content_css!==!1&&ed.dom.loadCSS(url+"/css/content.css"),ed.getParam("code_script")&&(ed.settings.allow_script_urls=!0),ed.parser.addNodeFilter("script,style",function(nodes){for(var i=0,len=nodes.length;i<len;i++)self._serializeSpan(nodes[i])}),ed.parser.addNodeFilter("noscript",function(nodes){for(var i=0,len=nodes.length;i<len;i++)self._serializeNoScript(nodes[i])}),ed.settings.code_protect_shortcode&&ed.selection.onBeforeSetContent.add(function(ed,o){o.content=processShortcode(o.content)}),ed.serializer.addNodeFilter("div,span,pre,img",function(nodes,name,args){for(var i=0,len=nodes.length;i<len;i++){var node=nodes[i],cls=node.attr("class");"span"!=name&&"img"!==name||!/mce-item-script/.test(cls)||self._buildScript(node),"span"!=name&&"img"!==name||!/mce-item-style/.test(cls)||self._buildStyle(node),"div"==name&&"noscript"==node.attr("data-mce-type")&&self._buildNoScript(node)}}),ed.serializer.addAttributeFilter("data-mce-shortcode",function(nodes,name){for(var node,i=nodes.length;i--;)node=nodes[i],node.unwrap()}),ed.plugins.clipboard&&ed.onPastePreProcess.add(function(ed,o){ed.settings.preformat_code_on_paste&&(o.content=o.content.replace(/<(script|style)([^>]+)>([\s\S]+?)<\/\1>/gi,function(a,b){return a=a.replace(/<br\/?>/gi,"\n"),"<pre>"+ed.dom.encode(a)+"</pre>"}),o.content=o.content.replace(/<\?(php)?([\s\S]+?)\?>/gi,function(a,b,c){return a=a.replace(/<br\/?>/gi,"\n"),"<pre>"+ed.dom.encode(a)+"</pre>"}))})}),ed.onInit.add(function(){ed.theme&&ed.theme.onResolveName&&ed.theme.onResolveName.add(function(theme,o){var node=o.node,cls=node.className,name=node.nodeName;"SPAN"===name&&(/mce-item-script/.test(cls)&&(o.name="script"),/mce-item-style/.test(cls)&&(o.name="style"),/mce(-item-php|Php)/.test(cls)&&(o.name="php")),node.getAttribute("data-mce-shortcode")&&(o.name="shortcode")}),ed.settings.code_protect_shortcode&&(ed.settings.br_in_pre=!1)}),ed.onBeforeSetContent.add(function(ed,o){if(ed.settings.code_protect_shortcode&&(o.content=processShortcode(o.content)),/<(\?|script|style)/.test(o.content)){if(ed.getParam("code_script")||(o.content=o.content.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi,"")),ed.getParam("code_style")||(o.content=o.content.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi,"")),ed.getParam("code_php")||(o.content=o.content.replace(/<\?(php)?([\s\S]*?)\?>/gi,"")),o.source)return;o.content=o.content.replace(/\="([^"]+?)"/g,function(a,b){return b=b.replace(/<\?(php)?(.+?)\?>/gi,function(x,y,z){return"{php:start}"+ed.dom.encode(z)+"{php:end}"}),'="'+b+'"'}),/<textarea/.test(o.content)&&(o.content=o.content.replace(/<textarea([^>]*)>([\s\S]*?)<\/textarea>/gi,function(a,b,c){return c=c.replace(/<\?(php)?(.+?)\?>/gi,function(x,y,z){return"{php:start}"+ed.dom.encode(z)+"{php:end}"}),"<textarea"+b+">"+c+"</textarea>"})),o.content=o.content.replace(/<([^>]+)<\?(php)?(.+?)\?>([^>]*?)>/gi,function(a,b,c,d,e){return" "!==b.charAt(b.length)&&(b+=" "),"<"+b+'data-mce-php="'+d+'" '+e+">"}),o.content=o.content.replace(/<\?(php)?([\s\S]+?)\?>/gi,'<span class="mcePhp" data-mce-type="php"><!--$2--> </span>'),o.content=o.content.replace(/<script([^>]+)><\/script>/gi,"<script$1> </script>"),o.content=o.content.replace(/<(script|style)([^>]*)>/gi,function(a,b,c){if(c.indexOf("data-mce-type")===-1)if(c.indexOf("type")===-1){var type="script"===b?"javascript":"css";c+=' data-mce-type="text/'+type+'"'}else c=c.replace(/type="([^"]+)"/i,'data-mce-type="$1"');return"<"+b+c+">"})}}),ed.onPostProcess.add(function(ed,o){o.get&&!o.source&&(/(mce-item-php|mcePhp|data-mce-php|\{php:start\})/.test(o.content)&&(o.content=o.content.replace(/\{php:\s?start\}([^\{]+)\{php:\s?end\}/g,function(a,b){return"<?php"+ed.dom.decode(b)+"?>"}),o.content=o.content.replace(/<textarea([^>]*)>([\s\S]*?)<\/textarea>/gi,function(a,b,c){return/&lt;\?php/.test(c)&&(c=ed.dom.decode(c)),"<textarea"+b+">"+c+"</textarea>"}),o.content=o.content.replace(/data-mce-php="([^"]+?)"/g,function(a,b){return"<?php"+ed.dom.decode(b)+"?>"}),o.content=o.content.replace(/<span class="mcePhp"><!--([\s\S]*?)-->(&nbsp;|\u00a0)?<\/span>/g,function(a,b,c){return"<?php"+ed.dom.decode(b)+"?>"})),o.content=o.content.replace(/<(script|style)([^>]*)>/gi,function(a,b,c){return c=c.replace(/\s?data-mce-type="[^"]+"/gi,""),"<"+b+c+">"}))})},_removeCode:function(e){var ed=this.editor,s=ed.selection,n=s.getNode();ed.dom.is(n,'.mce-item-script, .mce-item-style, .mce-item-php, .mce-item-php, style[data-mce-type="text/css"]')&&(ed.undoManager.add(),ed.dom.remove(n),e&&e.preventDefault())},_buildScript:function(n){var v,node,text,p;this.editor;if(n.parent){var code=n.attr("data-mce-code")||"";return code&&(v=unescape(code)),p=JSON.parse(n.attr("data-mce-json"))||{},p.type=n.attr("data-mce-type")||p.type||"text/javascript",node=new Node("script",1),v&&(v=tinymce.trim(v),v&&(text=new Node("#text",3),text.raw=!0,"text/javascript"===p.type&&(v=clean(tinymce.trim(v))),text.value=v,node.append(text))),each(p,function(v,k){"type"===k&&(v=v.replace(/mce-/,"")),node.attr(k,v)}),node.attr("data-mce-type",p.type),n.replace(node),!0}},_buildStyle:function(n){var v,node,text,p;this.editor;if(n.parent){var code=n.attr("data-mce-code")||"";return code&&(v=unescape(code)),p=JSON.parse(n.attr("data-mce-json"))||{},p.type||(p.type="text/css"),node=new Node("style",1),v&&(v=tinymce.trim(v),v&&(text=new Node("#text",3),text.raw=!0,v=clean(tinymce.trim(v)),text.value=v,node.append(text))),each(p,function(v,k){"type"===k&&(v=v.replace(/mce-/,"")),node.attr(k,v)}),node.attr("data-mce-type",p.type),n.replace(node),!0}},_buildNoScript:function(n){var p,node;this.editor;if(n.parent)return p=JSON.parse(n.attr("data-mce-json"))||{},node=new Node("noscript",1),each(p,function(v,k){node.attr(k,v)}),n.wrap(node),n.unwrap(),!0},_serializeSpan:function(n){var v,p=(this.editor,{});if(n.parent){each(n.attributes,function(at){"type"!==at.name&&at.name.indexOf("data-mce-")===-1&&(p[at.name]=at.value)});var img=new Node("img",1);img.attr("src","data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"),img.attr("class","mce-item-"+n.name),img.attr("data-mce-resize","false"),img.attr("data-mce-json",JSON.serialize(p)),img.attr("data-mce-type",n.attr("data-mce-type")||p.type),v=n.firstChild?n.firstChild.value:"",v.length&&img.attr("data-mce-code",escape(clean(v))),n.replace(img)}},_serializeNoScript:function(n){var ed=this.editor,p=(ed.dom,{});if(n.parent){each(n.attributes,function(at){"type"!=at.name&&(p[at.name]=at.value)});var div=new Node("div",1);div.attr("data-mce-json",JSON.serialize(p)),div.attr("data-mce-type",n.name),n.wrap(div),n.unwrap()}}}),tinymce.PluginManager.add("code",tinymce.plugins.CodePlugin)}();