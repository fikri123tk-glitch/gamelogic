/* ═══════════════════════════════════════════════════════════════
   app.js — Game Logika Coding untuk Anak SD
   Vanilla JavaScript, tanpa framework
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
//  AVATAR & STATE GLOBAL
// ─────────────────────────────────────────────
const AVATARS = ["🐱","🐶","🐸","🦊","🐼","🐨","🦁","🐯"];
const AVATAR  = AVATARS[Math.floor(Math.random() * AVATARS.length)];

document.getElementById("home-avatar").textContent = AVATAR;
document.getElementById("game-avatar").textContent = AVATAR;

const gameState = {
  scores:    { sequence: 0, ifelse: 0, pattern: 0 },
  completed: { sequence: false, ifelse: false, pattern: false },
  active:    null,
};

const GAME_META = {
  sequence: { title: "Urutan Langkah",       icon: "📋", color: "#FF6B35", shadow: "#c94f1e" },
  ifelse:   { title: "Kalau / Kalau Tidak",  icon: "🔀", color: "#4ECDC4", shadow: "#35a9a2" },
  pattern:  { title: "Pola & Perulangan",    icon: "🔄", color: "#9B5DE5", shadow: "#7340b5" },
};

// ─────────────────────────────────────────────
//  SCREEN NAVIGATION
// ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function(s) {
    s.classList.remove("active");
  });
  document.getElementById("screen-" + id).classList.add("active");
}

function goHome() {
  refreshHomeUI();
  showScreen("home");
}

function refreshHomeUI() {
  var total = Object.values(gameState.scores).reduce(function(a, b) { return a + b; }, 0);
  var done  = Object.values(gameState.completed).filter(Boolean).length;

  document.getElementById("total-score").textContent     = total;
  document.getElementById("completed-count").textContent = done + "/3";
  toggleHidden("all-done-msg", done < 3);

  ["sequence", "ifelse", "pattern"].forEach(function(id) {
    var meta  = GAME_META[id];
    var isDone = gameState.completed[id];
    var card   = document.getElementById("card-" + id);

    card.style.borderColor = isDone ? meta.color : "";
    card.style.boxShadow   = isDone ? "0 6px 22px " + meta.color + "33" : "";

    toggleHidden("done-" + id, !isDone);
    document.getElementById("done-" + id).style.background = meta.color;
    document.getElementById("prog-" + id).style.width = isDone ? "100%" : "0%";
    document.getElementById("meta-" + id).innerHTML =
      "5 soal &nbsp;•&nbsp; " + (isDone ? "🏆 Skor: " + gameState.scores[id] : "Belum dimainkan");
    document.getElementById("btn-" + id).textContent = isDone ? "🔁 Ulang" : "▶ Mulai";
  });
}

function toggleHidden(id, hide) {
  var el = document.getElementById(id);
  if (hide) el.classList.add("hidden");
  else      el.classList.remove("hidden");
}

// ─────────────────────────────────────────────
//  START GAME
// ─────────────────────────────────────────────
function startGame(id) {
  gameState.active = id;
  var meta = GAME_META[id];

  var header = document.getElementById("game-header");
  header.style.borderBottomColor = meta.color;
  document.getElementById("header-icon").textContent  = meta.icon;
  document.getElementById("header-title").textContent = meta.title;
  document.getElementById("header-score").textContent = "🏆 Skor: 0";

  showScreen("game");

  if (id === "sequence") initSequence();
  if (id === "ifelse")   initIfElse();
  if (id === "pattern")  initPattern();
}

// ─────────────────────────────────────────────
//  SHOW RESULT
// ─────────────────────────────────────────────
function showResult(gameId, score) {
  gameState.scores[gameId]    = score;
  gameState.completed[gameId] = true;

  var meta  = GAME_META[gameId];
  var total = Object.values(gameState.scores).reduce(function(a, b) { return a + b; }, 0);
  var done  = Object.values(gameState.completed).filter(Boolean).length;

  document.getElementById("result-title").textContent      = "Selesai, " + AVATAR + "!";
  document.getElementById("result-game-name").textContent  = meta.icon + " " + meta.title;
  document.getElementById("result-game-name").style.color  = meta.color;

  var box = document.getElementById("result-score-box");
  box.style.background = meta.color + "22";
  box.style.border     = "3px solid " + meta.color;

  document.getElementById("result-score-num").textContent = score;
  document.getElementById("result-score-num").style.color = meta.color;

  var btnAgain = document.getElementById("btn-play-again");
  btnAgain.style.background = meta.color;
  btnAgain.style.boxShadow  = "0 4px 0 " + meta.shadow;

  var allDoneEl = document.getElementById("result-all-done");
  if (done >= 3) {
    allDoneEl.classList.remove("hidden");
    allDoneEl.innerHTML = "🌟 Wow! Kamu sudah main semua game!<br>Total poin: <strong>" + total + "</strong>";
  } else {
    allDoneEl.classList.add("hidden");
  }

  showScreen("result");
}

function playAgain() {
  startGame(gameState.active);
}

// ─────────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────────
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function setHTML(id, html) {
  document.getElementById(id).innerHTML = html;
}

function updateHeaderScore(score) {
  document.getElementById("header-score").textContent = "🏆 Skor: " + score;
}


/* ═══════════════════════════════════════════════════════════════
   GAME 1 — URUTAN LANGKAH (Sequencing)
═══════════════════════════════════════════════════════════════ */
var SEQ_LEVELS = [
  {
    badge: "⭐ Mudah", badgeColor: "#06D6A0",
    story: "Dino mau sikat gigi sebelum tidur! 🦷 Bantuin Dino urutkan langkahnya ya!",
    steps: ["🪥 Ambil sikat gigi","🧴 Kasih pasta gigi","🚿 Kumur-kumur","🦷 Sikat gigi maju-mundur","💧 Bilas mulut sampai bersih"],
    correct: [0,1,3,2,4],
  },
  {
    badge: "⭐ Mudah", badgeColor: "#06D6A0",
    story: "Nana mau berangkat sekolah! 🏫 Urutkan langkahnya supaya tidak terlambat!",
    steps: ["🎒 Pakai tas sekolah","😴 Bangun tidur","👕 Pakai seragam","🍳 Sarapan pagi","🚪 Pamit ke orang tua"],
    correct: [1,3,2,0,4],
  },
  {
    badge: "🌟 Sedang", badgeColor: "#FFD166",
    story: "Budi mau masak mie instan sendiri! 🍜 Urutkan supaya mie-nya enak!",
    steps: ["🍜 Masukkan mie ke mangkuk","💧 Rebus air sampai mendidih","🧂 Tuang bumbu ke mangkuk","🥣 Aduk rata dan siap makan","⬇️ Tiriskan air rebusan"],
    correct: [1,0,4,2,3],
  },
  {
    badge: "🌟 Sedang", badgeColor: "#FFD166",
    story: "Sari mau kirim pesan ke teman lewat HP! 📱 Urutkan caranya yang benar!",
    steps: ["📤 Klik tombol kirim","📱 Buka aplikasi chat","👤 Pilih nama teman","⌨️ Ketik pesannya","🔓 Buka kunci HP dulu"],
    correct: [4,1,2,3,0],
  },
  {
    badge: "🔥 Susah", badgeColor: "#FF6B35",
    story: "Riko mau buat kue ulang tahun buat ibu! 🎂 Urutkan langkahnya!",
    steps: ["🎂 Hias kue dengan lilin","🧁 Tuang adonan ke loyang","🥚 Campur tepung, telur, gula","⏲️ Panggang 30 menit di oven","🛒 Siapkan semua bahan"],
    correct: [4,2,1,3,0],
  },
];

