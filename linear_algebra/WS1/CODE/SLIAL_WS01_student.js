let fs = require("fs");
let PNG = require("pngjs").PNG;

const SOURCE_FILE = "cameraman_32x32.png";
const DESTINATION_BLURRED = "blurred.png";
const DESTINATION_DEBLURRED = "deblurred.png";

// parse the source file into a PNG object
let dataIn = fs.readFileSync(SOURCE_FILE);
let png  = PNG.sync.read(dataIn, {filterType: -1,});

// parse PNG object into an array of averaged rgb values
let img = parsePng(png);

// blur image
let blurred = blurImg(img, png.width, png.height, oneOverE);

// write blurred image to destination file
writePng(blurred, png.width, png.height, DESTINATION_BLURRED);

let deblurred = deblurImg(blurred, png.width, png.height, oneOverE, 100);

writePng(deblurred, png.width, png.height, DESTINATION_DEBLURRED);

// let img = checkerboard(32, 32);
// let out = blurImg(img, 32, 32, oneOverE);
// writePng(out, 32, 32, "blurred.png");

/* 
 * input png
 * output 1D array
 * this function takes a png file and return an array with each element corroponding
 * to the greyscale of that pixel
 */
function parsePng(png) {
    let height = png.height;
    let width = png.width;
    let img = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let i = width * y + x;
            // we simply average r,g,b
            img[i] = (png.data[i * 4 + 0] + png.data[i * 4 + 1] + png.data[i * 4 + 2]) / (3 * 256);
        }
    }

    return img;
}

/*
 * input: width and heigt of image
 * output: array with ones and zeros
 * this function takes the heigt and number of the wished image
 * and reterns an array with a checkerboard pattern
 *
 * can be used to create test images
 */
function checkerboard(width, height) {
    let out = [];
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let i = height * y + x;
            if ((x + y) % 2) 
                out[i] = 0.0;
            else
                out[i] = 1.0;
        }
    }
    return out;
}

/*
 * input: array with greyscale values, width and height of image and destination file
 * output: undefind
 * this function parses an image into a PNG object with greyscale values and
 * then writes the contents to the a file
 */
function writePng(img, width, height, destination) {
    let png = new PNG({ width: width, height: height });
    const COL_MIN  = Math.min(...img);
    const COL_MAX  = Math.max(...img);
    const COL_DIFF = Math.max(COL_MAX - COL_MIN, 1.0E-10);
    console.log(`Col max, min and diff \n${COL_MIN}\n${COL_MAX}\n${COL_DIFF}`);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let i = height * y + x;
            // scale the color to [0..255] range
            let col = Math.round(255 * (img[i] - COL_MIN) / COL_DIFF);
            png.data[i * 4 + 0] = col;
            png.data[i * 4 + 1] = col;
            png.data[i * 4 + 2] = col;
            png.data[i * 4 + 3] = 255;
        }
    }
    // Write everything into a file
    let buff = PNG.sync.write(png);
    fs.writeFileSync(destination, buff);
}

/*
 * input: array of image to blur, width and height of image and a weighting function
 * output: array of the blurred image
 */
function blurImg(img, width, height, weight) {
    let out = []

    // console.log(`There are ${width * height} pixels, the width is ${width} and the height is ${height}.`);

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            out[j + i * height] = blurPixel(img, width, height, weight, j, i);
        }
        // console.log(100 * i / height);
    }

    return out;
}

/*
 * input: array of image to blur, width and height of image, weighting function,
 * and coordinates for the current pixel to calculate
 * output: value for the pixel
 */
function blurPixel(img, width, height, weight, pixelX, pixelY) {
    let pixel = 0;

    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            pixel += weight(dist(pixelX, pixelY, j, i)) * img[j + i * height];
        }
    }

    return pixel;
}

/*
 * input: four numbers corrosponding to two points (pixels)
 * output: the distance between them
 */
function dist(x1, y1, x2, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
}

/*
 * intput: a number
 * output: the reciprocal of eulers to the power of that number
 */
function oneOverE(num) {
    return 1 / Math.exp(num);
}

/*
 * input: a number
 * output: the maximum of that number subtractet from 1 or zero
 */
function linearWeight(num) {
    return Math.max(1 - num, 0);
}

/*
 * input: 
 * blurred; array of blurred image
 * width, height is selfexplanatory
 * weight: weighting function used to blur the image in the first place
 * delta: number for precision the smaller the more accurate it becomes
 * 
 * output:
 * an array of the deblurred image
 */
function deblurImg(blurred, width, height, weight, delta) {
    let deblurred = [];
    let current = [];
    let prev = [];
    const AII_INVERSE = 1 / weight(1);

    for (let i = 0; i < width * height; i++) {
        prev[i] = 0.5;
    };

    for (;;) {
        let temp = blurImg(prev, width, height, oneOverE);
        let remainder = [];
        for (i = 0; i < width * height; i++) {
            remainder[i] = blurred[i] - temp[i];    
        }
        
        for (let i = 0; i < width * height; i++) {
            current[i] = prev[i] + AII_INVERSE * remainder[i];
        }
        
        let length = Math.hypot(...current) - Math.hypot(...prev);
        console.log(`Length ${length}`);
        if (length < delta) {
            deblurred = [...current];
            break;
        }
        prev = [...current];
    }

    return deblurred;
}
