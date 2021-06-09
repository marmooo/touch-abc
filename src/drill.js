const correctAllAudio = new Audio('/touch-abc/mp3/correct1.mp3');
const correctAudio = new Audio('/touch-abc/mp3/correct3.mp3');
const incorrectAudio = new Audio('/touch-abc/mp3/incorrect1.mp3');
const stupidAudio = new Audio('/touch-abc/mp3/stupid5.mp3');
let canvasSize = 140;
let maxWidth = 4;
let fontFamily = localStorage.getItem('touch-abc-font');
if (!fontFamily) {
  fontFamily = 'Aref Ruqaa';
}

function toKanji(kanjiId) {
  return String.fromCodePoint(parseInt('0x' + kanjiId));
}

function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
  }
  if (localStorage.getItem('hint') == 1) {
    document.getElementById('hint').innerText = 'EASY';
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem('darkMode') == 1) {
    localStorage.setItem('darkMode', 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem('darkMode', 1);
    document.documentElement.dataset.theme = 'dark';
  }
}

function toggleHint(obj) {
  if (localStorage.getItem('hint') == 1) {
    localStorage.setItem('hint', 0);
    obj.innerText = 'HARD';
  } else {
    localStorage.setItem('hint', 1);
    obj.innerText = 'EASY';
  }
  toggleAllStroke();
}

function toggleScroll() {
  const scrollable = document.getElementById('scrollable');
  const pinned = document.getElementById('pinned');
  if (scrollable.classList.contains('d-none')) {
    window.removeEventListener("touchstart", scrollEvent, { passive:false });
    window.removeEventListener("touchmove", scrollEvent, { passive:false });
    scrollable.classList.remove('d-none');
    pinned.classList.add('d-none');
  } else {
    window.addEventListener("touchstart", scrollEvent, { passive:false });
    window.addEventListener("touchmove", scrollEvent, { passive:false });
    scrollable.classList.add('d-none');
    pinned.classList.remove('d-none');
  }
}

customElements.define('problem-box', class extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('problem-box').content.cloneNode(true);
    this.attachShadow({ mode:'open' }).appendChild(template);
  }
});
customElements.define('tehon-box', class extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('tehon-box').content.cloneNode(true);
    this.attachShadow({ mode:'open' }).appendChild(template);
  }
});
customElements.define('tegaki-box', class extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('tegaki-box').content.cloneNode(true);
    this.attachShadow({ mode:'open' }).appendChild(template);
  }
});

function getKakusu(object, kanjiId) {
  var max = 1;
  while(true) {
    var path = object.contentDocument.getElementById('kvg:' + kanjiId + '-s' + max);
    if (path) {
      max += 1;
    } else {
      break;
    }
  }
  return max - 1;
}

function sleep(time) {
  const d1 = new Date();
  while (true) {
    const d2 = new Date();
    if (d2 - d1 > time) {
      return;
    }
  }
}

function getTehonCanvas(object, kanjiId, kakusu, kakuNo) {
  return new Promise(function(resolve, reject) {
    var clonedContent = object.contentDocument.cloneNode(true);
    var id = 'kvg:StrokePaths_' + kanjiId;
    var paths = clonedContent.querySelector('[id="' + id + '"]');
    paths.style.stroke = 'black';
    for (var j=1; j<=kakusu; j++) {
      var path = clonedContent.getElementById('kvg:' + kanjiId + '-s' + j);
      if (kakuNo != j) {
        path.remove();
      }
    }
    var text = clonedContent.documentElement.outerHTML;
    var blob = new Blob([text], {type: 'image/svg+xml'});
    var url = URL.createObjectURL(blob);
    var img = new Image();
    img.src = url;
    img.onload = function() {
      var canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
      resolve(canvas);
    };
  });
}

function toKanjiId(str) {
  var hex = str.codePointAt(0).toString(16);
  return ('00000' + hex).slice(-5);
}

