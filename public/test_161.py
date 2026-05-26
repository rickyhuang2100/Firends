import re
import json

def parse_srt(filename):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read().strip()
    content = content.replace('\ufeff', '')
    blocks = re.split(r'\n\s*\n', content)
    res = []
    for b in blocks:
        lines = b.strip().split('\n')
        if len(lines) >= 3:
            res.append(lines[2:])
    return res

b1 = parse_srt('161.srt')
b2 = parse_srt('161_Time_OK.srt')
print('161.srt block count:', len(b1))
print('161_Time_OK.srt block count:', len(b2))

print('161.srt first 5:', json.dumps(b1[:5], ensure_ascii=False))
print('161_Time_OK.srt first 5:', json.dumps(b2[:5], ensure_ascii=False))
