document.addEventListener("mousemove", function(e) {
  var g = document.getElementById("cursor-glow");
  g.style.left = e.clientX + "px";
  g.style.top  = e.clientY + "px";
});

// ── Avatar ────────────────────────────────────────────
var AVATARS = ["🐱","🐶","🐸","🦊","🐼","🐨","🦁","🐯"];
var AVATAR  = AVATARS[Math.floor(Math.random() * AVATARS.length)];
document.getElementById("home-avatar").textContent = AVATAR;

// ── Global state ─────────────────────────────────────
var GS = {
  scores:    { sequence: 0, ifelse: 0, pattern: 0 },
  completed: { sequence: false, ifelse: false, pattern: false },
  active: null,
};

var META = {
  sequence: { title: "Urutan Perintah",   color: "var(--g1)", max: 0 },
  ifelse:   { title: "Percabangan",       color: "var(--g2)", max: 0 },
  pattern:  { title: "Pola & Perulangan", color: "var(--g3)", max: 0 },
};

// ── Helpers ───────────────────────────────────────────
function $(id)       { return document.getElementById(id); }
function setH(id, h) { $(id).innerHTML = h; }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function(s) {
    s.classList.remove("active");
  });
  $(id).classList.add("active");
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function levelCount(id) {
  return id === "sequence" ? SEQ_LEVELS.length
       : id === "ifelse"   ? IF_LEVELS.length
       : PAT_LEVELS.length;
}

function chipClass(badge) {
  if (badge === "Mudah")  return "easy";
  if (badge === "Sedang") return "medium";
  return "hard";
}

function animateContent() {
  var el = $("game-content");
  el.classList.remove("q-enter");
  void el.offsetWidth; /* reflow */
  el.classList.add("q-enter");
}

function setHeaderScore(pts) {
  $("header-score").textContent = pts + " pts";
}

function setHeaderProgress(cur, tot) {
  var pct = Math.round((cur / tot) * 100);
  $("hprog-fill").style.width  = pct + "%";
  $("hprog-text").textContent  = cur + " / " + tot;
}

// ── Home UI refresh ───────────────────────────────────
function refreshHome() {
  var total = 0;
  var done  = 0;
  ["sequence","ifelse","pattern"].forEach(function(id) {
    total += GS.scores[id];
    if (GS.completed[id]) done++;
  });

  $("total-score").textContent     = total;
  $("completed-count").textContent = done + "/3";
  $("all-done-msg").classList.toggle("hidden", done < 3);

  ["sequence","ifelse","pattern"].forEach(function(id) {
    var isDone = GS.completed[id];
    var card   = $("card-" + id);
    card.classList.toggle("done", isDone);
    $("prog-" + id).style.width  = isDone ? "100%" : "0%";
    $("meta-" + id).textContent  = levelCount(id) + " soal";
    $("cscore-" + id).textContent = isDone ? "Skor: " + GS.scores[id] : "";
    $("btn-" + id).textContent   = isDone ? "Ulang" : "Mulai";
  });
}

function goHome() {
  refreshHome();
  showScreen("screen-home");
}

// ── Start game ────────────────────────────────────────
function startGame(id) {
  GS.active = id;
  $("game-title-label").textContent = META[id].title;
  $("header-score").style.background = META[id].color;
  $("hprog-fill").style.background   = META[id].color;
  setHeaderScore(0);
  setHeaderProgress(0, levelCount(id));
  showScreen("screen-game");

  if (id === "sequence") initSequence();
  if (id === "ifelse")   initIfElse();
  if (id === "pattern")  initPattern();
}