// フォントに weight が用意されているとは限らないため、
// 手書きの太さに合わせて bold 処理
function fillTextBold(ctx, kanji, spacing, fontSize) {
  var fontWidth = estimateFontWidth(ctx, kanji, spacing, fontSize);
  var markerWidth = maxWidth * 6;
  if (markerWidth < fontWidth) {
    ctx.fillText(kanji, spacing, fontSize);
  } else {
    var diff = markerWidth - fontWidth
    var w = Math.round(diff / 2);
    for (var x=-w; x<=w; x++) {
      for (var y=-w; y<=w; y++) {
        if (Math.round(Math.sqrt(x * x + y * y)) <= diff) {
          ctx.fillText(kanji, spacing+x, fontSize+y);
        }
      }
    }
  }
}

// フォントをずらして描画して線の太さを推定
// TODO: heavy
function estimateFontWidth(ctx, kanji, spacing, fontSize) {
  var width = maxWidth;
  ctx.fillText(kanji, spacing, fontSize);
  var imgData1 = ctx.getImageData(0, 0, canvasSize, canvasSize).data;
  var count1 = countNoTransparent(imgData1);
  ctx.fillText(kanji, spacing+width, fontSize+width);
  var imgData2 = ctx.getImageData(0, 0, canvasSize, canvasSize).data;
  var count2 = countNoTransparent(imgData2);
  var inclusionCount = getInclusionCount(imgData2, imgData1);
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  return maxWidth / (inclusionCount / count1);
}

function drawFont(canvas, kanji, kanjiId, loadCanvas) {
  var ctx = canvas.getContext('2d');
  var fontSize = canvasSize * 0.8;
  try {
    new URL(fontFamily);
    ctx.font = fontSize + 'px url';
  } catch {
    ctx.font = fontSize + 'px "' + fontFamily + '"';
  }
  // measureText はSafari の推定精度は低めで、右寄りにすると消しゴムに影響する
  // やや左寄りでも問題ないので、必ず枠内に収まるように多少の補正を加える
  var width = ctx.measureText(kanji).width * 0.9;
  var spacing = (canvasSize - width) / 2;
  if (loadCanvas) {
    ctx.fillStyle = 'lightgray';
    fillTextBold(ctx, kanji, spacing, fontSize);
    toggleStroke(canvas, kanjiId);
  } else {
    ctx.fillText(kanji, spacing, fontSize);
  }
}

function loadFont(kanji, kanjiId, parentNode, pos, loadCanvas) {
  var box;
  if (loadCanvas) {
    box = document.createElement('tegaki-box');
  } else {
    box = document.createElement('tehon-box');
  }
  // // SVG はセキュリティ上 Web フォントは dataURI で埋め込む必要がある
  // // 重過ぎるので canvas でレンダリングすべき
  // var object = box.shadowRoot.querySelector('svg');
  // var text = object.querySelector('text');
  // text.textContent = kanji;
  // text.setAttribute('font-family', fontFamily);
  // if (loadCanvas) {
  //   text.setAttribute('fill', 'lightgray');
  //   text.setAttribute('font-weight', 900);
  // }
  var object = box.shadowRoot.querySelector('#tehon');
  object.setAttribute('alt', kanji);
  object.setAttribute('data-id', kanjiId);
  object.setAttribute('data-pos', pos);
  drawFont(object, kanji, kanjiId, loadCanvas);
  parentNode.appendChild(box);
  return object;
}

function showKanjiScore(kanjiScore, scoreObj, tehonKanji, object, kanjiId) {
  var kanjiScore = Math.floor(kanjiScore);
  if (kanjiScore >= 80) {
    correctAudio.play();
  } else {
    incorrectAudio.play();
  }
  scoreObj.classList.remove('d-none');
  scoreObj.innerText = kanjiScore;
  if (localStorage.getItem('hint') != 1) {
    object.style.visibility = 'visible';
  }
}

function getProblemScores(tegakiPanel, tehonPanel, objects, tegakiPads) {
  var promises = [];
  objects.forEach((object, i) => {
    var kanjiId = object.dataset.id;
    var pos = parseInt(object.dataset.pos);
    var kanjiScore = 0;
    var tegakiData = tegakiPads[i].toData();
    if (tegakiData.length != 0) {
      var tehonKanji = tehonPanel.children[pos].shadowRoot.querySelector('object');
      var scoreObj = tegakiPanel.children[pos].shadowRoot.querySelector('#score');
      var kanjiScore = getKanjiScore(tegakiData, object, kanjiId);
      showKanjiScore(kanjiScore, scoreObj, tehonKanji, object, kanjiId);
    }
    promises[i] = kanjiScore;
  });
  return Promise.all(promises);
}

