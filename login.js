const SUPABASE_URL = "https://qxxmxzxipoodeobehcoy.supabase.co";
const SUPABASE_KEY = "sb_publishable_53x04KOXjY6Eg9tfhAPQWg_MSfaBSPV";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function login() {
  const number = document.getElementById("number").value.trim();
  const pin = document.getElementById("pin").value.trim();
  
  if (!number || !pin) {
    alert("Nomor dan PIN wajib diisi");
    return;
  }
  
  const { data, error } = await db
    .from("numbers")
    .select("number")
    .eq("number", number)
    .eq("pin", pin)
    .eq("active", true)
    .single();
  
  if (error || !data) {
    console.log(error);
    alert("Nomor atau PIN salah");
    return;
  }
  
  localStorage.setItem("myNumber", data.number);
  window.location.href = "chat.html";
}