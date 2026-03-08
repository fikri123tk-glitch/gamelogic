var AVATARS = ["🐱","🐶","🐸","🦊","🐼","🐨","🦁","🐯"];
var AVATAR  = AVATARS[Math.floor(Math.random() * AVATARS.length)];
document.getElementById("home-avatar").textContent = AVATAR;

// ── State ──────────────────────────────────────────────
var GS = {
  scores:    { sequence: 0, ifelse: 0, pattern: 0, typing: 0 },
  completed: { sequence: false, ifelse: false, pattern: false, typing: false },
  active: null,
};

var META = {
  sequence: { title:"Urutan Perintah",   icon:"📋", color:"var(--orange)", bg:"var(--orange-d)", maxPts: function(){return SEQ_LEVELS.length*20;} },
  ifelse:   { title:"Percabangan",       icon:"🔀", color:"var(--teal)",   bg:"var(--teal-d)",   maxPts: function(){return IF_LEVELS.length*20;} },
  pattern:  { title:"Pola & Perulangan", icon:"🔄", color:"var(--purple)", bg:"var(--purple-d)", maxPts: function(){return PAT_LEVELS.length*20;} },
  typing:   { title:"Ketik Kodenya!",    icon:"⌨️", color:"var(--green)",  bg:"var(--green-d)",  maxPts: function(){return TYP_LEVELS.length*20;} },
};

// ── Helpers ────────────────────────────────────────────
function $(id)       { return document.getElementById(id); }
function setH(id, h) { $(id).innerHTML = h; }

function lvCount(id) {
  return id==="sequence" ? SEQ_LEVELS.length
       : id==="ifelse"   ? IF_LEVELS.length
       : id==="pattern"  ? PAT_LEVELS.length
       : TYP_LEVELS.length;
}

function chipCls(b) {
  if (b==="Mudah")  return "easy";
  if (b==="Sedang") return "medium";
  return "hard";
}

function shuffle(arr) {
  var a = arr.slice();
  for (var i=a.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=a[i];a[i]=a[j];a[j]=t;
  }
  return a;
}

function animateBody() {
  var el = $("game-body");
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
}

function setGameScore(s, id) {
  $("game-score").textContent = META[id].color ? "🏆 " + s : "🏆 " + s;
  $("game-score").textContent = "🏆 " + s;
  $("game-score").style.background = META[id].color;
}

function setProgress(cur, tot, id) {
  var pct = Math.round((cur / tot) * 100);
  $("game-progress").style.width      = pct + "%";
  $("game-progress").style.background = META[id].color;
  $("game-header").style.borderColor  = META[id].color + "55";
  $("game-sub").textContent = "Soal " + (cur+1) + " dari " + tot;
}

// ── Overlay flash ──────────────────────────────────────
function flashOverlay(ok, cb) {
  var el = ok ? $("overlay-correct") : $("overlay-wrong");
  el.classList.remove("hidden");
  setTimeout(function() {
    el.classList.add("hidden");
    if (cb) cb();
  }, 800);
}

// ── Home refresh ───────────────────────────────────────
function refreshHome() {
  var total = 0, done = 0;
  ["sequence","ifelse","pattern","typing"].forEach(function(id) {
    total += GS.scores[id];
    if (GS.completed[id]) done++;
  });
  $("total-score").textContent     = total;
  $("completed-count").textContent = done + "/4";
  $("all-done-msg").classList.toggle("hidden", done < 4);

  ["sequence","ifelse","pattern","typing"].forEach(function(id) {
    var isDone = GS.completed[id];
    $("card-" + id).classList.toggle("done", isDone);
    $("done-" + id).classList.toggle("hidden", !isDone);
    $("prog-" + id).style.width     = isDone ? "100%" : "0%";
    $("meta-" + id).textContent     = lvCount(id) + " soal · " + (isDone ? "Skor: " + GS.scores[id] : "Belum dimainkan");
    $("btn-" + id).textContent      = isDone ? "🔁 Ulang" : "▶ Mulai";
  });
}

function goHome() { refreshHome(); showScreen("screen-home"); }

// ── Screen management ─────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function(s) { s.classList.remove("active"); });
  $(id).classList.add("active");
  window.scrollTo(0,0);
}

