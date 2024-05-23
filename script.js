let cachedResults = null;
let cachedPreferences = null;
let pairsCnt = 0;
let menNames = new Set();
let womenNames = new Set();
let menIndToName = {};
let menNameToInd = {};
let womenIndToName = {};
let womenNameToInd = {};
let menPhotos = [...Array(10).keys()];
let womenPhotos = [...Array(10).keys()];
let menNamesArray = ['Adam', 'Brian', 'Calvin', 'Dave', 'Ethan', 'Harry', 'John', 'Kyle', 'Neil', 'Tyler'];
let womenNamesArray = ['Ida', 'Viola', 'Grace', 'Jane', 'Laura', 'Sara', 'Chloe', 'Emily', 'Tracy', 'Nora'];
let nextStepButton = null;
let linesToDelete = new Set();


// Вспомогательные технические функции //

function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function areSetsEqual(set1, set2) {
    if (set1.size !== set2.size) {return false}
    for (const item of set1) {
        if (!set2.has(item)) {return false}
    }
    return true;
}

function isEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// Работа с модальным окном //

function showInfo() {
    document.getElementById("infoModal").style.display = "block";
}

function closeInfoModal() {
    document.getElementById("infoModal").style.display = "none";
}


// Обработка имен //

function mapNames() {
    /**
    * Извлекает из полей ввода имена и индексирует их
    */

    menNames.clear();
    womenNames.clear();

    for (let i = 1; i <= pairsCnt; i++) {
        let manName = document.getElementById(`manName${i}`).value;
        let womanName = document.getElementById(`womanName${i}`).value;

        if (manName !== "") {
            menIndToName[i] = manName;
            menNameToInd[manName] = i;
            menNames.add(manName);
        } else {
            alert('Имена должны быть указаны!');
            return false;
        }

        if (womanName !== "") {
            womenIndToName[i] = womanName;
            womenNameToInd[womanName] = i;
            womenNames.add(womanName);
        } else {
            alert('Имена должны быть указаны!');
            return false;
        }
    }

    if (womenNames.size != pairsCnt || menNames.size != pairsCnt) {
        alert('Имена должны быть уникальными!');
        return false;
    }

    return true;
}


// Обработка предпочтений //

function parsePreferences(input, prefix) {
    /**
    * Извлекает из поля ввода предпочтения, индексирует и проверяет их
    * input - поле ввода
    * prefix - предпочтения у man/woman
    */

    let names_prefs = input.split(' ').map(item => item.trim());
    let cur_prefs_names = new Set();

    for (let name of names_prefs) {
        cur_prefs_names.add(name);
    }

    let setNames = (prefix === "man") ? womenNames : menNames;
    let nameToInd = (prefix === "man") ? womenNameToInd : menNameToInd;

    if (!areSetsEqual(cur_prefs_names, setNames)) {
        return false;
    }

    let prefs = names_prefs.map(item => nameToInd[item]);
    return prefs;
}

function getPreferences(prefix) {
    /**
    * Извлекает предпочтения всех индвидов заданной стороны
    * prefix - сторона man/woman
    */

    const preferences = {};

    for (let i = 1; i <= pairsCnt; i++) {
        const id = `${prefix}${i}`;
        let f = parsePreferences(document.getElementById(id).value, prefix);
        if (f) { preferences[i] = f }
        else {
            let indToName = (prefix === "man") ? menIndToName : womenIndToName;
            alert(`Предпочтения одной стороны должны быть согласованы с именами другой! Ошибка в предпочтениях ${indToName[i]}`);
            return false;
        }
    }
    return preferences;
}

function checkPreferences(menPrefs, womenPrefs) {
    if (menPrefs == {} || womenPrefs == {}) {
        alert('Предпочтения не должны быть пустыми!');
        return false;
    } else { return true }
}

function checkPreferencesChanged() {
    /**
    * Проверяет, изменились ли предпочтения относительно находящихся в кэше
    */

    const menPreferences = getPreferences('man');
    let womenPreferences = {};
    if (menPreferences) {
        womenPreferences = getPreferences('woman');
    }

    if (!(menPreferences && womenPreferences)) {
        return "false preferences";
    }

    if (!cachedPreferences || !isEqual(cachedPreferences.men, menPreferences) || !isEqual(cachedPreferences.women, womenPreferences)) {
        cachedPreferences = { men: menPreferences, women: womenPreferences };
        cachedResults = null;
        return true;
    }
    return false;
}


// Автоматическое задание предпочтений //

