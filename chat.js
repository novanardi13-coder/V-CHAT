const SUPABASE_URL = "https://qxxmxzxipoodeobehcoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_53x04KOXjY6Eg9tfhAPQWg_MSfaBSPV";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const myNumber = localStorage.getItem("myNumber");
const myName   = localStorage.getItem("myName");

if (!myNumber) location.href = "index.html";

document.getElementById("myNumber").innerText = myNumber;
document.getElementById("myName").innerText   = myName;

let currentTarget = null;
let ownerMap = {};

async function loadOwners() {
  const { data, error } = await db
    .from("numbers")
    .select("number, owner");

  if (!error && data) {
    data.forEach(n => {
      ownerMap[n.number] = n.owner;
    });
  }
}
loadOwners();

function logout() {
  localStorage.clear();
  location.href = "index.html";
}

function openChat() {
  const target = document.getElementById("targetNumber").value.trim();
  if (!target) return alert("Masukkan nomor tujuan");

  currentTarget = target;
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
    console.error("LOAD CHAT ERROR:", error);
    return;
  }

  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  (data || []).forEach(m => {
    const div = document.createElement("div");
    div.className = m.from_number === myNumber ? "msg me" : "msg other";

    const sender =
      m.from_number === myNumber
        ? "Aku"
        : ownerMap[m.from_number] || "User";

    div.innerText = `${sender}: ${m.message}`;
    chat.appendChild(div);
  });

  chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text) return;
  if (!currentTarget) return alert("Pilih lawan chat dulu");

  const { error } = await db.from("chats").insert({
    from_number: myNumber,
    to_number: currentTarget,
    message: text
  });

  if (error) {
    console.error("SEND ERROR:", error);
    alert("Gagal mengirim pesan");
    return;
  }

  input.value = "";
  loadChat();
}

setInterval(() => {
  if (currentTarget) loadChat();
}, 2000);