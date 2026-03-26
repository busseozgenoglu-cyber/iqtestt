import express from "express";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "dist")));

const PAYTR_MERCHANT_ID = process.env.PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT || "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post("/api/payment", async (req, res) => {
  try {
    const { name, email, phone, iq } = req.body;
    if (!PAYTR_MERCHANT_ID) return res.status(500).json({ error: "PayTR bilgileri yapılandırılmamış." });

    const merchant_oid = "IQ" + Date.now();
    const payment_amount = "5999";
    const currency = "TL";
    const user_ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "1.2.3.4";
    const email_clean = email.trim();
    const user_basket = Buffer.from(JSON.stringify([["IQ Test Raporu", "59.99", 1]])).toString("base64");
    const merchant_ok_url = process.env.BASE_URL + "/odeme-basarili?iq=" + iq + "&name=" + encodeURIComponent(name) + "&email=" + encodeURIComponent(email);
    const merchant_fail_url = process.env.BASE_URL + "/odeme-basarisiz";
    const no_installment = "0";
    const max_installment = "0";
    const test_mode = process.env.PAYTR_TEST_MODE || "1";

    const hash_str = PAYTR_MERCHANT_ID + user_ip + merchant_oid + email_clean + payment_amount + user_basket + no_installment + max_installment + currency + test_mode;
    const paytr_token = crypto.createHmac("sha256", PAYTR_MERCHANT_KEY + PAYTR_MERCHANT_SALT).update(hash_str).digest("base64");

    const params = new URLSearchParams({
      merchant_id: PAYTR_MERCHANT_ID, user_ip, merchant_oid,
      email: email_clean, payment_amount, paytr_token, user_basket,
      debug_on: "1", no_installment, max_installment,
      user_name: name.trim(), user_phone: phone.trim(),
      merchant_ok_url, merchant_fail_url, currency, test_mode, lang: "tr",
    });

    const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const paytrData = await paytrRes.json();

    if (paytrData.status === "success") {
      // Sana bildirim gönder
      if (process.env.GMAIL_USER) {
        transporter.sendMail({
          from: `"IQ Test" <${process.env.GMAIL_USER}>`,
          to: process.env.GMAIL_USER,
          subject: `💳 Yeni Ödeme Başlatıldı — ${name} IQ:${iq}`,
          html: `<h2>Ödeme Başlatıldı</h2>
            <p><b>Ad:</b> ${name}</p>
            <p><b>E-posta:</b> ${email}</p>
            <p><b>Telefon:</b> ${phone}</p>
            <p><b>IQ Skoru:</b> <span style="color:#16a34a;font-size:20px">${iq}</span></p>
            <p><b>Sipariş:</b> ${merchant_oid}</p>`,
        }).catch(e => console.error("Mail err:", e));
      }
      res.json({ token: paytrData.token });
    } else {
      res.status(400).json({ error: paytrData.reason || "Token alınamadı." });
    }
  } catch (err) {
    console.error("PayTR error:", err);
    res.status(500).json({ error: "Sunucu hatası." });
  }
});

app.post("/api/paytr-notification", async (req, res) => {
  const { merchant_oid, status, total_amount, hash } = req.body;
  const check = crypto.createHmac("sha256", PAYTR_MERCHANT_KEY + PAYTR_MERCHANT_SALT).update(merchant_oid + PAYTR_MERCHANT_SALT + status).digest("base64");
  if (check !== hash) return res.send("PAYTR_HASH_MISMATCH");
  if (status === "success" && process.env.GMAIL_USER) {
    transporter.sendMail({
      from: `"IQ Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: `✅ ÖDEME ONAYLANDI — ${merchant_oid}`,
      html: `<h2 style="color:#16a34a">Ödeme Onaylandı!</h2><p>Sipariş: <b>${merchant_oid}</b></p><p>Tutar: <b>${parseInt(total_amount)/100} ₺</b></p>`,
    }).catch(e => console.error("Mail err:", e));
  }
  res.send("OK");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
