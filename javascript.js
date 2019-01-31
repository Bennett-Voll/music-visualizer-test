/**
 * Shuffle an array
 * 
 * @param {Array} array
 * @return {Array}
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

/**
 * Create an array where each element represents a map from once index to another
 * 
 * @param {int} length 
 * @return {Array}
 */
function createIndexMapper(length) {
    var mapper = new Array(length);

    for (var i = 0; i < length; i += 1) {
        mapper[i] = i;
    }

    mapper = shuffle(mapper);

    return mapper;
}

/**
 * Use the mapper to predictably map every element from array to an index specified in the mapper
 * mapper and array must be of equal size
 * 
 * @param {Array} mapper 
 * @param {Array} array
 * @return {Array}
 */
function useIndexMapper(mapper, array) {
    var newArray = new Array(array.length);

    mapper.forEach((e, i) => newArray[e] = array[i]);

    return newArray;
}

/**
 * Create a new array of size array.length / interval in which each
 * element represents the average over each interval in the original array
 * 
 * @param {Array} array
 * @param {Number} interval
 * @return {Array}
 */
function averageOutOnIntervals(array, interval) {
    var newArray = [];
    var sum = 0;

    array.forEach((e, i) => {
        sum += e;

        if (i % interval === interval - 1) {
            newArray.push(sum / interval);
            sum = 0;
        }
    });

    return newArray;
}

function preload() {
    sound = loadSound('assets/boc.mp3');
}

function setup() {
    var cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.mouseClicked(togglePlay);
    fft = new p5.FFT();
    sound.amp(0.2);
}

// 1024 is the size of both the spectrum array and the waveform array
var spectrumInterval = 16;
var spectrumSize = 1024 / spectrumInterval;
var indexMapper = createIndexMapper(spectrumSize);

function draw() {
    background(0);

    var centerX = width / 2;
    var centerY = height / 2;
    var minLength = Math.min(width, height) / 2;

    var spectrum = useIndexMapper(indexMapper, averageOutOnIntervals(fft.analyze(), spectrumInterval));
    var waveform = fft.waveform();

    noFill();
    beginShape();
    stroke(196, 11, 11); // waveform is red
    strokeWeight(1);
    for (var i = 0; i < waveform.length; i += 1) {
        var waveI = i;
        var specI = Math.floor(map(i, 0, waveform.length - 1, 0, spectrumSize));

        var deg = map(i, 0, waveform.length, 0, Math.PI * 2);

        var waveformX = map(waveform[waveI], -1, 1, 0, minLength / 2);
        var waveformY = map(waveform[waveI], -1, 1, 0, minLength / 2);

        var spectrumX = map(spectrum[specI], 0, 255, 0, minLength / 3);
        var spectrumY = map(spectrum[specI], 0, 255, 0, minLength / 3);

        var x = centerX + (waveformX + spectrumX) * Math.cos(deg);
        var y = centerY + (waveformY + spectrumY) * Math.sin(deg);
        
        vertex(x, y);
    }
    endShape(CLOSE);
}

// fade sound if mouse is over canvas
function togglePlay() {
    if (sound.isPlaying()) {
        sound.pause();
    } else {
        sound.loop();
    }
}