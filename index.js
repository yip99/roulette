const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

let rouletteChoices = document.querySelector('.roulette #roulette-choices');
const listChoices = document.querySelector('.list-choices');

let button = document.querySelector('#spin');

// let arrowAngle = 90;
// document.querySelector('#arrow-container').style.transform = `rotate(${90}deg)`;

let isSpinning = false;
let rotation = 0;
let animationFrameId;

// let maxSpeed = 20; // degree per frame
let maxSpeed = 360 * 5; // degree per second
let accelerateTime = 3_000;
let decelerateTime = 15_000;
let then = Date.now();
let elapsed;
// let fpsLimit = 1000 / 60;
let fps = 0;
let startTime;
let stopTime;
let startSpeed;
let stopSpeed;
let speed = 0;

let options = [];
const choices = new Map();


let radius = rouletteChoices.getBoundingClientRect().width / 2;
let angle;

function startSpin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    if (Date.now() - startTime < accelerateTime * (1 - startSpeed / maxSpeed)) {
        // 1
        // if (Date.now() - startTime < accelerateTime && Date.now() - startTime < accelerateTime * (Date.now() - startTime / accelerateTime)) { // 2
        // if (Date.now() - startTime < accelerateTime) { // 0
        // speed = maxSpeed * bezierBlend((Date.now() - startTime) / accelerateTime); // 0
        speed =
            maxSpeed *
            easeInOutSine(
                (Date.now() - startTime) /
                (accelerateTime * (1 - startSpeed / maxSpeed)),
            ) +
            startSpeed *
            (1 -
                (Date.now() - startTime) /
                (accelerateTime * (1 - startSpeed / maxSpeed))); // 1
        // speed = maxSpeed * bezierBlend((Date.now() - startTime) / (accelerateTime * (1 - (Date.now() - startTime / accelerateTime)))); // 2
        rotation += (speed / fps);
        rouletteChoices.style.transform = `rotate(${rotation}deg)`;
        animationFrameId = requestAnimationFrame(startSpin);
    } else {
        console.timeLog("max", speed);
        spin();
    }
}

function spin() {
    // console.log('spin');
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    rotation += speed / fps;
    rouletteChoices.style.transform = `rotate(${rotation}deg)`;
    animationFrameId = requestAnimationFrame(spin);
}

function stopSpin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    if (Date.now() - stopTime < decelerateTime * (stopSpeed / maxSpeed)) {
        // 1
        // if (Date.now() - stopTime < decelerateTime) {
        // speed = stopSpeed * bezierBlend(1 - ((Date.now() - stopTime) / decelerateTime));
        speed =
            stopSpeed *
            (1 -
                easeInOutSine(
                    (Date.now() - stopTime) / (decelerateTime * (stopSpeed / maxSpeed)),
                )); // 1
        rotation += speed / fps;
        rouletteChoices.style.transform = `rotate(${rotation}deg)`;
        animationFrameId = requestAnimationFrame(stopSpin);
    } else {
        cancelAnimationFrame(animationFrameId);
        console.timeLog("stopped");
        let result = getResult();
        console.log(result);
        // console.log(choice.element.textContent);
    }
}

button.addEventListener("click", () => {
    if (choices.size === 0) {
        return;
    }
    button?.classList.toggle('spinning');
    if (!isSpinning) {
        console.timeEnd("stopped");
        isSpinning = true;
        cancelAnimationFrame(animationFrameId);
        console.time("max");
        // console.timeLog('max');
        console.log("start");
        console.log("accelerate", speed, performance.now());
        startTime = Date.now();
        startSpeed = speed;
        startSpin();
    } else {
        console.timeEnd("max");
        isSpinning = false;
        cancelAnimationFrame(animationFrameId);
        console.log("decelerate", speed, performance.now());
        stopTime = Date.now();
        stopSpeed = speed;
        console.time("stopped");
        stopSpin();
    }
});

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}


let colors = [
    '#F38181',
    '#FCE38A',
    '#EAFFD0',
    '#95E1D3',
    '#FFCFDF',
    '#FEFDCA',
    '#E0F9B5',
    '#A5DEE5',
    '#fbe3f7',
    '#c8fcea',
    '#6a9a8b',
    '#7fd1ae',
];

function randomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function x(cx, radius, degree) {
    return cx + (radius * Math.sin(degree * (Math.PI / 180)));
    // return cx + (radius * Math.cos(degree * (Math.PI / 180)));
}

function y(cy, radius, degree) {
    return cy - (radius * Math.cos(degree * (Math.PI / 180)));
    // return cy - (radius * Math.sin(degree * (Math.PI / 180)));
}

let number = document.querySelector('input[type="number"]');
let choiceText = document.querySelector('input[name="choice-text"]');

