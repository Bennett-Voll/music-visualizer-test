/**
 * Shuffle an array
 * 
 * @param {Array} array
 * @param {Integer} start
 * @param {Integer} end
 * @returns {Array}
 */
function shuffleArray(array, start, end) {
    var currentIndex = end ? end : array.length;
    var startIndex = start ? start : 0;
    var temporaryValue;
    var randomIndex;

    // While there remain elements to shuffle...
    while (startIndex !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * (currentIndex - startIndex) + startIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Return the average of an array
 *
 * @param {Array} array
 * @returns {Number}
 */
function average(array) {
    var sum = 0;

    array.forEach((e) => sum += e);

    return sum / array.length;
}

/**
 * Make within a set of scalars one size come forth more often than another
 * Scalars are assumed to have a range of 0 - 255, but other ranges can be specified
 * 
 * @param {Array} array
 * @param {Number} power
 * @param {Number} startRange
 * @param {Number} endRange
 * @returns {Array}
 */
function sizeBiasArray(array, power = 1, startRange = 0, endRange = 255) {
    return array.map((e) => map(Math.pow(map(e, startRange, endRange, 0, 1), power), 0, 1, startRange, endRange));
}

/**
 * Create an array where each element represents a map from once index to another
 * 
 * @param {int} length 
 * @returns {Array}
 */
function createIndexMapper(length) {
    var mapper = new Array(length);

    for (var i = 0; i < length; i += 1) {
        mapper[i] = i;
    }

    mapper = shuffleArray(mapper);

    return mapper;
}

/**
 * Use the mapper to predictably map every element from array to an index specified in the mapper
 * mapper and array must be of equal size
 * 
 * @param {Array} mapper 
 * @param {Array} array
 * @returns {Array}
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
 * @returns {Array}
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

var cnv;

// 1024 is the size of both the spectrum array and the waveform array
var spectrumInterval = 10;
var spectrumSize = Math.ceil(1024 / spectrumInterval);
var indexMapper = createIndexMapper(spectrumSize);

function setup() {
    cnv = createCanvas(window.innerWidth, window.innerHeight);
    cnv.mouseClicked(togglePlay);
    fft = new p5.FFT();
    sound.amp(0.2);

    textFont('Impact');
}

function draw() {
    background(0);

    var centerX = width / 2;
    var centerY = height / 2;
    var minLength = Math.min(width, height) / 2;

    var realSpectrum = fft.analyze();
    var spectrum = useIndexMapper(indexMapper, averageOutOnIntervals(realSpectrum, spectrumInterval));
    var waveform = fft.waveform();

    var averageSize = average(
        waveform.map((e) => map(Math.abs(e), 0, 1, minLength / 4, minLength * 1.8)).concat(
            realSpectrum.map((e) => map(e, 0, 255, 0, minLength * 1.8)),
        ),
    );

    // console.log(averageSize)

    // set fill to this weird color that grows with the averageSize
    fill(map(averageSize, 0, 255, 0, 200) - minLength / 2 + 100, 0, 0);
    
    beginShape();
    stroke(160, 11, 11); // waveform is red
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

    textAlign(CENTER, CENTER);
    textSize(averageSize);
    text('♫', centerX, centerY);
}

// fade sound if mouse is over canvas
function togglePlay() {
    if (sound.isPlaying()) {
        sound.pause();
    } else {
        sound.loop();
    }
}

window.addEventListener('resize', () => resizeCanvas(window.innerWidth, window.innerHeight))