// ── Show result ───────────────────────────────────────
function showResult(gameId, score) {
  GS.scores[gameId]    = score;
  GS.completed[gameId] = true;

  var maxPts = levelCount(gameId) * 20;
  var pct    = Math.round((score / maxPts) * 100);
  var total  = 0;
  var done   = 0;
  ["sequence","ifelse","pattern"].forEach(function(id) {
    total += GS.scores[id];
    if (GS.completed[id]) done++;
  });

  $("result-game-name").textContent = META[gameId].title;
  $("result-score-num").textContent = score;
  $("result-score-num").style.color = META[gameId].color;
  $("btn-play-again").style.background = META[gameId].color;

  // progress bar
  setTimeout(function() {
    $("result-bar-fill").style.width = pct + "%";
    $("result-bar-fill").style.background = META[gameId].color;
    $("result-bar-label").textContent = pct + "% akurasi dari skor maksimum " + maxPts;
  }, 100);

  var allEl = $("result-all-done");
  if (done >= 3) {
    allEl.classList.remove("hidden");
    $("result-total").textContent = total;
  } else {
    allEl.classList.add("hidden");
  }

  showScreen("screen-result");
}

function playAgain() { startGame(GS.active); }


/* ══════════════════════════════════════════════════════
   GAME 1 — URUTAN PERINTAH  (10 soal)
══════════════════════════════════════════════════════ */
var SEQ_LEVELS = [
  { badge:"Mudah",
    story:"Robot mau nyalakan lampu. Urutkan perintahnya yang benar.",
    steps:["Lampu menyala","Colokkan kabel ke listrik","Tekan tombol ON","Beli lampunya dulu","Pasang lampu ke fitting"],
    correct:[3,4,1,2,0] },
  { badge:"Mudah",
    story:"Robot mau mengirim pesan lewat HP. Urutkan algoritmanya.",
    steps:["Klik tombol Kirim","Buka aplikasi chat","Pilih nama teman","Ketik isi pesan","Buka kunci HP dulu"],
    correct:[4,1,2,3,0] },
  { badge:"Mudah",
    story:"Robot mau mencari informasi di Google. Urutkan langkahnya.",
    steps:["Baca hasil pencarian","Buka browser","Ketik kata yang dicari","Klik tombol Search","Pastikan ada koneksi internet"],
    correct:[4,1,2,3,0] },
  { badge:"Mudah",
    story:"Robot mau mencetak dokumen. Urutkan perintahnya.",
    steps:["Ambil hasil cetakan","Buka file dokumen","Nyalakan printer","Klik Print","Pilih ukuran kertas"],
    correct:[2,1,4,3,0] },
  { badge:"Sedang",
    story:"Robot mau login ke sebuah website. Urutkan algoritmanya.",
    steps:["Masuk ke halaman utama","Ketik password","Ketik username","Klik tombol Login","Buka website-nya dulu"],
    correct:[4,2,1,3,0] },
  { badge:"Sedang",
    story:"Robot mau menyimpan file di komputer. Urutkan caranya.",
    steps:["Klik Save","Tulis isi file","Pilih folder tujuan","Buka aplikasi teks","Beri nama file"],
    correct:[3,1,2,4,0] },
  { badge:"Sedang",
    story:"Robot mau menginstal aplikasi di HP. Urutkan algoritmanya.",
    steps:["Buka aplikasinya","Klik Instal","Cari nama aplikasi","Tunggu proses selesai","Buka Play Store"],
    correct:[4,2,1,3,0] },
  { badge:"Sedang",
    story:"Programmer mau menjalankan program pertamanya. Urutkan langkahnya.",
    steps:["Klik Run / Jalankan","Buka aplikasi coding","Periksa jika ada error","Tulis kode programnya","Buat file baru"],
    correct:[1,4,3,0,2] },
  { badge:"Susah",
    story:"Robot mau memperbaiki program yang error (debugging). Urutkan langkahnya.",
    steps:["Jalankan ulang program","Cari baris yang error","Baca pesan errornya","Perbaiki kodenya","Jalankan program pertama kali"],
    correct:[4,2,1,3,0] },
  { badge:"Susah",
    story:"Tim robot mau membuat aplikasi baru dari awal. Urutkan tahapannya.",
    steps:["Rilis ke pengguna","Desain tampilan UI","Rencanakan fitur","Tulis kode program","Testing / Uji coba"],
    correct:[2,1,3,4,0] },
];

var seqLevel = 0, seqOrder = [], seqScore = 0, seqTries = 0;

function initSequence() { seqLevel = 0; seqScore = 0; renderSeq(); }

