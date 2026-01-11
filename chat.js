const SUPABASE_URL = "https://qxxmxzxipoodeobehcoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_53x04KOXjY6Eg9tfhAPQWg_MSfaBSPV";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const myNumber = localStorage.getItem("myNumber");
if (!myNumber) {
  window.location.href = "index.html";
}

let currentTarget = null;
let lastMessageId = 0;
let ownersMap = {};

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("myNumber").innerText = myNumber;
  await loadOwners();
});

async function loadOwners() {
  const { data, error } = await db
    .from("numbers")
    .select("number, owner");
  
  if (error) {
    console.error("LOAD OWNER ERROR:", error);
    return;
  }
  
  data.forEach(u => {
    ownersMap[u.number] = u.owner || u.number;
  });
}

function logout() {
  localStorage.removeItem("myNumber");
  window.location.href = "index.html";
}

function openChat() {
  const input = document.getElementById("targetNumber");
  currentTarget = input.value.trim();
  
  if (!currentTarget) {
    alert("Masukkan nomor tujuan");
    return;
  }
  
  lastMessageId = 0;
  loadChat();
}

async function loadChat() {
  if (!currentTarget) return;
  
  const { data, error } = await db
    .from("chats")
    .select("*")
    .in("from_number", [myNumber, currentTarget])
    .in("to_number", [myNumber, currentTarget])
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("LOAD CHAT ERROR:", error);
    return;
  }
  
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  
  (data || []).forEach(m => {
    const div = document.createElement("div");
    
    const isMe = m.from_number === myNumber;
    const senderName = isMe ?
      "Aku" :
      ownersMap[m.from_number] || m.from_number;
    
    div.className = isMe ? "msg me" : "msg other";
    div.innerText = senderName + ": " + m.message;
    
    chat.appendChild(div);
    
    if (!isMe && m.id > lastMessageId) {
      showNotification(senderName, m.message);
    }
    
    lastMessageId = Math.max(lastMessageId, m.id);
  });
  
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  
  if (!text) return;
  if (!currentTarget) {
    alert("Pilih lawan chat dulu");
    return;
  }
  
  const { error } = await db.from("chats").insert({
    from_number: myNumber,
    to_number: currentTarget,
    message: text
  });
  
  if (error) {
    console.error("SEND ERROR:", error);
    alert("Gagal kirim pesan");
    return;
  }
  
  input.value = "";
  loadChat();
}

function showNotification(sender, message) {
  if (!("Notification" in window)) return;
  
  if (Notification.permission === "granted") {
    new Notification("Pesan baru dari " + sender, {
      body: message
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission();
  }
}

setInterval(() => {
  if (currentTarget) loadChat();
}, 2000);