var seqLevel = 0;
var seqOrder = [];
var seqScore = 0;
var seqTries = 0;

function initSequence() {
  seqLevel = 0;
  seqScore = 0;
  renderSeqLevel();
}

function renderSeqLevel() {
  var lv = SEQ_LEVELS[seqLevel];
  seqOrder = shuffle([0,1,2,3,4].slice(0, lv.steps.length));
  seqTries = 0;

  var html =
    '<span class="level-badge" style="background:' + lv.badgeColor + '33;border:1.5px solid ' + lv.badgeColor + ';color:' + lv.badgeColor + '">' + lv.badge + '</span>' +
    '<div class="story-box story-yellow">' + lv.story + '</div>' +
    '<div class="guide-text">👆 Klik tombol ▲ ▼ untuk geser urutannya!</div>' +
    '<div class="step-list" id="seq-list"></div>' +
    '<div class="check-row">' +
      '<div id="seq-feedback" class="feedback"></div>' +
      '<button class="btn-check" onclick="checkSeq()">✅ Cek Jawaban</button>' +
    '</div>' +
    '<div class="score-info" id="seq-info">Soal ' + (seqLevel+1) + ' dari ' + SEQ_LEVELS.length + ' &nbsp;•&nbsp; 🏆 Skor kamu: <strong>' + seqScore + '</strong></div>';

  setHTML("game-content", html);
  renderSeqList();
  updateHeaderScore(seqScore);
}

