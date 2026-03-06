/* ═══════════════════════════════════════════════════════════════
   app.js — Game Logika Coding untuk Anak SD
   Vanilla JavaScript, tanpa framework
═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────
//  AVATAR & STATE GLOBAL
// ─────────────────────────────────────────────
var AVATARS = ["🐱","🐶","🐸","🦊","🐼","🐨","🦁","🐯"];
var AVATAR  = AVATARS[Math.floor(Math.random() * AVATARS.length)];

document.getElementById("home-avatar").textContent = AVATAR;
document.getElementById("game-avatar").textContent = AVATAR;

var gameState = {
  scores:    { sequence: 0, ifelse: 0, pattern: 0 },
  completed: { sequence: false, ifelse: false, pattern: false },
  active:    null,
};

var GAME_META = {
  sequence: { title: "Urutan Perintah",   icon: "📋", color: "#FF6B35", shadow: "#c94f1e" },
  ifelse:   { title: "Percabangan",       icon: "🔀", color: "#4ECDC4", shadow: "#35a9a2" },
  pattern:  { title: "Pola & Perulangan", icon: "🔄", color: "#9B5DE5", shadow: "#7340b5" },
};

// ─────────────────────────────────────────────
//  SCREEN NAVIGATION
// ─────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function(s) { s.classList.remove("active"); });
  document.getElementById("screen-" + id).classList.add("active");
}

function goHome() { refreshHomeUI(); showScreen("home"); }

function refreshHomeUI() {
  var total = Object.values(gameState.scores).reduce(function(a, b) { return a + b; }, 0);
  var done  = Object.values(gameState.completed).filter(Boolean).length;

  document.getElementById("total-score").textContent     = total;
  document.getElementById("completed-count").textContent = done + "/3";
  toggleHidden("all-done-msg", done < 3);

  ["sequence","ifelse","pattern"].forEach(function(id) {
    var meta   = GAME_META[id];
    var isDone = gameState.completed[id];
    var jumlah = id === "sequence" ? SEQ_LEVELS.length : id === "ifelse" ? IF_LEVELS.length : PAT_LEVELS.length;
    var card   = document.getElementById("card-" + id);

    card.style.borderColor = isDone ? meta.color : "";
    card.style.boxShadow   = isDone ? "0 6px 22px " + meta.color + "33" : "";
    toggleHidden("done-" + id, !isDone);
    document.getElementById("done-" + id).style.background = meta.color;
    document.getElementById("prog-" + id).style.width      = isDone ? "100%" : "0%";
    document.getElementById("meta-" + id).innerHTML        =
      jumlah + " soal &nbsp;•&nbsp; " + (isDone ? "🏆 Skor: " + gameState.scores[id] : "Belum dimainkan");
    document.getElementById("btn-" + id).textContent       = isDone ? "🔁 Ulang" : "▶ Mulai";
  });
}

function toggleHidden(id, hide) {
  var el = document.getElementById(id);
  if (hide) el.classList.add("hidden"); else el.classList.remove("hidden");
}

// ─────────────────────────────────────────────
//  START GAME
// ─────────────────────────────────────────────
function startGame(id) {
  gameState.active = id;
  var meta = GAME_META[id];
  document.getElementById("game-header").style.borderBottomColor = meta.color;
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
  var total = Object.values(gameState.scores).reduce(function(a,b){return a+b;},0);
  var done  = Object.values(gameState.completed).filter(Boolean).length;

  document.getElementById("result-title").textContent     = "Selesai, " + AVATAR + "!";
  document.getElementById("result-game-name").textContent = meta.icon + " " + meta.title;
  document.getElementById("result-game-name").style.color = meta.color;

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
  } else { allDoneEl.classList.add("hidden"); }

  showScreen("result");
}

function playAgain() { startGame(gameState.active); }

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length-1; i > 0; i--) {
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function setHTML(id, html) { document.getElementById(id).innerHTML = html; }
function updateHeaderScore(s) { document.getElementById("header-score").textContent = "🏆 Skor: " + s; }


/* ═══════════════════════════════════════════════════════════════
   GAME 1 — URUTAN PERINTAH  (10 soal)
═══════════════════════════════════════════════════════════════ */
var SEQ_LEVELS = [
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    story:"Robot mau nyalakan lampu 💡 Urutkan perintahnya yang benar!",
    steps:["💡 Lampu menyala","🔌 Colokkan kabel","🔘 Tekan tombol ON","🛒 Beli lampu dulu","🔧 Pasang lampu ke fitting"],
    correct:[3,4,1,2,0],
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    story:"Robot mau kirim pesan di HP! 📱 Urutkan algoritmanya!",
    steps:["📤 Klik tombol kirim","📱 Buka aplikasi chat","👤 Pilih nama teman","⌨️ Ketik pesannya","🔓 Buka kunci HP dulu"],
    correct:[4,1,2,3,0],
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    story:"Robot mau cari informasi di Google 🔍 Urutkan langkahnya!",
    steps:["✅ Baca hasilnya","🌐 Buka browser","⌨️ Ketik kata yang dicari","🔎 Klik tombol Search","📶 Pastikan ada internet"],
    correct:[4,1,2,3,0],
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    story:"Robot mau cetak dokumen 🖨️ Urutkan perintahnya!",
    steps:["🖨️ Ambil hasil cetakan","📄 Buka file dokumen","🔌 Nyalakan printer","🖱️ Klik Print","⚙️ Pilih ukuran kertas"],
    correct:[2,1,4,3,0],
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    story:"Robot mau login ke website 🖥️ Urutkan algoritmanya!",
    steps:["🏠 Masuk ke halaman utama","🔑 Ketik password","👤 Ketik username","🖱️ Klik tombol Login","🌐 Buka website dulu"],
    correct:[4,2,1,3,0],
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    story:"Robot mau simpan file di komputer 💾 Urutkan caranya!",
    steps:["💾 Klik Save","📝 Tulis isi filenya","📁 Pilih folder tujuan","📄 Buka aplikasi teks","✏️ Beri nama file"],
    correct:[3,1,2,4,0],
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    story:"Robot mau instal aplikasi di HP 📲 Urutkan algoritmanya!",
    steps:["📲 Buka aplikasinya","✅ Klik Instal","🔍 Cari nama aplikasi","⏳ Tunggu sampai selesai","🏪 Buka Play Store"],
    correct:[4,2,1,3,0],
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    story:"Programmer mau jalankan program pertamanya! 💻 Urutkan langkahnya!",
    steps:["▶️ Klik Run / Jalankan","💻 Buka aplikasi coding","🐛 Periksa kalau ada error","✍️ Tulis kode programnya","📁 Buat file baru"],
    correct:[1,4,3,0,2],
  },
  {
    badge:"🔥 Susah", badgeColor:"#FF6B35",
    story:"Robot mau debug (perbaiki) program yang error! 🐛 Urutkan langkahnya!",
    steps:["✅ Jalankan ulang program","🔍 Cari baris yang error","📖 Baca pesan errornya","🔧 Perbaiki kodenya","▶️ Jalankan program pertama kali"],
    correct:[4,2,1,3,0],
  },
  {
    badge:"🔥 Susah", badgeColor:"#FF6B35",
    story:"Tim robot mau bikin aplikasi baru! 🚀 Urutkan tahapan pembuatannya!",
    steps:["🚀 Rilis ke pengguna","🎨 Desain tampilan","📋 Rencanakan fitur","💻 Tulis kode program","🧪 Testing / Uji coba"],
    correct:[2,1,3,4,0],
  },
];

