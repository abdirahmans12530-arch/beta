<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Point Trap Game - 40 Points / 20 Rounds</title>
<style>
body { margin:0; padding:0; font-family:sans-serif; text-align:center; background:#222; color:white; }
h1 { margin:10px 0; font-size:24px; }
#roundText, #timer { font-size:18px; margin:5px; }
#message { font-weight:bold; font-size:16px; color:#FFD700; min-height:20px; }
#pointsText { margin-top:10px; font-size:16px; }
.player-zone { display:inline-block; width:45%; max-width:200px; height:100px; margin:5px; padding:10px; border-radius:10px; font-size:18px; color:white; position:relative; transition: transform 0.3s; touch-action: manipulation; }
#zoneRed { background:#FF4444; }
#zoneBlue { background:#4488FF; }
#zoneGreen { background:#44FF44; color:black; }
#zoneYellow { background:#FFFF44; color:black; }
.progress-bar { width:100%; height:12px; background:#555; border-radius:5px; margin-top:5px; }
.progress-fill { height:100%; border-radius:5px; background:white; width:100%; transition: width 0.5s, background 0.5s; }
button { padding:10px 15px; margin:5px; border:none; border-radius:5px; font-size:16px; cursor:pointer; }
#puzzleText { margin-top:10px; font-size:16px; min-height:50px; }
.swapBtn { display:none; margin-top:10px; background:#AA00FF; color:white; }
.swapChoice { display:none; margin-top:5px; }
.confetti { position:absolute; width:5px; height:5px; border-radius:50%; animation:fall 1s linear forwards; }
@keyframes fall { to { transform: translateY(150px) rotate(360deg); opacity:0; } }
</style>
</head>
<body>

<h1>Point Trap Game 🎉</h1>
<div id="roundText">Round 1</div>
<div id="timer">Time: 15</div>
<div>
  <div id="zoneRed" class="player-zone">Red
    <div class="progress-bar"><div id="barRed" class="progress-fill"></div></div>
  </div>
  <div id="zoneBlue" class="player-zone">Blue
    <div class="progress-bar"><div id="barBlue" class="progress-fill"></div></div>
  </div>
  <div id="zoneGreen" class="player-zone">Green
    <div class="progress-bar"><div id="barGreen" class="progress-fill"></div></div>
  </div>
  <div id="zoneYellow" class="player-zone">Yellow
    <div class="progress-bar"><div id="barYellow" class="progress-fill"></div></div>
  </div>
</div>

<div id="puzzleText"></div>
<div id="message"></div>
<div id="pointsText"></div>

<div id="answerBtns">
  <button id="btnA"></button>
  <button id="btnB"></button>
  <button id="btnC"></button>
  <button id="btnD"></button>
</div>
<br>
<button id="startRoundBtn">Start Round</button>
<br>
<button id="swapBtn" class="swapBtn">SWAP Points</button>
<div id="swapChoice" class="swapChoice"></div>

<script>
// ===== VARIABLES =====
let playerPoints=[40,40,40,40];
let playerNames=["Red","Blue","Green","Yellow"];
let currentRound=1;
const totalRounds=20;
let chosenPlayer=-1;
let swapUsed=false;
let timerInterval;

// DOM ELEMENTS
const zones=[document.getElementById("zoneRed"),document.getElementById("zoneBlue"),document.getElementById("zoneGreen"),document.getElementById("zoneYellow")];
const bars=[document.getElementById("barRed"),document.getElementById("barBlue"),document.getElementById("barGreen"),document.getElementById("barYellow")];
const puzzleText=document.getElementById("puzzleText");
const pointsText=document.getElementById("pointsText");
const roundText=document.getElementById("roundText");
const startBtn=document.getElementById("startRoundBtn");
const buttons=[document.getElementById("btnA"),document.getElementById("btnB"),document.getElementById("btnC"),document.getElementById("btnD")];
const messageText=document.getElementById("message");
const timerText=document.getElementById("timer");
const swapBtn=document.getElementById("swapBtn");
const swapChoice=document.getElementById("swapChoice");

// ===== UPDATE UI =====
function updateUI(){
  pointsText.innerHTML="";
  for(let i=0;i<playerPoints.length;i++){
    let w=Math.max(playerPoints[i],0)*2.5; // 40 points = 100% width
    bars[i].style.width=w+"%";
    if(playerPoints[i]>=30) bars[i].style.background="#44FF44";
    else if(playerPoints[i]>=15) bars[i].style.background="#FFFF44";
    else bars[i].style.background="#FF4444";
    pointsText.innerHTML+=playerNames[i]+": "+playerPoints[i]+"<br>";
  }
}

// ===== QUESTION GENERATOR =====
const capitalsList=[
  {c:"Tokyo", country:"Japan"},
  {c:"Paris", country:"France"},
  {c:"Rome", country:"Italy"},
  {c:"Ottawa", country:"Canada"},
  {c:"Cairo", country:"Egypt"},
  {c:"Berlin", country:"Germany"},
  {c:"Moscow", country:"Russia"},
  {c:"Beijing", country:"China"},
  {c:"Canberra", country:"Australia"},
  {c:"Madrid", country:"Spain"}
];

function generateRandomQuestion(round){
  let type = Math.floor(Math.random()*3);
  if(type===0){ // Hard Math
    let a = Math.floor(Math.random()*90)+10;
    let b = Math.floor(Math.random()*9)+2;
    let op = ["*","/"][Math.floor(Math.random()*2)];
    let ans;
    if(op=="*") ans=a*b;
    if(op=="/") { a = a * b; ans = a/b; }
    let opts=new Set();
    opts.add(ans);
    while(opts.size<4){ 
      let delta=Math.floor(Math.random()*10)+1;
      opts.add(ans+delta); 
    }
    let optArr=Array.from(opts);
    optArr.sort(()=>Math.random()-0.5);
    return {q:`${a} ${op} ${b} = ?`, a:ans.toString(), opts:optArr.map(o=>o.toString()), r:round};
  } else if(type===1){ // Capitals
    let pick = capitalsList[Math.floor(Math.random()*capitalsList.length)];
    let options = new Set();
    options.add(pick.c);
    while(options.size<4){
      let o = capitalsList[Math.floor(Math.random()*capitalsList.length)].c;
      if(o!==pick.c) options.add(o);
    }
    let optArr = Array.from(options);
    optArr.sort(()=>Math.random()-0.5);
    return {q:`Capital of ${pick.country}?`, a:pick.c, opts:optArr, r:round};
  } else { // True/False
    let statements=[
      {q:"The sky is blue?", a:"True"},
      {q:"2 + 2 = 5?", a:"False"},
      {q:"Water freezes at 0°C?", a:"True"},
      {q:"Elephants can fly?", a:"False"},
      {q:"Humans need oxygen to live?", a:"True"},
      {q:"Sun rises from the west?", a:"False"}
    ];
    let pick=statements[Math.floor(Math.random()*statements.length)];
    let opts=["True","False"];
    opts.sort(()=>Math.random()-0.5);
    return {q:pick.q, a:pick.a, opts:opts, r:round};
  }
}

// ===== ROUND START =====
function startRound(){
  if(currentRound>totalRounds){finalResults(); return;}
  roundText.innerHTML="Round "+currentRound;
  messageText.innerHTML="";
  swapBtn.style.display="none";
  swapChoice.style.display="none";
  let alive=playerPoints.map((p,i)=>i).filter(i=>playerPoints[i]>0);
  chosenPlayer=alive[Math.floor(Math.random()*alive.length)];
  flashZone(chosenPlayer);
  let puzzle=generateRandomQuestion(currentRound);
  puzzleText.innerHTML=playerNames[chosenPlayer]+" is chosen!<br>"+puzzle.q;
  let opts=puzzle.opts.sort(()=>Math.random()-0.5);
  for(let i=0;i<4;i++){
    buttons[i].innerText=opts[i];
    buttons[i].disabled=false;
    buttons[i].style.background="#666";
    buttons[i].style.color="white";
    buttons[i].onclick=function(){
      buttons.forEach(b=>b.disabled=true);
      clearInterval(timerInterval);
      if(this.innerText===puzzle.a){handleCorrect(); if(currentRound===totalRounds) enableSwap();}
      else{handleWrong();}
      updateUI();
      checkZero();
      currentRound++;
      if(currentRound>totalRounds) finalResults();
    }
  }
  startTimer(15);
}

// ===== FLASH ZONE =====
function flashZone(i){
  let z=zones[i];
  z.style.transform="scale(1.3)";
  setTimeout(()=>{z.style.transform="scale(1)";},400);
}

// ===== TIMER =====
function startTimer(seconds){
  let time=seconds;
  timerText.innerHTML="Time: "+time;
  timerInterval=setInterval(()=>{
    time--;
    timerText.innerHTML="Time: "+time;
    if(time<=0){
      clearInterval(timerInterval);
      buttons.forEach(b=>b.disabled=true);
      handleWrong();
      updateUI();
      checkZero();
      currentRound++;
      if(currentRound>totalRounds) finalResults();
    }
  },1000);
}

// ===== CORRECT / WRONG =====
function handleCorrect(){
  playerPoints[chosenPlayer]-=2;
  if(playerPoints[chosenPlayer]<0) playerPoints[chosenPlayer]=0;
  messageText.innerHTML=playerNames[chosenPlayer]+" answered ✅ Correct!";
  spawnConfetti(chosenPlayer);
}

function handleWrong(){
  for(let i=0;i<playerPoints.length;i++){
    if(i!==chosenPlayer){
      playerPoints[i]-=2;
      if(playerPoints[i]<0) playerPoints[i]=0;
    }
  }
  messageText.innerHTML=playerNames[chosenPlayer]+" ❌ Wrong!";
}

// ===== CHECK ZERO =====
function checkZero(){
  for(let i=0;i<playerPoints.length;i++){
    if(playerPoints[i]<=0){
      messageText.innerHTML=playerNames[i]+" reached 0 points and instantly LOSER ❌!";
    }
  }
}

// ===== SWAP MECHANIC =====
function enableSwap(){ swapBtn.style.display="inline-block"; }

swapBtn.onclick=function(){
  swapChoice.innerHTML="";
  for(let i=0;i<playerPoints.length;i++){
    if(i!==chosenPlayer && playerPoints[i]>0){
      let b=document.createElement("button");
      b.innerText=playerNames[i];
      b.style.background=zones[i].style.background;
      b.style.color=zones[i].style.color;
      b.onclick=function(){performSwap(i);}
      swapChoice.appendChild(b);
    }
  }
  swapChoice.style.display="block";
}

function performSwap(target){
  let temp=playerPoints[chosenPlayer];
  playerPoints[chosenPlayer]=playerPoints[target];
  playerPoints[target]=temp;
  updateUI();
  messageText.innerHTML=playerNames[chosenPlayer]+" swapped points with "+playerNames[target]+"!";
  swapBtn.style.display="none";
  swapChoice.style.display="none";
}

// ===== CONFETTI =====
function spawnConfetti(playerIndex){
  for(let i=0;i<20;i++){
    let conf=document.createElement("div");
    conf.className="confetti";
    conf.style.background=["#FF4444","#4488FF","#44FF44","#FFFF44"][playerIndex];
    conf.style.left=(zones[playerIndex].offsetLeft + Math.random()*70)+"px";
    conf.style.top=(zones[playerIndex].offsetTop+"px");
    document.body.appendChild(conf);
    setTimeout(()=>{conf.remove();},1000);
  }
}

// ===== FINAL RESULTS =====
function finalResults(){
  let result="";
  for(let i=0;i<playerPoints.length;i++){
    result+=playerNames[i]+": "+playerPoints[i];
    if(playerPoints[i]===0) result+=" ❌ LOSER!";
    result+="\n";
  }
  messageText.innerHTML="Game Over! Check points below.";
  alert("Game Over!\n"+result);
}

startBtn.onclick=startRound;
updateUI();
</script>
</body>
</html>