function renderSeqList() {
  var lv   = SEQ_LEVELS[seqLevel];
  var rows = "";
  for (var pos = 0; pos < seqOrder.length; pos++) {
    var stepIdx = seqOrder[pos];
    rows +=
      '<div class="step-item" id="step-' + pos + '">' +
        '<span class="step-num">' + (pos+1) + '</span>' +
        '<span class="step-text">' + lv.steps[stepIdx] + '</span>' +
        '<div class="step-btns">' +
          '<button class="btn-move" onclick="seqMove(' + pos + ',-1)" ' + (pos === 0 ? "disabled" : "") + '>▲</button>' +
          '<button class="btn-move" onclick="seqMove(' + pos + ',1)"  ' + (pos === seqOrder.length-1 ? "disabled" : "") + '>▼</button>' +
        '</div>' +
      '</div>';
  }
  setHTML("seq-list", rows);
}

function seqMove(pos, dir) {
  var t = pos + dir;
  if (t < 0 || t >= seqOrder.length) return;
  var tmp = seqOrder[pos];
  seqOrder[pos] = seqOrder[t];
  seqOrder[t]   = tmp;

  var fb = document.getElementById("seq-feedback");
  fb.textContent = "";
  fb.className   = "feedback";
  document.querySelectorAll(".step-item").forEach(function(el) {
    el.classList.remove("correct","wrong");
  });
  renderSeqList();
}

function checkSeq() {
  var lv = SEQ_LEVELS[seqLevel];
  var ok = seqOrder.every(function(v, i) { return v === lv.correct[i]; });
  seqTries++;

  var items = document.querySelectorAll(".step-item");
  items.forEach(function(el) {
    el.classList.remove("correct","wrong");
    el.classList.add(ok ? "correct" : "wrong");
  });

  var fb = document.getElementById("seq-feedback");
  if (ok) {
    var pts = seqTries === 1 ? 20 : seqTries === 2 ? 15 : 10;
    seqScore += pts;
    fb.textContent = "🎉 Yeay, benar! Keren banget!";
    fb.className   = "feedback feedback-correct";
    updateHeaderScore(seqScore);
    document.getElementById("seq-info").innerHTML =
      "Soal " + (seqLevel+1) + " dari " + SEQ_LEVELS.length + " &nbsp;•&nbsp; 🏆 Skor kamu: <strong>" + seqScore + "</strong>";

    if (seqLevel >= SEQ_LEVELS.length - 1) {
      setTimeout(function() { showResult("sequence", seqScore); }, 1400);
    } else {
      setTimeout(function() { seqLevel++; renderSeqLevel(); }, 1400);
    }
  } else {
    fb.textContent = "😅 Belum tepat, coba lagi ya!";
    fb.className   = "feedback feedback-wrong";
    setTimeout(function() {
      items.forEach(function(el) { el.classList.remove("wrong"); });
      fb.textContent = "";
      fb.className   = "feedback";
    }, 1000);
  }
}


