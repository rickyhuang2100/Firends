#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
from difflib import SequenceMatcher

def parse_srt_file(filepath):
    """解析 SRT 字幕文件"""
    # 尝试多种编码
    encodings = ['utf-8', 'big5', 'gb2312', 'gbk', 'latin-1']
    content = None
    for encoding in encodings:
        try:
            with open(filepath, 'r', encoding=encoding) as f:
                content = f.read()
            print(f"  使用编码 {encoding} 读取 {filepath}")
            break
        except:
            continue
    
    if content is None:
        raise Exception(f"无法读取文件 {filepath}")
    
    # 分割字幕块
    blocks = content.split('\n\n')
    subtitles = []
    
    for block in blocks:
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            try:
                index = int(lines[0])
                timecode = lines[1]
                text = '\n'.join(lines[2:])
                if text.strip():
                    subtitles.append({
                        'index': index,
                        'timecode': timecode,
                        'text': text.strip()
                    })
            except (ValueError, IndexError):
                pass
    
    return subtitles

def extract_chinese_from_original(subs_original):
    """从原始文件中提取中文字幕"""
    chinese_map = {}
    for sub in subs_original:
        idx = sub['index']
        text = sub['text']
        lines = text.split('\n')
        
        # 中文通常在英文之后
        chinese_lines = []
        for line in lines:
            # 检查是否包含汉字
            if any('\u4e00' <= c <= '\u9fff' for c in line):
                chinese_lines.append(line)
        
        if chinese_lines:
            chinese_map[idx] = '\n'.join(chinese_lines)
    
    return chinese_map

def find_matching_chinese(english_text, subs_original, used_indices=None):
    """根据英文文本查找对应的中文字幕（使用模糊匹配）"""
    if used_indices is None:
        used_indices = set()
    
    english_text_clean = ' '.join(english_text.lower().split())
    
    best_match = None
    best_score = 0.3  # 最小相似度阈值
    best_index = -1
    
    for idx, sub in enumerate(subs_original):
        if idx in used_indices:
            continue
            
        text = sub['text']
        lines = text.split('\n')
        
        # 提取英文部分（第一行通常是英文）
        first_line = ' '.join(lines[0].lower().split())
        
        # 使用相似度比较
        similarity = SequenceMatcher(None, english_text_clean, first_line).ratio()
        
        if similarity > best_score:
            best_score = similarity
            best_match = sub
            best_index = idx
    
    if best_match:
        used_indices.add(best_index)
        # 提取中文部分
        text = best_match['text']
        lines = text.split('\n')
        chinese_lines = []
        for line in lines:
            if any('\u4e00' <= c <= '\u9fff' for c in line):
                chinese_lines.append(line)
        if chinese_lines:
            return '\n'.join(chinese_lines)
    
    return ''

def merge_subtitles(subs_timeok, subs_original):
    """合并字幕：使用 150_Time_OK.srt 的时间轴和英文，加上原始文件的中文"""
    output = []
    used_indices = set()
    
    for i, sub in enumerate(subs_timeok, 1):
        timecode = sub['timecode']
        english = sub['text']
        
        # 根据英文文本查找对应的中文
        chinese = find_matching_chinese(english, subs_original, used_indices)
        
        # 构建输出块
        output.append(str(i))  # 新的序号
        output.append(timecode)
        output.append(english)
        if chinese:
            output.append(chinese)
        output.append('')  # 空行分隔
    
    return '\n'.join(output)

# 主程序
file_150 = r'd:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150.srt'
file_150_time_ok = r'd:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_Time_OK.srt'
output_file = r'd:\Ricky\RickyTF\program\Friends英文教學\Firends\public\150_merged.srt'

print("正在解析字幕文件...")
subs_original = parse_srt_file(file_150)
subs_timeok = parse_srt_file(file_150_time_ok)

print(f"150.srt: {len(subs_original)} 个字幕块")
print(f"150_Time_OK.srt: {len(subs_timeok)} 个字幕块")

# 合并字幕
print("正在合并字幕...")
merged_content = merge_subtitles(subs_timeok, subs_original)

# 写入输出文件
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(merged_content)

print(f"完成！输出文件：{output_file}")
