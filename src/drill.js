let correctAudio, incorrectAudio, correctAllAudio, stupidAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const canvasSize = 140;
const maxWidth = 4;
let fontFamily = localStorage.getItem("touch-abc-font");
if (!fontFamily) {
  fontFamily = "Aref Ruqaa";
}

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("hint") == 1) {
    document.getElementById("hint").textContent = "EASY";
  }
}
loadConfig();

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function toggleHint(obj) {
  if (localStorage.getItem("hint") == 1) {
    localStorage.setItem("hint", 0);
    obj.textContent = "HARD";
  } else {
    localStorage.setItem("hint", 1);
    obj.textContent = "EASY";
  }
  toggleAllStroke();
}

function toggleScroll() {
  const scrollable = document.getElementById("scrollable");
  const pinned = document.getElementById("pinned");
  if (scrollable.classList.contains("d-none")) {
    window.removeEventListener("touchstart", scrollEvent, { passive: false });
    window.removeEventListener("touchmove", scrollEvent, { passive: false });
    scrollable.classList.remove("d-none");
    pinned.classList.add("d-none");
  } else {
    window.addEventListener("touchstart", scrollEvent, { passive: false });
    window.addEventListener("touchmove", scrollEvent, { passive: false });
    scrollable.classList.add("d-none");
    pinned.classList.remove("d-none");
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("/touch-abc/mp3/correct3.mp3"),
    loadAudio("/touch-abc/mp3/incorrect1.mp3"),
    loadAudio("/touch-abc/mp3/correct1.mp3"),
    loadAudio("/touch-abc/mp3/stupid5.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    correctAudio = audioBuffers[0];
    incorrectAudio = audioBuffers[1];
    correctAllAudio = audioBuffers[2];
    stupidAudio = audioBuffers[3];
  });
}

customElements.define(
  "problem-box",
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById("problem-box").content.cloneNode(
        true,
      );
      this.attachShadow({ mode: "open" }).appendChild(template);
    }
  },
);
customElements.define(
  "tehon-box",
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById("tehon-box").content.cloneNode(
        true,
      );
      this.attachShadow({ mode: "open" }).appendChild(template);
    }
  },
);
customElements.define(
  "tegaki-box",
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById("tegaki-box").content.cloneNode(
        true,
      );
      this.attachShadow({ mode: "open" }).appendChild(template);
    }
  },
);

// function getTehonCanvas(object, kanjiId, kakusu, kakuNo) {
//   return new Promise(function (resolve) {
//     const clonedContent = object.contentDocument.cloneNode(true);
//     const id = "kvg:StrokePaths_" + kanjiId;
//     const paths = clonedContent.querySelector('[id="' + id + '"]');
//     paths.style.stroke = "black";
//     for (let j = 1; j <= kakusu; j++) {
//       const path = clonedContent.getElementById("kvg:" + kanjiId + "-s" + j);
//       if (kakuNo != j) {
//         path.remove();
//       }
//     }
//     const text = clonedContent.documentElement.outerHTML;
//     const blob = new Blob([text], { type: "image/svg+xml" });
//     const url = URL.createObjectURL(blob);
//     const img = new Image();
//     img.src = url;
//     img.onload = function () {
//       const canvas = document.createElement("canvas");
//       canvas.width = canvasSize;
//       canvas.height = canvasSize;
//       const ctx = canvas.getContext("2d");
//       ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
//       resolve(canvas);
//     };
//   });
// }

// フォントに weight が用意されているとは限らないため、
// 手書きの太さに合わせて bold 処理
function fillTextBold(ctx, kanji, spacing, fontSize) {
  const fontWidth = estimateFontWidth(ctx, kanji, spacing, fontSize);
  const markerWidth = maxWidth * 6;
  if (markerWidth < fontWidth) {
    ctx.fillText(kanji, spacing, fontSize);
  } else {
    const diff = markerWidth - fontWidth;
    const w = Math.round(diff / 2);
    for (let x = -w; x <= w; x++) {
      for (let y = -w; y <= w; y++) {
        if (Math.round(Math.sqrt(x * x + y * y)) <= diff) {
          ctx.fillText(kanji, spacing + x, fontSize + y);
        }
      }
    }
  }
}

// フォントをずらして描画して線の太さを推定
// TODO: heavy
function estimateFontWidth(ctx, kanji, spacing, fontSize) {
  const width = maxWidth;
  ctx.fillText(kanji, spacing, fontSize);
  const imgData1 = ctx.getImageData(0, 0, canvasSize, canvasSize).data;
  const count1 = countNoTransparent(imgData1);
  ctx.fillText(kanji, spacing + width, fontSize + width);
  const imgData2 = ctx.getImageData(0, 0, canvasSize, canvasSize).data;
  const inclusionCount = getInclusionCount(imgData2, imgData1);
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  return maxWidth / (inclusionCount / count1);
}

