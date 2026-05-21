import re

def parse_srt(content):
    blocks = []
    current_block = []
    for line in content.splitlines():
        line = line.strip()
        if not line:
            if current_block:
                blocks.append(current_block)
                current_block = []
        else:
            current_block.append(line)
    if current_block:
        blocks.append(current_block)
    
    parsed_blocks = []
    for b in blocks:
        if len(b) >= 3:
            num = b[0]
            time = b[1]
            text = " ".join(b[2:])
            parsed_blocks.append({'num': num, 'time': time, 'text': text})
    return parsed_blocks

def align_subtitles(source_zh_path, target_en_path, output_path):
    print(f"Reading {source_zh_path}...")
    with open(source_zh_path, 'r', encoding='utf-8', errors='ignore') as f:
        src_blocks = parse_srt(f.read())
    
    print(f"Reading {target_en_path}...")
    with open(target_en_path, 'r', encoding='utf-8', errors='ignore') as f:
        tgt_blocks = parse_srt(f.read())

    # 建立源字幕的搜尋索引 (英文文本 -> 中文翻譯)
    # 147.srt 格式通常是: 英文\n中文
    mapping = {}
    for b in src_blocks:
        # 嘗試分離英中
        lines = b['text'].split('-') # 有些可能有 '-' 開頭
        # 這裡用較簡單的方式：如果 block text 含有非 ASCII 字元，則視為含有中文
        # 我們要把中文提取出來
        zh_part = ""
        en_part = ""
        # 簡單正則匹配中文
        zh_match = re.findall(r'[^\x00-\x7F]+', b['text'])
        if zh_match:
            zh_part = " ".join(zh_match)
            # 剩餘部分視為英文用來比法
            en_part = re.sub(r'[^\x00-\x7F]+', '', b['text']).strip()
            mapping[en_part.lower()] = zh_part

    final_output = []
    for i, tgt in enumerate(tgt_blocks):
        en_text = tgt['text'].strip()
        # 尋找匹配的中文
        found_zh = ""
        # 1. 精確匹配
        if en_text.lower() in mapping:
            found_zh = mapping[en_text.lower()]
        else:
            # 2. 模糊匹配 (子字串)
            for src_en, src_zh in mapping.items():
                if src_en and (src_en in en_text.lower() or en_text.lower() in src_en):
                    found_zh = src_zh
                    break
        
        final_output.append(f"{i+1}")
        final_output.append(tgt['time'])
        if found_zh:
            final_output.append(f"{en_text}\n{found_zh}")
        else:
            final_output.append(en_text)
        final_output.append("")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(final_output))
    print(f"Success! Saved to {output_path}")

if __name__ == "__main__":
    align_subtitles('147.srt', '147_Time_OK.srt', '147_final.srt')
