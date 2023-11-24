let keyboard = document.querySelector(".keyboard");
let app = document.querySelector(".app-1");
let appstart = document.querySelector(".appstart");
let app2 = document.querySelector(".app-2");
let scorediv = document.querySelector(".scorediv");
let accudiv = document.querySelector(".accudiv");
let gamemode = document.querySelectorAll(".settings input");
let soundCheckbox = document.getElementById("toggleSound");
let isSoundMuted = false;
let letters = "abcdefghijklmnopqrstuvwxyz";
let position = [];
let next = [];
let last;
let score = 0;
let miss = 0;
let f = 0;
let speed = 60;

let fps = 60;
let previousTime = performance.now();

function toggleSound() {
    isSoundMuted = !isSoundMuted;
    if (isSoundMuted) {
        labelSound.classList.add("muted");
    } else {
        labelSound.classList.remove("muted");
    }
}


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
    let tiles = document.querySelectorAll(".tile");
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].remove();
    }
    position = [];
    next = [];
    score = 0;
    miss = 0;
    f = 1;
    if (gamemode[0].checked) {
        speed = 20;
    }
    if (gamemode[1].checked) {
        speed = 60;
    }
    if (gamemode[2].checked) {
        speed = 120;
    }
    app.style.filter = "blur(0px)";
    keyboard.style.filter = "blur(0px)";
    app2.style.display = "none";
    appstart.style.display = "none";
    previousTime = performance.now();
    createtile();
    requestAnimationFrame(update);
}

window.addEventListener(
    "keydown",
    (event) => {
        let kp = event.key.toLowerCase();
        presskey(kp);
    }
);

function presskey(kp) {
    if (f == 1) {
        if (kp == next[0]) {
            let tiles = document.querySelectorAll(".tile");
            tiles[0].remove();
            position.splice(0, 1);
            next.splice(0, 1);
            createtile();
            score++;
            if (gamemode[0].checked) {
                speed *= 1;
            }
            if (gamemode[1].checked) {
                speed *= 1.01;
            }
            if (gamemode[2].checked) {
                speed *= 1.03;
            }
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

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
function playSound() {
    if (!isSoundMuted) {
        arr = notes[(score - 1) % tones.length];
        var buf = new Float32Array(arr.length);
        for (var i = 0; i < arr.length; i++) buf[i] = arr[i]
        var buffer = context.createBuffer(1, buf.length, context.sampleRate)
        buffer.copyToChannel(buf, 0)
        var source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.start(0);
    }
}

function sineWaveAt(sampleNumber, tone) {
    var sampleFreq = context.sampleRate / tone
    return Math.sin(sampleNumber / (sampleFreq / (Math.PI * 2)))
}


var notes = [];
var volume = 0.5;
var seconds = 0.2;
var tones = [392.00, 311.13, 293.66, 261.63, 261.63, 293.66, 311.13, 261.63, 311.13, 392.00, 415.30, 392.00, 349.23, 349.23, 293.66, 261.63, 246.94, 196.00, 246.94, 293.66, 246.94, 293.66, 349.23, 392.00, 415.30, 369.99, 392.00];

for (var t = 0; t < tones.length; t++) {
    var arr = [];
    for (var i = 0; i < context.sampleRate * seconds; i++) {
        arr[i] = sineWaveAt(i, tones[t]) * volume;
    }
    notes.push(arr);
}