function unlockAudio(audio) {
  audio.volume = 0;
  audio.play();
  audio.pause();
  audio.currentTime = 0;
  audio.volume = 1;
}

function unlockAudios() {
  unlockAudio(correctAllAudio);
  unlockAudio(correctAudio);
  unlockAudio(incorrectAudio);
  unlockAudio(stupidAudio);
}

function setScoringButton(problemBox, tegakiPanel, tehonPanel, objects, tegakiPads, word) {
  var scoring = problemBox.shadowRoot.querySelector('#scoring');
  scoring.addEventListener('click', function() {
    getProblemScores(tegakiPanel, tehonPanel, objects, tegakiPads).then(scores => {
      if (scores.every(score => score >= 80)) {
        problemBox.shadowRoot.querySelector('#guard').style.height = '100%';
        var next = problemBox.nextElementSibling;
        if (next) {
          next.shadowRoot.querySelector('#guard').style.height = '0';
          const headerHeight = document.getElementById('header').offsetHeight;
          const top = next.getBoundingClientRect().top + document.documentElement.scrollTop - headerHeight;
          window.scrollTo({ top:top, behavior:'smooth' });
        } else {
          window.removeEventListener('touchstart', scrollEvent, { passive:false });
          window.removeEventListener('touchmove', scrollEvent, { passive:false });
        }
      }
      var clearedKanjis = localStorage.getItem('touch-abc');
      if (!clearedKanjis) { clearedKanjis = ''; }
      scores.forEach((score, i) => {
        if (score < 40) {
          // 点数があまりにも低いものは合格リストから除外
          clearedKanjis = clearedKanjis.replace(word[i], '');
        }
      });
      localStorage.setItem('touch-abc', clearedKanjis);
    });
  });
}

function setSignaturePad(object) {
  var canvas = object.parentNode.querySelector('#tegaki');
  return new SignaturePad(canvas, {
    minWidth: 2,
    maxWidth: 2,
    penColor: 'black',
    throttle: 0,
    minDistance: 0,
  });
}

function setEraser(tegakiPad, tegakiPanel, tehonPanel, object, kanjiId) {
  const currKanji = object.getRootNode().host;
  const kanjiPos = [...tegakiPanel.children].findIndex(x => x == currKanji);
  tehonPanel.children[kanjiPos].shadowRoot.querySelector('#eraser').onclick = function() {
    var data = tegakiPad.toData();
    if (data) {
      tegakiPad.clear();
    }
    var pos = parseInt(object.dataset.pos);
    var scoreObj = tegakiPanel.children[pos].shadowRoot.querySelector('#score');
    scoreObj.classList.add('d-none');
    if (localStorage.getItem('hint') != 1) {
      object.style.visibility = 'hidden';
    }
  }
}

let englishVoices = [];
function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function(resolve, reject) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", function() {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
  allVoicesObtained.then(voices => {
    englishVoices = voices.filter(voice => voice.lang == 'en-US' );
  });
}
loadVoices();

function setSound(tehonPanel, object, kanji) {
  var pos = parseInt(object.dataset.pos);
  var sound = tehonPanel.children[pos].shadowRoot.querySelector('#sound');
  var lower = kanji.toLowerCase();
  sound.onclick = function() {
    var msg = new SpeechSynthesisUtterance(lower);
    msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
    msg.lang = 'en-US';
    speechSynthesis.speak(msg);
  }
}

