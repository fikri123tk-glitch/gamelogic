/* ═══════════════════════════════════════════════════════
   app.js — CoderKid  |  4 Games  |  Vanilla JS
═══════════════════════════════════════════════════════ */

/* ── Avatar pick (shared) ────────────────────────────── */
var AVATARS = ["🐱","🐶","🐸","🦊","🐼","🐨","🦁","🐯"];
var MY_AVATAR = AVATARS[Math.floor(Math.random() * AVATARS.length)];
document.getElementById("home-avatar").textContent = MY_AVATAR;

/* ── Background Canvas Animation ─────────────────────── */
(function() {
  var canvas = document.getElementById("bg-canvas");
  var ctx    = canvas.getContext("2d");
  var W, H;
  var symbols = ["if","for","{}","=>","01","++","//","()","[]","!=","==","while","true","false","print"];
  // Brighter, more visible colors
  var COLORS = ["#3B82F6AA","#8B5CF6AA","#10B981AA","#FF6B35AA","#F59E0BAA","#EC4899AA"];
  var particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeSymParticle() {
    return {
      type: "sym",
      x:    Math.random() * W,
      y:    H + 20,
      sym:  symbols[Math.floor(Math.random() * symbols.length)],
      col:  COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 14 + Math.random() * 14,
      vx:   (Math.random() - 0.5) * 0.7,
      vy:   -(0.5 + Math.random() * 0.7),
      op:   0.35 + Math.random() * 0.45,
      rot:  Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.01,
    };
  }

  function makeAvatarParticle() {
    return {
      type: "avatar",
      x:    Math.random() * W,
      y:    H + 60,
      sym:  MY_AVATAR,
      size: 32 + Math.random() * 28,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:   -(0.25 + Math.random() * 0.35),
      op:   0.22 + Math.random() * 0.22,
      rot:  (Math.random() - 0.5) * 0.3,
      vrot: (Math.random() - 0.5) * 0.005,
      scale: 0.9 + Math.random() * 0.3,
    };
  }

  function init() {
    resize();
    particles = [];
    // 40 symbol particles
    for (var i = 0; i < 40; i++) {
      var p = makeSymParticle();
      p.y = Math.random() * H; // scatter on load
      particles.push(p);
    }
    // 10 avatar particles
    for (var j = 0; j < 10; j++) {
      var a = makeAvatarParticle();
      a.y = Math.random() * H;
      particles.push(a);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(function(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.op;

      if (p.type === "sym") {
        ctx.font = "700 " + p.size + "px 'JetBrains Mono', monospace";
        ctx.fillStyle = p.col;
        ctx.fillText(p.sym, 0, 0);
      } else {
        // avatar emoji — draw with emoji font, slightly scaled
        ctx.font = p.size + "px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.sym, 0, 0);
      }
      ctx.restore();

      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.vrot;

      if (p.y < -80) {
        if (p.type === "sym") {
          Object.assign(p, makeSymParticle());
        } else {
          Object.assign(p, makeAvatarParticle());
        }
      }
      if (p.x < -80)  p.x = W + 20;
      if (p.x > W+80) p.x = -20;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", function(){ resize(); });
  init();
  draw();
})();

/* ── State ───────────────────────────────────────────── */
var GS = {
  scores:    {sequence:0, robot:0, pattern:0, typing:0},
  completed: {sequence:false, robot:false, pattern:false, typing:false},
  active: null,
};
var META = {
  sequence: {title:"Urutan Perintah",   icon:"📋", color:"var(--orange)", shadow:"var(--orange-d)"},
  robot:    {title:"Gerak Robot",       icon:"🤖", color:"var(--blue)",   shadow:"var(--blue-d)"},
  pattern:  {title:"Pola & Perulangan", icon:"🔄", color:"var(--purple)", shadow:"var(--purple-d)"},
  typing:   {title:"Ketik Kodenya!",    icon:"⌨️", color:"var(--green)",  shadow:"var(--green-d)"},
};

/* ── Helpers ─────────────────────────────────────────── */
function $$(id) { return document.getElementById(id); }
function setH(id, h) { $$(id).innerHTML = h; }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  $$(id).classList.add("active");
  window.scrollTo(0, 0);
}

function chipCls(b) {
  return b==="Mudah"?"easy": b==="Sedang"?"medium":"hard";
}

function lvCount(id) {
  return id==="sequence"?SEQ_LV.length:id==="robot"?ROBOT_LV.length:id==="pattern"?PAT_LV.length:TYP_LV.length;
}

function animBody() {
  var el = $$("game-body");
  el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
}

function setScore(n, id) {
  var pill = $$("score-pill");
  pill.textContent  = "🏆 " + n;
  pill.style.background = META[id].color;
  pill.classList.remove("bump");
  void pill.offsetWidth;
  pill.classList.add("bump");
}

function setProg(cur, tot, id) {
  $$("game-prog").style.width      = Math.round(cur/tot*100)+"%";
  $$("game-prog").style.background = META[id].color;
  $$("nav-sub").textContent = "Soal " + (cur+1) + " dari " + tot;
}

function flash(ok, cb) {
  var el = ok ? $$("ov-correct") : $$("ov-wrong");
  el.classList.remove("hidden");
  setTimeout(function(){ el.classList.add("hidden"); if(cb) cb(); }, 800);
}

function goHome() { refreshHome(); showScreen("screen-home"); }

function refreshHome() {
  var total = 0, done = 0;
  ["sequence","robot","pattern","typing"].forEach(function(id){
    total += GS.scores[id];
    if(GS.completed[id]) done++;
  });
  $$("total-score").textContent     = total;
  $$("completed-count").textContent = done + "/4";
  $$("all-done-msg").classList.toggle("hidden", done < 4);
  ["sequence","robot","pattern","typing"].forEach(function(id){
    var isDone = GS.completed[id];
    $$("done-"+id).classList.toggle("hidden", !isDone);
    $$("prog-"+id).style.width    = isDone?"100%":"0%";
    $$("meta-"+id).textContent    = lvCount(id)+" soal" + (isDone?" · Skor: "+GS.scores[id]:"");
    $$("btn-"+id).textContent     = isDone?"🔁 Ulang":"Mulai";
  });
}

function startGame(id) {
  GS.active = id;
  $$("nav-icon").textContent  = META[id].icon;
  $$("nav-title").textContent = META[id].title;
  $$("score-pill").style.background = META[id].color;
  $$("score-pill").textContent = "🏆 0";
  showScreen("screen-game");
  if(id==="sequence") initSeq();
  if(id==="robot")    initRobot();
  if(id==="pattern")  initPat();
  if(id==="typing")   initTyp();
}

function showResult(id, score) {
  GS.scores[id] = score; GS.completed[id] = true;
  var maxP = lvCount(id) * 20;
  var pct  = Math.round(score/maxP*100);
  var emoji = pct>=80?"🏆":pct>=50?"😊":"💪";
  var total = Object.values(GS.scores).reduce(function(a,b){return a+b;},0);
  var done  = Object.values(GS.completed).filter(Boolean).length;

  $$("res-emoji").textContent = emoji;
  $$("res-title").textContent = pct>=80?"Hebat sekali!":pct>=50?"Bagus!":"Terus latihan!";
  $$("res-game").textContent  = META[id].icon+" "+META[id].title;
  $$("res-pts").textContent   = score;
  $$("res-pts").style.color   = META[id].color;
  $$("res-acc").textContent   = "Akurasi "+pct+"% · Skor maks "+maxP+" poin";
  $$("rbtn-again").style.background = META[id].color;
  $$("rbtn-again").style.boxShadow  = "0 4px 0 "+META[id].shadow;
  var allEl = $$("res-alldone");
  if(done>=4){ allEl.classList.remove("hidden"); allEl.innerHTML="🌟 Semua game selesai! Total: <strong>"+total+"</strong> poin"; }
  else allEl.classList.add("hidden");
  showScreen("screen-result");
}

function playAgain() { startGame(GS.active); }


/* ═══════════════════════════════════════════════════════
   GAME 1 — URUTAN PERINTAH  (drag & drop, 10 soal)
═══════════════════════════════════════════════════════ */
var SEQ_LV = [
  { badge:"Mudah", story:"Siti mau makan siang. Urutkan langkahnya!",
    steps:["Cuci tangan","Ambil piring","Makan","Duduk di meja","Bersyukur"], correct:[0,1,3,2,4] },
  { badge:"Mudah", story:"Robot mau menyalakan komputer. Urutkan caranya!",
    steps:["Klik ikon aplikasi","Tekan tombol power","Tunggu loading","Login dengan password"], correct:[1,2,3,0] },
  { badge:"Mudah", story:"Budi mau mengirim foto ke teman. Urutkan langkahnya!",
    steps:["Klik Kirim","Buka aplikasi chat","Pilih foto","Pilih teman"], correct:[1,3,2,0] },
  { badge:"Mudah", story:"Robot mau mandi. Urutkan langkahnya!",
    steps:["Keringkan badan","Buka kran air","Sabuni badan","Bilas dengan air"], correct:[1,2,3,0] },
  { badge:"Sedang", story:"Tina mau membuat mie instan. Urutkan caranya!",
    steps:["Makan mie-nya","Rebus air dulu","Masukkan mie ke air mendidih","Tiriskan & beri bumbu","Siapkan mangkuk"], correct:[1,2,3,4,0] },
  { badge:"Sedang", story:"Robot mau mendownload aplikasi. Urutkan langkahnya!",
    steps:["Buka aplikasinya","Buka Play Store","Tunggu download","Klik Install","Cari nama aplikasi"], correct:[1,4,3,0,2] },
  { badge:"Sedang", story:"Programmer mau membuat website. Urutkan prosesnya!",
    steps:["Upload ke internet","Tulis kode HTML","Desain tampilan dulu","Cek di browser","Rencanakan isinya"], correct:[4,2,1,3,0] },
  { badge:"Sedang", story:"Riko mau mencetak dokumen. Urutkan caranya!",
    steps:["Ambil hasil print","Buka file dokumen","Klik Print","Nyalakan printer","Pilih jumlah halaman"], correct:[3,1,4,2,0] },
  { badge:"Susah", story:"Robot mau mengirim email. Urutkan algoritmanya!",
    steps:["Klik Kirim","Buka Gmail","Tulis isi pesan","Tulis alamat email tujuan","Klik Tulis Pesan","Tulis subjek"], correct:[1,4,3,5,2,0] },
  { badge:"Susah", story:"Tim mau membuat aplikasi dari nol. Urutkan tahapannya!",
    steps:["Testing & perbaikan","Rilis ke pengguna","Rencanakan fitur","Desain tampilan","Tulis kode program"], correct:[2,3,4,0,1] },
];

var seqLv=0, seqPts=0, seqTries=0;
var seqOrder=[], dragSrc=null;

function initSeq() { seqLv=0; seqPts=0; renderSeq(); }

function renderSeq() {
  var lv = SEQ_LV[seqLv];
  seqOrder = lv.steps.map(function(_,i){return i;});
  // shuffle
  for(var i=seqOrder.length-1;i>0;i--){
    var j=Math.floor(Math.random()*(i+1));
    var t=seqOrder[i];seqOrder[i]=seqOrder[j];seqOrder[j]=t;
  }
  seqTries = 0;
  setScore(seqPts,"sequence");
  setProg(seqLv, SEQ_LV.length, "sequence");
  animBody();

  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
    '<div class="q-scene">'+lv.story+'</div>'+
    '<p style="font-size:11.5px;color:var(--muted);font-weight:700;margin-bottom:10px;">Drag kartu untuk mengubah urutan</p>'+
    '<div class="seq-list" id="seq-list"></div>'+
    '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:12px;">'+
      '<div class="q-fb" id="seq-fb"></div>'+
      '<button class="btn-check" id="seq-check-btn" onclick="checkSeq()">Cek Jawaban ✓</button>'+
    '</div>'+
    '<div id="seq-next-row" style="margin-top:10px;"></div>'+
    '<div class="q-info">Soal '+(seqLv+1)+' dari '+SEQ_LV.length+' · Poin: <strong>'+seqPts+'</strong></div>'
  );
  renderSeqList();
}

function renderSeqList() {
  var lv = SEQ_LV[seqLv];
  var list = $$("seq-list");
  list.innerHTML = "";
  seqOrder.forEach(function(si, pos) {
    var el = document.createElement("div");
    el.className   = "seq-item";
    el.draggable   = true;
    el.dataset.pos = pos;
    el.innerHTML   =
      '<span class="seq-handle">⠿</span>'+
      '<span class="seq-num">'+(pos+1)+'</span>'+
      '<span class="seq-text">'+lv.steps[si]+'</span>';

    el.addEventListener("dragstart", function(e){
      dragSrc = pos;
      el.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    el.addEventListener("dragend", function(){
      el.classList.remove("dragging");
      document.querySelectorAll(".seq-item").forEach(function(i){ i.classList.remove("drag-over"); });
    });
    el.addEventListener("dragover", function(e){
      e.preventDefault();
      document.querySelectorAll(".seq-item").forEach(function(i){ i.classList.remove("drag-over"); });
      el.classList.add("drag-over");
    });
    el.addEventListener("drop", function(e){
      e.preventDefault();
      if(dragSrc === null || dragSrc === pos) return;
      var tmp = seqOrder[dragSrc]; seqOrder[dragSrc] = seqOrder[pos]; seqOrder[pos] = tmp;
      document.querySelectorAll(".seq-item").forEach(function(i){ i.classList.remove("correct","wrong"); });
      var fb = $$("seq-fb"); fb.textContent=""; fb.className="q-fb";
      renderSeqList();
    });

    // touch support
    el.addEventListener("touchstart", function(e){ dragSrc = pos; el.classList.add("dragging"); }, {passive:true});
    el.addEventListener("touchend",   function(){ el.classList.remove("dragging"); });

    list.appendChild(el);
  });
}

function checkSeq() {
  var lv = SEQ_LV[seqLv];
  var ok = seqOrder.every(function(v,i){ return v === lv.correct[i]; });
  seqTries++;
  document.querySelectorAll(".seq-item").forEach(function(el){
    el.classList.remove("correct","wrong");
    el.classList.add(ok?"correct":"wrong");
  });
  var fb = $$("seq-fb");
  if(ok) {
    var pts = seqTries===1?20:seqTries===2?15:10;
    seqPts += pts;
    fb.textContent = ""; fb.className="q-fb";
    setScore(seqPts,"sequence");
    var checkBtn = $$("seq-check-btn");
    if(checkBtn) checkBtn.style.display="none";
    var nxtRow = $$("seq-next-row");
    if(nxtRow){
      nxtRow.innerHTML =
        '<div class="answer-box answer-ok">'+
          '<div class="ab-icon">✅</div>'+
          '<div class="ab-title">Urutan sudah benar! +'+pts+' poin</div>'+
          '<div class="ab-explain">Kamu bisa menyusun langkah-langkah dengan benar, seperti cara kerja algoritma! 🤖</div>'+
        '</div>'+
        '<button class="btn-next" style="margin-top:10px" onclick="nextSeq()">'+(seqLv>=SEQ_LV.length-1?"Lihat Hasil 🏆":"Soal Berikutnya →")+'</button>';
    }
    flash(true, null);
  } else {
    fb.textContent = "Urutan belum tepat, coba lagi!"; fb.className="q-fb err";
    flash(false, function(){
      document.querySelectorAll(".seq-item").forEach(function(el){ el.classList.remove("wrong"); });
      fb.textContent=""; fb.className="q-fb";
    });
  }
}

function nextSeq() {
  if(seqLv >= SEQ_LV.length-1) showResult("sequence", seqPts);
  else { seqLv++; renderSeq(); }
}


/* ═══════════════════════════════════════════════════════
   GAME 2 — GERAK ROBOT  (grid navigation, 8 level)
═══════════════════════════════════════════════════════ */
// Grid: 0=empty, 1=wall, R=robot start, G=goal
// Directions: U=up, D=down, L=left, R=right
var ROBOT_LV = [
  { badge:"Mudah", story:"Robot mau ambil bintang! Kasih perintah arahnya.",
    size:3,
    grid:["0","0","0",
          "0","0","0",
          "R","0","G"],
    solution:["R","R"],
  },
  { badge:"Mudah", story:"Robot harus jalan ke atas menuju bintang!",
    size:3,
    grid:["G","0","0",
          "0","0","0",
          "R","0","0"],
    solution:["U","U"],
  },
  { badge:"Mudah", story:"Robot butuh jalan memutar. Kasih 3 perintah!",
    size:3,
    grid:["0","0","G",
          "0","0","0",
          "R","0","0"],
    solution:["U","R","U"],
  },
  { badge:"Mudah", story:"Hati-hati ada tembok! Cari jalan yang benar.",
    size:4,
    grid:["0","0","0","G",
          "0","1","1","0",
          "0","0","0","0",
          "R","0","0","0"],
    solution:["U","R","R","U","U"],
  },
  { badge:"Sedang", story:"Maze lebih panjang! Robot butuh banyak langkah.",
    size:4,
    grid:["0","0","0","G",
          "0","1","0","1",
          "0","1","0","0",
          "R","0","0","0"],
    solution:["U","U","U","R","R","R"],
  },
  { badge:"Sedang", story:"Ada banyak tembok. Pikirkan rutenya dengan hati-hati!",
    size:4,
    grid:["0","G","0","0",
          "0","1","1","0",
          "0","0","1","0",
          "R","0","0","0"],
    solution:["R","R","R","U","U","U","L","L"],
  },
  { badge:"Sedang", story:"Robot harus zig-zag melewati rintangan!",
    size:5,
    grid:["0","0","0","0","G",
          "0","1","1","1","0",
          "0","0","0","1","0",
          "1","1","0","1","0",
          "R","0","0","0","0"],
    solution:["R","R","U","U","U","R","U","R"],
  },
  { badge:"Susah", story:"Level terakhir! Temukan jalur terpendek ke bintang.",
    size:5,
    grid:["0","0","0","0","G",
          "0","1","0","1","0",
          "0","1","0","1","0",
          "0","0","0","0","0",
          "R","1","1","1","0"],
    solution:["R","R","R","R","U","U","U","U"],
  },
];

var robLv=0, robPts=0;
var robPos={r:0,c:0}, robQueue=[], robRunning=false;

function initRobot() { robLv=0; robPts=0; renderRobot(); }

function getRobotStartPos(lv) {
  for(var i=0;i<lv.grid.length;i++){
    if(lv.grid[i]==="R") return {r:Math.floor(i/lv.size), c:i%lv.size};
  }
  return {r:0,c:0};
}
function getGoalPos(lv) {
  for(var i=0;i<lv.grid.length;i++){
    if(lv.grid[i]==="G") return {r:Math.floor(i/lv.size), c:i%lv.size};
  }
  return {r:0,c:0};
}

function renderRobot() {
  var lv = ROBOT_LV[robLv];
  robPos   = getRobotStartPos(lv);
  robQueue = [];
  robRunning = false;
  setScore(robPts,"robot");
  setProg(robLv, ROBOT_LV.length, "robot");
  animBody();

  setH("game-body",
    '<div class="robot-wrap">'+
      '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
      '<div class="robot-scene-card">'+
        '<div class="robot-story">'+lv.story+'</div>'+
        '<div class="robot-grid-wrap"><div class="robot-grid" id="rob-grid" style="grid-template-columns:repeat('+lv.size+',1fr)"></div></div>'+
        '<div class="robot-legend">'+
          '<div class="legend-item"><div class="legend-dot legend-start"></div> Robot</div>'+
          '<div class="legend-item"><div class="legend-dot legend-goal"></div> Tujuan ⭐</div>'+
          '<div class="legend-item"><div class="legend-dot legend-wall"></div> Tembok</div>'+
        '</div>'+
      '</div>'+

      '<div class="cmd-section">'+
        '<div class="cmd-label">Antrian Perintah (klik untuk hapus)</div>'+
        '<div class="cmd-queue" id="cmd-queue"></div>'+
        '<div class="dir-pad" id="dir-pad">'+
          '<button class="dir-btn" data-dir="U" onclick="addCmd(\'U\')">↑</button>'+
          '<button class="dir-btn" data-dir="L" onclick="addCmd(\'L\')">←</button>'+
          '<button class="dir-btn" data-dir="R" onclick="addCmd(\'R\')">→</button>'+
          '<button class="dir-btn" data-dir="D" onclick="addCmd(\'D\')">↓</button>'+
        '</div>'+
      '</div>'+

      '<div class="robot-action-row">'+
        '<button class="btn-run" id="btn-run" onclick="runRobot()">▶ Jalankan Robot!</button>'+
        '<button class="btn-clear" onclick="clearCmds()">🗑 Hapus Semua</button>'+
      '</div>'+
      '<div class="robot-result-msg" id="rob-msg"></div>'+
      '<div class="robot-step-counter" id="rob-steps"></div>'+
      '<div class="q-info">Level '+(robLv+1)+' dari '+ROBOT_LV.length+' · Poin: <strong>'+robPts+'</strong></div>'+
    '</div>'
  );
  drawGrid(lv, robPos, []);
}

function drawGrid(lv, pos, trail) {
  var grid = $$("rob-grid");
  if(!grid) return;
  grid.innerHTML = "";
  var goal = getGoalPos(lv);
  for(var r=0;r<lv.size;r++){
    for(var c=0;c<lv.size;c++){
      var idx  = r*lv.size+c;
      var cell = document.createElement("div");
      cell.className = "cell";
      var isRobot = (pos.r===r && pos.c===c);
      var isGoal  = (goal.r===r && goal.c===c);
      var isWall  = lv.grid[idx]==="1";
      var isTrail = trail.some(function(t){return t.r===r&&t.c===c;});

      if(isRobot)       { cell.classList.add("robot"); cell.textContent="🤖"; }
      else if(isGoal)   { cell.classList.add("goal");  cell.textContent="⭐"; }
      else if(isWall)   { cell.classList.add("wall"); }
      else if(isTrail)  { cell.classList.add("trail"); cell.textContent="·"; }

      grid.appendChild(cell);
    }
  }
}

function addCmd(dir) {
  if(robRunning) return;
  if(robQueue.length >= 20) return;
  robQueue.push(dir);
  renderQueue();
}

function removeCmd(idx) {
  if(robRunning) return;
  robQueue.splice(idx, 1);
  renderQueue();
}

function clearCmds() {
  if(robRunning) return;
  robQueue = [];
  renderQueue();
  var msg = $$("rob-msg");
  if(msg) { msg.className="robot-result-msg"; msg.style.display="none"; }
  var lv = ROBOT_LV[robLv];
  robPos = getRobotStartPos(lv);
  drawGrid(lv, robPos, []);
}

function renderQueue() {
  var qEl = $$("cmd-queue");
  if(!qEl) return;
  var labels = {U:"↑ Atas", D:"↓ Bawah", L:"← Kiri", R:"→ Kanan"};
  qEl.innerHTML = "";
  qEl.classList.toggle("has-cmds", robQueue.length > 0);
  robQueue.forEach(function(d, i){
    var chip = document.createElement("div");
    chip.className   = "cmd-chip";
    chip.innerHTML   = labels[d];
    chip.onclick     = function(){ removeCmd(i); };
    chip.title       = "Klik untuk hapus";
    qEl.appendChild(chip);
  });
  if(robQueue.length===0){
    qEl.innerHTML='<span style="font-family:var(--fm);font-size:11px;color:var(--subtle);">Tekan tombol arah untuk menambah perintah...</span>';
  }
}

function runRobot() {
  if(robRunning || robQueue.length===0) return;
  robRunning = true;
  $$("btn-run").disabled = true;
  var lv    = ROBOT_LV[robLv];
  var goal  = getGoalPos(lv);
  var pos   = {r: robPos.r, c: robPos.c};
  var trail = [];
  var step  = 0;
  var cmds  = robQueue.slice();
  var failed = false;

  function execStep() {
    if(step >= cmds.length) {
      // final check
      var won = (pos.r===goal.r && pos.c===goal.c);
      drawGrid(lv, pos, trail);
      var msg = $$("rob-msg");
      if(won) {
        robPts += 20;
        setScore(robPts,"robot");
        msg.textContent = "🎉 Robot sampai tujuan! +20 poin";
        msg.className   = "robot-result-msg ok";
        flash(true, function(){
          robRunning = false;
          // show next button
          var nxtDiv = document.createElement("div");
          nxtDiv.style.marginTop = "10px";
          nxtDiv.innerHTML = '<button class="btn-next" onclick="nextRobot()">'+(robLv>=ROBOT_LV.length-1?"Lihat Hasil 🏆":"Level Berikutnya →")+'</button>';
          msg.parentNode.insertBefore(nxtDiv, msg.nextSibling);
        });
      } else {
        msg.textContent = "🤖 Robot belum sampai tujuan. Coba lagi!";
        msg.className   = "robot-result-msg err";
        flash(false, function(){
          robRunning = false;
          $$("btn-run").disabled = false;
          robPos = getRobotStartPos(lv);
          robQueue = [];
          renderQueue();
          drawGrid(lv, robPos, []);
          var m2 = $$("rob-msg"); if(m2) { m2.className="robot-result-msg"; m2.style.display="none"; }
        });
      }
      return;
    }

    var cmd = cmds[step];
    var nr = pos.r + (cmd==="U"?-1:cmd==="D"?1:0);
    var nc = pos.c + (cmd==="L"?-1:cmd==="R"?1:0);

    // boundary check
    if(nr<0||nr>=lv.size||nc<0||nc>=lv.size) { failed=true; }
    // wall check
    else if(lv.grid[nr*lv.size+nc]==="1") { failed=true; }
    else { trail.push({r:pos.r, c:pos.c}); pos.r=nr; pos.c=nc; }

    // highlight current cmd
    var chips = document.querySelectorAll(".cmd-chip");
    chips.forEach(function(c,i){ c.classList.toggle("active-step", i===step); });

    drawGrid(lv, pos, trail);

    if(failed) {
      // hit wall
      var cells = $$("rob-grid").children;
      var ci = pos.r*lv.size+pos.c;
      if(cells[ci]) cells[ci].classList.add("wrong-cell");
      var msg2 = $$("rob-msg");
      msg2.textContent = "🤖 Aduh! Robot menabrak tembok. Coba lagi!";
      msg2.className = "robot-result-msg err";
      flash(false, function(){
        robRunning = false;
        $$("btn-run").disabled = false;
        robPos = getRobotStartPos(lv);
        robQueue = [];
        renderQueue();
        drawGrid(lv, robPos, []);
        var m3 = $$("rob-msg"); if(m3){ m3.className="robot-result-msg"; m3.style.display="none"; }
      });
      return;
    }

    step++;
    $$("rob-steps").textContent = "Langkah ke-" + step + " dari " + cmds.length;
    setTimeout(execStep, 380);
  }

  execStep();
}


function nextRobot() {
  if(robLv >= ROBOT_LV.length-1) showResult("robot", robPts);
  else { robLv++; renderRobot(); }
}


/* ═══════════════════════════════════════════════════════
   GAME 3 — POLA & PERULANGAN  (10 soal)
═══════════════════════════════════════════════════════ */
var PAT_LV = [
  { badge:"Mudah", sit:"Ibu menata buah di meja setiap pagi:",
    pattern:["🍎","🍌","🍎","🍌","🍎","?"],
    q:"Buah ke-6 adalah?", opts:["Apel","Pisang","Jeruk","Anggur"], correct:1, hint:"Pola: apel-pisang bergantian. Posisi genap = pisang." },
  { badge:"Mudah", sit:"Robot mencetak teks berulang:",
    code:[{c:"cl",t:"for i in range(4):"},{c:"ca",t:"    print('Halo')"}],
    q:"Berapa kali 'Halo' dicetak?", opts:["2 kali","3 kali","4 kali","5 kali"], correct:2, hint:"range(4) → loop berjalan 4 kali." },
  { badge:"Mudah", sit:"Robot menghitung mundur:",
    code:[{c:"cl",t:"i = 5"},{c:"cl",t:"while i > 0:"},{c:"ca",t:"    print(i)"},{c:"ca",t:"    i = i - 1"}],
    q:"Angka apa saja yang dicetak?", opts:["5,4,3,2,1","1,2,3,4,5","5,4,3,2,1,0","4,3,2,1,0"], correct:0, hint:"Mulai i=5, kurang 1 tiap putaran. Berhenti saat i=0 (tidak dicetak)." },
  { badge:"Mudah", sit:"Robot menyiram tanaman 7 hari:",
    code:[{c:"cl",t:"for hari in range(7):"},{c:"ca",t:"    siram_tanaman()"}],
    q:"Total siram_tanaman() dipanggil berapa kali?", opts:["5 kali","6 kali","7 kali","8 kali"], correct:2, hint:"range(7) → 7 iterasi → dipanggil 7 kali." },
  // ── soal 5-10: all visual patterns, no code ──
  { badge:"Sedang", sit:"Riko menghias kelas dengan bendera warna-warni:", pattern:["🟥","🟨","🟦","🟥","🟨","🟦","🟥","?"],
    q:"Bendera ke-8 warnanya apa?", opts:["Merah","Kuning","Biru","Hijau"], correct:1,
    explain:"Polanya: Merah → Kuning → Biru, lalu diulang lagi. Bendera ke-8 = urutan ke-2 dalam pola = Kuning! 🟨" },
  { badge:"Sedang", sit:"Ibu menanam bunga setiap hari. Hari 1 dia tanam 2 bunga, hari 2 tanam 4 bunga, hari 3 tanam 6 bunga.",
    visual:["🌸×2","🌸×4","🌸×6","🌸×?"],
    q:"Hari ke-4 berapa bunga yang ditanam?", opts:["6 bunga","7 bunga","8 bunga","10 bunga"], correct:2,
    explain:"Polanya bertambah 2 setiap hari! 2 → 4 → 6 → 8. Hari ke-4 = 8 bunga! 🌸" },
  { badge:"Sedang", sit:"Robot melompat mengikuti pola:",
    pattern:["🐸","🐸","⭐","🐸","🐸","⭐","🐸","🐸","?"],
    q:"Giliran ke-9 apa?", opts:["Katak 🐸","Bintang ⭐","Bulan 🌙","Hati ❤️"], correct:1,
    explain:"Polanya: Katak, Katak, Bintang — diulang terus. Giliran ke-9 = posisi ke-3 dalam pola = Bintang! ⭐" },
  { badge:"Sedang", sit:"Sebuah lift naik dari lantai 1. Setiap menit naik 3 lantai.",
    visual:["Menit 0: Lantai 1","Menit 1: Lantai 4","Menit 2: Lantai 7","Menit 3: Lantai ?"],
    q:"Di menit ke-3, lift ada di lantai berapa?", opts:["Lantai 8","Lantai 9","Lantai 10","Lantai 12"], correct:2,  // 1 + 3*3 = 10
    explain:"Setiap menit naik 3 lantai. Mulai dari 1: 1+3=4, 4+3=7, 7+3=10. Menit ke-3 = lantai 10! 🛗" },
  { badge:"Susah", sit:"Robot mengecat pagar. Ada 12 pagar, setiap menit dia mengecat 4 pagar.",
    visual:["Menit 1: 4 pagar","Menit 2: 8 pagar","Menit 3: 12 pagar","Total: selesai!"],
    q:"Berapa menit robot mengecat semua pagar?", opts:["2 menit","3 menit","4 menit","6 menit"], correct:1,
    explain:"Robot cat 4 pagar per menit. 12 ÷ 4 = 3 menit untuk selesaikan semuanya! 🎨" },
  { badge:"Susah", sit:"Sekolah punya 3 kelas. Setiap kelas punya 5 meja. Setiap meja punya 2 kursi.",
    visual:["🏫 3 kelas","×5 meja per kelas","×2 kursi per meja","= ? kursi total"],
    q:"Total berapa kursi di sekolah?", opts:["15 kursi","25 kursi","30 kursi","45 kursi"], correct:2,
    explain:"3 kelas × 5 meja = 15 meja. 15 meja × 2 kursi = 30 kursi total! 🪑" },
];

var patLv=0, patPts=0;
function initPat() { patLv=0; patPts=0; renderPat(); }

function renderPat() {
  var lv=PAT_LV[patLv];
  setScore(patPts,"pattern");
  setProg(patLv,PAT_LV.length,"pattern");
  animBody();

  // Build visual
  var vis="";
  if(lv.pattern){
    var cells=""; lv.pattern.forEach(function(e){
      cells+='<div class="pat-cell '+(e==="?"?"unknown":"")+'">'+(e==="?"?"?":e)+'</div>';
    });
    vis='<div class="pat-row">'+cells+'</div>';
  } else if(lv.visual) {
    var vcells=""; lv.visual.forEach(function(v){
      vcells+='<div class="vis-item">'+v+'</div>';
    });
    vis='<div class="vis-row">'+vcells+'</div>';
  }

  var opts=""; lv.opts.forEach(function(o,i){
    opts+='<button class="btn-opt" id="po'+i+'" onclick="checkPat('+i+')">'+o+'</button>';
  });

  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
    '<div class="q-scene">'+lv.sit+'</div>'+
    vis+
    '<div class="q-label">'+lv.q+'</div>'+
    '<div class="opts-grid">'+opts+'</div>'+
    '<div class="answer-box hidden" id="pat-answer-box"></div>'+
    '<div style="margin-top:14px;"><button class="btn-next hidden" id="pat-next" onclick="nextPat()">Soal Berikutnya →</button></div>'+
    '<div class="q-info">Soal '+(patLv+1)+' dari '+PAT_LV.length+' · Poin: <strong>'+patPts+'</strong></div>'
  );
}

function checkPat(idx){
  var lv=PAT_LV[patLv], ok=idx===lv.correct;
  document.querySelectorAll(".btn-opt").forEach(function(b){b.disabled=true;});
  $$("po"+idx).classList.add(ok?"correct":"wrong");
  if(!ok) $$("po"+lv.correct).classList.add("reveal");

  var box = $$("pat-answer-box");
  box.classList.remove("hidden");
  if(ok){
    patPts+=20;
    setScore(patPts,"pattern");
    box.className = "answer-box answer-ok";
    box.innerHTML = '<div class="ab-icon">🎉</div><div class="ab-title">Benar! +20 poin</div><div class="ab-explain">'+lv.explain+'</div>';
    flash(true, null);
  } else {
    box.className = "answer-box answer-err";
    box.innerHTML = '<div class="ab-icon">💡</div><div class="ab-title">Yuk coba lagi di soal berikutnya!</div><div class="ab-explain">'+lv.explain+'</div>';
    flash(false, null);
  }
  var nxtBtn = $$("pat-next");
  nxtBtn.classList.remove("hidden");
  nxtBtn.textContent = (patLv>=PAT_LV.length-1) ? "Lihat Hasil 🏆" : "Soal Berikutnya →";
}

function nextPat() {
  if(patLv >= PAT_LV.length-1) { showResult("pattern", patPts); }
  else { patLv++; renderPat(); }
}


/* ═══════════════════════════════════════════════════════
   GAME 4 — KETIK KODENYA!  (8 soal, sangat mudah untuk SD)
   Konsep: satu kata / satu angka yang diubah saja
═══════════════════════════════════════════════════════ */
var TYP_LV = [
  { badge:"Mudah",
    story:"Robot mau menyapa dengan kata 'Halo'.",
    example:'print("Halo")',
    task:'Sekarang ketik kode untuk mencetak kata "Pagi".',
    answer:'print("Pagi")',
    explain:'print() dipakai untuk menampilkan teks. Ganti isinya dengan kata yang diinginkan!' },
  { badge:"Mudah",
    story:"Robot menyimpan umur seseorang.",
    example:'umur = 10',
    task:'Ketik kode untuk menyimpan umur = 12.',
    answer:'umur = 12',
    explain:'Kita simpan angka ke dalam kotak bernama umur. Ganti angkanya sesuai perintah!' },
  { badge:"Mudah",
    story:"Robot menyimpan nama teman.",
    example:'nama = "Budi"',
    task:'Ketik kode untuk menyimpan nama = "Ani".',
    answer:'nama = "Ani"',
    explain:'Tanda = artinya "simpan". Di sini kita simpan kata Ani ke dalam kotak bernama nama.' },
  { badge:"Mudah",
    story:"Robot mengucapkan salam 3 kali berturut-turut.",
    example:'print("Salam")\nprint("Salam")\nprint("Salam")',
    task:'Ketik kode untuk mencetak kata "Hore" sebanyak 3 kali (baris per baris).',
    answer:'print("Hore")\nprint("Hore")\nprint("Hore")',
    explain:'Kita bisa panggil print() berkali-kali. Setiap print() mencetak satu baris!' },
  { badge:"Sedang",
    story:"Robot menjumlahkan dua angka.",
    example:'hasil = 3 + 4\nprint(hasil)',
    task:'Ketik kode untuk menjumlahkan 5 + 6 dan tampilkan hasilnya.',
    answer:'hasil = 5 + 6\nprint(hasil)',
    explain:'Kita simpan hasil penjumlahan ke variabel "hasil", lalu print() untuk menampilkannya. Hasilnya 11!' },
  { badge:"Sedang",
    story:"Robot mencetak angka 1 sampai 3.",
    example:'print(1)\nprint(2)\nprint(3)',
    task:'Ketik kode untuk mencetak angka 4, 5, dan 6.',
    answer:'print(4)\nprint(5)\nprint(6)',
    explain:'Setiap print() mencetak satu angka. Ganti angka 1,2,3 menjadi 4,5,6!' },
  { badge:"Sedang",
    story:"Robot menyapa nama seseorang.",
    example:'nama = "Dito"\nprint("Halo " + nama)',
    task:'Ketik kode yang sama tapi untuk nama = "Rina".',
    answer:'nama = "Rina"\nprint("Halo " + nama)',
    explain:'Variabel nama disimpan dulu, lalu disambung dengan kata "Halo " menggunakan tanda +. Hasilnya: Halo Rina!' },
  { badge:"Sedang",
    story:"Robot menghitung banyaknya buku.",
    example:'buku = 5\nbuku = buku + 3\nprint(buku)',
    task:'Ketik kode yang sama tapi mulai dari buku = 10, tambah 2.',
    answer:'buku = 10\nbuku = buku + 2\nprint(buku)',
    explain:'buku = buku + 2 artinya nilai buku lama ditambah 2. 10 + 2 = 12. Hasilnya 12!' },
];

var typLv=0, typPts=0;
function initTyp() { typLv=0; typPts=0; renderTyp(); }

function renderTyp() {
  var lv=TYP_LV[typLv];
  setScore(typPts,"typing");
  setProg(typLv,TYP_LV.length,"typing");
  animBody();
  setH("game-body",
    '<div class="q-chip '+chipCls(lv.badge)+'">'+lv.badge+'</div>'+
    '<div class="q-scene">'+lv.story+'</div>'+
    '<div class="typing-example">'+
      '<div class="typing-ex-label">Contoh Kode</div>'+
      '<pre>'+escHTML(lv.example)+'</pre>'+
    '</div>'+
    '<div class="typing-task">'+
      '<div class="typing-task-label">✏️ Tugasmu</div>'+
      '<div class="typing-task-text">'+lv.task+'</div>'+
    '</div>'+
    '<textarea id="typ-in" class="typing-input" placeholder="Ketik kodenya di sini..." spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>'+
    '<button class="btn-submit" id="typ-submit" onclick="checkTyp()">Periksa ✓</button>'+
    '<div class="answer-box hidden" id="typ-answer-box"></div>'+
    '<div style="margin-top:14px;"><button class="btn-next hidden" id="typ-next" onclick="nextTyp()">Soal Berikutnya →</button></div>'+
    '<div class="q-info">Soal '+(typLv+1)+' dari '+TYP_LV.length+' · Poin: <strong>'+typPts+'</strong></div>'
  );
  setTimeout(function(){ var el=$$("typ-in"); if(el) el.focus(); }, 120);
}

function escHTML(s) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function normCode(s) {
  return s.split("\n").map(function(l){return l.trim();}).filter(Boolean).join("\n").toLowerCase().replace(/[ \t]+/g," ");
}

function checkTyp() {
  var lv=TYP_LV[typLv];
  var inp=$$("typ-in"); if(!inp) return;
  var ok = normCode(inp.value) === normCode(lv.answer);
  inp.classList.remove("ok-input","err-input");
  inp.classList.add(ok?"ok-input":"err-input");
  $$("typ-submit").disabled = true;

  var box = $$("typ-answer-box");
  box.classList.remove("hidden");
  if(ok){
    typPts+=20;
    setScore(typPts,"typing");
    box.className = "answer-box answer-ok";
    box.innerHTML = '<div class="ab-icon">🎉</div><div class="ab-title">Kode benar! +20 poin</div><div class="ab-explain">'+lv.explain+'</div>';
    flash(true, null);
  } else {
    box.className = "answer-box answer-err";
    box.innerHTML =
      '<div class="ab-icon">💡</div>'+
      '<div class="ab-title">Belum tepat. Ini jawaban yang benar:</div>'+
      '<pre class="ab-code">'+escHTML(lv.answer)+'</pre>'+
      '<div class="ab-explain">'+lv.explain+'</div>';
    flash(false, null);
  }
  var nxt = $$("typ-next");
  nxt.classList.remove("hidden");
  nxt.textContent = (typLv>=TYP_LV.length-1) ? "Lihat Hasil 🏆" : "Soal Berikutnya →";
}

function nextTyp() {
  if(typLv >= TYP_LV.length-1) { showResult("typing", typPts); }
  else { typLv++; renderTyp(); }
}