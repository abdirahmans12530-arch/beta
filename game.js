// ===== VARIABLES =====
let playerPoints = [];
let playerNames = [];
let currentRound = 1;
const totalRounds = 20;
let chosenPlayer = -1;
let timerInterval;

// DOM ELEMENTS
const zones = [
  document.getElementById("zoneRed"),
  document.getElementById("zoneBlue"),
  document.getElementById("zoneGreen"),
  document.getElementById("zoneYellow")
];
const bars = [
  document.getElementById("barRed"),
  document.getElementById("barBlue"),
  document.getElementById("barGreen"),
  document.getElementById("barYellow")
];
const puzzleText = document.getElementById("puzzleText");
const pointsText = document.getElementById("pointsText");
const roundText = document.getElementById("roundText");
const startBtn = document.getElementById("startRoundBtn");
const buttons = [
  document.getElementById("btnA"),
  document.getElementById("btnB"),
  document.getElementById("btnB"),
  document.getElementById("btnD")
];
const messageText = document.getElementById("message");
const timerText = document.getElementById("timer");

// ===== INITIAL SETUP =====
function initGame(numPlayers){
  playerPoints = Array(numPlayers).fill(40);
  playerNames = zones.slice(0,numPlayers).map(z=>z.innerText);
  currentRound = 1;
  updateUI();
  messageText.innerHTML = "";
  puzzleText.innerHTML = "";
}

// ===== UPDATE UI =====
function updateUI(){
  pointsText.innerHTML = "";
  for(let i=0;i<playerPoints.length;i++){
    let w = Math.max(playerPoints[i],0)*2.5; // scale to width
    bars[i].style.width = w+"%";
    if(playerPoints[i]>=30) bars[i].style.background="#44FF44";
    else if(playerPoints[i]>=15) bars[i].style.background="#FFFF44";
    else bars[i].style.background="#FF4444";
    pointsText.innerHTML += playerNames[i]+": "+playerPoints[i]+"<br>";
  }
}

// ===== TIMER =====
function startTimer(seconds){
  let time = seconds;
  timerText.innerHTML = "Time: " + time;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    time--;
    timerText.innerHTML = "Time: " + time;
    if(time<=0){
      clearInterval(timerInterval);
      buttons.forEach(b=>b.disabled=true);
      handleWrong();
      updateUI();
      checkZero();
      nextRound();
    }
  },1000);
}

// ===== ROUND START =====
function startRound(){
  if(currentRound>totalRounds){ finalResults(); return; }
  roundText.innerHTML = "Round "+currentRound;
  messageText.innerHTML = "";
  let alive = playerPoints.map((p,i)=>i).filter(i=>playerPoints[i]>0);
  chosenPlayer = alive[Math.floor(Math.random()*alive.length)];
  flashZone(chosenPlayer);

  // Generate simple question
  let a = Math.floor(Math.random()*90)+10;
  let b = Math.floor(Math.random()*9)+2;
  let correctAnswer = a+b;
  puzzleText.innerHTML = playerNames[chosenPlayer]+" is chosen!<br>What is "+a+" + "+b+"?";
  let opts = [correctAnswer, correctAnswer+1, correctAnswer-1, correctAnswer+2].sort(()=>Math.random()-0.5);
  for(let i=0;i<4;i++){
    buttons[i].innerText = opts[i];
    buttons[i].disabled = false;
    buttons[i].style.background="#666";
    buttons[i].style.color="white";
    buttons[i].onclick=function(){
      buttons.forEach(b=>b.disabled=true);
      clearInterval(timerInterval);
      if(Number(this.innerText)===correctAnswer){
        handleCorrect();
      } else {
        handleWrong();
      }
      updateUI();
      checkZero();
      nextRound();
    }
  }
  startTimer(15);
}

// ===== FLASH ZONE =====
function flashZone(i){
  let z = zones[i];
  z.style.transform="scale(1.3)";
  setTimeout(()=>{ z.style.transform="scale(1)"; },400);
}

// ===== CORRECT / WRONG =====
function handleCorrect(){
  playerPoints[chosenPlayer]-=2;
  if(playerPoints[chosenPlayer]<0) playerPoints[chosenPlayer]=0;
  messageText.innerHTML = playerNames[chosenPlayer]+" answered ✅ Correct!";
}

function handleWrong(){
  for(let i=0;i<playerPoints.length;i++){
    if(i!==chosenPlayer){
      playerPoints[i]-=2;
      if(playerPoints[i]<0) playerPoints[i]=0;
    }
  }
  messageText.innerHTML = playerNames[chosenPlayer]+" ❌ Wrong!";
}

// ===== CHECK ZERO =====
function checkZero(){
  for(let i=0;i<playerPoints.length;i++){
    if(playerPoints[i]<=0){
      messageText.innerHTML = playerNames[i]+" reached 0 points and instantly LOSER ❌!";
    }
  }
}

// ===== NEXT ROUND =====
function nextRound(){
  currentRound++;
  if(currentRound>totalRounds){ finalResults(); return; }
  setTimeout(startRound,1000); // short delay between rounds
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

// ===== START BUTTON =====
startBtn.onclick=function(){
  let numPlayers = prompt("How many players? (2-4)", "2");
  numPlayers = Math.min(Math.max(Number(numPlayers),2),4);
  initGame(numPlayers);
  startRound();
};