function renderSeq() {
  var lv = SEQ_LEVELS[seqLevel];
  seqOrder = shuffle([0,1,2,3,4].slice(0, lv.steps.length));
  seqTries = 0;
  setHeaderScore(seqScore);
  setHeaderProgress(seqLevel, SEQ_LEVELS.length);
  animateContent();

  setH("game-content",
    '<div class="q-chip ' + chipClass(lv.badge) + '">' + lv.badge + '</div>' +
    '<div class="q-scene">' + lv.story + '</div>' +
    '<p class="guide-note">Gunakan tombol ↑ ↓ untuk mengubah urutan.</p>' +
    '<div class="seq-list" id="seq-list"></div>' +
    '<div class="check-row">' +
      '<div class="q-fb" id="seq-fb"></div>' +
      '<button class="btn-check" onclick="checkSeq()">Cek Jawaban</button>' +
    '</div>' +
    '<div class="q-info" id="seq-info">Soal ' + (seqLevel+1) + ' dari ' + SEQ_LEVELS.length + '  ·  Poin: <strong>' + seqScore + '</strong></div>'
  );
  renderSeqList();
}

function renderSeqList() {
  var lv = SEQ_LEVELS[seqLevel], rows = "";
  for (var p = 0; p < seqOrder.length; p++) {
    var si = seqOrder[p];
    rows +=
      '<div class="seq-item" id="si' + p + '">' +
        '<span class="seq-num">' + (p+1) + '</span>' +
        '<span class="seq-text">' + lv.steps[si] + '</span>' +
        '<div class="seq-controls">' +
          '<button class="btn-mv" onclick="seqMv(' + p + ',-1)" ' + (p===0 ? "disabled" : "") + '>↑</button>' +
          '<button class="btn-mv" onclick="seqMv(' + p + ',1)"  ' + (p===seqOrder.length-1 ? "disabled" : "") + '>↓</button>' +
        '</div>' +
      '</div>';
  }
  setH("seq-list", rows);
}

function seqMv(pos, dir) {
  var t = pos + dir;
  if (t < 0 || t >= seqOrder.length) return;
  var tmp = seqOrder[pos]; seqOrder[pos] = seqOrder[t]; seqOrder[t] = tmp;
  var fb = $("seq-fb"); fb.textContent = ""; fb.className = "q-fb";
  document.querySelectorAll(".seq-item").forEach(function(el) {
    el.classList.remove("correct", "wrong");
  });
  renderSeqList();
}

function checkSeq() {
  var lv = SEQ_LEVELS[seqLevel];
  var ok = seqOrder.every(function(v,i) { return v === lv.correct[i]; });
  seqTries++;
  var items = document.querySelectorAll(".seq-item");
  items.forEach(function(el) {
    el.classList.remove("correct","wrong");
    el.classList.add(ok ? "correct" : "wrong");
  });
  var fb = $("seq-fb");
  if (ok) {
    var pts = seqTries === 1 ? 20 : seqTries === 2 ? 15 : 10;
    seqScore += pts;
    fb.textContent = "Benar!  +" + pts + " poin"; fb.className = "q-fb ok";
    setHeaderScore(seqScore);
    $("seq-info").innerHTML = "Soal " + (seqLevel+1) + " dari " + SEQ_LEVELS.length + "  ·  Poin: <strong>" + seqScore + "</strong>";
    if (seqLevel >= SEQ_LEVELS.length - 1) {
      setTimeout(function() { showResult("sequence", seqScore); }, 1100);
    } else {
      setTimeout(function() { seqLevel++; renderSeq(); }, 1100);
    }
  } else {
    fb.textContent = "Urutan belum tepat, coba lagi."; fb.className = "q-fb err";
    setTimeout(function() {
      items.forEach(function(el) { el.classList.remove("wrong"); });
      fb.textContent = ""; fb.className = "q-fb";
    }, 900);
  }
}