document.querySelector('#increment').addEventListener('click', () => {
    number.value = (+number.value) + 1;
});

document.querySelector('#decrement').addEventListener('click', () => {
    if (+number.value > 1) {
        number.value = (+number.value) - 1;
    }
});

document.querySelector('#add').addEventListener('click', () => {
    addOption();
});

choiceText?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addOption();
    }
});

function addOption() {
    if (choices.has(choiceText.value)) {
        choices.get(choiceText.value).number += (+number.value);
    } else {
        const choice = {
            number: +number.value,
            color: colors[Math.floor(Math.random() * colors.length)]
        }
        const firstChoice = choices.values().next().value;
        const lastChoice = [...choices.values()].at(-1);
        while ([firstChoice?.color, lastChoice?.color].includes(choice.color)) {
            choice.color = colors[Math.floor(Math.random() * colors.length)];
        }
        choices.set(choiceText.value, choice);
    };
    updateOption();
    choiceText.value = '';
    number.value = 1;
    choiceText.focus();
}

updateOption();
function updateOption() {
    listChoices.innerHTML = '';
    rouletteChoices.innerHTML = '';
    angle = 360 / [...choices.values()].reduce((total, obj) => obj.number + total, 0);
    let degreeFrom = 0;
    // rotation = (180 - angle) / 2;
    rouletteChoices.style.transform = `rotate(${rotation}deg)`;
    let no = 1;
    choices.forEach(({ number, color }, text) => {
        const degreeTo = number * angle;
        const div = document.createElement('div');
        div.className = 'roulette-choice';
        div.style.transform = `rotate(${degreeFrom}deg)`;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // 1
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); // 1
        svg.setAttribute('width', `${radius * 2}`);
        svg.setAttribute('height', `${radius * 2}`);
        svg.appendChild(path)
        path.setAttribute('fill', `${color}`);
        path.setAttribute(
            'd',
            choices.size === 1
                ? `M ${radius} ${radius} M ${radius * 2} ${radius} A ${radius} ${radius} 0 1 0 0 ${radius} A ${radius} ${radius} 0 1 0 ${radius * 2} ${radius}`
                : `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${degreeTo > 180 ? '1' : '0'} 1 ${x(radius, radius, degreeTo)} ${y(radius, radius, degreeTo)} Z`
        );
        const span = document.createElement('span');
        span.textContent = text;
        span.style.transform = `rotate(${degreeTo < 360 ? (degreeTo - 180) / 2 : 0}deg)`;
        div.appendChild(svg);
        div.appendChild(span);
        rouletteChoices.appendChild(div);
        degreeFrom += degreeTo;

        const listChoice = document.createElement('div');
        const listChoiceNo = document.createElement('span');
        const listChoiceText = document.createElement('span');
        const listChoiceDecrement = document.createElement('button');
        const listChoiceNumber = document.createElement('input');
        const listChoiceIncrement = document.createElement('button');
        const listChoicePercentage = document.createElement('span');
        const listChoiceRemove = document.createElement('button');

        listChoice.className = 'list-choice';
        listChoiceNo.className = 'list-choice-no';
        listChoiceNo.textContent = `${no++}.`;
        listChoiceText.className = 'list-choice-text';
        listChoiceText.textContent = text;
        listChoiceDecrement.textContent = '-';
        listChoiceDecrement.addEventListener('click', () => {
            if (number < 2) {
                return;
            }
            choices.get(text).number--;
            updateOption();
        });
        listChoiceNumber.type = 'number';
        listChoiceNumber.value = `${number}`;
        listChoiceIncrement.textContent = '+';
        listChoiceIncrement.addEventListener('click', () => {
            choices.get(text).number++;
            updateOption();
        });

        listChoicePercentage.className = 'list-choice-percentage';
        listChoicePercentage.textContent = `${numberFormat.format((angle / 360 * number) * 100)}%`;

        listChoiceRemove.className = 'remove';
        listChoiceRemove.textContent = 'Remove';
        listChoiceRemove.addEventListener('click', () => {
            choices.delete(text);
            updateOption();
        });

        listChoice.append(listChoiceNo, listChoiceText, listChoiceDecrement, listChoiceNumber, listChoiceIncrement, listChoicePercentage, listChoiceRemove);
        listChoices.appendChild(listChoice);
    });
}

function getResult() {
    let theta = rotation % 360;
    let from = 0;
    let to = 0;
    choices.forEach(({ number }, text) => {
        to += number * angle;
        if ((theta + 360 - arrowAngle) % 360 > from && (theta + 360 - arrowAngle) % 360 <= to) {
            return text;
        }
        from = to;
    });
    return choices.keys().next().value;
}