function randomizePreferences() {
    /**
    * Устанавливает рандомизированные предпочтения
    */

    clearResults();
    clearConnectionLines();
    mapNames();

    const pairsCount = parseInt(document.getElementById('pairsCount').value);
    if (pairsCount > 0) {

        // для мужчин
        for (let i = 1; i <= pairsCount; i++) {
            const preferences = [];
            for (let j = 1; j <= pairsCount; j++) {
                preferences.push(`${womenIndToName[j]}`);
            }
            shuffleArray(preferences);
            const input = document.getElementById(`man${i}`);
            input.value = preferences.join(' ');
        }

        // для женщин
        for (let i = 1; i <= pairsCount; i++) {
            const preferences = [];
            for (let j = 1; j <= pairsCount; j++) {
                preferences.push(`${menIndToName[j]}`);
            }
            shuffleArray(preferences);
            const input = document.getElementById(`woman${i}`);
            input.value = preferences.join(' ');
        }
    } else {
        alert('Введите число пар больше нуля.');
    }
}

function bookPrefernces(cnt, menPrefs, womenPrefs) {
    /**
    * Устанавливает предпочтения из учбеных примеров
    */

    var pairsCount = document.getElementById('pairsCount');
    pairsCount.value = cnt;

    resetAlgorithm();
    mapNames();

    console.log(pairsCount);

    for (let i = 1; i <= pairsCount.value; i++) {
        console.log(i);
        const mInput = document.getElementById(`man${i}`);
        console.log(menPrefs[i].map((idx) => womenIndToName[idx]).join(' ') );
        mInput.value = menPrefs[i].map((idx) => womenIndToName[idx]).join(' ');
        const wInput = document.getElementById(`woman${i}`);
        wInput.value = womenPrefs[i].map((idx) => menIndToName[idx]).join(' ');
    }
}


// Учебные примеры //

function showBookOptions() {
    /**
    * Отображает селектор учебных примеров
    */

    var optionsContainer = document.getElementById('optionsContainer');
    if (optionsContainer.style.display === 'none') {
      optionsContainer.style.display = 'block';
    } else {
      optionsContainer.style.display = 'none';
    }
}

document.getElementById('options').addEventListener('change', function() {
    /**
    * Предпочтения для учбеных примеров
    */

    var selectedOption = this.value;
    optionsContainer.style.display = 'none';

    switch (selectedOption) {
        case 'best':
            const bestMen = {1: [2, 3, 1, 4], 2: [4, 1, 3, 2], 3: [1, 3, 4, 2], 4:[3, 4, 1, 2]};
            const bestWomen = {1: [1, 2, 3, 4], 2: [2, 4, 3, 1], 3: [3, 2, 1, 4], 4:[2, 3, 4, 1]};
            bookPrefernces(4, bestMen, bestWomen);
            break;
        case 'same':
            const sameMen = {1: [1, 2, 3, 4], 2: [1, 2, 3, 4], 3: [1, 2, 3, 4], 4:[1, 2, 3, 4]};
            const sameWomen = {1: [1, 2, 3, 4], 2: [1, 2, 3, 4], 3: [1, 2, 3, 4], 4:[1, 2, 3, 4]};
            bookPrefernces(4, sameMen, sameWomen);
            break;
        case 'chain':
            const chainMen = {1: [1, 4, 2, 3], 2: [1, 2, 3, 4], 3: [2, 3, 1, 4], 4:[3, 1, 2, 4]};
            const chainWomen = {1: [4, 1, 2, 3], 2: [2, 3, 1, 4], 3: [3, 4, 1, 2], 4:[1, 2, 3, 4]};
            bookPrefernces(4, chainMen, chainWomen);
            break;
        default:
            console.log('Опция не выбрана');
    }
});


// Визуализация //

function createCircleImageElement(src, alt) {
    /**
    * Создает иконки для индвидов
    */
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.id = alt;
    img.width = 100;
    img.height = 100;
    img.classList.add('glowing-icon');
    return img;
}

function getLineYcoord(manIndex, womanIndex) {
    /**
    * Определяет координаты концов connection line для заданной пары
    */

    const menPreferences = document.getElementById("menPreferences");
    const womenPreferences = document.getElementById("womenPreferences");
    const connectionLines = document.getElementById("connectionLines");
    const connectionLinesWidth = connectionLines.clientWidth;

    const manElement = menPreferences.children[4 * manIndex - 1];
    const womanElement = womenPreferences.children[4 * womanIndex - 1];
    const manRect = manElement.getBoundingClientRect();
    const womanRect = womanElement.getBoundingClientRect();

    const startY = manRect.y - menPreferences.getBoundingClientRect().y + manRect.height / 2;
    const endY = womanRect.y - womenPreferences.getBoundingClientRect().y + womanRect.height / 2;
    return {startY, endY, connectionLinesWidth};
}

