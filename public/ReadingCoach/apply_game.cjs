const fs = require('fs');
const path = require('path');

const gameData = require('./game_data.json');

const cssChunk = `
        .tab-content.active {
            display: block;
        }

        /* 聽音重組樣式 */
        .game-board { margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; }
        .word-bank { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; padding: 15px; background-color: #fff; border-radius: 8px; border: 1px dashed #ccc; min-height: 50px; }
        .answer-area { display: flex; flex-wrap: wrap; gap: 10px; min-height: 50px; padding: 15px; background-color: #e3f2fd; border-radius: 8px; border: 2px solid #2196F3; margin-bottom: 20px; }
        .word-block { background-color: #fff; border: 2px solid #2196F3; border-radius: 6px; padding: 8px 15px; cursor: pointer; font-size: 16px; font-weight: bold; color: #1565c0; user-select: none; transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .word-block:hover { background-color: #e3f2fd; transform: translateY(-2px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .game-status { margin-top: 15px; font-weight: bold; font-size: 18px; text-align: center; min-height: 27px; }
        .status-correct { color: #4CAF50; }
        .status-wrong { color: #F44336; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .error-shake { animation: shake 0.3s ease-in-out; background-color: #ffebee !important; border-color: #f44336 !important; color: #c62828 !important; }
        .game-controls { margin-top: 20px; text-align: center; }
    </style>`;

const tabButtonChunk = `
                <button type="button" class="tab" onclick="showTab(event, 'reading')">閱讀技巧</button>
                <button type="button" class="tab" onclick="showTab(event, 'reconstruction')">🎧 聽音重組</button>
            </div>`;

const tabContentChunk = `
            <!-- 聽音重組分頁 -->
            <div id="reconstruction" class="tab-content">
                <h3>🎧 聽音重組挑戰</h3>
                <div class="info-box">
                    <p>點擊下方單字庫，拼出你聽到的句子。所有字母皆轉為小寫，並隱藏標點符號，考驗你真正的聽力！完成語塊會顯示「語塊精解模式」幫助你學好英文。</p>
                </div>
                <div class="game-board">
                    <div class="mode-toggle" style="text-align: center; margin-bottom: 20px;">
                        <button type="button" id="btnChunkMode" class="btn"
                            style="padding: 8px 15px; background-color: #2196F3;" onclick="setGameMode('chunk')">🧩
                            語塊模式</button>
                        <button type="button" id="btnWordMode" class="btn"
                            style="padding: 8px 15px; background-color: #9e9e9e;" onclick="setGameMode('word')">🔤
                            單字模式</button>
                    </div>
                    <div style="text-align: center; margin-bottom: 20px;">
                        <span id="gameProgress"
                            style="font-size: 18px; font-weight: bold; color: #1565c0; margin-right: 15px;">進度: 1 /
                            6</span>
                        <button type="button" class="btn" style="background-color: #2196F3;"
                            onclick="playCurrentSentence()">🔊 播放此句</button>
                    </div>
                    <div class="answer-area" id="answerArea"></div>
                    <div class="word-bank" id="wordBank"></div>
                    <div id="reviewArea"></div>
                    <div class="game-controls">
                        <button type="button" class="btn" style="background-color: #4CAF50; display: none;" id="nextBtn"
                            onclick="nextSentence()">➡️ 下一句</button>
                    </div>
                    <div class="game-status" id="gameStatus"></div>
                    <div id="translationHint"
                        style="text-align: center; color: #666; margin-top: 10px; font-style: italic; display: none;">
                    </div>
                </div>
            </div>
        </div>`;

