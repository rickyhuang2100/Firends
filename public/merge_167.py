#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Merge 167_Time_OK.srt (accurate timestamps, EN only)
with Chinese translations from 167.srt (BIG5, EN+ZH)
Strategy: sequential positional mapping
"""
import re

def parse_srt_time_ok(filepath):
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    entries = []
    blocks = re.split(r'\n{2,}', content.strip())
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue
        try:
            idx = int(lines[0].strip())
        except:
            continue
        m = re.match(r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})', lines[1])
        if not m:
            continue
        text = ' '.join(l.strip() for l in lines[2:] if l.strip())
        entries.append((idx, m.group(1), m.group(2), text))
    return entries

def parse_srt_bilingual(filepath):
    for enc in ['big5', 'cp950', 'gbk']:
        try:
            with open(filepath, encoding=enc, errors='strict') as f:
                content = f.read()
            print(f"Opened with encoding: {enc}")
            break
        except:
            continue
    else:
        with open(filepath, encoding='utf-8', errors='replace') as f:
            content = f.read()
        print("Opened with utf-8 fallback")
    
    entries = []
    blocks = re.split(r'\r?\n\r?\n', content.strip())
    for block in blocks:
        lines = block.strip().splitlines()
        time_idx = -1
        for i, line in enumerate(lines):
            if re.search(r'\d{2}:\d{2}:\d{2}.*-->', line):
                time_idx = i
                break
        if time_idx < 0:
            continue
        text_lines = [l.strip() for l in lines[time_idx+1:] if l.strip()]
        en_lines, zh_lines = [], []
        for line in text_lines:
            if any('\u4e00' <= c <= '\u9fff' for c in line):
                zh_lines.append(line)
            else:
                if not re.match(r'^\d+$', line):  # skip lone numbers
                    en_lines.append(line)
        zh = ' '.join(zh_lines).strip()
        entries.append(zh)
    return entries

def normalize(text):
    return re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', '', text.lower())).strip()

def word_overlap(a, b):
    wa = set(normalize(a).split())
    wb = set(normalize(b).split())
    if not wa or not wb:
        return 0
    return len(wa & wb) / max(len(wa), len(wb))

# Load files
print("Loading time-accurate SRT...")
time_ok = parse_srt_time_ok(r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167_Time_OK.srt")
print(f"  {len(time_ok)} entries")

print("Loading bilingual SRT...")
bilingual_zh = parse_srt_bilingual(r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167.srt")
# Filter empty
bilingual_zh = [z for z in bilingual_zh if z]
print(f"  {len(bilingual_zh)} ZH entries after filtering")

# Sequential mapping with sliding window
# time_ok has merged subtitles (multi-line joined), bilingual_zh may be finer-grained
# We map by position ratio
result = []
zh_ptr = 0
ratio = len(bilingual_zh) / max(len(time_ok), 1)

for i, (idx, start, end, en_text) in enumerate(time_ok):
    # Expected zh position
    expected_zh_pos = int(i * ratio)
    expected_zh_pos = max(0, min(expected_zh_pos, len(bilingual_zh) - 1))
    
    # Try best match in a window around expected_zh_pos
    window = 8
    best_zh = ''
    best_score = 0
    search_start = max(zh_ptr, expected_zh_pos - 2)
    search_end = min(len(bilingual_zh), search_start + window)
    
    for j in range(search_start, search_end):
        score = word_overlap(en_text, bilingual_zh[j])
        # Bonus for being close to expected position
        pos_bonus = 0.1 * (1 - abs(j - expected_zh_pos) / window)
        total = score + pos_bonus
        if total > best_score:
            best_score = total
            best_zh = bilingual_zh[j]
            best_zh_idx = j
    
    if best_score > 0.25:
        zh_ptr = max(zh_ptr, best_zh_idx)
        result.append((idx, start, end, en_text, best_zh))
    else:
        # Just use sequential by ratio
        if expected_zh_pos < len(bilingual_zh):
            result.append((idx, start, end, en_text, bilingual_zh[expected_zh_pos]))
        else:
            result.append((idx, start, end, en_text, ''))

# Write output
output_path = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167_zh.srt"
out_lines = []
for idx, start, end, en_text, zh_text in result:
    out_lines.append(str(idx))
    out_lines.append(f"{start} --> {end}")
    out_lines.append(en_text)
    if zh_text:
        out_lines.append(zh_text)
    out_lines.append('')

with open(output_path, 'w', encoding='utf-8-sig') as f:
    f.write('\n'.join(out_lines))

matched = sum(1 for r in result if r[4])
print(f"\nDone! {matched}/{len(result)} entries have Chinese")
print(f"Output: {output_path}")
print("\n--- Sample: entries 1-15 ---")
for r in result[:15]:
    print(f"[{r[0]}] {r[1]} --> {r[2]}")
    print(f"  EN: {r[3][:60]}")
    print(f"  ZH: {r[4][:30] if r[4] else '(empty)'}")
