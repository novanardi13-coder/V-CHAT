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
        
        const sender = m.from_number === myNumber ? "" : (ownerMap[m.from_number] || m.from_number);
        div.innerHTML = `<small>${sender} </small>${m.message}`;
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

function toggleSettings() {
  document.getElementById("settingsPanel")
          .classList.toggle("active");
}

function changeFontSize() {
  const size = document.getElementById("fontSizeSelect").value;

  document.body.classList.remove(
    "small-font",
    "normal-font",
    "large-font"
  );

  document.body.classList.add(size + "-font");

  localStorage.setItem("fontSize", size);
}

// ===== TAMBAHAN FUNGSI DARK THEME =====
function changeTheme() {
    const theme = document.getElementById("themeSelect").value;
    
    if (theme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
    } else {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
    }
    
    localStorage.setItem("theme", theme);
}

// Update window.onload untuk menyertakan theme
const originalOnload = window.onload;
window.onload = function() {
    // Panggil fungsi asli
    if (originalOnload) originalOnload();
    
    // Tambahan untuk theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.getElementById("themeSelect").value = savedTheme;
    
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.add("dark-theme");
    }
}

// ===== 5 FITUR BARU DI PENGATURAN =====

// FITUR 1: Notifikasi
function changeNotification() {
    const notif = document.getElementById("notificationSelect").value;
    localStorage.setItem("notification", notif);
    
    if (notif === "off") {
        console.log("🔕 Notifikasi dimatikan");
    } else if (notif === "mentions") {
        console.log("🔔 Notifikasi hanya untuk mention");
    } else {
        console.log("🔔 Notifikasi untuk semua pesan");
    }
}

// FITUR 2: Bahasa
function changeLanguage() {
    const lang = document.getElementById("languageSelect").value;
    localStorage.setItem("language", lang);
    
    // Ganti teks berdasarkan bahasa
    const texts = {
        id: {
            myContacts: "Kontak Saya",
            chatWith: "Chatting dengan:",
            send: "Kirim",
            saveContact: "Simpan Kontak",
            enterNumber: "Masukkan nomor baru..."
        },
        en: {
            myContacts: "My Contacts",
            chatWith: "Chatting with:",
            send: "Send",
            saveContact: "Save Contact",
            enterNumber: "Enter new number..."
        },
        ar: {
            myContacts: "جهات الاتصال الخاصة بي",
            chatWith: "الدردشة مع:",
            send: "إرسال",
            saveContact: "حفظ جهة الاتصال",
            enterNumber: "أدخل رقمًا جديدًا..."
        }
    };
    
    if (texts[lang]) {
        document.querySelector(".contact-box h3").textContent = texts[lang].myContacts;
        document.getElementById("chattingWith").previousSibling.textContent = texts[lang].chatWith + " ";
        document.querySelector(".B2").textContent = texts[lang].send;
        document.querySelector(".B").textContent = texts[lang].saveContact;
        document.getElementById("newContactNumber").placeholder = texts[lang].enterNumber;
    }
    
    alert(`🌐 Bahasa diubah ke ${lang === 'id' ? 'Indonesia' : lang === 'en' ? 'English' : 'العربية'}`);
}

// FITUR 3: Enter untuk Kirim
function changeEnterSend() {
    const enterSend = document.getElementById("enterSendSelect").value;
    localStorage.setItem("enterSend", enterSend);
    
    const messageInput = document.getElementById("messageInput");
    
    // Hapus event listener lama
    const newInput = messageInput.cloneNode(true);
    messageInput.parentNode.replaceChild(newInput, messageInput);
    
    // Tambah event listener baru
    if (enterSend === "on") {
        newInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        console.log("✅ Enter untuk kirim: AKTIF");
    } else {
        console.log("❌ Enter untuk kirim: NONAKTIF");
    }
}

// FITUR 4: Tampilkan Jam
function changeTimeDisplay() {
    const timeDisplay = document.getElementById("timeDisplaySelect").value;
    localStorage.setItem("timeDisplay", timeDisplay);
    
    // Reload chat untuk menampilkan jam
    if (currentTarget) loadChat();
    console.log(`⏰ Tampilan jam: ${timeDisplay === 'all' ? 'Semua pesan' : timeDisplay === 'latest' ? 'Pesan terbaru' : 'Mati'}`);
}

