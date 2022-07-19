const uppers=Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ"),lowers=Array.from("abcdefghijklmnopqrstuvwzyz");loadConfig();function selectFontFromURL(){this.classList.add("disabled");const a=document.getElementById("fontURL").value;try{new URL(a),document.getElementById("fontLoadError").classList.add("d-none"),document.getElementById("fontLoading").classList.remove("d-none");const b=new FontFace("url",`url(${a})`);b.load().then(function(){document.fonts.add(b),localStorage.setItem("touch-abc-font",a),document.getElementById("selectedFont").style.fontFamily="url",document.getElementById("fontLoading").classList.add("d-none")})}catch{document.getElementById("fontLoadError").classList.remove("d-none")}this.classList.remove("disabled")}function selectFont(){const b=this.getAttribute("id"),a=b.replace(/-/g," ");localStorage.setItem("touch-abc-font",a),document.getElementById("selectedFont").style.fontFamily=a}function setFontSelector(){const b=document.getElementById("fontSelector").getElementsByClassName("carousel-item");[...b].forEach(b=>{const a=b.children[0],c=a.getAttribute("id"),d=c.replace(/-/g," ");a.style.fontFamily=d});let a=localStorage.getItem("touch-abc-font");a||(a="Aref Ruqaa"),document.getElementById("selectedFont").style.fontFamily=a,document.getElementById("fontURL").addEventListener("keydown",a=>{a.key=="Enter"&&selectFontFromURL(document.getElementById("fontURL"))})}function changeLevel(){const a=this.selectedIndex;localStorage.setItem("touch-abc-level",a)}function loadConfig(){if(localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark"),localStorage.getItem("touch-abc-level")){const a=parseInt(localStorage.getItem("touch-abc-level"));document.getElementById("levelOption").options[a].selected=!0}if(localStorage.getItem("furigana")==1){const a=document.getElementById("addFurigana");addFurigana(a),a.setAttribute("data-done",!0)}}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}function addFurigana(){const a=document.getElementById("addFurigana");a.getAttribute("data-done")?(localStorage.setItem("furigana",0),location.reload()):(import("https://marmooo.github.io/yomico/yomico.min.js").then(a=>{a.yomico("/touch-abc/index.yomi")}),localStorage.setItem("furigana",1),a.setAttribute("data-done",!0))}function setCleared(b){const a=localStorage.getItem("touch-abc");if(a){const c=b.children;for(let b=0;b<c.length;b++)a.includes(c[b].textContent)&&(c[b].classList.remove("btn-outline-secondary"),c[b].classList.add("btn-secondary"))}}function deleteData(){localStorage.removeItem("touch-abc"),location.reload()}function generateDrill(){const a=document.getElementById("search").value;a&&/^[a-zA-Z]+$/.test(a)&&(location.href=`/touch-abc/drill/?q=${a}`)}function setLinkTemplate(){const a=document.createElement("a");return a.className="me-1 mb-1 btn btn-outline-secondary btn-sm",a}const linkTemplate=setLinkTemplate();function setProblems(a,b){while(a.lastElementChild)a.removeChild(a.lastChild);for(let c=0;c<b.length;c++){const e=b[c].repeat(6),d=linkTemplate.cloneNode();d.href=`/touch-abc/drill/?q=${e}`,d.textContent=b[c],a.appendChild(d)}}const problems=document.getElementById("cleared50on"),alphabets=uppers.concat(lowers);setProblems(problems,alphabets),setCleared(problems),setFontSelector(),document.getElementById("toggleDarkMode").onclick=toggleDarkMode,document.getElementById("addFurigana").onclick=addFurigana,document.getElementById("generateDrill").onclick=generateDrill,document.getElementById("deleteData").onclick=deleteData,document.getElementById("selectFontFromURL").onclick=deleteData,[...document.getElementById("fontsCarousel").getElementsByClassName("selectFont")].forEach(a=>{a.onclick=selectFont}),document.getElementById("levelOption").onchange=changeLevel,document.getElementById("search").addEventListener("keydown",function(a){if(a.key=="Enter"){const a=this.value;location.href=`/touch-abc/drill/?q=${a}`}},!1),new bootstrap.Carousel(document.getElementById("fontsCarousel")),document.ondblclick=a=>{a.preventDefault()},document.body.style.webkitUserSelect="none"