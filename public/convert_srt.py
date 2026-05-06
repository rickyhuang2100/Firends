import sys
from opencc import OpenCC

def main():
    if len(sys.argv) < 3:
        print("Usage: python convert_srt.py input.srt output.srt")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {input_file}: {e}")
        sys.exit(1)

    # Simplified to Traditional (Taiwan standard)
    cc = OpenCC('s2twp')  
    converted_content = cc.convert(content)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(converted_content)

    print("Success!")

if __name__ == '__main__':
    main()
