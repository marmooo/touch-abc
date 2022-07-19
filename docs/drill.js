let englishVoices=[],correctAudio,incorrectAudio,correctAllAudio,stupidAudio;loadAudios();const AudioContext=window.AudioContext||window.webkitAudioContext,audioContext=new AudioContext,canvasSize=140,maxWidth=4;let level=2,fontFamily=localStorage.getItem("touch-abc-font");fontFamily||(fontFamily="Aref Ruqaa"),loadConfig();function loadConfig(){localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark"),localStorage.getItem("hint")==1&&(document.getElementById("hint").textContent="EASY"),localStorage.getItem("touch-abc-level")&&(level=parseInt(localStorage.getItem("touch-abc-level"))),localStorage.getItem("furigana")==1&&addFurigana()}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}async function addFurigana(){const a=await import("https://marmooo.github.io/yomico/yomico.min.js");a.yomico("/touch-abc/drill/index.yomi")}function toggleHint(a){localStorage.getItem("hint")==1?(localStorage.setItem("hint",0),a.textContent="HARD"):(localStorage.setItem("hint",1),a.textContent="EASY"),toggleAllStroke()}function toggleScroll(){const a=document.getElementById("scrollable"),b=document.getElementById("pinned");a.classList.contains("d-none")?(window.removeEventListener("touchstart",scrollEvent,{passive:!1}),window.removeEventListener("touchmove",scrollEvent,{passive:!1}),a.classList.remove("d-none"),b.classList.add("d-none")):(window.addEventListener("touchstart",scrollEvent,{passive:!1}),window.addEventListener("touchmove",scrollEvent,{passive:!1}),a.classList.add("d-none"),b.classList.remove("d-none"))}function playAudio(c,b){const a=audioContext.createBufferSource();if(a.buffer=c,b){const c=audioContext.createGain();c.gain.value=b,c.connect(audioContext.destination),a.connect(c),a.start()}else a.connect(audioContext.destination),a.start()}function unlockAudio(){audioContext.resume()}function loadAudio(a){return fetch(a).then(a=>a.arrayBuffer()).then(a=>new Promise((b,c)=>{audioContext.decodeAudioData(a,a=>{b(a)},a=>{c(a)})}))}function loadAudios(){promises=[loadAudio("/touch-abc/mp3/correct3.mp3"),loadAudio("/touch-abc/mp3/incorrect1.mp3"),loadAudio("/touch-abc/mp3/correct1.mp3"),loadAudio("/touch-abc/mp3/stupid5.mp3")],Promise.all(promises).then(a=>{correctAudio=a[0],incorrectAudio=a[1],correctAllAudio=a[2],stupidAudio=a[3]})}customElements.define("problem-box",class extends HTMLElement{constructor(){super();const a=document.getElementById("problem-box").content.cloneNode(!0);this.attachShadow({mode:"open"}).appendChild(a)}}),customElements.define("tehon-box",class extends HTMLElement{constructor(){super();const a=document.getElementById("tehon-box").content.cloneNode(!0);this.attachShadow({mode:"open"}).appendChild(a)}}),customElements.define("tegaki-box",class extends HTMLElement{constructor(){super();const a=document.getElementById("tegaki-box").content.cloneNode(!0);this.attachShadow({mode:"open"}).appendChild(a)}});function fillTextBold(a,b,c,d){const e=estimateFontWidth(a,b,c,d),f=maxWidth*6;if(f<e)a.fillText(b,c,d);else{const h=f-e,g=Math.round(h/2);for(let e=-g;e<=g;e++)for(let f=-g;f<=g;f++)Math.round(Math.sqrt(e*e+f*f))<=h&&a.fillText(b,c+e,d+f)}}function estimateFontWidth(a,b,c,d){const e=maxWidth;a.fillText(b,c,d);const f=a.getImageData(0,0,canvasSize,canvasSize).data,g=countNoTransparent(f);a.fillText(b,c+e,d+e);const h=a.getImageData(0,0,canvasSize,canvasSize).data,i=getInclusionCount(h,f);return a.clearRect(0,0,canvasSize,canvasSize),maxWidth/(i/g)}function drawFont(d,c,f){const a=d.getContext("2d"),b=canvasSize*.8;try{new URL(fontFamily),a.font=b+"px url"}catch{a.font=b+'px "'+fontFamily+'"'}const g=a.measureText(c).width*.9,e=(canvasSize-g)/2;f?(a.fillStyle="lightgray",fillTextBold(a,c,e,b),toggleStroke(d)):a.fillText(c,e,b)}function loadFont(d,e,f,g,c){let b;c?b=document.createElement("tegaki-box"):b=document.createElement("tehon-box");const a=b.shadowRoot.querySelector("#tehon");return a.setAttribute("alt",d),a.setAttribute("data-id",e),a.setAttribute("data-pos",g),drawFont(a,d,c),f.appendChild(b),a}function showKanjiScore(a,b,c){a=Math.floor(a),a>=80?playAudio(correctAudio):playAudio(incorrectAudio),b.classList.remove("d-none"),b.textContent=a,localStorage.getItem("hint")!=1&&(c.style.visibility="visible")}function getProblemScores(b,c,d){const a=[];return c.forEach((c,f)=>{const h=parseInt(c.dataset.pos),g=d[f].toData();let e=0;if(g.length!=0){const a=b.children[h].shadowRoot.querySelector("#score");e=getKanjiScore(g,c),showKanjiScore(e,a,c)}a[f]=e}),Promise.all(a)}function setScoringButton(a,b,c,d,e){const f=a.shadowRoot.querySelector("#scoring");f.addEventListener("click",function(){getProblemScores(b,c,d).then(c=>{if(c.every(a=>a>=80)){a.shadowRoot.querySelector("#guard").style.height="100%";const b=a.nextElementSibling;if(b){b.shadowRoot.querySelector("#guard").style.height="0";const a=document.getElementById("header").offsetHeight,c=b.getBoundingClientRect().top+document.documentElement.scrollTop-a;window.scrollTo({top:c,behavior:"smooth"})}else window.removeEventListener("touchstart",scrollEvent,{passive:!1}),window.removeEventListener("touchmove",scrollEvent,{passive:!1})}let b=localStorage.getItem("touch-abc");b||(b=""),c.forEach((a,c)=>{a<40&&(b=b.replace(e[c],""))}),localStorage.setItem("touch-abc",b)})})}function setSignaturePad(a){const b=a.parentNode.querySelector("#tegaki");return new SignaturePad(b,{minWidth:2,maxWidth:2,penColor:"black",throttle:0,minDistance:0})}function setEraser(b,c,d,a){const e=a.getRootNode().host,f=[...c.children].findIndex(a=>a==e);d.children[f].shadowRoot.querySelector("#eraser").onclick=function(){const d=b.toData();d&&b.clear();const e=parseInt(a.dataset.pos),f=c.children[e].shadowRoot.querySelector("#score");f.classList.add("d-none"),localStorage.getItem("hint")!=1&&(a.style.visibility="hidden")}}function loadVoices(){const a=new Promise(function(b){let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",function(){c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});a.then(a=>{englishVoices=a.filter(a=>a.lang=="en-US")})}loadVoices();function setSound(a,b,c){const d=parseInt(b.dataset.pos),e=a.children[d].shadowRoot.querySelector("#sound"),f=c.toLowerCase();e.onclick=function(){const a=new SpeechSynthesisUtterance(f);a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang="en-US",speechSynthesis.speak(a)}}function loadProblem(a,h){const c=document.createElement("problem-box"),e=c.shadowRoot,f=[],g=[],d=e.querySelector("#tehon"),b=e.querySelector("#tegaki");for(let c=0;c<a.length;c++){loadFont(a[c],a[c],d,c,!1);const e=loadFont(h[c],h[c],b,c,!0),i=setSignaturePad(e);f.push(e),g.push(i),setEraser(i,b,d,e),setSound(d,e,a[c])}setScoringButton(c,b,f,g,a),document.getElementById("problems").appendChild(c)}function loadDrill(a,b){for(let c=0;c<a.length;c++)loadProblem(a[c],b[c])}function toggleAllStroke(){const a=document.getElementById("problems").children;for(const b of a){const c=b.shadowRoot.querySelector("#tegaki").children;for(const a of c){const b=a.shadowRoot.querySelector("#tehon");toggleStroke(b)}}}function toggleStroke(a){localStorage.getItem("hint")!=1?a.style.visibility="hidden":a.style.visibility="visible"}function countNoTransparent(a){let b=0;for(let c=3;c<a.length;c+=4)a[c]!=0&&(b+=1);return b}function getInclusionCount(a,b){for(let c=3;c<a.length;c+=4)b[c]!=0&&(a[c]=0);const c=countNoTransparent(a);return c}function getScoringFactor(a){switch(a){case 0:return.5**2;case 1:return.6**2;case 2:return.7**2;case 3:return.8**2;case 4:return.9**2;default:return.7**2}}function calcKanjiScore(b,e,f){let c=1-Math.abs((e-b)/e);c>1&&(c=1);let d=(b-f)/b;d>1&&(d=1);let a=c*d*100/getScoringFactor(level);return a<0&&(a=0),a>100&&(a=100),isNaN(a)&&(a=0),a}function getKanjiScore(c,f){const a=maxWidth*3;c.forEach(b=>{b.minWidth=a,b.maxWidth=a});const b=document.createElement("canvas");b.setAttribute("width",canvasSize),b.setAttribute("height",canvasSize);const g=b.getContext("2d"),h=new SignaturePad(b,{minWidth:a,maxWidth:a,penColor:"black"});h.fromData(c);const d=g.getImageData(0,0,canvasSize,canvasSize).data,i=countNoTransparent(d),e=f.getContext("2d").getImageData(0,0,canvasSize,canvasSize).data,j=countNoTransparent(e),k=getInclusionCount(d,e),l=calcKanjiScore(i,j,k);return l}function report(){const a=[],c=document.getElementById("problems").children;for(let b=0;b<c.length;b++){const d=c[b].shadowRoot.querySelector("#tegaki").children;for(let b=0;b<d.length;b++){const c=d[b].shadowRoot.querySelector("#score").textContent;a.push(parseInt(c))}}let b=0;for(let c=0;c<a.length;c++)b+=a[c];if(b/=a.length,b>=80){playAudio(correctAllAudio);let a=localStorage.getItem("touch-abc");kanjis&&(a?(kanjis.split("").forEach(b=>{a.includes(b)||(a+=b)}),localStorage.setItem("touch-abc",a)):localStorage.setItem("touch-abc",kanjis)),document.getElementById("report").classList.add("d-none"),document.getElementById("correctReport").classList.remove("d-none"),setTimeout(()=>{location.href="/touch-abc/"},3e3)}else playAudio(stupidAudio),document.getElementById("report").classList.add("d-none"),document.getElementById("incorrectReport").classList.remove("d-none"),setTimeout(function(){document.getElementById("report").classList.remove("d-none"),document.getElementById("incorrectReport").classList.add("d-none")},6e3)}function parseQuery(a){const b={},c=(a[0]==="?"?a.substr(1):a).split("&");for(let a=0;a<c.length;a++){const d=c[a].split("=");b[decodeURIComponent(d[0])]=decodeURIComponent(d[1]||"")}return b}function convUpperLower(b){a,res="";for(let a=0;a<b.length;++a)c=b[a],c==c.toUpperCase()?res+=c.toLowerCase():c==c.toLowerCase()?res+=c.toUpperCase():res+=c;return res}let kanjis="",mode="uu";function initQueryBase(){let a,b;const c=parseQuery(location.search);if(mode=c.mode,kanjis=c.q,kanjis)if(mode=="conv"){const c=convUpperLower(kanjis);a=kanjis.split(""),b=c.split("")}else a=kanjis.split(""),b=kanjis.split("");else{const c=Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),d=Array.from("abcdefghijklmnopqrstuvwxyz");mode=="uu"?(a=c,b=c):mode=="ul"?(a=c,b=d):mode=="ll"?(a=d,b=d):(a=d,b=c)}loadDrill(a,b),document.getElementById("problems").children[0].shadowRoot.querySelector("#guard").style.height="0"}function initQuery(){try{new URL(fontFamily);const a=new FontFace("url",`url(${fontFamily}`);a.load().then(function(){document.fonts.add(a),initQueryBase()})}catch{document.fonts.ready.then(function(){initQueryBase()})}}function scrollEvent(a){["MAIN","PROBLEM-BOX","A","BUTTON","path"].includes(a.target.tagName)||a.preventDefault()}initQuery(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("toggleScroll").onclick=toggleScroll,document.getElementById("hint").onclick=toggleHint,document.getElementById("reportButton").onclick=report,document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})