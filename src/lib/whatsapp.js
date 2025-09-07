const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const whatsapp = new Client({
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  authStrategy: new LocalAuth(),
  // webVersion: "2.2412.54",
  // webVersionCache: {
  //   type: "remote",
  //   remotePath:
  //     "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html",
  // },
});

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, {
    small: true,
  });
});

whatsapp.on("ready", () => {
  console.log("Client is ready!");
});
whatsapp.on("authenticated", () => {
  console.log("🔐 Cliente autenticado correctamente");
});

whatsapp.on("auth_failure", (msg) => {
  console.error("❌ Fallo de autenticación:", msg);
});

whatsapp.on("disconnected", (reason) => {
  console.error("⚠️ Cliente desconectado:", reason);
});
whatsapp.on("loading_screen", (percent, message) => {
  console.log("⌛ Cargando:", percent, message);
});

whatsapp.on("error", (err) => {
  console.error("❌ Error del cliente:", err);
});


module.exports = { whatsapp };
