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

let currentMatch = 0;
let winners = [];

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
    try {
      const globalRef = doc(db, "globalVotes", "totals");
      await updateDoc(globalRef, { [toKey(champion)]: increment(1) });
    } catch(e) {
      console.error("Şampiyon kaydedilemedi:", e);
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
  document.body.className = "bg-slate-900 text-white font-sans text-center";

  const title = document.createElement('h1');
  title.className = "text-4xl mt-16 text-yellow-400 font-bold";
  title.innerText = "🏆 GLOBAL SONUÇ";
  document.body.appendChild(title);

  const sub = document.createElement('p');
  sub.className = "text-slate-400 mt-2 mb-10";
  sub.innerText = `Toplam ${totalVotes} kişi oyladı`;
  document.body.appendChild(sub);

  const container = document.createElement('div');
  container.className = "mt-4 space-y-10 pb-20";
  document.body.appendChild(container);

  top3.forEach((item, index) => {
    const percent = totalVotes > 0 ? Math.round((item[1] / totalVotes) * 100) : 0;
    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉";

    const div = document.createElement('div');

    const img = document.createElement('img');
    img.src = toUrl(fromKey(item[0]));
    img.className = "mx-auto w-72 rounded-xl border-4 border-yellow-400";
    div.appendChild(img);

    const p = document.createElement('p');
    p.className = "mt-3 text-2xl font-bold text-yellow-400";
    p.innerText = `${medal} %${percent} (${item[1]} oy)`;
    div.appendChild(p);

    container.appendChild(div);
  });
}

init();