function drawFont(canvas, kanji, loadCanvas) {
  const ctx = canvas.getContext("2d");
  const fontSize = canvasSize * 0.8;
  try {
    new URL(fontFamily);
    ctx.font = fontSize + "px url";
  } catch {
    ctx.font = fontSize + 'px "' + fontFamily + '"';
  }
  // measureText はSafari の推定精度は低めで、右寄りにすると消しゴムに影響する
  // やや左寄りでも問題ないので、必ず枠内に収まるように多少の補正を加える
  const width = ctx.measureText(kanji).width * 0.9;
  const spacing = (canvasSize - width) / 2;
  if (loadCanvas) {
    ctx.fillStyle = "lightgray";
    fillTextBold(ctx, kanji, spacing, fontSize);
    toggleStroke(canvas);
  } else {
    ctx.fillText(kanji, spacing, fontSize);
  }
}

function loadFont(kanji, kanjiId, parentNode, pos, loadCanvas) {
  let box;
  if (loadCanvas) {
    box = document.createElement("tegaki-box");
  } else {
    box = document.createElement("tehon-box");
  }
  // // SVG はセキュリティ上 Web フォントは dataURI で埋め込む必要がある
  // // 重過ぎるので canvas でレンダリングすべき
  // let object = box.shadowRoot.querySelector('svg');
  // let text = object.querySelector('text');
  // text.textContent = kanji;
  // text.setAttribute('font-family', fontFamily);
  // if (loadCanvas) {
  //   text.setAttribute('fill', 'lightgray');
  //   text.setAttribute('font-weight', 900);
  // }
  const object = box.shadowRoot.querySelector("#tehon");
  object.setAttribute("alt", kanji);
  object.setAttribute("data-id", kanjiId);
  object.setAttribute("data-pos", pos);
  drawFont(object, kanji, loadCanvas);
  parentNode.appendChild(box);
  return object;
}

function showKanjiScore(kanjiScore, scoreObj, object) {
  kanjiScore = Math.floor(kanjiScore);
  if (kanjiScore >= 80) {
    playAudio(correctAudio);
  } else {
    playAudio(incorrectAudio);
  }
  scoreObj.classList.remove("d-none");
  scoreObj.textContent = kanjiScore;
  if (localStorage.getItem("hint") != 1) {
    object.style.visibility = "visible";
  }
}

function getProblemScores(tegakiPanel, objects, tegakiPads) {
  const promises = [];
  objects.forEach((object, i) => {
    const pos = parseInt(object.dataset.pos);
    const tegakiData = tegakiPads[i].toData();
    let kanjiScore = 0;
    if (tegakiData.length != 0) {
      const scoreObj = tegakiPanel.children[pos].shadowRoot.querySelector(
        "#score",
      );
      kanjiScore = getKanjiScore(tegakiData, object);
      showKanjiScore(kanjiScore, scoreObj, object);
    }
    promises[i] = kanjiScore;
  });
  return Promise.all(promises);
}

function setScoringButton(
  problemBox,
  tegakiPanel,
  objects,
  tegakiPads,
  word,
) {
  const scoring = problemBox.shadowRoot.querySelector("#scoring");
  scoring.addEventListener("click", function () {
    getProblemScores(tegakiPanel, objects, tegakiPads).then(
      (scores) => {
        if (scores.every((score) => score >= 80)) {
          problemBox.shadowRoot.querySelector("#guard").style.height = "100%";
          const next = problemBox.nextElementSibling;
          if (next) {
            next.shadowRoot.querySelector("#guard").style.height = "0";
            const headerHeight = document.getElementById("header").offsetHeight;
            const top = next.getBoundingClientRect().top +
              document.documentElement.scrollTop - headerHeight;
            window.scrollTo({ top: top, behavior: "smooth" });
          } else {
            window.removeEventListener("touchstart", scrollEvent, {
              passive: false,
            });
            window.removeEventListener("touchmove", scrollEvent, {
              passive: false,
            });
          }
        }
        let clearedKanjis = localStorage.getItem("touch-abc");
        if (!clearedKanjis) clearedKanjis = "";
        scores.forEach((score, i) => {
          if (score < 40) {
            // 点数があまりにも低いものは合格リストから除外
            clearedKanjis = clearedKanjis.replace(word[i], "");
          }
        });
        localStorage.setItem("touch-abc", clearedKanjis);
      },
    );
  });
}

function setSignaturePad(object) {
  const canvas = object.parentNode.querySelector("#tegaki");
  return new SignaturePad(canvas, {
    minWidth: 2,
    maxWidth: 2,
    penColor: "black",
    throttle: 0,
    minDistance: 0,
  });
}

