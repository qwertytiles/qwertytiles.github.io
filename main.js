let keyboard = document.querySelector(".keyboard");
let app = document.querySelector(".app-1");
let appstart = document.querySelector(".appstart");
let app2 = document.querySelector(".app-2");
let scorediv = document.querySelector(".scorediv");
let accudiv = document.querySelector(".accudiv");
let trackNumber = document.getElementById("trackNumber").value;
let letters = "abcdefghijklmnopqrstuvwxyz";
let position = [], next = [], notes = [], seconds = 0.3, last, context, score = 0, miss = 0, f = 0, speed = 60, fps = 60, previousTime = performance.now();
let tracks = [
    [0],
    [392.00, 311.13, 293.66, 261.63, 261.63, 293.66, 311.13, 261.63, 311.13, 392.00, 415.30, 392.00, 349.23, 349.23, 293.66, 261.63, 246.94, 196.00, 246.94, 293.66, 246.94, 293.66, 349.23, 392.00, 415.30, 369.99, 392.00],
];

window.addEventListener(
    "keydown",
    (event) => {
        let kp = event.key.toLowerCase();
        presskey(kp);
    }
);

function update(timeStamp) {
    fps = 1000 / (timeStamp - previousTime);
    previousTime = timeStamp;
    let tiles = document.querySelectorAll(".tile");
    for (let i = 0; i < tiles.length; i++) {
        position[i] += ((speed / fps) * 0.5);
        tiles[i].style.top = position[i] + "%";
        let rect = tiles[i].getBoundingClientRect();
        let rect2 = keyboard.getBoundingClientRect();
        if (rect.bottom > rect2.top) {
            f = 0;
        }
    }

    if (position[position.length - 1] >= 0) {
        createtile();
    }

    if (f != 0) {
        requestAnimationFrame(update);
    } else {
        scorediv.innerHTML = score;
        accudiv.innerHTML = Math.floor(((score == 0 ? 1 : score) * 100) / ((score == 0 ? 1 : score) + miss)) + "%";
        app.style.filter = "blur(7px)";
        keyboard.style.filter = "blur(7px)";
        app2.style.display = "block";
    }
}

function createtile() {
    let tile = document.createElement("div");
    tile.className = "tile";
    let n = Math.floor(Math.random() * 5);
    while (n == last) {
        n = Math.floor(Math.random() * 5);
    }
    last = n;
    let l = letters[Math.floor(Math.random() * 25)];
    tile.innerHTML = '<div class="letter">' + l + '</div>';
    next.push(l);
    if (position.length > 0) {
        position.push(position[position.length - 1] - 20);
    } else {
        position.push(-30);
    }
    tile.style.top = position[position.length - 1] + "%";
    tile.style.left = 20 * n + "%";
    app.appendChild(tile);
}

function replay() {
    trackNumber = document.getElementById("trackNumber").value;
    let tiles = document.querySelectorAll(".tile");
    for (let i = 0; i < tiles.length; i++) { tiles[i].remove(); }
    position = [], next = [], score = 0, miss = 0, f = 1, speed = 60;
    app.style.filter = "blur(0px)";
    keyboard.style.filter = "blur(0px)";
    app2.style.display = "none";
    appstart.style.display = "none";
    previousTime = performance.now();
    loadAudio();
    createtile();
    requestAnimationFrame(update);
}

function presskey(kp) {
    if (f == 1) {
        if (kp == next[0]) {
            let tiles = document.querySelectorAll(".tile");
            tiles[0].remove();
            position.splice(0, 1);
            next.splice(0, 1);
            createtile();
            score++;
            speed *= 1.02;
            playSound();
        } else {
            miss++;
        }
    } else {
        if (kp == ' ') {
            replay();
        }
    }
}

function opensettings() {
    appstart.style.display = "flex";
}

function playSound() {
    arr = notes[(score - 1) % tracks[trackNumber].length];
    let buf = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i++) buf[i] = arr[i]
    let buffer = context.createBuffer(1, buf.length, context.sampleRate)
    buffer.copyToChannel(buf, 0)
    let source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
}

function sineWaveAt(sampleNumber, tone) {
    let sampleFreq = context.sampleRate / tone
    return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
}

function linearEnvelope(endOfFadeIn, startOfFadeOut, samples) {
    let envelope = new Array(samples).fill(1);
    for (let i = 0; i < samples; i++) {
        if (i < endOfFadeIn)
            envelope[i] = i;
        else if (i < startOfFadeOut)
            envelope[i] = envelope[i - 1];
        else
            envelope[i] = envelope[i - 1] - 1;
    }
    return envelope
}

function loadAudio() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext();
    notes = [];
    for (let t = 0; t < tracks[trackNumber].length; t++) {
        let arr = [];
        let samples = context.sampleRate * seconds;
        endOfFadeIn = samples / 4;
        startOfFadeOut = samples * 3 / 4;
        let envelope = linearEnvelope(endOfFadeIn, startOfFadeOut, samples);
        envelopeMax = Math.max.apply(null, envelope)
        for (let i = 0; i < samples; i++) {
            arr[i] = sineWaveAt(i, tracks[trackNumber][t]) * envelope[i] / envelopeMax / 2;
        }
        notes.push(arr);
    }
}