const getJsChunk = (sentences) => `
        // 頁面載入時初始化
        window.onload = () => {
            if (typeof initText === 'function') initText();
            initGame();
        };

        // --- 聽音重組遊戲邏輯 ---
        const gameSentences = ${JSON.stringify(sentences, null, 12)};

        let currentGameIndex = 0;
        let currentWords = [];
        let answerWords = [];
        let bankWords = [];
        let gameMode = 'chunk';

        function setGameMode(mode) {
            gameMode = mode;
            document.getElementById('btnChunkMode').style.backgroundColor = (mode === 'chunk') ? '#2196F3' : '#9e9e9e';
            document.getElementById('btnWordMode').style.backgroundColor = (mode === 'word') ? '#2196F3' : '#9e9e9e';
            answerWords = [];
            initGame();
        }

        function playGoogleTTS(text) {
            const synth = window.speechSynthesis;
            if (synth.speaking) {
                synth.cancel();
            }

            setTimeout(() => {
                const u = new SpeechSynthesisUtterance(text);
                const voices = synth.getVoices();
                const googleVoice = voices.find(v => v.name.includes('Google') && v.lang.includes('en')) || voices.find(v => v.lang === 'en-US');

                if (googleVoice) {
                    u.voice = googleVoice;
                }

                const rateSlider = document.getElementById('rateSlider');
                if (rateSlider) u.rate = parseFloat(rateSlider.value);

                synth.speak(u);
            }, 50);
        }

        function playCurrentSentence() {
            playGoogleTTS(gameSentences[currentGameIndex].en);
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function initGame() {
            if (currentGameIndex >= gameSentences.length) {
                document.getElementById('gameProgress').textContent = "🎉 恭喜完成所有挑戰！";
                document.getElementById('wordBank').innerHTML = "";
                document.getElementById('answerArea').innerHTML = "";
                document.getElementById('reviewArea').innerHTML = "";
                document.getElementById('nextBtn').style.display = 'none';
                document.getElementById('translationHint').style.display = 'none';
                return;
            }

            document.getElementById('gameProgress').textContent = "進度: " + (currentGameIndex + 1) + " / " + gameSentences.length;
            document.getElementById('gameStatus').textContent = "";
            document.getElementById('gameStatus').className = "game-status";
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('reviewArea').innerHTML = "";

            const transHint = document.getElementById('translationHint');
            transHint.textContent = "💡 提示: " + gameSentences[currentGameIndex].zh;
            transHint.style.display = 'block';

            if (gameMode === 'chunk' && gameSentences[currentGameIndex].chunks) {
                currentWords = [...gameSentences[currentGameIndex].chunks];
            } else {
                let rawText = gameSentences[currentGameIndex].en;
                rawText = rawText.replace(/[.,!?”“’:]/g, '');
                currentWords = rawText.split(/\\s+/).filter(w => w.length > 0).map(w => w.toLowerCase());
            }

            answerWords = [];
            bankWords = [...currentWords];
            shuffleArray(bankWords);

            renderGame();
        }

        function renderGame() {
            const answerArea = document.getElementById('answerArea');
            const wordBank = document.getElementById('wordBank');

            answerArea.innerHTML = '';
            answerWords.forEach((word) => {
                const btn = document.createElement('div');
                btn.className = 'word-block';
                btn.textContent = word;
                btn.style.cursor = 'default';
                answerArea.appendChild(btn);
            });

            wordBank.innerHTML = '';
            bankWords.forEach((word, index) => {
                const btn = document.createElement('div');
                btn.className = 'word-block';
                btn.textContent = word;
                btn.onclick = () => moveWord(index);
                wordBank.appendChild(btn);
            });
        }

        function moveWord(index) {
            const selectedWord = bankWords[index];
            const expectedWord = currentWords[answerWords.length];

            playGoogleTTS(selectedWord);

            if (selectedWord === expectedWord) {
                const word = bankWords.splice(index, 1)[0];
                answerWords.push(word);
                document.getElementById('gameStatus').textContent = "";
                renderGame();

                const reviewArea = document.getElementById('reviewArea');
                reviewArea.innerHTML = '';
                const reviewData = gameSentences[currentGameIndex].reviewData;
                if (reviewData && gameMode === 'chunk') {
                    const item = reviewData.find(r => word.includes(r.chunk));
                    if (item) {
                        const reviewContainer = document.createElement('div');
                        reviewContainer.className = 'post-submit-review';
                        reviewContainer.style.marginTop = '20px';
                        reviewContainer.style.textAlign = 'left';

                        const card = document.createElement('div');
                        card.className = 'chunk-review-card';
                        card.style.backgroundColor = '#f1f8e9';
                        card.style.borderLeft = '4px solid #8bc34a';
                        card.style.padding = '15px';
                        card.style.marginBottom = '10px';
                        card.style.borderRadius = '6px';
                        card.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';

                        card.innerHTML = "<div style='font-weight: bold; font-size: 16px; color: #33691e; margin-bottom: 8px;'>📌 語塊範例：" + item.chunk + "</div><div style='font-size: 15px; margin-bottom: 5px; line-height: 1.5;'><strong>中文語意：</strong> " + item.meaning + "</div><div style='font-size: 15px; margin-bottom: 5px; line-height: 1.5;'><strong>母語者搭配 (Collocations)：</strong> " + item.collocation + "</div><div style='font-size: 15px; margin-bottom: 5px; line-height: 1.5;'><strong>同義替換 (Synonyms)：</strong> " + item.synonym + "</div><div style='font-size: 15px; color: #555; line-height: 1.5; margin-top: 8px; background: #fff; padding: 8px; border-radius: 4px;'><strong>🎧 聽力連讀點：</strong> " + item.pronunciation + "</div>";
                        reviewContainer.appendChild(card);
                        reviewArea.appendChild(reviewContainer);
                    }
                }

                if (answerWords.length === currentWords.length) {
                    const statusDiv = document.getElementById('gameStatus');
                    statusDiv.textContent = "✅ 太棒了！完全正確。";
                    statusDiv.className = "game-status status-correct";
                    document.getElementById('nextBtn').style.display = 'inline-block';

                    const wordBank = document.getElementById('wordBank');
                    wordBank.innerHTML = '';
                    const finalSentence = document.createElement('div');
                    finalSentence.className = 'word-block';
                    finalSentence.style.cursor = 'default';
                    finalSentence.style.backgroundColor = '#4CAF50';
                    finalSentence.style.color = 'white';
                    finalSentence.style.borderColor = '#388E3C';
                    finalSentence.style.width = '100%';
                    finalSentence.style.textAlign = 'center';
                    finalSentence.style.whiteSpace = 'normal';
                    finalSentence.style.padding = '15px';
                    
                    finalSentence.innerHTML = "<div style='font-size: 20px; font-weight: bold; margin-bottom: 8px;'>" + gameSentences[currentGameIndex].en + "</div><div style='font-size: 16px; font-weight: normal; opacity: 0.9;'>" + gameSentences[currentGameIndex].zh + "</div>";
                    wordBank.appendChild(finalSentence);

                    setTimeout(() => {
                        playGoogleTTS(gameSentences[currentGameIndex].en);
                    }, 1500);
                }
            } else {
                const statusDiv = document.getElementById('gameStatus');
                statusDiv.textContent = gameMode === 'chunk' ? "❌ 順序不對喔！仔細聽聽下一個語塊是什麼。" : "❌ 順序不對喔！仔細聽聽下一個字是什麼。";
                statusDiv.className = "game-status status-wrong";

                const buttons = document.getElementById('wordBank').children;
                if (buttons[index]) {
                    buttons[index].classList.remove('error-shake');
                    void buttons[index].offsetWidth;
                    buttons[index].classList.add('error-shake');
                }
            }
        }

        function nextSentence() {
            currentGameIndex++;
            initGame();
        }
    </script>`;

