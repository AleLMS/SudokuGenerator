var _board;
const SudokuBoardSize = 81;

// Document ready, main
window.addEventListener('load', async function () {
    // Init HTML
    init();
    this.document.getElementById('status').innerHTML = 'Solving';
    this.document.getElementById('status').style.color = 'red';

    // Main
    let done = false;
    mainLoop: while (!done) {
        // Start
        _board = new Board(SudokuBoardSize);
        _board.setDivs();

        // empty = generate random, data = solve
        // data format = jagged array of [[X, Y, NUMBER]];
        _board.sizeAfterInit = _board.sizeBeforeInit;
        _board.setInitialSlots(/*[[0, 3, 8], [0, 5, 1], [1, 6, 4], [1, 7, 3], [2, 0, 5],
        [3, 4, 7], [3, 6, 8], [4, 6, 1], [5, 1, 2], [5, 4, 3],
        [6, 0, 6], [6, 7, 7], [6, 8, 5], [7, 2, 3], [7, 3, 4],
        [8, 3, 2], [8, 6, 6]]*/ [[1, 1, 5]]);

        // WFC loop
        for (let i = 0; i < _board.sizeAfterInit; i++) {
            // Recalculate entropies
            _board.updateEntropies();
            // Get next cell ID
            let nextID = _board.getLowestEntropySlot();
            // Set value of next cell
            _board.applyNumber(nextID[0], nextID[1]);

            // Restart the whole board on an invalid cell value
            if (!_board.slots[nextID[0]][nextID[1]].value) {
                console.log("error, starting new iteration.");
                continue mainLoop;
            }

            // Throttle speed
            let timeBetweensteps = this.document.getElementById('sSpeed').value;
            console.log(timeBetweensteps);
            if (timeBetweensteps > 0)
                await sleep(timeBetweensteps);
        }
        done = true;
    }

    if (done) {
        this.document.getElementById('status').style.color = 'green';
        this.document.getElementById('status').innerHTML = 'Solved';
    }
}, false);

// FUNCTIONS
function init() {
    const MainContainer = document.getElementById('masterContainer');
    const BigCell = document.getElementById('bigCellTemplate');

    for (let i = 0; i < 81; i++) {
        let template = BigCell.innerHTML;
        template = template.replaceAll("{{ID}}", i + 1);
        MainContainer.innerHTML += template;
    }

}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function removeValueFromArray(array, value) {
    const index = array.indexOf(value);
    if (index > -1) array.splice(index, 1);
    return array;
}

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

// CLASSES

class Board {
    constructor(SudokuBoardSize = 81) {
        // bad
        this.slots = [
            [new Slot(1), new Slot(1), new Slot(1), new Slot(2), new Slot(2), new Slot(2), new Slot(3), new Slot(3), new Slot(3)],
            [new Slot(1), new Slot(1), new Slot(1), new Slot(2), new Slot(2), new Slot(2), new Slot(3), new Slot(3), new Slot(3)],
            [new Slot(1), new Slot(1), new Slot(1), new Slot(2), new Slot(2), new Slot(2), new Slot(3), new Slot(3), new Slot(3)],
            [new Slot(4), new Slot(4), new Slot(4), new Slot(5), new Slot(5), new Slot(5), new Slot(6), new Slot(6), new Slot(6)],
            [new Slot(4), new Slot(4), new Slot(4), new Slot(5), new Slot(5), new Slot(5), new Slot(6), new Slot(6), new Slot(6)],
            [new Slot(4), new Slot(4), new Slot(4), new Slot(5), new Slot(5), new Slot(5), new Slot(6), new Slot(6), new Slot(6)],
            [new Slot(7), new Slot(7), new Slot(7), new Slot(8), new Slot(8), new Slot(8), new Slot(9), new Slot(9), new Slot(9)],
            [new Slot(7), new Slot(7), new Slot(7), new Slot(8), new Slot(8), new Slot(8), new Slot(9), new Slot(9), new Slot(9)],
            [new Slot(7), new Slot(7), new Slot(7), new Slot(8), new Slot(8), new Slot(8), new Slot(9), new Slot(9), new Slot(9)],
        ];
        this.sizeBeforeInit = SudokuBoardSize;
        this.sizeAfterInit;
    }

    setDivs() {
        // assign divs to board slots
        for (let x = 0; x < 9; x++) {
            for (let y = 0; y < 9; y++) {
                let asd = 'cell' + ((x * 9) + y + 1).toString();
                let cell = document.getElementById(asd);
                this.slots[x][y].assignDiv(cell);
            }
        }
    }

    setInitialSlots(initArray) {
        if (!initArray) {
            // Set initial random slot
            let initX = getRandomInt(9);
            let initY = getRandomInt(9);
            _board.applyNumber(initX, initY);
            this.updateEntropies();
            this.sizeAfterInit--;
        } else {
            for (let i = 0; i < initArray.length; i++) {
                let a = initArray[i];
                console.log(a[0]);
                _board.applyNumber(a[0], a[1], a[2])
                this.sizeAfterInit--;
            }
            this.updateEntropies();
        }

    }

    updateEntropies() {
        for (const element of this.slots) {
            for (const ele of element) {
                if (!ele.value) ele.updateEntropy();
            }
        }
    }

    getLowestEntropySlot() {
        // Get lowest entropy
        let lowestEntropy = Infinity;
        let nextX, nextY;
        let possibleCells = [];

        // 2D arrays in JS are ass?
        for (const element of this.slots) {
            for (const ele of element) {
                if (ele.value) continue; // skip if cell is already spent
                if (ele.entropyScore > lowestEntropy) continue;

                if (ele.entropyScore != lowestEntropy) possibleCells = [];

                lowestEntropy = ele.entropyScore;
                nextX = this.slots.indexOf(element);
                nextY = element.indexOf(ele);
                possibleCells.push([nextX, nextY]);
            }
        }

        let next = possibleCells[getRandomInt(possibleCells.length)];
        return next;
    }

    applyNumber(X, Y, value) {
        let slot = this.slots[X][Y];
        let num;
        if (value) {
            num = slot.setValue(value);
        } else {
            num = slot.setValue();
        }

        slot.displayValue();

        for (let i = 0; i < 9; i++) {
            let currX = this.slots[i][Y];
            let currY = this.slots[X][i];
            currX.possibleNumbers = removeValueFromArray(currX.possibleNumbers, num);
            currY.possibleNumbers = removeValueFromArray(currY.possibleNumbers, num);
        }

        for (const element of this.slots) {
            for (const ele of element) {
                if (ele.groupID != slot.groupID) continue;
                ele.possibleNumbers = removeValueFromArray(ele.possibleNumbers, num);
            }
        }

    }
}

class Slot {
    constructor(groupID) {
        this.groupID = groupID;
        this.value = null;
        this.possibleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.entropyScore = this.possibleNumbers.length;
    }

    updateEntropy() {
        this.entropyScore = this.possibleNumbers.length;
    }

    setValue(value) {
        if (!value) {
            let index = getRandomInt(this.possibleNumbers.length);
            this.value = this.possibleNumbers[index];
        } else {
            this.value = value;
        }
        this.possibleNumbers = [];
        return this.value;
    }

    assignDiv(input) {
        this.div = input;
    }

    displayValue() {
        if (this.value) {
            let p = "<p class='num'>" + this.value.toString(); "</p>"
            this.div.innerHTML = p
        } else {
            this.div.innerHTML = "<p class='num'>" + "!!" + "</p>"
        }

    }
}
