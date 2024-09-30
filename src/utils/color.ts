export const HSLToRGB = (
    hue: number,
    saturation: number,
    lightness: number
): [number, number, number] => {
    if (hue === undefined) {
        return [0, 0, 0];
    }

    const chroma =
        (1 - Math.abs(2 * (lightness / 100) - 1)) * (saturation / 100)

    let red = 0,
        green = 0,
        blue = 0,
        huePrime = hue / 60;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1))

    huePrime = Math.floor(huePrime);

    if (huePrime === 0) {
        red = chroma;
        green = secondComponent;
        blue = 0;
    } else if (huePrime === 1) {
        red = secondComponent;
        green = chroma;
        blue = 0;
    } else if (huePrime === 2) {
        red = 0;
        green = chroma;
        blue = secondComponent;
    } else if (huePrime === 3) {
        red = 0;
        green = secondComponent;
        blue = chroma;
    } else if (huePrime === 4) {
        red = secondComponent;
        green = 0;
        blue = chroma;
    } else if (huePrime === 5) {
        red = chroma;
        green = 0;
        blue = secondComponent;
    }

    const lightnessAdjustment = lightness / 100 - chroma / 2;
    red = Math.round((red + lightnessAdjustment) * 255);
    green = Math.round((green + lightnessAdjustment) * 255);
    blue = Math.round((blue + lightnessAdjustment) * 255);

    return [red, green, blue];
};

const isDigit = (str: string): boolean => {
    for (const char of str) {
        if (!'1234567890'.includes(char)) {
            return false;
        }
    }
    return true;
};

const genChunks = (src: string, size: number): string[] => {
    const ret: string[] = [];

    for (let i = 0; i < src.length; i += size) {
        ret.push(src.slice(i, i + size));
    }
    return ret;
};

export const codeFormat = (color: string): number[] => {
    if (!isDigit(color)) {
        throw Error(
            `Invalid code format ${color}\nValid format: A value encoded on 6 bytes`
        );
    }

    const colorNum = parseInt(color);
    if (colorNum < 0 || colorNum > 0xffffff) {
        throw Error(
            `Invalid value ${color}\nValid format: an integer (min: 0, max: 0xffffff)`
        );
    }
    color = colorNum.toString(16);
    const l = color.length;
    if (l < 6) {
        color = '0'.repeat(6 - l) + color;
    }
    const colorArr = genChunks(color, 2).map((x) => parseInt(x, 16));
    if (colorArr[0] === 255) {
        colorArr[0] = 0;
    }
    colorArr[0] = (colorArr[0] * 360) / 255;
    colorArr[1] = (colorArr[1] * 100) / 255;
    colorArr[2] = (colorArr[2] / 255 / 2 + 0.5) * 100;
    return colorArr;
};