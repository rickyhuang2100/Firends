import re
import difflib

def parse_srt(filename, has_chinese=False):
    blocks = []
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read().strip()
        
    for block in re.split(r'\n\n+', content):
        lines = block.split('\n')
        if len(lines) >= 3:
            idx = lines[0]
            timing = lines[1]
            text_lines = lines[2:]
            
            eng_lines = []
            chi_lines = []
            
            if has_chinese:
                for line in text_lines:
                    # Simple heuristic: if contains Chinese characters
                    if re.search(r'[\u4e00-\u9fff]', line):
                        chi_lines.append(line)
                    else:
                        eng_lines.append(line)
            else:
                eng_lines = text_lines
                
            blocks.append({
                'idx': idx,
                'timing': timing,
                'eng': ' '.join(eng_lines),
                'eng_lines': eng_lines,
                'chi': ' '.join(chi_lines) if has_chinese else '',
                'chi_lines': chi_lines
            })
    return blocks

def main():
    ok_blocks = parse_srt('151_Time_OK.srt', False)
    ref_blocks = parse_srt('151.srt', True)
    
    # Pre-extract english sentences from ref
    ref_engs = [b['eng'].lower() for b in ref_blocks]
    
    out_lines = []
    for b in ok_blocks:
        ok_eng_clean = re.sub(r'[^a-zA-Z0-9\s]', '', b['eng'].lower())
        best_match = None
        best_score = 0.0
        
        if ok_eng_clean.strip():
            # Find best match in ref
            for i, ref_eng in enumerate(ref_engs):
                ref_eng_clean = re.sub(r'[^a-zA-Z0-9\s]', '', ref_eng)
                score = difflib.SequenceMatcher(None, ok_eng_clean, ref_eng_clean).ratio()
                if score > best_score:
                    best_score = score
                    best_match = ref_blocks[i]
        
        # If score is somewhat reasonable, or use empty
        chi_text = best_match['chi'] if (best_match and best_score > 0.3) else ''
        
        out_lines.append(b['idx'])
        out_lines.append(b['timing'])
        for l in b['eng_lines']:
            out_lines.append(l)
        if chi_text:
            out_lines.append(chi_text)
        out_lines.append('')
        
    with open('151_zh_final.srt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(out_lines))
        
if __name__ == '__main__':
    main()
