# THE HEADLINE - React + Vite + PWA + OneSignal

แปลงจาก `news_daily.php` เป็น React frontend พร้อม PWA ติดตั้งบนมือถือ และ Push Notification ผ่าน OneSignal

## โครงสร้าง

```
the-headline/
├── src/                    # React frontend
│   ├── components/         # Header, FilterBar, NewsCard, ...
│   ├── pages/NewsDaily.jsx # หน้าข่าวประจำวัน
│   └── utils/              # API, constants, OneSignal
├── public/                 # Static assets + PWA + OneSignal worker
├── php/
│   ├── check_new_news.php  # Cron: ตรวจข่าวใหม่ + ส่ง Push
│   ├── config.php          # ค่า config เริ่มต้น
│   └── last_news_time.txt  # บันทึกเวลาข่าวล่าสุด
└── package.json
```

## ติดตั้ง Frontend

```bash
cd the-headline
npm install
cp .env.example .env
# แก้ VITE_ONESIGNAL_APP_ID ใน .env
npm run dev
```

Build สำหรับ production:

```bash
npm run build
# ไฟล์อยู่ใน dist/ — deploy ไป web server
```

## ตั้งค่า OneSignal

1. สร้าง Web App ที่ [OneSignal Dashboard](https://onesignal.com)
2. คัดลอก **App ID** → ใส่ใน `.env` เป็น `VITE_ONESIGNAL_APP_ID`
3. คัดลอก **REST API Key** → ใส่ใน `php/config.local.php`
4. ตั้งค่า Site URL ใน OneSignal ให้ตรงกับ domain จริง
5. อัปโหลดไอคอน PWA: `public/pwa-192x192.png`, `public/pwa-512x512.png`, `public/apple-touch-icon.png`

## ตั้งค่า PHP Push Notification

```bash
cp php/config.local.php.example php/config.local.php
# แก้ onesignal_app_id, onesignal_api_key, site_url
```

### Logic การทำงาน

1. `check_new_news.php` ดึงข่าววันนี้จาก API ทั้งหมด
2. อ่าน `last_news_time.txt` (เช่น `2026-06-19 14:30:00`)
3. ถ้า `created_at` ของข่าว **มากกว่า** เวลาที่บันทึก → **มีข่าวใหม่**
4. ส่ง Push ผ่าน OneSignal REST API (cURL):
   - หัวข้อ: `THE HEADLINE`
   - ข้อความ: `มีข่าวใหม่จาก THE HEADLINE: [จังหวัด] หัวข้อข่าว...`
5. อัปเดต `last_news_time.txt` เป็นเวลาข่าวใหม่ล่าสุด

### ตั้ง Cron Job (ทุก 2 นาที)

**Linux:**
```cron
*/2 * * * * php /var/www/the-headline/php/check_new_news.php >> /var/log/headline_push.log 2>&1
```

**Windows Task Scheduler:**
```
Program: C:\php\php.exe
Arguments: C:\path\to\the-headline\php\check_new_news.php
```

**เรียกผ่าน Browser (ทดสอบ):**
```
https://your-domain.com/php/check_new_news.php?key=YOUR_CRON_SECRET
```

## PWA ติดตั้งบนมือถือ

- **Android/Chrome**: แบนเนอร์ "ติดตั้งเลย" จะแสดงอัตโนมัติ
- **iOS Safari**: กด Share → Add to Home Screen
- Service Worker อัปเดตอัตโนมัติเมื่อมี build ใหม่

## Deploy แนะนำ

```
/var/www/
├── index.html          ← จาก dist/
├── assets/             ← จาก dist/assets/
├── php/                ← โฟลเดอร์ php ทั้งหมด
└── OneSignalSDKWorker.js
```

ตั้ง Apache/Nginx:
- `/` → serve React static files
- `/php/` → execute PHP scripts

## Environment Variables

| ตัวแปร | ที่ใช้ | คำอธิบาย |
|--------|--------|----------|
| `VITE_ONESIGNAL_APP_ID` | Frontend | OneSignal App ID |
| `onesignal_api_key` | PHP config | REST API Key สำหรับส่ง Push |
| `site_url` | PHP config | URL หลักสำหรับ deep link ใน notification |
