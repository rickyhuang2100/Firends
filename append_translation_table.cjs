const fs = require('fs');
const path = require('path');

const generateTable = (pairs) => {
    let rows = pairs.map(([en, zh], index) => {
        const borderStyle = index === pairs.length - 1 ? '' : 'border-bottom: 1px solid #ddd;';
        return `                        <tr style="${borderStyle}">
                            <td style="padding: 10px; width: 50%; vertical-align: top;"><strong style="color: #4CAF50;">English:</strong><br>${en}</td>
                            <td style="padding: 10px; width: 50%; vertical-align: top;"><strong style="color: #2196F3;">中文:</strong><br>${zh}</td>
                        </tr>`;
    }).join('\n');
    return `<div class="grammar-box">
                    <div class="grammar-title">逐句對照</div>
                    <table style="width: 100%; border-collapse: collapse;">
${rows}
                    </table>
                </div>`;
};

const processFile = (filename, pairs) => {
    const filePath = path.join('c:/Ricky/Firends/public/ReadingCoach', filename);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find the translation tab using regex to handle whitespace variations
    const startRegex = /<div id="translation" class="tab-content active">/;
    const endRegex = /<\/div>\s*<div id="vocabulary" class="tab-content">/;
    
    const startMatch = content.match(startRegex);
    const endMatch = content.match(endRegex);
    
    if (startMatch && endMatch) {
        const startIndex = startMatch.index;
        const endIndex = endMatch.index + '</div>'.length;
        
        const origSection = content.substring(startIndex, endIndex);
        
        // Check if we already have a table to avoid double insertion
        if (!origSection.includes('<table')) {
            const tableHtml = generateTable(pairs);
            const newSection = origSection.replace('</div>', tableHtml + '\n            </div>');
            content = content.replace(origSection, newSection);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated ${filename}`);
        } else {
            console.log(`Table already exists in ${filename}`);
        }
    } else {
        console.log(`Could not find markers in ${filename}`);
    }
};

const pairs72 = [
    ["The Cree are one of the largest Indigenous peoples in North America.", "克里族（Cree）是北美最大的原住民族群之一。"],
    ["They mostly live in Canada and parts of the United States.", "他們主要居住在加拿大以及美國的部分地區。"],
    ["One important aspect of Cree culture is drumming.", "克里族文化的一個重要面向是打鼓。"],
    ["For the Cree, like for many other Indigenous peoples, drumming is a sacred activity.", "對克里族而言，就像對許多其他原住民族一樣，打鼓是一種神聖的活動。"],
    ["Drums are used in Cree ceremonies and rituals.", "鼓被用於克里族的儀式和禮典中。"],
    ["Especially in certain Plains Cree rituals, drum beats symbolize the heartbeat of Earth and the circle of life.", "尤其是在某些平原克里族的儀式中，鼓聲象徵著大地的心跳與生命的循環。"],
    ["The Cree use different kinds of drums for different purposes.", "克里族為了不同的目的使用不同種類的鼓。"],
    ["One important kind of drum is the frame drum.", "框架鼓（frame drum）是一種重要的鼓。"],
    ["Frame drums are small drums with one head, or drumming surface.", "框架鼓是小型鼓，只有一個鼓面（即敲擊面）。"],
    ["These drums are used by one individual player in ceremonies and rituals.", "這些鼓在儀式和禮典中由單一演奏者使用。"],
    ["To make these drums, the Cree use birch wood to create a frame for the drum.", "製作這些鼓時，克里族人用樺木製作鼓的框架，"],
    ["Then, they stretch deer hide tightly around the frame.", "然後把鹿皮緊繃地包覆在框架上，"],
    ["This creates a taut surface for drumming.", "形成一個緊繃的敲擊面。"],
    ["One special feature of these types of Cree drums is their tuning strings.", "這類克里族鼓有一個特殊之處，就是它們的調音弦。"],
    ["Cree drum-makers attach special twisted rawhide strings under the drum's surface.", "克里族的製鼓師會在鼓面下方固定特殊的扭轉生皮弦。"],
    ["These strings change the sounds that the drum can make.", "這些弦能改變鼓所發出的聲音。"],
    ["The drummer can vibrate these strings to create different sounds while drumming.", "鼓手可以讓這些弦振動，在打鼓時產生不同的音效。"],
    ["Another important type of drum used by Cree and other Plains Indigenous peoples is the powwow drum.", "克里族和其他平原原住民族使用的另一種重要鼓是「戰舞鼓」（powwow drum）。"],
    ["Powwow drums are large.", "戰舞鼓體型較大。"],
    ["Sometimes, they are one very large surface that multiple people can drum on.", "有時，它是一個非常大的鼓面，可以讓多人同時敲打。"],
    ["Sometimes they have two heads, like a long tube with a drum head at each end.", "有時它有兩個鼓面，就像一根長管兩端各有一個鼓面。"],
    ["Powwow drums are often used in powwows and other ceremonies.", "戰舞鼓常被用於戰舞集會和其他儀式中。"],
    ["One important ritual of some Cree ceremonies is the Round Dance.", "「圓圈舞」（Round Dance）是一些克里族儀式中的重要傳統。"],
    ["In the past, the Round Dance was a way for Cree people to honor their deceased ancestors.", "過去，圓圈舞是克里族人紀念已故先祖的一種方式。"],
    ["Special songs were sung along with the drumming.", "人們會伴隨著鼓聲演唱特殊歌謠，"],
    ["People gave offerings to divine forces and prayed for their deceased ancestors.", "並向神聖力量獻上供品，為已故的祖先祈禱。"],
    ["Today, the Round Dance has evolved into an important spiritual and social gathering.", "如今，圓圈舞已演化為一種重要的精神性與社交性聚會。"],
    ["Many Indigenous peoples have their own versions of the Round Dance.", "許多原住民族都有他們自己版本的圓圈舞。"],
    ["At a modern Cree Round Dance, Cree people of all ages gather.", "在現代的克里族圓圈舞中，各個年齡層的克里族人齊聚一堂，"],
    ["There, they play the drums and listen to traditional Cree songs sung in the Cree language.", "敲擊鼓聲、聆聽以克里語演唱的傳統克里族歌曲。"],
    ["These gatherings are important ways to keep celebrating Cree culture.", "這些聚會是持續慶祝克里族文化的重要方式。"],
    ["Some musical groups today are bringing Cree traditional drumming to the rest of the world.", "今日，一些音樂團體正在將克里族傳統鼓樂帶向世界各地。"],
    ["One musical group, called Northern Cree, is well known around the world for their drumming and singing.", "其中一個名為「北方克里族」（Northern Cree）的音樂團體，以其鼓藝和歌唱在世界各地享有盛名。"],
    ["The musical group uses Cree traditional drumming to connect with a wider audience.", "這個音樂團體用克里族傳統鼓藝與更廣泛的觀眾建立連結。"],
    ["They have performed at the Grammys and have been nominated for many awards.", "他們曾在葛萊美獎上表演，並獲得多項獎項提名。"],
    ["They also view traditional Cree songs as an important way to keep practicing the Cree language.", "他們也將傳統克里族歌曲視為持續練習克里語的重要方式。"],
    ["In this way, Northern Cree has joined a long heritage of cultural expression through drumming.", "透過這樣的努力，北方克里族加入了透過打鼓進行文化表達的悠久傳承。"]
];

const pairs73 = [
    ["People have been living in Central and South America for many, many years now.", "許多許多年來，人們一直居住在中美洲和南美洲。"],
    ["How did ancient people live in this area thousands of years ago?", "那麼，幾千年前的古代人是如何在這個地區生活的呢？"],
    ["Archaeologists studying the area of the Central American land bridge have been working to answer this question.", "正在研究中美洲陸橋地區的考古學家們，一直致力於回答這個問題。"],
    ["What is the Central American land bridge?", "什麼是中美洲陸橋？"],
    ["It is the land that is now the countries of Costa Rica and Panama.", "它就是現在哥斯大黎加和巴拿馬這兩個國家所在的土地。"],
    ["Like a modern bridge over a river, this land bridge was used by animals and people to travel back and forth.", "就像現代橋梁橫跨河流一樣，這座陸橋被動物和人類用來來回穿越。"],
    ["This Central American land bridge connects the northern land that is now Nicaragua, Mexico, and so on to the southern land that is now Colombia, Brazil, and other South American countries.", "這座中美洲陸橋連接了北方的陸地（現在是尼加拉瓜、墨西哥等地），以及南方的陸地（現在是哥倫比亞、巴西和其他南美洲國家）。"],
    ["People who were already living in North America traveled down and across this land bridge.", "那些已經住在北美洲的人，沿著這座陸橋向南行進。"],
    ["Scientists think they traveled there around 11,000 BC.", "科學家認為他們大約在西元前11,000年遷徙至此。"],
    ["They probably were following large animals that they hunted and ate.", "他們很可能是跟隨著他們獵捕和食用的大型動物而來。"],
    ["These people would have traveled on foot, following the herds of animals.", "這些人很可能步行，跟隨著動物群遷移。"],
    ["They had no permanent houses.", "他們沒有固定的房屋。"],
    ["They would pack up their things and bring them along as they hunted.", "他們會把東西打包帶著，一邊遷徙一邊狩獵。"],
    ["Their homes were like tents and were very easy to take down and put up.", "他們的家就像帳篷一樣，非常容易搭建和拆卸。"],
    ["Archaeologists can tell these people traveled via the land bridge because they have found similar arrowheads and tools in both the land bridge and in areas further north and south.", "考古學家能夠判斷這些人曾途經陸橋，是因為他們在陸橋以及更北邊和南邊的地區，都發現了相似的箭頭和工具。"],
    ["These tools are the main record of people's movement and settlement.", "這些工具是記錄人類遷移和定居的主要證據。"],
    ["Ancient people at this time made their tools, by hand, out of stone.", "這個時代的古代人用手將石頭製成工具。"],
    ["Later, they used obsidian, which is a dark glass formed in volcanoes.", "後來，他們使用黑曜石（obsidian），這是一種在火山中形成的深色玻璃。"],
    ["They made small hand axes, arrowheads and spearheads by knapping.", "他們用敲打（knapping）的方式製作小型手斧、箭頭和矛頭。"],
    ["Knapping is when you hit one stone with another to break off little pieces.", "「敲打」是指用一塊石頭敲打另一塊石頭，使其碎裂成小片。"],
    ["Slowly, you can shape the stone however you want.", "慢慢地，你就可以把石頭塑形成你想要的樣子。"],
    ["When certain stones (like obsidian or flint) break, they leave very sharp edges, which can be used to cut.", "某些石頭（例如黑曜石或燧石）碎裂時，會留下非常鋒利的邊緣，可以用來切割。"],
    ["Archaeologists don't find evidence of these tools very often.", "考古學家並不常找到這些工具的遺跡。"],
    ["When so much time passes, natural things like rain, dirt and trees destroy and bury them.", "當時間流逝得太久，雨水、泥土和樹木等自然力量會破壞並掩埋它們。"],
    ["Scientists also think the oceans were lower back then.", "科學家也認為那個時代的海平面比現在低，"],
    ["This means there once was more land that is now underwater.", "這意味著當時曾經存在更多陸地，如今已沉入水下。"],
    ["Probably there is more evidence of people living in the area under the sea off the coasts of Costa Rica and Panama.", "在哥斯大黎加和巴拿馬沿海的海底，很可能還有更多人類曾在此居住的遺跡。"],
    ["It is hard to tell when people stopped traveling along the land bridge and began living there.", "很難判斷人們是從什麼時候停止沿著陸橋遷徙、開始在此定居的。"],
    ["One clue is when people began farming.", "其中一個線索是人們開始從事農耕的時間。"],
    ["On the land bridge, this was around 9,000 and 7,000 BC.", "在陸橋上，這大約發生在西元前9,000年至7,000年之間。"],
    ["In Panama, scientists have found evidence that people were growing bottle gourds, squash, and a few other things around that time.", "在巴拿馬，科學家發現了人們在那個時期種植葫蘆、南瓜和一些其他作物的遺跡。"],
    ["These would be in small gardens, not big farms.", "這些只是小型菜園，而不是大規模農場。"],
    ["People weren't eating just the plants they grew at this time.", "那個時代的人們並不只依賴自己種植的作物維生。"],
    ["They would gather fruits and nuts from the forest, hunt deer, fish for crabs and fish, and eat from their gardens.", "他們會在森林中採集水果和堅果、獵捕鹿、捕撈螃蟹和魚，並食用菜園裡的蔬果。"],
    ["Archaeologists now think that some forests were actually farms too, which makes it harder to determine when hunting and gathering stopped.", "考古學家現在認為，有些森林其實也是農場，這讓我們更難判斷人們究竟何時停止了狩獵採集的生活方式。"],
    ["Places we once thought were wild were perhaps maintained by ancient people.", "我們曾以為是野地的地方，或許實際上是由古代人維護管理的。"],
    ["This would be like an apple orchard.", "這就像一座蘋果果園。"],
    ["It looks like a forest, but has actually been planted and taken care of by humans—you wouldn't know it was a farm for apples unless you looked more closely.", "它看起來像一片森林，但實際上是由人類種植和照料的——除非你仔細觀察，否則你不會知道它是一座蘋果農場。"],
    ["The same thing probably happened on the Central American land bridge and elsewhere.", "中美洲陸橋和其他地方，也可能發生了同樣的事情。"],
    ["Slowly, people built more permanent houses on the land bridge.", "漸漸地，人們在陸橋上建造了更為永久的房屋。"],
    ["The first small village archaeologists have found is in Costa Rica, in a place called Tronadora Vieja.", "考古學家發現的第一個小型村落位於哥斯大黎加，一個叫做特羅納多拉維耶哈（Tronadora Vieja）的地方。"],
    ["There are round pole and thatch houses, which are simple huts made out of long tree branches covered in leaves and grasses.", "那裡有圓形的竿子和茅草屋，這是一種由長樹枝覆蓋著葉子和草製成的簡單茅屋。"],
    ["These houses date to 3,800 BC and were destroyed when a nearby volcano exploded and buried them in ash.", "這些房屋的建造時間可追溯至西元前3,800年，後來因附近的火山爆發，被火山灰掩埋而損毀。"],
    ["Scientists also found the earliest maize kernels on the land bridge, as well as metates.", "科學家也在陸橋上發現了最早的玉米粒，以及研磨石（metates）。"],
    ["Metates are small stone tables used to grind maize into powder.", "研磨石是用來將玉米磨成粉末的小型石桌。"],
    ["This was used in cooking and baking, like flour.", "這種粉末被用於烹飪和烘焙，就像麵粉一樣。"],
    ["Nearby at Laguna Zoncho, archaeologists found a bigger village, with more houses and farms.", "在附近的拉古納宗喬（Laguna Zoncho），考古學家發現了一個更大的村落，擁有更多房屋和農場。"],
    ["People started living here after Tronadora Vieja, around 3,240 BC.", "人們大約在西元前3,240年，即特羅納多拉維耶哈之後，開始在此居住。"],
    ["People were still hunting and gathering at this time, though.", "不過，那個時代的人們仍然在從事狩獵和採集。"],
    ["Why did some people settle down to farm and some people continue moving around?", "為什麼有些人定居下來務農，而有些人繼續遷移呢？"],
    ["There are lots of ideas, but on the land bridge, archaeologists think it had to do with the amount of rain and water in the area.", "有很多種說法，但在陸橋上，考古學家認為這與該地區的降雨量和水資源有關。"],
    ["Places that had less water made it harder for the forests to remain full of fruits and animals.", "水資源較少的地方，使得森林難以保持豐饒的果實和動物資源。"],
    ["So in these dry areas, people started to farm more, build houses and stay put.", "因此，在這些乾旱地區，人們開始更多地務農、建造房屋並定居下來。"],
    ["So some groups kept hunting and gathering while others were starting to build and farm.", "所以，有些群體繼續從事狩獵採集，而另一些群體則開始建造和耕種。"],
    ["Archaeologists are still studying this part of the world.", "考古學家仍在持續研究世界的這個地區。"],
    ["Hopefully in the years to come, we can find out more about how ancient people lived on the Central American land bridge.", "希望在未來的歲月中，我們能夠發現更多關於古代人如何在中美洲陸橋上生活的資訊。"]
];

processFile('7_2.html', pairs72);
processFile('7_3.html', pairs73);