function showConnectionLine(manIndex, womanIndex, stepIndex) {
    /**
    * Отображает connection line для заданной пары в зависимости от результата алгоритма
    */

    // координаты линии
    const connectionLines = document.getElementById("connectionLines");
    const {startY, endY, connectionLinesWidth} = getLineYcoord(manIndex, womanIndex);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    const line_id = `${manIndex}_${womanIndex}`;
    line.setAttribute("id", line_id);
    line.setAttribute("x1", 0);
    line.setAttribute("y1", startY);
    line.setAttribute("x2", connectionLinesWidth);
    line.setAttribute("y2", endY);
    line.setAttribute("stroke-width", "4");

    connectionLines.appendChild(line);
    let totalLength = line.getTotalLength();
    const isEvenStep = stepIndex % 2 === 0;

    // цвет ободка иконки в зависимости от шага
    line.setAttribute("stroke-dashoffset", isEvenStep ? totalLength : "0");
    const icon = document.getElementById(`M${manIndex}`);
    if (icon) {
        icon.style.boxShadow = isEvenStep ? '0 0 15px 2px rgba(237, 238, 240, 0.8)' : '0 0 15px 2px rgba(249, 47, 96, 0.8)';
    }

    // цвет и тип линии в зависимости от шага
    const strokeColor = isEvenStep ? '#1c2332' : '#f92f60';
    const strokeDashArray = isEvenStep ? `${totalLength} ${totalLength}` : '16 8';
    line.setAttribute("stroke", strokeColor);
    line.setAttribute("stroke-dasharray", strokeDashArray);

    // Добавляем линии, которые нужно будет удалить через шаг
    if (!isEvenStep) {
        linesToDelete.add(line_id);
        deleteConnectionLine(line_id);
    }

    // анимация линии
    line.style.transition = "stroke-dashoffset 1s ease";
    connectionLines.appendChild(line);

    requestAnimationFrame(() => {
        line.setAttribute("stroke-dashoffset", isEvenStep ? "0" : totalLength);
    });

}

function clearConnectionLines() {
    /**
    * Очищает контейнер Connection Lines
    */

    const connectionLines = document.getElementById("connectionLines");
    connectionLines.innerHTML = '';
}

function deleteConnectionLine(line_id) {
    /**
    * Удаляет connection line по индексу
    */

    const lineToRemove = document.getElementById(line_id);
    if (lineToRemove) {
        lineToRemove.remove();
    }
}


// Сброс и инициализация

function resetAlgorithm() {
    /**
    * Очищает и поле и для новых параметров
    */

    // Очистка поля
    const connectionLines = document.getElementById('connectionLines');
    connectionLines.style.display = 'block';
    clearResults();
    clearConnectionLines();
    cachedResults = null;

    pairsCnt = parseInt(document.getElementById('pairsCount').value, 10);

    const menPreferencesContainer = document.getElementById('menPreferences');
    const womenPreferencesContainer = document.getElementById('womenPreferences');
    menPreferencesContainer.innerHTML = '';
    womenPreferencesContainer.innerHTML = '';

    // Создание иконок
    menPhotos.sort(() => Math.random() - 0.5);
    womenPhotos.sort(() => Math.random() - 0.5);

    function createCircles(type, startCnt, endCnt) {
        for (let i = startCnt; i <= endCnt; i++) {

            const labelMan = document.createElement('label');
            labelMan.htmlFor = `man${i}`;
            const labelWoman = document.createElement('label');
            labelWoman.htmlFor = `woman${i}`;
    
            const inputManName = document.createElement('input');
            inputManName.type = 'text';
            inputManName.id = `manName${i}`;
            inputManName.placeholder = `name`;
            
            const inputWomanName = document.createElement('input');
            inputWomanName.type = 'text';
            inputWomanName.id = `womanName${i}`;
            inputWomanName.placeholder = `name`;

            const inputManPreferences = document.createElement('input');
            inputManPreferences.type = 'text';
            inputManPreferences.id = `man${i}`;
            inputManPreferences.placeholder = `preferences`;
            const inputWomanPreferences = document.createElement('input');
            inputWomanPreferences.type = 'text';
            inputWomanPreferences.id = `woman${i}`;
            inputWomanPreferences.placeholder = `preferences`;

            let menCircle;
            let womenCircle;

            // использование фото
            if (type === "photo") {
                inputManName.value = menNamesArray[i - 1];
                inputWomanName.value = womenNamesArray[i - 1];
                menCircle = createCircleImageElement(`images/m${menPhotos[i - 1] + 1}.png`, `M${i}`);
                womenCircle = createCircleImageElement(`images/w${womenPhotos[i - 1] + 1}.png`, `W${i}`);
            } else { // использование обезличенных иконок
                inputManName.value = `m${i}`;
                inputWomanName.value = `w${i}`;
                menCircle = createCircleImageElement('images/boy.png', `M${i}`);
                womenCircle = createCircleImageElement('images/girl.png', `W${i}`);
            }
    
            menPreferencesContainer.appendChild(labelMan);
            menPreferencesContainer.appendChild(inputManName);
            menPreferencesContainer.appendChild(inputManPreferences);
            menPreferencesContainer.appendChild(menCircle);
            womenPreferencesContainer.appendChild(labelWoman);
            womenPreferencesContainer.appendChild(inputWomanName);
            womenPreferencesContainer.appendChild(inputWomanPreferences);
            womenPreferencesContainer.appendChild(womenCircle);
        }
    }
    createCircles("photo", 1, pairsCnt < 10 ? pairsCnt : 10);
    createCircles("icon", 11, pairsCnt);
}