// ── Start game ────────────────────────────────────────
function startGame(id) {
  GS.active = id;
  $("game-icon").textContent  = META[id].icon;
  $("game-title").textContent = META[id].title;
  $("game-score").style.background = META[id].color;
  $("game-score").textContent = "🏆 0";
  showScreen("screen-game");
  if (id==="sequence") initSequence();
  if (id==="ifelse")   initIfElse();
  if (id==="pattern")  initPattern();
  if (id==="typing")   initTyping();
}

// ── Show result ───────────────────────────────────────
function showResult(gameId, score) {
  GS.scores[gameId]    = score;
  GS.completed[gameId] = true;

  var maxP = META[gameId].maxPts();
  var pct  = Math.round((score / maxP) * 100);
  var emoji = pct >= 80 ? "🏆" : pct >= 50 ? "😊" : "💪";

  var total = 0, done = 0;
  ["sequence","ifelse","pattern","typing"].forEach(function(id) {
    total += GS.scores[id];
    if (GS.completed[id]) done++;
  });

  $("result-emoji").textContent  = emoji;
  $("result-title").textContent  = pct>=80 ? "Hebat sekali!" : pct>=50 ? "Bagus!" : "Terus latihan!";
  $("result-game").textContent   = META[gameId].icon + " " + META[gameId].title;
  $("result-pts").textContent    = score;
  $("result-pts").style.color    = META[gameId].color;
  $("result-accuracy").textContent = "Akurasi " + pct + "% dari skor maksimum " + maxP;

  var rbtn = $("btn-again");
  rbtn.style.background = META[gameId].color;
  rbtn.style.boxShadow  = "0 4px 0 " + META[gameId].bg;

  var allEl = $("result-alldone");
  if (done >= 4) {
    allEl.classList.remove("hidden");
    allEl.innerHTML = "🌟 Semua game selesai! Total poin kamu: <strong>" + total + "</strong>";
  } else { allEl.classList.add("hidden"); }

  showScreen("screen-result");
}

function playAgain() { startGame(GS.active); }


/* ══════════════════════════════════════════════════════
   GAME 1 — URUTAN PERINTAH
══════════════════════════════════════════════════════ */
var SEQ_LEVELS = [
  { badge:"Mudah", story:"Robot mau nyalakan lampu. Urutkan perintahnya yang benar.",
    steps:["Lampu menyala","Colokkan kabel ke listrik","Tekan tombol ON","Beli lampunya dulu","Pasang lampu ke fitting"],
    correct:[3,4,1,2,0] },
  { badge:"Mudah", story:"Robot mau mengirim pesan lewat HP. Urutkan algoritmanya.",
    steps:["Klik tombol Kirim","Buka aplikasi chat","Pilih nama teman","Ketik isi pesan","Buka kunci HP dulu"],
    correct:[4,1,2,3,0] },
  { badge:"Mudah", story:"Robot mau mencari informasi di Google. Urutkan langkahnya.",
    steps:["Baca hasil pencarian","Buka browser","Ketik kata yang dicari","Klik tombol Search","Pastikan ada internet"],
    correct:[4,1,2,3,0] },
  { badge:"Mudah", story:"Robot mau mencetak dokumen. Urutkan perintahnya.",
    steps:["Ambil hasil cetakan","Buka file dokumen","Nyalakan printer","Klik Print","Pilih ukuran kertas"],
    correct:[2,1,4,3,0] },
  { badge:"Sedang", story:"Robot mau login ke website. Urutkan algoritmanya.",
    steps:["Masuk ke halaman utama","Ketik password","Ketik username","Klik tombol Login","Buka website-nya dulu"],
    correct:[4,2,1,3,0] },
  { badge:"Sedang", story:"Robot mau menyimpan file di komputer. Urutkan caranya.",
    steps:["Klik Save","Tulis isi file","Pilih folder tujuan","Buka aplikasi teks","Beri nama file"],
    correct:[3,1,2,4,0] },
  { badge:"Sedang", story:"Robot mau menginstal aplikasi di HP. Urutkan algoritmanya.",
    steps:["Buka aplikasinya","Klik Instal","Cari nama aplikasi","Tunggu proses selesai","Buka Play Store"],
    correct:[4,2,1,3,0] },
  { badge:"Sedang", story:"Programmer mau menjalankan program pertamanya. Urutkan langkahnya.",
    steps:["Klik Run / Jalankan","Buka aplikasi coding","Periksa jika ada error","Tulis kode programnya","Buat file baru"],
    correct:[1,4,3,0,2] },
  { badge:"Susah", story:"Robot mau memperbaiki program yang error (debugging). Urutkan langkahnya.",
    steps:["Jalankan ulang program","Cari baris yang error","Baca pesan errornya","Perbaiki kodenya","Jalankan program pertama kali"],
    correct:[4,2,1,3,0] },
  { badge:"Susah", story:"Tim robot mau membuat aplikasi baru. Urutkan tahapan pembuatannya.",
    steps:["Rilis ke pengguna","Desain tampilan UI","Rencanakan fitur","Tulis kode program","Testing / Uji coba"],
    correct:[2,1,3,4,0] },
];

