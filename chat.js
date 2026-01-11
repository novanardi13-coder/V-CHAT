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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("myNumber").innerText = myNumber;
});

let currentTarget = null;

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
    div.className = m.from_number === myNumber ? "msg me" : "msg other";
    div.innerText = m.message;
    chat.appendChild(div);
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

setInterval(() => {
  if (currentTarget) loadChat();
}, 2000);