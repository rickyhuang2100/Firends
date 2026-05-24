import re

# 讀 153_Time_OK.srt (UTF-8，有時間軸，英文)
with open('153_Time_OK.srt', 'r', encoding='utf-8') as f:
    content_ok = f.read()

# 讀 153.srt (Big5 繁體中文)
for enc in ['big5', 'cp950', 'latin-1']:
    try:
        with open('153.srt', 'r', encoding=enc) as f:
            content_zh = f.read()
        print(f'153.srt read with encoding: {enc}')
        break
    except Exception as e:
        print(f'{enc} failed: {e}')

# 解析 SRT blocks
def parse_srt(content):
    blocks = []
    # 標準化換行
    content = content.replace('\r\n', '\n').replace('\r', '\n')
    parts = re.split(r'\n\n+', content.strip())
    for part in parts:
        lines = part.strip().split('\n')
        if len(lines) >= 3:
            idx = lines[0].strip()
            ts = lines[1].strip()
            text = ' '.join(lines[2:]).strip()
            blocks.append({'idx': idx, 'ts': ts, 'text': text})
    return blocks

blocks_ok = parse_srt(content_ok)
blocks_zh = parse_srt(content_zh)

print(f'OK blocks: {len(blocks_ok)}')
print(f'ZH blocks: {len(blocks_zh)}')
print()
print('ZH sample[0]:', blocks_zh[0] if blocks_zh else 'empty')
print('ZH sample[1]:', blocks_zh[1] if len(blocks_zh) > 1 else 'empty')