var seqLv=0, seqOrd=[], seqPts=0, seqTries=0;

function initSequence() { seqLv=0; seqPts=0; renderSeq(); }

function renderSeq() {
  var lv=SEQ_LEVELS[seqLv];
  seqOrd=shuffle([0,1,2,3,4].slice(0,lv.steps.length));
  seqTries=0;
  setGameScore(seqPts,"sequence");
  setProgress(seqLv,SEQ_LEVELS.length,"sequence");
  animateBody();
  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
    '<div class="q-scene">'+lv.story+'</div>'+
    '<p style="font-size:11px;color:var(--muted);font-family:var(--f-mono);margin-bottom:12px;">Gunakan tombol ↑ ↓ untuk mengubah urutan</p>'+
    '<div class="seq-list" id="seq-list"></div>'+
    '<div class="check-row">'+
      '<div class="q-fb" id="seq-fb"></div>'+
      '<button class="btn-check" onclick="checkSeq()">Cek Jawaban ✓</button>'+
    '</div>'+
    '<div class="q-info">Soal '+(seqLv+1)+' dari '+SEQ_LEVELS.length+' &nbsp;·&nbsp; Poin: <strong>'+seqPts+'</strong></div>'
  );
  renderSeqList();
}

function renderSeqList() {
  var lv=SEQ_LEVELS[seqLv], rows="";
  for(var p=0;p<seqOrd.length;p++){
    var si=seqOrd[p];
    rows+='<div class="seq-item" id="si'+p+'">'+
      '<span class="seq-num">'+(p+1)+'</span>'+
      '<span class="seq-text">'+lv.steps[si]+'</span>'+
      '<div class="seq-ctls">'+
        '<button class="btn-mv" onclick="seqMv('+p+',-1)" '+(p===0?"disabled":"")+'>↑</button>'+
        '<button class="btn-mv" onclick="seqMv('+p+',1)"  '+(p===seqOrd.length-1?"disabled":"")+'>↓</button>'+
      '</div></div>';
  }
  setH("seq-list",rows);
}

function seqMv(pos,dir) {
  var t=pos+dir; if(t<0||t>=seqOrd.length)return;
  var tmp=seqOrd[pos];seqOrd[pos]=seqOrd[t];seqOrd[t]=tmp;
  document.querySelectorAll(".seq-item").forEach(function(el){el.classList.remove("correct","wrong");});
  var fb=$("seq-fb"); fb.textContent=""; fb.className="q-fb";
  renderSeqList();
}

function checkSeq() {
  var lv=SEQ_LEVELS[seqLv];
  var ok=seqOrd.every(function(v,i){return v===lv.correct[i];});
  seqTries++;
  document.querySelectorAll(".seq-item").forEach(function(el){
    el.classList.remove("correct","wrong"); el.classList.add(ok?"correct":"wrong");
  });
  var fb=$("seq-fb");
  if(ok){
    var pts=seqTries===1?20:seqTries===2?15:10;
    seqPts+=pts;
    fb.textContent="Benar! +"+pts+" poin 🎉"; fb.className="q-fb ok";
    setGameScore(seqPts,"sequence");
    flashOverlay(true, function(){
      if(seqLv>=SEQ_LEVELS.length-1){showResult("sequence",seqPts);}
      else{seqLv++;renderSeq();}
    });
  } else {
    fb.textContent="Urutan belum tepat, coba lagi!"; fb.className="q-fb err";
    flashOverlay(false, function(){
      document.querySelectorAll(".seq-item").forEach(function(el){el.classList.remove("wrong");});
      fb.textContent=""; fb.className="q-fb";
    });
  }
}


