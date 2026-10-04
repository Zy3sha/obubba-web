// ── Firebase SDK Initialization ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp, collection, addDoc, getDocs, deleteDoc, query, orderBy, limit }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged, indexedDBLocalPersistence, initializeAuth }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics, logEvent }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFunctions, httpsCallable }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js";

const OB_FIREBASE_DEBUG = (() => {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("debug") === "1" ||
      localStorage.getItem("ob_debug") === "1" ||
      /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname || "");
  } catch { return false; }
})();
if (!OB_FIREBASE_DEBUG) {
  try { ["log","info","debug","warn","error"].forEach(method => { console[method] = function(){}; }); } catch {}
}

const firebaseConfig = {
  apiKey: "AIzaSyCdHzmheQRbtzP_JI1FuWcZLeW8yVja5-0",
  authDomain: "obubba-d9ccc.firebaseapp.com",
  projectId: "obubba-d9ccc",
  storageBucket: "obubba-d9ccc.firebasestorage.app",
  messagingSenderId: "1091432133381",
  appId: "1:1091432133381:web:1cd4d0ce7397affeae7d6c",
  measurementId: "G-Y7CHSL1YHZ"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);
// Use indexedDB persistence to avoid WKWebView iframe blocking issue
let auth;
try {
  auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
} catch(e) {
  auth = getAuth(app);
}
let analytics;
try { analytics = getAnalytics(app); } catch(e) { console.warn("Analytics init failed", e); }
const functions = getFunctions(app);

// Auth-ready promise — resolves once anonymous sign-in completes
window._fbAuthReady = new Promise((resolve) => {
  onAuthStateChanged(auth, user => {
    if (user) { window._fbUid = user.uid; resolve(user); }
  });
  signInAnonymously(auth).catch(e => { console.warn("Auth error", e); resolve(null); });
  // Safety timeout — don't block forever
  setTimeout(() => resolve(null), 5000);
});

window._fb = { db, auth, analytics, functions, httpsCallable, doc, setDoc, getDoc, onSnapshot, serverTimestamp, signInAnonymously, signOut, onAuthStateChanged, logEvent, collection, addDoc, getDocs, deleteDoc, query, orderBy, limit };
