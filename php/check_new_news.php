<?php
/**
 * THE HEADLINE - Check New News & Send Push Notification
 *
 * รันผ่าน Cron ทุก 1-5 นาที:
 *   * * * * * php /path/to/the-headline/php/check_new_news.php >> /var/log/headline_push.log 2>&1
 *
 * หรือเรียกผ่าน browser (ควรใส่ secret key):
 *   https://your-domain.com/php/check_new_news.php?key=YOUR_SECRET
 */

declare(strict_types=1);

// --- Load config ---
$configFile = __DIR__ . '/config.local.php';
if (!file_exists($configFile)) {
    $configFile = __DIR__ . '/config.php';
}
$config = require $configFile;

// Optional: ป้องกันการเรียกจาก browser โดยไม่มี key
$cronSecret = $config['cron_secret'] ?? null;
if (php_sapi_name() !== 'cli' && $cronSecret) {
    $key = $_GET['key'] ?? '';
    if (!hash_equals($cronSecret, $key)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Forbidden']);
        exit;
    }
}

// --- Helper functions ---

function log_msg(string $msg): void
{
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    if (php_sapi_name() === 'cli') {
        echo $line;
    } else {
        error_log(trim($line));
    }
}

function read_last_news_time(string $filePath): DateTime
{
    if (!file_exists($filePath)) {
        return new DateTime('1970-01-01 00:00:00');
    }
    $content = trim(file_get_contents($filePath));
    if (empty($content)) {
        return new DateTime('1970-01-01 00:00:00');
    }
    try {
        return new DateTime($content);
    } catch (Exception $e) {
        return new DateTime('1970-01-01 00:00:00');
    }
}

function write_last_news_time(string $filePath, DateTime $dt): bool
{
    return file_put_contents($filePath, $dt->format('Y-m-d H:i:s')) !== false;
}

function is_image_file(?string $url): bool
{
    if (!$url) return false;
    $ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION));
    return in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'], true);
}

function strip_html(string $html): string
{
    return trim(html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8'));
}

function fetch_news_from_api(string $url, string $date, string $auth): array
{
    $ch = curl_init("{$url}?date={$date}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_HTTPHEADER     => ["Authorization: {$auth}"],
        CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false || $httpCode !== 200) {
        log_msg("API error: {$url} (HTTP {$httpCode})");
        return [];
    }

    $json = json_decode($response, true);
    if (!is_array($json) || ($json['status'] ?? '') !== 'success' || !is_array($json['data'] ?? null)) {
        return [];
    }
    return $json['data'];
}

function send_onesignal_notification(array $config, string $title, string $message, ?string $url = null): bool
{
    $appId  = $config['onesignal_app_id'];
    $apiKey = $config['onesignal_api_key'];

    if ($appId === 'YOUR_ONESIGNAL_APP_ID' || $apiKey === 'YOUR_ONESIGNAL_REST_API_KEY') {
        log_msg('OneSignal not configured. Skipping push.');
        return false;
    }

    $payload = [
        'app_id'   => $appId,
        'contents' => ['en' => $message, 'th' => $message],
        'headings' => ['en' => $title, 'th' => $title],
        'included_segments' => ['All'],
    ];

    if ($url) {
        $payload['url'] = $url;
        $payload['web_url'] = $url;
    }

    $ch = curl_init('https://api.onesignal.com/notifications');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json; charset=utf-8',
            "Authorization: Basic {$apiKey}",
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response === false || $httpCode < 200 || $httpCode >= 300) {
        log_msg("OneSignal error (HTTP {$httpCode}): {$response}");
        return false;
    }

    $result = json_decode($response, true);
    log_msg('Push sent. Recipients: ' . ($result['recipients'] ?? 'unknown'));
    return true;
}

// --- Main logic ---

log_msg('=== Check new news started ===');

$lastNewsTime = read_last_news_time($config['last_news_time_file']);
log_msg('Last news time: ' . $lastNewsTime->format('Y-m-d H:i:s'));

$today = date('Y-m-d');
$auth  = 'Basic ' . base64_encode($config['api_username'] . ':' . $config['api_password']);

$allItems = [];
foreach ($config['api_urls'] as $apiUrl) {
    $items = fetch_news_from_api($apiUrl, $today, $auth);
    $mapInfo = $config['source_mapping'][$apiUrl] ?? ['province' => 'อื่นๆ', 'amphoe' => 'อื่นๆ'];
    foreach ($items as &$item) {
        $item['source_api'] = $apiUrl;
        $item['province']   = $mapInfo['province'];
        $item['amphoe']     = $mapInfo['amphoe'];
    }
    unset($item);
    $allItems = array_merge($allItems, $items);
}