/* ══════════════════════════════════════════════════════
   GAME 2 — PERCABANGAN
══════════════════════════════════════════════════════ */
var IF_LEVELS = [
  { badge:"Mudah", situation:"Hari ini hujan dan Dino punya payung.",
    rules:[{c:"ci",t:"if hujan and punya_payung:"},{c:"ct",t:"    berangkat_sekolah()"},{c:"ce",t:"else:"},{c:"ct",t:"    tunggu_di_rumah()"}],
    q:"Fungsi apa yang dipanggil?", opts:["berangkat_sekolah()","tunggu_di_rumah()","tidur()","pergi_belanja()"],
    correct:0, hint:"hujan = True DAN punya_payung = True → kondisi AND terpenuhi." },
  { badge:"Mudah", situation:"Nilai ulangan Sari adalah 60. Nilai lulus = 70.",
    rules:[{c:"ci",t:"if nilai >= 70:"},{c:"ct",t:"    print('LULUS')"},{c:"ce",t:"else:"},{c:"ct",t:"    print('BELAJAR LAGI')"}],
    q:"Apa yang dicetak?", opts:["'LULUS'","'BELAJAR LAGI'","Tidak ada output","Error"],
    correct:1, hint:"60 >= 70 adalah False → masuk blok else." },
  { badge:"Mudah", situation:"Baterai robot = 5%. Charger tersedia.",
    rules:[{c:"ci",t:"if baterai < 20:"},{c:"ct",t:"    mulai_charge()"},{c:"ce",t:"else:"},{c:"ct",t:"    lanjut_kerja()"}],
    q:"Fungsi apa yang dipanggil?", opts:["mulai_charge()","lanjut_kerja()","shutdown()","restart()"],
    correct:0, hint:"5 < 20 adalah True → masuk blok if." },
  { badge:"Mudah", situation:"angka = 8. Robot mengecek: genap atau ganjil?",
    rules:[{c:"ci",t:"if angka % 2 == 0:"},{c:"ct",t:"    print('GENAP')"},{c:"ce",t:"else:"},{c:"ct",t:"    print('GANJIL')"}],
    q:"Apa yang dicetak?", opts:["'GENAP'","'GANJIL'","'TIDAK TAHU'","Error"],
    correct:0, hint:"8 % 2 = 0 → True → GENAP." },
  { badge:"Sedang", situation:"lapar = True,  ada_makanan = False.",
    rules:[{c:"ci",t:"if lapar and ada_makanan:"},{c:"ct",t:"    makan_di_rumah()"},{c:"ce",t:"else:"},{c:"ct",t:"    beli_di_warung()"}],
    q:"Fungsi apa yang dipanggil?", opts:["makan_di_rumah()","beli_di_warung()","tidur()","telepon_teman()"],
    correct:1, hint:"AND butuh keduanya True. True and False = False → masuk else." },
  { badge:"Sedang", situation:"ada_uang = True,  hari_sabtu = True.",
    rules:[{c:"ci",t:"if ada_uang or hari_sabtu:"},{c:"ct",t:"    beli_es_krim()"},{c:"ce",t:"else:"},{c:"ct",t:"    pulang_saja()"}],
    q:"Fungsi apa yang dipanggil?", opts:["beli_es_krim()","pulang_saja()","menabung()","nunggu_besok()"],
    correct:0, hint:"OR cukup satu True. True or True = True → masuk if." },
  { badge:"Sedang", situation:"input_password = 'abc123',  password_benar = 'abc123'.",
    rules:[{c:"ci",t:"if input_password == password_benar:"},{c:"ct",t:"    akses_diberikan()"},{c:"ce",t:"else:"},{c:"ct",t:"    akses_ditolak()"}],
    q:"Fungsi apa yang dipanggil?", opts:["akses_diberikan()","akses_ditolak()","coba_lagi()","error()"],
    correct:0, hint:"'abc123' == 'abc123' → True → akses_diberikan()." },
  { badge:"Sedang", situation:"a = 10,  b = 20.",
    rules:[{c:"ci",t:"if a > b:"},{c:"ct",t:"    print('a lebih besar')"},{c:"ce",t:"else:"},{c:"ct",t:"    print('b lebih besar')"}],
    q:"Apa yang dicetak?", opts:["'a lebih besar'","'b lebih besar'","'sama besar'","Tidak ada output"],
    correct:1, hint:"10 > 20 adalah False → masuk else." },
  { badge:"Susah", situation:"suhu = 35,  kipas_rusak = True.",
    rules:[{c:"ci",t:"if suhu > 30 and kipas_rusak:"},{c:"ct",t:"    nyalakan_AC()"},{c:"ce2",t:"elif suhu > 30:"},{c:"ct",t:"    nyalakan_kipas()"},{c:"ce",t:"else:"},{c:"ct",t:"    tidak_perlu_apa()"}],
    q:"Fungsi apa yang dipanggil?", opts:["nyalakan_AC()","nyalakan_kipas()","tidak_perlu_apa()","Error"],
    correct:0, hint:"35>30=True AND kipas_rusak=True → kondisi if pertama terpenuhi." },
  { badge:"Susah", situation:"nilai = 85.",
    rules:[{c:"ci",t:"if nilai >= 90:"},{c:"ct",t:"    grade = 'A'"},{c:"ce2",t:"elif nilai >= 75:"},{c:"ct",t:"    grade = 'B'"},{c:"ce",t:"else:"},{c:"ct",t:"    grade = 'C'"}],
    q:"Nilai grade yang tersimpan adalah?", opts:["Grade A","Grade B","Grade C","Tidak ada grade"],
    correct:1, hint:"85 >= 90 → False. 85 >= 75 → True → grade = 'B'." },
];