// MODIFIKASI FUNGSI LOADCHAT untuk menampilkan jam
const originalLoadChat = loadChat;
loadChat = async function() {
    if (!currentTarget) return;

    const { data, error } = await db
        .from("chats")
        .select("*")
        .or(`from_number.eq."${myNumber}",to_number.eq."${myNumber}"`)
        .order("created_at", { ascending: true });

    if (error) return;

    const chatDiv = document.getElementById("chat");
    chatDiv.innerHTML = "";

    const timeSetting = localStorage.getItem("timeDisplay") || "off";
    const filteredData = data.filter(m =>
        (m.from_number === myNumber && m.to_number === currentTarget) ||
        (m.from_number === currentTarget && m.to_number === myNumber)
    );

    filteredData.forEach((m, index) => {
        const div = document.createElement("div");
        div.className = m.from_number === myNumber ? "msg me" : "msg other";
        
        const sender = m.from_number === myNumber ? "" : (ownerMap[m.from_number] || m.from_number);
        let timeHtml = "";
        
        // Tampilkan jam sesuai pengaturan
        if (timeSetting === "all" || (timeSetting === "latest" && index === filteredData.length - 1)) {
            const time = new Date(m.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            });
            timeHtml = `<small style="opacity:0.7; font-size:10px; display:block;">🕐 ${time}</small>`;
        }
        
        div.innerHTML = `<small>${sender} </small>${m.message}${timeHtml}`;
        chatDiv.appendChild(div);
    });

    chatDiv.scrollTop = chatDiv.scrollHeight;
}

// FITUR 5: Mode Hemat Data
function changeDataSaver() {
    const dataSaver = document.getElementById("dataSaverSelect").value;
    localStorage.setItem("dataSaver", dataSaver);
    
    if (dataSaver === "on") {
        // Kurangi kualitas gambar, nonaktifkan animasi
        document.body.classList.add("data-saver");
        // Hentikan auto-refresh jika terlalu boros
        if (window.chatInterval) {
            clearInterval(window.chatInterval);
            window.chatInterval = setInterval(() => {
                if (currentTarget) loadChat();
            }, 5000); // Lebih jarang (5 detik)
        }
        console.log("📶 Mode Hemat Data: AKTIF");
    } else {
        document.body.classList.remove("data-saver");
        // Kembalikan ke interval normal
        if (window.chatInterval) {
            clearInterval(window.chatInterval);
            window.chatInterval = setInterval(() => {
                if (currentTarget) loadChat();
            }, 2000);
        }
        console.log("📶 Mode Hemat Data: NONAKTIF");
    }
}

// FITUR BONUS: Reset semua pengaturan
function resetSettings() {
    if (confirm("Reset semua pengaturan ke default?")) {
        // Hapus semua settings dari localStorage
        localStorage.removeItem("fontSize");
        localStorage.removeItem("theme");
        localStorage.removeItem("notification");
        localStorage.removeItem("language");
        localStorage.removeItem("enterSend");
        localStorage.removeItem("timeDisplay");
        localStorage.removeItem("dataSaver");
        
        // Reset ke default
        location.reload();
    }
}

// UPDATE FUNGSI WINDOW.ONLOAD
const originalWindowOnload = window.onload;
window.onload = function() {
    if (originalWindowOnload) originalWindowOnload();
    
    // Load semua pengaturan
    const settings = {
        fontSize: localStorage.getItem("fontSize") || "normal",
        theme: localStorage.getItem("theme") || "dark",
        notification: localStorage.getItem("notification") || "off",
        language: localStorage.getItem("language") || "id",
        enterSend: localStorage.getItem("enterSend") || "on",
        timeDisplay: localStorage.getItem("timeDisplay") || "off",
        dataSaver: localStorage.getItem("dataSaver") || "off"
    };
    
    // Apply semua settings
    document.getElementById("fontSizeSelect").value = settings.fontSize;
    document.getElementById("themeSelect").value = settings.theme;
    document.getElementById("notificationSelect").value = settings.notification;
    document.getElementById("languageSelect").value = settings.language;
    document.getElementById("enterSendSelect").value = settings.enterSend;
    document.getElementById("timeDisplaySelect").value = settings.timeDisplay;
    document.getElementById("dataSaverSelect").value = settings.dataSaver;
    
    // Apply theme
    if (settings.theme === "light") {
        document.body.classList.add("light-theme");
    }
    
    // Apply font size
    document.body.classList.add(settings.fontSize + "-font");
    
    // Apply enter send
    if (settings.enterSend === "on") {
        document.getElementById("messageInput").addEventListener("keypress", function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Apply language
    changeLanguage();
    
    // Setup chat interval dengan mempertimbangkan data saver
    const intervalTime = settings.dataSaver === "on" ? 5000 : 2000;
    window.chatInterval = setInterval(() => {
        if (currentTarget) loadChat();
    }, intervalTime);
}

window.onload = function() {
  const savedSize = localStorage.getItem("fontSize");

  if (savedSize) {
    document.body.classList.add(savedSize + "-font");
    document.getElementById("fontSizeSelect").value = savedSize;
  }
}