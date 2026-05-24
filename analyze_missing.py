#!/usr/bin/env python3
# -*- coding: utf-8 -*-

file_path = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_merged.srt"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 分割字幕块
blocks = content.split('\n\n')
missing_chinese = []
has_chinese_count = 0

for block in blocks:
    lines = block.strip().split('\n')
    if len(lines) >= 3:
        # 检查是否有中文（汉字）
        has_zh = False
        english_text = []
        
        for i, line in enumerate(lines):
            if i >= 2:  # 跳过序号和时间码
                if any('\u4e00' <= c <= '\u9fff' for c in line):
                    has_zh = True
                else:
                    english_text.append(line)
        
        if not has_zh and english_text:
            # 保存缺少中文的字幕
            missing_chinese.append({
                'index': int(lines[0]) if lines[0].isdigit() else 0,
                'timecode': lines[1] if len(lines) > 1 else '',
                'english': '\n'.join(english_text).strip()
            })
        elif has_zh:
            has_chinese_count += 1

print(f"统计结果:")
print(f"- 有中文翻译的字幕块: {has_chinese_count}")
print(f"- 缺少中文翻译的字幕块: {len(missing_chinese)}")
print(f"\n缺少中文翻译的字幕（前20个）:")
for i, item in enumerate(missing_chinese[:20]):
    print(f"\n{i+1}. 【字幕块 {item['index']}】 {item['timecode']}")
    english = item['english'][:80] if len(item['english']) > 80 else item['english']
    print(f"   英文: {english}")