var ifLv=0, ifPts=0;

function initIfElse() { ifLv=0; ifPts=0; renderIf(); }

function renderIf() {
  var lv=IF_LEVELS[ifLv];
  setGameScore(ifPts,"ifelse");
  setProgress(ifLv,IF_LEVELS.length,"ifelse");
  animateBody();
  var code=""; lv.rules.forEach(function(r){code+='<span class="'+r.c+'">'+r.t+'</span>\n';});
  var opts=""; lv.opts.forEach(function(o,i){opts+='<button class="btn-opt" id="io'+i+'" onclick="checkIf('+i+')">'+o+'</button>';});
  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
    '<div class="q-scene">'+lv.situation+'</div>'+
    '<div class="code-block"><pre>'+code+'</pre></div>'+
    '<div class="q-hint">💡 '+lv.hint+'</div>'+
    '<div class="q-label">'+lv.q+'</div>'+
    '<div class="opts-grid">'+opts+'</div>'+
    '<div class="q-fb" id="if-fb" style="margin-top:14px"></div>'+
    '<div class="q-info">Soal '+(ifLv+1)+' dari '+IF_LEVELS.length+' &nbsp;·&nbsp; Poin: <strong>'+ifPts+'</strong></div>'
  );
}

function checkIf(idx) {
  var lv=IF_LEVELS[ifLv], ok=idx===lv.correct;
  document.querySelectorAll(".btn-opt").forEach(function(b){b.disabled=true;});
  document.getElementById("io"+idx).classList.add(ok?"correct":"wrong");
  if(!ok) document.getElementById("io"+lv.correct).classList.add("reveal");
  var fb=$("if-fb");
  if(ok){
    ifPts+=20; fb.textContent="Benar! +20 poin 🎉"; fb.className="q-fb ok";
    setGameScore(ifPts,"ifelse");
    flashOverlay(true,function(){
      if(ifLv>=IF_LEVELS.length-1){showResult("ifelse",ifPts);}
      else{ifLv++;renderIf();}
    });
  } else {
    fb.textContent="Kurang tepat — jawaban benar sudah ditandai."; fb.className="q-fb err";
    flashOverlay(false,function(){
      if(ifLv>=IF_LEVELS.length-1){showResult("ifelse",ifPts);}
      else{setTimeout(function(){ifLv++;renderIf();},500);}
    });
  }
}


