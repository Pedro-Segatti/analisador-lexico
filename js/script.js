class Sentence {
    constructor(word) {
        this.word = word;
        this.statesList = []
    }

    getBlockquoteId() {
        return this.word + "-validation-text";
    }
}

class State {
    constructor(description, letter, nextState, lastState) {
        this.description = description;
        this.letter = letter
        this.nextState = nextState;
        this.lastState = lastState;
    }

    toString() {
        console.log(this.description);
    }

    getTableDataId() {
        return this.description + "-" + this.letter;
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

    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].word === sentence) {
            input.value = "";
            return;
        }
    }

    sentence = new Sentence(sentence);
    sentences.push(sentence);

    createRule(sentence);
    recreateAnalyserTable();
    appendSentenceInList(sentence);
    input.value = "";
    input.focus();

    var input = document.getElementById("word-analyse");
    input.value = "";
}

function appendSentenceInList(sentence) {
    var sentenceList = document.getElementById('sentence-list');

    var card = document.createElement('div');
    var cardId = "card-" + sentences.length;
    card.classList.add('col', 's2');

    card.innerHTML = `
        <div id="${cardId}" class="card sentence-card">
            <div class="card-content">
                <div class="row">
                    <span class="card-title center">${sentence.word}</span>
                    
                    <button class="btn-small waves-effect remove-sentence" onclick="removeSentence(this, ${sentences.length})">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        </div>
    `;
    sentenceList.appendChild(card);

    if (sentences.length == 1) {
        var inputWord = document.getElementById('input-word-div');
        var inputDiv = document.createElement('div');

        inputDiv.classList.add("input-field")

        inputDiv.innerHTML = `
        <input id="word-analyse" type="text" class="validate" autocomplete="off" oninput="lexicalAnalyser()">
        <label for="word-analyse">Palavra</label>
        `;

        inputWord.appendChild(inputDiv);
    }
}

function recreateAnalyserTable() {
    var validationText = document.getElementById('validation-text');
    validationText.textContent = "";

    var analyser = document.getElementById('analyser');
    analyser.innerHTML = '';

    if (sentences.length == 0) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return;
    }

    var table = document.createElement("table");
    table.id = "analyserTable";
    var thead = document.createElement("thead");
    var row = document.createElement("tr");

    for (let i = -1; i < alphabet.length; i++) {
        var cell = document.createElement("th");
        cell.scope = "col";
        var cellText = document.createTextNode(i < 0 ? "δ" : alphabet[i]);
        cell.appendChild(cellText);
        row.appendChild(cell);
    }

    var tbody = document.createElement("tbody");
    var stateRows = {}; // Objeto para armazenar as linhas dos estados
    var rowStyle = "#ffff";
    let even = true;

    sentences.forEach(sentence => {
        sentence.statesList.forEach(state => {
            var bodyRow;
            if (state.description in stateRows) {
                bodyRow = stateRows[state.description];
            } else {
                bodyRow = document.createElement("tr");
                var thCell = document.createElement("th");
                thCell.scope = "row";
                var thText = document.createTextNode(state.description);
                thCell.appendChild(thText);
                bodyRow.appendChild(thCell);
                bodyRow.style = `background-color: ${rowStyle}`;
                tbody.appendChild(bodyRow);
                stateRows[state.description] = bodyRow;
            }

            alphabet.forEach((alpha, index) => {
                var cell = bodyRow.cells[index + 1] || document.createElement("td");
                var cellId = `${state.description}-${alphabet[index]}`;
                cell.id = cellId;

                if (state.letter === alpha) {
                    var description = state.nextState ? state.nextState.description : "";
                    var cellText = document.createTextNode(description);
                    cell.innerHTML = "";
                    cell.appendChild(cellText);
                } else if (!bodyRow.cells[index + 1]) {
                    var cellText = document.createTextNode("");
                    cell.appendChild(cellText);
                }

                if (!bodyRow.cells[index + 1]) {
                    bodyRow.appendChild(cell);
                }
            });
        });

        var bodyRowValidationText = document.createElement("tr");
        bodyRowValidationText.id = sentence.word + "-row";
        bodyRowValidationText.style = `background-color: ${rowStyle}`;
        var validationCell = document.createElement("td");
        validationCell.colSpan = alphabet.length + 1;
        var blockquote = document.createElement("blockquote");
        blockquote.id = sentence.word + "-validation-text";
        validationCell.appendChild(blockquote);
        bodyRowValidationText.appendChild(validationCell);
        tbody.appendChild(bodyRowValidationText);

        if (even) {
            rowStyle = "#EEEEEE";
            even = false;
        } else {
            rowStyle = "#ffff";
            even = true;
        }
    });

    thead.appendChild(row);
    table.appendChild(thead);
    table.appendChild(tbody);
    analyser.appendChild(table);
}

function removeSentence(button, sentencePosition) {
    var card = button.closest('.col');
    card.remove();
    sentences.pop(sentencePosition);

    if (sentences.length == 0) {
        var inputWord = document.getElementById('input-word-div');
        inputWord.innerHTML = "";
    }
    recreateAnalyserTable();
    var input = document.getElementById("word-analyse");
    if (input) {
        input.value = "";
    }
}


