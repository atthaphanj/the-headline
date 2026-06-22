<?php
/**
 * THE HEADLINE - Configuration
 * คัดลอกไฟล์นี้เป็น config.local.php แล้วใส่ค่าจริง
 */

return [
    // OneSignal (จาก Dashboard > Settings > Keys & IDs)
    'onesignal_app_id'  => 'YOUR_ONESIGNAL_APP_ID',
    'onesignal_api_key' => 'YOUR_ONESIGNAL_REST_API_KEY',

    // Basic Auth สำหรับดึงข่าว
    'api_username' => 'uniserv',
    'api_password' => 'uniservadmin',

    // URL หน้าเว็บ (ใช้ใน deep link ของ notification)
    'site_url' => 'https://your-domain.com',

    // ไฟล์บันทึกเวลาข่าวล่าสุด
    'last_news_time_file' => __DIR__ . '/last_news_time.txt',

    // API endpoints
    'api_urls' => [
        'https://ujic.uniserv.cmu.ac.th/api/api.php',
        'https://haze.cmuccdc.org/api/api.php',
        'https://cm-command.cmuccdc.org/api/api.php',
        'https://lp-hff.cmuccdc.org/api/api.php',
        'https://lp-ff.cmuccdc.org/api/api.php',
        'https://warroom-lp.cmuccdc.org/api/api.php',
        'https://cr-ff.cmuccdc.org/api/api.php',
        'https://mhs-ff.cmuccdc.org/api/api.php',
        'https://mhs-warroom.cmuccdc.org/api/api.php',
        'https://bnep-doiluang.cmuccdc.org/api/api.php',
        'https://sam-ngao-warroom.cmuccdc.org/api/api.php',
        'https://mae-sariang-ff.cmuccdc.org/api/api.php',
    ],

    'source_mapping' => [
        'https://ujic.uniserv.cmu.ac.th/api/api.php'           => ['province' => 'เชียงใหม่',   'amphoe' => 'ทั่วไป'],
        'https://haze.cmuccdc.org/api/api.php'                 => ['province' => 'ภาคประชาชน', 'amphoe' => 'ทั่วไป'],
        'https://cm-command.cmuccdc.org/api/api.php'           => ['province' => 'เชียงใหม่',   'amphoe' => 'ทั่วไป'],
        'https://lp-hff.cmuccdc.org/api/api.php'               => ['province' => 'ลำพูน',      'amphoe' => 'ทั่วไป'],
        'https://lp-ff.cmuccdc.org/api/api.php'                => ['province' => 'ลำพูน',      'amphoe' => 'ทั่วไป'],
        'https://warroom-lp.cmuccdc.org/api/api.php'           => ['province' => 'ลำปาง',      'amphoe' => 'ทั่วไป'],
        'https://cr-ff.cmuccdc.org/api/api.php'                => ['province' => 'เชียงราย',    'amphoe' => 'ทั่วไป'],
        'https://mhs-ff.cmuccdc.org/api/api.php'               => ['province' => 'แม่ฮ่องสอน', 'amphoe' => 'ทั่วไป'],
        'https://mhs-warroom.cmuccdc.org/api/api.php'          => ['province' => 'แม่ฮ่องสอน', 'amphoe' => 'ทั่วไป'],
        'https://bnep-doiluang.cmuccdc.org/api/api.php'        => ['province' => 'ลำปาง',      'amphoe' => 'ดอยหลวง'],
        'https://sam-ngao-warroom.cmuccdc.org/api/api.php'     => ['province' => 'ตาก',        'amphoe' => 'สามเงา'],
        'https://mae-sariang-ff.cmuccdc.org/api/api.php'       => ['province' => 'แม่ฮ่องสอน', 'amphoe' => 'แม่สะเรียง'],
    ],
];