/* ══════════════════════════════════════════════════════
   GAME 3 — POLA & PERULANGAN
══════════════════════════════════════════════════════ */
var PAT_LEVELS = [
  { badge:"Mudah", sit:"Ibu menata buah di meja setiap pagi:", pattern:["🍎","🍌","🍎","🍌","🍎","?"],
    q:"Buah ke-6 adalah?", opts:["Apel","Pisang","Jeruk","Anggur"], correct:1, hint:"Pola: apel-pisang bergantian. Posisi genap = pisang." },
  { badge:"Mudah", sit:"Robot mencetak teks berulang:",
    code:[{c:"cl",t:"for i in range(4):"},{c:"ca",t:"    print('Halo')"}],
    q:"Berapa kali 'Halo' dicetak?", opts:["2 kali","3 kali","4 kali","5 kali"], correct:2, hint:"range(4) → loop berjalan 4 kali." },
  { badge:"Mudah", sit:"Robot menghitung mundur:",
    code:[{c:"cl",t:"i = 5"},{c:"cl",t:"while i > 0:"},{c:"ca",t:"    print(i)"},{c:"ca",t:"    i = i - 1"}],
    q:"Angka apa saja yang dicetak?", opts:["5,4,3,2,1","1,2,3,4,5","5,4,3,2,1,0","4,3,2,1,0"], correct:0, hint:"Mulai i=5, kurang 1 tiap putaran. Berhenti saat i=0 (tidak dicetak)." },
  { badge:"Mudah", sit:"Robot menyiram tanaman selama 7 hari:",
    code:[{c:"cl",t:"for hari in range(7):"},{c:"ca",t:"    siram_tanaman()"}],
    q:"Total siram_tanaman() dipanggil berapa kali?", opts:["5 kali","6 kali","7 kali","8 kali"], correct:2, hint:"range(7) → 7 iterasi → fungsi dipanggil 7 kali." },
  { badge:"Sedang", sit:"Riko menghias kelas dengan bendera warna-warni:", pattern:["🟥","🟨","🟦","🟥","🟨","🟦","🟥","?"],
    q:"Bendera ke-8 warnanya apa?", opts:["Merah","Kuning","Biru","Hijau"], correct:1, hint:"Pola 3 warna. 8 % 3 = 2 → urutan ke-2 (mulai 0) = Kuning." },
  { badge:"Sedang", sit:"Robot menjumlahkan angka 1 sampai 5:",
    code:[{c:"cl",t:"total = 0"},{c:"cl",t:"for i in range(1, 6):"},{c:"ca",t:"    total = total + i"}],
    q:"Nilai total di akhir loop?", opts:["10","15","20","25"], correct:1, hint:"1+2+3+4+5 = 15." },
  { badge:"Sedang", sit:"Robot mencetak segitiga bintang:",
    code:[{c:"cl",t:"for i in range(1, 5):"},{c:"ca",t:"    print('*' * i)"}],
    q:"Baris ke-3 ada berapa bintang?", opts:["1 bintang","2 bintang","3 bintang","4 bintang"], correct:2, hint:"i=3 → print('*' * 3) → mencetak ***." },
  { badge:"Sedang", sit:"Robot mencari nilai terbesar dari [3, 7, 2, 9, 5]:",
    code:[{c:"cl",t:"maks = 0"},{c:"cl",t:"for angka in [3, 7, 2, 9, 5]:"},{c:"ci",t:"    if angka > maks:"},{c:"ca",t:"        maks = angka"}],
    q:"Nilai maks di akhir loop?", opts:["3","7","5","9"], correct:3, hint:"Loop memeriksa satu per satu. Nilai terbesar = 9." },
  { badge:"Susah", sit:"Robot mencuci piring — 2 rak, tiap rak 4 piring:",
    code:[{c:"cl",t:"for rak in range(2):"},{c:"cl2",t:"    for piring in range(4):"},{c:"ca",t:"        cuci_piring()"}],
    q:"Total cuci_piring() dipanggil berapa kali?", opts:["4 kali","6 kali","8 kali","10 kali"], correct:2, hint:"Loop bersarang: 2 × 4 = 8 pemanggilan." },
  { badge:"Susah", sit:"Robot mencetak tabel perkalian 3:",
    code:[{c:"cl",t:"for i in range(1, 6):"},{c:"ca",t:"    print(3 * i)"}],
    q:"Angka ke-4 yang dicetak adalah?", opts:["9","12","15","16"], correct:1, hint:"i=1→3, i=2→6, i=3→9, i=4→12." },
];

var patLv=0, patPts=0;

function initPattern() { patLv=0; patPts=0; renderPat(); }

function renderPat() {
  var lv=PAT_LEVELS[patLv];
  setGameScore(patPts,"pattern");
  setProgress(patLv,PAT_LEVELS.length,"pattern");
  animateBody();
  var visual="";
  if(lv.pattern){
    var cells=""; lv.pattern.forEach(function(e){cells+='<div class="pat-cell '+(e==="?"?"unknown":"")+'">'+(e==="?"?"?":e)+'</div>';});
    visual='<div class="pat-row">'+cells+'</div>';
  }
  if(lv.code){
    var lines=""; lv.code.forEach(function(l){lines+='<span class="'+l.c+'">'+l.t+'</span>\n';});
    visual='<div class="code-block"><pre>'+lines+'</pre></div>';
  }
  var opts=""; lv.opts.forEach(function(o,i){opts+='<button class="btn-opt" id="po'+i+'" onclick="checkPat('+i+')">'+o+'</button>';});
  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
    '<div class="q-scene">'+lv.sit+'</div>'+
    visual+
    '<div class="q-hint">💡 '+lv.hint+'</div>'+
    '<div class="q-label">'+lv.q+'</div>'+
    '<div class="opts-grid">'+opts+'</div>'+
    '<div class="q-fb" id="pat-fb" style="margin-top:14px"></div>'+
    '<div class="q-info">Soal '+(patLv+1)+' dari '+PAT_LEVELS.length+' &nbsp;·&nbsp; Poin: <strong>'+patPts+'</strong></div>'
  );
}

