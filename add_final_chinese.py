#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# 这些是缺少中文的字幕及其翻译
missing_translations = {
    "Wow.": "哇。",
    "I mean...": "我是說…",
    "Come on, go on.": "來吧，繼續說。",
    "Uh-huh?": "嗯？",
    "Huh?": "什麼？",
    "Excuse me.": "對不起。",
    "Potato, potatoe.": "番茄，蕃茄。"
}

file_path = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_merged.srt"

# 读取文件
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 替换缺少中文的字幕
for english, chinese in missing_translations.items():
    # 模式：英文字幕后面没有中文（即没有汉字）
    # 我们需要找到英文字幕块并在其后添加中文
    
    lines = content.split('\n')
    new_lines = []
    i = 0
    
    while i < len(lines):
        new_lines.append(lines[i])
        
        # 检查这一行是否是我们要找的英文
        if lines[i].strip() == english.strip():
            # 检查下一行是否已经有中文翻译
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                # 如果下一行是空行或者是数字（新的字幕块）或时间码，说明没有中文
                if next_line.strip() == '' or (i + 1 < len(lines) and (next_line.strip().isdigit() or '-->' in next_line)):
                    # 添加中文翻译
                    i += 1
                    new_lines.append(chinese)
                    new_lines.append(lines[i] if i < len(lines) else '')
                    i += 1
                    continue
        
        i += 1
    
    content = '\n'.join(new_lines)

# 使用更精确的方法：解析字幕块并直接修改
blocks = content.split('\n\n')
updated_blocks = []

for block in blocks:
    lines = block.strip().split('\n')
    
    if len(lines) >= 3:
        # 检查是否是我们要找的字幕
        english_text = lines[2] if len(lines) > 2 else ''
        
        # 检查是否有中文
        has_chinese = any(any('\u4e00' <= c <= '\u9fff' for c in line) for line in lines[3:])
        
        if english_text.strip() in missing_translations and not has_chinese:
            # 添加中文翻译
            lines.append(missing_translations[english_text.strip()])
    
    updated_blocks.append('\n'.join(lines))

# 保存文件
output_content = '\n\n'.join(updated_blocks)

# 清理多余的空行
while '\n\n\n' in output_content:
    output_content = output_content.replace('\n\n\n', '\n\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(output_content)

print("✓ 已为缺少中文的字幕添加繁体中文翻译")
print(f"  添加了 {len(missing_translations)} 条翻译")

