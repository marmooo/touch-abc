const uppers = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
const lowers = Array.from("abcdefghijklmnopqrstuvwzyz");
loadConfig();

function selectFontFromURL() {
  this.classList.add("disabled");
  const url = document.getElementById("fontURL").value;
  try {
    new URL(url);
    document.getElementById("fontLoadError").classList.add("d-none");
    document.getElementById("fontLoading").classList.remove("d-none");
    const fontFace = new FontFace("url", `url(${url})`);
    fontFace.load().then(function () {
      document.fonts.add(fontFace);
      localStorage.setItem("touch-abc-font", url);
      document.getElementById("selectedFont").style.fontFamily = "url";
      document.getElementById("fontLoading").classList.add("d-none");
    });
  } catch {
    document.getElementById("fontLoadError").classList.remove("d-none");
  }
  this.classList.remove("disabled");
}

function selectFont() {
  const id = this.getAttribute("id");
  const fontFamily = id.replace(/-/g, " ");
  localStorage.setItem("touch-abc-font", fontFamily);
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

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
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

function setCleared(obj) {
  const clearedKanjis = localStorage.getItem("touch-abc");
  if (clearedKanjis) {
    const problems = obj.children;
    for (let i = 0; i < problems.length; i++) {
      if (clearedKanjis.includes(problems[i].textContent)) {
        problems[i].classList.remove("btn-outline-secondary");
        problems[i].classList.add("btn-secondary");
      }
    }
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

function setLinkTemplate() {
  const a = document.createElement("a");
  a.className = "me-1 mb-1 btn btn-outline-secondary btn-sm";
  return a;
}
const linkTemplate = setLinkTemplate();

function setProblems(obj, kanjis) {
  while (obj.lastElementChild) {
    obj.removeChild(obj.lastChild);
  }
  for (let i = 0; i < kanjis.length; i++) {
    const problem = kanjis[i].repeat(6);
    const a = linkTemplate.cloneNode();
    a.href = `/touch-abc/drill/?q=${problem}`;
    a.textContent = kanjis[i];
    obj.appendChild(a);
  }
}

const problems = document.getElementById("cleared50on");
const alphabets = uppers.concat(lowers);
setProblems(problems, alphabets);
setCleared(problems);
setFontSelector();

document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
document.getElementById("generateDrill").onclick = generateDrill;
document.getElementById("deleteData").onclick = deleteData;
document.getElementById("selectFontFromURL").onclick = deleteData;
[
  ...document.getElementById("fontsCarousel").getElementsByClassName(
    "selectFont",
  ),
].forEach((obj) => {
  obj.onclick = selectFont;
});
document.getElementById("search").addEventListener("keydown", function (event) {
  if (event.key == "Enter") {
    const words = this.value;
    location.href = `/touch-abc/drill/?q=${words}`;
  }
}, false);
new bootstrap.Carousel(document.getElementById("fontsCarousel"));

// disable troublesome iOS features
// - double tap zoom
document.ondblclick = (e) => {
  e.preventDefault();
};
// - selection context menu
// TODO: need better solution
document.body.style.webkitUserSelect = "none";
