#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Extract all Chinese lines from 167.srt (Big5 encoded, broken format)
Then map them proportionally to 167_Time_OK.srt entries.
Output: 167_zh.srt
"""
import re

def parse_time_ok(filepath):
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

def extract_zh_from_srt(filepath):
    """Extract all Chinese content lines from srt, grouped by subtitle block."""
    for enc in ['big5', 'cp950']:
        try:
            with open(filepath, encoding=enc, errors='strict') as f:
                raw = f.read()
            print(f"Encoding: {enc}")
            break
        except:
            continue
    else:
        with open(filepath, encoding='utf-8', errors='replace') as f:
            raw = f.read()
        print("Encoding: utf-8 fallback")
    
    # Split by lines and group into subtitle-like blocks manually
    lines = raw.splitlines()
    zh_groups = []
    current_zh = []
    in_block = False
    
    for line in lines:
        line_s = line.strip()
        # Check if this looks like a new subtitle block start (just a number on its own line)
        if re.match(r'^\d+$', line_s) and len(line_s) <= 4:
            if current_zh:
                zh_text = ' '.join(current_zh)
                zh_groups.append(zh_text)
            current_zh = []
            in_block = True
            continue
        
        # Skip time code lines
        if re.search(r'\d{2}:\d{2}:\d{2}', line_s) and '-->' in line_s:
            continue
        
        if in_block and line_s:
            # Extract Chinese portions from this line
            # Find all CJK sequences
            zh_chars = re.findall(r'[\u4e00-\u9fff\uff01-\uffee\u3000-\u303f，。！？、；：「」『』【】〔〕…—～]+', line_s)
            if zh_chars:
                current_zh.append(''.join(zh_chars))
    
    if current_zh:
        zh_groups.append(' '.join(current_zh))
    
    return [z for z in zh_groups if z]

# Load data
print("Loading 167_Time_OK.srt...")
time_ok = parse_time_ok(r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167_Time_OK.srt")
print(f"  {len(time_ok)} EN entries")

print("Extracting Chinese from 167.srt...")
zh_groups = extract_zh_from_srt(r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167.srt")
print(f"  {len(zh_groups)} ZH groups extracted")
print("  First 10 ZH groups:")
for z in zh_groups[:10]:
    print(f"    {z[:50]}")

# Map ZH to EN by position ratio
total_en = len(time_ok)
total_zh = len(zh_groups)
ratio = total_zh / max(total_en, 1)

out_lines = []
for i, (idx, start, end, en_text) in enumerate(time_ok):
    zh_pos = min(int(round(i * ratio)), total_zh - 1)
    zh_text = zh_groups[zh_pos] if zh_pos < total_zh else ''
    out_lines.append(str(idx))
    out_lines.append(f"{start} --> {end}")
    out_lines.append(en_text)
    if zh_text:
        out_lines.append(zh_text)
    out_lines.append('')

output = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\167_zh.srt"
with open(output, 'w', encoding='utf-8-sig') as f:
    f.write('\n'.join(out_lines))

print(f"\nWritten: {output}")
print("\nSample output (entries 1-15):")
for i, (idx, start, end, en_text) in enumerate(time_ok[:15]):
    zh_pos = min(int(round(i * ratio)), total_zh - 1)
    zh = zh_groups[zh_pos] if zh_pos < total_zh else ''
    print(f"[{idx}] {start}")
    print(f"  EN: {en_text[:55]}")
    print(f"  ZH: {zh[:30]}")
