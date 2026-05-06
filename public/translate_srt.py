import re
import sys
import time
from deep_translator import GoogleTranslator
from opencc import OpenCC

def parse_srt(content):
    blocks = content.strip().split('\n\n')
    parsed_blocks = []
    for block in blocks:
        lines = block.split('\n')
        if len(lines) >= 3:
            index = lines[0]
            timestamp = lines[1]
            text = '\n'.join(lines[2:])
            parsed_blocks.append({
                'index': index,
                'timestamp': timestamp,
                'text': text
            })
    return parsed_blocks

def main():
    if len(sys.argv) < 3:
        print("Usage: python translate_srt.py input.srt output.srt")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {input_file}: {e}")
        sys.exit(1)

    blocks = parse_srt(content)
    translator = GoogleTranslator(source='en', target='zh-TW')
    cc = OpenCC('s2twp')  # Add OpenCC for strict Traditional Chinese conversion

    print(f"Total blocks to translate: {len(blocks)}")
    
    translated_blocks = []
    chunk_size = 30
    for i in range(0, len(blocks), chunk_size):
        chunk = blocks[i:i+chunk_size]
        texts_to_translate = [b['text'].replace('\n', ' ') for b in chunk]
        combined_text = '\n||\n'.join(texts_to_translate)
        
        try:
            translated_combined = translator.translate(combined_text)
            translated_texts = translated_combined.split('\n||\n')
            
            if len(translated_texts) != len(texts_to_translate):
                print(f"Warning: Count mismatch in chunk {i}. Retrying individually...")
                translated_texts = []
                for t in texts_to_translate:
                    translated_texts.append(translator.translate(t))
                    time.sleep(0.1)
            
            for index, block in enumerate(chunk):
                en_text = block['text']
                # Google translate sometimes removes newlines, ensure we just format it simply
                zh_text = translated_texts[index].strip()
                # Apply OpenCC conversion to guarantee Traditional Chinese
                zh_text = cc.convert(zh_text)
                
                # Remove extra spaces Google translate sometimes adds before punctuation
                zh_text = zh_text.replace(' ，', '，').replace(' 。', '。').replace(' ？', '？').replace(' ！', '！')
                zh_text = zh_text.replace(' ||', '').replace('|| ', '')
                # Output format: English on top, Chinese below
                combined = f"{en_text}\n{zh_text}"
                
                translated_blocks.append({
                    'index': block['index'],
                    'timestamp': block['timestamp'],
                    'text': combined
                })
        except Exception as e:
            print(f"Error translating chunk {i}: {e}. Retrying individually...")
            for block in chunk:
                try:
                    en_text = block['text']
                    zh_text = translator.translate(en_text.replace('\n', ' ')).strip()
                    zh_text = cc.convert(zh_text)
                    combined = f"{en_text}\n{zh_text}"
                    translated_blocks.append({
                        'index': block['index'],
                        'timestamp': block['timestamp'],
                        'text': combined
                    })
                    time.sleep(0.5)
                except Exception as ex:
                    print(f"Failed block {block['index']}: {ex}")
                    translated_blocks.append({
                        'index': block['index'],
                        'timestamp': block['timestamp'],
                        'text': block['text']
                    })
        
        print(f"Translated up to block {min(i + chunk_size, len(blocks))}")
        time.sleep(1) # Small pause to avoid hitting rate limits too quickly

    with open(output_file, 'w', encoding='utf-8') as f:
        for block in translated_blocks:
            f.write(f"{block['index']}\n")
            f.write(f"{block['timestamp']}\n")
            f.write(f"{block['text']}\n\n")

    print("Translation completed successfully!")

if __name__ == '__main__':
    main()
