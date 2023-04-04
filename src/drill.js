let englishVoices = [];
const audioContext = new AudioContext();
const audioBufferCache = {};
loadAudio("stupid", "/touch-abc/mp3/stupid5.mp3");
loadAudio("correct", "/touch-abc/mp3/correct3.mp3");
loadAudio("correctAll", "/touch-abc/mp3/correct1.mp3");
loadAudio("incorrect", "/touch-abc/mp3/incorrect1.mp3");
const canvasSize = 140;
const maxWidth = 4;
let level = 2;
let fontFamily = localStorage.getItem("touch-abc-font");
if (!fontFamily) {
  fontFamily = "Aref Ruqaa";
}
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("hint") == 1) {
    document.getElementById("hint").textContent = "EASY";
  }
  if (localStorage.getItem("touch-abc-level")) {
    level = parseInt(localStorage.getItem("touch-abc-level"));
  }
  if (localStorage.getItem("furigana") == 1) {
    addFurigana();
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

async function addFurigana() {
  const module = await import("https://marmooo.github.io/yomico/yomico.min.js");
  module.yomico("/touch-abc/drill/index.yomi");
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

async function playAudio(name, volume) {
  const audioBuffer = await loadAudio(name, audioBufferCache[name]);
  const sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    sourceNode.connect(gainNode);
    sourceNode.start();
  } else {
    sourceNode.connect(audioContext.destination);
    sourceNode.start();
  }
}

async function loadAudio(name, url) {
  if (audioBufferCache[name]) return audioBufferCache[name];
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  audioBufferCache[name] = audioBuffer;
  return audioBuffer;
}

function unlockAudio() {
  audioContext.resume();
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
  const object = box.shadowRoot.querySelector(".tehon");
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
    playAudio("correct");
  } else {
    playAudio("incorrect");
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
        ".score",
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
  const scoring = problemBox.shadowRoot.querySelector(".scoring");
  scoring.addEventListener("click", () => {
    getProblemScores(tegakiPanel, objects, tegakiPads).then(
      (scores) => {
        if (scores.every((score) => score >= 80)) {
          problemBox.shadowRoot.querySelector(".guard").style.height = "100%";
          const next = problemBox.nextElementSibling;
          if (next) {
            next.shadowRoot.querySelector(".guard").style.height = "0";
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
  const canvas = object.parentNode.querySelector(".tegaki");
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
  tehonPanel.children[kanjiPos].shadowRoot.querySelector(".eraser").onclick =
    function () {
      const data = tegakiPad.toData();
      if (data) {
        tegakiPad.clear();
      }
      const pos = parseInt(object.dataset.pos);
      const scoreObj = tegakiPanel.children[pos].shadowRoot.querySelector(
        ".score",
      );
      scoreObj.classList.add("d-none");
      if (localStorage.getItem("hint") != 1) {
        object.style.visibility = "hidden";
      }
    };
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  const jokeVoices = [
    // "com.apple.eloquence.en-US.Flo",
    "com.apple.speech.synthesis.voice.Bahh",
    "com.apple.speech.synthesis.voice.Albert",
    // "com.apple.speech.synthesis.voice.Fred",
    "com.apple.speech.synthesis.voice.Hysterical",
    "com.apple.speech.synthesis.voice.Organ",
    "com.apple.speech.synthesis.voice.Cellos",
    "com.apple.speech.synthesis.voice.Zarvox",
    // "com.apple.eloquence.en-US.Rocko",
    // "com.apple.eloquence.en-US.Shelley",
    // "com.apple.speech.synthesis.voice.Princess",
    // "com.apple.eloquence.en-US.Grandma",
    // "com.apple.eloquence.en-US.Eddy",
    "com.apple.speech.synthesis.voice.Bells",
    // "com.apple.eloquence.en-US.Grandpa",
    "com.apple.speech.synthesis.voice.Trinoids",
    // "com.apple.speech.synthesis.voice.Kathy",
    // "com.apple.eloquence.en-US.Reed",
    "com.apple.speech.synthesis.voice.Boing",
    "com.apple.speech.synthesis.voice.Whisper",
    "com.apple.speech.synthesis.voice.Deranged",
    "com.apple.speech.synthesis.voice.GoodNews",
    "com.apple.speech.synthesis.voice.BadNews",
    "com.apple.speech.synthesis.voice.Bubbles",
    // "com.apple.voice.compact.en-US.Samantha",
    // "com.apple.eloquence.en-US.Sandy",
    // "com.apple.speech.synthesis.voice.Junior",
    // "com.apple.speech.synthesis.voice.Ralph",
  ];
  allVoicesObtained.then((voices) => {
    englishVoices = voices
      .filter((voice) => voice.lang == "en-US")
      .filter((voice) => !jokeVoices.includes(voice.voiceURI));
  });
}
loadVoices();

function setSound(tehonPanel, object, kanji) {
  const pos = parseInt(object.dataset.pos);
  const sound = tehonPanel.children[pos].shadowRoot.querySelector(".sound");
  const lower = kanji.toLowerCase();
  sound.onclick = () => {
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
  const tehon = shadow.querySelector(".tehon");
  const tegaki = shadow.querySelector(".tegaki");
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
    const tegakiBoxes = problem.shadowRoot.querySelector(".tegaki").children;
    for (const tegakiBox of tegakiBoxes) {
      const object = tegakiBox.shadowRoot.querySelector(".tehon");
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

function getScoringFactor(level) {
  switch (level) {
    case 0:
      return 0.5 ** 2;
    case 1:
      return 0.6 ** 2;
    case 2:
      return 0.7 ** 2;
    case 3:
      return 0.8 ** 2;
    case 4:
      return 0.9 ** 2;
    default:
      return 0.7 ** 2;
  }
}

function calcKanjiScore(tegakiCount, tehonCount, inclusionCount) {
  // 線長を優遇し過ぎると ["未","末"], ["土","士"] の見分けができなくなる (10% 許容)
  let lineScore = (1 - Math.abs((tehonCount - tegakiCount) / tehonCount));
  if (lineScore > 1) lineScore = 1;
  // 画ごとに判定していないので厳しく設定
  // 包含率を優遇し過ぎると ["一","つ"], ["二","＝"] の見分けができなくなる (30% 許容)
  let inclusionScore = (tegakiCount - inclusionCount) / tegakiCount;
  if (inclusionScore > 1) inclusionScore = 1;
  // 100点が取れないので少しだけ採点を甘くする
  let kakuScore = lineScore * inclusionScore * 100 / getScoringFactor(level);
  if (kakuScore < 0) kakuScore = 0;
  if (kakuScore > 100) kakuScore = 100;
  if (isNaN(kakuScore)) kakuScore = 0;
  return kakuScore;
}

function getKanjiScore(tegakiData, object) {
  const markerWidth = maxWidth * 3;
  tegakiData.forEach((kakuData) => {
    kakuData.minWidth = markerWidth;
    kakuData.maxWidth = markerWidth;
  });
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
    const tegakis = problems[i].shadowRoot.querySelector(".tegaki").children;
    for (let j = 0; j < tegakis.length; j++) {
      const score = tegakis[j].shadowRoot.querySelector(".score").textContent;
      scores.push(parseInt(score));
    }
  }
  let score = 0;
  for (let i = 0; i < scores.length; i++) {
    score += scores[i];
  }
  score /= scores.length;
  if (score >= 80) {
    playAudio("correctAll");
    let clearedKanjis = localStorage.getItem("touch-abc");
    if (kanjis) {
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
    }
    document.getElementById("report").classList.add("d-none");
    document.getElementById("correctReport").classList.remove("d-none");
    setTimeout(() => {
      location.href = "/touch-abc/";
    }, 3000);
  } else {
    playAudio("stupid");
    document.getElementById("report").classList.add("d-none");
    document.getElementById("incorrectReport").classList.remove("d-none");
    setTimeout(() => {
      document.getElementById("report").classList.remove("d-none");
      document.getElementById("incorrectReport").classList.add("d-none");
    }, 6000);
  }
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
  const query = new URLSearchParams(location.search);
  mode = query.get("mode");
  kanjis = query.get("q");
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
    ".guard",
  ).style.height = "0";
}

function initQuery() {
  try {
    new URL(fontFamily);
    const fontFace = new FontFace("url", `url(${fontFamily}`);
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
      initQueryBase();
    });
  } catch {
    document.fonts.ready.then(() => {
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

// disable troublesome iOS features
if (/Macintosh/.test(navigator.userAgent)) {
  // double tap zoom
  document.ondblclick = (e) => {
    e.preventDefault();
  };
}