/* ═══════════════════════════════════════════════════════════════
   GAME 2 — KALAU / KALAU TIDAK (If / Else)
═══════════════════════════════════════════════════════════════ */
var IF_LEVELS = [
  {
    badge: "⭐ Mudah", badgeColor: "#06D6A0",
    situation: "Hari ini hujan 🌧️ dan Dino punya payung ☂️",
    rules: [
      { cls: "code-if",   text: "KALAU hujan 🌧️ DAN punya payung ☂️" },
      { cls: "code-then", text: "    ➡️  Dino tetap berangkat sekolah 🏫" },
      { cls: "code-else", text: "KALAU TIDAK..." },
      { cls: "code-then", text: "    ➡️  Dino tunggu di rumah 🏠" },
    ],
    question: "🤔 Apa yang dilakukan Dino?",
    options:  ["🏫 Dino berangkat sekolah","🏠 Dino tunggu di rumah","😴 Dino tidur saja","🛒 Dino pergi belanja"],
    correct: 0,
    hint: "💡 Hujan = YA ✅, Punya payung = YA ✅ → Kedua syarat terpenuhi!",
  },
  {
    badge: "⭐ Mudah", badgeColor: "#06D6A0",
    situation: "Nilai ulangan Sari adalah 60 😟. Nilai lulus = 70.",
    rules: [
      { cls: "code-if",   text: "KALAU nilai ≥ 70" },
      { cls: "code-then", text: "    ➡️  Sari dapat bintang ⭐" },
      { cls: "code-else", text: "KALAU TIDAK..." },
      { cls: "code-then", text: "    ➡️  Sari harus belajar lagi 📚" },
    ],
    question: "🤔 Apa yang terjadi pada Sari?",
    options:  ["⭐ Sari dapat bintang","📚 Sari belajar lagi","🎉 Sari dapat hadiah","😴 Sari istirahat"],
    correct: 1,
    hint: "💡 60 ≥ 70? Tidak! ❌ Jadi masuk ke bagian 'KALAU TIDAK'",
  },
  {
    badge: "🌟 Sedang", badgeColor: "#FFD166",
    situation: "Budi lapar 😋 tapi tidak ada makanan di rumah 🍽️❌",
    rules: [
      { cls: "code-if",   text: "KALAU lapar 😋 DAN ada makanan 🍽️" },
      { cls: "code-then", text: "    ➡️  Budi makan di rumah 🏠" },
      { cls: "code-else", text: "KALAU TIDAK..." },
      { cls: "code-then", text: "    ➡️  Budi beli makanan di warung 🛒" },
    ],
    question: "🤔 Apa yang dilakukan Budi?",
    options:  ["🏠 Makan di rumah","🛒 Beli di warung","😴 Tidur saja","📞 Telepon teman"],
    correct: 1,
    hint: "💡 Lapar = YA ✅, Ada makanan = TIDAK ❌ → Syarat DAN tidak terpenuhi!",
  },
  {
    badge: "🌟 Sedang", badgeColor: "#FFD166",
    situation: "Riko punya uang jajan 💰 dan hari ini hari Sabtu 🎉",
    rules: [
      { cls: "code-if",   text: "KALAU ada uang 💰 ATAU hari Sabtu 🎉" },
      { cls: "code-then", text: "    ➡️  Riko bisa beli es krim 🍦" },
      { cls: "code-else", text: "KALAU TIDAK..." },
      { cls: "code-then", text: "    ➡️  Riko tidak beli es krim 😢" },
    ],
    question: "🤔 Apakah Riko bisa beli es krim?",
    options:  ["🍦 Ya, bisa beli es krim","😢 Tidak bisa beli","🤔 Tidak tahu","⏳ Nunggu besok dulu"],
    correct: 0,
    hint: "💡 Pakai ATAU → cukup satu yang benar. Ada uang = YA ✅ → sudah cukup!",
  },
  {
    badge: "🔥 Susah", badgeColor: "#FF6B35",
    situation: "Suhu di luar 35°C 🥵 dan kipas angin rusak 💨❌",
    rules: [
      { cls: "code-if",    text: "KALAU suhu > 30°C DAN kipas rusak 💨❌" },
      { cls: "code-then",  text: "    ➡️  Nyalakan AC ❄️" },
      { cls: "code-else2", text: "TAPI KALAU hanya suhu > 30°C saja" },
      { cls: "code-then",  text: "    ➡️  Nyalakan kipas angin 💨" },
      { cls: "code-else",  text: "KALAU TIDAK..." },
      { cls: "code-then",  text: "    ➡️  Tidak perlu nyalain apa-apa 😊" },
    ],
    question: "🤔 Apa yang harus dilakukan?",
    options:  ["❄️ Nyalakan AC","💨 Nyalakan kipas","😊 Tidak perlu apa-apa","🪟 Buka jendela saja"],
    correct: 0,
    hint: "💡 35°C > 30°C = YA ✅, kipas rusak = YA ✅ → kondisi pertama terpenuhi!",
  },
];

