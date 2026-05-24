import re
import math
from difflib import SequenceMatcher

def parse_srt(content):
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    blocks = []
    current_block = []
    for line in content.split('\n'):
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
            text = "\n".join(b[2:])
            parsed_blocks.append({'num': num, 'time': time, 'text': text})
    return parsed_blocks

def main():
    print("Reading 160.srt (find best encoding)...")
    src_blocks = []
    encodings = ['big5', 'utf-8', 'utf-8-sig', 'gbk', 'cp950']
    for enc in encodings:
        try:
            with open('160.srt', 'r', encoding=enc, errors='ignore') as f:
                content = f.read()
                # 至少要有一定的內容才算成功
                if len(content) > 100:
                    src_blocks = parse_srt(content)
                    print(f"Reading with {enc} succeeded.")
                    break
        except Exception:
            pass

    if not src_blocks:
        print("Failed to read 160.srt")
        return

    print("Reading 160_Time_OK.srt (UTF-8)...")
    with open('160_Time_OK.srt', 'r', encoding='utf-8', errors='ignore') as f:
        tgt_blocks = parse_srt(f.read())

    # Build reference mapping
    # En string -> Zh string
    ref_map = []
    for b in src_blocks:
        lines = b['text'].split('\n')
        en_parts = []
        zh_parts = []
        for line in lines:
            line = line.strip()
            # If line contains Chinese characters
            if re.search(r'[^\x00-\x7F]+', line):
                zh_parts.append(line)
            else:
                en_parts.append(line)
        if en_parts and zh_parts:
            # Clean up the EN part for better matching
            clean_en = " ".join(en_parts).lower()
            clean_en = re.sub(r'[^a-z0-9\s\']+', '', clean_en).strip()
            zh_text = "\n".join(zh_parts)
            ref_map.append((clean_en, zh_text))
            
    final_output = []
    for idx, tgt in enumerate(tgt_blocks):
        original_en_text = tgt['text'].strip()
        
        # Clean EN text from target
        clean_tgt_en = " ".join(original_en_text.split('\n')).lower()
        clean_tgt_en = re.sub(r'[^a-z0-9\s\']+', '', clean_tgt_en).strip()
        
        best_match_ratio = 0
        best_zh = ""
        
        # Find best match
        for src_en, src_zh in ref_map:
            ratio = SequenceMatcher(None, clean_tgt_en, src_en).ratio()
            # or partial match check
            if len(clean_tgt_en) > 5 and len(src_en) > 5:
                if clean_tgt_en in src_en or src_en in clean_tgt_en:
                    ratio = max(ratio, 0.9)
            if ratio > best_match_ratio:
                best_match_ratio = ratio
                best_zh = src_zh
                
        final_output.append(str(idx + 1))
        final_output.append(tgt['time'])
        
        # Use exact target English text + matched Chinese
        if best_match_ratio > 0.5 and best_zh:
            final_output.append(f"{original_en_text}\n{best_zh}")
        else:
            final_output.append(original_en_text)
            
        final_output.append("")

    output_path = '160_zh.srt'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(final_output))
    print(f"Success! Saved to {output_path}")

if __name__ == "__main__":
    main()
