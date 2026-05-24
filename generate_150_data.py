#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def parse_srt(filepath):
    """解析 SRT 字幕文件"""
    encodings = ['big5', 'utf-8', 'gbk', 'latin-1']
    content = None
    
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                content = f.read()
            break
        except:
            continue
    
    if not content:
        raise Exception(f"无法读取文件 {filepath}")
    
    blocks = content.split('\n\n')
    subtitles = []
    
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            try:
                index = int(lines[0])
                timecode = lines[1]
                # 分离时间
                times = timecode.split(' --> ')
                start_time = times[0] if times else ''
                end_time = times[1] if len(times) > 1 else ''
                
                # 分离英文和中文
                text_lines = lines[2:]
                english = []
                chinese = []
                
                for line in text_lines:
                    if any('\u4e00' <= c <= '\u9fff' for c in line):
                        chinese.append(line)
                    else:
                        english.append(line)
                
                subtitles.append({
                    'index': index,
                    'start': start_time,
                    'end': end_time,
                    'english': '\n'.join(english).strip(),
                    'chinese': '\n'.join(chinese).strip()
                })
            except:
                pass
    
    return subtitles

def time_to_seconds(time_str):
    """将时间字符串转换为秒数"""
    if not time_str:
        return 0
    parts = time_str.split(':')
    if len(parts) < 3:
        return 0
    try:
        minutes = int(parts[1])
        seconds = float(parts[2])
        return minutes * 60 + seconds
    except:
        return 0

# 读取字幕
srt_file = r'd:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150.srt'
subtitles = parse_srt(srt_file)

print(f"总共解析了 {len(subtitles)} 个字幕块")

# 选择适合学习的短句（英文较短）
learning_sentences = []
for sub in subtitles:
    english = sub['english']
    # 选择英文较短的句子（便于学习）
    if english and 10 < len(english) < 150:  # 字数在10-150之间
        start_sec = time_to_seconds(sub['start'])
        end_sec = time_to_seconds(sub['end'])
        learning_sentences.append({
            'english': english,
            'chinese': sub['chinese'],
            'start': sub['start'],
            'end': sub['end'],
            'start_sec': start_sec,
            'end_sec': end_sec
        })

print(f"找到 {len(learning_sentences)} 个适合学习的短句")
print("\n前 10 个学习句子示例：")
for i, sent in enumerate(learning_sentences[:10]):
    print(f"{i+1}. [{sent['start']} - {sent['end']}]")
    print(f"   EN: {sent['english'][:60]}")
    print(f"   ZH: {sent['chinese'][:60]}")
    print()

# 保存为 JSON 供 HTML 使用
import json
output_json = {
    'all_subtitles': subtitles,
    'learning_sentences': learning_sentences[:30]  # 取前 30 个
}

json_file = r'd:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_subtitles.json'
with open(json_file, 'w', encoding='utf-8') as f:
    json.dump(output_json, f, ensure_ascii=False, indent=2)

print(f"\n✓ 已保存字幕数据到: {json_file}")