// Алгоритм Гэйла-Шепли //

function isEngaged(woman, stablePairs) {
    /**
    * Проверяет, свободна ли женщина на текущий момент
    */

    return Object.values(stablePairs).includes(woman);
}

function galeShapleyWithSteps(menPrefs, womenPrefs) {
    /**
    * Запускает алгоритм Гэйла-Шепли
    */

    const menCount = Object.keys(menPrefs).length;
    let engagedMen = new Set();
    let stablePairs = {};
    let proposals = {};
    let algorithmSteps = [];
    let algorithmLines = [];
    let engagedMenAtSteps = [];

    // Шаги симуляции: 1 - мужчины делают предложения, 2 - женщины выбирают
    let currentSimulationStep = 1;
    
    while (engagedMen.size < menCount) {
        let cur_actions = [];
        let cur_lines = [];
        if (currentSimulationStep === 1) {

            // Мужчины делают предложения
            for (let man_str of Object.keys(menPrefs)) {
                const man = parseInt(man_str, 10); 
                
                if (!engagedMen.has(man)) {

                    // предложение наилучшему предпочтению из тех, которые еще не отказали
                    const woman = menPrefs[man].shift();
                    const actionDescription = `${menIndToName[man]} &#128141; ${womenIndToName[woman]}`;
                    cur_actions.push(actionDescription);
                    cur_lines.push([man, woman]);

                    // добавление в предложения женщине на текущем шаге
                    if (!proposals[woman]) {
                        proposals[woman] = [man];
                    } else {
                        proposals[woman].push(man);
                    }
                }
            }

        } else if (currentSimulationStep === 2) {

            // Женщины выбирают лучшие предложения
            for (let woman_str of Object.keys(womenPrefs)) {
                const woman = parseInt(woman_str, 10); 

                // сортировка текущих предложений по предпочтениям
                if (proposals[woman] && proposals[woman].length > 0) {
                    proposals[woman].sort((a, b) => womenPrefs[woman].indexOf(a) - womenPrefs[woman].indexOf(b));
                    const man = proposals[woman][0];
                    stablePairs[man] = woman;
                    engagedMen.add(man);

                    // выводим выбор женщин, для которых на текущем шаге было > 1 предложения
                    if (proposals[woman].length > 1) {
                        const actionDescription = " <b>></b> " + `${proposals[woman].slice(1).map((m) => 
                            `${menIndToName[m]}(&#10060)`).join(' <b>></b> ')}`;
                        cur_actions.push(`${womenIndToName[woman]}: ${menIndToName[man]}` + actionDescription);  
                    }

                    // удаляем из женатых отвергнутых мужчин на текущем шаге
                    for (let rejectedMan of proposals[woman].slice(1)) {
                        cur_lines.push([rejectedMan, woman]);
                        stablePairs[rejectedMan] = null;
                        engagedMen.delete(rejectedMan);
                    }

                    proposals[woman] = [man];
                }
            }
        }

        algorithmSteps.push(cur_actions);
        algorithmLines.push(cur_lines);
        engagedMenAtSteps.push(engagedMen);
        cur_actions = [];
        cur_lines = [];
        currentSimulationStep = currentSimulationStep === 1 ? 2 : 1; // Переключение сторон
    }
    return { pairs: stablePairs, steps: algorithmSteps, lines: algorithmLines, engagedMenAtSteps: engagedMenAtSteps};
}


// Запуск алгоритма //

function runAlgorithm() {
    /**
    * Запускает симуляцию
    */

    clearResults();
    clearConnectionLines();

    if (!mapNames()) {
        menNames.clear();
        womenNames.clear();
        return;
    }

    // Проверка, изменились ли предпочтения по сравнению с кэшированными
    let cpc = checkPreferencesChanged();
    if (cpc === "false preferences") {
        return;
    } else if (cpc || !cachedResults) {
        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
            cachedResults = galeShapleyWithSteps(cachedPreferences.men, cachedPreferences.women);
        } else {
            return;
        }
    }

    const { pairs, steps, lines, engagedMenAtSteps } = cachedResults;

    displayPairs(pairs);

    for (const m in pairs) {
        showConnectionLine(m, pairs[m], 0);
    }
}

