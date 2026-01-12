const SUPABASE_URL = "https://qxxmxzxipoodeobehcoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_53x04KOXjY6Eg9tfhAPQWg_MSfaBSPV";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const myNumber = localStorage.getItem("myNumber");
const myName = localStorage.getItem("myName");

if (!myNumber) location.href = "index.html";

document.getElementById("myNumber").innerText = myNumber;
document.getElementById("myName").innerText = myName;

let currentTarget = null;
let ownerMap = {};

async function loadOwners() {
  const { data, error } = await db
    .from("numbers")
    .select("number, owner");
  
  if (error) {
    console.error(error);
    return;
  }
  
  data.forEach(n => {
    ownerMap[n.number] = n.owner;
  });
}

loadOwners();

function logout() {
  localStorage.clear();
  location.href = "index.html";
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
    .or(`from_number.eq.${myNumber},to_number.eq.${myNumber}`)
    .order("created_at", { ascending: true });
  
  if (error) {
    console.error(error);
    return;
  }
  
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  
  data
    .filter(m =>
      (m.from_number === myNumber && m.to_number === currentTarget) ||
      (m.from_number === currentTarget && m.to_number === myNumber)
    )
    .forEach(m => {
      const div = document.createElement("div");
      div.className = m.from_number === myNumber ? "msg me" : "msg other";
      
      const sender =
        m.from_number === myNumber ?
        "Aku" :
        ownerMap[m.from_number] || "User";
      
      div.innerText = `${sender}: ${m.message}`;
      chat.appendChild(div);
    });
  
  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  
  if (!text || !currentTarget) return;
  
  const { error } = await db.from("chats").insert({
    from_number: myNumber,
    to_number: currentTarget,
    message: text
  });
  
  if (error) {
    alert("Gagal kirim pesan");
    return;
  }
  
  input.value = "";
  loadChat();
}

setInterval(() => {
  if (currentTarget) loadChat();
}, 2000);