/* ══════════════════════════════════════════════════════
   GAME 2 — PERCABANGAN  (10 soal)
══════════════════════════════════════════════════════ */
var IF_LEVELS = [
  { badge:"Mudah",
    situation:"Hari ini hujan dan Dino punya payung.",
    rules:[
      {c:"ci",t:"if hujan and punya_payung:"},
      {c:"ct",t:"    berangkat_sekolah()"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    tunggu_di_rumah()"},
    ],
    question:"Fungsi apa yang dipanggil?",
    options:["berangkat_sekolah()","tunggu_di_rumah()","tidur()","pergi_belanja()"],
    correct:0, hint:"<b>hujan = True</b>, <b>punya_payung = True</b>  →  kondisi AND terpenuhi." },

  { badge:"Mudah",
    situation:"Nilai ulangan Sari adalah 60. Nilai lulus = 70.",
    rules:[
      {c:"ci",t:"if nilai >= 70:"},
      {c:"ct",t:"    print('LULUS')"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    print('BELAJAR LAGI')"},
    ],
    question:"Apa yang dicetak?",
    options:["'LULUS'","'BELAJAR LAGI'","Tidak ada output","Error"],
    correct:1, hint:"<b>60 >= 70</b>  →  False  →  masuk blok else." },

  { badge:"Mudah",
    situation:"Baterai robot = 5%. Charger tersedia.",
    rules:[
      {c:"ci",t:"if baterai < 20:"},
      {c:"ct",t:"    mulai_charge()"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    lanjut_kerja()"},
    ],
    question:"Fungsi apa yang dipanggil?",
    options:["mulai_charge()","lanjut_kerja()","shutdown()","restart()"],
    correct:0, hint:"<b>5 < 20</b>  →  True  →  masuk blok if." },

  { badge:"Mudah",
    situation:"Angka = 8. Robot mengecek: genap atau ganjil?",
    rules:[
      {c:"ci",t:"if angka % 2 == 0:"},
      {c:"ct",t:"    print('GENAP')"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    print('GANJIL')"},
    ],
    question:"Apa yang dicetak?",
    options:["'GENAP'","'GANJIL'","'TIDAK TAHU'","Error"],
    correct:0, hint:"<b>8 % 2 = 0</b>  →  True  →  GENAP." },

  { badge:"Sedang",
    situation:"lapar = True,  ada_makanan = False.",
    rules:[
      {c:"ci",t:"if lapar and ada_makanan:"},
      {c:"ct",t:"    makan_di_rumah()"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    beli_di_warung()"},
    ],
    question:"Fungsi apa yang dipanggil?",
    options:["makan_di_rumah()","beli_di_warung()","tidur()","telepon_teman()"],
    correct:1, hint:"AND butuh keduanya True.  <b>True and False = False</b>  →  masuk else." },

  { badge:"Sedang",
    situation:"ada_uang = True,  hari_sabtu = True.",
    rules:[
      {c:"ci",t:"if ada_uang or hari_sabtu:"},
      {c:"ct",t:"    beli_es_krim()"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    pulang_saja()"},
    ],
    question:"Fungsi apa yang dipanggil?",
    options:["beli_es_krim()","pulang_saja()","menabung()","nunggu_besok()"],
    correct:0, hint:"OR cukup satu True.  <b>True or True = True</b>  →  masuk if." },

  { badge:"Sedang",
    situation:"input_password = 'abc123',  password_benar = 'abc123'.",
    rules:[
      {c:"ci",t:"if input_password == password_benar:"},
      {c:"ct",t:"    akses_diberikan()"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    akses_ditolak()"},
    ],
    question:"Fungsi apa yang dipanggil?",
    options:["akses_diberikan()","akses_ditolak()","coba_lagi()","error()"],
    correct:0, hint:"<b>'abc123' == 'abc123'</b>  →  True  →  akses_diberikan()." },

  { badge:"Sedang",
    situation:"a = 10,  b = 20.",
    rules:[
      {c:"ci",t:"if a > b:"},
      {c:"ct",t:"    print('a lebih besar')"},
      {c:"ce",t:"else:"},
      {c:"ct",t:"    print('b lebih besar')"},
    ],
    question:"Apa yang dicetak?",
    options:["'a lebih besar'","'b lebih besar'","'sama besar'","Tidak ada output"],
    correct:1, hint:"<b>10 > 20</b>  →  False  →  masuk else." },

  { badge:"Susah",
    situation:"suhu = 35,  kipas_rusak = True,  AC tersedia.",
    rules:[
      {c:"ci", t:"if suhu > 30 and kipas_rusak:"},
      {c:"ct", t:"    nyalakan_AC()"},
      {c:"ce2",t:"elif suhu > 30:"},
      {c:"ct", t:"    nyalakan_kipas()"},
      {c:"ce", t:"else:"},
      {c:"ct", t:"    tidak_perlu_apa()"},
    ],
    question:"Fungsi apa yang dipanggil?",
    options:["nyalakan_AC()","nyalakan_kipas()","tidak_perlu_apa()","Error"],
    correct:0, hint:"<b>35 > 30 = True AND kipas_rusak = True</b>  →  kondisi if pertama terpenuhi." },

  { badge:"Susah",
    situation:"nilai = 85.",
    rules:[
      {c:"ci", t:"if nilai >= 90:"},
      {c:"ct", t:"    grade = 'A'"},
      {c:"ce2",t:"elif nilai >= 75:"},
      {c:"ct", t:"    grade = 'B'"},
      {c:"ce", t:"else:"},
      {c:"ct", t:"    grade = 'C'"},
    ],
    question:"Nilai grade yang disimpan adalah?",
    options:["Grade A","Grade B","Grade C","Tidak ada grade"],
    correct:1, hint:"<b>85 >= 90</b> → False.  <b>85 >= 75</b> → True  →  grade = 'B'." },
];

var ifLevel = 0, ifScore = 0;

function initIfElse() { ifLevel = 0; ifScore = 0; renderIf(); }

function renderIf() {
  var lv = IF_LEVELS[ifLevel];
  setHeaderScore(ifScore);
  setHeaderProgress(ifLevel, IF_LEVELS.length);
  animateContent();

  var codeLines = "";
  lv.rules.forEach(function(r) {
    codeLines += '<span class="' + r.c + '">' + r.t + '</span>\n';
  });

  var opts = "";
  lv.options.forEach(function(o, i) {
    opts += '<button class="btn-opt" id="io' + i + '" onclick="checkIf(' + i + ')">' + o + '</button>';
  });

  setH("game-content",
    '<div class="q-chip ' + chipClass(lv.badge) + '">' + lv.badge + '</div>' +
    '<div class="q-scene">' + lv.situation + '</div>' +
    '<div class="code-block"><pre>' + codeLines + '</pre></div>' +
    '<div class="q-hint"><b>Petunjuk:</b> ' + lv.hint + '</div>' +
    '<div class="q-label">' + lv.question + '</div>' +
    '<div class="opts-grid">' + opts + '</div>' +
    '<div class="q-fb" id="if-fb" style="margin-top:16px"></div>' +
    '<div class="q-info" id="if-info">Soal ' + (ifLevel+1) + ' dari ' + IF_LEVELS.length + '  ·  Poin: <strong>' + ifScore + '</strong></div>'
  );
}

function checkIf(idx) {
  var lv = IF_LEVELS[ifLevel], ok = idx === lv.correct;
  document.querySelectorAll(".btn-opt").forEach(function(b) { b.disabled = true; });
  document.getElementById("io" + idx).classList.add(ok ? "correct" : "wrong");
  if (!ok) document.getElementById("io" + lv.correct).classList.add("reveal");
  var fb = $("if-fb");
  if (ok) {
    ifScore += 20;
    fb.textContent = "Benar!  +20 poin"; fb.className = "q-fb ok";
    setHeaderScore(ifScore);
    $("if-info").innerHTML = "Soal " + (ifLevel+1) + " dari " + IF_LEVELS.length + "  ·  Poin: <strong>" + ifScore + "</strong>";
    if (ifLevel >= IF_LEVELS.length - 1) {
      setTimeout(function() { showResult("ifelse", ifScore); }, 1100);
    } else {
      setTimeout(function() { ifLevel++; renderIf(); }, 1100);
    }
  } else {
    fb.textContent = "Kurang tepat — lihat jawaban yang benar di atas.";
    fb.className = "q-fb err";
    setTimeout(function() { ifLevel++; renderIf(); }, 2000);
  }
}


/* ══════════════════════════════════════════════════════
   GAME 3 — POLA & PERULANGAN  (10 soal)
══════════════════════════════════════════════════════ */
var PAT_LEVELS = [
  { badge:"Mudah",
    situation:"Ibu menata buah di meja setiap pagi:",
    pattern:["🍎","🍌","🍎","🍌","🍎","?"],
    question:"Buah ke-6 adalah?",
    options:["Apel","Pisang","Jeruk","Anggur"],
    correct:1, hint:"Pola: apel-pisang bergantian. Posisi genap = pisang." },

  { badge:"Mudah",
    situation:"Robot mencetak teks berulang:",
    codeLines:[
      {c:"cl",t:"for i in range(4):"},
      {c:"ca",t:"    print('Halo')"},
    ],
    question:"Berapa kali 'Halo' dicetak?",
    options:["2 kali","3 kali","4 kali","5 kali"],
    correct:2, hint:"<b>range(4)</b> menghasilkan [0,1,2,3]  →  loop berjalan 4 kali." },

  { badge:"Mudah",
    situation:"Robot menghitung mundur:",
    codeLines:[
      {c:"cl",t:"i = 5"},
      {c:"cl",t:"while i > 0:"},
      {c:"ca",t:"    print(i)"},
      {c:"ca",t:"    i = i - 1"},
    ],
    question:"Angka apa saja yang dicetak?",
    options:["5, 4, 3, 2, 1","1, 2, 3, 4, 5","5, 4, 3, 2, 1, 0","4, 3, 2, 1, 0"],
    correct:0, hint:"Mulai i=5, kurang 1 setiap putaran.  Berhenti saat <b>i=0</b> (tidak dicetak)." },

  { badge:"Mudah",
    situation:"Robot menyiram tanaman selama 7 hari:",
    codeLines:[
      {c:"cl",t:"for hari in range(7):"},
      {c:"ca",t:"    siram_tanaman()"},
    ],
    question:"Total siram_tanaman() dipanggil berapa kali?",
    options:["5 kali","6 kali","7 kali","8 kali"],
    correct:2, hint:"<b>range(7)</b>  →  7 iterasi  →  fungsi dipanggil 7 kali." },

  { badge:"Sedang",
    situation:"Riko menghias kelas dengan bendera warna-warni:",
    pattern:["🟥","🟨","🟦","🟥","🟨","🟦","🟥","?"],
    question:"Bendera ke-8 warnanya apa?",
    options:["Merah","Kuning","Biru","Hijau"],
    correct:1, hint:"Pola 3 warna berulang.  <b>8 % 3 = 2</b>  →  indeks ke-2 (mulai 0) = Kuning." },

  { badge:"Sedang",
    situation:"Robot menjumlahkan angka 1 sampai 5:",
    codeLines:[
      {c:"cl",t:"total = 0"},
      {c:"cl",t:"for i in range(1, 6):"},
      {c:"ca",t:"    total = total + i"},
    ],
    question:"Nilai total di akhir loop?",
    options:["10","15","20","25"],
    correct:1, hint:"1+2+3+4+5 = 15.  <b>range(1,6)</b> menghasilkan 1,2,3,4,5." },

  { badge:"Sedang",
    situation:"Robot mencetak segitiga bintang:",
    codeLines:[
      {c:"cl",t:"for i in range(1, 5):"},
      {c:"ca",t:"    print('*' * i)"},
    ],
    question:"Baris ke-3 ada berapa bintang?",
    options:["1 bintang","2 bintang","3 bintang","4 bintang"],
    correct:2, hint:"<b>i=3</b>  →  print('*' * 3)  →  mencetak ***." },

  { badge:"Sedang",
    situation:"Robot mencari angka terbesar dari list [3, 7, 2, 9, 5]:",
    codeLines:[
      {c:"cl",t:"maks = 0"},
      {c:"cl",t:"for angka in [3, 7, 2, 9, 5]:"},
      {c:"ci",t:"    if angka > maks:"},
      {c:"ca",t:"        maks = angka"},
    ],
    question:"Nilai maks di akhir loop?",
    options:["3","7","5","9"],
    correct:3, hint:"Loop memeriksa satu per satu dan terus memperbarui maks jika ada yang lebih besar." },

  { badge:"Susah",
    situation:"Robot mencuci piring — 2 rak, tiap rak 4 piring:",
    codeLines:[
      {c:"cl", t:"for rak in range(2):"},
      {c:"cl2",t:"    for piring in range(4):"},
      {c:"ca", t:"        cuci_piring()"},
    ],
    question:"Total cuci_piring() dipanggil berapa kali?",
    options:["4 kali","6 kali","8 kali","10 kali"],
    correct:2, hint:"Loop bersarang (nested loop):  <b>2 × 4 = 8</b> pemanggilan fungsi." },

  { badge:"Susah",
    situation:"Robot mencetak tabel perkalian 3:",
    codeLines:[
      {c:"cl",t:"for i in range(1, 6):"},
      {c:"ca",t:"    print(3 * i)"},
    ],
    question:"Angka ke-4 yang dicetak adalah?",
    options:["9","12","15","16"],
    correct:1, hint:"i=1→3,  i=2→6,  i=3→9,  <b>i=4→12</b>." },
];

var patLevel = 0, patScore = 0;

function initPattern() { patLevel = 0; patScore = 0; renderPat(); }

function renderPat() {
  var lv = PAT_LEVELS[patLevel];
  setHeaderScore(patScore);
  setHeaderProgress(patLevel, PAT_LEVELS.length);
  animateContent();

  var visual = "";
  if (lv.pattern) {
    var cells = "";
    lv.pattern.forEach(function(e) {
      cells += '<div class="pat-cell ' + (e === "?" ? "unknown" : "") + '">' + e + '</div>';
    });
    visual = '<div class="pat-row">' + cells + '</div>';
  }
  if (lv.codeLines) {
    var lines = "";
    lv.codeLines.forEach(function(l) { lines += '<span class="' + l.c + '">' + l.t + '</span>\n'; });
    visual = '<div class="code-block"><pre>' + lines + '</pre></div>';
  }

  var opts = "";
  lv.options.forEach(function(o, i) {
    opts += '<button class="btn-opt" id="po' + i + '" onclick="checkPat(' + i + ')">' + o + '</button>';
  });

  setH("game-content",
    '<div class="q-chip ' + chipClass(lv.badge) + '">' + lv.badge + '</div>' +
    '<div class="q-scene">' + lv.situation + '</div>' +
    visual +
    '<div class="q-hint"><b>Petunjuk:</b> ' + lv.hint + '</div>' +
    '<div class="q-label">' + lv.question + '</div>' +
    '<div class="opts-grid">' + opts + '</div>' +
    '<div class="q-fb" id="pat-fb" style="margin-top:16px"></div>' +
    '<div class="q-info" id="pat-info">Soal ' + (patLevel+1) + ' dari ' + PAT_LEVELS.length + '  ·  Poin: <strong>' + patScore + '</strong></div>'
  );
}

function checkPat(idx) {
  var lv = PAT_LEVELS[patLevel], ok = idx === lv.correct;
  document.querySelectorAll(".btn-opt").forEach(function(b) { b.disabled = true; });
  document.getElementById("po" + idx).classList.add(ok ? "correct" : "wrong");
  if (!ok) document.getElementById("po" + lv.correct).classList.add("reveal");
  var fb = $("pat-fb");
  if (ok) {
    patScore += 20;
    fb.textContent = "Benar!  +20 poin"; fb.className = "q-fb ok";
    setHeaderScore(patScore);
    $("pat-info").innerHTML = "Soal " + (patLevel+1) + " dari " + PAT_LEVELS.length + "  ·  Poin: <strong>" + patScore + "</strong>";
    if (patLevel >= PAT_LEVELS.length - 1) {
      setTimeout(function() { showResult("pattern", patScore); }, 1100);
    } else {
      setTimeout(function() { patLevel++; renderPat(); }, 1100);
    }
  } else {
    fb.textContent = "Kurang tepat — lihat jawaban yang benar di atas.";
    fb.className = "q-fb err";
    setTimeout(function() { patLevel++; renderPat(); }, 2000);
  }
}
