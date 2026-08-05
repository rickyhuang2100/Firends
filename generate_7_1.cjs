const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Text to Speech - Mabel Ping-Hua Lee’s Fight for Voting Rights</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 50px auto; padding: 20px; background-color: #f5f5f5; }
        .container { background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; } h2 { color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; margin-top: 30px; } h3 { color: #555; margin-top: 20px; }
        .text-content { background-color: #f9f9f9; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0; line-height: 2.5; font-size: 18px; }
        .word { display: inline; padding: 2px 4px; margin: 0 1px; border-radius: 3px; transition: all 0.2s ease; }
        .word.active { background-color: #4CAF50; color: white; font-weight: bold; padding: 4px 6px; } .word.completed { color: #999; }
        .controls { text-align: center; margin: 20px 0; }
        .btn { background-color: #4CAF50; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 5px; } .btn:hover { background-color: #45a049; } .btn-stop { background-color: #f44336; } .btn-stop:hover { background-color: #da190b; }
        .settings { margin: 20px 0; padding: 15px; background-color: #f0f0f0; border-radius: 5px; } .setting-item { margin: 10px 0; }
        label { display: inline-block; width: 100px; font-weight: bold; } select, input[type="range"] { width: 200px; padding: 5px; }
        .value-display { display: inline-block; margin-left: 10px; font-weight: bold; color: #4CAF50; }
        .learning-section { margin-top: 30px; padding: 20px; background-color: #fff9e6; border-radius: 8px; border: 2px solid #ffd966; }
        .vocab-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }
        .vocab-item { background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; }
        .vocab-word { font-size: 18px; font-weight: bold; color: #2196F3; } .vocab-type { color: #666; font-style: italic; font-size: 14px; } .vocab-meaning { margin-top: 8px; color: #333; }
        .grammar-box { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #4CAF50; }
        .grammar-title { font-weight: bold; color: #2e7d32; margin-bottom: 8px; }
        .example { background-color: #fff3e0; padding: 10px; margin: 8px 0; border-radius: 4px; font-style: italic; }
        .highlight { background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px; font-weight: bold; }
        .info-box { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2196F3; }
        .sentence-pattern { background-color: #f3e5f5; padding: 12px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #9c27b0; }
        ul, ol { line-height: 1.8; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #ddd; flex-wrap: wrap; }
        .tab { padding: 10px 20px; cursor: pointer; background-color: #f0f0f0; border: none; border-radius: 5px 5px 0 0; font-size: 16px; } .tab.active { background-color: #4CAF50; color: white; }
        .tab-content { display: none; } .tab-content.active { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📖 Mabel Ping-Hua Lee’s Fight for Voting Rights</h1>
        <div class="settings">
            <h3>語音設定</h3>
            <div class="setting-item"><label>語音:</label><select id="voiceSelect"></select></div>
            <div class="setting-item"><label>速度:</label><input type="range" id="rateSlider" min="0.5" max="2" step="0.1" value="1" /><span class="value-display" id="rateValue">1.0</span></div>
            <div class="setting-item"><label>音調:</label><input type="range" id="pitchSlider" min="0" max="2" step="0.1" value="1" /><span class="value-display" id="pitchValue">1.0</span></div>
            <div class="setting-item"><label>音量:</label><input type="range" id="volumeSlider" min="0" max="1" step="0.1" value="1" /><span class="value-display" id="volumeValue">1.0</span></div>
            <div class="setting-item"><label>同步調整:</label><input type="range" id="timingSlider" min="0.5" max="1.5" step="0.05" value="1.5" /><span class="value-display" id="timingValue">1.5</span><span style="font-size: 12px; color: #666; margin-left: 10px;">← 太快 | 太慢 →</span></div>
        </div>
        <div class="controls">
            <button type="button" class="btn" onclick="speakText()">🔊 開始朗讀</button>
            <button type="button" class="btn btn-stop" onclick="stopSpeaking()">⏹️ 停止</button>
        </div>
        <div class="text-content" id="storyContainer"></div>
        <div class="learning-section">
            <h2>📚 英文學習資訊</h2>
            <div class="tabs">
                <button type="button" class="tab active" onclick="showTab(event, 'translation')">中文翻譯</button>
                <button type="button" class="tab" onclick="showTab(event, 'vocabulary')">重點單字</button>
                <button type="button" class="tab" onclick="showTab(event, 'grammar')">文法重點</button>
                <button type="button" class="tab" onclick="showTab(event, 'sentences')">句型分析</button>
                <button type="button" class="tab" onclick="showTab(event, 'reading')">閱讀技巧</button>
            </div>
            <div id="translation" class="tab-content active">
                <h3>🌏 中文翻譯</h3>
                <div class="info-box" style="line-height: 2; font-size: 16px;">
                    <p>李彬華 (Mabel Ping-Hua Lee) 是一位中國女性，她大半輩子都住在美國，並將一生奉獻於爭取性別平等。她在年輕時就開始為女性的選舉權（投票權）發起運動。她相信在法律面前，所有人都應該被平等對待。李彬華為女權寫作、遊行並抗議。</p>
                    <p>1896年10月7日，李彬華出生於中國南部，距離香港不遠。她在一所教會學校學習英文，並在九歲時獲得了學術獎學金。這筆獎學金讓她得以與家人搬到美國。他們定居在紐約。</p>
                    <p>李彬華是一名優秀的學生，她渴望改善婦女與女孩的生活。到了她16歲時，她在女性選舉權運動中已經相當知名。許多報紙都報導了這位年輕的倡議者。1912年，紐約市舉行了一場大型遊行，以提倡女性的投票權。李彬華騎馬協助帶領這場遊行。大約有1萬人參加！遊行結束後，《紐約時報》寫了一篇關於她成就的文章，並稱她為「所有女性將獲得自由之新時代的象徵……」</p>
                    <p>李彬華這時才剛起步！她就讀於巴納德學院 (Barnard College)，這是一所女子學校，創立於哥倫比亞大學拒絕接受女性入學之後。在巴納德學院，李彬華為《中國學生月刊》撰寫女性主義文章。其中一篇文章主張，只有在女性可以投票的情況下，民主才有可能實現。她鼓勵其他中國女性加入選舉權運動。她也提倡女性教育。</p>
                    <p>儘管李彬華對女性選舉權運動有所貢獻，但她直到大多數美國女性能夠投票的幾十年後才獲得投票權。紐約州的女性在1917年獲得了投票權。接著，在1920年，美國憲法第十九修正案賦予了所有州女性投票權。但是許多有色人種女性被排除在這項法律之外。李彬華是一名中國女性。《排華法案》是一項禁止中國人成為公民並限制中國移民的聯邦法律。因為這項法律，李彬華無法成為公民，因此也無法投票。她與其他中國女權運動者為了一項她們無法行使的權利奮鬥了許久！這項歧視性法律最終在1943年被廢除，也就是第十九修正案通過的20多年後。</p>
                    <p>李彬華將餘生奉獻給在美國的華人社區。她是美國第一位獲得經濟學博士學位的中國女性。李彬華建立了一個華人社區中心，提供英文課程、健康診所和幼稚園。沒有人知道李彬華是否曾經成為美國公民並投下她的第一張選票。但她將一生致力於在美國爭取性別平等。</p>
                </div>
            </div>
            <div id="vocabulary" class="tab-content">
                <h3>📖 重點單字與片語</h3>
                <div class="vocab-grid">
                    <div class="vocab-item"><div class="vocab-word">devote</div><div class="vocab-type">v. 動詞</div><div class="vocab-meaning">奉獻，致力於</div><div class="example">She <span class='highlight'>devoted</span> her life to fighting for gender equality.</div></div>
                    <div class="vocab-item"><div class="vocab-word">suffrage</div><div class="vocab-type">n. 名詞</div><div class="vocab-meaning">選舉權，投票權</div><div class="example">She began campaigning for women’s <span class='highlight'>suffrage</span>.</div></div>
                    <div class="vocab-item"><div class="vocab-word">advocate</div><div class="vocab-type">v. 動詞</div><div class="vocab-meaning">提倡，主張</div><div class="example">A large parade was held to <span class='highlight'>advocate</span> for women’s voting rights.</div></div>
                    <div class="vocab-item"><div class="vocab-word">exclude</div><div class="vocab-type">v. 動詞</div><div class="vocab-meaning">排除，拒絕接納</div><div class="example">Many women of color were <span class='highlight'>excluded</span> from this law.</div></div>
                    <div class="vocab-item"><div class="vocab-word">discriminatory</div><div class="vocab-type">adj. 形容詞</div><div class="vocab-meaning">歧視性的</div><div class="example">This <span class='highlight'>discriminatory</span> law was finally abolished in 1943.</div></div>
                    <div class="vocab-item"><div class="vocab-word">abolish</div><div class="vocab-type">v. 動詞</div><div class="vocab-meaning">廢除</div><div class="example">The law was finally <span class='highlight'>abolished</span> in 1943.</div></div>
                </div>
            </div>
            <div id="grammar" class="tab-content">
                <h3>✏️ 文法重點解析</h3>
                    <div class="grammar-box"><div class="grammar-title">By the time + S + V（到了……的時候）</div><p>表示在過去某個時間點之前，已經完成的狀態或發生的事情。通常搭配過去式或過去完成式。</p>
                        <div class="example"><span class='highlight'>By the time</span> she was 16, she was well known in the women’s suffrage movement.</div>
                        <div class="example"><span class='highlight'>By the time</span> we arrived, the movie had started.</div>
                    </div>
                    <div class="grammar-box"><div class="grammar-title">Even though + S + V（儘管…… / 雖然……）</div><p>用來引導讓步子句，表示雖然有某種狀況，但還是發生了令人意外的結果。</p>
                        <div class="example"><span class='highlight'>Even though</span> Mabel Ping-Hua Lee helped the women’s suffrage movement, she could not vote...</div>
                        <div class="example"><span class='highlight'>Even though</span> it was raining, they went for a walk.</div>
                    </div>
            </div>
            <div id="sentences" class="tab-content">
                <h3>💬 重要句型分析</h3>
                    <div class="sentence-pattern"><strong>allow + 受詞 + to V（允許 / 讓某人能夠做某事）</strong><p>表示給予許可或提供機會讓某事發生。</p>
                        <div class="example">This scholarship <span class='highlight'>allowed her to move</span> to the U.S. with her family.</div>
                        <div class="example">The new software <span class='highlight'>allows users to work</span> faster.</div>
                    </div>
                    <div class="sentence-pattern"><strong>devote / commit + one's life to + V-ing/N（將一生奉獻/致力於……）</strong><p>注意這裡的 to 是介系詞，後面必須加上名詞或動名詞 (V-ing)。</p>
                        <div class="example">She <span class='highlight'>devoted her life to fighting</span> for gender equality.</div>
                        <div class="example">She <span class='highlight'>committed her life to fighting</span> for gender equality.</div>
                    </div>
            </div>
            <div id="reading" class="tab-content">
                <h3>🎯 閱讀理解</h3>
                <div class="grammar-box"><div class="grammar-title">理解測驗</div><ol>
                        <li style="margin-bottom: 15px;">李彬華在16歲時因為什麼而聞名？<ul style="list-style-type: none; padding-left: 20px; margin-top: 5px;"><li>A) 她在經濟學方面的成就</li><li>B) 她在女性選舉權運動中的活躍</li><li>C) 她建立了一所學校</li><li>D) 她的英文寫作能力</li></ul><p style="color: #4CAF50; font-weight: bold;">正確答案：B</p></li>
                        <li style="margin-bottom: 15px;">為什麼第十九修正案通過後，李彬華仍然無法投票？<ul style="list-style-type: none; padding-left: 20px; margin-top: 5px;"><li>A) 因為她不想投票</li><li>B) 因為她沒有通過考試</li><li>C) 因為《排華法案》阻止她成為美國公民</li><li>D) 因為她太年輕了</li></ul><p style="color: #4CAF50; font-weight: bold;">正確答案：C</p></li>
                        <li style="margin-bottom: 15px;">根據文章，李彬華是美國第一位達成什麼成就的中國女性？<ul style="list-style-type: none; padding-left: 20px; margin-top: 5px;"><li>A) 在大學教書</li><li>B) 獲得經濟學博士學位</li><li>C) 騎馬帶領遊行</li><li>D) 寫作女性主義書籍</li></ul><p style="color: #4CAF50; font-weight: bold;">正確答案：B</p></li>
                </ol></div>
            </div>

        </div>
    </div>
<script src="https://giscus.app/client.js" data-repo="rickyhuang2100/course-discussions" data-repo-id="R_kgDORQOB6g" data-category="Announcements" data-category-id="DIC_kwDORQOB6s4C2a-I" data-mapping="pathname" data-strict="0" data-reactions-enabled="1" data-emit-metadata="0" data-input-position="bottom" data-theme="preferred_color_scheme" data-lang="zh-TW" crossorigin="anonymous" async></script>
    <script>
        const synth = window.speechSynthesis; let voices = []; let wordElements = []; let currentIndex = 0; let highlightTimer = null; let timingAdjustment = 1.5;
        const storyText = \`Mabel Ping-Hua Lee was a Chinese woman who lived most of her life in the U.S. and devoted her life to fighting for gender equality. She began campaigning for women’s suffrage, or the right to vote, at a young age. She believed all people should be treated equally under the law. Lee wrote, marched, and protested for women’s rights.

Mabel Ping-Hua Lee was born in southern China, not too far from Hong Kong on October 7, 1896. She learned English at a missionary school and won an academic scholarship when she was nine years old. This scholarship allowed her to move to the U.S. with her family. They settled in New York.

Lee was an excellent student who wanted to improve the lives of women and girls. By the time she was 16, she was well known in the women’s suffrage movement. Many newspapers wrote about this young activist. In 1912, a large parade was held in New York City to advocate for women’s voting rights. Lee helped lead the parade on horseback. Around 10,000 people attended! After the parade, The New York Times wrote an article about her accomplishments and called her “the symbol of a new era, when all women will be free . . . .”

Mabel Ping-Hua Lee was just getting started! She studied at Barnard College, an all-women’s school that was founded after Columbia University refused to accept women into the university. At Barnard, Lee wrote feminist essays for The Chinese Students’ Monthly. One essay argued that democracy was only possible if women could vote. She encouraged other Chinese women to join the suffrage movement. She also promoted women’s education.

Even though Mabel Ping-Hua Lee helped the women’s suffrage movement, she could not vote until decades after most American women could vote. Women in New York were granted the right to vote in 1917. Then, in 1920, the 19th Amendment gave women the right to vote in all states. But many women of color were excluded from this law. Lee was a Chinese woman. The Chinese Exclusion Act was a federal law that prohibited Chinese people from becoming citizens and limited Chinese immigration. Because of this law, Lee could not become a citizen and, therefore, could not vote. She and other Chinese suffragettes had fought hard for a right they could not exercise! This discriminatory law was finally abolished in 1943, more than 20 years after the 19th Amendment was passed.

Mabel Ping-Hua Lee devoted the rest of her life to serving the Chinese community in the States. She was the first Chinese woman to get a PhD in economics in the U.S. Lee created a Chinese community center that offered English classes, a health clinic, and a kindergarten. No one knows if Mabel Ping-Hua Lee ever became a U.S. citizen and cast her first vote. But she committed her life to fighting for gender equality in the U.S.\`;
        function initText() { const container = document.getElementById('storyContainer'); const lines = storyText.split('\\n'); lines.forEach((line, li) => { if (line.trim() === '') { container.appendChild(document.createElement('br')); return; } const words = line.split(' '); words.forEach((word, wi) => { if (word.trim()) { const span = document.createElement('span'); span.className = 'word'; span.textContent = word; container.appendChild(span); wordElements.push(span); if (wi < words.length - 1) container.appendChild(document.createTextNode(' ')); } }); if (li < lines.length - 1) container.appendChild(document.createElement('br')); }); }
        function loadVoices() { voices = synth.getVoices(); const select = document.getElementById('voiceSelect'); select.innerHTML = ''; voices.forEach((v, i) => { const o = document.createElement('option'); o.textContent = \`\${v.name} (\${v.lang})\`; o.value = i; select.appendChild(o); if (v.lang.startsWith('en-US')) select.selectedIndex = i; }); }
        if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices; loadVoices();
        document.getElementById('rateSlider').oninput = function() { document.getElementById('rateValue').textContent = this.value; };
        document.getElementById('pitchSlider').oninput = function() { document.getElementById('pitchValue').textContent = this.value; };
        document.getElementById('volumeSlider').oninput = function() { document.getElementById('volumeValue').textContent = this.value; };
        document.getElementById('timingSlider').oninput = function() { timingAdjustment = parseFloat(this.value); document.getElementById('timingValue').textContent = this.value; };
        function highlightWord(index) { if (index < currentIndex) return; currentIndex = index; wordElements.forEach((w, i) => { w.classList.remove('active', 'completed'); if (i < index) w.classList.add('completed'); }); if (index < wordElements.length) wordElements[index].classList.add('active'); }
        function speakText() { if (synth.speaking) synth.cancel(); if (highlightTimer) clearInterval(highlightTimer); currentIndex = 0; wordElements.forEach(w => w.classList.remove('active', 'completed')); const u = new SpeechSynthesisUtterance(storyText); const vi = document.getElementById('voiceSelect').value; if (voices[vi]) u.voice = voices[vi]; u.rate = parseFloat(document.getElementById('rateSlider').value); u.pitch = parseFloat(document.getElementById('pitchSlider').value); u.volume = parseFloat(document.getElementById('volumeSlider').value); let bs = false; u.addEventListener('boundary', (e) => { if (e.name === 'word') { bs = true; const t = storyText.substring(0, e.charIndex); const wb = t.trim().split(/\\s+/).filter(w => w.length > 0); if (wb.length < wordElements.length) highlightWord(wb.length); } }); u.onend = function() { if (highlightTimer) clearInterval(highlightTimer); setTimeout(() => { wordElements.forEach(w => w.classList.remove('active', 'completed')); }, 500); }; synth.speak(u); setTimeout(() => { if (!bs) { const r = u.rate; const ms = (60000 / (150 * r)) * timingAdjustment; currentIndex = 0; highlightWord(0); let ni = 1; highlightTimer = setInterval(() => { if (ni < wordElements.length && synth.speaking) { if (ni >= currentIndex) highlightWord(ni); ni++; } else clearInterval(highlightTimer); }, ms); } }, 300); }
        function stopSpeaking() { if (synth.speaking) synth.cancel(); if (highlightTimer) clearInterval(highlightTimer); wordElements.forEach(w => w.classList.remove('active', 'completed')); }
        function showTab(event, tabName) { document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); document.querySelectorAll('.tab').forEach(t => t.classList.remove('active')); document.getElementById(tabName).classList.add('active'); event.currentTarget.classList.add('active'); }
        window.onload = initText;
    </script>
</body>
</html>
`;

fs.writeFileSync('public/ReadingCoach/7_1.html', htmlContent, 'utf-8');
console.log('Successfully created public/ReadingCoach/7_1.html');