var seqLevel=0, seqOrder=[], seqScore=0, seqTries=0;

function initSequence() { seqLevel=0; seqScore=0; renderSeqLevel(); }

function renderSeqLevel() {
  var lv = SEQ_LEVELS[seqLevel];
  seqOrder = shuffle([0,1,2,3,4].slice(0,lv.steps.length));
  seqTries = 0;
  var html =
    '<span class="level-badge" style="background:'+lv.badgeColor+'33;border:1.5px solid '+lv.badgeColor+';color:'+lv.badgeColor+'">'+lv.badge+'</span>'+
    '<div class="story-box story-yellow">'+lv.story+'</div>'+
    '<div class="guide-text">👆 Klik tombol ▲ ▼ untuk geser urutannya!</div>'+
    '<div class="step-list" id="seq-list"></div>'+
    '<div class="check-row"><div id="seq-feedback" class="feedback"></div>'+
    '<button class="btn-check" onclick="checkSeq()">✅ Cek Jawaban</button></div>'+
    '<div class="score-info" id="seq-info">Soal '+(seqLevel+1)+' dari '+SEQ_LEVELS.length+' &nbsp;•&nbsp; 🏆 Skor: <strong>'+seqScore+'</strong></div>';
  setHTML("game-content", html);
  renderSeqList();
  updateHeaderScore(seqScore);
}