const processFile = (fileKey) => {
    const filename = fileKey + '.html';
    const filePath = path.join(__dirname, filename);
    if (!fs.existsSync(filePath)) {
        console.log("File not found: " + filename);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already has reconstruction tab
    if (content.includes('id="reconstruction"')) {
        console.log("File " + filename + " already has reconstruction tab.");
        return;
    }

    // 1. Inject CSS
    content = content.replace(
        /.tab-content.active\s*\{\s*display:\s*block;\s*\}\s*<\/style>/,
        cssChunk
    );

    // 2. Inject Tab button
    content = content.replace(
        /<button type="button" class="tab" onclick="showTab\(event, 'reading'\)">閱讀技巧<\/button>\s*<\/div>/,
        tabButtonChunk
    );

    // 3. Inject Tab content HTML before the end of learning-section
    content = content.replace(
        /<div id="reading" class="tab-content">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
        match => {
            return match.replace(/<\/div>\s*<\/div>$/, "</div>\n            </div>\n\n" + tabContentChunk);
        }
    );

    // 4. Inject JS logic
    const sentences = gameData[fileKey] || [];
    content = content.replace(
        /window\.onload = initText;\s*<\/script>/,
        getJsChunk(sentences)
    );

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Successfully updated " + filename);
};

const fileKeys = Object.keys(gameData);
fileKeys.forEach(processFile);