function checkPat(idx) {
  var lv=PAT_LEVELS[patLv], ok=idx===lv.correct;
  document.querySelectorAll(".btn-opt").forEach(function(b){b.disabled=true;});
  document.getElementById("po"+idx).classList.add(ok?"correct":"wrong");
  if(!ok) document.getElementById("po"+lv.correct).classList.add("reveal");
  var fb=$("pat-fb");
  if(ok){
    patPts+=20; fb.textContent="Benar! +20 poin 🎉"; fb.className="q-fb ok";
    setGameScore(patPts,"pattern");
    flashOverlay(true,function(){
      if(patLv>=PAT_LEVELS.length-1){showResult("pattern",patPts);}
      else{patLv++;renderPat();}
    });
  } else {
    fb.textContent="Kurang tepat — jawaban benar sudah ditandai."; fb.className="q-fb err";
    flashOverlay(false,function(){
      if(patLv>=PAT_LEVELS.length-1){showResult("pattern",patPts);}
      else{setTimeout(function(){patLv++;renderPat();},500);}
    });
  }
}


/* ══════════════════════════════════════════════════════
   GAME 4 — KETIK KODENYA!
   Tampilkan contoh kode, user ketik versi baru sesuai soal
══════════════════════════════════════════════════════ */
var TYP_LEVELS = [
  // ── 1 ──
  { badge:"Mudah",
    task:"Contoh kode mencetak 'Selamat Pagi'. Sekarang tulis kode untuk mencetak 'Selamat Malam'.",
    example: 'print("Selamat Pagi")',
    answer:  'print("Selamat Malam")',
    hint:"Ganti teks di dalam tanda kutip.",
  },
  // ── 2 ──
  { badge:"Mudah",
    task:"Contoh mengecek apakah x = 5. Sekarang tulis kode untuk mengecek apakah x = 10.",
    example: 'if x == 5:\n    print("x adalah lima")',
    answer:  'if x == 10:\n    print("x adalah sepuluh")',
    hint:"Ganti angkanya dan teksnya.",
  },
  // ── 3 ──
  { badge:"Mudah",
    task:"Contoh mencetak angka 1 sampai 3. Sekarang tulis kode untuk mencetak angka 1 sampai 5.",
    example: 'for i in range(1, 4):\n    print(i)',
    answer:  'for i in range(1, 6):\n    print(i)',
    hint:"range(1, 4) menghasilkan 1,2,3. Untuk 1 sampai 5, gunakan range(1, 6).",
  },
  // ── 4 ──
  { badge:"Mudah",
    task:"Contoh menyapa dengan nama 'Budi'. Sekarang tulis kode untuk menyapa nama 'Sari'.",
    example: 'nama = "Budi"\nprint("Halo, " + nama)',
    answer:  'nama = "Sari"\nprint("Halo, " + nama)',
    hint:"Ganti nilai variabel nama menjadi 'Sari'.",
  },
  // ── 5 ──
  { badge:"Sedang",
    task:"Contoh mengecek nilai 80 lulus atau tidak (batas lulus 70). Sekarang tulis kode untuk nilai 65.",
    example: 'nilai = 80\nif nilai >= 70:\n    print("Lulus")\nelse:\n    print("Tidak Lulus")',
    answer:  'nilai = 65\nif nilai >= 70:\n    print("Lulus")\nelse:\n    print("Tidak Lulus")',
    hint:"Hanya ubah angka nilainya saja, kondisi if-else tetap sama.",
  },
  // ── 6 ──
  { badge:"Sedang",
    task:"Contoh menghitung perkalian 3 hingga 3 kali. Sekarang tulis kode untuk perkalian 5 hingga 4 kali.",
    example: 'for i in range(1, 4):\n    print(3 * i)',
    answer:  'for i in range(1, 5):\n    print(5 * i)',
    hint:"Ganti angka pengali (3→5) dan batas range (4→5).",
  },
  // ── 7 ──
  { badge:"Sedang",
    task:"Contoh menambahkan angka ke list buah. Sekarang tulis kode untuk menambahkan 'mangga' ke list buah.",
    example: 'buah = ["apel", "pisang"]\nbuah.append("jeruk")\nprint(buah)',
    answer:  'buah = ["apel", "pisang"]\nbuah.append("mangga")\nprint(buah)',
    hint:"Hanya ganti teks di dalam append().",
  },
  // ── 8 ──
  { badge:"Susah",
    task:"Contoh fungsi menyapa siang. Sekarang tulis fungsi 'sapa_malam' yang mencetak 'Selamat malam, semuanya!'.",
    example: 'def sapa_siang():\n    print("Selamat siang, semuanya!")\n\nsapa_siang()',
    answer:  'def sapa_malam():\n    print("Selamat malam, semuanya!")\n\nsapa_malam()',
    hint:"Ganti nama fungsi (sapa_siang→sapa_malam) dan teks di dalam print.",
  },
];

