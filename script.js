//////////////////////////////
// Вспомогательные функции
function isEngaged(woman, stablePairs) {
    return Object.values(stablePairs).includes(woman);
}

function parsePreferences(input) {
    return input.split(' ').map(item => parseInt(item.trim()));
}
//////////////////////////////

function galeShapleyWithSteps(menPrefs, womenPrefs) {

    const menCount = Object.keys(menPrefs).length;
    // console.log(menCount);
    let engagedMen = new Set();
    let stablePairs = {};
    let proposals = {};
    let algorithmSteps = [];

    let currentSimulationStep = 1; // Шаг симуляции: 1 - мужчины делают предложения, 2 - женщины выбирают

    while (engagedMen.size < menCount) {
        console.log(`------new iter ${currentSimulationStep}`)
        let cur_actions = []
        if (currentSimulationStep === 1) {

            // Мужчины делают предложения
            for (const man in menPrefs) {

                if (!engagedMen.has(man)) {

                    const woman = menPrefs[man].shift();
                    const actionDescription = `${man} proposes to ${woman}`;
                    console.log(actionDescription)
                    cur_actions.push(actionDescription);

                    if (!proposals[woman]) {
                        proposals[woman] = [man];
                    } else {
                        proposals[woman].push(man);
                    }
                }
            }

        } else if (currentSimulationStep === 2) {

            // Женщины выбирают лучшие предложения
            for (const woman in womenPrefs) {
                // console.log(`woman ${woman}`)

                if (proposals[woman] && proposals[woman].length > 0) {
                    proposals[woman].sort((a, b) => womenPrefs[woman].indexOf(a) - womenPrefs[woman].indexOf(b));
                    const man = proposals[woman][0];
                    stablePairs[man] = woman;
                    engagedMen.add(man);

                    for (let rejectedMan of proposals[woman].slice(1)) {
                        const actionDescription = `${rejectedMan} is rejected by ${woman}`;
                        console.log(actionDescription);
                        cur_actions.push(actionDescription);
                        stablePairs[rejectedMan] = null;
                        engagedMen.delete(rejectedMan);
                    }

                    proposals[woman] = [man];
                }
            }
        }

        algorithmSteps.push(cur_actions);
        cur_actions = [];
        currentSimulationStep = currentSimulationStep === 1 ? 2 : 1; // Переключение сторон
    }

    return { pairs: stablePairs, steps: algorithmSteps };
}


function displayResults(results) {
    const resultsContainer = document.getElementById('results');

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No stable pairs found.</p>';
    } else {
        resultsContainer.innerHTML = '<h2>Algorithm Steps:</h2>';
        results.forEach((x) => {
            const resultElement = document.createElement('p');
            resultElement.innerHTML = `<strong>Step a:</strong> ${x}`;
            resultsContainer.appendChild(resultElement);
        });
    }
}

function clearResults() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
}

function runAlgorithm() {
    clearResults();

    const menPreferences = {
        1: parsePreferences(document.getElementById('man1').value),
        2: parsePreferences(document.getElementById('man2').value),
        3: parsePreferences(document.getElementById('man3').value)
    };

    const womenPreferences = {
        1: parsePreferences(document.getElementById('woman1').value),
        2: parsePreferences(document.getElementById('woman2').value),
        3: parsePreferences(document.getElementById('woman3').value),
    };

    const {pairs, steps} = galeShapleyWithSteps(menPreferences, womenPreferences);

    console.log(pairs);
    displayResults(steps);
}

let currentStepIndex = 0; // Переменная для отслеживания текущего шага алгоритма

function nextAlgorithmStep() {
    const resultsContainer = document.getElementById('results');
    if (currentStepIndex < results.length) {
        const step = results[currentStepIndex];
        const resultElement = document.createElement('p');
        resultElement.innerHTML = `<strong>Step ${currentStepIndex + 1}:</strong> ${step.description}`;
        resultsContainer.appendChild(resultElement);
        currentStepIndex++;
    } else {
        alert('No more steps!');
    }
}

