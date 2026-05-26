#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

def parse_srt_time_ok(filepath):
    entries = []
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    blocks = re.split(r'\n{2,}', content.strip())
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) < 3:
            continue
        try:
            idx = int(lines[0].strip())
        except:
            continue
        time_match = re.match(r'(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})', lines[1])
        if not time_match:
            continue
        start = time_match.group(1)
        end = time_match.group(2)
        text = ' '.join(lines[2:]).strip()
        entries.append((idx, start, end, text))
    return entries

def parse_srt_bilingual(filepath):
    for enc in ['big5', 'cp950', 'gbk', 'utf-8-sig', 'utf-8']:
        try:
            with open(filepath, encoding=enc, errors='strict') as f:
                content = f.read()
            break
        except:
            continue
    else:
        with open(filepath, encoding='utf-8', errors='replace') as f:
            content = f.read()
    blocks = re.split(r'\n{2,}', content.strip())
    entries = []
    for block in blocks:
        lines = block.strip().split('\n')
        time_line_idx = -1
        for i, line in enumerate(lines):
            if re.search(r'\d{2}:\d{2}:\d{2}.*-->', line):
                time_line_idx = i
                break
        if time_line_idx < 0:
            continue
        text_lines = [l.strip() for l in lines[time_line_idx+1:] if l.strip()]
        en_lines = []
        zh_lines = []
        for line in text_lines:
            if any('\u4e00' <= c <= '\u9fff' for c in line):
                zh_lines.append(line)
            else:
                en_lines.append(line)
        entries.append((' '.join(en_lines), ' '.join(zh_lines)))
    return entries

def normalize_en(text):
    text = re.sub(r'[^\w\s]', '', text.lower())
    return re.sub(r'\s+', ' ', text).strip()

time_ok = parse_srt_time_ok(r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167_Time_OK.srt")
bilingual = parse_srt_bilingual(r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167.srt")

print(f"Time OK: {len(time_ok)} entries")
print(f"Bilingual: {len(bilingual)} entries")

# Show first 10 from bilingual
for i, (en, zh) in enumerate(bilingual[:10]):
    print(f"[{i}] EN: {en[:50]}")
    print(f"     ZH: {zh[:30]}")
    print()
