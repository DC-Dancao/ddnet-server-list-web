import React, {useEffect, useRef, useState} from 'react';
import {codeFormat, HSLToRGB} from '@/utils/color';

interface TeeRendererProps {
    skinName: string;
    bodyColor?: string;
    feetColor?: string;
    colorFormat?: 'code' | 'rgb' | 'hsl';
}

interface SkinElements {
    body: number[];
    body_shadow: number[];
    foot: number[];
    foot_shadow: number[];
    eyes: number[];
}

const TeeRenderer: React.FC<TeeRendererProps> = ({
                                                     skinName,
                                                     bodyColor,
                                                     feetColor,
                                                     colorFormat = 'code',
                                                 }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [teeImage, setTeeImage] = useState<string | null>(null);

    useEffect(() => {
        const loadImage = async () => {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.src = `/api/skin/${skinName}`;

            img.onerror = () => {
                img.src = "/api/skin/default";
            };
            await img.decode();

            const colorizationCanvas = document.createElement('canvas');
            const colorizationCtx = colorizationCanvas.getContext('2d');

            if (!colorizationCtx) {
                throw new Error('Canvas context not found.');
            }

            colorizationCanvas.width = img.width;
            colorizationCanvas.height = img.height;
            colorizationCtx.drawImage(img, 0, 0);

            if (bodyColor && feetColor) {
                await colorizeSkin(colorizationCtx, bodyColor, feetColor);
            }

            const renderSkinCanvas = document.createElement('canvas');
            const renderSkinCtx = renderSkinCanvas.getContext('2d');

            if (!renderSkinCtx) {
                throw new Error('Canvas context not found.');
            }

            const finalCanvas = await renderSkin(colorizationCanvas, renderSkinCtx);

            const blob = await new Promise<Blob | null>((resolve) =>
                finalCanvas.toBlob(resolve)
            );

            if (blob) {
                setTeeImage(URL.createObjectURL(blob));
            }
        };

        const colorizeSkin = async (
            ctx: CanvasRenderingContext2D,
            bodyColor: string,
            feetColor: string,
        ) => {
            const multiplier = ctx.canvas.width / 256;
            const skinElements: SkinElements = {
                body: [0, 0, 96, 96],
                body_shadow: [96, 0, 96, 96],
                foot: [192, 32, 64, 32],
                foot_shadow: [192, 64, 64, 32],
                eyes: [64, 96, 32, 32],
            };

            for (const part in skinElements) {
                const partMultiplied = skinElements[part as keyof SkinElements].map((x) => x * multiplier);

                const partCanvas = document.createElement('canvas');
                const partCtx = partCanvas.getContext('2d');

                if (!partCtx) {
                    throw new Error('Canvas context not found.');
                }

                partCanvas.width = partMultiplied[2];
                partCanvas.height = partMultiplied[3];
                partCtx.putImageData(
                    ctx.getImageData(
                        partMultiplied[0],
                        partMultiplied[1],
                        partMultiplied[2],
                        partMultiplied[3]
                    ),
                    0,
                    0
                );

                const imageData = partCtx.getImageData(
                    0,
                    0,
                    partMultiplied[2],
                    partMultiplied[3]
                );

                let color: number[];
                color = codeFormat(part === 'body' || part === 'eyes' ? bodyColor : feetColor);
                color = HSLToRGB(color[0], color[1], color[2]);


                await applyColor(partCtx, imageData, color, 'grayscale');

                if (part === 'body') {
                    await reorderBody(partCtx, imageData);
                }

                await applyColor(partCtx, imageData, color, 'default');

                ctx.clearRect(
                    partMultiplied[0],
                    partMultiplied[1],
                    partMultiplied[2],
                    partMultiplied[3]
                );
                ctx.drawImage(partCanvas, partMultiplied[0], partMultiplied[1]);
            }
        };

        const applyColor = async (
            ctx: CanvasRenderingContext2D,
            imageData: ImageData,
            color: number[],
            mode: 'grayscale' | 'default'
        ) => {
            const buffer = imageData.data;
            const pixel = {r: 0, g: 0, b: 0, a: 0};

            for (let byte = 0; byte < buffer.length; byte += 4) {
                pixel.r = buffer[byte];
                pixel.g = buffer[byte + 1];
                pixel.b = buffer[byte + 2];
                pixel.a = buffer[byte + 3];

                if (mode === 'grayscale') {
                    const newValue = (pixel.r + pixel.g + pixel.b) / 3;
                    pixel.r = newValue;
                    pixel.g = newValue;
                    pixel.b = newValue;
                } else {
                    pixel.r = (pixel.r * color[0]) / 255;
                    pixel.g = (pixel.g * color[1]) / 255;
                    pixel.b = (pixel.b * color[2]) / 255;
                }

                buffer[byte] = pixel.r;
                buffer[byte + 1] = pixel.g;
                buffer[byte + 2] = pixel.b;
                buffer[byte + 3] = pixel.a;
            }

            ctx.putImageData(imageData, 0, 0);
        };

        const reorderBody = async (
            ctx: CanvasRenderingContext2D,
            imageData: ImageData
        ) => {
            const buffer = imageData.data;
            const frequencies = Array(256).fill(0);
            const newWeight = 192;

            let orgWeight = 0;

            for (let byte = 0; byte < buffer.length; byte += 4) {
                if (buffer[byte + 3] > 128) {
                    frequencies[buffer[byte]]++;
                }
            }

            for (let i = 1; i < 256; i++) {
                if (frequencies[orgWeight] < frequencies[i]) {
                    orgWeight = i;
                }
            }

            const invOrgWeight = 255 - orgWeight;
            const invNewWeight = 255 - newWeight;

            for (let byte = 0; byte < buffer.length; byte += 4) {
                let value = buffer[byte];

                if (value <= orgWeight && orgWeight === 0) {
                    continue;
                } else if (value <= orgWeight) {
                    value = Math.trunc((value / orgWeight) * newWeight);
                } else if (invOrgWeight === 0) {
                    value = newWeight;
                } else {
                    value = Math.trunc(
                        ((value - orgWeight) / invOrgWeight) * invNewWeight + newWeight
                    );
                }

                buffer[byte] = value;
                buffer[byte + 1] = value;
                buffer[byte + 2] = value;
            }

            ctx.putImageData(imageData, 0, 0);
        };

        const renderSkin = async (
            colorizationCanvas: HTMLCanvasElement,
            ctx: CanvasRenderingContext2D
        ): Promise<HTMLCanvasElement> => {
            const s = colorizationCanvas.width / 256;

            const canvas = ctx.canvas;
            canvas.width = 96 * s;
            canvas.height = 64 * s;

            ctx.drawImage(colorizationCanvas, 192 * s, 64 * s, 64 * s, 32 * s, 8 * s, 32 * s, 64 * s, 30 * s); //back feet shadow
            ctx.drawImage(colorizationCanvas, 96 * s, 0 * s, 96 * s, 96 * s, 16 * s, 0 * s, 64 * s, 64 * s); //body shadow
            ctx.drawImage(colorizationCanvas, 192 * s, 64 * s, 64 * s, 32 * s, 24 * s, 32 * s, 64 * s, 30 * s); //front feet shadow
            ctx.drawImage(colorizationCanvas, 192 * s, 32 * s, 64 * s, 32 * s, 8 * s, 32 * s, 64 * s, 30 * s); //back feet
            ctx.drawImage(colorizationCanvas, 0 * s, 0 * s, 96 * s, 96 * s, 16 * s, 0 * s, 64 * s, 64 * s); //body
            ctx.drawImage(colorizationCanvas, 192 * s, 32 * s, 64 * s, 32 * s, 24 * s, 32 * s, 64 * s, 30 * s); //front feet
            ctx.drawImage(colorizationCanvas, 64 * s, 96 * s, 32 * s, 32 * s, 39 * s, 18 * s, 26 * s, 26 * s); //left eye

            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(colorizationCanvas, 64 * s, 96 * s, 32 * s, 32 * s, -73 * s, 18 * s, 26 * s, 26 * s);
            ctx.restore();

            return canvas;
        };

        loadImage();
    }, [skinName, bodyColor, feetColor, colorFormat]);
    const handleClick = () => {
        let command = `player_skin ${skinName};`;

        if (bodyColor && feetColor) {
            command += ` player_color_body ${bodyColor}; player_color_feet ${feetColor}; player_use_custom_color 1`;
        }

        navigator.clipboard.writeText(command)
            .then(() => {
                console.log('Command copied to clipboard:', command);
                alert('Command copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy command: ', err);
                alert('Failed to copy command. Check console for details.');
            });
    };
    return (
        <div
            ref={containerRef}
            className="TeeRenderer-tee"
            style={{fontSize: '1px', width: '96em', height: '96em'}}
        >
            {teeImage && (
                <img src={teeImage} alt="Tee" onClick={handleClick} style={{cursor: 'pointer'}}/>

            )}
        </div>
    );
};

export default TeeRenderer;