#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from difflib import SequenceMatcher

# 读取文件
merged_file = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_merged.srt"
original_file = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150.srt"

# 编码检测函数
encodings = ['utf-8', 'big5', 'gb2312', 'gbk', 'latin-1']

def read_file(filepath):
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                return f.read(), encoding
        except:
            continue
    raise Exception(f"无法读取文件 {filepath}")

# 读取文件
merged_content, _ = read_file(merged_file)
original_content, _ = read_file(original_file)

# 解析字幕块
def parse_blocks(content):
    blocks = content.split('\n\n')
    result = []
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            try:
                index = int(lines[0]) if lines[0].isdigit() else 0
                timecode = lines[1]
                text = '\n'.join(lines[2:]).strip()
                if text:
                    result.append({
                        'index': index,
                        'timecode': timecode,
                        'text': text,
                        'original_lines': lines
                    })
            except:
                pass
    return result

print("正在解析文件...")
merged_blocks = parse_blocks(merged_content)
original_blocks = parse_blocks(original_content)

print(f"已解析合并文件: {len(merged_blocks)} 个字幕块")
print(f"已解析原始文件: {len(original_blocks)} 个字幕块")

# 构建原始文件的中文字幕映射
chinese_map = {}
for block in original_blocks:
    text = block['text']
    lines = text.split('\n')
    
    # 提取英文部分（第一行）
    english = lines[0].lower().strip() if lines else ''
    
    # 提取中文部分
    chinese_parts = []
    for line in lines[1:]:
        if any('\u4e00' <= c <= '\u9fff' for c in line):
            chinese_parts.append(line)
    
    if english and chinese_parts:
        chinese_map[english] = '\n'.join(chinese_parts)

print(f"构建中文映射: {len(chinese_map)} 条")

# 处理缺少中文的字幕块
updated_blocks = []
missing_count = 0
found_count = 0

for block in merged_blocks:
    text = block['text']
    lines = text.split('\n')
    
    # 检查是否有中文
    has_chinese = any(any('\u4e00' <= c <= '\u9fff' for c in line) for line in lines)
    
    if not has_chinese:
        # 寻找对应的中文
        english_key = lines[0].lower().strip() if lines else ''
        
        # 先尝试精确匹配
        chinese = chinese_map.get(english_key)
        
        # 如果没找到，尝试模糊匹配
        if not chinese:
            best_match = None
            best_score = 0.5
            for key, value in chinese_map.items():
                similarity = SequenceMatcher(None, english_key, key).ratio()
                if similarity > best_score:
                    best_score = similarity
                    best_match = value
            chinese = best_match
        
        if chinese:
            # 添加中文
            lines.append(chinese)
            found_count += 1
        else:
            missing_count += 1
        
        block['text'] = '\n'.join(lines)
    
    updated_blocks.append(block)

print(f"\n处理结果:")
print(f"- 找到中文翻译并添加: {found_count}")
print(f"- 仍然缺少中文的: {missing_count}")

# 生成新的字幕文件内容
output_lines = []
for i, block in enumerate(updated_blocks, 1):
    output_lines.append(str(i))
    output_lines.append(block['timecode'])
    output_lines.append(block['text'])
    output_lines.append('')

output_content = '\n'.join(output_lines)

# 保存文件
output_file = r"d:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_merged.srt"
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(output_content)

print(f"\n✓ 已更新文件: {output_file}")

# 显示仍然缺少中文的字幕
if missing_count > 0:
    print(f"\n仍然缺少中文翻译的字幕块：")
    for block in updated_blocks:
        text = block['text']
        has_chinese = any(any('\u4e00' <= c <= '\u9fff' for c in line) for line in text.split('\n'))
        if not has_chinese:
            print(f"- 【{block['index']}】 {block['timecode']}: {block['text'][:60]}")

