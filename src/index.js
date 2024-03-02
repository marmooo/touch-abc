const previewText = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwzyz";
const googleFontsURL = new URL("https://fonts.googleapis.com/css2");
const uppers = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const lowers = Array.from("abcdefghijklmnopqrstuvwzyz");
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
  if (localStorage.getItem("touch-abc-level")) {
    const level = parseInt(localStorage.getItem("touch-abc-level"));
    document.getElementById("levelOption").options[level].selected = true;
  }
  if (localStorage.getItem("furigana") == 1) {
    const obj = document.getElementById("addFurigana");
    addFurigana(obj);
    obj.setAttribute("data-done", true);
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function getGoogleFontsURL(fontFamily) {
  const params = new URLSearchParams();
  params.set("family", fontFamily);
  params.set("text", previewText);
  params.set("display", "swap");
  googleFontsURL.search = params;
  return googleFontsURL.toString();
}

async function loadGoogleFonts(fontFamily) {
  const url = getGoogleFontsURL(fontFamily);
  const response = await fetch(url);
  const css = await response.text();
  const matchUrls = css.match(/url\(.+?\)/g);
  for (const url of matchUrls) {
    const font = new FontFace(fontFamily, url);
    await font.load();
    document.fonts.add(font);
  }
}

async function selectFontFromURL() {
  this.classList.add("disabled");
  const fontURL = document.getElementById("fontURL").value;
  try {
    const url = new URL(fontURL);
    document.getElementById("fontLoadError").classList.add("d-none");
    document.getElementById("fontLoading").classList.remove("d-none");
    if (url.host == googleFontsURL.host) {
      const fontFamily = new URLSearchParams(url.search).get("family");
      const formattedURL = getGoogleFontsURL(fontFamily);
      await loadGoogleFonts(fontFamily);
      localStorage.setItem("touch-abc-font", formattedURL);
      document.getElementById("selectedFont").style.fontFamily = fontFamily;
    } else { // .ttf, .woff, .woff2
      const fontFamily = "abc";
      const fontFace = new FontFace(fontFamily, `url(${url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      localStorage.setItem("touch-abc-font", url);
      document.getElementById("selectedFont").style.fontFamily = fontFamily;
    }
    document.getElementById("fontLoading").classList.add("d-none");
  } catch (err) {
    console.log(err);
    document.getElementById("fontLoadError").classList.remove("d-none");
  }
  this.classList.remove("disabled");
}

function selectFont() {
  const id = this.getAttribute("id");
  const fontFamily = id.replace(/-/g, " ");
  const url = getGoogleFontsURL(fontFamily);
  localStorage.setItem("touch-abc-font", url);
  document.getElementById("selectedFont").style.fontFamily = fontFamily;
}

function setFontSelector() {
  const items = document.getElementById("fontSelector").getElementsByClassName(
    "carousel-item",
  );
  [...items].forEach((item) => {
    const preview = item.children[0];
    const id = preview.getAttribute("id");
    const fontFamily = id.replace(/-/g, " ");
    preview.style.fontFamily = fontFamily;
  });
  let selectedFontName = localStorage.getItem("touch-abc-font");
  if (!selectedFontName) {
    selectedFontName = "Aref Ruqaa";
  }
  document.getElementById("selectedFont").style.fontFamily = selectedFontName;
  document.getElementById("fontURL").addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
      selectFontFromURL(document.getElementById("fontURL"));
    }
  });
}

function changeLevel() {
  const level = this.selectedIndex;
  localStorage.setItem("touch-abc-level", level);
}

function addFurigana() {
  const obj = document.getElementById("addFurigana");
  if (obj.getAttribute("data-done")) {
    localStorage.setItem("furigana", 0);
    location.reload();
  } else {
    import("https://marmooo.github.io/yomico/yomico.min.js").then((module) => {
      module.yomico("/touch-abc/index.yomi");
    });
    localStorage.setItem("furigana", 1);
    obj.setAttribute("data-done", true);
  }
}

function setCleared() {
  const clearedKanjis = localStorage.getItem("touch-abc");
  if (clearedKanjis) {
    const problems = [...document.getElementById("problems").children];
    problems.forEach((problem) => {
      if (clearedKanjis.includes(problem.textContent)) {
        problem.classList.remove("btn-outline-secondary");
        problem.classList.add("btn-secondary");
      }
    });
  }
}

function deleteData() {
  localStorage.removeItem("touch-abc");
  location.reload();
}

function generateDrill() {
  const words = document.getElementById("search").value;
  if (words && /^[a-zA-Z]+$/.test(words)) {
    location.href = `/touch-abc/drill/?q=${words}`;
  }
}

function setProblems() {
  let html = "";
  const problems = document.getElementById("problems");
  const alphabets = uppers.concat(lowers);
  alphabets.forEach((alphabet) => {
    const q = alphabet.repeat(6);
    const url = `/touch-abc/drill/?q=${q}`;
    const klass = "me-1 mb-1 btn btn-sm btn-outline-secondary";
    html += `<a href="${url}" class="${klass}">${alphabet}</a>`;
  });
  problems.innerHTML = html;
}

setProblems();
setCleared();
setFontSelector();

const fontsCarousel = document.getElementById("fontsCarousel");
new bootstrap.Carousel(fontsCarousel);

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("addFurigana").onclick = addFurigana;
document.getElementById("generateDrill").onclick = generateDrill;
document.getElementById("deleteData").onclick = deleteData;
document.getElementById("selectFontFromURL").onclick = selectFontFromURL;
[...fontsCarousel.getElementsByClassName("selectFont")].forEach((obj) => {
  obj.onclick = selectFont;
});
document.getElementById("levelOption").onchange = changeLevel;
document.getElementById("search").addEventListener("keydown", (event) => {
  if (event.key == "Enter") {
    const words = event.target.value;
    location.href = `/touch-abc/drill/?q=${words}`;
  }
}, false);
