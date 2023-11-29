/*!
 * w-mesh-tecplot v1.0.0
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,r){"object"==typeof exports&&"undefined"!=typeof module?module.exports=r(require("fs")):"function"==typeof define&&define.amd?define(["fs"],r):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-mesh-tecplot"]=r(t.fs)}(this,(function(t){"use strict";var r="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};function e(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}var n=Array.isArray,o="object"==typeof r&&r&&r.Object===Object&&r,u=o,a="object"==typeof self&&self&&self.Object===Object&&self,i=u||a||Function("return this")(),c=i.Symbol,f=c,l=Object.prototype,s=l.hasOwnProperty,p=l.toString,v=f?f.toStringTag:void 0;var y=function(t){var r=s.call(t,v),e=t[v];try{t[v]=void 0;var n=!0}catch(t){}var o=p.call(t);return n&&(r?t[v]=e:delete t[v]),o},h=Object.prototype.toString;var d=y,b=function(t){return h.call(t)},j=c?c.toStringTag:void 0;var _=function(t){return null==t?void 0===t?"[object Undefined]":"[object Null]":j&&j in Object(t)?d(t):b(t)};var g=function(t){return null!=t&&"object"==typeof t},O=_,w=g;var m=function(t){return"symbol"==typeof t||w(t)&&"[object Symbol]"==O(t)},A=n,x=m,S=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,T=/^\w*$/;var z=function(t,r){if(A(t))return!1;var e=typeof t;return!("number"!=e&&"symbol"!=e&&"boolean"!=e&&null!=t&&!x(t))||(T.test(t)||!S.test(t)||null!=r&&t in Object(r))};var E=function(t){var r=typeof t;return null!=t&&("object"==r||"function"==r)},P=_,$=E;var F,I=function(t){if(!$(t))return!1;var r=P(t);return"[object Function]"==r||"[object GeneratorFunction]"==r||"[object AsyncFunction]"==r||"[object Proxy]"==r},M=i["__core-js_shared__"],k=(F=/[^.]+$/.exec(M&&M.keys&&M.keys.IE_PROTO||""))?"Symbol(src)_1."+F:"";var B=function(t){return!!k&&k in t},R=Function.prototype.toString;var C=function(t){if(null!=t){try{return R.call(t)}catch(t){}try{return t+""}catch(t){}}return""},U=I,D=B,N=E,V=C,q=/^\[object .+?Constructor\]$/,L=Function.prototype,W=Object.prototype,Z=L.toString,G=W.hasOwnProperty,X=RegExp("^"+Z.call(G).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");var Y=function(t){return!(!N(t)||D(t))&&(U(t)?X:q).test(V(t))},H=function(t,r){return null==t?void 0:t[r]};var J=function(t,r){var e=H(t,r);return Y(e)?e:void 0},K=J(Object,"create"),Q=K;var tt=function(){this.__data__=Q?Q(null):{},this.size=0};var rt=function(t){var r=this.has(t)&&delete this.__data__[t];return this.size-=r?1:0,r},et=K,nt=Object.prototype.hasOwnProperty;var ot=function(t){var r=this.__data__;if(et){var e=r[t];return"__lodash_hash_undefined__"===e?void 0:e}return nt.call(r,t)?r[t]:void 0},ut=K,at=Object.prototype.hasOwnProperty;var it=K;var ct=tt,ft=rt,lt=ot,st=function(t){var r=this.__data__;return ut?void 0!==r[t]:at.call(r,t)},pt=function(t,r){var e=this.__data__;return this.size+=this.has(t)?0:1,e[t]=it&&void 0===r?"__lodash_hash_undefined__":r,this};function vt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}vt.prototype.clear=ct,vt.prototype.delete=ft,vt.prototype.get=lt,vt.prototype.has=st,vt.prototype.set=pt;var yt=vt;var ht=function(){this.__data__=[],this.size=0};var dt=function(t,r){return t===r||t!=t&&r!=r};var bt=function(t,r){for(var e=t.length;e--;)if(dt(t[e][0],r))return e;return-1},jt=bt,_t=Array.prototype.splice;var gt=bt;var Ot=bt;var wt=bt;var mt=ht,At=function(t){var r=this.__data__,e=jt(r,t);return!(e<0)&&(e==r.length-1?r.pop():_t.call(r,e,1),--this.size,!0)},xt=function(t){var r=this.__data__,e=gt(r,t);return e<0?void 0:r[e][1]},St=function(t){return Ot(this.__data__,t)>-1},Tt=function(t,r){var e=this.__data__,n=wt(e,t);return n<0?(++this.size,e.push([t,r])):e[n][1]=r,this};function zt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}zt.prototype.clear=mt,zt.prototype.delete=At,zt.prototype.get=xt,zt.prototype.has=St,zt.prototype.set=Tt;var Et=zt,Pt=J(i,"Map"),$t=yt,Ft=Et,It=Pt;var Mt=function(t){var r=typeof t;return"string"==r||"number"==r||"symbol"==r||"boolean"==r?"__proto__"!==t:null===t};var kt=function(t,r){var e=t.__data__;return Mt(r)?e["string"==typeof r?"string":"hash"]:e.map},Bt=kt;var Rt=kt;var Ct=kt;var Ut=kt;var Dt=function(t,r){var e=Ut(this,t),n=e.size;return e.set(t,r),this.size+=e.size==n?0:1,this},Nt=function(){this.size=0,this.__data__={hash:new $t,map:new(It||Ft),string:new $t}},Vt=function(t){var r=Bt(this,t).delete(t);return this.size-=r?1:0,r},qt=function(t){return Rt(this,t).get(t)},Lt=function(t){return Ct(this,t).has(t)},Wt=Dt;function Zt(t){var r=-1,e=null==t?0:t.length;for(this.clear();++r<e;){var n=t[r];this.set(n[0],n[1])}}Zt.prototype.clear=Nt,Zt.prototype.delete=Vt,Zt.prototype.get=qt,Zt.prototype.has=Lt,Zt.prototype.set=Wt;var Gt=Zt;function Xt(t,r){if("function"!=typeof t||null!=r&&"function"!=typeof r)throw new TypeError("Expected a function");var e=function(){var n=arguments,o=r?r.apply(this,n):n[0],u=e.cache;if(u.has(o))return u.get(o);var a=t.apply(this,n);return e.cache=u.set(o,a)||u,a};return e.cache=new(Xt.Cache||Gt),e}Xt.Cache=Gt;var Yt=Xt;var Ht=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Jt=/\\(\\)?/g,Kt=function(t){var r=Yt(t,(function(t){return 500===e.size&&e.clear(),t})),e=r.cache;return r}((function(t){var r=[];return 46===t.charCodeAt(0)&&r.push(""),t.replace(Ht,(function(t,e,n,o){r.push(n?o.replace(Jt,"$1"):e||t)})),r}));var Qt=function(t,r){for(var e=-1,n=null==t?0:t.length,o=Array(n);++e<n;)o[e]=r(t[e],e,t);return o},tr=n,rr=m,er=c?c.prototype:void 0,nr=er?er.toString:void 0;var or=function t(r){if("string"==typeof r)return r;if(tr(r))return Qt(r,t)+"";if(rr(r))return nr?nr.call(r):"";var e=r+"";return"0"==e&&1/r==-Infinity?"-0":e},ur=or;var ar=n,ir=z,cr=Kt,fr=function(t){return null==t?"":ur(t)};var lr=m;var sr=function(t,r){return ar(t)?t:ir(t,r)?[t]:cr(fr(t))},pr=function(t){if("string"==typeof t||lr(t))return t;var r=t+"";return"0"==r&&1/t==-Infinity?"-0":r};var vr=function(t,r){for(var e=0,n=(r=sr(r,t)).length;null!=t&&e<n;)t=t[pr(r[e++])];return e&&e==n?t:void 0};var yr=e((function(t,r,e){var n=null==t?void 0:vr(t,r);return void 0===n?e:n}));var hr=function(t,r){for(var e=-1,n=null==t?0:t.length;++e<n&&!1!==r(t[e],e,t););return t};var dr=function(t){return function(r,e,n){for(var o=-1,u=Object(r),a=n(r),i=a.length;i--;){var c=a[t?i:++o];if(!1===e(u[c],c,u))break}return r}}();var br=function(t,r){for(var e=-1,n=Array(t);++e<t;)n[e]=r(e);return n},jr=_,_r=g;var gr=function(t){return _r(t)&&"[object Arguments]"==jr(t)},Or=g,wr=Object.prototype,mr=wr.hasOwnProperty,Ar=wr.propertyIsEnumerable,xr=gr(function(){return arguments}())?gr:function(t){return Or(t)&&mr.call(t,"callee")&&!Ar.call(t,"callee")},Sr=xr,Tr={exports:{}};var zr=function(){return!1};!function(t,r){var e=i,n=zr,o=r&&!r.nodeType&&r,u=o&&t&&!t.nodeType&&t,a=u&&u.exports===o?e.Buffer:void 0,c=(a?a.isBuffer:void 0)||n;t.exports=c}(Tr,Tr.exports);var Er=Tr.exports,Pr=/^(?:0|[1-9]\d*)$/;var $r=function(t,r){var e=typeof t;return!!(r=null==r?9007199254740991:r)&&("number"==e||"symbol"!=e&&Pr.test(t))&&t>-1&&t%1==0&&t<r};var Fr=function(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=9007199254740991},Ir=_,Mr=Fr,kr=g,Br={};Br["[object Float32Array]"]=Br["[object Float64Array]"]=Br["[object Int8Array]"]=Br["[object Int16Array]"]=Br["[object Int32Array]"]=Br["[object Uint8Array]"]=Br["[object Uint8ClampedArray]"]=Br["[object Uint16Array]"]=Br["[object Uint32Array]"]=!0,Br["[object Arguments]"]=Br["[object Array]"]=Br["[object ArrayBuffer]"]=Br["[object Boolean]"]=Br["[object DataView]"]=Br["[object Date]"]=Br["[object Error]"]=Br["[object Function]"]=Br["[object Map]"]=Br["[object Number]"]=Br["[object Object]"]=Br["[object RegExp]"]=Br["[object Set]"]=Br["[object String]"]=Br["[object WeakMap]"]=!1;var Rr=function(t){return kr(t)&&Mr(t.length)&&!!Br[Ir(t)]};var Cr=function(t){return function(r){return t(r)}},Ur={exports:{}};!function(t,r){var e=o,n=r&&!r.nodeType&&r,u=n&&t&&!t.nodeType&&t,a=u&&u.exports===n&&e.process,i=function(){try{var t=u&&u.require&&u.require("util").types;return t||a&&a.binding&&a.binding("util")}catch(t){}}();t.exports=i}(Ur,Ur.exports);var Dr=Ur.exports,Nr=Rr,Vr=Cr,qr=Dr&&Dr.isTypedArray,Lr=qr?Vr(qr):Nr,Wr=br,Zr=Sr,Gr=n,Xr=Er,Yr=$r,Hr=Lr,Jr=Object.prototype.hasOwnProperty;var Kr=function(t,r){var e=Gr(t),n=!e&&Zr(t),o=!e&&!n&&Xr(t),u=!e&&!n&&!o&&Hr(t),a=e||n||o||u,i=a?Wr(t.length,String):[],c=i.length;for(var f in t)!r&&!Jr.call(t,f)||a&&("length"==f||o&&("offset"==f||"parent"==f)||u&&("buffer"==f||"byteLength"==f||"byteOffset"==f)||Yr(f,c))||i.push(f);return i},Qr=Object.prototype;var te=function(t){var r=t&&t.constructor;return t===("function"==typeof r&&r.prototype||Qr)};var re=function(t,r){return function(e){return t(r(e))}}(Object.keys,Object),ee=te,ne=re,oe=Object.prototype.hasOwnProperty;var ue=function(t){if(!ee(t))return ne(t);var r=[];for(var e in Object(t))oe.call(t,e)&&"constructor"!=e&&r.push(e);return r},ae=I,ie=Fr;var ce=function(t){return null!=t&&ie(t.length)&&!ae(t)},fe=Kr,le=ue,se=ce;var pe=dr,ve=function(t){return se(t)?fe(t):le(t)};var ye=ce;var he=function(t,r){return function(e,n){if(null==e)return e;if(!ye(e))return t(e,n);for(var o=e.length,u=r?o:-1,a=Object(e);(r?u--:++u<o)&&!1!==n(a[u],u,a););return e}}((function(t,r){return t&&pe(t,r,ve)}));var de=function(t){return t};var be=hr,je=he,_e=function(t){return"function"==typeof t?t:de},ge=n;var Oe=e((function(t,r){return(ge(t)?be:je)(t,_e(r))})),we=J(i,"DataView"),me=Pt,Ae=J(i,"Promise"),xe=J(i,"Set"),Se=J(i,"WeakMap"),Te=_,ze=C,Ee="[object Map]",Pe="[object Promise]",$e="[object Set]",Fe="[object WeakMap]",Ie="[object DataView]",Me=ze(we),ke=ze(me),Be=ze(Ae),Re=ze(xe),Ce=ze(Se),Ue=Te;(we&&Ue(new we(new ArrayBuffer(1)))!=Ie||me&&Ue(new me)!=Ee||Ae&&Ue(Ae.resolve())!=Pe||xe&&Ue(new xe)!=$e||Se&&Ue(new Se)!=Fe)&&(Ue=function(t){var r=Te(t),e="[object Object]"==r?t.constructor:void 0,n=e?ze(e):"";if(n)switch(n){case Me:return Ie;case ke:return Ee;case Be:return Pe;case Re:return $e;case Ce:return Fe}return r});var De=Ue,Ne=_,Ve=n,qe=g;var Le=function(t){return"string"==typeof t||!Ve(t)&&qe(t)&&"[object String]"==Ne(t)};var We=function(t){return function(r){return null==r?void 0:r[t]}}("length"),Ze=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");var Ge=function(t){return Ze.test(t)},Xe="\\ud800-\\udfff",Ye="["+Xe+"]",He="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",Je="\\ud83c[\\udffb-\\udfff]",Ke="[^"+Xe+"]",Qe="(?:\\ud83c[\\udde6-\\uddff]){2}",tn="[\\ud800-\\udbff][\\udc00-\\udfff]",rn="(?:"+He+"|"+Je+")"+"?",en="[\\ufe0e\\ufe0f]?",nn=en+rn+("(?:\\u200d(?:"+[Ke,Qe,tn].join("|")+")"+en+rn+")*"),on="(?:"+[Ke+He+"?",He,Qe,tn,Ye].join("|")+")",un=RegExp(Je+"(?="+Je+")|"+on+nn,"g");var an=We,cn=Ge,fn=function(t){for(var r=un.lastIndex=0;un.test(t);)++r;return r};var ln=ue,sn=De,pn=ce,vn=Le,yn=function(t){return cn(t)?fn(t):an(t)};var hn=e((function(t){if(null==t)return 0;if(pn(t))return vn(t)?yn(t):t.length;var r=sn(t);return"[object Map]"==r||"[object Set]"==r?t.size:ln(t).length})),dn=Array.prototype.join;var bn=e((function(t,r){return null==t?"":dn.call(t,r)}));return{readTecplot:async function(t,r,e){return console.log("尚待開發"),null},writeTecplot:async function(r,e,n,o){let u='TITLE = "Mesh" VARIABLES = "X", "Y", "Z", "M"\n',a=hn(e),i=hn(n);return u+=`ZONE T="${r}",N=${a}, E=${i}, F=fepoint, ET=brick`+"\n",Oe(e,(t=>{let r=[yr(t,"x",0),yr(t,"y",0),yr(t,"z",0),yr(t,"mat",0)],e=bn(r," ");u+=e+"\n"})),Oe(n,(t=>{let r=t.nodes,e=bn(r," ");u+=e+"\n"})),t.writeFileSync(o,u,"utf8"),null}}}));
//# sourceMappingURL=w-mesh-tecplot.umd.js.map