var ifLevel = 0;
var ifScore = 0;

function initIfElse() {
  ifLevel = 0;
  ifScore = 0;
  renderIfLevel();
}

function renderIfLevel() {
  var lv = IF_LEVELS[ifLevel];

  var codeLines = "";
  lv.rules.forEach(function(r) {
    codeLines += '<span class="code-line ' + r.cls + '">' + r.text + '</span>';
  });

  var optBtns = "";
  lv.options.forEach(function(opt, i) {
    optBtns += '<button class="btn-option" id="if-opt-' + i + '" onclick="checkIf(' + i + ')">' + opt + '</button>';
  });

  var html =
    '<span class="level-badge" style="background:' + lv.badgeColor + '33;border:1.5px solid ' + lv.badgeColor + ';color:' + lv.badgeColor + '">' + lv.badge + '</span>' +
    '<div class="story-box story-teal">🗒️ Situasi: ' + lv.situation + '</div>' +
    '<div class="code-block">' + codeLines + '</div>' +
    '<div class="hint-box">' + lv.hint + '</div>' +
    '<div class="question-text">' + lv.question + '</div>' +
    '<div class="options-grid">' + optBtns + '</div>' +
    '<div id="if-feedback" class="feedback" style="margin-top:14px"></div>' +
    '<div class="score-info" id="if-info">Soal ' + (ifLevel+1) + ' dari ' + IF_LEVELS.length + ' &nbsp;•&nbsp; 🏆 Skor kamu: <strong>' + ifScore + '</strong></div>';

  setHTML("game-content", html);
  updateHeaderScore(ifScore);
}