function createRule(sentence) {
    const letters = sentence.word.split('');

    if (sentences.length > 1) {
        lastIndex = findMaxDescription() + letters.length + 1;
    } else {
        lastIndex = letters.length;
    }


    let lastRule = new State("q" + lastIndex + "*", null, null, null);
    sentence.statesList.push(lastRule);

    for (let i = letters.length - 1; i >= 0; i--) {
        lastIndex -= 1;

        if (!alphabet.includes(letters[i])) {
            alphabet.push(letters[i]);
        }

        let description = "q" + (lastIndex);

        lastRule = new State(description, letters[i], lastRule, null);
        sentence.statesList.push(lastRule);
    }
    console.log(sentences);
    sentence.statesList.reverse();
    alphabet.sort();

    for (let i = 1; i < sentence.statesList.length; i++) {
        sentence.statesList[i].lastState = sentence.statesList[i - 1];
    }

}

function lexicalAnalyser() {
    removeStylesFromTableCells();

    if (sentences.length == 0) {
        clearValidationText();
        return;
    }

    var input = document.getElementById("word-analyse");

    if (!input.value) {
        clearValidationText();
        return;
    }

    letters = input.value.split("");
    availableSentences = new Set();

    sentences.forEach(sentence => {
        sentenceControl = [];
        for (let i = 0; i < letters.length; i++) {
            var validSentence = false;
            if (sentence.statesList.length - 1 >= i) {
                var state = sentence.statesList[i];
                validSentence = letters[i] == state.letter;
                sentenceControl.push(validSentence);
            }
        }

        if (sentenceControl.every(element => element === true) && letters.length <= sentence.statesList.length - 1) {
            availableSentences.add(sentence);
        } else {
            availableSentences.delete(sentence);
        }
    });

    availableSentences = [...availableSentences];

    console.log(availableSentences);

    if (availableSentences.length !== 0) {
        availableSentences.forEach(availableSentence => {
            var state = getStateByLetterAndPosition(availableSentence, letters[letters.length - 1], letters.length - 1);
            var tableData = document.getElementById(state.getTableDataId());
            tableData.style = "background-color: #57A6A1";

            if (state.lastState) {
                var lastTableData = document.getElementById(state.lastState.getTableDataId());
                if (lastTableData) {
                    lastTableData.removeAttribute('style');
                }
            }

            if (state.nextState) {
                var nextTableData = document.getElementById(state.nextState.getTableDataId());
                if (nextTableData) {
                    nextTableData.removeAttribute('style');
                }
            }
            addValidatedText(availableSentence.getBlockquoteId());
        });
    } else {
        sentences.forEach(sentence => {
            addInvalidatedText(sentence.getBlockquoteId());
        });
    }

    sentences.forEach(sentence => {
        if (!availableSentences.includes(sentence)) {
            addInvalidatedText(sentence.getBlockquoteId());
            if (sentence.statesList && letters.length > 0 && sentence.statesList.length >= letters.length) {
                var tableData = document.getElementById(sentence.statesList[letters.length - 1].description + "-" + letters[letters.length - 1]);
                if (tableData) {
                    tableData.style = "background-color: #F05941";
                }
            }
        }
    });
}

function removeStylesFromTableCells() {
    var table = document.getElementById("analyserTable");

    if (table) {
        var tds = table.getElementsByTagName('td');

        for (var i = 0; i < tds.length; i++) {
            tds[i].removeAttribute('style');
        }
    }
}

function getStateByLetterAndPosition(sentence, letter, position) {
    for (let index = 0; index < sentence.statesList.length; index++) {
        const state = sentence.statesList[index];
        if (state.letter == letter && index === position) {
            return state;
        }
    }

    return null;
}

function findMaxDescription() {
    let maxNum = -1;

    const pattern = /q(\d+)\*?/;

    sentences.forEach(sentence => {
        sentence.statesList.forEach(state => {
            const match = state.description.match(pattern);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) {
                    maxNum = num;
                }
            }
        });
    });

    return maxNum !== -1 ? maxNum : null;
}

function addValidatedText(id) {
    var validationText = document.getElementById(id);
    validationText.textContent = "Válido";
    validationText.style = "border-left: 5px solid #57A6A1";
}

function addInvalidatedText(id) {
    var validationText = document.getElementById(id);
    validationText.textContent = "Inválido";
    validationText.style = "border-left: 5px solid #F05941";
}

function clearValidationText() {
    sentences.forEach(sentence => {
        var validationText = document.getElementById(sentence.getBlockquoteId());
        validationText.textContent = "";
    });
}


window.addEventListener('scroll', function () {
    var sentenceList = document.getElementById('sentence-list');
    var inputWord = document.getElementById('input-word-div');

    if (window.scrollY > 0) {
        sentenceList.classList.add('sentence-card-sticky');
        inputWord.classList.add('word-input-sticky');
    } else {
        sentenceList.classList.remove('sentence-card-sticky');
        inputWord.classList.remove('word-input-sticky');
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault();
        document.getElementById('add-word-button').click();
    }
});