import sys

def fix_encoding(input_path, output_path):
    try:
        # 讀取現有內容 (假設是 UTF-8)
        with open(input_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 寫回帶有 UTF-8-BOM 的格式，這在 Windows 下顯示繁體中文最保險
        with open(output_path, 'w', encoding='utf-8-sig') as f:
            f.write(content)
        print(f"File fixed and saved to {output_path} with UTF-8-SIG.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_encoding('147_final.srt', '147_zh_final.srt')
