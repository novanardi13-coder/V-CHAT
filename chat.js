const myNumber = localStorage.getItem("myNumber");
const myName = localStorage.getItem("myName");

if (!myNumber) {
    window.location.href = "index.html";
}

const SUPABASE_URL = "https://qxxmxzxipoodeobehcoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_53x04KOXjY6Eg9tfhAPQWg_MSfaBSPV";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentTarget = null;
let ownerMap = {};

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("myNumber")) document.getElementById("myNumber").innerText = myNumber;
    if (document.getElementById("myName")) document.getElementById("myName").innerText = myName;
    loadOwners();
    displaySavedContacts();
});

async function loadOwners() {
    const { data, error } = await db.from("numbers").select("number, owner");
    if (!error) {
        data.forEach(n => {
            ownerMap[n.number] = n.owner;
        });
        displaySavedContacts();
    }
}

function saveContact() {
    const input = document.getElementById("newContactNumber");
    const nomorBaru = input.value.trim();

    if (!nomorBaru) {
        alert("Masukkan nomor tujuan!");
        return;
    }
    if (nomorBaru === myNumber) {
        alert("Tidak bisa menambah nomor sendiri!");
        return;
    }

    let daftarKontak = JSON.parse(localStorage.getItem("mySavedContacts")) || [];

    if (!daftarKontak.includes(nomorBaru)) {
        daftarKontak.push(nomorBaru);
        localStorage.setItem("mySavedContacts", JSON.stringify(daftarKontak));
        input.value = "";
        displaySavedContacts();
        alert("Kontak berhasil disimpan!");
    } else {
        alert("Nomor sudah ada di daftar.");
    }
}

function displaySavedContacts() {
    const container = document.getElementById("myContacts");
    const daftarKontak = JSON.parse(localStorage.getItem("mySavedContacts")) || [];

    if (daftarKontak.length === 0) {
        container.innerHTML = "<small style='color:gray'>Belum ada kontak tersimpan</small>";
        return;
    }

    container.innerHTML = "";
    daftarKontak.forEach(nomor => {
        const div = document.createElement("div");
        div.className = "contact-item";
        
        const namaTampilan = ownerMap[nomor] ? `${ownerMap[nomor]} (${nomor})` : nomor;
        
        div.innerHTML = `<b>👤 ${namaTampilan}</b>`;
        div.onclick = () => startChat(nomor);
        container.appendChild(div);
    });
}

function startChat(nomor) {
    currentTarget = nomor;
    
    const chatWin = document.getElementById("chat-window");
    if (chatWin) chatWin.style.display = "block";
    
    const label = document.getElementById("chattingWith");
    if (label) label.innerText = ownerMap[nomor] || nomor;

    loadChat();
}

async function loadChat() {
    if (!currentTarget) return;

    const { data, error } = await db
        .from("chats")
        .select("*")
        .or(`from_number.eq."${myNumber}",to_number.eq."${myNumber}"`)
        .order("created_at", { ascending: true });

    if (error) return;

    const chatDiv = document.getElementById("chat");
    chatDiv.innerHTML = "";

    data.filter(m =>
        (m.from_number === myNumber && m.to_number === currentTarget) ||
        (m.from_number === currentTarget && m.to_number === myNumber)
    ).forEach(m => {
        const div = document.createElement("div");
        div.className = m.from_number === myNumber ? "msg me" : "msg other";
        
        const sender = m.from_number === myNumber ? : (ownerMap[m.from_number] || m.from_number);
        div.innerHTML = `<small>${sender}: </small>${m.message}`;
        chatDiv.appendChild(div);
    });

    chatDiv.scrollTop = chatDiv.scrollHeight;
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

    if (!error) {
        input.value = "";
        loadChat();
    } else {
        alert("Gagal kirim pesan!");
    }
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

function DN() {
    window.location.href = "DAFNOM.html";
}

setInterval(() => {
    if (currentTarget) loadChat();
}, 2000);