function checkIf(idx) {
  var lv = IF_LEVELS[ifLevel];
  var ok = idx === lv.correct;

  var buttons = document.querySelectorAll(".btn-option");
  buttons.forEach(function(btn) { btn.disabled = true; });

  document.getElementById("if-opt-" + idx).classList.add(ok ? "correct" : "wrong");
  if (!ok) document.getElementById("if-opt-" + lv.correct).classList.add("reveal");

  var fb = document.getElementById("if-feedback");
  if (ok) {
    ifScore += 20;
    fb.textContent = "🎉 Betul banget! Kamu pintar! +20 poin";
    fb.className   = "feedback feedback-correct";
    updateHeaderScore(ifScore);
    document.getElementById("if-info").innerHTML =
      "Soal " + (ifLevel+1) + " dari " + IF_LEVELS.length + " &nbsp;•&nbsp; 🏆 Skor kamu: <strong>" + ifScore + "</strong>";

    if (ifLevel >= IF_LEVELS.length - 1) {
      setTimeout(function() { showResult("ifelse", ifScore); }, 1400);
    } else {
      setTimeout(function() { ifLevel++; renderIfLevel(); }, 1400);
    }
  } else {
    fb.textContent = "😅 Kurang tepat, coba lihat petunjuknya lagi ya!";
    fb.className   = "feedback feedback-wrong";
    setTimeout(function() { ifLevel++; renderIfLevel(); }, 2000);
  }
}


/* ═══════════════════════════════════════════════════════════════
   GAME 3 — POLA & PERULANGAN (Pattern & Loop)
═══════════════════════════════════════════════════════════════ */
var PAT_LEVELS = [
  {
    badge: "⭐ Mudah", badgeColor: "#06D6A0",
    situation: "Ibu menata buah di meja makan setiap hari:",
    pattern: ["🍎","🍌","🍎","🍌","🍎","❓"],
    question: "🤔 Buah apa yang ke-6?",
    options:  ["🍎 Apel","🍌 Pisang","🍊 Jeruk","🍇 Anggur"],
    correct: 1,
    hint: "💡 Polanya: apel-pisang bergantian. Setelah apel ke-5, berikutnya adalah...",
  },
  {
    badge: "⭐ Mudah", badgeColor: "#06D6A0",
    situation: "Robot disuruh siram tanaman 3 kali tiap pagi:",
    codeLines: [
      { cls: "code-loop",   text: "🔁 Ulangi 3 kali:" },
      { cls: "code-action", text: "    💧 Siram tanaman" },
    ],
    question: "🤔 Berapa kali tanaman disiram?",
    options:  ["1 kali 💧","2 kali 💧💧","3 kali 💧💧💧","4 kali 💧💧💧💧"],
    correct: 2,
    hint: "💡 Loop jalan 3 kali → siram tanaman 3 kali juga!",
  },
  {
    badge: "🌟 Sedang", badgeColor: "#FFD166",
    situation: "Riko menghias kelas dengan bendera warna-warni:",
    pattern: ["🟥","🟨","🟦","🟥","🟨","🟦","🟥","❓"],
    question: "🤔 Bendera ke-8 warnanya apa?",
    options:  ["🟥 Merah","🟨 Kuning","🟦 Biru","🟩 Hijau"],
    correct: 1,
    hint: "💡 Pola: merah-kuning-biru (3 warna). Posisi 8 → 8 dibagi 3 sisa 2 → kuning!",
  },
  {
    badge: "🌟 Sedang", badgeColor: "#FFD166",
    situation: "Robot menulis kata NANA terus-menerus di papan:",
    codeLines: [
      { cls: "code-loop",   text: "🔁 Ulangi 4 kali:" },
      { cls: "code-action", text: "    ✍️ Tulis 'NANA'" },
    ],
    question: "🤔 Huruf ke berapa adalah huruf 'A' yang pertama?",
    options:  ["Huruf ke-1","Huruf ke-2","Huruf ke-3","Huruf ke-4"],
    correct: 1,
    hint: "💡 NANA = N(1) A(2) N(3) A(4). Huruf A pertama ada di posisi ke-2!",
  },
  {
    badge: "🔥 Susah", badgeColor: "#FF6B35",
    situation: "Robot bantu cuci piring! Ada 2 rak, setiap rak ada 4 piring:",
    codeLines: [
      { cls: "code-loop",   text: "🔁 Ulangi 2 kali (rak):" },
      { cls: "code-loop2",  text: "    🔁 Ulangi 4 kali (piring):" },
      { cls: "code-action", text: "        🫧 Cuci 1 piring" },
    ],
    question: "🤔 Total berapa piring yang dicuci robot?",
    options:  ["4 piring 🍽️","6 piring 🍽️🍽️","8 piring 🍽️🍽️🍽️","10 piring 🍽️🍽️🍽️🍽️"],
    correct: 2,
    hint: "💡 2 rak × 4 piring per rak = berapa piring ya? 🤔",
  },
];

