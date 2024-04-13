var IS_DEV_BUILD=false;
(()=>{var Ii=document.createElement("div");Ii.innerHTML='<div class=wb-header><div class=wb-control><span title="Minimize" class=wb-min></span><span title="Maximize" class=wb-max></span><span title="Fullscreen" class=wb-full></span><span title="Close" class=wb-close></span></div><div class=wb-drag><div class=wb-icon></div><div class=wb-title></div></div></div><div class=wb-body></div><div class=wb-footer><feedback-form size="inline"></feedback-form></div><div class=wb-n></div><div class=wb-s></div><div class=wb-w></div><div class=wb-e></div><div class=wb-nw></div><div class=wb-ne></div><div class=wb-se></div><div class=wb-sw></div>';function ji(t){return(t||Ii).cloneNode(!0)}var Ai=`
  .winbox {
    position: fixed;
    left: 0;
    top: 0;
    background: #0050ff;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
    /* using transform make contents blur when applied and requires more gpu memory */
    transition: width 0.3s, height 0.3s, left 0.3s, top 0.3s;
    transition-timing-function: cubic-bezier(0.3, 1, 0.3, 1);
    /* contain "strict" does not make overflow contents selectable */
    contain: layout size;
    /* explicitly set text align to left fixes an issue with iframes alignment when centered */
    text-align: left;
    /* workaround for using passive listeners */
    touch-action: none;
  }
  .wb-header {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 35px;
    line-height: 35px;
    color: #fff;
    overflow: hidden;
    z-index: 1;
  }
  .wb-body {
    position: absolute;
    top: 35px;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;
    will-change: contents;
    background: #fff;
    /* when no border is set there is some thin line visible */
    /* always hide top border visually */
    margin-top: 0 !important;
    contain: strict;
    z-index: 0;
  }
  .wb-footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: none;
  }
  .winbox.show-footer .wb-body {
    bottom: 35px; /* height of footer */
  }
  .winbox.show-footer .wb-footer {
    display: block;
  }
  body > .wb-body {
    position: relative;
    display: inline-block;
    visibility: hidden;
    contain: none;
  }
  .wb-drag {
    height: 100%;
    padding-left: 10px;
    cursor: move;
  }
  .wb-title {
    font-family: Arial, sans-serif;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .wb-icon {
    display: none;
    width: 20px;
    height: 100%;
    margin: -1px 8px 0 -3px;
    float: left;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
  }
  .wb-n {
    position: absolute;
    top: -5px;
    left: 0;
    right: 0;
    height: 10px;
    cursor: n-resize;
    z-index: 2;
  }
  .wb-e {
    position: absolute;
    top: 0;
    right: -5px;
    bottom: 0;
    width: 10px;
    cursor: w-resize;
    z-index: 2;
  }
  .wb-s {
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 10px;
    cursor: n-resize;
    z-index: 2;
  }
  .wb-w {
    position: absolute;
    top: 0;
    left: -5px;
    bottom: 0;
    width: 10px;
    cursor: w-resize;
    z-index: 2;
  }
  .wb-nw {
    position: absolute;
    top: -5px;
    left: -5px;
    width: 15px;
    height: 15px;
    cursor: nw-resize;
    z-index: 2;
  }
  .wb-ne {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    cursor: ne-resize;
    z-index: 2;
  }
  .wb-sw {
    position: absolute;
    bottom: -5px;
    left: -5px;
    width: 15px;
    height: 15px;
    cursor: ne-resize;
    z-index: 2;
  }
  .wb-se {
    position: absolute;
    bottom: -5px;
    right: -5px;
    width: 15px;
    height: 15px;
    cursor: nw-resize;
    z-index: 2;
  }
  .wb-control {
    float: right;
    height: 100%;
    max-width: 100%;
    text-align: center;
  }
  .wb-control * {
    display: inline-block;
    width: 30px;
    height: 100%;
    max-width: 100%;
    background-position: center;
    background-repeat: no-repeat;
    cursor: pointer;
  }
  .wb-min {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNOCAwaDdhMSAxIDAgMCAxIDAgMkgxYTEgMSAwIDAgMSAwLTJoN3oiLz48L3N2Zz4=);
    background-size: 14px auto;
    background-position: center calc(50% + 6px);
  }
  .wb-max {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9IiNmZmYiIHZpZXdCb3g9IjAgMCA5NiA5NiI+PHBhdGggZD0iTTIwIDcxLjMxMUMxNS4zNCA2OS42NyAxMiA2NS4yMyAxMiA2MFYyMGMwLTYuNjMgNS4zNy0xMiAxMi0xMmg0MGM1LjIzIDAgOS42NyAzLjM0IDExLjMxMSA4SDI0Yy0yLjIxIDAtNCAxLjc5LTQgNHY1MS4zMTF6Ii8+PHBhdGggZD0iTTkyIDc2VjM2YzAtNi42My01LjM3LTEyLTEyLTEySDQwYy02LjYzIDAtMTIgNS4zNy0xMiAxMnY0MGMwIDYuNjMgNS4zNyAxMiAxMiAxMmg0MGM2LjYzIDAgMTItNS4zNyAxMi0xMnptLTUyIDRjLTIuMjEgMC00LTEuNzktNC00VjM2YzAtMi4yMSAxLjc5LTQgNC00aDQwYzIuMjEgMCA0IDEuNzkgNCA0djQwYzAgMi4yMS0xLjc5IDQtNCA0SDQweiIvPjwvc3ZnPg==);
    background-size: 17px auto;
  }
  .wb-close {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0xIC0xIDE4IDE4Ij48cGF0aCBmaWxsPSIjZmZmIiBkPSJtMS42MTMuMjEuMDk0LjA4M0w4IDYuNTg1IDE0LjI5My4yOTNsLjA5NC0uMDgzYTEgMSAwIDAgMSAxLjQwMyAxLjQwM2wtLjA4My4wOTRMOS40MTUgOGw2LjI5MiA2LjI5M2ExIDEgMCAwIDEtMS4zMiAxLjQ5N2wtLjA5NC0uMDgzTDggOS40MTVsLTYuMjkzIDYuMjkyLS4wOTQuMDgzQTEgMSAwIDAgMSAuMjEgMTQuMzg3bC4wODMtLjA5NEw2LjU4NSA4IC4yOTMgMS43MDdBMSAxIDAgMCAxIDEuNjEzLjIxeiIvPjwvc3ZnPg==);
    background-size: 15px auto;
    background-position: 5px center;
  }
  .wb-full {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2Utd2lkdGg9IjIuNSIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNOCAzSDVhMiAyIDAgMCAwLTIgMnYzbTE4IDBWNWEyIDIgMCAwIDAtMi0yaC0zbTAgMThoM2EyIDIgMCAwIDAgMi0ydi0zTTMgMTZ2M2EyIDIgMCAwIDAgMiAyaDMiLz48L3N2Zz4=);
    background-size: 16px auto;
  }
  .wb-nav-away {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik0yMTIuMzA5LTE0MC4wMDFxLTMwLjMwOCAwLTUxLjMwOC0yMXQtMjEtNTEuMzA4di01MzUuMzgycTAtMzAuMzA4IDIxLTUxLjMwOHQ1MS4zMDgtMjFoMjUyLjMwNVYtNzYwSDIxMi4zMDlxLTQuNjE2IDAtOC40NjMgMy44NDYtMy44NDYgMy44NDctMy44NDYgOC40NjN2NTM1LjM4MnEwIDQuNjE2IDMuODQ2IDguNDYzIDMuODQ3IDMuODQ2IDguNDYzIDMuODQ2aDUzNS4zODJxNC42MTYgMCA4LjQ2My0zLjg0NiAzLjg0Ni0zLjg0NyAzLjg0Ni04LjQ2M3YtMjUyLjMwNWg1OS45OTl2MjUyLjMwNXEwIDMwLjMwOC0yMSA1MS4zMDh0LTUxLjMwOCAyMUgyMTIuMzA5Wm0xNzYuNDYtMjA2LjYxNS00Mi4xNTMtNDIuMTUzTDcxNy44NDctNzYwSDU2MHYtNTkuOTk5aDI1OS45OTlWLTU2MEg3NjB2LTE1Ny44NDdMMzg4Ljc2OS0zNDYuNjE2WiIvPjwvc3ZnPg==);
    
    background-size: 20px auto;
    filter: invert(1);
  }
  .wb-settings {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgLTk2MCA5NjAgOTYwIiB3aWR0aD0iMjQiPjxwYXRoIGQ9Ik00NTAuMDAxLTEzMC4wMDF2LTIxOS45OThoNTkuOTk4djgwaDMyMHY1OS45OThoLTMyMHY4MGgtNTkuOTk4Wm0tMzIwLTgwdi01OS45OThoMjE5Ljk5OHY1OS45OThIMTMwLjAwMVptMTYwLTE2MHYtODBoLTE2MHYtNTkuOTk4aDE2MHYtODBoNTkuOTk4djIxOS45OThoLTU5Ljk5OFptMTYwLTgwdi01OS45OThoMzc5Ljk5OHY1OS45OThINDUwLjAwMVptMTYwLTE2MHYtMjE5Ljk5OGg1OS45OTh2ODBoMTYwdjU5Ljk5OGgtMTYwdjgwaC01OS45OThabS00ODAtODB2LTU5Ljk5OGgzNzkuOTk4djU5Ljk5OEgxMzAuMDAxWiIvPjwvc3ZnPg==);
  
    background-size: 20px auto;
    filter: invert(1);
  }
  /*
  .winbox:not(.max) .wb-max {
    background-image: url(@restore);
    background-size: 20px auto;
    background-position: center bottom 5px;
  }
  */
  /*
  .winbox:fullscreen{
    transition: none !important;
  }
  .winbox:fullscreen .wb-full{
    background-image: url(@minimize);
  }
  .winbox:fullscreen > div,
  .winbox:fullscreen .wb-title,
  */
  .winbox.modal .wb-body ~ div,
  .winbox.modal .wb-drag,
  .winbox.min .wb-body ~ div,
  .winbox.max .wb-body ~ div {
    pointer-events: none;
  }
  .winbox.max .wb-drag {
    cursor: default;
  }
  .winbox.min .wb-full,
  .winbox.min .wb-min {
    display: none;
  }
  .winbox.min .wb-drag {
    cursor: default;
  }
  .winbox.min .wb-body > * {
    display: none;
  }
  .winbox.hide {
    display: none;
  }
  .winbox.max {
    box-shadow: none;
  }
  .winbox.max .wb-body {
    margin: 0 !important;
  }
  .winbox iframe {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 0;
  }
  body.wb-lock .winbox {
    will-change: left, top, width, height;
    transition: none;
  }
  body.wb-lock iframe {
    pointer-events: none;
  }
  .winbox.modal:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: inherit;
    border-radius: inherit;
  }
  .winbox.modal:after {
    content: '';
    position: absolute;
    top: -50vh;
    left: -50vw;
    right: -50vw;
    bottom: -50vh;
    background: #0d1117;
    animation: wb-fade-in 0.2s ease-out forwards;
    z-index: -1;
  }
  .winbox.modal .wb-min,
  .winbox.modal .wb-max,
  .winbox.modal .wb-full {
    display: none;
  }
  @keyframes wb-fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 0.85;
    }
  }
  .no-animation {
    transition: none;
  }
  .no-shadow {
    box-shadow: none;
  }
  .no-header .wb-header {
    display: none;
  }
  .no-header .wb-body {
    top: 0;
  }
  .no-min .wb-min {
    display: none;
  }
  .no-max .wb-max {
    display: none;
  }
  .no-full .wb-full {
    display: none;
  }
  .no-close .wb-close {
    display: none;
  }
  .no-resize .wb-body ~ div {
    display: none;
  }
  .no-move:not(.min) .wb-title {
    pointer-events: none;
  }
  .wb-body .wb-hide {
    display: none;
  }
  .wb-show {
    display: none;
  }
  .wb-body .wb-show {
    display: revert;
  }
`;function u(t,i,e,o){t&&t.addEventListener(i,e,o||!1)}function R(t,i,e,o){t&&t.removeEventListener(i,e,o||!1)}function Q(t,i){t.stopPropagation(),t.cancelable&&t.preventDefault()}function f(t,i){return t.getElementsByClassName(i)[0]}function ni(t,i){t.classList.add(i)}function Di(t,i){return t.classList.contains(i)}function si(t,i){t.classList.remove(i)}function a(t,i,e){e=""+e,t["_s_"+i]!==e&&(t.style.setProperty(i,e),t["_s_"+i]=e)}function Li(t,i){let e=t.firstChild;e?e.nodeValue=i:t.textContent=i}var $=!1,P=[],X={capture:!0,passive:!0},z,ki=0,q=10,B,S,L,Ni,T,N,U=class{constructor(i,e){if(!(this instanceof U))return new U(i);z||Ci();let o,n,s,m,h,v,k,C,Y,O,G,r,j,w,b,x,A,p,y,V,g,M,l,c,_,H,di,ri,ai,J,ti,E,Z,W,li,ci,ui,mi,wi,bi,xi,gi,Mi,fi,pi,yi,zi;if(i&&(e&&(h=i,i=e),typeof i=="string"?h=i:(o=i.id,n=i.index,s=i.root,m=i.template,h=h||i.title,v=i.icon,k=i.mount,C=i.html,Y=i.url,O=i.shadowel,r=i.framename,j=i.cssurl,w=i.width,b=i.height,x=i.minwidth,A=i.minheight,p=i.maxwidth,y=i.maxheight,V=i.autosize,di=i.min,ri=i.max,ai=i.hidden,J=i.modal,g=i.x||(J?"center":0),M=i.y||(J?"center":0),l=i.top,c=i.left,_=i.bottom,H=i.right,ti=i.background,E=i.border,Z=i.header,W=i.class,ci=i.onclose,ui=i.onfocus,mi=i.onblur,wi=i.onmove,bi=i.onresize,xi=i.onfullscreen,gi=i.onmaximize,Mi=i.onminimize,fi=i.onrestore,pi=i.onhide,yi=i.onshow,zi=i.onload)),this.dom=ji(m),this.dom.id=this.id=o||"winbox-"+ ++ki,this.dom.className="winbox"+(W?" "+(typeof W=="string"?W:W.join(" ")):"")+(J?" modal":""),this.dom.winbox=this,this.window=this.dom,this.body=f(this.dom,"wb-body"),this.header=Z||35,(n||n===0)&&(q=n),ti&&this.setBackground(ti),E?a(this.body,"margin",E+(isNaN(E)?"":"px")):E=0,Z){let I=f(this.dom,"wb-header");a(I,"height",Z+"px"),a(I,"line-height",Z+"px"),a(this.body,"top",Z+"px")}h&&this.setTitle(h),v&&this.setIcon(v),k?this.mount(k):C?this.body.innerHTML=C:Y&&this.setUrl(Y,zi),l=l?d(l,N):0,_=_?d(_,N):0,c=c?d(c,T):0,H=H?d(H,T):0;let ei=T-c-H,oi=N-l-_;if(p=p?d(p,ei):ei,y=y?d(y,oi):oi,x=x?d(x,p):150,A=A?d(A,y):this.header,V?((s||z).appendChild(this.body),w=Math.max(Math.min(this.body.clientWidth+E*2+1,p),x),b=Math.max(Math.min(this.body.clientHeight+this.header+E+1,y),A),this.dom.appendChild(this.body)):(w=w?d(w,p):Math.max(p/2,x)|0,b=b?d(b,y):Math.max(y/2,A)|0),g=g?d(g,ei,w):c,M=M?d(M,oi,b):l,this.x=g,this.y=M,this.width=w,this.height=b,this.minwidth=x,this.minheight=A,this.maxwidth=p,this.maxheight=y,this.top=l,this.right=H,this.bottom=_,this.left=c,this.index=n,this.min=!1,this.max=!1,this.full=!1,this.hidden=!1,this.focused=!1,this.onclose=ci,this.onfocus=ui,this.onblur=mi,this.onmove=wi,this.onresize=bi,this.onfullscreen=xi,this.onmaximize=gi,this.onminimize=Mi,this.onrestore=fi,this.onhide=pi,this.onshow=yi,ri?this.maximize():di?this.minimize():this.resize().move(),ai?this.hide():(this.focus(),(n||n===0)&&(this.index=n,n>q&&(q=n))),a(this.shadowdom?this.shadowdom:this.dom,"z-index",n),Oi(this),O){let I=document.createElement(O);I.style.position="absolute";let vi=document.createElement("style");if(vi.textContent=Ai,I.appendChild(vi),j){let F=document.createElement("link");F.rel="stylesheet",F.type="text/css",F.href=j,F.itemprop="url",I.appendChild(F)}I.appendChild(this.dom),I.attachShadow({mode:"open"}).innerHTML="<slot></slot>",this.shadowdom=I,(s||z).appendChild(I)}else(s||z).appendChild(this.dom);(li=i.oncreate)&&li.call(this,i)}static new(i){return new U(i)}mount(i){return this.unmount(),i._backstore||(i._backstore=i.parentNode),this.body.textContent="",this.body.appendChild(i),this}unmount(i){let e=this.body.firstChild;if(e){let o=i||e._backstore;o&&o.appendChild(e),e._backstore=i}return this}setTitle(i){let e=f(this.dom,"wb-title");return Li(e,this.title=i),this}setIcon(i){let e=f(this.dom,"wb-icon");return a(e,"background-image","url("+i+")"),a(e,"display","inline-block"),this}setBackground(i){return a(this.dom,"background",i),this}setUrl(i,e){let o=this.body.firstChild;if(o&&o.tagName.toLowerCase()==="iframe")o.src=i;else{let n=this.framename??"";this.body.innerHTML=`<iframe name="${n}" src="${i}"></iframe>`,e&&(this.body.firstChild.onload=e)}return this}focus(i){return i===!1?this.blur():(S!==this&&this.dom&&(S&&S.blur(),a(this.shadowdom?this.shadowdom:this.dom,"z-index",++q),this.index=q,this.addClass("focus"),S=this,this.focused=!0,this.onfocus&&this.onfocus()),this)}blur(i){return i===!1?this.focus():(S===this&&(this.removeClass("focus"),this.focused=!1,this.onblur&&this.onblur(),S=null),this)}hide(i){if(i===!1)return this.show();if(!this.hidden)return this.onhide&&this.onhide(),this.hidden=!0,this.addClass("hide")}show(i){if(i===!1)return this.hide();if(this.hidden)return this.onshow&&this.onshow(),this.hidden=!1,this.removeClass("hide")}minimize(i){return i===!1?this.restore():(B&&ii(),this.max&&(this.removeClass("max"),this.max=!1),this.min||(P.push(this),hi(),this.dom.title=this.title,this.addClass("min"),this.min=!0,this.onminimize&&this.onminimize()),this)}restore(){return B&&ii(),this.min&&(K(this),this.resize().move(),this.onrestore&&this.onrestore()),this.max&&(this.max=!1,this.removeClass("max").resize().move(),this.onrestore&&this.onrestore()),this}maximize(i){return i===!1?this.restore():(B&&ii(),this.min&&K(this),this.max||(this.addClass("max").resize(T-this.left-this.right,N-this.top-this.bottom,!0).move(this.left,this.top,!0),this.max=!0,this.onmaximize&&this.onmaximize()),this)}fullscreen(i){if(this.min&&(K(this),this.resize().move()),!B||!ii())this.body[L](),B=this,this.full=!0,this.onfullscreen&&this.onfullscreen();else if(i===!1)return this.restore();return this}close(i){if(this.onclose&&this.onclose(i))return!0;this.min&&K(this),this.unmount(),this.dom.remove(),this.dom.textContent="",this.dom.winbox=null,this.body=null,this.dom=null,S===this&&(S=null)}move(i,e,o){return!i&&i!==0?(i=this.x,e=this.y):o||(this.x=i?i=d(i,T-this.left-this.right,this.width):0,this.y=e?e=d(e,N-this.top-this.bottom,this.height):0),a(this.dom,"left",i+"px"),a(this.dom,"top",e+"px"),this.onmove&&this.onmove(i,e),this}resize(i,e,o){return!i&&i!==0?(i=this.width,e=this.height):o||(this.width=i?i=d(i,this.maxwidth):0,this.height=e?e=d(e,this.maxheight):0,i=Math.max(i,this.minwidth),e=Math.max(e,this.minheight)),a(this.dom,"width",i+"px"),a(this.dom,"height",e+"px"),this.onresize&&this.onresize(i,e),this}addControl(i){let e=i.class,o=i.image,n=i.click,s=i.index,m=i.title,h=document.createElement("span"),v=f(this.dom,"wb-control"),k=this;return e&&(h.className=e),o&&a(h,"background-image","url("+o+")"),n&&(h.onclick=function(C){n.call(this,C,k)}),m&&(h.title=m),v.insertBefore(h,v.childNodes[s||0]),this}removeControl(i){return i=f(this.dom,i),i&&i.remove(),this}addClass(i){return ni(this.dom,i),this}removeClass(i){return si(this.dom,i),this}hasClass(i){return Di(this.dom,i)}toggleClass(i){return this.hasClass(i)?this.removeClass(i):this.addClass(i)}};function d(t,i,e){if(typeof t=="string")if(t==="center")t=(i-e)/2|0;else if(t==="right"||t==="bottom")t=i-e;else{let o=parseFloat(t);(""+o!==t&&t.substring((""+o).length))==="%"?t=i/100*o|0:t=o}return t}function Ci(){z=document.body,z[L="requestFullscreen"]||z[L="msRequestFullscreen"]||z[L="webkitRequestFullscreen"]||z[L="mozRequestFullscreen"]||(L=""),Ni=L&&L.replace("request","exit").replace("mozRequest","mozCancel").replace("Request","Exit"),u(window,"resize",function(){Ti(),hi()}),Ti()}function Oi(t){D(t,"drag"),D(t,"n"),D(t,"s"),D(t,"w"),D(t,"e"),D(t,"nw"),D(t,"ne"),D(t,"se"),D(t,"sw"),u(f(t.dom,"wb-min"),"click",function(i){Q(i),t.min?t.focus().restore():t.blur().minimize()}),u(f(t.dom,"wb-max"),"click",function(i){t.max?t.restore():t.maximize()}),L?u(f(t.dom,"wb-full"),"click",function(i){t.fullscreen()}):t.addClass("no-full"),u(f(t.dom,"wb-close"),"click",function(i){Q(i),t.close()||(t=null)}),u(t.dom,"click",function(i){t.focus()})}function K(t){P.splice(P.indexOf(t),1),hi(),t.removeClass("min"),t.min=!1,t.dom.title=""}function hi(){let t=P.length,i={},e={};for(let o=0,n,s;o<t;o++)n=P[o],s=(n.left||n.right)+":"+(n.top||n.bottom),e[s]?e[s]++:(i[s]=0,e[s]=1);for(let o=0,n,s,m;o<t;o++)n=P[o],s=(n.left||n.right)+":"+(n.top||n.bottom),m=Math.min((T-n.left-n.right)/e[s],250),n.resize(m+1|0,n.header,!0).move(n.left+i[s]*m|0,N-n.bottom-n.header,!0),i[s]++}function D(t,i){let e=f(t.dom,"wb-"+i);if(!e)return;let o,n,s,m,h,v,k=0;u(e,"mousedown",Y),u(e,"touchstart",Y,X);function C(){m=requestAnimationFrame(C),v&&(t.resize(),v=!1),h&&(t.move(),h=!1)}function Y(r){if(Q(r),t.focus(),i==="drag"){if(t.min){t.restore();return}let j=Date.now(),w=j-k;if(k=j,w<300&&!t.dom.classList.contains("no-max")){t.max?t.restore():t.maximize();return}}!t.max&&!t.min&&(ni(z,"wb-lock"),$&&C(),(o=r.touches)&&(o=o[0])?(r=o,u(window,"touchmove",O,X),u(window,"touchend",G,X)):(u(window,"mousemove",O),u(window,"mouseup",G)),n=r.pageX,s=r.pageY)}function O(r){Q(r),o&&(r=r.touches[0]);let j=r.pageX,w=r.pageY,b=j-n,x=w-s,A=t.width,p=t.height,y=t.x,V=t.y,g,M,l,c;i==="drag"?(t.x+=b,t.y+=x,l=c=1):(i==="e"||i==="se"||i==="ne"?(t.width+=b,g=1):(i==="w"||i==="sw"||i==="nw")&&(t.x+=b,t.width-=b,g=1,l=1),i==="s"||i==="se"||i==="sw"?(t.height+=x,M=1):(i==="n"||i==="ne"||i==="nw")&&(t.y+=x,t.height-=x,M=1,c=1)),g&&(t.width=Math.max(Math.min(t.width,t.maxwidth,T-t.x-t.right),t.minwidth),g=t.width!==A),M&&(t.height=Math.max(Math.min(t.height,t.maxheight,N-t.y-t.bottom),t.minheight),M=t.height!==p),(g||M)&&($?v=!0:t.resize()),l&&(t.x=Math.max(Math.min(t.x,T-t.width-t.right),t.left),l=t.x!==y),c&&(t.y=Math.max(Math.min(t.y,N-t.height-t.bottom),t.top),c=t.y!==V),(l||c)&&($?h=!0:t.move()),(g||l)&&(n=j),(M||c)&&(s=w)}function G(r){Q(r),si(z,"wb-lock"),$&&cancelAnimationFrame(m),o?(R(window,"touchmove",O,X),R(window,"touchend",G,X)):(R(window,"mousemove",O),R(window,"mouseup",G))}}function Ti(){let t=document.documentElement;T=t.clientWidth,N=t.clientHeight}function Si(){return document.fullscreen||document.fullscreenElement||document.webkitFullscreenElement||document.mozFullScreenElement}function ii(){if(B.full=!1,Si())return document[Ni](),!0}})();