function runAlgorithmWithSteps() {
    /**
    * Запускает симуляцию по шагам
    */

    clearResults();
    clearConnectionLines();
    if (!mapNames()) {
        return;
    }

    // Проверка, изменились ли предпочтения по сравнению с кэшированными
    let cpc = checkPreferencesChanged();
    if (cpc == "false preferences") {
        return;
    } else if (cpc || !cachedResults) {

        if (checkPreferences(cachedPreferences.men, cachedPreferences.women)) {
            cachedResults = galeShapleyWithSteps(cachedPreferences.men, cachedPreferences.women);
        } else {
            return;
        }
    }

    const { pairs, steps, lines, engagedMenAtSteps } = cachedResults;

    let currentStepIndex = 0;

    // Отображение следующего шага
    function displayNextStep() {

        if (currentStepIndex < steps.length - 1) {

            const step = steps[currentStepIndex];
            const line = lines[currentStepIndex];
            const resultElement = document.createElement('p');
            
            // Описание шага - мужчины делают предложения
            if (currentStepIndex % 2 === 0) {
                resultElement.innerHTML = `<u><b>Step ${currentStepIndex + 1}:</b></u> ${step.join('; ')}`;
                linesToDelete.forEach(deleteConnectionLine);
                linesToDelete.clear();
            } else { // Описание шага - женщины отказываются от непредпочтительных
                resultElement.innerHTML = `<u><b>Step ${currentStepIndex + 1}:</b></u> ${step.map((s) => `<br>&emsp;${s}`).join('')}`;
                engagedMenAtSteps[currentStepIndex].forEach(man => {
                    const icon = document.getElementById(`M${man}`);
                    icon.style.boxShadow = '0 0 15px 2px rgba(151, 240, 151, 0.8)';
                });
            }
            document.getElementById('results').appendChild(resultElement);

            line.forEach(pair => {
                const [manIndex, womanIndex] = pair;
                showConnectionLine(manIndex, womanIndex, currentStepIndex);
            });

            currentStepIndex++;
        } else {
            const icons = document.querySelectorAll('.glowing-icon');
                icons.forEach(icon => {
                icon.style.boxShadow = '0 0 15px 2px rgba(151, 240, 151, 0.8)';
            });
            alert('Больше шагов нет!');
        }
    }

    // Добавление кнопки следующего шага
    nextStepButton = document.createElement('button');
    nextStepButton.id = 'nextStepButton';
    nextStepButton.textContent = 'Next step';
    nextStepButton.onclick = displayNextStep;
    document.getElementById('buttonsContainer').appendChild(nextStepButton);    
}


// Отображение результатов //

function displayPairs(pairs) {
    /**
    * Отображает таблицу результатов
    */

    const resultsContainer = document.getElementById('results');
    const menCnt = Object.keys(pairs).length;
    if (menCnt === 0) {
        resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
    } else {
        const table = document.createElement('table');
        table.classList.add('table');
        const headerRow = document.createElement('tr');
        const header1 = document.createElement('th');
        const header2 = document.createElement('th');
        header1.textContent = 'Man';
        header2.textContent = 'Woman';
        headerRow.appendChild(header1);
        headerRow.appendChild(header2);
        table.appendChild(headerRow);
        for (let i = 1; i <= menCnt; i++) {
            const man = menIndToName[i];
            const woman = womenIndToName[pairs[i]];
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            cell1.textContent = `\u{1F935} ${man}`;
            cell2.textContent = `\u{1F470} ${woman}`;
            row.appendChild(cell1);
            row.appendChild(cell2);
            table.appendChild(row);
        }
        resultsContainer.appendChild(table);
    }
}

function clearResults() {
    /**
    * Очищает таблицу результатов
    */

    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (nextStepButton) {
        nextStepButton.remove();
        nextStepButton = null;
    }
    const icons = document.querySelectorAll('.glowing-icon');
        icons.forEach(icon => {
        icon.style.boxShadow = '0 0 15px 2px rgba(237, 238, 240, 0.8)';
    });
}
