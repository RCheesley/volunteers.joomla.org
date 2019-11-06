/* jce - 2.7.19 | 2019-10-25 | https://www.joomlacontenteditor.net | Copyright (C) 2006 - 2019 Ryan Demmer. All rights reserved | GNU/GPL Version 2 or later - http://www.gnu.org/licenses/gpl-2.0.html */
!function(){var AutoLinkPattern=/^(https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.|(?:mailto:)?[A-Z0-9._%+\-]+@)(.+)$/i;tinymce.create("tinymce.plugins.AutolinkPlugin",{init:function(ed,url){var t=this;(ed.getParam("autolink_url",!0)||ed.getParam("autolink_email",!0))&&(ed.settings.autolink_pattern&&(AutoLinkPattern=ed.settings.autolink_pattern),ed.onAutoLink=new tinymce.util.Dispatcher(this),ed.onKeyDown.addToTop(function(ed,e){if(13==e.keyCode)return t.handleEnter(ed)}),tinyMCE.isIE||(ed.onKeyPress.add(function(ed,e){if(41==e.which)return t.handleEclipse(ed)}),ed.onKeyUp.add(function(ed,e){if(32==e.keyCode)return t.handleSpacebar(ed)})))},handleEclipse:function(ed){this.parseCurrentLine(ed,-1,"(",!0)},handleSpacebar:function(ed){this.parseCurrentLine(ed,0,"",!0)},handleEnter:function(ed){this.parseCurrentLine(ed,-1,"",!1)},parseCurrentLine:function(editor,endOffset,delimiter){function scopeIndex(container,index){if(index<0&&(index=0),3==container.nodeType){var len=container.data.length;index>len&&(index=len)}return index}function setStart(container,offset){1!=container.nodeType||container.hasChildNodes()?rng.setStart(container,scopeIndex(container,offset)):rng.setStartBefore(container)}function setEnd(container,offset){1!=container.nodeType||container.hasChildNodes()?rng.setEnd(container,scopeIndex(container,offset)):rng.setEndAfter(container)}var rng,end,start,endContainer,bookmark,text,matches,prev,len,rngText;if("A"!=editor.selection.getNode().tagName){if(rng=editor.selection.getRng(!0).cloneRange(),rng.startOffset<5){if(prev=rng.endContainer.previousSibling,!prev){if(!rng.endContainer.firstChild||!rng.endContainer.firstChild.nextSibling)return;prev=rng.endContainer.firstChild.nextSibling}if(len=prev.length,setStart(prev,len),setEnd(prev,len),rng.endOffset<5)return;end=rng.endOffset,endContainer=prev}else{if(endContainer=rng.endContainer,3!=endContainer.nodeType&&endContainer.firstChild){for(;3!=endContainer.nodeType&&endContainer.firstChild;)endContainer=endContainer.firstChild;3==endContainer.nodeType&&(setStart(endContainer,0),setEnd(endContainer,endContainer.nodeValue.length))}end=1==rng.endOffset?2:rng.endOffset-1-endOffset}start=end;do setStart(endContainer,end>=2?end-2:0),setEnd(endContainer,end>=1?end-1:0),end-=1,rngText=rng.toString();while(" "!=rngText&&""!==rngText&&160!=rngText.charCodeAt(0)&&end-2>=0&&rngText!=delimiter);if(rng.toString()==delimiter||160==rng.toString().charCodeAt(0)?(setStart(endContainer,end),setEnd(endContainer,start),end+=1):0===rng.startOffset?(setStart(endContainer,0),setEnd(endContainer,start)):(setStart(endContainer,end),setEnd(endContainer,start)),text=rng.toString(),"."==text.charAt(text.length-1)&&setEnd(endContainer,start-1),text=rng.toString(),matches=text.match(AutoLinkPattern)){if("www."==matches[1]?matches[1]="https://www.":/@$/.test(matches[1])&&!/^mailto:/.test(matches[1])&&(matches[1]="mailto:"+matches[1]),matches[1].indexOf("http")!==-1&&!editor.getParam("autolink_url",!0))return;if(matches[1].indexOf("mailto:")!==-1&&!editor.getParam("autolink_email",!0))return;bookmark=editor.selection.getBookmark(),editor.selection.setRng(rng),editor.execCommand("createlink",!1,matches[1]+matches[2]);var node=editor.selection.getNode();editor.settings.default_link_target&&editor.dom.setAttrib(node,"target",editor.settings.default_link_target),editor.onAutoLink.dispatch(editor,{node:node}),editor.selection.moveToBookmark(bookmark),editor.nodeChanged()}}},getInfo:function(){return{longname:"Autolink",author:"Moxiecode Systems AB",authorurl:"http://tinymce.moxiecode.com",infourl:"http://wiki.moxiecode.com/index.php/TinyMCE:Plugins/autolink",version:tinymce.majorVersion+"."+tinymce.minorVersion}}}),tinymce.PluginManager.add("autolink",tinymce.plugins.AutolinkPlugin)}();