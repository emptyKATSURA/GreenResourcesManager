import{d as P,r as F,w as Z,c,F as N,a as L,n as D,o as r,b as e,t as w,e as T,f as U,g as u,h as R,i as q,j as f,k as l,u as E,l as G,m as H,p as Ce,q as xe,s as z,v as K,x as Se,y as je,z as Te,T as Pe,A as X,B as Fe,C as Ie}from"./vue-vendor-J7O7Mwui.js";import{P as le}from"./prism-vendor-CztPJKWv.js";(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))t(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const p of i.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&t(p)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function t(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const Ae=["onMouseenter","onMouseleave"],De=["onClick","title"],Ee={key:0,class:"fun-menu-icon"},Be={key:1,class:"fun-menu-text"},Oe=["onClick"],qe=["onClick","title"],Ge={key:0,class:"fun-menu-icon"},Me={key:1,class:"fun-menu-text"},Ve=["onClick"],Re=["onClick"],Ne={class:"fun-menu-item fun-menu-item-child fun-menu-item-grandchild"},Ue={key:0,class:"fun-menu-icon"},Le={class:"fun-menu-text"},ze=["onClick","title"],Ze={key:0,class:"fun-menu-icon"},Je={key:1,class:"fun-menu-text"},He=["onClick","title"],Ke={key:0,class:"fun-menu-icon"},We={key:1,class:"fun-menu-text"},Qe=P({__name:"FunMenu",props:{items:{default:()=>[]},activeKey:{},activeId:{},defaultExpandedKeys:{default:()=>[]},isItemActiveFn:{},collapsed:{type:Boolean,default:!1}},emits:["item-click","update:expandedKeys"],setup(n,{emit:s}){const a=n,t=s,o=F(new Set(a.defaultExpandedKeys)),i=m=>{const v=m.id||m.key;return v?o.value.has(v):!1},p=m=>{const v=m.id||m.key;v&&(o.value.has(v)?o.value.delete(v):o.value.add(v),t("update:expandedKeys",Array.from(o.value)))},x=m=>{if(m.isActive)return m.isActive(m);if(a.isItemActiveFn)return a.isItemActiveFn(m);const v=m.id||m.key;return v&&(a.activeKey===v||a.activeId===v)?!0:m.children&&m.children.length>0?m.children.some(y=>x(y)):!1},_=m=>{m.children&&m.children.length>0&&p(m),t("item-click",m)},k=F(null),g=(m,v)=>{if(v){k.value=m;const y=m.id||m.key;y&&!o.value.has(y)&&p(m)}else k.value=null};return Z(()=>a.activeKey,m=>{if(!m)return;const v=y=>{for(const h of y)if(h.children){if(h.children.some(C=>(C.id||C.key)===m)){const C=h.id||h.key;return C&&(o.value.add(C),t("update:expandedKeys",Array.from(o.value))),!0}if(v(h.children)){const C=h.id||h.key;return C&&(o.value.add(C),t("update:expandedKeys",Array.from(o.value))),!0}}return!1};v(a.items)},{immediate:!0}),(m,v)=>(r(),c("ul",{class:D(["fun-menu",{collapsed:n.collapsed}])},[(r(!0),c(N,null,L(n.items,y=>(r(),c("li",{key:y.id||y.key,class:D(["fun-menu-item-wrapper",{"has-children":y.children&&y.children.length>0}])},[y.children&&y.children.length>0?(r(),c(N,{key:0},[e("div",{class:D(["fun-menu-item",{active:x(y),expanded:i(y)}]),onMouseenter:h=>n.collapsed&&y.children?g(y,!0):null,onMouseleave:h=>n.collapsed&&y.children?g(y,!1):null},[e("div",{class:"fun-menu-item-content",onClick:h=>_(y),title:n.collapsed?y.label||y.text||y.name:""},[y.icon?(r(),c("span",Ee,w(y.icon),1)):T("",!0),n.collapsed?T("",!0):(r(),c("span",Be,w(y.label||y.text||y.name),1))],8,De),y.children&&y.children.length>0&&!n.collapsed?(r(),c("span",{key:0,class:D(["fun-menu-arrow",{expanded:i(y)}]),onClick:U(h=>p(y),["stop"])}," ▶ ",10,Oe)):T("",!0)],42,Ae),!n.collapsed||n.collapsed&&i(y)?(r(),c("ul",{key:0,class:D(["fun-menu-submenu",{expanded:i(y),"collapsed-mode":n.collapsed}])},[(r(!0),c(N,null,L(y.children,h=>(r(),c("li",{key:h.id||h.key,class:D(["fun-menu-submenu-item",{active:x(h)}])},[h.children&&h.children.length>0?(r(),c(N,{key:0},[e("div",{class:D(["fun-menu-item fun-menu-item-child",{active:x(h),expanded:i(h),"collapsed-mode":n.collapsed}])},[e("div",{class:"fun-menu-item-content",onClick:d=>_(h),title:n.collapsed?h.label||h.text||h.name:""},[h.icon?(r(),c("span",Ge,w(h.icon),1)):T("",!0),n.collapsed?T("",!0):(r(),c("span",Me,w(h.label||h.text||h.name),1))],8,qe),n.collapsed?T("",!0):(r(),c("span",{key:0,class:D(["fun-menu-arrow",{expanded:i(h)}]),onClick:U(d=>p(h),["stop"])}," ▶ ",10,Ve))],2),n.collapsed?T("",!0):(r(),c("ul",{key:0,class:D(["fun-menu-submenu fun-menu-submenu-nested",{expanded:i(h)}])},[(r(!0),c(N,null,L(h.children,d=>(r(),c("li",{key:d.id||d.key,class:D(["fun-menu-submenu-item",{active:x(d)}]),onClick:C=>_(d)},[e("div",Ne,[d.icon?(r(),c("span",Ue,w(d.icon),1)):T("",!0),e("span",Le,w(d.label||d.text||d.name),1)])],10,Re))),128))],2))],64)):(r(),c("div",{key:1,class:D(["fun-menu-item fun-menu-item-child",{"collapsed-mode":n.collapsed}]),onClick:d=>_(h),title:n.collapsed?h.label||h.text||h.name:""},[h.icon?(r(),c("span",Ze,w(h.icon),1)):T("",!0),n.collapsed?T("",!0):(r(),c("span",Je,w(h.label||h.text||h.name),1))],10,ze))],2))),128))],2)):T("",!0)],64)):(r(),c("div",{key:1,class:D(["fun-menu-item",{active:x(y)}]),onClick:h=>_(y),title:n.collapsed?y.label||y.text||y.name:""},[y.icon?(r(),c("span",Ke,w(y.icon),1)):T("",!0),n.collapsed?T("",!0):(r(),c("span",We,w(y.label||y.text||y.name),1))],10,He))],2))),128))],2))}}),A=(n,s)=>{const a=n.__vccOpts||n;for(const[t,o]of s)a[t]=o;return a},_e=A(Qe,[["__scopeId","data-v-c7b2a080"]]),Ye={class:"sidebar-header"},Xe={key:0},et=["title"],tt={class:"sidebar-nav"},nt=P({__name:"HelpSidebar",props:{activeSection:{}},emits:["section-change"],setup(n,{emit:s}){const a=n,t=s,o=F(!1),i=()=>{o.value=!o.value},p=[{id:"user-manual",icon:"📖",label:"用户手册",children:[{id:"intro",icon:"🏠",label:"简介"},{id:"general",icon:"🛠️",label:"通用管理"},{id:"game",icon:"🎮",label:"游戏管理"},{id:"image",icon:"🖼️",label:"图片管理"},{id:"video",icon:"🎬",label:"视频管理"},{id:"novel",icon:"📚",label:"小说管理"},{id:"website",icon:"🌐",label:"网站收藏"},{id:"audio",icon:"🎵",label:"音频管理"},{id:"faq",icon:"❓",label:"常见问题"}]},{id:"api",icon:"🔌",label:"API 手册",children:[{id:"api-games",icon:"🎮",label:"游戏"},{id:"api-manga",icon:"📚",label:"漫画"},{id:"api-videos",icon:"🎬",label:"视频"},{id:"api-novels",icon:"📖",label:"小说"},{id:"api-websites",icon:"🌐",label:"网站"},{id:"api-audio",icon:"🎵",label:"音频"}]},{id:"workshop",icon:"🎨",label:"创意工坊手册"},{id:"support",icon:"💬",label:"客服&问题反馈"},{id:"about",icon:"ℹ️",label:"关于我们"}],x=k=>k.id==="user-manual"&&k.children?k.children.some(g=>a.activeSection===g.id):k.id==="api"&&k.children?a.activeSection==="api"||a.activeSection==="api-games"||a.activeSection==="api-manga"||a.activeSection==="api-videos"||a.activeSection==="api-novels"||a.activeSection==="api-websites"||a.activeSection==="api-audio"||k.children.some(g=>a.activeSection===g.id):a.activeSection===k.id,_=k=>{k.id&&k.id!=="user-manual"&&t("section-change",k.id)};return(k,g)=>(r(),c("div",{class:D(["help-sidebar",{collapsed:o.value}])},[e("div",Ye,[o.value?T("",!0):(r(),c("h2",Xe,"📚 帮助中心")),e("button",{class:"collapse-toggle",onClick:i,title:o.value?"展开菜单":"收起菜单"},w(o.value?"→":"←"),9,et)]),e("nav",tt,[u(_e,{items:p,"active-key":n.activeSection,"default-expanded-keys":["user-manual"],"is-item-active-fn":x,collapsed:o.value,onItemClick:_},null,8,["active-key","collapsed"])])],2))}}),lt=A(nt,[["__scopeId","data-v-efc45405"]]),st={name:"HelpSection",props:{title:{type:String,required:!0},subtitle:{type:String,default:""},intro:{type:String,default:""}}},ot={class:"content-section"},at={class:"section-header"},it=["innerHTML"],ut={class:"section-subtitle"},rt={key:0,class:"module-intro"},dt={class:"module-detail"};function ct(n,s,a,t,o,i){return r(),c("section",ot,[e("div",at,[e("h1",{innerHTML:a.title},null,8,it),e("p",ut,w(a.subtitle),1)]),a.intro?(r(),c("p",rt,w(a.intro),1)):T("",!0),e("div",dt,[R(n.$slots,"default",{},void 0)])])}const M=A(st,[["render",ct],["__scopeId","data-v-c88002aa"]]),pt={name:"DetailCard",props:{title:{type:String,default:""}}},ft={class:"detail-card"},mt={key:0},gt={class:"detail-content"};function vt(n,s,a,t,o,i){return r(),c("div",ft,[a.title?(r(),c("h3",mt,w(a.title),1)):T("",!0),e("div",gt,[R(n.$slots,"default",{},void 0)])])}const $=A(pt,[["render",vt],["__scopeId","data-v-708bc82f"]]),J={owner:"klsdf",name:"GreenResourcesManager",url:"https://github.com/klsdf/GreenResourcesManager",releasesUrl:"https://github.com/klsdf/GreenResourcesManager/releases",latestReleaseUrl:"https://github.com/klsdf/GreenResourcesManager/releases/latest",issuesUrl:"https://github.com/klsdf/GreenResourcesManager/issues",cloneUrl:"https://github.com/klsdf/GreenResourcesManager.git"};function ee(){async function n(a){try{if(window.electronAPI&&window.electronAPI.openExternal){const t=await window.electronAPI.openExternal(a);t.success||(console.error("打开外部链接失败:",t.error),window.open(a,"_blank"))}else window.open(a,"_blank")}catch(t){console.error("打开外部链接出错:",t),window.open(a,"_blank")}}async function s(a){try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(a),console.log("已复制到剪贴板:",a);else{const t=document.createElement("textarea");t.value=a,t.style.position="fixed",t.style.opacity="0",document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t),console.log("已复制到剪贴板:",a)}}catch(t){console.error("复制到剪贴板失败:",t)}}return{openExternalLink:n,copyToClipboard:s}}const yt={class:"intro-content"},bt={style:{"margin-top":"15px",color:"var(--text-secondary)","font-size":"0.9rem"}},ht={class:"project-links"},kt={class:"contact-methods"},$t={class:"contact-method"},wt={class:"contact-details"},xt={class:"contact-method"},_t={class:"contact-details"},Ct=P({__name:"IntroSection",setup(n){const{openExternalLink:s}=ee();return(a,t)=>(r(),q(M,{title:"🏠 关于GreenResourcesManager<br/>（绿色资源管理器）",subtitle:"您的个人多媒体资源管理器"},{default:f(()=>[e("div",yt,[u($,{title:"🎯 项目简介"},{default:f(()=>[...t[5]||(t[5]=[e("p",null,"GreenResourcesManager（绿色资源管理器） 是一个专为仓鼠症用户设计的绿色多媒体资源管理器。它非常善于帮助您管理大量且类型丰富复杂的媒体文件，包括游戏、图片、视频、小说、网站和音频文件。您不用再依赖于windows本地的原生管理方式，而是可以享受更加自由和便捷的管理体验。 ",-1)])]),_:1}),u($,{title:"📖 开发背景"},{default:f(()=>[...t[6]||(t[6]=[e("p",null,'Green Resources Manager 是一款专为"仓鼠症"用户设计的全能多媒体资源管理器。随着存储成本的降低，个人拥有大容量存储已成为可能，但管理海量资源的难度也随之增加。当资源超过 10TB 后，无论是按种类还是按常用程度分类，都难以满足需求。',-1),e("p",{style:{"margin-top":"15px"}},[e("strong",null,"Green Resources Manager 应运而生"),l("，提供统一界面管理游戏、漫画、视频、音频、小说、网站等各类多媒体资源，让资源管理变得优雅而高效。")],-1)])]),_:1}),u($,{title:"🎯 目标用户"},{default:f(()=>[...t[7]||(t[7]=[e("ul",null,[e("li",null,"拥有强烈仓鼠症的用户"),e("li",null,"希望以更优雅方式管理软件和媒体的用户")],-1)])]),_:1}),u($,{title:"✨ 核心特性"},{default:f(()=>[...t[8]||(t[8]=[e("ul",null,[e("li",null,[e("strong",null,"完全本地、绝对隐私："),l("所有数据保存在本地，绝不联网（至少现在是这样）。")]),e("li",null,[e("strong",null,"类Steam的应用管理："),l("可以为所有EXE文件提供时长记录、截图功能。")]),e("li",null,[e("strong",null,"信息记录狂魔："),l("自动记录各种数据，包括游戏时长、游戏运行次数、第一次运行时间、上一次运行时间等。并且会自动整理日报、周报，为您提供全方位的信息记录。")]),e("li",null,[e("strong",null,"tag索引系统："),l("管理器会自动收集所有资源的tag，并显示到不同资源的左侧导航栏，可以通过点击TAG的方式超快速索引所需的资源，再也不用纠结把资源放到哪个文件夹了")]),e("li",null,[e("strong",null,"多种资源支持："),l("不同于steam单一的游戏管理逻辑，本管理器不仅可以管理应用还支持漫画、视频、音频、小说、网站等多种资源的管理。")])],-1)])]),_:1}),u($,{title:"🛠️ 技术栈"},{default:f(()=>[...t[9]||(t[9]=[e("div",{class:"tech-stack"},[e("span",{class:"tech-tag"},"Vue.js 3"),e("span",{class:"tech-tag"},"Electron"),e("span",{class:"tech-tag"},"Vite"),e("span",{class:"tech-tag"},"Node.js"),e("span",{class:"tech-tag"},"TypeScript"),e("span",{class:"tech-tag"},"SASS"),e("span",{class:"tech-tag"},"PDF.js"),e("span",{class:"tech-tag"},"EPUB.js")],-1)])]),_:1}),u($,{title:"📜 开源协议"},{default:f(()=>[t[11]||(t[11]=e("p",null,[l("本项目采用 "),e("strong",null,"PolyForm Noncommercial License 1.0.0"),l(" 开源协议。")],-1)),t[12]||(t[12]=e("ul",null,[e("li",null,[e("strong",null,"非商业使用："),l("您可以自由使用、修改、分发本软件，但仅限于非商业用途")]),e("li",null,[e("strong",null,"商业使用："),l("如需用于商业目的，需要获得单独的商业许可证")]),e("li",null,[e("strong",null,"个人使用："),l("个人非商业用途完全免费，无需授权")]),e("li",null,[e("strong",null,"研究和教育："),l("用于研究、评估或教育目的的使用是被允许的")]),e("li",null,[e("strong",null,"修改和分发："),l("您可以修改源代码并分发，但必须保留原始版权声明和许可证")])],-1)),e("p",bt,[t[10]||(t[10]=l(" 完整协议内容请查看项目根目录的 LICENSE 文件，或访问 ",-1)),e("span",{onClick:t[0]||(t[0]=o=>E(s)("https://polyformproject.org/licenses/noncommercial/1.0.0/")),class:"external-link",style:{cursor:"pointer"}}," PolyForm Noncommercial License 1.0.0 ")])]),_:1}),u($,{title:"📂 项目地址"},{default:f(()=>[t[15]||(t[15]=l(" 我要star！我要star！star、star要要要~ ",-1)),e("div",ht,[e("div",{onClick:t[1]||(t[1]=o=>E(s)(E(J).cloneUrl)),class:"project-link"},[...t[13]||(t[13]=[e("span",{class:"link-icon"},"🐙",-1),e("span",{class:"link-text"},"GitHub 仓库",-1)])]),e("div",{onClick:t[2]||(t[2]=o=>E(s)(E(J).releasesUrl)),class:"project-link"},[...t[14]||(t[14]=[e("span",{class:"link-icon"},"📦",-1),e("span",{class:"link-text"},"下载最新版本",-1)])])])]),_:1}),u($,{title:"📧 联系方式兼客服中心（BuShi"},{default:f(()=>[e("div",kt,[e("div",$t,[t[18]||(t[18]=e("span",{class:"contact-icon"},"💬",-1)),e("div",wt,[t[16]||(t[16]=e("h4",null,"GitHub",-1)),t[17]||(t[17]=e("p",null,"可以去issues板块反馈技术问题",-1)),e("span",{onClick:t[3]||(t[3]=o=>E(s)(E(J).issuesUrl)),class:"external-link"},w(E(J).issuesUrl),1)])]),e("div",xt,[t[21]||(t[21]=e("span",{class:"contact-icon"},"💬",-1)),e("div",_t,[t[19]||(t[19]=e("h4",null,"QQ",-1)),t[20]||(t[20]=e("p",null,"吹水用，以及有什么建议可以在这里反馈",-1)),e("span",{onClick:t[4]||(t[4]=o=>E(s)("https://qm.qq.com/q/qD9za7lqOQ")),class:"external-link"}," 点击链接加入群聊【GreenResourcesManager客服群】：https://qm.qq.com/q/qD9za7lqOQ ")])])])]),_:1})])]),_:1}))}}),se=A(Ct,[["__scopeId","data-v-8a7ba43d"]]),oe=P({__name:"GeneralSection",setup(n){return(s,a)=>(r(),q(M,{title:"🛠️ 通用管理模块",subtitle:"不知道往哪里放的说明我都会放这里",intro:"通用管理模块是整个应用所通用的功能和特性。"},{default:f(()=>[u($,{title:"🎯 窗口管理"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,[e("strong",null,"全屏窗口："),l("F11")]),e("li",null,[e("strong",null,"最小化窗口："),l("Ctrl+M")]),e("li",null,[e("strong",null,"关闭窗口："),l("Ctrl+W")])],-1)])]),_:1}),u($,{title:"🎯 视图管理"},{default:f(()=>[...a[1]||(a[1]=[e("ul",null,[e("li",null,[e("strong",null,"重新加载："),l("Ctrl+R")]),e("li",null,[e("strong",null,"强制重新加载："),l("Ctrl+Shift+R")]),e("li",null,[e("strong",null,"开发者工具："),l("Ctrl+Shift+I")])],-1)])]),_:1}),u($,{title:"🎯 伪装模式"},{default:f(()=>[...a[2]||(a[2]=[l(" 伪装模式是一个非常使用的功能，打开这个模式后，所有资源的封面图 ",-1)])]),_:1}),u($,{title:"🎯 数据的存储"},{default:f(()=>[...a[3]||(a[3]=[e("ul",null,[e("li",null,[e("strong",null,"数据的存储位置："),l("默认在应用目录的 SaveData 文件夹中")]),e("li",null,[e("strong",null,"会存储哪些内容："),l("存档会自动保存添加的所有资源路径和信息。同时会自动复制封面图到文件夹中。游戏的截图也会保存到存档中")]),e("li",null,[e("strong",null,"如何更改存档位置："),l('如需更改存档位置，可以在设置中的"存档文件夹位置"中改为自定义目录，并设置自定义的文件夹路径。设置完毕后，如果文件夹里面没有SaveData，管理器会自动在这个目录下创建SaveData文件夹，并将现有存档的内容复制到这里。如果这个目录已经有SaveData 文件夹，会读取这个文件夹。')])],-1)])]),_:1}),u($,{title:"🎯 tag索引系统"},{default:f(()=>[...a[4]||(a[4]=[e("b",null,"这个功能是管理器最重要的核心功能。",-1),e("br",null,null,-1),e("ul",null,[e("li",null,[e("strong",null,"tag索引系统："),l("管理器会自动收集所有资源的tag，并显示到不同资源的左侧导航栏")]),e("li",null,[e("strong",null,"如何注册一个tag："),l('在添加资源时，可以为资源添加tag。tag可以是任意的字符串，比如"萝莉"、"萝莉"、"萝莉"和"萝莉"等。')]),e("li",null,[e("strong",null,"如何使用tag索引系统："),l("左键tag代表选择包含这个tag的资源。右键tag代表剔除这个tag的资源。")]),e("li",null,[e("strong",null,"tag的多选"),l('当点击多个tag时，默认使用"AND"运算。例如选择了白丝和萝莉两个tag，则代表选择同时包含白丝和萝莉的资源。')])],-1)])]),_:1})]),_:1}))}}),ae=P({__name:"GameSection",setup(n){return(s,a)=>(r(),q(M,{title:"🎮 游戏管理模块",subtitle:"实际上也可以管应用。我的unity和PS等软件就是用这个管的。还挺好用的",intro:"游戏管理模块是绿色资源管理器的核心功能之一。它实现了一套类似steam的软件管理系统。帮助您管理各种类型的游戏文件，并帮您获得游戏的附加信息。游玩时模块会自动记录您游戏的时长、运行次数、最后游玩时间等统计信息。并提供了一个功能强大的截图工具，让您在游戏中可以快速截图。"},{default:f(()=>[u($,{title:"🎯 添加游戏"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,[e("strong",null,"用按钮添加游戏："),l("在游戏页的上方有一个添加游戏的按钮，点击后会弹出添加游戏的对话框，您可以在这里添加游戏。添加游戏时，必须指定一个游戏exe文件。")]),e("li",null,[e("strong",null,"拖动添加游戏："),l("您可以拖动一个游戏exe文件到游戏页的上方，游戏会自动添加到游戏库中。")])],-1)])]),_:1}),u($,{title:"🎯 删除游戏"},{default:f(()=>[...a[1]||(a[1]=[l(" 删除游戏仅仅是值移除本管理器对游戏的引用，不会删除本地的游戏文件。 ",-1),e("ul",null,[e("li",null,[e("strong",null,"右键菜单删除游戏："),l("对游戏卡进行右键，可以看到删除的选项。")]),e("li",null,[e("strong",null,"详情页删除游戏："),l("在游戏的详情页内，可以看到删除游戏的选项。")])],-1)])]),_:1}),u($,{title:"🎯 修改游戏信息"},{default:f(()=>[...a[2]||(a[2]=[e("ul",null,[e("li",null,[e("strong",null,"右键菜单修改游戏信息："),l("对游戏卡进行右键，可以看到修改信息的选项。")]),e("li",null,[e("strong",null,"详情页修改游戏信息："),l("在游戏的详情页内，可以看到修改游戏信息的选项。")])],-1)])]),_:1}),u($,{title:"🎯 游戏文件丢失检测"},{default:f(()=>[...a[3]||(a[3]=[l(" 进入游戏页面时，会自动检测所有的游戏文件是否存在。如果不存在，则会在游戏卡的左上角显示一个警告标志。 游戏文件丢失不会导致数据丢失。所有的数据记录仍然会保存 ",-1)])]),_:1}),u($,{title:"🎯 应用内启动游戏"},{default:f(()=>[...a[4]||(a[4]=[e("ul",null,[e("li",null,"点击游戏卡的中央部位可以快速启动游戏"),e("li",null,"右键菜单可以快速启动游戏"),e("li",null,"详情页可以快速启动游戏")],-1)])]),_:1}),u($,{title:"🎯 游戏时长记录 🔥🔥"},{default:f(()=>[...a[5]||(a[5]=[l(" 通过APP内启动游戏时，会自动记录游戏时长。并且会每秒同步游戏的总时长。 ",-1)])]),_:1}),u($,{title:"🎯 其他游戏信息记录"},{default:f(()=>[...a[6]||(a[6]=[l(" 除了最为重要的游戏时长外，游戏还会记录以下数据：",-1),e("br",null,null,-1),l(" - 第一次注册该游戏的时间",-1),e("br",null,null,-1),l(" - 上一次运行该游戏的时间 ",-1)])]),_:1}),u($,{title:"🎯 游戏截图功能 🔥🔥"},{default:f(()=>[...a[7]||(a[7]=[e("ul",null,[e("li",null,"进入游戏后，按下ctrl+f12可以快速截图。截图键可以自定义"),e("li",null,"右键游戏卡， 可以从菜单中打开截图文件夹")],-1)])]),_:1})]),_:1}))}}),ie=P({__name:"ImageSection",setup(n){return(s,a)=>(r(),q(M,{title:"🖼️ 图片管理模块",subtitle:"我一般用来看漫画，主打一个方便",intro:"图片管理模块主要用于管理文件夹，比如漫画和套图等资源，不适合管理单一的图片。图片管理器最重要的功能是内置的漫画阅读器，可以直接在APP内快速地阅读漫画。"},{default:f(()=>[u($,{title:"🖼️ 图片文件夹的添加"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,"点击图片页的上方添加图片文件夹按钮，可以添加图片文件夹"),e("li",null,"拖动图片文件夹到图片页，可以添加图片文件夹")],-1)])]),_:1}),u($,{title:"🗑️ 删除图片文件夹"},{default:f(()=>[...a[1]||(a[1]=[e("ul",null,[e("li",null,"点击漫画卡，进入详情页后，点击删除漫画"),e("li",null,"右键图片文件夹，可以从菜单中删除图片文件夹")],-1)])]),_:1}),u($,{title:"🎯 内部和外部阅读器"},{default:f(()=>[...a[2]||(a[2]=[e("ul",null,[e("li",null,"内部阅读器：本APP提供了内部阅读器可以非常方便地阅读漫画。"),e("li",null,"外部阅读器：如果不想使用自带的阅读器，可以在设置-图片-图片阅读方式 进行设置")],-1)])]),_:1})]),_:1}))}}),ue=P({__name:"VideoSection",setup(n){return(s,a)=>(r(),q(M,{title:"🎬 视频管理模块",subtitle:"适合电影和番剧/电视剧，喜欢屯电影的可以试试👍",intro:"视频管理模块可以同时管理单一视频和视频文件夹，这是考虑到电影和番剧/电视剧的两种类型而设计的。电影类资源往往是单一的视频，而番剧/电视剧往往会有多个相似的视频组成同一个系列。因此在本地文件容易呈现文件夹的形式。因此视频模块可以同时管理这两种资源。"},{default:f(()=>[u($,{title:"🎬 视频播放"},{default:f(()=>[...a[0]||(a[0]=[e("p",null,"内置视频播放器，支持 MP4、AVI、MKV 等格式，双击视频文件即可播放。",-1)])]),_:1}),u($,{title:"🖼️ 缩略图预览"},{default:f(()=>[...a[1]||(a[1]=[e("p",null,"自动生成视频缩略图，快速预览视频内容，无需打开播放器。",-1)])]),_:1}),u($,{title:"⌨️ 播放控制"},{default:f(()=>[...a[2]||(a[2]=[e("p",null,"空格键播放/暂停，方向键控制进度，ESC 退出全屏，支持音量调节。",-1)])]),_:1}),u($,{title:"🎯 内部和外部播放器"})]),_:1}))}}),re=P({__name:"NovelSection",setup(n){return(s,a)=>(r(),q(M,{title:"📚 小说管理模块",subtitle:"我不咋用，只是觉得应该加一个，就加了",intro:"小说管理模块主要用于管理txt文件，本模块也内置了一个阅读器，可以直接在APP内快速地阅读小说。"},{default:f(()=>[u($,{title:"🎯 添加小说"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,"点击小说页的上方添加小说按钮，可以添加小说"),e("li",null,"拖动txt文件到小说页，可以添加小说")],-1)])]),_:1}),u($,{title:"🎨 内置阅读器的设置"},{default:f(()=>[...a[1]||(a[1]=[e("p",null,"阅读器的设置可以在设置-小说中进行设置。可以设置字体大小、行距、背景色，支持夜间模式，个性化阅读体验。",-1)])]),_:1})]),_:1}))}}),de=P({__name:"WebsiteSection",setup(n){return(s,a)=>(r(),q(M,{title:"🌐 网站收藏模块",subtitle:"我只能说比浏览器自带的好用很多。我收藏的网页太多了，每次都要找好久",intro:"网站收藏模块主要用于管理网站收藏,目前其实处于beta阶段，功能还不完善。只能对网页打tag方便索引。"},{default:f(()=>[u($,{title:"🔖 添加网站"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,"点击网站页的上方添加网站按钮，可以添加网站")],-1)])]),_:1})]),_:1}))}}),ce=P({__name:"AudioSection",setup(n){return(s,a)=>(r(),q(M,{title:"🎵 音频管理模块",subtitle:"我超喜欢这个全局播放器，听优香ASMR这一块👍",intro:"音频管理模块主要用于管理音频文件,目前暂时不支持视频。除此之外，考虑到很多人（比如我）喜欢在看漫画的时候听音声，所以该模块内置了全局的音频播放器。您可以在任何时候播放音频。"},{default:f(()=>[u($,{title:"🎵 添加音频"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,"点击音频页的上方添加音频按钮，可以添加音频"),e("li",null,"拖动音频文件到音频页，可以添加音频")],-1)])]),_:1})]),_:1}))}}),St=P({__name:"ApiSection",setup(n){return(s,a)=>(r(),q(M,{title:"🔌 API 手册",subtitle:"通过 HTTP API 访问应用数据，支持脚本批处理",intro:"应用提供了 RESTful API 接口，允许您通过 HTTP 请求访问和管理应用数据。API 服务器默认运行在 http://127.0.0.1:8765，仅允许本地访问。"},{default:f(()=>[u($,{title:"📡 API 服务器信息"},{default:f(()=>[...a[0]||(a[0]=[e("ul",null,[e("li",null,[e("strong",null,"服务器地址："),e("code",null,"http://127.0.0.1:8765")]),e("li",null,[e("strong",null,"访问限制："),l("仅允许本地访问（127.0.0.1）")]),e("li",null,[e("strong",null,"数据格式："),l("JSON")]),e("li",null,[e("strong",null,"API 风格："),l("RESTful")])],-1)])]),_:1}),u($,{title:"🔒 安全说明"},{default:f(()=>[...a[1]||(a[1]=[e("ul",null,[e("li",null,"API 服务器仅监听本地地址（127.0.0.1），外部无法访问"),e("li",null,"所有操作都会直接修改应用数据文件，请谨慎使用"),e("li",null,"建议在批处理脚本中添加错误处理逻辑"),e("li",null,"建议定期备份 SaveData 文件夹")],-1)])]),_:1})]),_:1}))}}),pe=A(St,[["__scopeId","data-v-b6095ce1"]]);Prism.languages.javascript=Prism.languages.extend("clike",{"class-name":[Prism.languages.clike["class-name"],{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$A-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\.(?:constructor|prototype))/,lookbehind:!0}],keyword:[{pattern:/((?:^|\})\s*)catch\b/,lookbehind:!0},{pattern:/(^|[^.]|\.\.\.\s*)\b(?:as|assert(?=\s*\{)|async(?=\s*(?:function\b|\(|[$\w\xA0-\uFFFF]|$))|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally(?=\s*(?:\{|$))|for|from(?=\s*(?:['"]|$))|function|(?:get|set)(?=\s*(?:[#\[$\w\xA0-\uFFFF]|$))|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/,lookbehind:!0}],function:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*(?:\.\s*(?:apply|bind|call)\s*)?\()/,number:{pattern:RegExp(/(^|[^\w$])/.source+"(?:"+(/NaN|Infinity/.source+"|"+/0[bB][01]+(?:_[01]+)*n?/.source+"|"+/0[oO][0-7]+(?:_[0-7]+)*n?/.source+"|"+/0[xX][\dA-Fa-f]+(?:_[\dA-Fa-f]+)*n?/.source+"|"+/\d+(?:_\d+)*n/.source+"|"+/(?:\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\.\d+(?:_\d+)*)(?:[Ee][+-]?\d+(?:_\d+)*)?/.source)+")"+/(?![\w$])/.source),lookbehind:!0},operator:/--|\+\+|\*\*=?|=>|&&=?|\|\|=?|[!=]==|<<=?|>>>?=?|[-+*/%&|^!=<>]=?|\.{3}|\?\?=?|\?\.?|[~:]/});Prism.languages.javascript["class-name"][0].pattern=/(\b(?:class|extends|implements|instanceof|interface|new)\s+)[\w.\\]+/;Prism.languages.insertBefore("javascript","keyword",{regex:{pattern:RegExp(/((?:^|[^$\w\xA0-\uFFFF."'\])\s]|\b(?:return|yield))\s*)/.source+/\//.source+"(?:"+/(?:\[(?:[^\]\\\r\n]|\\.)*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}/.source+"|"+/(?:\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.|\[(?:[^[\]\\\r\n]|\\.)*\])*\])*\]|\\.|[^/\\\[\r\n])+\/[dgimyus]{0,7}v[dgimyus]{0,7}/.source+")"+/(?=(?:\s|\/\*(?:[^*]|\*(?!\/))*\*\/)*(?:$|[\r\n,.;:})\]]|\/\/))/.source),lookbehind:!0,greedy:!0,inside:{"regex-source":{pattern:/^(\/)[\s\S]+(?=\/[a-z]*$)/,lookbehind:!0,alias:"language-regex",inside:Prism.languages.regex},"regex-delimiter":/^\/|\/$/,"regex-flags":/^[a-z]+$/}},"function-variable":{pattern:/#?(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)\s*=>))/,alias:"function"},parameter:[{pattern:/(function(?:\s+(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*)?\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\))/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(^|[^$\w\xA0-\uFFFF])(?!\s)[_$a-z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*=>)/i,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/(\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*=>)/,lookbehind:!0,inside:Prism.languages.javascript},{pattern:/((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*\s*)\(\s*|\]\s*\(\s*)(?!\s)(?:[^()\s]|\s+(?![\s)])|\([^()]*\))+(?=\s*\)\s*\{)/,lookbehind:!0,inside:Prism.languages.javascript}],constant:/\b[A-Z](?:[A-Z_]|\dx?)*\b/});Prism.languages.insertBefore("javascript","string",{hashbang:{pattern:/^#!.*/,greedy:!0,alias:"comment"},"template-string":{pattern:/`(?:\\[\s\S]|\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}|(?!\$\{)[^\\`])*`/,greedy:!0,inside:{"template-punctuation":{pattern:/^`|`$/,alias:"string"},interpolation:{pattern:/((?:^|[^\\])(?:\\{2})*)\$\{(?:[^{}]|\{(?:[^{}]|\{[^}]*\})*\})+\}/,lookbehind:!0,inside:{"interpolation-punctuation":{pattern:/^\$\{|\}$/,alias:"punctuation"},rest:Prism.languages.javascript}},string:/[\s\S]+/}},"string-property":{pattern:/((?:^|[,{])[ \t]*)(["'])(?:\\(?:\r\n|[\s\S])|(?!\2)[^\\\r\n])*\2(?=\s*:)/m,lookbehind:!0,greedy:!0,alias:"property"}});Prism.languages.insertBefore("javascript","operator",{"literal-property":{pattern:/((?:^|[,{])[ \t]*)(?!\s)[_$a-zA-Z\xA0-\uFFFF](?:(?!\s)[$\w\xA0-\uFFFF])*(?=\s*:)/m,lookbehind:!0,alias:"property"}});Prism.languages.markup&&(Prism.languages.markup.tag.addInlined("script","javascript"),Prism.languages.markup.tag.addAttribute(/on(?:abort|blur|change|click|composition(?:end|start|update)|dblclick|error|focus(?:in|out)?|key(?:down|up)|load|mouse(?:down|enter|leave|move|out|over|up)|reset|resize|scroll|select|slotchange|submit|unload|wheel)/.source,"javascript"));Prism.languages.js=Prism.languages.javascript;Prism.languages.python={comment:{pattern:/(^|[^\\])#.*/,lookbehind:!0,greedy:!0},"string-interpolation":{pattern:/(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,greedy:!0,inside:{interpolation:{pattern:/((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,lookbehind:!0,inside:{"format-spec":{pattern:/(:)[^:(){}]+(?=\}$)/,lookbehind:!0},"conversion-option":{pattern:/![sra](?=[:}]$)/,alias:"punctuation"},rest:null}},string:/[\s\S]+/}},"triple-quoted-string":{pattern:/(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,greedy:!0,alias:"string"},string:{pattern:/(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,greedy:!0},function:{pattern:/((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,lookbehind:!0},"class-name":{pattern:/(\bclass\s+)\w+/i,lookbehind:!0},decorator:{pattern:/(^[\t ]*)@\w+(?:\.\w+)*/m,lookbehind:!0,alias:["annotation","punctuation"],inside:{punctuation:/\./}},keyword:/\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,builtin:/\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,boolean:/\b(?:False|None|True)\b/,number:/\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,operator:/[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,punctuation:/[{}[\];(),.:]/};Prism.languages.python["string-interpolation"].inside.interpolation.inside.rest=Prism.languages.python;Prism.languages.py=Prism.languages.python;Prism.languages.json={property:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,lookbehind:!0,greedy:!0},string:{pattern:/(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,lookbehind:!0,greedy:!0},comment:{pattern:/\/\/.*|\/\*[\s\S]*?(?:\*\/|$)/,greedy:!0},number:/-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,punctuation:/[{}[\],]/,operator:/:/,boolean:/\b(?:false|true)\b/,null:{pattern:/\bnull\b/,alias:"keyword"}};Prism.languages.webmanifest=Prism.languages.json;const jt=["innerHTML"],Tt=P({__name:"CodeBlock",props:{code:{},language:{default:"javascript"}},setup(n){const s=n,a=G(()=>{const t=le.languages[s.language];return t?le.highlight(s.code,t,s.language):s.code.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")});return(t,o)=>(r(),c("pre",{class:D(["code-block",`language-${n.language}`])},[e("code",{class:D(`language-${n.language}`),innerHTML:a.value},null,10,jt)],2))}}),b=A(Tt,[["__scopeId","data-v-1410f808"]]),Pt=P({__name:"ApiGamesSection",setup(n){const s={gamesArray:`{
    "status": 200,
    "msg": "success",
    "total": 1,
    "data": [
      {
        "id": "1767042792152n1yc9qrf3",
        "resourceType": "game",
        "name": "游戏名称",
        "nickname": "",
        "nameZh": "",
        "nameEn": "",
        "nameJa": "",
        "description": "游戏描述",
        "developers": ["开发商1", "开发商2"],
        "publisher": "发行商",
        "tags": ["标签1", "标签2"],
        "engine": "RPGMaker",
        "coverPath": "C:/Games/Screenshots/cover.png",
        "resourcePath": "C:/Games/GameFolder/game.exe",
        "playTime": 3600,
        "playCount": 10,
        "visitedSessions": [
          "2025-12-29T22:05:34.528Z",
          "2026-01-21T08:53:13.157Z"
        ],
        "addedDate": "2025-12-29T21:13:12.152Z",
        "rating": 5,
        "comment": "好玩",
        "isFavorite": true
      }
    ]
  }`,gameObject:`{
  "id": "1767042792152n1yc9qrf3",
  "resourceType": "game",
  "name": "游戏名称",
  "nickname": "",
  "nameZh": "",
  "nameEn": "",
  "nameJa": "",
  "description": "游戏描述",
  "developers": ["开发商1", "开发商2"],
  "publisher": "发行商",
  "tags": ["标签1", "标签2"],
  "engine": "RPGMaker",
  "coverPath": "C:/Games/Screenshots/cover.png",
  "resourcePath": "C:/Games/GameFolder/game.exe",
  "playTime": 3600,
  "playCount": 10,
  "visitedSessions": [
    "2025-12-29T22:05:34.528Z",
    "2026-01-21T08:53:13.157Z"
  ],
  "addedDate": "2025-12-29T21:13:12.152Z",
  "rating": 5,
  "comment": "好玩",
  "isFavorite": true
}`,createBody:`{
  "name": "游戏名称",
  "nickname": "",
  "nameZh": "",
  "nameEn": "",
  "nameJa": "",
  "description": "游戏描述",
  "developers": ["开发商"],
  "publisher": "发行商",
  "tags": ["标签1", "标签2"],
  "engine": "RPGMaker",
  "coverPath": "C:/Games/Screenshots/cover.png",
  "resourcePath": "C:/Games/GameFolder/game.exe",
  "playTime": 0,
  "playCount": 0,
  "visitedSessions": [],
  "rating": null,
  "comment": "",
  "isFavorite": false
}`,updateBody:`{
  "name": "更新后的游戏名",
  "description": "更新后的描述",
  "rating": 5,
  "tags": ["新标签1", "新标签2"],
  "isFavorite": true
}`,errorResponse:`{
  "error": "错误信息"
}`,jsGetAll:"const params = new URLSearchParams({'name': '游戏名称'}) // 按需添加查询条件，条件为空时查询所有游戏\nconst res = await fetch(`http://127.0.0.1:8765/api/games?${params}`)\nconst games = await res.json()",jsGetOne:`const res = await fetch('http://127.0.0.1:8765/api/games/1234567890abc')
const game = await res.json()`,jsCreate:`const res = await fetch('http://127.0.0.1:8765/api/games', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新游戏',
    developers: ['开发商'],
    resourcePath: 'C:/Games/game.exe'
  })
})
const createdGame = await res.json()`,jsUpdate:`const res = await fetch('http://127.0.0.1:8765/api/games/1234567890abc', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '更新后的游戏名' })
})
const updatedGame = await res.json()`,jsDelete:`await fetch('http://127.0.0.1:8765/api/games/1234567890abc', { method: 'DELETE' })
// 成功返回 204，无响应体`,pyGetAll:`import requests
params = {'name': '游戏名称'} # 按需添加查询条件，条件为空时查询所有游戏
response = requests.get('http://127.0.0.1:8765/api/games', params=params)
games = response.json()`,pyGetOne:`import requests
response = requests.get('http://127.0.0.1:8765/api/games/1234567890abc')
game = response.json()`,pyCreate:`import requests
new_game = {
    'name': '新游戏',
    'developers': ['开发商'],
    'resourcePath': 'C:/Games/game.exe'
}
response = requests.post('http://127.0.0.1:8765/api/games', json=new_game)
created_game = response.json()`,pyUpdate:`import requests
update_data = {'name': '更新后的游戏名'}
response = requests.put('http://127.0.0.1:8765/api/games/1234567890abc', json=update_data)
updated_game = response.json()`,pyDelete:`import requests
response = requests.delete('http://127.0.0.1:8765/api/games/1234567890abc')
# 成功返回 204，无响应体`};return(a,t)=>(r(),q(M,{title:"🎮 游戏管理 API",subtitle:"通过 HTTP API 管理游戏数据",intro:"游戏的CRUD操作。"},{default:f(()=>[u($,{title:"📥 获取游戏信息"},{default:f(()=>[t[0]||(t[0]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/games")],-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"参数："),e("br"),l("   "),e("code",null,"name"),l(" - 游戏名称（可选）"),e("br"),l("   "),e("code",null,"developer"),l(" - 开发商（可选）"),e("br"),l("   "),e("code",null,"publisher"),l(" - 发行商（可选）"),e("br"),l(" 备注：不传参数即可查询所有游戏 ")],-1)),t[2]||(t[2]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回游戏数组。例如：")],-1)),u(b,{code:s.gamesArray,language:"json"},null,8,["code"]),t[3]||(t[3]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsGetAll,language:"javascript"},null,8,["code"]),t[4]||(t[4]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyGetAll,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📥 获取单个游戏"},{default:f(()=>[t[5]||(t[5]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/games/:id")],-1)),t[6]||(t[6]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 游戏ID")],-1)),t[7]||(t[7]=e("p",null,[e("strong",null,"响应："),l("200 OK 返回游戏对象，不存在则 404。例如：")],-1)),u(b,{code:s.gameObject,language:"json"},null,8,["code"]),t[8]||(t[8]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsGetOne,language:"javascript"},null,8,["code"]),t[9]||(t[9]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyGetOne,language:"python"},null,8,["code"])]),_:1}),u($,{title:"➕ 创建游戏"},{default:f(()=>[t[10]||(t[10]=e("div",{class:"api-endpoint"},[e("div",{class:"method post"},"POST"),e("code",null,"/api/games")],-1)),t[11]||(t[11]=e("p",null,[e("strong",null,"请求体：")],-1)),u(b,{code:s.createBody,language:"json"},null,8,["code"]),t[12]||(t[12]=e("p",null,[e("strong",null,"响应："),l("201 Created，返回创建的游戏对象。例如：")],-1)),t[13]||(t[13]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 会自动生成")],-1)),t[14]||(t[14]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsCreate,language:"javascript"},null,8,["code"]),t[15]||(t[15]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyCreate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"✏️ 更新游戏"},{default:f(()=>[t[16]||(t[16]=e("div",{class:"api-endpoint"},[e("div",{class:"method put"},"PUT"),e("code",null,"/api/games/:id")],-1)),t[17]||(t[17]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 游戏ID")],-1)),t[18]||(t[18]=e("p",null,[e("strong",null,"请求体："),l("要更新的字段（JSON 对象，只需传要修改的字段）")],-1)),u(b,{code:s.updateBody,language:"json"},null,8,["code"]),t[19]||(t[19]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回更新后的游戏对象。例如：")],-1)),t[20]||(t[20]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 字段不允许修改")],-1)),t[21]||(t[21]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsUpdate,language:"javascript"},null,8,["code"]),t[22]||(t[22]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyUpdate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"🗑️ 删除游戏"},{default:f(()=>[t[23]||(t[23]=e("div",{class:"api-endpoint"},[e("div",{class:"method delete"},"DELETE"),e("code",null,"/api/games/:id")],-1)),t[24]||(t[24]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 游戏ID")],-1)),t[25]||(t[25]=e("p",null,[e("strong",null,"响应："),l("204 No Content（成功）或 404 Not Found（不存在）")],-1)),t[26]||(t[26]=e("p",null,[e("strong",null,"注意："),l("删除操作不会删除本地游戏文件，仅移除管理器中的引用")],-1)),t[27]||(t[27]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsDelete,language:"javascript"},null,8,["code"]),t[28]||(t[28]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyDelete,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📊 游戏数据字段说明"},{default:f(()=>[...t[29]||(t[29]=[e("p",null,"游戏对象包含以下字段：",-1),e("ul",null,[e("li",null,[e("code",null,"id"),l(" - 游戏唯一标识符（自动生成，不可修改）")]),e("li",null,[e("code",null,"resourceType"),l(' - 资源类型，固定为 "game"')]),e("li",null,[e("code",null,"name"),l(" - 游戏名称（必需）")]),e("li",null,[e("code",null,"nickname"),l(" - 游戏昵称")]),e("li",null,[e("code",null,"nameZh"),l(" - 中文名")]),e("li",null,[e("code",null,"nameEn"),l(" - 英文名")]),e("li",null,[e("code",null,"nameJa"),l(" - 日文名")]),e("li",null,[e("code",null,"description"),l(" - 游戏描述")]),e("li",null,[e("code",null,"developers"),l(" - 开发商数组（注意是数组）")]),e("li",null,[e("code",null,"publisher"),l(" - 发行商")]),e("li",null,[e("code",null,"tags"),l(" - 标签数组")]),e("li",null,[e("code",null,"engine"),l(" - 游戏引擎")]),e("li",null,[e("code",null,"resourcePath"),l(" - 游戏可执行文件路径")]),e("li",null,[e("code",null,"coverPath"),l(" - 封面图片路径")]),e("li",null,[e("code",null,"playTime"),l(" - 游戏时长（秒）")]),e("li",null,[e("code",null,"playCount"),l(" - 运行次数")]),e("li",null,[e("code",null,"visitedSessions"),l(" - 访问会话时间数组（ISO 字符串数组，记录每次启动时间）")]),e("li",null,[e("code",null,"addedDate"),l(" - 添加日期（自动生成，不可修改）")]),e("li",null,[e("code",null,"rating"),l(" - 评分（1-5 或 null）")]),e("li",null,[e("code",null,"comment"),l(" - 备注")]),e("li",null,[e("code",null,"isFavorite"),l(" - 是否收藏")])],-1)])]),_:1}),u($,{title:"⚠️ 错误处理"},{default:f(()=>[t[30]||(t[30]=e("p",null,"API 使用标准的 HTTP 状态码：",-1)),t[31]||(t[31]=e("ul",null,[e("li",null,[e("strong",null,"200 OK："),l("请求成功")]),e("li",null,[e("strong",null,"201 Created："),l("资源创建成功")]),e("li",null,[e("strong",null,"204 No Content："),l("删除成功（无响应体）")]),e("li",null,[e("strong",null,"400 Bad Request："),l("请求参数错误（如缺少必需字段）")]),e("li",null,[e("strong",null,"404 Not Found："),l("资源不存在")]),e("li",null,[e("strong",null,"500 Internal Server Error："),l("服务器内部错误")])],-1)),t[32]||(t[32]=e("p",null,"错误响应格式：",-1)),u(b,{code:s.errorResponse,language:"json"},null,8,["code"])]),_:1})]),_:1}))}}),fe=A(Pt,[["__scopeId","data-v-c2b019d4"]]),Ft=P({__name:"ApiMangaSection",setup(n){const s={mangaArray:`[
  {
    "id": "1767042792152n1yc9qrf3",
    "resourceType": "manga",
    "name": "漫画名称",
    "description": "漫画描述",
    "author": "作者名",
    "tags": ["标签1", "标签2"],
    "resourcePath": "C:/Manga/MangaFolder",
    "coverPath": "C:/Manga/Covers/cover.jpg",
    "visitedSessions": [
      "2025-12-29T22:05:34.528Z",
      "2026-01-21T08:53:13.157Z"
    ],
    "addedDate": "2025-12-29T21:13:12.152Z",
    "rating": 5,
    "comment": "很好看",
    "isFavorite": true
  }
]`,mangaObject:`{
  "id": "1767042792152n1yc9qrf3",
  "resourceType": "manga",
  "name": "漫画名称",
  "description": "漫画描述",
  "author": "作者名",
  "tags": ["标签1", "标签2"],
  "resourcePath": "C:/Manga/MangaFolder",
  "coverPath": "C:/Manga/Covers/cover.jpg",
  "visitedSessions": [
    "2025-12-29T22:05:34.528Z",
    "2026-01-21T08:53:13.157Z"
  ],
  "addedDate": "2025-12-29T21:13:12.152Z",
  "rating": 5,
  "comment": "很好看",
  "isFavorite": true
}`,createBody:`{
  "name": "漫画名称",
  "description": "漫画描述",
  "author": "作者名",
  "tags": ["标签1", "标签2"],
  "resourcePath": "C:/Manga/MangaFolder",
  "coverPath": "C:/Manga/Covers/cover.jpg",
  "visitedSessions": [],
  "rating": 0,
  "comment": "",
  "isFavorite": false
}`,updateBody:`{
  "name": "更新后的漫画名",
  "description": "更新后的描述",
  "rating": 5,
  "tags": ["新标签1", "新标签2"],
  "isFavorite": true
}`,errorResponse:`{
  "error": "错误信息"
}`,jsGetAll:`const res = await fetch('http://127.0.0.1:8765/api/manga')
const manga = await res.json()`,jsGetOne:`const res = await fetch('http://127.0.0.1:8765/api/manga/1234567890abc')
const manga = await res.json()`,jsCreate:`const res = await fetch('http://127.0.0.1:8765/api/manga', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新漫画',
    author: '作者名',
    resourcePath: 'C:/Manga/NewManga'
  })
})
const createdManga = await res.json()`,jsUpdate:`const res = await fetch('http://127.0.0.1:8765/api/manga/1234567890abc', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '更新后的漫画名' })
})
const updatedManga = await res.json()`,jsDelete:`await fetch('http://127.0.0.1:8765/api/manga/1234567890abc', { method: 'DELETE' })
// 成功返回 204，无响应体`,pyGetAll:`import requests
response = requests.get('http://127.0.0.1:8765/api/manga')
manga = response.json()`,pyGetOne:`import requests
response = requests.get('http://127.0.0.1:8765/api/manga/1234567890abc')
manga = response.json()`,pyCreate:`import requests
new_manga = {
    'name': '新漫画',
    'author': '作者名',
    'resourcePath': 'C:/Manga/NewManga'
}
response = requests.post('http://127.0.0.1:8765/api/manga', json=new_manga)
created_manga = response.json()`,pyUpdate:`import requests
update_data = {'name': '更新后的漫画名'}
response = requests.put('http://127.0.0.1:8765/api/manga/1234567890abc', json=update_data)
updated_manga = response.json()`,pyDelete:`import requests
response = requests.delete('http://127.0.0.1:8765/api/manga/1234567890abc')
# 成功返回 204，无响应体`};return(a,t)=>(r(),q(M,{title:"📚 漫画管理 API",subtitle:"通过 HTTP API 管理漫画数据",intro:"漫画管理 API 提供了完整的 CRUD 操作，允许您通过 HTTP 请求获取、创建、更新和删除漫画数据。"},{default:f(()=>[u($,{title:"📥 获取所有漫画"},{default:f(()=>[t[0]||(t[0]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/manga")],-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回漫画数组")],-1)),u(b,{code:s.mangaArray,language:"json"},null,8,["code"]),t[2]||(t[2]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetAll,language:"javascript"},null,8,["code"]),t[3]||(t[3]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetAll,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📥 获取单个漫画"},{default:f(()=>[t[4]||(t[4]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/manga/:id")],-1)),t[5]||(t[5]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 漫画ID")],-1)),t[6]||(t[6]=e("p",null,[e("strong",null,"响应："),l("200 OK 返回漫画对象，不存在则 404")],-1)),u(b,{code:s.mangaObject,language:"json"},null,8,["code"]),t[7]||(t[7]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetOne,language:"javascript"},null,8,["code"]),t[8]||(t[8]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetOne,language:"python"},null,8,["code"])]),_:1}),u($,{title:"➕ 创建漫画"},{default:f(()=>[t[9]||(t[9]=e("div",{class:"api-endpoint"},[e("div",{class:"method post"},"POST"),e("code",null,"/api/manga")],-1)),t[10]||(t[10]=e("p",null,[e("strong",null,"请求体：")],-1)),u(b,{code:s.createBody,language:"json"},null,8,["code"]),t[11]||(t[11]=e("p",null,[e("strong",null,"响应："),l("201 Created，返回创建的漫画对象")],-1)),t[12]||(t[12]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 会自动生成")],-1)),t[13]||(t[13]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsCreate,language:"javascript"},null,8,["code"]),t[14]||(t[14]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyCreate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"✏️ 更新漫画"},{default:f(()=>[t[15]||(t[15]=e("div",{class:"api-endpoint"},[e("div",{class:"method put"},"PUT"),e("code",null,"/api/manga/:id")],-1)),t[16]||(t[16]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 漫画ID")],-1)),t[17]||(t[17]=e("p",null,[e("strong",null,"请求体："),l("要更新的字段（JSON 对象，只需传要修改的字段）")],-1)),u(b,{code:s.updateBody,language:"json"},null,8,["code"]),t[18]||(t[18]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回更新后的漫画对象")],-1)),t[19]||(t[19]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 字段不允许修改")],-1)),t[20]||(t[20]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsUpdate,language:"javascript"},null,8,["code"]),t[21]||(t[21]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyUpdate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"🗑️ 删除漫画"},{default:f(()=>[t[22]||(t[22]=e("div",{class:"api-endpoint"},[e("div",{class:"method delete"},"DELETE"),e("code",null,"/api/manga/:id")],-1)),t[23]||(t[23]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 漫画ID")],-1)),t[24]||(t[24]=e("p",null,[e("strong",null,"响应："),l("204 No Content（成功）或 404 Not Found（不存在）")],-1)),t[25]||(t[25]=e("p",null,[e("strong",null,"注意："),l("删除操作不会删除本地漫画文件，仅移除管理器中的引用")],-1)),t[26]||(t[26]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsDelete,language:"javascript"},null,8,["code"]),t[27]||(t[27]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyDelete,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📊 漫画数据字段说明"},{default:f(()=>[...t[28]||(t[28]=[e("p",null,"漫画对象包含以下字段：",-1),e("ul",null,[e("li",null,[e("code",null,"id"),l(" - 漫画唯一标识符（自动生成，不可修改）")]),e("li",null,[e("code",null,"resourceType"),l(' - 资源类型，固定为 "manga"')]),e("li",null,[e("code",null,"name"),l(" - 漫画名称（必需）")]),e("li",null,[e("code",null,"description"),l(" - 漫画描述")]),e("li",null,[e("code",null,"author"),l(" - 作者")]),e("li",null,[e("code",null,"tags"),l(" - 标签数组")]),e("li",null,[e("code",null,"resourcePath"),l(" - 漫画文件夹路径")]),e("li",null,[e("code",null,"coverPath"),l(" - 封面图片路径")]),e("li",null,[e("code",null,"visitedSessions"),l(" - 访问会话时间数组（ISO 字符串数组，记录每次查看时间）")]),e("li",null,[e("code",null,"addedDate"),l(" - 添加日期（自动生成，不可修改）")]),e("li",null,[e("code",null,"rating"),l(" - 评分（1-5 或 0）")]),e("li",null,[e("code",null,"comment"),l(" - 备注")]),e("li",null,[e("code",null,"isFavorite"),l(" - 是否收藏")])],-1)])]),_:1}),u($,{title:"⚠️ 错误处理"},{default:f(()=>[t[29]||(t[29]=e("p",null,"API 使用标准的 HTTP 状态码：",-1)),t[30]||(t[30]=e("ul",null,[e("li",null,[e("strong",null,"200 OK："),l("请求成功")]),e("li",null,[e("strong",null,"201 Created："),l("资源创建成功")]),e("li",null,[e("strong",null,"204 No Content："),l("删除成功（无响应体）")]),e("li",null,[e("strong",null,"400 Bad Request："),l("请求参数错误（如缺少必需字段）")]),e("li",null,[e("strong",null,"404 Not Found："),l("资源不存在")]),e("li",null,[e("strong",null,"500 Internal Server Error："),l("服务器内部错误")])],-1)),t[31]||(t[31]=e("p",null,"错误响应格式：",-1)),u(b,{code:s.errorResponse,language:"json"},null,8,["code"])]),_:1})]),_:1}))}}),me=A(Ft,[["__scopeId","data-v-3197c3a5"]]),It=P({__name:"ApiVideosSection",setup(n){const s={videosArray:`[
  {
    "id": "1767042792152n1yc9qrf3",
    "resourceType": "movie",
    "name": "视频名称",
    "description": "视频描述",
    "series": "系列名",
    "tags": ["标签1", "标签2"],
    "actors": ["演员1", "演员2"],
    "resourcePath": "C:/Videos/video.mp4",
    "thumbnail": "C:/Videos/Thumbnails/thumb.jpg",
    "duration": 120,
    "visitedSessions": [
      "2025-12-29T22:05:34.528Z",
      "2026-01-21T08:53:13.157Z"
    ],
    "addedDate": "2025-12-29T21:13:12.152Z",
    "rating": 5,
    "comment": "很好看",
    "isFavorite": true
  }
]`,videoObject:`{
  "id": "1767042792152n1yc9qrf3",
  "resourceType": "movie",
  "name": "视频名称",
  "description": "视频描述",
  "series": "系列名",
  "tags": ["标签1", "标签2"],
  "actors": ["演员1", "演员2"],
  "resourcePath": "C:/Videos/video.mp4",
  "thumbnail": "C:/Videos/Thumbnails/thumb.jpg",
  "duration": 120,
  "visitedSessions": [
    "2025-12-29T22:05:34.528Z",
    "2026-01-21T08:53:13.157Z"
  ],
  "addedDate": "2025-12-29T21:13:12.152Z",
  "rating": 5,
  "comment": "很好看",
  "isFavorite": true
}`,createBody:`{
  "name": "视频名称",
  "description": "视频描述",
  "series": "系列名",
  "tags": ["标签1", "标签2"],
  "actors": ["演员1", "演员2"],
  "resourcePath": "C:/Videos/video.mp4",
  "thumbnail": "C:/Videos/Thumbnails/thumb.jpg",
  "duration": 120,
  "visitedSessions": [],
  "rating": 0,
  "comment": "",
  "isFavorite": false
}`,updateBody:`{
  "name": "更新后的视频名",
  "description": "更新后的描述",
  "rating": 5,
  "tags": ["新标签1", "新标签2"],
  "isFavorite": true
}`,errorResponse:`{
  "error": "错误信息"
}`,jsGetAll:`const res = await fetch('http://127.0.0.1:8765/api/videos')
const videos = await res.json()`,jsGetOne:`const res = await fetch('http://127.0.0.1:8765/api/videos/1234567890abc')
const video = await res.json()`,jsCreate:`const res = await fetch('http://127.0.0.1:8765/api/videos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新视频',
    series: '系列名',
    resourcePath: 'C:/Videos/newvideo.mp4'
  })
})
const createdVideo = await res.json()`,jsUpdate:`const res = await fetch('http://127.0.0.1:8765/api/videos/1234567890abc', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '更新后的视频名' })
})
const updatedVideo = await res.json()`,jsDelete:`await fetch('http://127.0.0.1:8765/api/videos/1234567890abc', { method: 'DELETE' })
// 成功返回 204，无响应体`,pyGetAll:`import requests
response = requests.get('http://127.0.0.1:8765/api/videos')
videos = response.json()`,pyGetOne:`import requests
response = requests.get('http://127.0.0.1:8765/api/videos/1234567890abc')
video = response.json()`,pyCreate:`import requests
new_video = {
    'name': '新视频',
    'series': '系列名',
    'resourcePath': 'C:/Videos/newvideo.mp4'
}
response = requests.post('http://127.0.0.1:8765/api/videos', json=new_video)
created_video = response.json()`,pyUpdate:`import requests
update_data = {'name': '更新后的视频名'}
response = requests.put('http://127.0.0.1:8765/api/videos/1234567890abc', json=update_data)
updated_video = response.json()`,pyDelete:`import requests
response = requests.delete('http://127.0.0.1:8765/api/videos/1234567890abc')
# 成功返回 204，无响应体`};return(a,t)=>(r(),q(M,{title:"🎬 视频管理 API",subtitle:"通过 HTTP API 管理视频数据",intro:"视频管理 API 提供了完整的 CRUD 操作，允许您通过 HTTP 请求获取、创建、更新和删除视频数据。"},{default:f(()=>[u($,{title:"📥 获取所有视频"},{default:f(()=>[t[0]||(t[0]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/videos")],-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回视频数组")],-1)),u(b,{code:s.videosArray,language:"json"},null,8,["code"]),t[2]||(t[2]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetAll,language:"javascript"},null,8,["code"]),t[3]||(t[3]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetAll,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📥 获取单个视频"},{default:f(()=>[t[4]||(t[4]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/videos/:id")],-1)),t[5]||(t[5]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 视频ID")],-1)),t[6]||(t[6]=e("p",null,[e("strong",null,"响应："),l("200 OK 返回视频对象，不存在则 404")],-1)),u(b,{code:s.videoObject,language:"json"},null,8,["code"]),t[7]||(t[7]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetOne,language:"javascript"},null,8,["code"]),t[8]||(t[8]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetOne,language:"python"},null,8,["code"])]),_:1}),u($,{title:"➕ 创建视频"},{default:f(()=>[t[9]||(t[9]=e("div",{class:"api-endpoint"},[e("div",{class:"method post"},"POST"),e("code",null,"/api/videos")],-1)),t[10]||(t[10]=e("p",null,[e("strong",null,"请求体：")],-1)),u(b,{code:s.createBody,language:"json"},null,8,["code"]),t[11]||(t[11]=e("p",null,[e("strong",null,"响应："),l("201 Created，返回创建的视频对象")],-1)),t[12]||(t[12]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 会自动生成")],-1)),t[13]||(t[13]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsCreate,language:"javascript"},null,8,["code"]),t[14]||(t[14]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyCreate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"✏️ 更新视频"},{default:f(()=>[t[15]||(t[15]=e("div",{class:"api-endpoint"},[e("div",{class:"method put"},"PUT"),e("code",null,"/api/videos/:id")],-1)),t[16]||(t[16]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 视频ID")],-1)),t[17]||(t[17]=e("p",null,[e("strong",null,"请求体："),l("要更新的字段（JSON 对象，只需传要修改的字段）")],-1)),u(b,{code:s.updateBody,language:"json"},null,8,["code"]),t[18]||(t[18]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回更新后的视频对象")],-1)),t[19]||(t[19]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 字段不允许修改")],-1)),t[20]||(t[20]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsUpdate,language:"javascript"},null,8,["code"]),t[21]||(t[21]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyUpdate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"🗑️ 删除视频"},{default:f(()=>[t[22]||(t[22]=e("div",{class:"api-endpoint"},[e("div",{class:"method delete"},"DELETE"),e("code",null,"/api/videos/:id")],-1)),t[23]||(t[23]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 视频ID")],-1)),t[24]||(t[24]=e("p",null,[e("strong",null,"响应："),l("204 No Content（成功）或 404 Not Found（不存在）")],-1)),t[25]||(t[25]=e("p",null,[e("strong",null,"注意："),l("删除操作不会删除本地视频文件，仅移除管理器中的引用")],-1)),t[26]||(t[26]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsDelete,language:"javascript"},null,8,["code"]),t[27]||(t[27]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyDelete,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📊 视频数据字段说明"},{default:f(()=>[...t[28]||(t[28]=[e("p",null,"视频对象包含以下字段：",-1),e("ul",null,[e("li",null,[e("code",null,"id"),l(" - 视频唯一标识符（自动生成，不可修改）")]),e("li",null,[e("code",null,"resourceType"),l(' - 资源类型，固定为 "movie"')]),e("li",null,[e("code",null,"name"),l(" - 视频名称（必需）")]),e("li",null,[e("code",null,"description"),l(" - 视频描述")]),e("li",null,[e("code",null,"series"),l(" - 系列名")]),e("li",null,[e("code",null,"tags"),l(" - 标签数组")]),e("li",null,[e("code",null,"actors"),l(" - 演员数组")]),e("li",null,[e("code",null,"resourcePath"),l(" - 视频文件路径")]),e("li",null,[e("code",null,"thumbnail"),l(" - 缩略图路径")]),e("li",null,[e("code",null,"duration"),l(" - 视频时长（分钟）")]),e("li",null,[e("code",null,"visitedSessions"),l(" - 访问会话时间数组（ISO 字符串数组，记录每次观看时间）")]),e("li",null,[e("code",null,"addedDate"),l(" - 添加日期（自动生成，不可修改）")]),e("li",null,[e("code",null,"rating"),l(" - 评分（1-5 或 0）")]),e("li",null,[e("code",null,"comment"),l(" - 备注")]),e("li",null,[e("code",null,"isFavorite"),l(" - 是否收藏")])],-1)])]),_:1}),u($,{title:"⚠️ 错误处理"},{default:f(()=>[t[29]||(t[29]=e("p",null,"API 使用标准的 HTTP 状态码：",-1)),t[30]||(t[30]=e("ul",null,[e("li",null,[e("strong",null,"200 OK："),l("请求成功")]),e("li",null,[e("strong",null,"201 Created："),l("资源创建成功")]),e("li",null,[e("strong",null,"204 No Content："),l("删除成功（无响应体）")]),e("li",null,[e("strong",null,"400 Bad Request："),l("请求参数错误（如缺少必需字段）")]),e("li",null,[e("strong",null,"404 Not Found："),l("资源不存在")]),e("li",null,[e("strong",null,"500 Internal Server Error："),l("服务器内部错误")])],-1)),t[31]||(t[31]=e("p",null,"错误响应格式：",-1)),u(b,{code:s.errorResponse,language:"json"},null,8,["code"])]),_:1})]),_:1}))}}),ge=A(It,[["__scopeId","data-v-ddc71227"]]),At=P({__name:"ApiNovelsSection",setup(n){const s={novelsArray:`[
  {
    "id": "1738368000000abc123",
    "resourceType": "novel",
    "name": "三体",
    "description": "地球往事三部曲第一部，讲述了地球文明和三体文明的信息交流、生死搏杀以及两个文明在宇宙中的兴衰历程。",
    "author": "刘慈欣",
    "genre": "科幻",
    "tags": ["科幻", "硬科幻", "雨果奖"],
    "resourcePath": "E:\\\\Books\\\\三体.epub",
    "coverPath": "E:\\\\Books\\\\Covers\\\\三体.jpg",
    "publishYear": "2008",
    "visitedSessions": [
      "2025-12-01T10:30:00.000Z",
      "2025-12-15T14:20:00.000Z"
    ],
    "addedDate": "2025-11-20T08:00:00.000Z",
    "rating": 5,
    "comment": "非常精彩的硬科幻作品",
    "isFavorite": true
  }
]`,novelObject:`{
  "id": "1738368000000abc123",
  "resourceType": "novel",
  "name": "三体",
  "description": "地球往事三部曲第一部，讲述了地球文明和三体文明的信息交流、生死搏杀以及两个文明在宇宙中的兴衰历程。",
  "author": "刘慈欣",
  "genre": "科幻",
  "tags": ["科幻", "硬科幻", "雨果奖"],
  "resourcePath": "E:\\\\Books\\\\三体.epub",
  "coverPath": "E:\\\\Books\\\\Covers\\\\三体.jpg",
  "publishYear": "2008",
  "visitedSessions": [
    "2025-12-01T10:30:00.000Z",
    "2025-12-15T14:20:00.000Z"
  ],
  "addedDate": "2025-11-20T08:00:00.000Z",
  "rating": 5,
  "comment": "非常精彩的硬科幻作品",
  "isFavorite": true
}`,createBody:`{
  "name": "三体",
  "description": "地球往事三部曲第一部",
  "author": "刘慈欣",
  "genre": "科幻",
  "tags": ["科幻", "硬科幻", "雨果奖"],
  "resourcePath": "E:\\\\Books\\\\三体.epub",
  "coverPath": "E:\\\\Books\\\\Covers\\\\三体.jpg",
  "publishYear": "2008",
  "rating": 5,
  "comment": "非常精彩的硬科幻作品",
  "isFavorite": true
}`,updateBody:`{
  "rating": 5,
  "comment": "重读后更加喜欢了",
  "isFavorite": true
}`,errorResponse:`{
  "error": "小说名称不能为空"
}`,jsGetAll:`// 获取所有小说
fetch('http://localhost:3000/api/novels')
  .then(response => response.json())
  .then(novels => console.log(novels))
  .catch(error => console.error('Error:', error));`,jsGetOne:`// 获取单个小说
