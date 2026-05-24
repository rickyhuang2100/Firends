import re
import difflib
import sys

def parse_srt(filename, encoding='utf-8', has_chinese=False):
    blocks = []
    with open(filename, 'r', encoding=encoding, errors='ignore') as f:
        content = f.read().strip()
    for block in re.split(r'\n\n+', content):
        lines = block.strip().split('\n')
        if len(lines) >= 3:
            idx = lines[0].strip()
            timing = lines[1].strip()
            text_lines = [l.strip() for l in lines[2:] if l.strip()]
            eng_lines = []
            chi_lines = []
            if has_chinese:
                for line in text_lines:
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
            })
    return blocks

def main():
    ok_file  = sys.argv[1]  # time-correct, English only
    ref_file = sys.argv[2]  # bilingual but wrong timestamps
    out_file = sys.argv[3]
    ref_enc  = sys.argv[4] if len(sys.argv) > 4 else 'utf-8'

    ok_blocks  = parse_srt(ok_file,  'utf-8', False)
    ref_blocks = parse_srt(ref_file, ref_enc, True)

    ref_engs = [b['eng'].lower() for b in ref_blocks]

    out_lines = []
    for b in ok_blocks:
        ok_clean = re.sub(r'[^a-zA-Z0-9\s]', '', b['eng'].lower())
        best_match = None
        best_score = 0.0
        if ok_clean.strip():
            for i, ref_eng in enumerate(ref_engs):
                ref_clean = re.sub(r'[^a-zA-Z0-9\s]', '', ref_eng)
                score = difflib.SequenceMatcher(None, ok_clean, ref_clean).ratio()
                if score > best_score:
                    best_score = score
                    best_match = ref_blocks[i]
        chi_text = best_match['chi'] if (best_match and best_score > 0.3) else ''
        out_lines.append(b['idx'])
        out_lines.append(b['timing'])
        for l in b['eng_lines']:
            out_lines.append(l)
        if chi_text:
            out_lines.append(chi_text)
        out_lines.append('')

    with open(out_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(out_lines))
    print(f"Done! {len(ok_blocks)} blocks → {out_file}")

if __name__ == '__main__':
    main()
