var uppers = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
var lowers = Array.from('abcdefghijklmnopqrstuvwzyz');

function selectFontFromURL(obj) {
  obj.classList.add('disabled');
  const url = document.getElementById('fontURL').value;
  try {
    new URL(url);
    document.getElementById('fontLoadError').classList.add('d-none');
    document.getElementById('fontLoading').classList.remove('d-none');
    const fontFace = new FontFace('url', `url(${url})`);
    fontFace.load().then(function() {
      document.fonts.add(fontFace);
      localStorage.setItem('touch-abc-font', url);
      document.getElementById('selectedFont').style.fontFamily = 'url';
      document.getElementById('fontLoading').classList.add('d-none');
    });
  } catch {
    document.getElementById('fontLoadError').classList.remove('d-none');
  }
  obj.classList.remove('disabled');
}

function selectFont(obj) {
  const id = obj.getAttribute('id');
  const fontFamily = id.replace(/-/g, ' ');
  localStorage.setItem('touch-abc-font', fontFamily);
  document.getElementById('selectedFont').style.fontFamily = fontFamily;
}

function setFontStyle(obj) {
  var idx = obj.selectedIndex;
  if (idx == 0) {
    document.getElementById('fontsCarousel0').classList.remove('d-none');
    document.getElementById('fontsCarousel1').classList.add('d-none');
  } else {
    document.getElementById('fontsCarousel0').classList.add('d-none');
    document.getElementById('fontsCarousel1').classList.remove('d-none');
  }
}

function setFontSelector() {
  var items = document.getElementById('fontSelector').getElementsByClassName('carousel-item');
  [...items].forEach(item => {
    const preview = item.children[0];
    const id = preview.getAttribute('id');
    const fontFamily = id.replace(/-/g, ' ');
    preview.style.fontFamily = fontFamily;
  });
  var selectedFontName = localStorage.getItem('touch-abc-font');
  if (!selectedFontName) {
    selectedFontName = 'Aref Ruqaa';
  }
  document.getElementById('selectedFont').style.fontFamily = selectedFontName;
  document.getElementById('fontURL').addEventListener('keydown', (e) => {
    if (e.key == 'Enter') {
      selectFontFromURL(document.getElementById('fontURL'));
    }
  });
}

function toKanji(kanjiId) {
  return String.fromCodePoint(parseInt('0x' + kanjiId));
}

function loadConfig() {
  if (localStorage.getItem('darkMode') == 1) {
    document.documentElement.dataset.theme = 'dark';
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

function setCleared(obj) {
  var clearedKanjis = localStorage.getItem('touch-abc');
  if (clearedKanjis) {
    var problems = obj.children;
    for (var i=0; i<problems.length; i++) {
      if (clearedKanjis.includes(problems[i].innerText)) {
        problems[i].classList.remove('btn-outline-secondary');
        problems[i].classList.add('btn-secondary')
      }
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    let rand = Math.floor(Math.random() * (i + 1));
    [array[i], array[rand]] = [array[rand], array[i]]
  }
  return array;
}

function testRemained() {
  var problems = document.getElementById('problems').children;
  var kanjis = [...problems]
    .filter(e => e.classList.contains('btn-outline-secondary'))
    .map(e => e.innerText);
  var target = shuffle(kanjis).slice(0, 9).join('');
  location.href = `/touch-abc/drill/?q=${target}`;
}

function testCleared() {
  var problems = document.getElementById('problems').children;
  var kanjis = [...problems]
    .filter(e => e.classList.contains('btn-secondary'))
    .map(e => e.innerText);
  var target = shuffle(kanjis).slice(0, 9).join('');
  location.href = `/touch-abc/drill/?q=${target}`;
}

function deleteData() {
  localStorage.removeItem('touch-abc');
  location.reload();
}

function generateDrill() {
  var words = document.getElementById('search').value;
  if (words && words.match(/^[a-zA-Z]+$/)) {
    location.href = `/touch-abc/drill/?q=${words}`;
  }
}

function setLinkTemplate() {
  var a = document.createElement('a');
  a.className = 'mr-1 mb-1 btn btn-outline-secondary btn-sm';
  return a;
}
const linkTemplate = setLinkTemplate();

function setProblems(obj, kanjis) {
  while (obj.lastElementChild) {
    obj.removeChild(obj.lastChild);
  }
  for (var i=0; i<kanjis.length; i++) {
    var problem = kanjis[i].repeat(6);
    var a = linkTemplate.cloneNode();
    a.href = `/touch-abc/drill/?q=${problem}`;
    a.innerText = kanjis[i];
    obj.appendChild(a);
  }
}


var problems = document.getElementById('cleared50on');
var alphabets = uppers.concat(lowers);
setProblems(problems, alphabets);
setCleared(problems);
setFontSelector();

document.getElementById('search').addEventListener('keydown', function(event) {
  if (event.key == 'Enter') {
    var words = this.value;
    location.href = `/touch-abc/drill/?q=${words}`;
  }
}, false);