function renderSeqList() {
  var lv = SEQ_LEVELS[seqLevel], rows = "";
  for (var pos=0; pos<seqOrder.length; pos++) {
    var si = seqOrder[pos];
    rows += '<div class="step-item" id="step-'+pos+'">'+
      '<span class="step-num">'+(pos+1)+'</span>'+
      '<span class="step-text">'+lv.steps[si]+'</span>'+
      '<div class="step-btns">'+
        '<button class="btn-move" onclick="seqMove('+pos+',-1)" '+(pos===0?"disabled":"")+'>▲</button>'+
        '<button class="btn-move" onclick="seqMove('+pos+',1)"  '+(pos===seqOrder.length-1?"disabled":"")+'>▼</button>'+
      '</div></div>';
  }
  setHTML("seq-list", rows);
}

function seqMove(pos, dir) {
  var t = pos+dir;
  if (t<0||t>=seqOrder.length) return;
  var tmp=seqOrder[pos]; seqOrder[pos]=seqOrder[t]; seqOrder[t]=tmp;
  var fb=document.getElementById("seq-feedback"); fb.textContent=""; fb.className="feedback";
  document.querySelectorAll(".step-item").forEach(function(el){el.classList.remove("correct","wrong");});
  renderSeqList();
}

function checkSeq() {
  var lv=SEQ_LEVELS[seqLevel];
  var ok=seqOrder.every(function(v,i){return v===lv.correct[i];});
  seqTries++;
  var items=document.querySelectorAll(".step-item");
  items.forEach(function(el){el.classList.remove("correct","wrong");el.classList.add(ok?"correct":"wrong");});
  var fb=document.getElementById("seq-feedback");
  if (ok) {
    var pts=seqTries===1?20:seqTries===2?15:10;
    seqScore+=pts;
    fb.textContent="🎉 Yeay, benar! Keren banget! +"+pts+" poin";
    fb.className="feedback feedback-correct";
    updateHeaderScore(seqScore);
    document.getElementById("seq-info").innerHTML="Soal "+(seqLevel+1)+" dari "+SEQ_LEVELS.length+" &nbsp;•&nbsp; 🏆 Skor: <strong>"+seqScore+"</strong>";
    if (seqLevel>=SEQ_LEVELS.length-1) { setTimeout(function(){showResult("sequence",seqScore);},1400); }
    else { setTimeout(function(){seqLevel++;renderSeqLevel();},1400); }
  } else {
    fb.textContent="😅 Belum tepat, coba lagi ya!"; fb.className="feedback feedback-wrong";
    setTimeout(function(){ items.forEach(function(el){el.classList.remove("wrong");}); fb.textContent=""; fb.className="feedback"; },1000);
  }
}


