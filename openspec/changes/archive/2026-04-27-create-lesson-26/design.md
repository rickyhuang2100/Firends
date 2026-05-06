## Context

本專案已有成熟的 HTML 教學頁面模板，但在實作第 26 課時發生了 A-B 循環失效與結構混亂的問題。需要重新設計邏輯以確保時間碼與 `26.srt` 完美對齊。

## Goals / Non-Goals

**Goals:**
- **修復 A-B 循環播放**：確保點擊按鈕後，影片能準確跳轉至起點並在終點回彈。
- **清理 HTML 結構**：刪除 `public/26.html` 中重複的 section 區塊與不屬於本課的內容。
- **精確對齊時間碼**：根據 `26.srt` 的毫秒級數據進行秒數換算。

**Non-Goals:**
- 不增加額外的外部庫。

## Decisions

- **重新換算時間碼**：
    - Ross (Question): 01:20,920 -> 01:21 至 01:24.2 -> 01:24。
    - Joey (Hurt): 01:30,040 -> 01:30 至 01:31.4 -> 01:31。
    - Joey (Bigger): 01:49,720 -> 01:49.7 至 01:52.0 -> 01:52。
- **優化 A-B 循環邏輯**：
    - 在 `toggleABLoop` 函式中使用 `setInterval` 每 100ms 檢查 `currentTime`，確保回跳靈敏。
    - 使用 `dataset.section` 與 `active` class 控制顯示，並在每次 `toggle` 時清除舊的 `setInterval`。
- **全量替換策略**：由於現有檔案結構已混亂，決定採用 `write_file` 進行全量重新建立，而非零碎的 `replace`。

## Risks / Trade-offs

- [Risk] 瀏覽器播放延遲導致時間碼偏移 -> [Mitigation] 設定約 100-200ms 的 buffer 時間，並手動測試關鍵對話的切入點。