const novelId = '1738368000000abc123';
fetch(\`http://localhost:3000/api/novels/\${novelId}\`)
  .then(response => response.json())
  .then(novel => console.log(novel))
  .catch(error => console.error('Error:', error));`,jsCreate:`// 创建小说
fetch('http://localhost:3000/api/novels', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '三体',
    description: '地球往事三部曲第一部',
    author: '刘慈欣',
    genre: '科幻',
    tags: ['科幻', '硬科幻', '雨果奖'],
    resourcePath: 'E:\\\\Books\\\\三体.epub',
    rating: 5
  })
})
  .then(response => response.json())
  .then(novel => console.log('Created:', novel))
  .catch(error => console.error('Error:', error));`,jsUpdate:`// 更新小说
const novelId = '1738368000000abc123';
fetch(\`http://localhost:3000/api/novels/\${novelId}\`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    rating: 5,
    comment: '重读后更加喜欢了'
  })
})
  .then(response => response.json())
  .then(novel => console.log('Updated:', novel))
  .catch(error => console.error('Error:', error));`,jsDelete:`// 删除小说
const novelId = '1738368000000abc123';
fetch(\`http://localhost:3000/api/novels/\${novelId}\`, {
  method: 'DELETE'
})
  .then(response => {
    if (response.status === 204) {
      console.log('Novel deleted successfully');
    }
  })
  .catch(error => console.error('Error:', error));`,pyGetAll:`import requests

# 获取所有小说
response = requests.get('http://localhost:3000/api/novels')
novels = response.json()
print(novels)`,pyGetOne:`import requests

# 获取单个小说
novel_id = '1738368000000abc123'
response = requests.get(f'http://localhost:3000/api/novels/{novel_id}')
novel = response.json()
print(novel)`,pyCreate:`import requests

# 创建小说
novel_data = {
    'name': '三体',
    'description': '地球往事三部曲第一部',
    'author': '刘慈欣',
    'genre': '科幻',
    'tags': ['科幻', '硬科幻', '雨果奖'],
    'resourcePath': 'E:\\\\Books\\\\三体.epub',
    'rating': 5
}

response = requests.post('http://localhost:3000/api/novels', json=novel_data)
novel = response.json()
print('Created:', novel)`,pyUpdate:`import requests

# 更新小说
novel_id = '1738368000000abc123'
update_data = {
    'rating': 5,
    'comment': '重读后更加喜欢了'
}

response = requests.put(f'http://localhost:3000/api/novels/{novel_id}', json=update_data)
novel = response.json()
print('Updated:', novel)`,pyDelete:`import requests

# 删除小说
novel_id = '1738368000000abc123'
response = requests.delete(f'http://localhost:3000/api/novels/{novel_id}')

if response.status_code == 204:
    print('Novel deleted successfully')`};return(a,t)=>(r(),q(M,{title:"📖 小说管理 API",subtitle:"通过 HTTP API 管理小说数据",intro:"小说管理 API 提供了完整的 CRUD 操作，允许您通过 HTTP 请求获取、创建、更新和删除小说数据。"},{default:f(()=>[u($,{title:"📥 获取所有小说"},{default:f(()=>[t[0]||(t[0]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/novels")],-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回小说数组")],-1)),u(b,{code:s.novelsArray,language:"json"},null,8,["code"]),t[2]||(t[2]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetAll,language:"javascript"},null,8,["code"]),t[3]||(t[3]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetAll,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📥 获取单个小说"},{default:f(()=>[t[4]||(t[4]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/novels/:id")],-1)),t[5]||(t[5]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 小说ID")],-1)),t[6]||(t[6]=e("p",null,[e("strong",null,"响应："),l("200 OK 返回小说对象，不存在则 404")],-1)),u(b,{code:s.novelObject,language:"json"},null,8,["code"]),t[7]||(t[7]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetOne,language:"javascript"},null,8,["code"]),t[8]||(t[8]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetOne,language:"python"},null,8,["code"])]),_:1}),u($,{title:"➕ 创建小说"},{default:f(()=>[t[9]||(t[9]=e("div",{class:"api-endpoint"},[e("div",{class:"method post"},"POST"),e("code",null,"/api/novels")],-1)),t[10]||(t[10]=e("p",null,[e("strong",null,"请求体：")],-1)),u(b,{code:s.createBody,language:"json"},null,8,["code"]),t[11]||(t[11]=e("p",null,[e("strong",null,"响应："),l("201 Created，返回创建的小说对象")],-1)),t[12]||(t[12]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 会自动生成")],-1)),t[13]||(t[13]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsCreate,language:"javascript"},null,8,["code"]),t[14]||(t[14]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyCreate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"✏️ 更新小说"},{default:f(()=>[t[15]||(t[15]=e("div",{class:"api-endpoint"},[e("div",{class:"method put"},"PUT"),e("code",null,"/api/novels/:id")],-1)),t[16]||(t[16]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 小说ID")],-1)),t[17]||(t[17]=e("p",null,[e("strong",null,"请求体："),l("要更新的字段（JSON 对象，只需传要修改的字段）")],-1)),u(b,{code:s.updateBody,language:"json"},null,8,["code"]),t[18]||(t[18]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回更新后的小说对象")],-1)),t[19]||(t[19]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 字段不允许修改")],-1)),t[20]||(t[20]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsUpdate,language:"javascript"},null,8,["code"]),t[21]||(t[21]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyUpdate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"🗑️ 删除小说"},{default:f(()=>[t[22]||(t[22]=e("div",{class:"api-endpoint"},[e("div",{class:"method delete"},"DELETE"),e("code",null,"/api/novels/:id")],-1)),t[23]||(t[23]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 小说ID")],-1)),t[24]||(t[24]=e("p",null,[e("strong",null,"响应："),l("204 No Content（成功）或 404 Not Found（不存在）")],-1)),t[25]||(t[25]=e("p",null,[e("strong",null,"注意："),l("删除操作不会删除本地小说文件，仅移除管理器中的引用")],-1)),t[26]||(t[26]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsDelete,language:"javascript"},null,8,["code"]),t[27]||(t[27]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyDelete,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📊 小说数据字段说明"},{default:f(()=>[...t[28]||(t[28]=[e("p",null,"小说对象包含以下字段：",-1),e("ul",null,[e("li",null,[e("code",null,"id"),l(" - 小说唯一标识符（自动生成，不可修改）")]),e("li",null,[e("code",null,"resourceType"),l(' - 资源类型，固定为 "novel"')]),e("li",null,[e("code",null,"name"),l(" - 小说名称（必需）")]),e("li",null,[e("code",null,"description"),l(" - 小说简介")]),e("li",null,[e("code",null,"author"),l(" - 作者")]),e("li",null,[e("code",null,"genre"),l(" - 类型（如：科幻、奇幻、言情等）")]),e("li",null,[e("code",null,"tags"),l(" - 标签数组")]),e("li",null,[e("code",null,"resourcePath"),l(" - 小说文件路径")]),e("li",null,[e("code",null,"coverPath"),l(" - 封面图片路径")]),e("li",null,[e("code",null,"publishYear"),l(" - 出版年份")]),e("li",null,[e("code",null,"visitedSessions"),l(" - 访问会话时间数组（ISO 字符串数组，记录每次阅读时间）")]),e("li",null,[e("code",null,"addedDate"),l(" - 添加日期（自动生成，不可修改）")]),e("li",null,[e("code",null,"rating"),l(" - 评分（1-5 或 0）")]),e("li",null,[e("code",null,"comment"),l(" - 备注")]),e("li",null,[e("code",null,"isFavorite"),l(" - 是否收藏")])],-1)])]),_:1}),u($,{title:"⚠️ 错误处理"},{default:f(()=>[t[29]||(t[29]=e("p",null,"API 使用标准的 HTTP 状态码：",-1)),t[30]||(t[30]=e("ul",null,[e("li",null,[e("code",null,"200 OK"),l(" - 请求成功")]),e("li",null,[e("code",null,"201 Created"),l(" - 资源创建成功")]),e("li",null,[e("code",null,"204 No Content"),l(" - 删除成功")]),e("li",null,[e("code",null,"400 Bad Request"),l(" - 请求参数错误（如缺少必需字段）")]),e("li",null,[e("code",null,"404 Not Found"),l(" - 资源不存在")]),e("li",null,[e("code",null,"500 Internal Server Error"),l(" - 服务器内部错误")])],-1)),t[31]||(t[31]=e("p",null,"错误响应格式：",-1)),u(b,{code:s.errorResponse,language:"json"},null,8,["code"])]),_:1})]),_:1}))}}),ve=A(At,[["__scopeId","data-v-aa75f721"]]),Dt=P({__name:"ApiWebsitesSection",setup(n){const s={websitesArray:`[
  {
    "id": "1738368000000xyz789",
    "resourceType": "website",
    "name": "GitHub",
    "description": "全球最大的代码托管平台",
    "resourcePath": "https://github.com",
    "tags": ["开发", "代码", "开源"],
    "visitedSessions": [
      "2026-01-15T09:00:00.000Z",
      "2026-01-20T14:30:00.000Z",
      "2026-01-25T16:45:00.000Z"
    ],
    "addedDate": "2026-01-10T08:00:00.000Z",
    "rating": 5,
    "comment": "每天都要用",
    "isFavorite": true
  }
]`,websiteObject:`{
  "id": "1738368000000xyz789",
  "resourceType": "website",
  "name": "GitHub",
  "description": "全球最大的代码托管平台",
  "resourcePath": "https://github.com",
  "tags": ["开发", "代码", "开源"],
  "visitedSessions": [
    "2026-01-15T09:00:00.000Z",
    "2026-01-20T14:30:00.000Z",
    "2026-01-25T16:45:00.000Z"
  ],
  "addedDate": "2026-01-10T08:00:00.000Z",
  "rating": 5,
  "comment": "每天都要用",
  "isFavorite": true
}`,createBody:`{
  "name": "GitHub",
  "description": "全球最大的代码托管平台",
  "resourcePath": "https://github.com",
  "tags": ["开发", "代码", "开源"],
  "rating": 5,
  "comment": "每天都要用",
  "isFavorite": true
}`,updateBody:`{
  "description": "全球最大的代码托管和协作平台",
  "tags": ["开发", "代码", "开源", "协作"],
  "rating": 5
}`,errorResponse:`{
  "error": "网站名称不能为空"
}`,jsGetAll:`// 获取所有网站
fetch('http://localhost:3000/api/websites')
  .then(response => response.json())
  .then(websites => console.log(websites))
  .catch(error => console.error('Error:', error));`,jsGetOne:`// 获取单个网站
