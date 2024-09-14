/*!
 * w-mesh-tecplot v1.0.4
 * (c) 2018-2021 yuda-lyu(semisphere)
 * Released under the MIT License.
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("fs")):"function"==typeof define&&define.amd?define(["fs"],e):(t="undefined"!=typeof globalThis?globalThis:t||self)["w-mesh-tecplot"]=e(t.fs)}(this,(function(t){"use strict";var e=Array.isArray,r="object"==typeof global&&global&&global.Object===Object&&global,n="object"==typeof self&&self&&self.Object===Object&&self,o=r||n||Function("return this")(),u=o.Symbol,i=Object.prototype,c=i.hasOwnProperty,a=i.toString,f=u?u.toStringTag:void 0;var l=Object.prototype.toString;var s="[object Null]",p="[object Undefined]",y=u?u.toStringTag:void 0;function b(t){return null==t?void 0===t?p:s:y&&y in Object(t)?function(t){var e=c.call(t,f),r=t[f];try{t[f]=void 0;var n=!0}catch(t){}var o=a.call(t);return n&&(e?t[f]=r:delete t[f]),o}(t):function(t){return l.call(t)}(t)}function h(t){return null!=t&&"object"==typeof t}var v="[object Symbol]";function d(t){return"symbol"==typeof t||h(t)&&b(t)==v}var j=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,g=/^\w*$/;function _(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}var O="[object AsyncFunction]",m="[object Function]",w="[object GeneratorFunction]",A="[object Proxy]";function S(t){if(!_(t))return!1;var e=b(t);return e==m||e==w||e==O||e==A}var x,E=o["__core-js_shared__"],T=(x=/[^.]+$/.exec(E&&E.keys&&E.keys.IE_PROTO||""))?"Symbol(src)_1."+x:"";var z=Function.prototype.toString;function P(t){if(null!=t){try{return z.call(t)}catch(t){}try{return t+""}catch(t){}}return""}var $=/^\[object .+?Constructor\]$/,F=Function.prototype,M=Object.prototype,k=F.toString,I=M.hasOwnProperty,B=RegExp("^"+k.call(I).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function R(t){return!(!_(t)||(e=t,T&&T in e))&&(S(t)?B:$).test(P(t));var e}function U(t,e){var r=function(t,e){return null==t?void 0:t[e]}(t,e);return R(r)?r:void 0}var C=U(Object,"create");var N=Object.prototype.hasOwnProperty;var D=Object.prototype.hasOwnProperty;function V(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}function q(t,e){for(var r,n,o=t.length;o--;)if((r=t[o][0])===(n=e)||r!=r&&n!=n)return o;return-1}V.prototype.clear=function(){this.__data__=C?C(null):{},this.size=0},V.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},V.prototype.get=function(t){var e=this.__data__;if(C){var r=e[t];return"__lodash_hash_undefined__"===r?void 0:r}return N.call(e,t)?e[t]:void 0},V.prototype.has=function(t){var e=this.__data__;return C?void 0!==e[t]:D.call(e,t)},V.prototype.set=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=C&&void 0===e?"__lodash_hash_undefined__":e,this};var L=Array.prototype.splice;function W(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}W.prototype.clear=function(){this.__data__=[],this.size=0},W.prototype.delete=function(t){var e=this.__data__,r=q(e,t);return!(r<0)&&(r==e.length-1?e.pop():L.call(e,r,1),--this.size,!0)},W.prototype.get=function(t){var e=this.__data__,r=q(e,t);return r<0?void 0:e[r][1]},W.prototype.has=function(t){return q(this.__data__,t)>-1},W.prototype.set=function(t,e){var r=this.__data__,n=q(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};var Y=U(o,"Map");function Z(t,e){var r,n,o=t.__data__;return("string"==(n=typeof(r=e))||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==r:null===r)?o["string"==typeof e?"string":"hash"]:o.map}function G(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1])}}G.prototype.clear=function(){this.size=0,this.__data__={hash:new V,map:new(Y||W),string:new V}},G.prototype.delete=function(t){var e=Z(this,t).delete(t);return this.size-=e?1:0,e},G.prototype.get=function(t){return Z(this,t).get(t)},G.prototype.has=function(t){return Z(this,t).has(t)},G.prototype.set=function(t,e){var r=Z(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this};var X="Expected a function";function H(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError(X);var r=function(){var n=arguments,o=e?e.apply(this,n):n[0],u=r.cache;if(u.has(o))return u.get(o);var i=t.apply(this,n);return r.cache=u.set(o,i)||u,i};return r.cache=new(H.Cache||G),r}H.Cache=G;var J,K,Q,tt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,et=/\\(\\)?/g,rt=(J=function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(tt,(function(t,r,n,o){e.push(n?o.replace(et,"$1"):r||t)})),e},K=H(J,(function(t){return 500===Q.size&&Q.clear(),t})),Q=K.cache,K),nt=rt;var ot=1/0,ut=u?u.prototype:void 0,it=ut?ut.toString:void 0;function ct(t){if("string"==typeof t)return t;if(e(t))return function(t,e){for(var r=-1,n=null==t?0:t.length,o=Array(n);++r<n;)o[r]=e(t[r],r,t);return o}(t,ct)+"";if(d(t))return it?it.call(t):"";var r=t+"";return"0"==r&&1/t==-ot?"-0":r}function at(t,r){return e(t)?t:function(t,r){if(e(t))return!1;var n=typeof t;return!("number"!=n&&"symbol"!=n&&"boolean"!=n&&null!=t&&!d(t))||g.test(t)||!j.test(t)||null!=r&&t in Object(r)}(t,r)?[t]:nt(function(t){return null==t?"":ct(t)}(t))}var ft=1/0;function lt(t){if("string"==typeof t||d(t))return t;var e=t+"";return"0"==e&&1/t==-ft?"-0":e}function st(t,e,r){var n=null==t?void 0:function(t,e){for(var r=0,n=(e=at(e,t)).length;null!=t&&r<n;)t=t[lt(e[r++])];return r&&r==n?t:void 0}(t,e);return void 0===n?r:n}function pt(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r,t););return t}var yt,bt=function(t,e,r){for(var n=-1,o=Object(t),u=r(t),i=u.length;i--;){var c=u[yt?i:++n];if(!1===e(o[c],c,o))break}return t},ht=bt;function vt(t){return h(t)&&"[object Arguments]"==b(t)}var dt=Object.prototype,jt=dt.hasOwnProperty,gt=dt.propertyIsEnumerable,_t=vt(function(){return arguments}())?vt:function(t){return h(t)&&jt.call(t,"callee")&&!gt.call(t,"callee")},Ot=_t;var mt="object"==typeof exports&&exports&&!exports.nodeType&&exports,wt=mt&&"object"==typeof module&&module&&!module.nodeType&&module,At=wt&&wt.exports===mt?o.Buffer:void 0,St=(At?At.isBuffer:void 0)||function(){return!1},xt=9007199254740991,Et=/^(?:0|[1-9]\d*)$/;function Tt(t,e){var r=typeof t;return!!(e=null==e?xt:e)&&("number"==r||"symbol"!=r&&Et.test(t))&&t>-1&&t%1==0&&t<e}var zt=9007199254740991;function Pt(t){return"number"==typeof t&&t>-1&&t%1==0&&t<=zt}var $t={};$t["[object Float32Array]"]=$t["[object Float64Array]"]=$t["[object Int8Array]"]=$t["[object Int16Array]"]=$t["[object Int32Array]"]=$t["[object Uint8Array]"]=$t["[object Uint8ClampedArray]"]=$t["[object Uint16Array]"]=$t["[object Uint32Array]"]=!0,$t["[object Arguments]"]=$t["[object Array]"]=$t["[object ArrayBuffer]"]=$t["[object Boolean]"]=$t["[object DataView]"]=$t["[object Date]"]=$t["[object Error]"]=$t["[object Function]"]=$t["[object Map]"]=$t["[object Number]"]=$t["[object Object]"]=$t["[object RegExp]"]=$t["[object Set]"]=$t["[object String]"]=$t["[object WeakMap]"]=!1;var Ft="object"==typeof exports&&exports&&!exports.nodeType&&exports,Mt=Ft&&"object"==typeof module&&module&&!module.nodeType&&module,kt=Mt&&Mt.exports===Ft&&r.process,It=function(){try{var t=Mt&&Mt.require&&Mt.require("util").types;return t||kt&&kt.binding&&kt.binding("util")}catch(t){}}(),Bt=It&&It.isTypedArray,Rt=Bt?function(t){return function(e){return t(e)}}(Bt):function(t){return h(t)&&Pt(t.length)&&!!$t[b(t)]},Ut=Rt,Ct=Object.prototype.hasOwnProperty;function Nt(t,r){var n=e(t),o=!n&&Ot(t),u=!n&&!o&&St(t),i=!n&&!o&&!u&&Ut(t),c=n||o||u||i,a=c?function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n}(t.length,String):[],f=a.length;for(var l in t)!r&&!Ct.call(t,l)||c&&("length"==l||u&&("offset"==l||"parent"==l)||i&&("buffer"==l||"byteLength"==l||"byteOffset"==l)||Tt(l,f))||a.push(l);return a}var Dt=Object.prototype;var Vt=function(t,e){return function(r){return t(e(r))}}(Object.keys,Object),qt=Vt,Lt=Object.prototype.hasOwnProperty;function Wt(t){if(r=(e=t)&&e.constructor,e!==("function"==typeof r&&r.prototype||Dt))return qt(t);var e,r,n=[];for(var o in Object(t))Lt.call(t,o)&&"constructor"!=o&&n.push(o);return n}function Yt(t){return null!=t&&Pt(t.length)&&!S(t)}function Zt(t){return Yt(t)?Nt(t):Wt(t)}var Gt=function(t,e){return function(r,n){if(null==r)return r;if(!Yt(r))return t(r,n);for(var o=r.length,u=e?o:-1,i=Object(r);(e?u--:++u<o)&&!1!==n(i[u],u,i););return r}}((function(t,e){return t&&ht(t,e,Zt)})),Xt=Gt;function Ht(t){return t}function Jt(t,r){var n;return(e(t)?pt:Xt)(t,"function"==typeof(n=r)?n:Ht)}var Kt=U(o,"DataView"),Qt=U(o,"Promise"),te=U(o,"Set"),ee=U(o,"WeakMap"),re="[object Map]",ne="[object Promise]",oe="[object Set]",ue="[object WeakMap]",ie="[object DataView]",ce=P(Kt),ae=P(Y),fe=P(Qt),le=P(te),se=P(ee),pe=b;(Kt&&pe(new Kt(new ArrayBuffer(1)))!=ie||Y&&pe(new Y)!=re||Qt&&pe(Qt.resolve())!=ne||te&&pe(new te)!=oe||ee&&pe(new ee)!=ue)&&(pe=function(t){var e=b(t),r="[object Object]"==e?t.constructor:void 0,n=r?P(r):"";if(n)switch(n){case ce:return ie;case ae:return re;case fe:return ne;case le:return oe;case se:return ue}return e});var ye=pe,be="[object String]";var he,ve=(he="length",function(t){return null==t?void 0:t[he]}),de=RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");var je="\\ud800-\\udfff",ge="["+je+"]",_e="[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]",Oe="\\ud83c[\\udffb-\\udfff]",me="[^"+je+"]",we="(?:\\ud83c[\\udde6-\\uddff]){2}",Ae="[\\ud800-\\udbff][\\udc00-\\udfff]",Se="(?:"+_e+"|"+Oe+")"+"?",xe="[\\ufe0e\\ufe0f]?",Ee=xe+Se+("(?:\\u200d(?:"+[me,we,Ae].join("|")+")"+xe+Se+")*"),Te="(?:"+[me+_e+"?",_e,we,Ae,ge].join("|")+")",ze=RegExp(Oe+"(?="+Oe+")|"+Te+Ee,"g");function Pe(t){return function(t){return de.test(t)}(t)?function(t){for(var e=ze.lastIndex=0;ze.test(t);)++e;return e}(t):ve(t)}var $e="[object Map]",Fe="[object Set]";function Me(t){if(null==t)return 0;if(Yt(t))return"string"==typeof(r=t)||!e(r)&&h(r)&&b(r)==be?Pe(t):t.length;var r,n=ye(t);return n==$e||n==Fe?t.size:Wt(t).length}var ke=Array.prototype.join;function Ie(t,e){return null==t?"":ke.call(t,e)}function Be(t){return"[object String]"===Object.prototype.toString.call(t)}function Re(t){return"[object Object]"===Object.prototype.toString.call(t)}function Ue(t){if(Re(t)){for(let e in t)return!0;return!1}return!1}function Ce(t){return"[object Array]"===Object.prototype.toString.call(t)}function Ne(t){return!!function(t){return"[object Undefined]"===Object.prototype.toString.call(t)}(t)||(!!function(t){return"[object Null]"===Object.prototype.toString.call(t)}(t)||(!!function(t){if(Re(t)){for(let e in t)return!1;return!0}return!1}(t)||(!!function(t){return!(!Be(t)||""!==t)}(t)||(!!function(t){return!!Ce(t)&&0===t.length}(t)||!!function(t){return t!=t}(t)))))}function De(t){return!!Ce(t)&&(0!==t.length&&(1!==t.length||!Ne(t[0])))}return{readTecplot:async function(t,e,r){return console.log("尚待開發"),null},writeTecplot:async function(e,r){if(!Ue(e)&&!De(e))throw new Error("mnes is not an effective object or array");Ue(e)&&(e=[e]);let n='TITLE = "Mesh" VARIABLES = "X", "Y", "Z", "M", "TYPE"\n';return Jt(e,(t=>{let e=st(t,"name","");if(!function(t){return!(!Be(t)||""===t)}(e))throw new Error("invalid name");let r=st(t,"nodes",[]);if(!De(r))throw new Error("nodes is not an effective array");let o=st(t,"eles",[]);if(!De(o))throw new Error("eles is not an effective array");let u=((t,e,r)=>{let n=Me(e),o=Me(r),u="";return u+=`ZONE T="${t}",N=${n}, E=${o}, F=fepoint, ET=brick\n`,Jt(e,(t=>{console.log("node",t);let e=Ie([st(t,"x",0),st(t,"y",0),st(t,"z",0),st(t,"mat",0),st(t,"type",0)]," ");u+=e+"\n"})),Jt(r,(t=>{let e=Ie(t.nodes," ");u+=e+"\n"})),u})(e,r,o);n+=u+"\n"})),t.writeFileSync(r,n,"utf8"),null}}}));
//# sourceMappingURL=w-mesh-tecplot.umd.js.map
