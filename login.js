if (localStorage.getItem("myNumber")) {
    window.location.href = "chat.html"; 
}

const SUPABASE_URL = "https://qxxmxzxipoodeobehcoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_53x04KOXjY6Eg9tfhAPQWg_MSfaBSPV";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function login() {
  const number = document.getElementById("number").value.trim();
  const pin = document.getElementById("pin").value.trim();

  if (!number || !pin) {
    alert("Isi nomor dan PIN!");
    return;
  }

  const { data, error } = await db
    .from("numbers")
    .select("*")
    .eq("number", number)
    .eq("pin", pin)
    .single();

  if (error || !data) {
    alert("Nomor atau PIN salah");
    return;
  }

  localStorage.setItem("myNumber", data.number);
  localStorage.setItem("myName", data.owner);
  
  window.location.href = "chat.html";
}