var typLv=0, typPts=0;
var typTotalLv = TYP_LEVELS.length;

function initTyping() { typLv=0; typPts=0; renderTyp(); }

function renderTyp() {
  var lv = TYP_LEVELS[typLv];
  setGameScore(typPts,"typing");
  setProgress(typLv, typTotalLv, "typing");
  animateBody();

  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+

    // Contoh kode
    '<div class="typing-example">'+
      '<div class="typing-example-label">Contoh Kode</div>'+
      '<pre>'+escapeHTML(lv.example)+'</pre>'+
    '</div>'+

    // Tugas
    '<div class="typing-task">'+
      '<div class="typing-task-label">Tugasmu</div>'+
      '<div class="typing-task-text">'+lv.task+'</div>'+
    '</div>'+

    // Input
    '<div class="typing-input-wrap">'+
      '<textarea id="typ-input" class="typing-input" placeholder="Ketik kode kamu di sini..." spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>'+
    '</div>'+
    '<div class="typing-hint-row">💡 '+lv.hint+'</div>'+
    '<button class="btn-submit" onclick="checkTyp()">Periksa Kode ✓</button>'+
    '<div class="typing-fb" id="typ-fb"></div>'+

    // Reveal jawaban
    '<div class="typing-answer-reveal" id="typ-reveal">'+
      '<div class="typing-answer-label">Jawaban yang benar</div>'+
      '<div class="typing-answer-code" id="typ-answer-code"></div>'+
    '</div>'+

    '<div class="q-info">Soal '+(typLv+1)+' dari '+typTotalLv+' &nbsp;·&nbsp; Poin: <strong>'+typPts+'</strong></div>'
  );

  // Auto focus
  setTimeout(function(){ var inp=$("typ-input"); if(inp) inp.focus(); }, 100);
}

function escapeHTML(str) {
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function normalizeCode(str) {
  // normalize: lowercase, collapse spaces, trim each line
  return str.split("\n")
    .map(function(l){ return l.trim(); })
    .filter(function(l){ return l.length > 0; })
    .join("\n")
    .toLowerCase()
    .replace(/\s+/g," ");
}

function checkTyp() {
  var lv   = TYP_LEVELS[typLv];
  var inp  = $("typ-input");
  var val  = inp.value;
  var ok   = normalizeCode(val) === normalizeCode(lv.answer);
  var fb   = $("typ-fb");
  var rev  = $("typ-reveal");

  // disable submit
  document.querySelector(".btn-submit").disabled = true;

  inp.classList.remove("correct-input","wrong-input");
  inp.classList.add(ok ? "correct-input" : "wrong-input");

  if(ok) {
    typPts += 20;
    fb.textContent = "Kode benar! +20 poin 🎉";
    fb.className   = "typing-fb ok";
    setGameScore(typPts,"typing");
    flashOverlay(true, function(){
      if(typLv >= typTotalLv-1){ showResult("typing",typPts); }
      else { typLv++; renderTyp(); }
    });
  } else {
    fb.textContent = "Belum tepat. Lihat jawaban yang benar di bawah.";
    fb.className   = "typing-fb err";
    rev.classList.add("show");
    $("typ-answer-code").textContent = lv.answer;
    flashOverlay(false, function(){
      setTimeout(function(){
        if(typLv >= typTotalLv-1){ showResult("typing",typPts); }
        else { typLv++; renderTyp(); }
      }, 2000);
    });
  }
}