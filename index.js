const numberFormat = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

let rouletteChoices = document.querySelector('.roulette #roulette-choices');
const listChoices = document.querySelector('.list-choices');

let button = document.querySelector('#spin');

let arrowAngle = 90;
document.querySelector('#arrow-container').style.transform = `rotate(${90}deg)`;

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
        console.log(options[result].text);
        // console.log(choice.element.textContent);
    }
}

button.addEventListener("click", () => {
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

function bezierBlend(t) {
    return t * t * (3 - 2 * t);
}

function parametricBlend(t) {
    const sqr = t * t;
    return sqr / (2 * (sqr - t) + 1);
}

function inOutQuadBlend(t) {
    if (t <= 0.5) return 2 * t * t;
    t -= 0.5;
    return 2 * t * (1 - t) + 0.5;
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}


let colors = ['F38181', 'FCE38A', 'EAFFD0', '95E1D3', 'FFCFDF', 'FEFDCA', 'E0F9B5', 'A5DEE5'];
// let colorsLeft = [];

// circle = options.reduce((angle, option) => ``, 0)

// circle = options.map(option => `#${randomColor()} ${option.number * angle}deg`);

// w.style.background = `conic-gradient(${circle.join(',')})`;
// console.log(`conic-gradient(${circle.join(',')})`);

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
    options.push({
        text: choiceText.value,
        number: +number.value,
        color: colors[Math.floor(Math.random() * colors.length)]
    });
    while (
        options.length > 1 &&
        (options[options.length - 1].color === options[options.length - 2]?.color ||
            options[options.length - 1].color === options[0].color)
    ) {
        options[options.length - 1].color = colors[Math.floor(Math.random() * colors.length)];
    }
    updateOption();
    choiceText.value = '';
    number.value = 1;
    choiceText.focus();
}

updateOption();
function updateOption() {
    listChoices.innerHTML = '';
    rouletteChoices.innerHTML = '';
    angle = 360 / options.reduce((total, obj) => obj.number + total, 0);
    let degreeFrom = 0; // 0 - (angle * options[0].number / 2); // 0 + (options[0].number * angle / 2); (180 - angle) / 2;
    // rotation = (180 - angle) / 2;
    // if (!rotation) {
    // }
    rouletteChoices.style.transform = `rotate(${rotation}deg)`;
    for (let i = 0; i < options.length; i++) {
        // if (!colorsLeft.length) {
        //     colorsLeft = [...colors];
        // }
        const degreeTo = options[i].number * angle; // degreeFrom + (options[i].number * angle);
        // const color = colorsLeft.splice(Math.floor(Math.random() * colorsLeft.length), 1);
        const choice = document.createElement('div');
        choice.className = 'roulette-choice';
        // choice.style.transform = `rotate(${degreeFrom + ((options[i].number - 1) * (angle / 2))}deg)`;
        choice.style.transform = `rotate(${degreeFrom}deg)`;
        // console.log(degreeFrom + (options[i].number > 1 ? (angle / options[i].number) : 0));
        // option.style.backgroundColor = `#${color}`;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); // 1
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); // 1
        svg.setAttribute('width', `${radius * 2}`);
        svg.setAttribute('height', `${radius * 2}`);
        // svg.style.transform = `rotate(${(180 - degreeTo) / 2}deg)`;
        svg.appendChild(path)
        path.setAttribute('fill', `#${options[i].color}`);
        if (options.length === 1) {
            path.setAttribute('d', `M ${radius} ${radius} M ${radius * 2} ${radius} A ${radius} ${radius} 0 1 0 0 ${radius} A ${radius} ${radius} 0 1 0 ${radius * 2} ${radius}`);
            // option.style.clipPath = `path('M ${radius} ${radius} M ${radius * 2} ${radius} A ${radius} ${radius} 0 1 0 0 ${radius} A ${radius} ${radius} 0 1 0 ${radius * 2} ${radius}`;
        } else {
            path.setAttribute('d', `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${degreeTo > 180 ? '1' : '0'} 1 ${x(radius, radius, degreeTo)} ${y(radius, radius, degreeTo)} Z`);
            // option.style.clipPath = `path('M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${degreeTo > 180 ? '1' : '0'} 1 ${x(radius, radius, degreeTo)} ${y(radius, radius, degreeTo)} Z')`;
        }
        // option.style.transform = `rotate(${degreeFrom}deg)`;
        const text = document.createElement('span');
        text.textContent = options[i].text;
        // text.style.transform = `rotate(${(degreeTo - 180) / 2}deg)`;
        text.style.transform = `rotate(${degreeTo < 360 ? (degreeTo - 180) / 2 : 0}deg)`;
        // console.log({ degreeTo });
        choice.appendChild(svg);
        choice.appendChild(text);
        rouletteChoices.appendChild(choice);
        //         const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        //         const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        //         // const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        //         const text = document.createElement('span');
        //         svg.setAttribute('width', `${radius * 2}`);
        //         svg.setAttribute('height', `${radius * 2}`);
        //         option.style.transform = `rotate(${degreeFrom}deg)`;
        //         path.setAttribute('d', `M ${radius} ${radius} L ${radius} 0 A ${radius} ${radius} 0 ${degreeTo > 180 ? '1' : '0'} 1 ${x(radius, radius, degreeTo)} ${y(radius, radius, degreeTo)} Z`);
        //         path.setAttribute('fill', `#${color}`);
        //         // text.setAttribute('fill', `black`);
        //         // text.setAttribute('x', `150`);
        //         // text.setAttribute('y', `${radius * 2 - angle}`);
        //         text.textContent = options[i].text;
        // 
        //         text.style.transform = `rotate(${(degreeTo - 180) / 2}deg)`;
        //         svg.appendChild(path);
        //         svg.appendChild(text);
        //         option.appendChild(svg);
        //         option.appendChild(text);
        //         roulette.appendChild(option);
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
        listChoiceNo.textContent = `${i + 1}.`;
        listChoiceText.className = 'list-choice-text';
        listChoiceText.textContent = options[i].text;
        listChoiceDecrement.textContent = '-';
        listChoiceNumber.type = 'number';
        listChoiceNumber.value = `${options[i].number}`;
        listChoiceIncrement.textContent = '+';

        listChoicePercentage.className = 'list-choice-percentage';
        listChoicePercentage.textContent = `${numberFormat.format((angle / 360 * options[i].number) * 100)}%`;

        listChoiceRemove.textContent = 'Remove';
        listChoiceRemove.addEventListener('click', () => {
            options.splice(i, 1);
            updateOption();
        });

        listChoice.append(listChoiceNo, listChoiceText, listChoiceDecrement, listChoiceNumber, listChoiceIncrement, listChoicePercentage, listChoiceRemove);
        listChoices.appendChild(listChoice);
    }
}

function getResult() {
    let theta = rotation % 360;
    let from = 0;
    let to = 0;
    for (let i = options.length - 1; i >= 0; i--) {
        to += options[i].number * angle;
        if ((theta + 360 - arrowAngle) % 360 > from && (theta + 360 - arrowAngle) % 360 <= to) {
            return i;
        }
        from = to;
    }
    return 0;
}
