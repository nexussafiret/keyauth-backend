# KeyAuth Backend API

Backend server untuk KeyAuth License Management System.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Edit file `.env` dan tambahkan Discord Webhook URL Anda:
```
PORT=5000
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
JWT_SECRET=keyauth_secret_key_2025
```

### 3. Start Server
```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user baru
- `POST /api/auth/login` - Login user

### Licenses
- `POST /api/licenses/create` - Create license key(s)
- `GET /api/licenses?userId=xxx` - Get all licenses
- `POST /api/licenses/verify` - Verify license key (untuk app integration)
- `DELETE /api/licenses/:id` - Delete license
- `POST /api/licenses/delete-bulk` - Delete multiple licenses

### Users
- `GET /api/users/:id` - Get user info

## 🔑 License Verification (Untuk Aplikasi)

Contoh kode untuk verify license dari aplikasi Anda:

```javascript
// JavaScript Example
const response = await fetch('http://localhost:5000/api/licenses/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    licenseKey: 'YOUR-LICENSE-KEY',
    hwid: 'DEVICE-HWID'
  })
});

const result = await response.json();
if (result.valid) {
  console.log('License valid!');
} else {
  console.log('License invalid:', result.message);
}
```

## 📊 Discord Logging

Semua aktivitas akan dikirim ke Discord webhook:
- ✅ User registration
- 🔑 License creation
- ✔️ License verification

## 💾 Data Storage

Saat ini menggunakan **in-memory storage** (data hilang saat restart).
Untuk production, ganti dengan database real (MongoDB, PostgreSQL, dll).