// กรองข้อมูล (เหมือน frontend)
$unsentMsgIds = [];
foreach ($allItems as $item) {
    if (($item['msg_type'] ?? '') === 'unsend' && !empty($item['msg_id'])) {
        $unsentMsgIds[$item['msg_id']] = true;
    }
}

$cleanItems = [];
foreach ($allItems as $item) {
    if (($item['msg_type'] ?? '') === 'unsend') continue;
    if (($item['msg_type'] ?? '') === 'sticker') continue;
    if (!empty($item['msg_id']) && isset($unsentMsgIds[$item['msg_id']])) continue;
    if (isset($item['is_show']) && (int)$item['is_show'] === 0) continue;
    if (($item['event_type'] ?? '') === 'memberJoined') continue;
    if (!empty($item['file_url']) && !is_image_file($item['file_url'])) continue;
    if (empty($item['created_at'])) continue;

    try {
        $itemDate = new DateTime(str_replace(' ', 'T', $item['created_at']));
    } catch (Exception $e) {
        continue;
    }

    // เฉพาะข่าววันนี้
    if ($itemDate->format('Y-m-d') !== $today) continue;

    $cleanItems[] = $item;
}

// หาข่าวที่ใหม่กว่า last_news_time
$newItems = [];
$latestTime = clone $lastNewsTime;

foreach ($cleanItems as $item) {
    $itemDate = new DateTime(str_replace(' ', 'T', $item['created_at']));
    if ($itemDate > $lastNewsTime) {
        $newItems[] = $item;
        if ($itemDate > $latestTime) {
            $latestTime = $itemDate;
        }
    }
}

if (empty($newItems)) {
    log_msg('No new news found.');
    if (php_sapi_name() !== 'cli') {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'ok', 'message' => 'No new news', 'last_time' => $lastNewsTime->format('Y-m-d H:i:s')]);
    }
    exit(0);
}

// เรียงข่าวใหม่จากใหม่สุดไปเก่าสุด
usort($newItems, function ($a, $b) {
    $da = new DateTime(str_replace(' ', 'T', $a['created_at']));
    $db = new DateTime(str_replace(' ', 'T', $b['created_at']));
    return $db <=> $da;
});

log_msg('Found ' . count($newItems) . ' new item(s).');

// ส่ง Push สำหรับข่าวใหม่ (สูงสุด 3 รายการต่อรอบ เพื่อไม่ spam)
$maxPush = 3;
$pushed = 0;

foreach (array_slice($newItems, 0, $maxPush) as $item) {
    $rawText = !empty($item['text']) ? strip_html($item['text']) : '';
    if (mb_strlen($rawText) > 100) {
        $rawText = mb_substr($rawText, 0, 100) . '...';
    }
    if (empty($rawText)) {
        $rawText = 'ข่าวใหม่จาก ' . ($item['province'] ?? 'THE HEADLINE');
    }

    $province = $item['province'] ?? '';
    $amphoe   = $item['amphoe'] ?? '';
    $location = ($amphoe !== 'ทั่วไป' && $amphoe) ? "{$province} ({$amphoe})" : $province;

    $title   = 'THE HEADLINE';
    $message = "มีข่าวใหม่จาก THE HEADLINE: [{$location}] {$rawText}";

    $detailUrl = rtrim($config['site_url'], '/');
    if (!empty($item['id'])) {
        $sourceParam = !empty($item['source_api']) ? '&source=' . urlencode($item['source_api']) : '';
        $detailUrl .= "/newsdetail?id={$item['id']}{$sourceParam}";
    }

    if (send_onesignal_notification($config, $title, $message, $detailUrl)) {
        $pushed++;
    }
}

// อัปเดตเวลาล่าสุด
if (write_last_news_time($config['last_news_time_file'], $latestTime)) {
    log_msg('Updated last_news_time.txt to: ' . $latestTime->format('Y-m-d H:i:s'));
} else {
    log_msg('ERROR: Failed to write last_news_time.txt');
}

log_msg("Done. Pushed {$pushed} notification(s).");

if (php_sapi_name() !== 'cli') {
    header('Content-Type: application/json');
    echo json_encode([
        'status'      => 'ok',
        'new_count'   => count($newItems),
        'pushed'      => $pushed,
        'latest_time' => $latestTime->format('Y-m-d H:i:s'),
    ], JSON_UNESCAPED_UNICODE);
}