function loadProblem(problem, answer) {
  var problemBox = document.createElement('problem-box');
  var shadow = problemBox.shadowRoot;
  var objects = [];
  var tegakiPads = [];
  var tehon = shadow.querySelector('#tehon');
  var tegaki = shadow.querySelector('#tegaki');
  for (var i=0; i<problem.length; i++) {
    var kanji = problem[i];
    var kanjiId = toKanjiId(kanji);
    loadFont(kanji, kanjiId, tehon, i, false);
    var object = loadFont(kanji, kanjiId, tegaki, i, true);
    var tegakiPad = setSignaturePad(object);
    objects.push(object);
    tegakiPads.push(tegakiPad);
    setEraser(tegakiPad, tegaki, tehon, object, kanjiId);
    setSound(tehon, object, kanji);
  }
  setScoringButton(problemBox, tegaki, tehon, objects, tegakiPads, problem);
  document.getElementById('problems').appendChild(problemBox);
}

function loadDrill(problems1, problems2) {
  for (var i=0; i<problems1.length; i++) {
    loadProblem(problems1[i], problems2[i]);
  }
}

// 器用差の大きい低学年の採点が緩くなるよう太さを変える
function setStrokeWidth(kakusu) {
  return 15 + 6 / kakusu;
}

function toggleAllStroke() {
  var problems = document.getElementById('problems').children;
  for (const problem of problems) {
    var tegakiBoxes = problem.shadowRoot.querySelector('#tegaki').children;
    for (const tegakiBox of tegakiBoxes) {
      var object = tegakiBox.shadowRoot.querySelector('#tehon');
      var kanjiId = object.dataset.id;
      toggleStroke(object, kanjiId);
    }
  }
}

function toggleStroke(object, kanjiId) {
  if (localStorage.getItem('hint') != 1) {
    object.style.visibility = 'hidden';
  } else {
    object.style.visibility = 'visible';
  }
}

function countNoTransparent(data) {
  var count = 0;
  for (var i=3; i < data.length; i+=4) {
    if (data[i] != 0) {
      count += 1;
    }
  }
  return count;
}

function getInclusionCount(tegakiImgData, tehonImgData) {
  for (var i=3; i<tegakiImgData.length; i+=4) {
    if (tehonImgData[i] != 0) {
      tegakiImgData[i] = 0;
    }
  }
  var inclusionCount = countNoTransparent(tegakiImgData);
  return inclusionCount;
}

function calcKanjiScore(tegakiCount, tehonCount, inclusionCount) {
  // 線長を優遇し過ぎると ["未","末"], ["土","士"] の見分けができなくなる (10% 許容)
  var lineScore = (1 - Math.abs((tehonCount - tegakiCount) / tehonCount));
  if (lineScore > 1) { lineScore = 1; }
  // 画ごとに判定していないので厳しく設定
  // 包含率を優遇し過ぎると ["一","つ"], ["二","＝"] の見分けができなくなる (30% 許容)
  var inclusionScore = (tegakiCount - inclusionCount) / tegakiCount;
  if (inclusionScore > 1) { inclusionScore = 1; }
  // 漢字と比べてかなり難しいので採点はかなりゆるくする
  // 100点が取れないので少しだけ採点を甘くする
  var kakuScore = lineScore * inclusionScore * 100 * 1.5;
  if (kakuScore <   0) { kakuScore =   0; }
  if (kakuScore > 100) { kakuScore = 100; }
  if (isNaN(kakuScore)) { kakuScore = 0; }
  return kakuScore;
}

function getKanjiScore(tegakiData, object, kanjiId) {
  var markerWidth = maxWidth * 3;
  var markerCanvas = document.createElement('canvas');
  markerCanvas.setAttribute('width', canvasSize);
  markerCanvas.setAttribute('height', canvasSize);
  var markerContext = markerCanvas.getContext('2d');
  var markerPad = new SignaturePad(markerCanvas, {
    minWidth: markerWidth,
    maxWidth: markerWidth,
    penColor: 'black',
  });
  markerPad.fromData(tegakiData);
  var tegakiImgData = markerContext.getImageData(0, 0, canvasSize, canvasSize).data;
  var tegakiCount = countNoTransparent(tegakiImgData);
  var tehonImgData = object.getContext('2d').getImageData(0, 0, canvasSize, canvasSize).data;
  var tehonCount = countNoTransparent(tehonImgData);

  var inclusionCount = getInclusionCount(tegakiImgData, tehonImgData);
  var kanjiScore = calcKanjiScore(tegakiCount, tehonCount, inclusionCount);
  return kanjiScore;
}