function setEraser(tegakiPad, tegakiPanel, tehonPanel, object) {
  const currKanji = object.getRootNode().host;
  const kanjiPos = [...tegakiPanel.children].findIndex((x) => x == currKanji);
  tehonPanel.children[kanjiPos].shadowRoot.querySelector("#eraser").onclick =
    function () {
      const data = tegakiPad.toData();
      if (data) {
        tegakiPad.clear();
      }
      const pos = parseInt(object.dataset.pos);
      const scoreObj = tegakiPanel.children[pos].shadowRoot.querySelector(
        "#score",
      );
      scoreObj.classList.add("d-none");
      if (localStorage.getItem("hint") != 1) {
        object.style.visibility = "hidden";
      }
    };
}

let englishVoices = [];
function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise(function (resolve) {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      speechSynthesis.addEventListener("voiceschanged", function () {
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
    }
  });
  allVoicesObtained.then((voices) => {
    englishVoices = voices.filter((voice) => voice.lang == "en-US");
  });
}
loadVoices();

function setSound(tehonPanel, object, kanji) {
  const pos = parseInt(object.dataset.pos);
  const sound = tehonPanel.children[pos].shadowRoot.querySelector("#sound");
  const lower = kanji.toLowerCase();
  sound.onclick = function () {
    const msg = new SpeechSynthesisUtterance(lower);
    msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
    msg.lang = "en-US";
    speechSynthesis.speak(msg);
  };
}

function loadProblem(problem, answer) {
  const problemBox = document.createElement("problem-box");
  const shadow = problemBox.shadowRoot;
  const objects = [];
  const tegakiPads = [];
  const tehon = shadow.querySelector("#tehon");
  const tegaki = shadow.querySelector("#tegaki");
  for (let i = 0; i < problem.length; i++) {
    loadFont(problem[i], problem[i], tehon, i, false);
    const object = loadFont(answer[i], answer[i], tegaki, i, true);
    const tegakiPad = setSignaturePad(object);
    objects.push(object);
    tegakiPads.push(tegakiPad);
    setEraser(tegakiPad, tegaki, tehon, object);
    setSound(tehon, object, problem[i]);
  }
  setScoringButton(problemBox, tegaki, objects, tegakiPads, problem);
  document.getElementById("problems").appendChild(problemBox);
}

function loadDrill(problems1, problems2) {
  for (let i = 0; i < problems1.length; i++) {
    loadProblem(problems1[i], problems2[i]);
  }
}

function toggleAllStroke() {
  const problems = document.getElementById("problems").children;
  for (const problem of problems) {
    const tegakiBoxes = problem.shadowRoot.querySelector("#tegaki").children;
    for (const tegakiBox of tegakiBoxes) {
      const object = tegakiBox.shadowRoot.querySelector("#tehon");
      toggleStroke(object);
    }
  }
}

function toggleStroke(object) {
  if (localStorage.getItem("hint") != 1) {
    object.style.visibility = "hidden";
  } else {
    object.style.visibility = "visible";
  }
}

function countNoTransparent(data) {
  let count = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] != 0) {
      count += 1;
    }
  }
  return count;
}

function getInclusionCount(tegakiImgData, tehonImgData) {
  for (let i = 3; i < tegakiImgData.length; i += 4) {
    if (tehonImgData[i] != 0) {
      tegakiImgData[i] = 0;
    }
  }
  const inclusionCount = countNoTransparent(tegakiImgData);
  return inclusionCount;
}

function calcKanjiScore(tegakiCount, tehonCount, inclusionCount) {
  // 線長を優遇し過ぎると ["未","末"], ["土","士"] の見分けができなくなる (10% 許容)
  let lineScore = (1 - Math.abs((tehonCount - tegakiCount) / tehonCount));
  if (lineScore > 1) lineScore = 1;
  // 画ごとに判定していないので厳しく設定
  // 包含率を優遇し過ぎると ["一","つ"], ["二","＝"] の見分けができなくなる (30% 許容)
  let inclusionScore = (tegakiCount - inclusionCount) / tegakiCount;
  if (inclusionScore > 1) inclusionScore = 1;
  // 漢字と比べてかなり難しいので採点はかなりゆるくする
  // 100点が取れないので少しだけ採点を甘くする
  let kakuScore = lineScore * inclusionScore * 100 * 1.5;
  if (kakuScore < 0) kakuScore = 0;
  if (kakuScore > 100) kakuScore = 100;
  if (isNaN(kakuScore)) kakuScore = 0;
  return kakuScore;
}

