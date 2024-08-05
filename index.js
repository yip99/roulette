class Choices extends Map {
    first() {
        return super.entries().next().value;
    }
    last() {
        return [...super.entries()].at(-1);
    }
    add(key, value) {
        if (super.has(key)) {
            super.get(key).number += (+value.number);
        } else {
            super.set(key, value);
            this.lastItem = [key, super.get(key)];
        }
    }
}

const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

const colors = [
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

const elementRouletteChoices = document.querySelector('.roulette #roulette-choices');
const elementListChoices = document.querySelector('.list-choices');
const inputNumber = document.querySelector('input[type="number"]');
const inputText = document.querySelector('input[name="choice-text"]');
const buttonSpin = document.querySelector('#spin');
const elementResults = document.querySelector('.results');

const arrowAngle = +getComputedStyle(document.body).getPropertyValue('--arrow-angle').match(/rotate\(([+-]?\d+)deg\)/)?.[1];

let isSpinning = false;
let rotation = 0;
let animationFrameId;

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
const choices = new Choices();
const results = [];


let radius = elementRouletteChoices.getBoundingClientRect().width / 2;
let angle;

window.addEventListener('resize', function () {
    radius = elementRouletteChoices.getBoundingClientRect().width / 2;
    updateOption();
}, true);

buttonSpin.addEventListener("click", () => {
    if (choices.size < 2) {
        return;
    }
    buttonSpin?.classList.toggle('spinning');
    if (!isSpinning) {
        console.timeEnd("stopped");
        isSpinning = true;
        cancelAnimationFrame(animationFrameId);
        console.time("max");
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

document.querySelector('#increment').addEventListener('click', () => {
    inputNumber.value = (+inputNumber.value) + 1;
});

document.querySelector('#decrement').addEventListener('click', () => {
    if (+inputNumber.value > 1) {
        inputNumber.value = (+inputNumber.value) - 1;
    }
});

document.querySelector('#add').addEventListener('click', () => {
    addOption();
});

inputText?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addOption();
    }
});

function startSpin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    if (Date.now() - startTime < accelerateTime * (1 - startSpeed / maxSpeed)) {
        speed = maxSpeed * easeInOutSine((Date.now() - startTime) / (accelerateTime * (1 - startSpeed / maxSpeed))) + startSpeed * (1 - (Date.now() - startTime) / (accelerateTime * (1 - startSpeed / maxSpeed)));
        rotation += (speed / fps);
        elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
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
    elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
    animationFrameId = requestAnimationFrame(spin);
}

function stopSpin() {
    elapsed = Date.now() - then;
    fps = 1000 / elapsed;
    then = Date.now();
    if (Date.now() - stopTime < decelerateTime * (stopSpeed / maxSpeed)) {
        speed = stopSpeed * (1 - easeInOutSine((Date.now() - stopTime) / (decelerateTime * (stopSpeed / maxSpeed))));
        rotation += speed / fps;
        elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
        animationFrameId = requestAnimationFrame(stopSpin);
    } else {
        cancelAnimationFrame(animationFrameId);
        console.timeLog("stopped");
        const result = getResult();
        results.push(result);
        displayResult();
        console.log({ results, result });
    }
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

function x(cx, radius, degree) {
    return cx + (radius * Math.sin(degree * (Math.PI / 180)));
}

function y(cy, radius, degree) {
    return cy - (radius * Math.cos(degree * (Math.PI / 180)));
}

function addOption() {
    const choice = {
        number: +inputNumber.value,
        color: colors[Math.floor(Math.random() * colors.length)],
    }
    if (!choices.has(inputText.value)) {
        const firstChoice = choices.first()?.[1];
        const lastChoice = choices.last()?.[1];
        while ([firstChoice?.color, lastChoice?.color].includes(choice.color)) {
            choice.color = colors[Math.floor(Math.random() * colors.length)];
        }
    }
    choices.add(inputText.value, choice);
    updateOption();
    inputText.value = '';
    inputNumber.value = 1;
    inputText.focus();
}

function updateOption() {
    elementListChoices.innerHTML = '';
    elementRouletteChoices.innerHTML = '';
    angle = 360 / [...choices.values()].reduce((total, obj) => obj.number + total, 0);
    let degreeFrom = 0;
    // rotation = (180 - angle) / 2;
    elementRouletteChoices.style.transform = `rotate(${rotation}deg)`;
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
        elementRouletteChoices.appendChild(div);
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
        listChoiceNo.className = 'number';
        listChoiceNo.textContent = `${no++}.`;
        listChoiceText.className = 'list-choice-text';
        listChoiceText.textContent = text;
        listChoiceText.title = text;
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
        elementListChoices.appendChild(listChoice);
    });
}

function getResult() {
    let theta = rotation % 360;
    let from = 360;
    let to = 360;
    if (theta === 0) {
        return choices.first()?.[0];
    }
    for (let [text, { number }] of choices) {
        to = from;
        from -= number * angle;
        console.log((360 + theta - arrowAngle) % 360, { theta: (360 + theta - arrowAngle) % 360, text, from, to });
        if ((360 + theta - arrowAngle) % 360 >= from && (360 + theta - arrowAngle) % 360 < to) {
            return text;
        }
    }
}

function displayResult() {
    elementResults.innerHTML = '';
    for (let i = 0; i < results.length; i++) {
        const div = document.createElement('div');
        div.className = 'result';
        const number = document.createElement('span');
        number.className = 'number';
        number.innerText = `${i + 1}.`;
        const span = document.createElement('span');
        span.innerText = results[i];
        span.title = results[i];
        div.appendChild(number);
        div.appendChild(span);
        elementResults?.appendChild(div);
    }
}