/* ═══════════════════════════════════════════════════════════════
   GAME 2 — PERCABANGAN  (10 soal)
═══════════════════════════════════════════════════════════════ */
var IF_LEVELS = [
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Hari ini hujan 🌧️ dan Dino punya payung ☂️",
    rules:[
      {cls:"code-if",  text:"KALAU hujan 🌧️ DAN punya payung ☂️"},
      {cls:"code-then",text:"    ➡️  Dino berangkat sekolah 🏫"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Dino tunggu di rumah 🏠"},
    ],
    question:"🤔 Apa yang dilakukan Dino?",
    options:["🏫 Dino berangkat sekolah","🏠 Dino tunggu di rumah","😴 Dino tidur saja","🛒 Dino pergi belanja"],
    correct:0, hint:"💡 Hujan = YA ✅, Punya payung = YA ✅ → Kedua syarat terpenuhi!",
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Nilai ulangan Sari adalah 60 😟. Nilai lulus = 70.",
    rules:[
      {cls:"code-if",  text:"KALAU nilai >= 70"},
      {cls:"code-then",text:"    ➡️  Sari dapat bintang ⭐"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Sari harus belajar lagi 📚"},
    ],
    question:"🤔 Apa yang terjadi pada Sari?",
    options:["⭐ Sari dapat bintang","📚 Sari belajar lagi","🎉 Sari dapat hadiah","😴 Sari istirahat"],
    correct:1, hint:"💡 60 >= 70? Tidak! ❌ Jadi masuk ke bagian 'KALAU TIDAK'",
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Baterai robot tinggal 5% 🔋. Charger tersedia ✅",
    rules:[
      {cls:"code-if",  text:"KALAU baterai < 20%"},
      {cls:"code-then",text:"    ➡️  Robot segera charge 🔌"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Robot terus bekerja 💪"},
    ],
    question:"🤔 Apa yang dilakukan robot?",
    options:["🔌 Robot segera charge","💪 Robot terus bekerja","😴 Robot istirahat","🔁 Robot restart"],
    correct:0, hint:"💡 5% < 20%? YA! ✅ Jadi robot charge!",
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Angka = 8. Robot ingin tahu: genap atau ganjil?",
    rules:[
      {cls:"code-if",  text:"KALAU angka mod 2 == 0"},
      {cls:"code-then",text:"    ➡️  Cetak 'GENAP' 🟢"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Cetak 'GANJIL' 🔴"},
    ],
    question:"🤔 Apa yang dicetak robot?",
    options:["🟢 GENAP","🔴 GANJIL","🤔 TIDAK TAHU","⚠️ ERROR"],
    correct:0, hint:"💡 8 dibagi 2 sisa 0 → 8 adalah bilangan GENAP!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Budi lapar 😋 tapi tidak ada makanan di rumah 🍽️❌",
    rules:[
      {cls:"code-if",  text:"KALAU lapar 😋 DAN ada makanan 🍽️"},
      {cls:"code-then",text:"    ➡️  Budi makan di rumah 🏠"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Budi beli makanan di warung 🛒"},
    ],
    question:"🤔 Apa yang dilakukan Budi?",
    options:["🏠 Makan di rumah","🛒 Beli di warung","😴 Tidur saja","📞 Telepon teman"],
    correct:1, hint:"💡 Lapar = YA ✅, Ada makanan = TIDAK ❌ → DAN gagal!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Riko punya uang 💰 dan hari ini hari Sabtu 🎉",
    rules:[
      {cls:"code-if",  text:"KALAU ada uang 💰 ATAU hari Sabtu 🎉"},
      {cls:"code-then",text:"    ➡️  Riko bisa beli es krim 🍦"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Riko tidak beli es krim 😢"},
    ],
    question:"🤔 Apakah Riko bisa beli es krim?",
    options:["🍦 Ya, bisa beli","😢 Tidak bisa beli","🤔 Tidak tahu","⏳ Nunggu besok"],
    correct:0, hint:"💡 ATAU → cukup satu benar. Ada uang = YA ✅ → sudah cukup!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Password diketik: 'abc123'. Password benar: 'abc123'.",
    rules:[
      {cls:"code-if",  text:"KALAU password == password_benar"},
      {cls:"code-then",text:"    ➡️  Akses diberikan ✅"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Akses ditolak ❌"},
    ],
    question:"🤔 Apa yang terjadi?",
    options:["✅ Akses diberikan","❌ Akses ditolak","🔄 Coba lagi","⚠️ Sistem error"],
    correct:0, hint:"💡 'abc123' == 'abc123'? YA! ✅ Password sama → akses diberikan!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Nilai a = 10, nilai b = 20.",
    rules:[
      {cls:"code-if",  text:"KALAU a > b"},
      {cls:"code-then",text:"    ➡️  Cetak 'a lebih besar'"},
      {cls:"code-else",text:"KALAU TIDAK..."},
      {cls:"code-then",text:"    ➡️  Cetak 'b lebih besar'"},
    ],
    question:"🤔 Apa yang dicetak robot?",
    options:["'a lebih besar'","'b lebih besar'","'sama besar'","Tidak ada output"],
    correct:1, hint:"💡 10 > 20? Tidak! ❌ → masuk 'KALAU TIDAK' → b lebih besar!",
  },
  {
    badge:"🔥 Susah", badgeColor:"#FF6B35",
    situation:"Suhu 35°C 🥵, kipas rusak 💨❌, AC tersedia ❄️",
    rules:[
      {cls:"code-if",   text:"KALAU suhu > 30°C DAN kipas rusak"},
      {cls:"code-then", text:"    ➡️  Nyalakan AC ❄️"},
      {cls:"code-else2",text:"TAPI KALAU suhu > 30°C saja"},
      {cls:"code-then", text:"    ➡️  Nyalakan kipas 💨"},
      {cls:"code-else", text:"KALAU TIDAK..."},
      {cls:"code-then", text:"    ➡️  Tidak perlu apa-apa 😊"},
    ],
    question:"🤔 Apa yang harus dilakukan?",
    options:["❄️ Nyalakan AC","💨 Nyalakan kipas","😊 Tidak perlu apa-apa","🪟 Buka jendela"],
    correct:0, hint:"💡 35°C > 30°C = YA ✅ DAN kipas rusak = YA ✅ → kondisi pertama!",
  },
  {
    badge:"🔥 Susah", badgeColor:"#FF6B35",
    situation:"Nilai siswa = 85. Cek grade-nya!",
    rules:[
      {cls:"code-if",   text:"KALAU nilai >= 90"},
      {cls:"code-then", text:"    ➡️  Grade A 🌟"},
      {cls:"code-else2",text:"TAPI KALAU nilai >= 75"},
      {cls:"code-then", text:"    ➡️  Grade B 👍"},
      {cls:"code-else", text:"KALAU TIDAK..."},
      {cls:"code-then", text:"    ➡️  Grade C 📚"},
    ],
    question:"🤔 Grade apa yang didapat siswa?",
    options:["🌟 Grade A","👍 Grade B","📚 Grade C","❌ Tidak lulus"],
    correct:1, hint:"💡 85 >= 90? Tidak ❌. 85 >= 75? YA ✅ → Grade B!",
  },
];

var ifLevel=0, ifScore=0;

function initIfElse() { ifLevel=0; ifScore=0; renderIfLevel(); }

function renderIfLevel() {
  var lv=IF_LEVELS[ifLevel];
  var codeLines="";
  lv.rules.forEach(function(r){ codeLines+='<span class="code-line '+r.cls+'">'+r.text+'</span>'; });
  var optBtns="";
  lv.options.forEach(function(opt,i){ optBtns+='<button class="btn-option" id="if-opt-'+i+'" onclick="checkIf('+i+')">'+opt+'</button>'; });
  var html=
    '<span class="level-badge" style="background:'+lv.badgeColor+'33;border:1.5px solid '+lv.badgeColor+';color:'+lv.badgeColor+'">'+lv.badge+'</span>'+
    '<div class="story-box story-teal">🗒️ Situasi: '+lv.situation+'</div>'+
    '<div class="code-block">'+codeLines+'</div>'+
    '<div class="hint-box">'+lv.hint+'</div>'+
    '<div class="question-text">'+lv.question+'</div>'+
    '<div class="options-grid">'+optBtns+'</div>'+
    '<div id="if-feedback" class="feedback" style="margin-top:14px"></div>'+
    '<div class="score-info" id="if-info">Soal '+(ifLevel+1)+' dari '+IF_LEVELS.length+' &nbsp;•&nbsp; 🏆 Skor: <strong>'+ifScore+'</strong></div>';
  setHTML("game-content",html);
  updateHeaderScore(ifScore);
}

function checkIf(idx) {
  var lv=IF_LEVELS[ifLevel], ok=idx===lv.correct;
  document.querySelectorAll(".btn-option").forEach(function(btn){btn.disabled=true;});
  document.getElementById("if-opt-"+idx).classList.add(ok?"correct":"wrong");
  if (!ok) document.getElementById("if-opt-"+lv.correct).classList.add("reveal");
  var fb=document.getElementById("if-feedback");
  if (ok) {
    ifScore+=20;
    fb.textContent="🎉 Betul banget! Kamu pintar! +20 poin"; fb.className="feedback feedback-correct";
    updateHeaderScore(ifScore);
    document.getElementById("if-info").innerHTML="Soal "+(ifLevel+1)+" dari "+IF_LEVELS.length+" &nbsp;•&nbsp; 🏆 Skor: <strong>"+ifScore+"</strong>";
    if (ifLevel>=IF_LEVELS.length-1) { setTimeout(function(){showResult("ifelse",ifScore);},1400); }
    else { setTimeout(function(){ifLevel++;renderIfLevel();},1400); }
  } else {
    fb.textContent="😅 Kurang tepat! Jawaban benar sudah ditandai hijau 💚"; fb.className="feedback feedback-wrong";
    setTimeout(function(){ifLevel++;renderIfLevel();},2200);
  }
}


/* ═══════════════════════════════════════════════════════════════
   GAME 3 — POLA & PERULANGAN  (10 soal)
═══════════════════════════════════════════════════════════════ */
var PAT_LEVELS = [
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Ibu menata buah di meja makan setiap hari:",
    pattern:["🍎","🍌","🍎","🍌","🍎","❓"],
    question:"🤔 Buah apa yang ke-6?",
    options:["🍎 Apel","🍌 Pisang","🍊 Jeruk","🍇 Anggur"],
    correct:1, hint:"💡 Polanya: apel-pisang bergantian. Setelah apel ke-5 adalah...",
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Robot disuruh cetak kata 'Halo' sebanyak 4 kali:",
    codeLines:[
      {cls:"code-loop",  text:"🔁 Ulangi 4 kali:"},
      {cls:"code-action",text:"    📢 Cetak 'Halo'"},
    ],
    question:"🤔 Berapa kali kata 'Halo' dicetak?",
    options:["2 kali","3 kali","4 kali","5 kali"],
    correct:2, hint:"💡 Loop jalan 4 kali → 'Halo' dicetak 4 kali juga!",
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Robot menghitung mundur dari 5:",
    codeLines:[
      {cls:"code-loop",  text:"🔢 i = 5"},
      {cls:"code-loop",  text:"🔁 SELAMA i > 0:"},
      {cls:"code-action",text:"    📢 Cetak i"},
      {cls:"code-action",text:"    i = i - 1"},
    ],
    question:"🤔 Angka apa saja yang dicetak? (urut)",
    options:["5,4,3,2,1","1,2,3,4,5","5,4,3,2,1,0","4,3,2,1,0"],
    correct:0, hint:"💡 Mulai i=5, tiap putaran kurang 1, berhenti saat i=0 (tidak dicetak)",
  },
  {
    badge:"⭐ Mudah", badgeColor:"#06D6A0",
    situation:"Robot menyiram tanaman setiap hari selama seminggu:",
    codeLines:[
      {cls:"code-loop",  text:"🔁 Ulangi 7 kali:"},
      {cls:"code-action",text:"    💧 Siram tanaman"},
    ],
    question:"🤔 Total berapa kali tanaman disiram?",
    options:["5 kali","6 kali","7 kali","8 kali"],
    correct:2, hint:"💡 1 minggu = 7 hari → loop 7 kali → siram 7 kali!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Riko menghias kelas dengan bendera warna-warni:",
    pattern:["🟥","🟨","🟦","🟥","🟨","🟦","🟥","❓"],
    question:"🤔 Bendera ke-8 warnanya apa?",
    options:["🟥 Merah","🟨 Kuning","🟦 Biru","🟩 Hijau"],
    correct:1, hint:"💡 Pola 3 warna berulang. Posisi 8 → 8 mod 3 = 2 → urutan ke-2 = kuning!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Robot menghitung jumlah dari 1 sampai 5:",
    codeLines:[
      {cls:"code-loop",  text:"🔢 total = 0, i = 1"},
      {cls:"code-loop",  text:"🔁 SELAMA i <= 5:"},
      {cls:"code-action",text:"    total = total + i"},
      {cls:"code-action",text:"    i = i + 1"},
    ],
    question:"🤔 Berapa nilai total akhirnya?",
    options:["10","15","20","25"],
    correct:1, hint:"💡 1+2+3+4+5 = 15. Loop menjumlahkan semua angka 1 sampai 5!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Robot mencetak segitiga bintang, tiap baris bertambah:",
    codeLines:[
      {cls:"code-loop",  text:"🔁 i dari 1 sampai 4:"},
      {cls:"code-action",text:"    ⭐ Cetak bintang sebanyak i"},
    ],
    question:"🤔 Baris ke-3 ada berapa bintang?",
    options:["1 bintang ⭐","2 bintang ⭐⭐","3 bintang ⭐⭐⭐","4 bintang ⭐⭐⭐⭐"],
    correct:2, hint:"💡 Baris 1=1⭐, Baris 2=2⭐, Baris 3=3⭐. i mengikuti nomor baris!",
  },
  {
    badge:"🌟 Sedang", badgeColor:"#FFD166",
    situation:"Robot mencari angka terbesar dari daftar: [3, 7, 2, 9, 5]",
    codeLines:[
      {cls:"code-loop",  text:"🔢 maks = 0"},
      {cls:"code-loop",  text:"🔁 Untuk setiap angka:"},
      {cls:"code-if",    text:"    KALAU angka > maks:"},
      {cls:"code-action",text:"        maks = angka"},
    ],
    question:"🤔 Berapa nilai maks di akhir?",
    options:["3","7","5","9"],
    correct:3, hint:"💡 Loop memeriksa satu per satu. Angka terbesar dari [3,7,2,9,5] adalah 9!",
  },
  {
    badge:"🔥 Susah", badgeColor:"#FF6B35",
    situation:"Robot cuci piring! 2 rak, setiap rak ada 4 piring:",
    codeLines:[
      {cls:"code-loop",  text:"🔁 Ulangi 2 kali (rak):"},
      {cls:"code-loop2", text:"    🔁 Ulangi 4 kali (piring):"},
      {cls:"code-action",text:"        🫧 Cuci 1 piring"},
    ],
    question:"🤔 Total berapa piring yang dicuci?",
    options:["4 piring","6 piring","8 piring","10 piring"],
    correct:2, hint:"💡 Loop bersarang: 2 × 4 = 8 piring total!",
  },
  {
    badge:"🔥 Susah", badgeColor:"#FF6B35",
    situation:"Robot mencetak tabel perkalian 3 (dari 1 sampai 5):",
    codeLines:[
      {cls:"code-loop",  text:"🔁 i dari 1 sampai 5:"},
      {cls:"code-action",text:"    📢 Cetak 3 × i"},
    ],
    question:"🤔 Angka ke-4 yang dicetak adalah?",
    options:["9","12","15","16"],
    correct:1, hint:"💡 i=1→3, i=2→6, i=3→9, i=4→12. Angka ke-4 adalah 3×4 = 12!",
  },
];

var patLevel=0, patScore=0;

function initPattern() { patLevel=0; patScore=0; renderPatLevel(); }

function renderPatLevel() {
  var lv=PAT_LEVELS[patLevel], visualHTML="";
  if (lv.pattern) {
    var cells="";
    lv.pattern.forEach(function(e){ cells+='<div class="pattern-cell '+(e==="❓"?"unknown":"")+'">'+ e+'</div>'; });
    visualHTML='<div class="pattern-display">'+cells+'</div>';
  }
  if (lv.codeLines) {
    var lines="";
    lv.codeLines.forEach(function(l){ lines+='<span class="code-line '+l.cls+'">'+l.text+'</span>'; });
    visualHTML='<div class="code-block">'+lines+'</div>';
  }
  var optBtns="";
  lv.options.forEach(function(opt,i){ optBtns+='<button class="btn-option" id="pat-opt-'+i+'" onclick="checkPat('+i+')">'+opt+'</button>'; });
  var html=
    '<span class="level-badge" style="background:'+lv.badgeColor+'33;border:1.5px solid '+lv.badgeColor+';color:'+lv.badgeColor+'">'+lv.badge+'</span>'+
    '<div class="story-box story-purple">📖 '+lv.situation+'</div>'+
    visualHTML+
    '<div class="hint-box">'+lv.hint+'</div>'+
    '<div class="question-text">'+lv.question+'</div>'+
    '<div class="options-grid">'+optBtns+'</div>'+
    '<div id="pat-feedback" class="feedback" style="margin-top:14px"></div>'+
    '<div class="score-info" id="pat-info">Soal '+(patLevel+1)+' dari '+PAT_LEVELS.length+' &nbsp;•&nbsp; 🏆 Skor: <strong>'+patScore+'</strong></div>';
  setHTML("game-content",html);
  updateHeaderScore(patScore);
}

function checkPat(idx) {
  var lv=PAT_LEVELS[patLevel], ok=idx===lv.correct;
  document.querySelectorAll(".btn-option").forEach(function(btn){btn.disabled=true;});
  document.getElementById("pat-opt-"+idx).classList.add(ok?"correct":"wrong");
  if (!ok) document.getElementById("pat-opt-"+lv.correct).classList.add("reveal");
  var fb=document.getElementById("pat-feedback");
  if (ok) {
    patScore+=20;
    fb.textContent="🎉 Wah, hebat! Jawaban benar! +20 poin"; fb.className="feedback feedback-correct";
    updateHeaderScore(patScore);
    document.getElementById("pat-info").innerHTML="Soal "+(patLevel+1)+" dari "+PAT_LEVELS.length+" &nbsp;•&nbsp; 🏆 Skor: <strong>"+patScore+"</strong>";
    if (patLevel>=PAT_LEVELS.length-1) { setTimeout(function(){showResult("pattern",patScore);},1400); }
    else { setTimeout(function(){patLevel++;renderPatLevel();},1400); }
  } else {
    fb.textContent="😅 Hampir! Jawaban benar sudah ditandai hijau 💚"; fb.className="feedback feedback-wrong";
    setTimeout(function(){patLevel++;renderPatLevel();},2200);
  }
}
