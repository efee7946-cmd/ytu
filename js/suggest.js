import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

function setActiveCard(active) {
  const tweet = document.getElementById("cardTweet");
  const suggest = document.getElementById("cardSuggest");
  tweet.classList.remove("border-yellow-400", "border-slate-500");
  suggest.classList.remove("border-yellow-400", "border-slate-500");
  if (active === "suggest") {
    suggest.classList.add("border-yellow-400");
    tweet.classList.add("border-slate-500");
  } else {
    tweet.classList.add("border-slate-500");
    suggest.classList.add("border-slate-500");
  }
}

window.openSuggest = function () {
  const menu = document.getElementById("menu");
  menu.style.maxHeight = "0px";

  const suggestPanel = document.getElementById("suggest");
  const isOpen = suggestPanel.style.maxHeight !== "0px" && suggestPanel.style.maxHeight !== "";

  if (!isOpen) {
    suggestPanel.style.maxHeight = "none";
    const h = suggestPanel.scrollHeight;
    suggestPanel.style.maxHeight = "0px";
    requestAnimationFrame(() => {
      suggestPanel.style.maxHeight = h + "px";
    });
    setTimeout(() => suggestPanel.scrollIntoView({ behavior: "smooth" }), 150);
    setActiveCard("suggest");
  } else {
    suggestPanel.style.maxHeight = "0px";
    setActiveCard(null);
  }
}

window.submitSuggestion = async function () {
  const link = document.getElementById("suggestLink").value.trim();
  const errorEl = document.getElementById("suggestError");
  const successEl = document.getElementById("suggestSuccess");
  const btn = document.getElementById("suggestBtn");

  errorEl.classList.add("hidden");
  successEl.classList.add("hidden");

  if (!link) {
    errorEl.textContent = "Lütfen bir link gir.";
    return errorEl.classList.remove("hidden");
  }

  if (!link.startsWith("http")) {
    errorEl.textContent = "Geçerli bir link gir.";
    return errorEl.classList.remove("hidden");
  }

  btn.disabled = true;
  btn.textContent = "Gönderiliyor...";

  try {
    await addDoc(collection(db, "suggestions"), {
      link,
      createdAt: new Date().toISOString()
    });

    document.getElementById("suggestLink").value = "";
    successEl.classList.remove("hidden");
    btn.textContent = "Gönder";
    btn.disabled = false;

    setTimeout(() => successEl.classList.add("hidden"), 4000);
  } catch (e) {
    console.error(e);
    errorEl.textContent = "Bir hata oluştu, tekrar dene.";
    errorEl.classList.remove("hidden");
    btn.textContent = "Gönder";
    btn.disabled = false;
  }
}