const websiteId = '1738368000000xyz789';
fetch(\`http://localhost:3000/api/websites/\${websiteId}\`)
  .then(response => response.json())
  .then(website => console.log(website))
  .catch(error => console.error('Error:', error));`,jsCreate:`// 创建网站
fetch('http://localhost:3000/api/websites', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'GitHub',
    description: '全球最大的代码托管平台',
    resourcePath: 'https://github.com',
    tags: ['开发', '代码', '开源'],
    rating: 5
  })
})
  .then(response => response.json())
  .then(website => console.log('Created:', website))
  .catch(error => console.error('Error:', error));`,jsUpdate:`// 更新网站
const websiteId = '1738368000000xyz789';
fetch(\`http://localhost:3000/api/websites/\${websiteId}\`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: '全球最大的代码托管和协作平台',
    tags: ['开发', '代码', '开源', '协作']
  })
})
  .then(response => response.json())
  .then(website => console.log('Updated:', website))
  .catch(error => console.error('Error:', error));`,jsDelete:`// 删除网站
const websiteId = '1738368000000xyz789';
fetch(\`http://localhost:3000/api/websites/\${websiteId}\`, {
  method: 'DELETE'
})
  .then(response => {
    if (response.status === 204) {
      console.log('Website deleted successfully');
    }
  })
  .catch(error => console.error('Error:', error));`,pyGetAll:`import requests

# 获取所有网站
response = requests.get('http://localhost:3000/api/websites')
websites = response.json()
print(websites)`,pyGetOne:`import requests

# 获取单个网站
website_id = '1738368000000xyz789'
response = requests.get(f'http://localhost:3000/api/websites/{website_id}')
website = response.json()
print(website)`,pyCreate:`import requests

# 创建网站
website_data = {
    'name': 'GitHub',
    'description': '全球最大的代码托管平台',
    'resourcePath': 'https://github.com',
    'tags': ['开发', '代码', '开源'],
    'rating': 5
}

response = requests.post('http://localhost:3000/api/websites', json=website_data)
website = response.json()
print('Created:', website)`,pyUpdate:`import requests

# 更新网站
website_id = '1738368000000xyz789'
update_data = {
    'description': '全球最大的代码托管和协作平台',
    'tags': ['开发', '代码', '开源', '协作']
}

response = requests.put(f'http://localhost:3000/api/websites/{website_id}', json=update_data)
website = response.json()
print('Updated:', website)`,pyDelete:`import requests

# 删除网站
website_id = '1738368000000xyz789'
response = requests.delete(f'http://localhost:3000/api/websites/{website_id}')

if response.status_code == 204:
    print('Website deleted successfully')`};return(a,t)=>(r(),q(M,{title:"🌐 网站管理 API",subtitle:"通过 HTTP API 管理网站书签数据",intro:"网站管理 API 提供了完整的 CRUD 操作，允许您通过 HTTP 请求获取、创建、更新和删除网站书签数据。"},{default:f(()=>[u($,{title:"📥 获取所有网站"},{default:f(()=>[t[0]||(t[0]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/websites")],-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回网站数组")],-1)),u(b,{code:s.websitesArray,language:"json"},null,8,["code"]),t[2]||(t[2]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetAll,language:"javascript"},null,8,["code"]),t[3]||(t[3]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetAll,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📥 获取单个网站"},{default:f(()=>[t[4]||(t[4]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/websites/:id")],-1)),t[5]||(t[5]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 网站ID")],-1)),t[6]||(t[6]=e("p",null,[e("strong",null,"响应："),l("200 OK 返回网站对象，不存在则 404")],-1)),u(b,{code:s.websiteObject,language:"json"},null,8,["code"]),t[7]||(t[7]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsGetOne,language:"javascript"},null,8,["code"]),t[8]||(t[8]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyGetOne,language:"python"},null,8,["code"])]),_:1}),u($,{title:"➕ 创建网站"},{default:f(()=>[t[9]||(t[9]=e("div",{class:"api-endpoint"},[e("div",{class:"method post"},"POST"),e("code",null,"/api/websites")],-1)),t[10]||(t[10]=e("p",null,[e("strong",null,"请求体：")],-1)),u(b,{code:s.createBody,language:"json"},null,8,["code"]),t[11]||(t[11]=e("p",null,[e("strong",null,"响应："),l("201 Created，返回创建的网站对象")],-1)),t[12]||(t[12]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 会自动生成")],-1)),t[13]||(t[13]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsCreate,language:"javascript"},null,8,["code"]),t[14]||(t[14]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyCreate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"✏️ 更新网站"},{default:f(()=>[t[15]||(t[15]=e("div",{class:"api-endpoint"},[e("div",{class:"method put"},"PUT"),e("code",null,"/api/websites/:id")],-1)),t[16]||(t[16]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 网站ID")],-1)),t[17]||(t[17]=e("p",null,[e("strong",null,"请求体："),l("要更新的字段（JSON 对象，只需传要修改的字段）")],-1)),u(b,{code:s.updateBody,language:"json"},null,8,["code"]),t[18]||(t[18]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回更新后的网站对象")],-1)),t[19]||(t[19]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 字段不允许修改")],-1)),t[20]||(t[20]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsUpdate,language:"javascript"},null,8,["code"]),t[21]||(t[21]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyUpdate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"🗑️ 删除网站"},{default:f(()=>[t[22]||(t[22]=e("div",{class:"api-endpoint"},[e("div",{class:"method delete"},"DELETE"),e("code",null,"/api/websites/:id")],-1)),t[23]||(t[23]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 网站ID")],-1)),t[24]||(t[24]=e("p",null,[e("strong",null,"响应："),l("204 No Content（成功）或 404 Not Found（不存在）")],-1)),t[25]||(t[25]=e("p",null,[e("strong",null,"注意："),l("删除操作仅移除管理器中的网站书签")],-1)),t[26]||(t[26]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsDelete,language:"javascript"},null,8,["code"]),t[27]||(t[27]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyDelete,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📊 网站数据字段说明"},{default:f(()=>[...t[28]||(t[28]=[e("p",null,"网站对象包含以下字段：",-1),e("ul",null,[e("li",null,[e("code",null,"id"),l(" - 网站唯一标识符（自动生成，不可修改）")]),e("li",null,[e("code",null,"resourceType"),l(' - 资源类型，固定为 "website"')]),e("li",null,[e("code",null,"name"),l(" - 网站名称（必需）")]),e("li",null,[e("code",null,"description"),l(" - 网站描述")]),e("li",null,[e("code",null,"resourcePath"),l(" - 网站URL地址")]),e("li",null,[e("code",null,"tags"),l(" - 标签数组")]),e("li",null,[e("code",null,"visitedSessions"),l(" - 访问会话时间数组（ISO 字符串数组，记录每次访问时间）")]),e("li",null,[e("code",null,"addedDate"),l(" - 添加日期（自动生成，不可修改）")]),e("li",null,[e("code",null,"rating"),l(" - 评分（1-5 或 0）")]),e("li",null,[e("code",null,"comment"),l(" - 备注")]),e("li",null,[e("code",null,"isFavorite"),l(" - 是否收藏")])],-1)])]),_:1}),u($,{title:"⚠️ 错误处理"},{default:f(()=>[t[29]||(t[29]=e("p",null,"API 使用标准的 HTTP 状态码：",-1)),t[30]||(t[30]=e("ul",null,[e("li",null,[e("code",null,"200 OK"),l(" - 请求成功")]),e("li",null,[e("code",null,"201 Created"),l(" - 资源创建成功")]),e("li",null,[e("code",null,"204 No Content"),l(" - 删除成功")]),e("li",null,[e("code",null,"400 Bad Request"),l(" - 请求参数错误（如缺少必需字段）")]),e("li",null,[e("code",null,"404 Not Found"),l(" - 资源不存在")]),e("li",null,[e("code",null,"500 Internal Server Error"),l(" - 服务器内部错误")])],-1)),t[31]||(t[31]=e("p",null,"错误响应格式：",-1)),u(b,{code:s.errorResponse,language:"json"},null,8,["code"])]),_:1})]),_:1}))}}),ye=A(Dt,[["__scopeId","data-v-89613884"]]),Et=P({__name:"ApiAudioSection",setup(n){const s={audioArray:`{
    "data": [
      {
        "id": "1767042792152n1yc9qrf3",
        "resourceType": "audio",
        "name": "音频名称",
        "description": "音频描述",
        "artist": "艺术家",
        "tags": ["标签1", "标签2"],
        "actors": ["演员1", "演员2"],
        "coverPath": "C:/Music/cover.png",
        "resourcePath": "C:/Music/song.mp3",
        "visitedSessions": [
          "2025-12-29T22:05:34.528Z",
          "2026-01-21T08:53:13.157Z"
        ],
        "addedDate": "2025-12-29T21:13:12.152Z",
        "rating": 5,
        "comment": "好听",
        "isFavorite": true
      }
    ]
  }`,audioObject:`{
  "id": "1767042792152n1yc9qrf3",
  "resourceType": "audio",
  "name": "音频名称",
  "description": "音频描述",
  "artist": "艺术家",
  "tags": ["标签1", "标签2"],
  "actors": ["演员1", "演员2"],
  "coverPath": "C:/Music/cover.png",
  "resourcePath": "C:/Music/song.mp3",
  "visitedSessions": [
    "2025-12-29T22:05:34.528Z",
    "2026-01-21T08:53:13.157Z"
  ],
  "addedDate": "2025-12-29T21:13:12.152Z",
  "rating": 5,
  "comment": "好听",
  "isFavorite": true
}`,createBody:`{
  "name": "音频名称",
  "description": "音频描述",
  "artist": "艺术家",
  "tags": ["标签1", "标签2"],
  "actors": ["演员1", "演员2"],
  "coverPath": "C:/Music/cover.png",
  "resourcePath": "C:/Music/song.mp3",
  "visitedSessions": [],
  "rating": 0,
  "comment": "",
  "isFavorite": false
}`,updateBody:`{
  "name": "更新后的音频名",
  "description": "更新后的描述",
  "rating": 5,
  "tags": ["新标签1", "新标签2"],
  "isFavorite": true
}`,errorResponse:`{
  "error": "错误信息"
}`,jsGetAll:`const res = await fetch('http://127.0.0.1:8765/api/audio')
const audio = await res.json()`,jsGetOne:`const res = await fetch('http://127.0.0.1:8765/api/audio/1234567890abc')
const audio = await res.json()`,jsCreate:`const res = await fetch('http://127.0.0.1:8765/api/audio', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新音频',
    artist: '艺术家',
    resourcePath: 'C:/Music/song.mp3'
  })
})
const createdAudio = await res.json()`,jsUpdate:`const res = await fetch('http://127.0.0.1:8765/api/audio/1234567890abc', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '更新后的音频名' })
})
const updatedAudio = await res.json()`,jsDelete:`await fetch('http://127.0.0.1:8765/api/audio/1234567890abc', { method: 'DELETE' })
// 成功返回 204，无响应体`,pyGetAll:`import requests
response = requests.get('http://127.0.0.1:8765/api/audio')
audio = response.json()`,pyGetOne:`import requests
response = requests.get('http://127.0.0.1:8765/api/audio/1234567890abc')
audio = response.json()`,pyCreate:`import requests
new_audio = {
    'name': '新音频',
    'artist': '艺术家',
    'resourcePath': 'C:/Music/song.mp3'
}
response = requests.post('http://127.0.0.1:8765/api/audio', json=new_audio)
created_audio = response.json()`,pyUpdate:`import requests
update_data = {'name': '更新后的音频名'}
response = requests.put('http://127.0.0.1:8765/api/audio/1234567890abc', json=update_data)
updated_audio = response.json()`,pyDelete:`import requests
response = requests.delete('http://127.0.0.1:8765/api/audio/1234567890abc')
# 成功返回 204，无响应体`};return(a,t)=>(r(),q(M,{title:"🎵 音频管理 API",subtitle:"通过 HTTP API 管理音频数据",intro:"音频的CRUD操作。"},{default:f(()=>[u($,{title:"📥 获取音频信息"},{default:f(()=>[t[0]||(t[0]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/audio")],-1)),t[1]||(t[1]=e("p",null,[e("strong",null,"参数："),e("br"),l(" 备注：不传参数即可查询所有音频 ")],-1)),t[2]||(t[2]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回音频数组。例如：")],-1)),u(b,{code:s.audioArray,language:"json"},null,8,["code"]),t[3]||(t[3]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsGetAll,language:"javascript"},null,8,["code"]),t[4]||(t[4]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyGetAll,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📥 获取单个音频"},{default:f(()=>[t[5]||(t[5]=e("div",{class:"api-endpoint"},[e("div",{class:"method get"},"GET"),e("code",null,"/api/audio/:id")],-1)),t[6]||(t[6]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 音频ID")],-1)),t[7]||(t[7]=e("p",null,[e("strong",null,"响应："),l("200 OK 返回音频对象，不存在则 404。例如：")],-1)),u(b,{code:s.audioObject,language:"json"},null,8,["code"]),t[8]||(t[8]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsGetOne,language:"javascript"},null,8,["code"]),t[9]||(t[9]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyGetOne,language:"python"},null,8,["code"])]),_:1}),u($,{title:"➕ 创建音频"},{default:f(()=>[t[10]||(t[10]=e("div",{class:"api-endpoint"},[e("div",{class:"method post"},"POST"),e("code",null,"/api/audio")],-1)),t[11]||(t[11]=e("p",null,[e("strong",null,"请求体：")],-1)),u(b,{code:s.createBody,language:"json"},null,8,["code"]),t[12]||(t[12]=e("p",null,[e("strong",null,"响应："),l("201 Created，返回创建的音频对象。例如：")],-1)),t[13]||(t[13]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 会自动生成")],-1)),t[14]||(t[14]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsCreate,language:"javascript"},null,8,["code"]),t[15]||(t[15]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyCreate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"✏️ 更新音频"},{default:f(()=>[t[16]||(t[16]=e("div",{class:"api-endpoint"},[e("div",{class:"method put"},"PUT"),e("code",null,"/api/audio/:id")],-1)),t[17]||(t[17]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 音频ID")],-1)),t[18]||(t[18]=e("p",null,[e("strong",null,"请求体："),l("要更新的字段（JSON 对象，只需传要修改的字段）")],-1)),u(b,{code:s.updateBody,language:"json"},null,8,["code"]),t[19]||(t[19]=e("p",null,[e("strong",null,"响应："),l("200 OK，返回更新后的音频对象。例如：")],-1)),t[20]||(t[20]=e("p",null,[e("strong",null,"注意："),l("ID 和 addedDate 字段不允许修改")],-1)),t[21]||(t[21]=e("p",{class:"code-label"},"JavaScript代码示例",-1)),u(b,{code:s.jsUpdate,language:"javascript"},null,8,["code"]),t[22]||(t[22]=e("p",{class:"code-label"},"Python代码示例",-1)),u(b,{code:s.pyUpdate,language:"python"},null,8,["code"])]),_:1}),u($,{title:"🗑️ 删除音频"},{default:f(()=>[t[23]||(t[23]=e("div",{class:"api-endpoint"},[e("div",{class:"method delete"},"DELETE"),e("code",null,"/api/audio/:id")],-1)),t[24]||(t[24]=e("p",null,[e("strong",null,"参数："),e("code",null,"id"),l(" - 音频ID")],-1)),t[25]||(t[25]=e("p",null,[e("strong",null,"响应："),l("204 No Content（成功）或 404 Not Found（不存在）")],-1)),t[26]||(t[26]=e("p",null,[e("strong",null,"注意："),l("删除操作不会删除本地音频文件，仅移除管理器中的引用")],-1)),t[27]||(t[27]=e("p",{class:"code-label"},"JavaScript",-1)),u(b,{code:s.jsDelete,language:"javascript"},null,8,["code"]),t[28]||(t[28]=e("p",{class:"code-label"},"Python",-1)),u(b,{code:s.pyDelete,language:"python"},null,8,["code"])]),_:1}),u($,{title:"📊 音频数据字段说明"},{default:f(()=>[...t[29]||(t[29]=[e("p",null,"音频对象包含以下字段：",-1),e("ul",null,[e("li",null,[e("code",null,"id"),l(" - 音频唯一标识符（自动生成，不可修改）")]),e("li",null,[e("code",null,"resourceType"),l(' - 资源类型，固定为 "audio"')]),e("li",null,[e("code",null,"name"),l(" - 音频名称（必需）")]),e("li",null,[e("code",null,"description"),l(" - 音频描述")]),e("li",null,[e("code",null,"artist"),l(" - 艺术家")]),e("li",null,[e("code",null,"tags"),l(" - 标签数组")]),e("li",null,[e("code",null,"actors"),l(" - 演员数组")]),e("li",null,[e("code",null,"resourcePath"),l(" - 音频文件路径")]),e("li",null,[e("code",null,"coverPath"),l(" - 封面图片路径")]),e("li",null,[e("code",null,"visitedSessions"),l(" - 访问会话时间数组（ISO 字符串数组，记录每次访问时间）")]),e("li",null,[e("code",null,"addedDate"),l(" - 添加日期（自动生成，不可修改）")]),e("li",null,[e("code",null,"rating"),l(" - 评分（1-5 或 0）")]),e("li",null,[e("code",null,"comment"),l(" - 备注")]),e("li",null,[e("code",null,"isFavorite"),l(" - 是否收藏")])],-1)])]),_:1}),u($,{title:"⚠️ 错误处理"},{default:f(()=>[t[30]||(t[30]=e("p",null,"API 使用标准的 HTTP 状态码：",-1)),t[31]||(t[31]=e("ul",null,[e("li",null,[e("strong",null,"200 OK："),l("请求成功")]),e("li",null,[e("strong",null,"201 Created："),l("资源创建成功")]),e("li",null,[e("strong",null,"204 No Content："),l("删除成功（无响应体）")]),e("li",null,[e("strong",null,"400 Bad Request："),l("请求参数错误（如缺少必需字段）")]),e("li",null,[e("strong",null,"404 Not Found："),l("资源不存在")]),e("li",null,[e("strong",null,"500 Internal Server Error："),l("服务器内部错误")])],-1)),t[32]||(t[32]=e("p",null,"错误响应格式：",-1)),u(b,{code:s.errorResponse,language:"json"},null,8,["code"])]),_:1})]),_:1}))}}),be=A(Et,[["__scopeId","data-v-7334967c"]]),he=P({__name:"FaqSection",setup(n){return(s,a)=>(r(),q(M,{title:"❓ 常见问题",subtitle:"这里本来没有问题，问的人多了就有了问题"},{default:f(()=>[...a[0]||(a[0]=[e("div",{class:"faq-content"},[e("div",{class:"faq-category"},[e("h3",null,"神秘问题"),e("div",{class:"faq-list"},[e("div",{class:"faq-item"},[e("h4",null,"Q: 在管理器内删除资源后，本地的资源会删除吗？"),e("p",null,"A: 永远不会！管理器只会删除资源在管理器内的引用，不会删除本地的资源。")]),e("div",{class:"faq-item"},[e("h4",null,"Q: 为什么开启隐藏模式后，所有的封面图都看不见了？"),e("p",null,"A: 开启隐藏模式后，系统会自动读取根目录的disguise文件夹，但是这个文件夹默认的空的。所以请自行把伪装的图片放进去")])])])],-1)])]),_:1}))}}),Bt=P({__name:"WorkshopSection",setup(n){return(s,a)=>(r(),q(M,{title:"🎨 创意工坊手册",subtitle:"了解创意工坊的功能和使用方法",intro:"创意工坊功能正在开发中，敬请期待。"},{default:f(()=>[u($,{title:"📝 功能说明"},{default:f(()=>[...a[0]||(a[0]=[e("p",null,"创意工坊功能即将上线，届时您可以：",-1),e("ul",null,[e("li",null,"浏览和下载社区创作的内容"),e("li",null,"分享自己的创作作品"),e("li",null,"与其他用户交流互动"),e("li",null,"发现更多有趣的内容")],-1),e("p",null,"更多详细信息将在功能上线后更新。",-1)])]),_:1})]),_:1}))}}),ke=A(Bt,[["__scopeId","data-v-18bfb45b"]]),Ot={class:"support-group-card"},qt={class:"group-info"},Gt={class:"group-link-container"},Mt={class:"group-link-text"},Vt={class:"contact-methods"},Rt={class:"contact-method"},Nt={class:"contact-details"},Ut={class:"contact-method"},Lt={class:"contact-details"},$e=P({__name:"SupportSection",setup(n){const{openExternalLink:s,copyToClipboard:a}=ee();return(t,o)=>(r(),q(M,{title:"💬 客服群&问题反馈",subtitle:"有问题？找我们！"},{default:f(()=>[u($,{title:"🎯 加入客服群"},{default:f(()=>[o[9]||(o[9]=e("p",null,"如果您在使用过程中遇到任何问题，或者有任何建议和反馈，欢迎加入我们的客服群！",-1)),e("div",Ot,[e("div",qt,[o[6]||(o[6]=e("h3",null,"QQ客服群",-1)),o[7]||(o[7]=e("p",{class:"group-description"},"在这里您可以：",-1)),o[8]||(o[8]=e("ul",null,[e("li",null,"反馈使用中遇到的问题"),e("li",null,"提出功能建议和改进意见"),e("li",null,"与其他用户交流使用心得"),e("li",null,"获取最新的更新信息")],-1)),e("div",Gt,[e("div",{onClick:o[0]||(o[0]=i=>E(s)("https://qm.qq.com/q/qD9za7lqOQ")),class:"group-link-button"},[...o[4]||(o[4]=[e("span",{class:"link-icon"},"💬",-1),e("span",{class:"link-text"},"点击加入客服群",-1)])])]),e("p",Mt,[o[5]||(o[5]=l("或复制链接：",-1)),e("span",{onClick:o[1]||(o[1]=i=>E(a)("https://qm.qq.com/q/qD9za7lqOQ")),class:"copy-link"},"https://qm.qq.com/q/qD9za7lqOQ")])])])]),_:1}),u($,{title:"📧 问题反馈渠道"},{default:f(()=>[e("div",Vt,[e("div",Rt,[o[12]||(o[12]=e("span",{class:"contact-icon"},"🐙",-1)),e("div",Nt,[o[10]||(o[10]=e("h4",null,"GitHub Issues",-1)),o[11]||(o[11]=e("p",null,"如果您发现 bug 或有技术问题，可以在 GitHub Issues 中反馈",-1)),e("span",{onClick:o[2]||(o[2]=i=>E(s)(E(J).issuesUrl)),class:"external-link"},w(E(J).issuesUrl),1)])]),e("div",Ut,[o[15]||(o[15]=e("span",{class:"contact-icon"},"📝",-1)),e("div",Lt,[o[13]||(o[13]=e("h4",null,"腾讯文档问题反馈",-1)),o[14]||(o[14]=e("p",null,"您也可以通过腾讯文档提交问题反馈和建议",-1)),e("span",{onClick:o[3]||(o[3]=i=>E(s)("https://docs.qq.com/sheet/DQmNVemhqc2dMV3d1?tab=h2pjf7")),class:"external-link"}," 点击打开问题反馈表格 ")])])])]),_:1})]),_:1}))}}),zt={class:"hat-soft-showcase"},Zt={class:"hat-soft-logo-container"},Jt=["src"],Ht={class:"hat-soft-content"},Kt={class:"hat-soft-links"},Wt={class:"personal-showcase"},Qt={class:"personal-content"},Yt={class:"personal-links"},Xt={class:"collaborators-showcase"},en={class:"collaborators-content"},tn={class:"collaborators-list"},nn=["onClick"],ln={class:"collaborator-image-container"},sn=["src","alt"],on={class:"collaborator-name"},an="./",we=P({__name:"AboutSection",setup(n){const{openExternalLink:s}=ee(),a=F([{name:"猫猫D菌_NekoD",image:"./imgs/猫猫D菌_NekoD.jpg",link:"https://github.com/CutrelyAlex"},{name:"blycr",image:"./imgs/blycr.png",link:"https://github.com/blycr"}]);return(t,o)=>{const i=H("fun-business-card");return r(),q(M,{title:"ℹ️ 关于我们",subtitle:"了解 GreenResourcesManager 的更多信息"},{default:f(()=>[e("div",zt,[o[6]||(o[6]=e("div",{class:"showcase-header"},[e("h2",{class:"showcase-title"},"关于社群")],-1)),e("div",Zt,[e("img",{src:an+"hat-soft.png",alt:"帽子社",class:"hat-soft-logo"},null,8,Jt)]),e("div",Ht,[o[5]||(o[5]=e("p",{class:"hat-soft-description"}," 帽子社是一个专注于实验游戏开发和游戏理论研究的社群，同时也会涉猎游戏相关的工具、产品开发。如果对游戏感兴趣，欢迎加入我们。 ",-1)),e("div",Kt,[e("div",{class:"hat-soft-link-item",onClick:o[0]||(o[0]=p=>E(s)("https://qm.qq.com/q/sUCdrpPNkc"))},[...o[3]||(o[3]=[e("span",{class:"link-icon"},"💬",-1),e("div",{class:"link-content"},[e("span",{class:"link-title"},"通知中心"),e("span",{class:"link-subtitle"},"加入QQ群")],-1)])]),e("div",{class:"hat-soft-link-item",onClick:o[1]||(o[1]=p=>E(s)("https://hat-soft.top/"))},[...o[4]||(o[4]=[e("span",{class:"link-icon"},"🌐",-1),e("div",{class:"link-content"},[e("span",{class:"link-title"},"官方网站"),e("span",{class:"link-subtitle"},"hat-soft.top")],-1)])])])])]),e("div",Wt,[o[9]||(o[9]=e("div",{class:"showcase-header"},[e("h2",{class:"showcase-title"},"关于开发者")],-1)),u(i),e("div",Qt,[o[8]||(o[8]=e("p",{class:"personal-description"}," 独立游戏制作人。擅长实验性叙事游戏设计、unity开发、RPGMakerMV开发、Godot开发、WEB开发、作曲、2D美术、游戏理论研究。 ",-1)),e("div",Yt,[e("div",{class:"personal-link-item",onClick:o[2]||(o[2]=p=>E(s)("https://klsdf.github.io/Profile/"))},[...o[7]||(o[7]=[e("span",{class:"link-icon"},"💼",-1),e("div",{class:"link-content"},[e("span",{class:"link-title"},"个人作品集"),e("span",{class:"link-subtitle"},"查看更多项目")],-1)])])])])]),e("div",Xt,[o[11]||(o[11]=e("div",{class:"showcase-header"},[e("h2",{class:"showcase-title"},"关于协作者")],-1)),e("div",en,[o[10]||(o[10]=e("p",{class:"collaborators-description"}," 感谢所有为这个项目做出贡献的协作者们。他们的支持和帮助让这个项目变得更好。 ",-1)),e("div",tn,[(r(!0),c(N,null,L(a.value,p=>(r(),c("div",{class:D(["collaborator-card",{clickable:p.link}]),key:p.name,onClick:x=>p.link?E(s)(p.link):null},[e("div",ln,[e("img",{src:p.image,alt:p.name,class:"collaborator-image"},null,8,sn)]),e("div",on,w(p.name),1)],10,nn))),128))])])])]),_:1})}}}),un=P({name:"HelpView",components:{HelpSidebar:lt,IntroSection:se,GeneralSection:oe,GameSection:ae,ImageSection:ie,VideoSection:ue,NovelSection:re,WebsiteSection:de,AudioSection:ce,ApiSection:pe,ApiGamesSection:fe,ApiMangaSection:me,ApiVideosSection:ge,ApiNovelsSection:ve,ApiWebsitesSection:ye,ApiAudioSection:be,FaqSection:he,SupportSection:$e,AboutSection:we,WorkshopSection:ke},setup(){const n=F("intro"),s={intro:se,general:oe,game:ae,image:ie,video:ue,novel:re,website:de,audio:ce,api:pe,"api-games":fe,"api-manga":me,"api-videos":ge,"api-novels":ve,"api-websites":ye,"api-audio":be,faq:he,support:$e,about:we,workshop:ke},a=G(()=>s[n.value]);function t(o){n.value=o}return{activeSection:n,currentSectionComponent:a,setActiveSection:t}}}),rn={class:"help-view"},dn={class:"help-content"};function cn(n,s,a,t,o,i){const p=H("HelpSidebar");return r(),c("div",rn,[u(p,{"active-section":n.activeSection,onSectionChange:n.setActiveSection},null,8,["active-section","onSectionChange"]),e("div",dn,[n.currentSectionComponent?(r(),q(Ce(n.currentSectionComponent),{key:0})):T("",!0)])])}const pn=A(un,[["render",cn],["__scopeId","data-v-b4eec40d"]]),fn=["disabled","type"],mn={key:0,class:"fun-button__icon"},gn=P({__name:"FunButton",props:{type:{default:"default"},icon:{default:""},disabled:{type:Boolean,default:!1},nativeType:{default:"button"}},emits:["click"],setup(n,{emit:s}){const a=n,t=s,o=i=>{a.disabled||t("click",i)};return(i,p)=>(r(),c("button",{class:D(["fun-button",[`fun-button--${n.type}`,{"fun-button--icon-only":n.icon&&!i.$slots.default}]]),disabled:n.disabled,type:n.nativeType,onClick:o},[n.icon?(r(),c("span",mn,w(n.icon),1)):T("",!0),R(i.$slots,"default",{},void 0)],10,fn))}}),Y=A(gn,[["__scopeId","data-v-cc9226e9"]]),vn={class:"fun-tag"},yn={class:"fun-tag__text"},bn=["aria-label"],hn=P({__name:"FunTag",props:{text:{default:""},closable:{type:Boolean,default:!1}},emits:["close"],setup(n,{emit:s}){const a=s;function t(o){o.stopPropagation(),a("close")}return(o,i)=>(r(),c("span",vn,[e("span",yn,[R(o.$slots,"default",{},()=>[l(w(n.text),1)])]),n.closable?(r(),c("button",{key:0,type:"button",class:"fun-tag__close",onClick:t,"aria-label":`删除标签 ${n.text||""}`}," × ",8,bn)):T("",!0)]))}}),kn=A(hn,[["__scopeId","data-v-0f5865b8"]]),$n={class:"fun-switch"},wn=["checked","disabled"],xn=P({__name:"FunSwitch",props:{modelValue:{type:Boolean},disabled:{type:Boolean,default:!1}},emits:["update:modelValue"],setup(n,{emit:s}){const a=s;function t(o){const i=o.target.checked;a("update:modelValue",i)}return(o,i)=>(r(),c("label",$n,[e("input",{type:"checkbox",checked:n.modelValue,disabled:n.disabled,onChange:t},null,40,wn),i[0]||(i[0]=e("span",{class:"fun-switch__slider"},null,-1))]))}}),_n=A(xn,[["__scopeId","data-v-603fe64f"]]),Cn={class:"fun-slider"},Sn=["value","min","max","step","disabled"],jn={key:0,class:"fun-slider__value"},Tn=P({__name:"FunSlider",props:{modelValue:{},min:{default:0},max:{default:100},step:{default:1},disabled:{type:Boolean,default:!1},showValue:{type:Boolean,default:!0},unit:{default:""},format:{type:Function,default:void 0}},emits:["update:modelValue"],setup(n,{emit:s}){const a=n,t=s;function o(p){const x=parseFloat(p.target.value);t("update:modelValue",x)}function i(p){if(p==null||isNaN(p)){const x=a.min||0;return a.unit?`${x} ${a.unit}`:String(x)}return a.format?a.format(p):a.unit?`${p} ${a.unit}`:String(p)}return(p,x)=>(r(),c("div",Cn,[e("input",{type:"range",value:n.modelValue,onInput:o,min:n.min,max:n.max,step:n.step,disabled:n.disabled,class:"fun-slider__input"},null,40,Sn),n.showValue?(r(),c("span",jn,w(i(n.modelValue)),1)):T("",!0)]))}}),Pn=A(Tn,[["__scopeId","data-v-da7b7b76"]]),Fn=["type","value","placeholder","readonly","disabled","maxlength","autofocus","autocomplete","spellcheck"],In=P({__name:"FunInput",props:{modelValue:{},type:{default:"text"},placeholder:{default:""},readonly:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},inputStyle:{default:()=>({})},maxLength:{default:void 0},autofocus:{type:Boolean,default:!1},autocomplete:{default:"off"},spellcheck:{type:Boolean,default:!1},error:{type:Boolean,default:!1}},emits:["update:modelValue","blur","focus","keydown","keyup","keypress","paste","copy","cut","enter","escape","comma","tab","arrow-up","arrow-down","arrow-left","arrow-right","ctrl-c","ctrl-v","ctrl-x","ctrl-a","ctrl-z","ctrl-y","clear"],setup(n,{expose:s,emit:a}){const t=n,o=a,i=F(null),p=d=>{const C=d.target;o("update:modelValue",C.value)},x=d=>{o("blur",d)},_=d=>{o("focus",d)},k=d=>{if(o("keydown",d),d.key==="Enter"?o("enter",d):d.key==="Escape"?o("escape",d):d.key===","||d.key==="Comma"?o("comma",d):d.key==="Tab"?o("tab",d):d.key==="ArrowUp"?o("arrow-up",d):d.key==="ArrowDown"?o("arrow-down",d):d.key==="ArrowLeft"?o("arrow-left",d):d.key==="ArrowRight"&&o("arrow-right",d),(d.key==="Delete"||d.key==="Backspace")&&d.ctrlKey){const C=d.target;C.selectionStart===0&&C.selectionEnd===C.value.length&&(o("clear"),o("update:modelValue",""),d.preventDefault())}(d.ctrlKey||d.metaKey)&&(d.key==="c"||d.key==="C"?o("ctrl-c",d):d.key==="v"||d.key==="V"?o("ctrl-v",d):d.key==="x"||d.key==="X"?o("ctrl-x",d):d.key==="a"||d.key==="A"?o("ctrl-a",d):d.key==="z"||d.key==="Z"?o("ctrl-z",d):(d.key==="y"||d.key==="Y")&&o("ctrl-y",d))},g=d=>{o("keyup",d)},m=d=>{o("keypress",d)},v=d=>{o("paste",d)},y=d=>{o("copy",d)},h=d=>{o("cut",d)};return s({focus:()=>{var d;(d=i.value)==null||d.focus()},blur:()=>{var d;(d=i.value)==null||d.blur()},select:()=>{var d;(d=i.value)==null||d.select()},setSelectionRange:(d,C)=>{var j;(j=i.value)==null||j.setSelectionRange(d,C)},getInputElement:()=>i.value}),Z(()=>t.autofocus,d=>{d&&i.value&&i.value.focus()}),xe(()=>{t.autofocus&&i.value&&i.value.focus()}),(d,C)=>(r(),c("input",{ref_key:"inputRef",ref:i,class:D(["fun-input",{"fun-input--readonly":n.readonly,"fun-input--disabled":n.disabled,"fun-input--error":n.error}]),type:n.type,value:n.modelValue,onInput:p,onBlur:x,onFocus:_,onKeydown:k,onKeyup:g,onKeypress:m,onPaste:v,onCopy:y,onCut:h,placeholder:n.placeholder,readonly:n.readonly,disabled:n.disabled,maxlength:n.maxLength,autofocus:n.autofocus,autocomplete:n.autocomplete,spellcheck:n.spellcheck,style:z(n.inputStyle)},null,46,Fn))}}),An=A(In,[["__scopeId","data-v-cf049ed1"]]),Dn={class:"fun-rate"},En=["onMouseenter","onClick"],Bn={key:0,class:"fun-rate__comment"},On=["value","placeholder","rows"],qn=P({__name:"FunRate",props:{modelValue:{default:0},maxStars:{default:5},showText:{type:Boolean,default:!0},showComment:{type:Boolean,default:!1},comment:{default:""},commentPlaceholder:{default:"在此输入你的评价..."},commentRows:{default:4},noRatingText:{default:"未评价"},starIcon:{default:"★"},disabled:{type:Boolean,default:!1}},emits:["update:modelValue","update:comment","change","comment-change"],setup(n,{emit:s}){const a=n,t=s,o=F(0),i=G(()=>o.value>0?o.value:a.modelValue||0);function p(v){a.disabled||(o.value=v)}function x(){o.value=0}function _(v){a.disabled||(t("update:modelValue",v),t("change",v),o.value=0)}function k(v){return{1:"劣作",2:"庸作",3:"良作",4:"佳作",5:"神作"}[v]||""}function g(v){const y=v.target;t("update:comment",y.value),t("comment-change",y.value)}function m(v){const y=v.target;t("update:comment",y.value),t("comment-change",y.value)}return(v,y)=>(r(),c("div",Dn,[e("div",{class:"fun-rate__stars",onMouseleave:x},[(r(!0),c(N,null,L(n.maxStars,h=>(r(),c("span",{key:h,class:D(["fun-rate__star",{"fun-rate__star--filled":h<=i.value}]),onMouseenter:d=>p(h),onClick:d=>_(h)},w(n.starIcon),43,En))),128)),n.showText?(r(),c("span",{key:0,class:D(["fun-rate__text",{"fun-rate__text--no-rating":i.value===0}])},w(i.value>0?k(i.value):n.noRatingText),3)):T("",!0)],32),n.showComment?(r(),c("div",Bn,[e("textarea",{class:"fun-rate__comment-input",value:n.comment,onInput:g,onBlur:m,placeholder:n.commentPlaceholder,rows:n.commentRows},null,40,On)])):T("",!0)]))}}),Gn=A(qn,[["__scopeId","data-v-ede45b70"]]),Mn={class:"fun-tag-input"},Vn={class:"fun-tag-input__display"},Rn={key:1,class:"fun-tag-input__max-hint"},Nn={class:"fun-tag-input__max-text"},Un=P({__name:"FunTagInput",props:{modelValue:{default:()=>[]},placeholder:{default:"输入标签后按回车或逗号添加"},disabled:{type:Boolean,default:!1},maxTags:{default:void 0},autofocus:{type:Boolean,default:!1},allowDuplicate:{type:Boolean,default:!1},inputStyle:{default:()=>({border:"none",background:"transparent",padding:"var(--spacing-xs, 4px) 0",boxShadow:"none",minWidth:"auto"})}},emits:["update:modelValue","add","remove","change","blur"],setup(n,{expose:s,emit:a}){const t=n,o=a,i=F(""),p=F(null);function x(){const m=i.value.trim();if(!m)return;if(t.maxTags&&t.modelValue.length>=t.maxTags){i.value="";return}if(!t.allowDuplicate&&t.modelValue.includes(m)){i.value="";return}const v=[...t.modelValue,m];o("update:modelValue",v),o("add",m),o("change",v),i.value=""}function _(m){if(!t.disabled&&m>=0&&m<t.modelValue.length){const v=t.modelValue[m],y=t.modelValue.filter((h,d)=>d!==m);o("update:modelValue",y),o("remove",v,m),o("change",y)}}function k(m){o("blur",m),i.value.trim()&&x()}async function g(m){var v,y;if(console.log("[FunTagInput] setInputValue 被调用，value:",m,"当前 tagInput.value:",i.value),i.value=m,await K(),p.value){const h=(y=(v=p.value).getInputElement)==null?void 0:y.call(v);h&&h instanceof HTMLInputElement&&(h.value=m,h.dispatchEvent(new Event("input",{bubbles:!0})))}console.log("[FunTagInput] setInputValue 执行后，tagInput.value:",i.value)}return s({setInputValue:g,inputRef:p}),(m,v)=>{const y=H("fun-tag"),h=H("fun-input");return r(),c("div",Mn,[e("div",Vn,[(r(!0),c(N,null,L(n.modelValue,(d,C)=>(r(),q(y,{key:`tag-${C}`,text:d,closable:!n.disabled,onClose:j=>_(C)},null,8,["text","closable","onClose"]))),128))]),!n.disabled&&(!n.maxTags||n.modelValue.length<n.maxTags)?(r(),q(h,{key:0,ref_key:"inputRef",ref:p,modelValue:i.value,"onUpdate:modelValue":v[0]||(v[0]=d=>i.value=d),type:"text",placeholder:n.placeholder,autofocus:n.autofocus,disabled:n.disabled,onEnter:U(x,["prevent"]),onComma:U(x,["prevent"]),onBlur:k,inputStyle:n.inputStyle},null,8,["modelValue","placeholder","autofocus","disabled","inputStyle"])):T("",!0),n.maxTags&&n.modelValue.length>=n.maxTags?(r(),c("div",Rn,[e("span",Nn,"已达到最大标签数 ("+w(n.maxTags)+")",1)])):T("",!0)])}}}),Ln=A(Un,[["__scopeId","data-v-cc147bda"]]),zn=["value","placeholder","readonly","disabled","rows","maxlength","autofocus","spellcheck"],Zn=P({__name:"FunTextarea",props:{modelValue:{},placeholder:{default:""},readonly:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1},rows:{default:3},textareaStyle:{default:()=>({})},maxLength:{default:void 0},autofocus:{type:Boolean,default:!1},spellcheck:{type:Boolean,default:!1},error:{type:Boolean,default:!1}},emits:["update:modelValue","blur","focus","input"],setup(n,{expose:s,emit:a}){const t=n,o=a,i=F(null),p=k=>{const g=k.target;o("update:modelValue",g.value),o("input",k)},x=k=>{o("blur",k)},_=k=>{o("focus",k)};return s({focus:()=>{var k;(k=i.value)==null||k.focus()},blur:()=>{var k;(k=i.value)==null||k.blur()},select:()=>{var k;(k=i.value)==null||k.select()},getTextareaElement:()=>i.value}),Z(()=>t.autofocus,k=>{k&&i.value&&i.value.focus()}),xe(()=>{t.autofocus&&i.value&&i.value.focus()}),(k,g)=>(r(),c("textarea",{ref_key:"textareaRef",ref:i,class:D(["fun-textarea",{"fun-textarea--readonly":n.readonly,"fun-textarea--disabled":n.disabled,"fun-textarea--error":n.error}]),value:n.modelValue,onInput:p,onBlur:x,onFocus:_,placeholder:n.placeholder,readonly:n.readonly,disabled:n.disabled,rows:n.rows,maxlength:n.maxLength,autofocus:n.autofocus,spellcheck:n.spellcheck,style:z(n.textareaStyle)},null,46,zn))}}),Jn=A(Zn,[["__scopeId","data-v-6fd89586"]]),Hn=["value","disabled"],Kn={key:0,value:"",disabled:""},Wn=["value","disabled"],Qn=P({__name:"FunSelect",props:{modelValue:{},options:{default:()=>[]},placeholder:{default:""},disabled:{type:Boolean,default:!1},selectStyle:{default:()=>({})},error:{type:Boolean,default:!1}},emits:["update:modelValue","change","blur","focus"],setup(n,{expose:s,emit:a}){const t=a,o=F(null),i=_=>{const g=_.target.value;t("update:modelValue",g),t("change",g,_)},p=_=>{t("blur",_)},x=_=>{t("focus",_)};return s({focus:()=>{var _;(_=o.value)==null||_.focus()},blur:()=>{var _;(_=o.value)==null||_.blur()},getSelectElement:()=>o.value}),(_,k)=>(r(),c("select",{ref_key:"selectRef",ref:o,class:D(["fun-select",{"fun-select--disabled":n.disabled,"fun-select--error":n.error}]),value:n.modelValue,onChange:i,onBlur:p,onFocus:x,disabled:n.disabled,style:z(n.selectStyle)},[n.placeholder?(r(),c("option",Kn,w(n.placeholder),1)):T("",!0),(r(!0),c(N,null,L(n.options,g=>(r(),c("option",{key:g.value,value:g.value,disabled:g.disabled},w(g.label),9,Wn))),128))],46,Hn))}}),Yn=A(Qn,[["__scopeId","data-v-f546a20d"]]);function Xn(n={}){const{onDrop:s,acceptedExtensions:a=[],enabled:t=!0}=n,o=F(!1);function i(g){if(a.length===0)return!0;const m=g.name.toLowerCase();return a.some(v=>m.endsWith(v.toLowerCase()))}function p(g){t&&(g.preventDefault(),g.dataTransfer&&(g.dataTransfer.dropEffect="copy"))}function x(g){t&&(g.preventDefault(),o.value||(o.value=!0))}function _(g){t&&(g.preventDefault(),(!g.relatedTarget||!g.currentTarget.contains(g.relatedTarget))&&(o.value=!1))}async function k(g){var m;if(!(!t||!s)){g.preventDefault(),o.value=!1;try{const v=Array.from(((m=g.dataTransfer)==null?void 0:m.files)||[]);if(v.length===0)return;const y=a.length>0?v.filter(h=>i(h)):v;if(y.length===0&&a.length>0)return;await s(y)}catch(v){throw console.error("拖拽处理失败:",v),v}}}return{isDragOver:o,handleDragOver:p,handleDragEnter:x,handleDragLeave:_,handleDrop:k}}const el={key:1,class:"fun-drop-zone__content"},tl={class:"fun-drop-zone__text"},nl={class:"fun-drop-zone__title"},ll={class:"fun-drop-zone__hint"},sl={key:2,class:"fun-drop-zone__overlay"},ol={class:"fun-drop-zone__overlay-content"},al={class:"fun-drop-zone__overlay-text"},il=["accept","multiple","disabled"],ul=P({__name:"FunDropZone",props:{disabled:{type:Boolean,default:!1},accept:{default:()=>[]},multiple:{type:Boolean,default:!0},clickable:{type:Boolean,default:!0},title:{default:"拖拽文件到这里或点击上传"},hint:{default:"支持拖拽多个文件"},dragText:{default:"松开鼠标添加文件"},maxSize:{default:0},maxFiles:{default:0}},emits:["drop","error"],setup(n,{emit:s}){const a=n,t=s,o=F(null),i=G(()=>a.accept.length===0?"*":a.accept.join(",")),p=C=>{if(a.maxSize>0&&C.size>a.maxSize){const j=(a.maxSize/1024/1024).toFixed(2);return{valid:!1,error:{type:"size",message:`文件 "${C.name}" 超过最大大小限制 (${j}MB)`}}}if(a.accept.length>0){const j=C.name.toLowerCase();if(!a.accept.some(S=>j.endsWith(S.toLowerCase())))return{valid:!1,error:{type:"type",message:`文件 "${C.name}" 类型不支持，仅支持: ${a.accept.join(", ")}`}}}return{valid:!0}},x=async C=>{if(a.disabled)return;let j=[];for(const I of C){const S=p(I);S.valid?j.push(I):S.error&&t("error",S.error)}a.maxFiles>0&&j.length>a.maxFiles&&(t("error",{type:"count",message:`最多只能上传 ${a.maxFiles} 个文件`}),j=j.slice(0,a.maxFiles)),!a.multiple&&j.length>1&&(j=[j[0]]),j.length>0&&t("drop",j)},{isDragOver:_,handleDragOver:k,handleDragEnter:g,handleDragLeave:m,handleDrop:v}=Xn({acceptedExtensions:a.accept,enabled:!a.disabled,onDrop:x}),y=()=>{var C;a.disabled||!a.clickable||(C=o.value)==null||C.click()},h=C=>{const j=C.target;if(!j.files||j.files.length===0)return;const I=Array.from(j.files);x(I),j.value=""},d=v;return(C,j)=>(r(),c("div",{class:D(["fun-drop-zone",{"fun-drop-zone--dragging":E(_),"fun-drop-zone--disabled":n.disabled}]),onDrop:j[0]||(j[0]=(...I)=>E(d)&&E(d)(...I)),onDragover:j[1]||(j[1]=(...I)=>E(k)&&E(k)(...I)),onDragenter:j[2]||(j[2]=(...I)=>E(g)&&E(g)(...I)),onDragleave:j[3]||(j[3]=(...I)=>E(m)&&E(m)(...I)),onClick:y},[C.$slots.default?R(C.$slots,"default",{key:0,isDragging:E(_)},void 0):(r(),c("div",el,[j[4]||(j[4]=e("div",{class:"fun-drop-zone__icon"},[e("svg",{width:"48",height:"48",viewBox:"0 0 48 48",fill:"none"},[e("path",{d:"M24 8V32M24 32L16 24M24 32L32 24",stroke:"currentColor","stroke-width":"3","stroke-linecap":"round","stroke-linejoin":"round"}),e("path",{d:"M8 40H40",stroke:"currentColor","stroke-width":"3","stroke-linecap":"round"})])],-1)),e("div",tl,[e("p",nl,w(n.title),1),e("p",ll,w(n.hint),1)])])),E(_)?(r(),c("div",sl,[e("div",ol,[R(C.$slots,"dragging",{},()=>[j[5]||(j[5]=e("div",{class:"fun-drop-zone__overlay-icon"},"📁",-1)),e("p",al,w(n.dragText),1)])])])):T("",!0),n.clickable?(r(),c("input",{key:3,ref_key:"fileInputRef",ref:o,type:"file",accept:i.value,multiple:n.multiple,disabled:n.disabled,class:"fun-drop-zone__input",onChange:h},null,40,il)):T("",!0)],34))}}),rl=A(ul,[["__scopeId","data-v-3c2a260a"]]),dl={class:"fun-business-card__face fun-business-card__face--front"},cl=["src","alt"],pl={class:"fun-business-card__overlay"},fl={class:"fun-business-card__hint"},ml={class:"fun-business-card__face fun-business-card__face--back"},gl=["src","alt"],vl={class:"fun-business-card__overlay"},yl={class:"fun-business-card__hint"},bl=P({__name:"FunBusinessCard",props:{frontImage:{default:"./imgs/名片 - 正面.png"},backImage:{default:"./imgs/名片 - 背面.png"},frontAlt:{default:"名片正面"},backAlt:{default:"名片背面"},flipHint:{default:"点击翻转"},width:{default:500},height:{default:750}},setup(n){const s=n,a=F(!1),t=F(0),o=F(0),i=G(()=>a.value?{willChange:"transform",transform:`perspective(1000px) rotateX(${t.value}deg) rotateY(${180+o.value}deg)`}:{willChange:"transform",transform:`perspective(1000px) rotateX(${t.value}deg) rotateY(${o.value}deg)`}),p=G(()=>({width:typeof s.width=="number"?`${s.width}px`:s.width,height:typeof s.height=="number"?`${s.height}px`:s.height}));function x(){a.value=!a.value}function _(g){const v=g.currentTarget.getBoundingClientRect(),y=v.left+v.width/2,h=v.top+v.height/2,d=(g.clientX-y)/(v.width/2),C=(g.clientY-h)/(v.height/2);o.value=d*15,t.value=-C*15}function k(){t.value=0,o.value=0}return(g,m)=>(r(),c("div",{class:"fun-business-card-wrapper",onClick:x,onMousemove:_,onMouseleave:k,style:z(i.value)},[e("div",{class:D(["fun-business-card",{"fun-business-card--flipped":a.value}]),style:z(p.value)},[e("div",dl,[n.frontImage?(r(),c("img",{key:0,src:n.frontImage,alt:n.frontAlt||"名片正面",class:"fun-business-card__image"},null,8,cl)):T("",!0),e("div",pl,[e("span",fl,w(n.flipHint),1)])]),e("div",ml,[n.backImage?(r(),c("img",{key:0,src:n.backImage,alt:n.backAlt||"名片背面",class:"fun-business-card__image"},null,8,gl)):T("",!0),e("div",vl,[e("span",yl,w(n.flipHint),1)])])],6)],36))}}),hl=A(bl,[["__scopeId","data-v-81f250ed"]]),kl=P({__name:"FunCard",props:{shadow:{type:Boolean,default:!0},bordered:{type:Boolean,default:!0},clickable:{type:Boolean,default:!1}},emits:["click"],setup(n,{emit:s}){const a=n,t=G(()=>({"fun-card--no-shadow":!a.shadow,"fun-card--no-border":!a.bordered,"fun-card--clickable":a.clickable})),o=s;function i(p){a.clickable&&o("click",p)}return(p,x)=>(r(),c("div",{class:D(["fun-card",t.value]),onClick:i},[R(p.$slots,"default",{},void 0)],2))}}),$l=A(kl,[["__scopeId","data-v-1bae4a2b"]]),wl={class:"fun-empty-state"},xl={class:"fun-empty-state__icon"},_l={class:"fun-empty-state__title"},Cl={class:"fun-empty-state__description"},Sl={key:1,class:"fun-empty-state__extra"},jl=P({__name:"FunEmptyState",props:{icon:{default:"📦"},title:{default:""},description:{default:""},showButton:{type:Boolean,default:!1},buttonText:{default:"添加第一个项目"}},emits:["action"],setup(n,{emit:s}){const a=s;function t(){a("action")}return(o,i)=>{const p=H("fun-button");return r(),c("div",wl,[e("div",xl,[R(o.$slots,"icon",{},()=>[l(w(n.icon),1)])]),e("h3",_l,[R(o.$slots,"title",{},()=>[l(w(n.title),1)])]),e("p",Cl,[R(o.$slots,"description",{},()=>[l(w(n.description),1)])]),n.showButton?(r(),q(p,{key:0,class:"fun-empty-state__button",onClick:t},{default:f(()=>[l(w(n.buttonText),1)]),_:1})):T("",!0),o.$slots.default?(r(),c("div",Sl,[R(o.$slots,"default",{},void 0)])):T("",!0)])}}}),Tl=A(jl,[["__scopeId","data-v-4bb8e821"]]),Pl={class:"fun-statistic"},Fl={key:0,class:"fun-statistic__icon"},Il={class:"fun-statistic__content"},Al={class:"fun-statistic__value"},Dl={key:0},El={key:1},Bl={key:2,class:"fun-statistic__suffix"},Ol={key:0,class:"fun-statistic__label"},ql=P({__name:"FunStatistic",props:{value:{},label:{default:""},icon:{default:""},suffix:{default:""},loading:{type:Boolean,default:!1},thousandSeparator:{type:Boolean,default:!0}},setup(n){const s=n,a=G(()=>s.loading),t=G(()=>{if(a.value)return"...";const i=s.value;if(typeof i=="string"){if(/^\d+(\.\d+)?[a-zA-Z\u4e00-\u9fa5]+$/.test(i.trim()))return i;const x=parseFloat(i);return isNaN(x)?i:s.thousandSeparator?o(x):x.toString()}return typeof i=="number"?s.thousandSeparator?o(i):i.toString():String(i)});function o(i){return Number.isInteger(i)?i.toLocaleString("zh-CN"):i.toLocaleString("zh-CN",{minimumFractionDigits:0,maximumFractionDigits:2})}return(i,p)=>(r(),c("div",Pl,[n.icon?(r(),c("div",Fl,w(n.icon),1)):T("",!0),e("div",Il,[e("div",Al,[a.value?(r(),c("span",Dl,"...")):(r(),c("span",El,w(t.value),1)),n.suffix?(r(),c("span",Bl,w(n.suffix),1)):T("",!0)]),n.label?(r(),c("div",Ol,w(n.label),1)):T("",!0)])]))}}),Gl=A(ql,[["__scopeId","data-v-e9411e22"]]),Ml={class:"fun-achievement-item__icon"},Vl={key:0},Rl={key:1},Nl={class:"fun-achievement-item__info"},Ul={class:"fun-achievement-item__title"},Ll={key:0,class:"fun-achievement-item__badge fun-achievement-item__badge--completed"},zl={key:1,class:"fun-achievement-item__badge fun-achievement-item__badge--in-progress"},Zl={class:"fun-achievement-item__description"},Jl={key:0,class:"fun-achievement-item__progress"},Hl=["value","max","title"],Kl={class:"fun-achievement-item__progress-text"},Wl=P({__name:"FunAchievementItem",props:{achievement:{}},setup(n){const s=n,a=G(()=>{const i=s.achievement;return i.isHidden&&!i.unlocked?"？？？":i.title}),t=G(()=>{const i=s.achievement;return i.isHidden&&!i.unlocked?i.hiddenTip||"继续探索以解锁这个成就":i.description}),o=G(()=>{const i=s.achievement;if(i.kind!=="progress"||i.target==null)return"进度: 0%";const p=typeof i.current=="number"?i.current:0;return i.target===0?"进度: 0%":`进度: ${Math.min(100,Math.round(p/i.target*100))}%`});return(i,p)=>(r(),c("div",{class:D(["fun-achievement-item",{"fun-achievement-item--completed":n.achievement.unlocked,"fun-achievement-item--in-progress":!n.achievement.unlocked}])},[e("div",Ml,[n.achievement.unlocked?(r(),c("span",Vl,"🏆")):(r(),c("span",Rl,"🔒"))]),e("div",Nl,[e("div",Ul,[l(w(a.value)+" ",1),n.achievement.unlocked?(r(),c("span",Ll,"已完成")):(r(),c("span",zl,"进行中"))]),e("div",Zl,w(t.value),1),n.achievement.kind==="progress"?(r(),c("div",Jl,[e("progress",{value:n.achievement.current??0,max:n.achievement.target??0,title:o.value,class:"fun-achievement-item__progress-bar"},null,8,Hl),e("span",Kl,w(n.achievement.current)+"/"+w(n.achievement.target),1)])):T("",!0)])],2))}}),Ql=A(Wl,[["__scopeId","data-v-c95fbe56"]]),Yl=["src","alt","onError"],Xl={key:2,class:"fun-carousel__dots"},es=["aria-label","onClick"],ts=P({__name:"FunCarousel",props:{items:{},width:{default:"200px"},height:{default:"200px"},fallbackImage:{default:""},imageAlt:{default:""}},setup(n){const s=n,a=F(0),t=F({}),o=G(()=>s.items.map((g,m)=>t.value[m]&&s.fallbackImage?s.fallbackImage:g)),i=G(()=>({width:typeof s.width=="number"?`${s.width}px`:s.width,height:typeof s.height=="number"?`${s.height}px`:s.height})),p=G(()=>({transform:`translateX(-${a.value*100}%)`}));function x(g){t.value={...t.value,[g]:!0}}function _(){const g=s.items.length;g<=1||(a.value=(a.value-1+g)%g)}function k(){const g=s.items.length;g<=1||(a.value=(a.value+1)%g)}return(g,m)=>(r(),c("div",{class:"fun-carousel",style:z(i.value)},[n.items.length>1?(r(),c("button",{key:0,type:"button",class:"fun-carousel__arrow fun-carousel__arrow--left","aria-label":"上一张",onClick:U(_,["stop"])},[...m[0]||(m[0]=[e("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2"},[e("path",{d:"M15 18l-6-6 6-6"})],-1)])])):T("",!0),n.items.length>1?(r(),c("button",{key:1,type:"button",class:"fun-carousel__arrow fun-carousel__arrow--right","aria-label":"下一张",onClick:U(k,["stop"])},[...m[1]||(m[1]=[e("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":"2"},[e("path",{d:"M9 18l6-6-6-6"})],-1)])])):T("",!0),e("div",{class:"fun-carousel__track",style:z(p.value)},[(r(!0),c(N,null,L(n.items,(v,y)=>(r(),c("img",{key:y,src:o.value[y],alt:n.imageAlt,class:"fun-carousel__img",onError:h=>x(y)},null,40,Yl))),128))],4),n.items.length>1?(r(),c("div",Xl,[(r(!0),c(N,null,L(n.items,(v,y)=>(r(),c("button",{key:y,type:"button",class:D(["fun-carousel__dot",{"fun-carousel__dot--active":a.value===y}]),"aria-label":`第 ${y+1} 张`,onClick:U(h=>a.value=y,["stop"])},null,10,es))),128))])):T("",!0)],4))}}),ns=A(ts,[["__scopeId","data-v-c2433075"]]),ls={key:0,class:"fun-pagination"},ss={class:"fun-pagination__info"},os={class:"fun-pagination__info-text"},as={class:"fun-pagination__info-range"},is={class:"fun-pagination__controls"},us={class:"fun-pagination__jump"},rs=["max"],ds=P({__name:"FunPagination",props:{currentPage:{},totalPages:{},pageSize:{},totalItems:{},itemType:{default:"项目"}},emits:["page-change"],setup(n,{emit:s}){const a=n,t=s,o=F(a.currentPage),i=G(()=>(a.currentPage-1)*a.pageSize);Z(()=>a.currentPage,k=>{o.value=k},{immediate:!0});function p(){a.currentPage>1&&t("page-change",a.currentPage-1)}function x(){a.currentPage<a.totalPages&&t("page-change",a.currentPage+1)}function _(){const k=o.value;k>=1&&k<=a.totalPages&&t("page-change",k)}return(k,g)=>{const m=H("fun-button");return n.totalPages>0&&n.totalItems>0?(r(),c("div",ls,[e("div",ss,[e("span",os," 第 "+w(n.currentPage)+" 页，共 "+w(n.totalPages)+" 页 ",1),e("span",as," 显示第 "+w(i.value+1)+" - "+w(Math.min(i.value+n.pageSize,n.totalItems))+" 个，共 "+w(n.totalItems)+" 个"+w(n.itemType),1)]),e("div",is,[u(m,{class:"fun-pagination__button fun-pagination__button--prev",disabled:n.currentPage<=1,onClick:p},{default:f(()=>[...g[1]||(g[1]=[l(" ◀ 上一页 ",-1)])]),_:1},8,["disabled"]),e("div",us,[Se(e("input",{type:"number","onUpdate:modelValue":g[0]||(g[0]=v=>o.value=v),min:1,max:n.totalPages,onKeyup:Te(_,["enter"]),class:"fun-pagination__jump-input",placeholder:"页码"},null,40,rs),[[je,o.value,void 0,{number:!0}]]),u(m,{class:"fun-pagination__jump-button",onClick:_},{default:f(()=>[...g[2]||(g[2]=[l(" 跳转 ",-1)])]),_:1})]),u(m,{class:"fun-pagination__button fun-pagination__button--next",disabled:n.currentPage>=n.totalPages,onClick:x},{default:f(()=>[...g[3]||(g[3]=[l(" 下一页 ▶ ",-1)])]),_:1},8,["disabled"])])])):T("",!0)}}}),cs=A(ds,[["__scopeId","data-v-abe4e826"]]),ps={type:"button",class:"fun-dropdown-trigger-btn"},fs=["onClick"],ms={key:0,class:"fun-dropdown-item-icon"},gs={class:"fun-dropdown-item-label"},vs=P({__name:"FunDropdown",props:{items:{default:()=>[]},modelValue:{},triggerText:{default:"Select"},placement:{default:"bottom"},trigger:{default:"hover"},disabled:{type:Boolean,default:!1}},emits:["update:modelValue","change","open","close"],setup(n,{expose:s,emit:a}){const t=n,o=a,i=F(!1);let p=null;const x=G(()=>[`fun-dropdown-menu--${t.placement}`]);function _(C){return(C.value||C.key||C.id)===t.modelValue}function k(){t.disabled||t.trigger==="click"&&(i.value=!i.value,i.value?o("open"):o("close"))}function g(C){C.stopPropagation()}function m(){t.disabled||t.trigger==="hover"&&(p&&(clearTimeout(p),p=null),h())}function v(){t.trigger==="hover"&&(p=window.setTimeout(()=>{d(),p=null},100))}function y(C){if(C.disabled)return;const j=C.value||C.key||C.id;j!==void 0&&o("update:modelValue",j),o("change",C),i.value=!1,o("close")}function h(){t.disabled||(i.value=!0,o("open"))}function d(){i.value=!1,o("close")}return s({open:h,close:d,toggle:()=>{i.value?d():h()}}),(C,j)=>(r(),c("div",{class:"fun-dropdown",onMouseenter:m,onMouseleave:v},[e("div",{class:"fun-dropdown-trigger",onClick:k},[R(C.$slots,"trigger",{},()=>[e("button",ps,w(n.triggerText),1)])]),u(Pe,{name:"fun-dropdown"},{default:f(()=>[i.value?(r(),c("div",{key:0,class:D(["fun-dropdown-menu",x.value]),onClick:g},[R(C.$slots,"default",{},()=>[(r(!0),c(N,null,L(n.items,I=>(r(),c("button",{key:I.value||I.key||I.id,class:D(["fun-dropdown-item",{"is-selected":_(I)}]),onClick:S=>y(I)},[I.icon?(r(),c("span",ms,w(I.icon),1)):T("",!0),e("span",gs,w(I.label||I.text||I.name),1)],10,fs))),128))],!0)],2)):T("",!0)]),_:3})],32))}}),ys=A(vs,[["__scopeId","data-v-a893456b"]]),bs=P({__name:"FunGrid",props:{columns:{default:void 0},minWidth:{default:200},maxWidth:{default:"1fr"},mode:{default:"auto-fill"},gap:{default:"var(--spacing-md, 16px)"},rowGap:{default:void 0},columnGap:{default:void 0},padding:{default:void 0},singleColumnOnMobile:{type:Boolean,default:!0},scale:{default:void 0},baseWidth:{default:void 0},minScaledWidth:{default:100},maxScaledWidth:{default:void 0},justifyItems:{default:"stretch"},alignItems:{default:"stretch"},customStyle:{default:void 0}},setup(n){const s=n,a=G(()=>{const i=["fun-grid"];return s.mode==="fixed"&&s.columns?(i.push("fun-grid--fixed"),i.push(`fun-grid--columns-${s.columns}`)):s.mode==="auto-fill"?i.push("fun-grid--auto-fill"):s.mode==="auto-fit"&&i.push("fun-grid--auto-fit"),s.singleColumnOnMobile&&i.push("fun-grid--responsive"),i}),t=G(()=>{if(s.scale!==void 0&&s.baseWidth!==void 0){let i=Math.round(s.baseWidth*(s.scale/100));return s.minScaledWidth!==void 0&&(i=Math.max(i,s.minScaledWidth)),s.maxScaledWidth!==void 0&&(i=Math.min(i,s.maxScaledWidth)),i}return s.minWidth}),o=G(()=>{const i={};if(s.rowGap!==void 0)i.rowGap=typeof s.rowGap=="number"?`${s.rowGap}px`:String(s.rowGap);else if(s.gap!==void 0){const p=typeof s.gap=="number"?`${s.gap}px`:String(s.gap);i.gap=p}if(s.columnGap!==void 0&&(i.columnGap=typeof s.columnGap=="number"?`${s.columnGap}px`:String(s.columnGap)),s.padding!==void 0&&(i.padding=typeof s.padding=="number"?`${s.padding}px`:String(s.padding)),s.justifyItems!=="stretch"&&(i.justifyItems=s.justifyItems),s.alignItems!=="stretch"&&(i.alignItems=s.alignItems),s.mode==="fixed"&&s.columns!==void 0)i.gridTemplateColumns=`repeat(${s.columns}, 1fr)`;else if(s.mode==="auto-fill"||s.mode==="auto-fit"){const p=typeof t.value=="number"?`${t.value}px`:String(t.value);i.gridTemplateColumns=`repeat(${s.mode}, minmax(${p}, ${s.maxWidth}))`}return s.customStyle&&Object.assign(i,s.customStyle),i});return(i,p)=>(r(),c("div",{class:D(["fun-grid",a.value]),style:z(o.value)},[R(i.$slots,"default",{},void 0)],6))}}),hs=A(bs,[["__scopeId","data-v-708afa9a"]]),ks={class:"fun-alert__header"},$s={class:"fun-alert__icon"},ws={key:0},xs={key:1},_s={key:2},Cs={key:3},Ss={class:"fun-alert__title"},js={class:"fun-alert__body"},Ts={class:"fun-alert__message"},Ps={class:"fun-alert__footer"},Fs=P({__name:"FunAlert",props:{visible:{type:Boolean,default:!1},title:{default:"提示"},message:{default:""},type:{default:"info"}},emits:["confirm","close"],setup(n,{expose:s,emit:a}){const t=n,o=a,i=F(!1),p=F("提示"),x=F(""),_=F("info"),k=F(null);Z(()=>t.visible,h=>{h?(i.value=!0,p.value=t.title,x.value=t.message,_.value=t.type,document.addEventListener("keydown",y)):(i.value=!1,document.removeEventListener("keydown",y))});function g(h,d,C,j){p.value=h,x.value=d,_.value=C,i.value=!0,k.value=j||null,document.addEventListener("keydown",y)}function m(){i.value=!1,document.removeEventListener("keydown",y),o("confirm"),o("close"),k.value&&(k.value(),k.value=null)}function v(h){h.target===h.currentTarget&&m()}function y(h){h.key==="Escape"&&m()}return X(()=>{document.removeEventListener("keydown",y)}),s({showAlert:g}),(h,d)=>i.value?(r(),c("div",{key:0,class:"fun-alert-overlay",onMousedown:v},[e("div",{class:"fun-alert-content",onMousedown:d[0]||(d[0]=U(()=>{},["stop"]))},[e("div",ks,[e("div",$s,[_.value==="error"?(r(),c("span",ws,"❌")):_.value==="warning"?(r(),c("span",xs,"⚠️")):_.value==="success"?(r(),c("span",_s,"✅")):(r(),c("span",Cs,"ℹ️"))]),e("h3",Ss,w(p.value),1)]),e("div",js,[e("p",Ts,w(x.value),1)]),e("div",Ps,[u(Y,{onClick:m},{default:f(()=>[...d[1]||(d[1]=[l("确定",-1)])]),_:1})])],32)],32)):T("",!0)}}),Is=A(Fs,[["__scopeId","data-v-77c5ed61"]]),As={class:"fun-confirm__header"},Ds={class:"fun-confirm__title"},Es={class:"fun-confirm__body"},Bs={class:"fun-confirm__message"},Os={class:"fun-confirm__footer"},qs=P({__name:"FunConfirmDialog",props:{visible:{type:Boolean,default:!1},title:{default:"确认"},message:{default:""},defaultCancel:{type:Boolean,default:!0}},emits:["confirm","cancel","close"],setup(n,{expose:s,emit:a}){const t=n,o=a,i=F(!1),p=F("确认"),x=F(""),_=F(!0),k=F(null),g=F(null),m=F(null);Z(()=>t.visible,I=>{I?(i.value=!0,p.value=t.title,x.value=t.message,_.value=t.defaultCancel,document.addEventListener("keydown",j),K(()=>{y()})):(i.value=!1,document.removeEventListener("keydown",j))});function v(I,S,O,B=!0){p.value=I,x.value=S,_.value=B,i.value=!0,k.value=O||null,document.addEventListener("keydown",j),K(()=>{y()})}function y(){var I,S;if(_.value){const O=(I=m.value)==null?void 0:I.$el;O&&O.focus()}else{const O=(S=g.value)==null?void 0:S.$el;O&&O.focus()}}function h(){i.value=!1,document.removeEventListener("keydown",j),o("confirm"),o("close"),k.value&&(k.value(!0),k.value=null)}function d(){i.value=!1,document.removeEventListener("keydown",j),o("cancel"),o("close"),k.value&&(k.value(!1),k.value=null)}function C(I){I.target===I.currentTarget&&d()}function j(I){I.key==="Escape"&&d()}return X(()=>{document.removeEventListener("keydown",j)}),s({showConfirm:v}),(I,S)=>i.value?(r(),c("div",{key:0,class:"fun-confirm-overlay",onMousedown:C},[e("div",{class:"fun-confirm-content",onMousedown:S[0]||(S[0]=U(()=>{},["stop"]))},[e("div",As,[S[1]||(S[1]=e("div",{class:"fun-confirm__icon"},[e("span",null,"❓")],-1)),e("h3",Ds,w(p.value),1)]),e("div",Es,[e("p",Bs,w(x.value),1)]),e("div",Os,[u(Y,{class:"fun-confirm__button fun-confirm__button--confirm",onClick:h,ref_key:"confirmButtonRef",ref:g},{default:f(()=>[...S[2]||(S[2]=[l(" 确定 ",-1)])]),_:1},512),u(Y,{class:"fun-confirm__button fun-confirm__button--cancel",onClick:d,ref_key:"cancelButtonRef",ref:m},{default:f(()=>[...S[3]||(S[3]=[l(" 取消 ",-1)])]),_:1},512)])],32)],32)):T("",!0)}}),Gs=A(qs,[["__scopeId","data-v-555b5bb7"]]),Ms={class:"fun-modal__header"},Vs={class:"fun-modal__title"},Rs={class:"fun-modal__body"},Ns={key:0,class:"fun-modal__footer"},Us=P({__name:"FunModal",props:{modelValue:{type:Boolean},title:{default:""},contentClass:{default:""},maxWidth:{default:void 0}},emits:["update:modelValue"],setup(n,{emit:s}){const a=n,t=s,o=G(()=>a.maxWidth?{maxWidth:a.maxWidth}:void 0);function i(){t("update:modelValue",!1)}return(p,x)=>n.modelValue?(r(),c("div",{key:0,class:"fun-modal__overlay",onMousedown:U(i,["self"])},[e("div",{class:D(["fun-modal__content",n.contentClass]),style:z(o.value),onMousedown:x[0]||(x[0]=U(()=>{},["stop"]))},[e("div",Ms,[e("h3",Vs,w(n.title),1),e("button",{type:"button",class:"fun-modal__close","aria-label":"关闭",onClick:i},"✕")]),e("div",Rs,[R(p.$slots,"default",{},void 0)]),p.$slots.footer?(r(),c("div",Ns,[R(p.$slots,"footer",{},void 0)])):T("",!0)],38)],32)):T("",!0)}}),Ls=A(Us,[["__scopeId","data-v-3208c30d"]]),zs={class:"fun-notification-container"},Zs={class:"fun-notification-toast__icon"},Js={key:0},Hs={key:1},Ks={key:2},Ws={key:3},Qs={key:4},Ys={class:"fun-notification-toast__content"},Xs={class:"fun-notification-toast__title"},eo={key:0,class:"fun-notification-toast__message"},to=["onClick"],no=P({__name:"FunNotification",setup(n,{expose:s}){const a=F([]),t=F(1),o=(g={})=>{const m={id:t.value++,type:g.type||"info",title:g.title||"通知",message:g.message||"",duration:g.duration||3e3,timestamp:Date.now(),persistent:g.persistent||!1};return a.value.push(m),m.persistent||setTimeout(()=>{i(m.id)},m.duration),m.id},i=g=>{const m=a.value.findIndex(v=>v.id===g);m>-1&&a.value.splice(m,1)};return s({showToast:o,removeToast:i,success:(g,m,v={})=>o({type:"success",title:g,message:m,...v}),error:(g,m,v={})=>o({type:"error",title:g,message:m,...v}),warning:(g,m,v={})=>o({type:"warning",title:g,message:m,...v}),info:(g,m,v={})=>o({type:"info",title:g,message:m,...v})}),(g,m)=>(r(),c("div",zs,[u(Fe,{name:"toast",tag:"div",class:"fun-notification-list"},{default:f(()=>[(r(!0),c(N,null,L(a.value,v=>(r(),c("div",{key:v.id,class:D(["fun-notification-toast",`fun-notification-toast--${v.type}`])},[e("div",Zs,[v.type==="success"?(r(),c("span",Js,"✅")):v.type==="error"?(r(),c("span",Hs,"❌")):v.type==="warning"?(r(),c("span",Ks,"⚠️")):v.type==="info"?(r(),c("span",Ws,"ℹ️")):(r(),c("span",Qs,"📢"))]),e("div",Ys,[e("div",Xs,w(v.title),1),v.message?(r(),c("div",eo,w(v.message),1)):T("",!0)]),e("button",{class:"fun-notification-toast__close",onClick:U(y=>i(v.id),["stop"])},"×",8,to),e("div",{class:"fun-notification-toast__progress",style:z({animationDuration:`${v.duration}ms`})},null,4)],2))),128))]),_:1})]))}}),lo=A(no,[["__scopeId","data-v-b8785870"]]),so=["onMouseenter","onMouseleave"],oo=["onClick"],ao={class:"fun-context-icon"},io={class:"fun-context-label"},uo={key:0,class:"fun-context-arrow"},ro=["onMouseenter","onMouseleave"],co=["onClick"],po={class:"fun-context-icon"},fo={class:"fun-context-label"},mo=P({__name:"FunContextMenu",props:{visible:{type:Boolean,default:!1},position:{default:()=>({x:0,y:0})},menuItems:{default:()=>[]}},emits:["item-click"],setup(n,{emit:s}){const a=n,t=s,o=F(null),i=F({x:0,y:0}),p=F(null),x=F(null),_=F({x:0,y:0}),k=F(null),g=F(null);function m(S,O,B,V){const te=window.innerWidth,ne=window.innerHeight;let W=S,Q=O;return S+B>te&&(W=Math.max(0,S-B)),W<0&&(W=0),O+V>ne&&(Q=ne-V),Q<0&&(Q=0),{x:W,y:Q}}function v(S){S.children&&S.children.length>0||t("item-click",S)}function y(S,O){if(S.children&&S.children.length>0){p.value!==null&&(clearTimeout(p.value),p.value=null),o.value=S.key;const V=O.currentTarget.getBoundingClientRect();i.value={x:V.right+4,y:V.top}}}function h(S){S.children&&S.children.length>0&&(p.value=window.setTimeout(()=>{o.value===S.key&&(o.value=null)},150))}function d(S){p.value!==null&&(clearTimeout(p.value),p.value=null),o.value=S}function C(S){p.value=window.setTimeout(()=>{o.value===S&&(o.value=null)},150)}function j(S,O){S&&o.value===O&&(k.value=S)}function I(){const S=g.value??i.value;return{left:S.x+"px",top:S.y+"px"}}return Z(()=>[a.visible,a.position.x,a.position.y],([S])=>{S&&(_.value={x:a.position.x,y:a.position.y},K(()=>{const O=x.value;if(!O)return;const B=O.getBoundingClientRect();_.value=m(a.position.x,a.position.y,B.width,B.height)}))},{immediate:!0}),Z(o,S=>{if(!S){g.value=null,k.value=null;return}g.value=null,K(()=>{const O=k.value;if(!O)return;const B=O.getBoundingClientRect();g.value=m(i.value.x,i.value.y,B.width,B.height)})}),Z(()=>a.visible,S=>{S||(o.value=null,g.value=null,k.value=null,p.value!==null&&(clearTimeout(p.value),p.value=null))}),X(()=>{p.value!==null&&clearTimeout(p.value)}),(S,O)=>n.visible?(r(),c("div",{key:0,ref_key:"menuRef",ref:x,class:"fun-context-menu",style:z({left:_.value.x+"px",top:_.value.y+"px"}),onClick:O[1]||(O[1]=U(()=>{},["stop"]))},[(r(!0),c(N,null,L(n.menuItems,B=>(r(),c("div",{key:B.key,class:"fun-context-item-wrapper",onMouseenter:V=>y(B,V),onMouseleave:V=>h(B)},[e("div",{class:D(["fun-context-item",{"has-submenu":B.children&&B.children.length>0}]),onClick:V=>v(B)},[e("span",ao,w(B.icon),1),e("span",io,w(B.label),1),B.children&&B.children.length>0?(r(),c("span",uo,"▶")):T("",!0)],10,oo),B.children&&B.children.length>0&&o.value===B.key?(r(),c("div",{key:0,ref_for:!0,ref:V=>j(V,B.key),class:"fun-context-submenu",style:z(I()),onMouseenter:V=>d(B.key),onMouseleave:V=>C(B.key),onClick:O[0]||(O[0]=U(()=>{},["stop"]))},[(r(!0),c(N,null,L(B.children,V=>(r(),c("div",{key:V.key,class:"fun-context-item",onClick:te=>v(V)},[e("span",po,w(V.icon),1),e("span",fo,w(V.label),1)],8,co))),128))],44,ro)):T("",!0)],40,so))),128))],4)):T("",!0)}}),go=A(mo,[["__scopeId","data-v-b16c5be2"]]);function vo(n){n.component("fun-button",Y),n.component("fun-tag",kn),n.component("fun-switch",_n),n.component("fun-slider",Pn),n.component("fun-input",An),n.component("fun-rate",Gn),n.component("fun-tag-input",Ln),n.component("fun-textarea",Jn),n.component("fun-select",Yn),n.component("fun-drop-zone",rl),n.component("fun-business-card",hl),n.component("fun-card",$l),n.component("fun-empty-state",Tl),n.component("fun-statistic",Gl),n.component("fun-achievement-item",Ql),n.component("fun-carousel",ns),n.component("fun-pagination",cs),n.component("fun-menu",_e),n.component("fun-dropdown",ys),n.component("fun-grid",hs),n.component("fun-alert",Is),n.component("fun-confirm-dialog",Gs),n.component("fun-modal",Ls),n.component("fun-notification",lo),n.component("fun-context-menu",go)}const yo={install:vo};function bo(){const n=Ie(pn);n.use(yo),n.mount("#help-app")}bo();
