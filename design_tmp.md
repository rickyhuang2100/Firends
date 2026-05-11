## Context

需要將翻譯好的 `60_zh.srt` 拿來開發 `60.html` 學習指南，延續先前的介面架構，以供初學者練習英文聽力與口說。

## Architecture

延續系統中既有 `.html` 的架構設計：
1. 原生 HTML5 與 CSS Tailwind 版位設計。
2. 內嵌 `<video>` 元素，並附帶 `AB Loop` 播放功能相關的 `span.play-btn`。

## Data Flow

使用者點擊按鈕後，由 JavaScript 將時間軸抓取 `data-start` 與 `data-end` 並寫入影片控制器與監聽器中，確保循環播放在特定的字幕片段。
