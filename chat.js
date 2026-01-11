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
  currentTarget = document.getElementById("targetNumber").value.trim();
  if (!currentTarget) return;
  loadChat();
}

async function loadChat() {
  if (!currentTarget) return;
  
  const { data, error } = await db
    .from("chats")
    .select("*")
    .or(
      `and(from_number.eq.${myNumber},to_number.eq.${currentTarget}),
       and(from_number.eq.${currentTarget},to_number.eq.${myNumber})`
    )
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error("Load chat error:", error);
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
}

async function sendMessage() {
  const text = document.getElementById("messageInput").value.trim();
  if (!text || !currentTarget) return;
  
  const { error } = await db.from("chats").insert({
    from_number: myNumber,
    to_number: currentTarget,
    message: text
  });
  
  if (error) {
    console.error("Send error:", error);
    alert("Gagal kirim pesan");
    return;
  }
  
  document.getElementById("messageInput").value = "";
  loadChat();
}

setInterval(loadChat, 2000);