function getKanjiScore(tegakiData, object) {
  const markerWidth = maxWidth * 3;
  const markerCanvas = document.createElement("canvas");
  markerCanvas.setAttribute("width", canvasSize);
  markerCanvas.setAttribute("height", canvasSize);
  const markerContext = markerCanvas.getContext("2d");
  const markerPad = new SignaturePad(markerCanvas, {
    minWidth: markerWidth,
    maxWidth: markerWidth,
    penColor: "black",
  });
  markerPad.fromData(tegakiData);
  const tegakiImgData =
    markerContext.getImageData(0, 0, canvasSize, canvasSize).data;
  const tegakiCount = countNoTransparent(tegakiImgData);
  const tehonImgData =
    object.getContext("2d").getImageData(0, 0, canvasSize, canvasSize).data;
  const tehonCount = countNoTransparent(tehonImgData);

  const inclusionCount = getInclusionCount(tegakiImgData, tehonImgData);
  const kanjiScore = calcKanjiScore(tegakiCount, tehonCount, inclusionCount);
  return kanjiScore;
}

function report() {
  const scores = [];
  const problems = document.getElementById("problems").children;
  for (let i = 0; i < problems.length; i++) {
    const tegakis = problems[i].shadowRoot.querySelector("#tegaki").children;
    for (let j = 0; j < tegakis.length; j++) {
      const score = tegakis[j].shadowRoot.querySelector("#score").textContent;
      scores.push(parseInt(score));
    }
  }
  let score = 0;
  for (let i = 0; i < scores.length; i++) {
    score += scores[i];
  }
  score /= scores.length;
  if (score >= 80) {
    playAudio(correctAllAudio);
    let clearedKanjis = localStorage.getItem("touch-abc");
    if (clearedKanjis) {
      kanjis.split("").forEach((kanji) => {
        if (!clearedKanjis.includes(kanji)) {
          clearedKanjis += kanji;
        }
      });
      localStorage.setItem("touch-abc", clearedKanjis);
    } else {
      localStorage.setItem("touch-abc", kanjis);
    }
    document.getElementById("report").classList.add("d-none");
    document.getElementById("correctReport").classList.remove("d-none");
    setTimeout(() => {
      location.href = "/touch-abc/";
    }, 3000);
  } else {
    playAudio(stupidAudio);
    document.getElementById("report").classList.add("d-none");
    document.getElementById("incorrectReport").classList.remove("d-none");
    setTimeout(function () {
      document.getElementById("report").classList.remove("d-none");
      document.getElementById("incorrectReport").classList.add("d-none");
    }, 6000);
  }
}

function parseQuery(queryString) {
  const query = {};
  const pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString)
    .split("&");
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
  }
  return query;
}

function convUpperLower(str) {
  a;
  res = "";
  for (let i = 0; i < str.length; ++i) {
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

let kanjis = "";
let mode = "uu";
function initQueryBase() {
  let problems1, problems2;
  const queries = parseQuery(location.search);
  mode = queries["mode"];
  kanjis = queries["q"];
  if (kanjis) {
    if (mode == "conv") {
      const conved = convUpperLower(kanjis);
      problems1 = kanjis.split("");
      problems2 = conved.split("");
    } else {
      problems1 = kanjis.split("");
      problems2 = kanjis.split("");
    }
  } else {
    const uppers = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    const lowers = Array.from("abcdefghijklmnopqrstuvwxyz");
    if (mode == "uu") {
      problems1 = uppers;
      problems2 = uppers;
    } else if (mode == "ul") {
      problems1 = uppers;
      problems2 = lowers;
    } else if (mode == "ll") {
      problems1 = lowers;
      problems2 = lowers;
    } else {
      problems1 = lowers;
      problems2 = uppers;
    }
  }
  loadDrill(problems1, problems2);
  document.getElementById("problems").children[0].shadowRoot.querySelector(
    "#guard",
  ).style.height = "0";
}

function initQuery() {
  try {
    new URL(fontFamily);
    const fontFace = new FontFace("url", `url(${fontFamily}`);
    fontFace.load().then(function () {
      document.fonts.add(fontFace);
      initQueryBase();
    });
  } catch {
    document.fonts.ready.then(function () {
      initQueryBase();
    });
  }
}
// https://qiita.com/noraworld/items/2834f2e6f064e6f6d41a
// https://webinlet.com/2020/ios11以降でピンチインアウト拡大縮小禁止
// 手を置いた時の誤爆を防ぎつつスクロールは許可
function scrollEvent(e) {
  if (
    !["MAIN", "PROBLEM-BOX", "A", "BUTTON", "path"].includes(e.target.tagName)
  ) {
    e.preventDefault();
  }
}

initQuery();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("toggleScroll").onclick = toggleScroll;
document.getElementById("hint").onclick = toggleHint;
document.getElementById("reportButton").onclick = report;
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});
