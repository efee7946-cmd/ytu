import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

function fromKey(key) { return key.replace("_", "."); }
function toUrl(fileName) { return "img/" + fileName; }

async function loadTop3() {
  const container = document.getElementById("top3");
  try {
    const snap = await getDoc(doc(db, "globalVotes", "totals"));
    if (!snap.exists()) {
      container.innerHTML = '<p class="text-slate-400 text-sm">Henüz oy yok.</p>';
      return;
    }

    const data = snap.data();
    const sorted = Object.entries(data)
      .filter(([, v]) => typeof v === "number")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const totalVotes = Object.values(data).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
    const medals = ["🥇", "🥈", "🥉"];

    container.innerHTML = "";

    sorted.forEach(([key, votes], i) => {
      const percent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      const fileName = fromKey(key);

      const card = document.createElement("div");
      card.className = "flex items-center gap-3 bg-slate-700 rounded-xl p-3";

      card.innerHTML = `
        <img src="${toUrl(fileName)}" class="w-14 h-14 object-cover rounded-lg border-2 border-yellow-400">
        <div class="text-left">
          <p class="text-lg">${medals[i]}</p>
          <p class="text-yellow-400 font-bold text-sm">%${percent}</p>
          <p class="text-slate-400 text-xs">${votes} oy</p>
        </div>
      `;

      container.appendChild(card);
    });

    if (sorted.length === 0) {
      container.innerHTML = '<p class="text-slate-400 text-sm">Henüz oy yok.</p>';
    }

  } catch(e) {
    container.innerHTML = '<p class="text-slate-400 text-sm">Veriler alınamadı.</p>';
    console.error(e);
  }
}

function setActiveCard(active) {
  const tweet = document.getElementById("cardTweet");
  const suggest = document.getElementById("cardSuggest");
  tweet.classList.remove("border-yellow-400", "border-slate-500");
  suggest.classList.remove("border-yellow-400", "border-slate-500");
  if (active === "tweet") {
    tweet.classList.add("border-yellow-400");
    suggest.classList.add("border-slate-500");
  } else if (active === "suggest") {
    suggest.classList.add("border-yellow-400");
    tweet.classList.add("border-slate-500");
  } else {
    tweet.classList.add("border-slate-500");
    suggest.classList.add("border-slate-500");
  }
}

window.openMenu = function() {
  const suggest = document.getElementById("suggest");
  if (suggest) suggest.style.maxHeight = "0px";

  const menu = document.getElementById("menu");
  const isOpen = menu.style.maxHeight !== "0px" && menu.style.maxHeight !== "";

  if (!isOpen) {
    menu.style.maxHeight = "none";
    const h = menu.scrollHeight;
    menu.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      menu.style.maxHeight = h + "px";
    });
    setTimeout(() => menu.scrollIntoView({ behavior: "smooth" }), 150);
    loadTop3();
    setActiveCard("tweet");
  } else {
    menu.style.maxHeight = "0px";
    setActiveCard(null);
  }
}