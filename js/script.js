class Sentence {
    constructor(word) {
        this.word = word;
        this.statesList = []
    }
}

class State {
    constructor(description, letter, nextState) {
        this.description = description;
        this.letter = letter
        this.nextState = nextState;
    }

    toString() {
        console.log(this.description);
    }
}

const sentences = [];
const alphabet = []; // Colunas

document.getElementById('reloadLink').addEventListener('click', function () {
    location.reload();
});

function addSentence() {
    var input = document.getElementById("sentences");
    var sentence = input.value;
    if (!sentence) {
        return;
    }

    if (sentences.includes(sentence)) {
        return;
    }


    sentence = new Sentence(sentence);
    sentences.push(sentence);

    appendSentenceInList(sentence);
    //writeDictionary();

    createRule(sentence);
    input.value = "";
    recreateAnalyserTable();
    //writestates(null, null, null);
}

function appendSentenceInList(sentence) {
    var sentenceList = document.getElementById('sentenceList');

    var card = document.createElement('div');
    card.classList.add('col', 's2');
    card.innerHTML = `
        <div class="card sentence-card">
            <div class="card-content">
                <div class="row">
                    <span class="card-title center">${sentence.word}</span>
                    
                    <button class="btn-small waves-effect remove-sentence" onclick="removeSentence(this)">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        </div>
    `;

    sentenceList.appendChild(card);
}

function recreateAnalyserTable() {
    var analyser = document.getElementById('analyser');
    analyser.innerHTML = '';

    var table = document.createElement("table");
    table.id = "analyserTable";
    var thead = document.createElement("thead");
    var row = document.createElement("tr");

    for (let i = -1; i < alphabet.length; i++) {
        var cell = document.createElement("th");
        cell.scope = "col";
        if (i < 0) {
            var cellText = document.createTextNode("δ");
        } else {
            var cellText = document.createTextNode(alphabet[i].toUpperCase());
        }
        cell.appendChild(cellText);
        row.appendChild(cell);
    }


    var tbody = document.createElement("tbody");
    sentences.forEach(sentence => {
        sentence.statesList.forEach(state => {
            // Verifica se já existe um th com o mesmo texto e scope "row"
            var existingRow = Array.from(tbody.querySelectorAll('th[scope="row"]')).find(th => th.textContent === state.description);

            var bodyRow = document.createElement("tr");
            if (!existingRow) {
                var cell = document.createElement("th");
                cell.scope = "row";
                var cellText = document.createTextNode(state.description);

                cell.appendChild(cellText);
                bodyRow.append(cell);
            }

            alphabet.forEach(alpha => {
                console.log("Aqui ", state.letter, " ", alpha);
                if (state.letter === alpha) {
                    let description = "";
                    if (state.nextState) {
                        description = state.nextState.description;
                    }

                    var cell = document.createElement("td");
                    var cellText = document.createTextNode(description);
                    cell.appendChild(cellText);
                    bodyRow.append(cell);
                } else {
                    var cell = document.createElement("td");
                    var cellText = document.createTextNode("");
                    cell.appendChild(cellText);
                    bodyRow.append(cell);
                }
            });
            tbody.appendChild(bodyRow);
        });
    });

    thead.appendChild(row);
    table.appendChild(thead);
    table.appendChild(tbody);

    // for (let i = 0; i < sentences.length; i++) {
    //     for (let j = 0; j < sentences.statesList.length; j++) {


    //         for (let a = -1; a < alphabet.length; a++) {
    //             var rule = rules[i];
    //             var cell = document.createElement("td");
    //             if (a < 0) {
    //                 cell = document.createElement("th");
    //                 cell.scope = "row";
    //                 var cellText = document.createTextNode(rule.description);
    //             } else {
    //                 var ruleDesc = ruleDescription(rule, alphabet[a]);
    //                 var cellText = document.createTextNode(ruleDesc);
    //                 if (currentRule != null) {
    //                     var letterNum = letterNumber(currentLetter);
    //                     if (rule.description === currentRule.description && letterNum === a) {
    //                         if (valid) {
    //                             cell.className = "valid-cell";
    //                         } else {
    //                             cell.className = "invalid-cell";
    //                         }
    //                     } else if (rule.description === currentRule.description || letterNum === a) {
    //                         if (valid) {
    //                             cell.className = "light-valid-cell";
    //                         } else {
    //                             cell.className = "light-invalid-cell";
    //                         }
    //                     }
    //                 }
    //             }
    //             cell.appendChild(cellText);
    //             bodyRow.append(cell);
    //         }
    //         tbody.appendChild(bodyRow);
    //     }

    // }
    analyser.appendChild(table);
}


function removeSentence(button) {
    var card = button.closest('.col');
    card.remove();
}


function createRule(sentence) {
    const letters = sentence.word.split('');

    for (let i = letters.length - 1; i >= 0; i--) {

        if (!alphabet.includes(letters[i])) {
            alphabet.push(letters[i]);
        }

        let description = "q" + (i + 1);

        let nextRule = null;
        if (i === (letters.length - 1)) {
            description += "*";
        } else {
            nextRule = new State("q" + (i + 2), letters[i + 1], null);
        }

        let rule = new State(description, letters[i], nextRule);
        sentence.statesList.push(rule);
    }

    sentence.statesList.reverse();
    alphabet.sort();
}

window.addEventListener('scroll', function () {
    var sentenceList = document.getElementById('sentenceList');
    if (window.scrollY > 0) {
        sentenceList.classList.add('sentence-card-sticky');
    } else {
        sentenceList.classList.remove('sentence-card-sticky');
    }
});