function report(obj) {
  var scores = [];
  var problems = document.getElementById('problems').children;
  for (var i=0; i<problems.length; i++) {
    var tegakis = problems[i].shadowRoot.querySelector('#tegaki').children;
    for (var j=0; j<tegakis.length; j++) {
      var score = tegakis[j].shadowRoot.querySelector('#score').innerText;
      scores.push(parseInt(score));
    }
  }
  var score = 0;
  for (var i=0; i<scores.length; i++) {
    score += scores[i];
  }
  score /= scores.length;
  if (score >= 80) {
    correctAllAudio.play();
    var clearedKanjis = localStorage.getItem('touch-abc');
    if (clearedKanjis) {
      kanjis.split('').forEach(kanji => {
        if (!clearedKanjis.includes(kanji)) {
          clearedKanjis += kanji;
        }
      });
      localStorage.setItem('touch-abc', clearedKanjis);
    } else {
      localStorage.setItem('touch-abc', kanjis);
    }
    document.getElementById('report').classList.add('d-none');
    document.getElementById('correctReport').classList.remove('d-none');
    setTimeout(() => {
      location.href = '/touch-abc/';
    }, 3000);
  } else {
    stupidAudio.play();
    document.getElementById('report').classList.add('d-none');
    document.getElementById('incorrectReport').classList.remove('d-none');
    setTimeout(function() {
      document.getElementById('report').classList.remove('d-none');
      document.getElementById('incorrectReport').classList.add('d-none');
    }, 6000);
  }
}

function shuffle(array) {
  for(var i = array.length - 1; i > 0; i--){
    var r = Math.floor(Math.random() * (i + 1));
    var tmp = array[i];
    array[i] = array[r];
    array[r] = tmp;
  }
  return array;
}

function parseQuery(queryString) {
  var query = {};
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

function uniq(array) {
  return array.filter((elem, index, self) => self.indexOf(elem) === index);
}

function convUpperLower(str) {a
  res = '';
  for (var i = 0; i < str.length; ++i) {
    c = str[i];
    if (c == c.toUpperCase()) {
      res += c.toLowerCase();
    } else if (c == c.toLowerCase()) {
      res += c.toUpperCase();
    } else {
      res += c;
    }
  }
  return res;
}

let kanjis = '';
let mode = 'uu';
function initQueryBase() {
  var problems1, problems2;
  var queries = parseQuery(location.search);
  mode = queries['mode'];
  kanjis = queries['q'];
  if (kanjis) {
    if (mode == 'conv') {
      var conved = convUpperLower(kanjis);
      problems1 = kanjis.split('');
      problems2 = conved.split('');
    } else {
      problems1 = kanjis.split('');
      problems2 = kanjis.split('');
    }
  } else {
    var uppers = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    var lowers = Array.from('abcdefghijklmnopqrstuvwxyz');
    if (mode == 'uu') {
      problems1 = uppers;
      problems2 = uppers;
    } else if (mode == 'ul') {
      problems1 = uppers;
      problems2 = lowers;
    } else if (mode == 'll') {
      problems1 = lowers;
      problems2 = lowers;
    } else {
      problems1 = lowers;
      problems2 = uppers;
    }
  }
  loadDrill(problems1, problems2);
  document.getElementById('problems').children[0].shadowRoot.querySelector('#guard').style.height = '0';
}

function initQuery() {
  try {
    new URL(fontFamily);
    const fontFace = new FontFace('url', `url(${fontFamily}`);
    fontFace.load().then(function() {
      document.fonts.add(fontFace);
      initQueryBase()
    });
  } catch {
    document.fonts.ready.then(function() {
      initQueryBase();
    });
  }
}
// https://qiita.com/noraworld/items/2834f2e6f064e6f6d41a
// https://webinlet.com/2020/ios11以降でピンチインアウト拡大縮小禁止
// 手を置いた時の誤爆を防ぎつつスクロールは許可
function scrollEvent(e) {
  if (!['MAIN', 'PROBLEM-BOX', 'A', 'BUTTON', 'path'].includes(e.target.tagName)) {
    e.preventDefault();
  }
}
document.addEventListener("touchstart", unlockAudios, { once:true });

