import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyABb9qD1kBcCCNZF6y-izEI49eml5laQsk",
  authDomain: "ytut-fc618.firebaseapp.com",
  projectId: "ytut-fc618",
  storageBucket: "ytut-fc618.firebasestorage.app",
  messagingSenderId: "379744876322",
  appId: "1:379744876322:web:73a1396302b9bed6a6977b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const fileNames = [
  "1.webp","2.webp","3.webp","4.webp","15.webp","6.webp","16.webp","8.webp",
  "9.webp","10.webp","11.webp","12.webp","13.webp","14.webp","5.webp","7.webp",
  "17.png","18.png","19.png","20.png","21.png","22.png","23.png","24.png",
  "25.png","26.png","27.png","28.png","29.png","30.png","31.png","32.png",
  "33.png","34.png","35.png","36.png","37.png","38.png","39.png","40.png",
  "41.png","42.png","43.png","44.png","45.png","46.png","47.png","48.png",
  "49.png","50.png","51.png","52.png","53.png","54.png","55.png","56.png",
  "57.png","58.png","59.png","60.png","61.png","62.png","63.png","64.png"
];

function toUrl(fileName) { return "img/" + fileName; }
function toKey(fileName) { return fileName.replace(".", "_"); }
function fromKey(key) { return key.replace("_", "."); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const params = new URLSearchParams(window.location.search);
const count = parseInt(params.get("count")) || 16;
let currentPool = shuffle(fileNames.slice(0, count));
let currentMatch = 0;
let winners = [];
let voting = false;

async function init() {
  try {
    const globalRef = doc(db, "globalVotes", "totals");
    const snap = await getDoc(globalRef);
    if (!snap.exists()) await setDoc(globalRef, {});
  } catch(e) {
    console.error("Firebase bağlantı hatası:", e);
  }

  document.getElementById("cardA").addEventListener("click", () => vote(0));
  document.getElementById("cardB").addEventListener("click", () => vote(1));

  updateUI();
}

async function vote(choice) {
  if (voting) return;
  voting = true;

  const fileA = currentPool[currentMatch * 2];
  const fileB = currentPool[currentMatch * 2 + 1];
  const selected = choice === 0 ? fileA : fileB;

  winners.push(selected);
  currentMatch++;

  if (currentMatch < currentPool.length / 2) {
    updateUI();
  } else {
    await nextRound();
  }

  voting = false;
}

function updateUI() {
  document.getElementById("imgA").src = toUrl(currentPool[currentMatch * 2]);
  document.getElementById("imgB").src = toUrl(currentPool[currentMatch * 2 + 1]);

  const total = currentPool.length;
  const remaining = (total / 2) - currentMatch;
  setStatus(`${remaining} maç kaldı`);

  if (total === 64) roundName("Son 64");
  else if (total === 32) roundName("Son 32");
  else if (total === 16) roundName("Son 16");
  else if (total === 8) roundName("Çeyrek Final");
  else if (total === 4) roundName("Yarı Final");
  else if (total === 2) roundName("Final");
}

function roundName(name) {
  document.getElementById("round-name").innerText = name;
}

function setStatus(msg) {
  document.getElementById("status").innerText = msg;
}

async function nextRound() {
  if (winners.length === 1) {
    const champion = winners[0];
    const hasVoted = localStorage.getItem("ytutHasVoted");
    if (!hasVoted) {
      try {
        const globalRef = doc(db, "globalVotes", "totals");
        await updateDoc(globalRef, { [toKey(champion)]: increment(1) });
        localStorage.setItem("ytutHasVoted", "true");
      } catch(e) {
        console.error("Şampiyon kaydedilemedi:", e);
      }
    }
    showResults();
    return;
  }

  currentPool = shuffle(winners);
  winners = [];
  currentMatch = 0;
  updateUI();
}

async function showResults() {
  let data = {};
  try {
    const globalRef = doc(db, "globalVotes", "totals");
    const snap = await getDoc(globalRef);
    if (snap.exists()) data = snap.data();
  } catch(e) {
    console.error("Sonuçlar alınamadı:", e);
  }

  let totalVotes = 0;
  const formattedData = {};
  for (let key in data) {
    formattedData[key] = typeof data[key] === 'number' ? data[key] : 0;
    totalVotes += formattedData[key];
  }

  const sorted = Object.entries(formattedData).sort((a, b) => b[1] - a[1]);
  const top3 = sorted.slice(0, 3);

  document.body.innerHTML = '';
  document.body.style.cssText = "background:#0f172a;color:white;font-family:sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;text-align:center;";

  const title = document.createElement('h1');
  title.style.cssText = "font-size:2rem;font-weight:bold;color:#facc15;margin-top:60px;margin-bottom:8px;";
  title.innerText = "🏆 GLOBAL SONUÇ";
  document.body.appendChild(title);

  const sub = document.createElement('p');
  sub.style.cssText = "color:#94a3b8;margin-bottom:16px;font-size:0.9rem;";
  sub.innerText = `Toplam ${totalVotes} kişi oyladı`;
  document.body.appendChild(sub);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = "display:flex;gap:12px;margin-bottom:32px;flex-wrap:wrap;justify-content:center;";
  document.body.appendChild(btnRow);

  const replayBtn = document.createElement('button');
  replayBtn.style.cssText = "padding:12px 32px;background:#facc15;color:#0f172a;font-weight:bold;font-size:1rem;border-radius:12px;border:none;cursor:pointer;";
  replayBtn.innerText = "🔄 Tekrar Oyna";
  replayBtn.onmouseover = () => replayBtn.style.background = "#fde047";
  replayBtn.onmouseout = () => replayBtn.style.background = "#facc15";
  replayBtn.onclick = () => window.location.reload();
  btnRow.appendChild(replayBtn);

  const homeBtn = document.createElement('button');
  homeBtn.style.cssText = "padding:12px 32px;background:transparent;color:#94a3b8;font-weight:bold;font-size:1rem;border-radius:12px;border:2px solid #475569;cursor:pointer;";
  homeBtn.innerText = "🏠 Ana Sayfa";
  homeBtn.onmouseover = () => { homeBtn.style.borderColor = "#facc15"; homeBtn.style.color = "#facc15"; };
  homeBtn.onmouseout = () => { homeBtn.style.borderColor = "#475569"; homeBtn.style.color = "#94a3b8"; };
  homeBtn.onclick = () => window.location.href = "home.html";
  btnRow.appendChild(homeBtn);

  const container = document.createElement('div');
  container.style.cssText = "display:flex;flex-wrap:wrap;justify-content:center;gap:24px;max-width:1024px;width:100%;padding:0 16px 80px;";
  document.body.appendChild(container);

  const borderColors = ["#facc15", "#94a3b8", "#b45309"];

  top3.forEach((item, index) => {
    const percent = totalVotes > 0 ? Math.round((item[1] / totalVotes) * 100) : 0;
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

    const card = document.createElement('div');
    card.style.cssText = `background:#1e293b;border:4px solid ${borderColors[index]};border-radius:16px;padding:20px;display:flex;flex-direction:column;align-items:center;width:280px;`;

    const img = document.createElement('img');
    img.src = toUrl(fromKey(item[0]));
    img.style.cssText = "width:100%;border-radius:12px;margin-bottom:14px;";
    card.appendChild(img);

    const p = document.createElement('p');
    p.style.cssText = "font-size:1.5rem;font-weight:bold;color:#facc15;margin:0;";
    p.innerText = `${medal} %${percent}`;
    card.appendChild(p);

    const votes = document.createElement('p');
    votes.style.cssText = "color:#94a3b8;font-size:0.85rem;margin-top:4px;";
    votes.innerText = `${item[1]} oy`;
    card.appendChild(votes);

    container.appendChild(card);
  });
}

init();