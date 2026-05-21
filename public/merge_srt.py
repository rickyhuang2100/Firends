import codecs
import re
import difflib

def read_srt(path, encodings):
    content = None
    for enc in encodings:
        try:
            with codecs.open(path, 'r', encoding=enc) as f:
                content = f.read()
                break
        except Exception:
            pass
    blocks = re.split(r'\r?\n\s*\r?\n', content.strip())
    subs = []
    for block in blocks:
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        if len(lines) >= 3:
            idx = lines[0]
            time = lines[1]
            text = lines[2:]
            subs.append({'idx': idx, 'time': time, 'text': text})
    return subs

orig_subs = read_srt('146.srt', ['big5', 'utf-8-sig', 'utf-8', 'cp950'])
time_subs = read_srt('146_Time_OK.srt', ['utf-8-sig', 'utf-8', 'big5'])

orig_data = [] # List of tuples: (index mapping, english text, chinese text)
orig_eng_list = []
for sub in orig_subs:
    eng_lines = []
    chi_lines = []
    for line in sub['text']:
        if len(re.findall(r'[a-zA-Z]', line)) > len(line) * 0.3:
            eng_lines.append(line)
        else:
            chi_lines.append(line)
    
    eng = ' '.join(eng_lines)
    chi = '\n'.join(chi_lines)
    orig_data.append({'eng': eng, 'chi': chi})
    # normalize English for matching
    orig_eng_list.append(re.sub(r'[^a-zA-Z0-9 ]', '', eng).lower().strip())

time_eng_list = []
for sub in time_subs:
    eng = ' '.join(sub['text'])
    time_eng_list.append(re.sub(r'[^a-zA-Z0-9 ]', '', eng).lower().strip())

# Global alignment using Sequence Matcher over list
# But wait, difflib on list of strings requires exact match. Since strings are split differently, 
# a list-of-strings match won't work well!

# Better idea: we maintain a moving window index through orig_data. 
# Since both files are sequential, `time_subs[i]` should map to `orig_data[j]` where j is near i.
# Also, one `orig_data` might cover multiple `time_subs`. We can assign the Chinese text to the FIRST `time_subs` 
# that overlaps with it, or distribute it. Best is to assign it to ALL or just the first.
# Or, if `orig_data[j]` is closest to `time_subs[i]`, assign `orig_data[j]['chi']` to `time_subs[i]`.
# We avoid reusing the same `orig_data[j]['chi']` continuously if it was already confidently mapped to a previous sub, 
# unless it's a split.

assigned_chis = [""] * len(time_subs)
mapped_j = [-1] * len(time_subs)

search_start = 0
for i, t_eng in enumerate(time_eng_list):
    if not t_eng: continue
    
    best_ratio = 0
    best_j = -1
    
    # search window of -2 to +10 from search_start
    for j in range(max(0, search_start - 2), min(len(orig_data), search_start + 10)):
        o_eng = orig_eng_list[j]
        if not o_eng: continue
        
        ratio = difflib.SequenceMatcher(None, t_eng, o_eng).ratio()
        
        # also consider if t_eng is a SUBSTRING of o_eng
        if len(t_eng) > 5 and t_eng in o_eng:
            ratio = max(ratio, 0.8) # boost ratio for strict substrings
            
        if ratio > best_ratio:
            best_ratio = ratio
            best_j = j
            
    if best_ratio > 0.6 and best_j != -1: # found reasonable match
        search_start = best_j # update our pointer
        
        # If this Chinese line hasn't been used yet, assign it to the current time_subs block
        # Or, if an orig_data line spans multiple time_subs lines, we only attach the chinese line 
        # to the FIRST time_subs block to avoid repeating.
        
        already_used = best_j in mapped_j[:i]
                
        if not already_used:
            assigned_chis[i] = orig_data[best_j]['chi']
            mapped_j[i] = best_j
        else:
            mapped_j[i] = best_j

with open('146_merged.srt', 'w', encoding='utf-8') as out_f:
    for i, sub in enumerate(time_subs):
        out_f.write(f"{sub['idx']}\n{sub['time']}\n")
        out_f.write('\n'.join(sub['text']) + "\n")
        if assigned_chis[i].strip():
            out_f.write(assigned_chis[i].strip() + "\n")
        out_f.write("\n")

print("Merging complete. Created 146_merged.srt")