var patLevel = 0;
var patScore = 0;

function initPattern() {
  patLevel = 0;
  patScore = 0;
  renderPatLevel();
}

function renderPatLevel() {
  var lv = PAT_LEVELS[patLevel];

  var visualHTML = "";

  if (lv.pattern) {
    var cells = "";
    lv.pattern.forEach(function(emoji) {
      var isUnknown = emoji === "❓";
      cells += '<div class="pattern-cell ' + (isUnknown ? "unknown" : "") + '">' + emoji + '</div>';
    });
    visualHTML = '<div class="pattern-display">' + cells + '</div>';
  }

  if (lv.codeLines) {
    var lines = "";
    lv.codeLines.forEach(function(line) {
      lines += '<span class="code-line ' + line.cls + '">' + line.text + '</span>';
    });
    visualHTML = '<div class="code-block">' + lines + '</div>';
  }

  var optBtns = "";
  lv.options.forEach(function(opt, i) {
    optBtns += '<button class="btn-option" id="pat-opt-' + i + '" onclick="checkPat(' + i + ')">' + opt + '</button>';
  });

  var html =
    '<span class="level-badge" style="background:' + lv.badgeColor + '33;border:1.5px solid ' + lv.badgeColor + ';color:' + lv.badgeColor + '">' + lv.badge + '</span>' +
    '<div class="story-box story-purple">📖 ' + lv.situation + '</div>' +
    visualHTML +
    '<div class="hint-box">' + lv.hint + '</div>' +
    '<div class="question-text">' + lv.question + '</div>' +
    '<div class="options-grid">' + optBtns + '</div>' +
    '<div id="pat-feedback" class="feedback" style="margin-top:14px"></div>' +
    '<div class="score-info" id="pat-info">Soal ' + (patLevel+1) + ' dari ' + PAT_LEVELS.length + ' &nbsp;•&nbsp; 🏆 Skor kamu: <strong>' + patScore + '</strong></div>';

  setHTML("game-content", html);
  updateHeaderScore(patScore);
}

function checkPat(idx) {
  var lv = PAT_LEVELS[patLevel];
  var ok = idx === lv.correct;

  var buttons = document.querySelectorAll(".btn-option");
  buttons.forEach(function(btn) { btn.disabled = true; });

  document.getElementById("pat-opt-" + idx).classList.add(ok ? "correct" : "wrong");
  if (!ok) document.getElementById("pat-opt-" + lv.correct).classList.add("reveal");

  var fb = document.getElementById("pat-feedback");
  if (ok) {
    patScore += 20;
    fb.textContent = "🎉 Wah, hebat! Jawaban benar! +20 poin";
    fb.className   = "feedback feedback-correct";
    updateHeaderScore(patScore);
    document.getElementById("pat-info").innerHTML =
      "Soal " + (patLevel+1) + " dari " + PAT_LEVELS.length + " &nbsp;•&nbsp; 🏆 Skor kamu: <strong>" + patScore + "</strong>";

    if (patLevel >= PAT_LEVELS.length - 1) {
      setTimeout(function() { showResult("pattern", patScore); }, 1400);
    } else {
      setTimeout(function() { patLevel++; renderPatLevel(); }, 1400);
    }
  } else {
    fb.textContent = "😅 Hampir! Baca petunjuknya lagi ya!";
    fb.className   = "feedback feedback-wrong";
    setTimeout(function() { patLevel++; renderPatLevel(); }, 2000);
  }
}
