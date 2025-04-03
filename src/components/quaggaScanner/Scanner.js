// import { useCallback, useLayoutEffect } from 'react';
// import PropTypes from 'prop-types';
// import Quagga from '@ericblade/quagga2';

// function getMedian(arr) {
//     const newArr = [...arr]; // copy the array before sorting, otherwise it mutates the array passed in, which is generally undesireable
//     newArr.sort((a, b) => a - b);
//     const half = Math.floor(newArr.length / 2);
//     if (newArr.length % 2 === 1) {
//         return newArr[half];
//     }
//     return (newArr[half - 1] + newArr[half]) / 2;
// }

// function getMedianOfCodeErrors(decodedCodes) {
//     const errors = decodedCodes.flatMap(x => x.error);
//     const medianOfErrors = getMedian(errors);
//     return medianOfErrors;
// }

// const defaultConstraints = {
//     width: 640,
//     height: 480,
// };

// const defaultLocatorSettings = {
//     patchSize: 'medium',
//     halfSample: true,
//     willReadFrequently: true,
// };

// const defaultDecoders = ['ean_reader'];

// const Scanner = ({
//     onDetected,
//     scannerRef,
//     onScannerReady,
//     cameraId,
//     facingMode,
//     constraints = defaultConstraints,
//     locator = defaultLocatorSettings,
//     decoders = defaultDecoders,
//     locate = true,
// }) => {
//     const errorCheck = useCallback((result) => {
//         if (!onDetected) {
//             return;
//         }
//         const err = getMedianOfCodeErrors(result.codeResult.decodedCodes);
//         // if Quagga is at least 75% certain that it read correctly, then accept the code.
//         if (err < 0.25) {
//             onDetected(result.codeResult.code);
//         }
//     }, [onDetected]);

//     const handleProcessed = (result) => {
//         const drawingCtx = Quagga.canvas.ctx.overlay;
//         const drawingCanvas = Quagga.canvas.dom.overlay;
//         drawingCtx.font = "24px Arial";
//         drawingCtx.fillStyle = 'green';

//         if (result) {
//             // console.warn('* quagga onProcessed', result);
//             if (result.boxes) {
//                 drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
//                 result.boxes.filter((box) => box !== result.box).forEach((box) => {
//                     Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'purple', lineWidth: 2 });
//                 });
//             }
//             if (result.box) {
//                 Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: 'blue', lineWidth: 2 });
//             }
//             if (result.codeResult && result.codeResult.code) {
//                 // const validated = barcodeValidator(result.codeResult.code);
//                 // const validated = validateBarcode(result.codeResult.code);
//                 // Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: validated ? 'green' : 'red', lineWidth: 3 });
//                 drawingCtx.font = "24px Arial";
//                 // drawingCtx.fillStyle = validated ? 'green' : 'red';
//                 // drawingCtx.fillText(`${result.codeResult.code} valid: ${validated}`, 10, 50);
//                 drawingCtx.fillText(result.codeResult.code, 10, 20);
//                 // if (validated) {
//                 //     onDetected(result);
//                 // }
//             }
//         }
//     };

//     useLayoutEffect(() => {
//         // if this component gets unmounted in the same tick that it is mounted, then all hell breaks loose,
//         // so we need to wait 1 tick before calling init().  I'm not sure how to fix that, if it's even possible,
//         // given the asynchronous nature of the camera functions, the non asynchronous nature of React, and just how
//         // awful browsers are at dealing with cameras.
//         let ignoreStart = false;
//         const init = async () => {
//             // wait for one tick to see if we get unmounted before we can possibly even begin cleanup
//             await new Promise((resolve) => setTimeout(resolve, 1));
//             if (ignoreStart) {
//                 return;
//             }
//             // begin scanner initialization
//             await Quagga.init({
//                 inputStream: {
//                     type: 'LiveStream',
//                     constraints: {
//                         ...constraints,
//                         ...(cameraId && { deviceId: cameraId }),
//                         ...(!cameraId && { facingMode }),
//                     },
//                     target: scannerRef.current,
//                     willReadFrequently: true,
//                 },
//                 locator,
//                 decoder: { readers: decoders },
//                 locate,
//             }, async (err) => {
//                 Quagga.onProcessed(handleProcessed);

//                 if (err) {
//                     return console.error('Error starting Quagga:', err);
//                 }
//                 if (scannerRef && scannerRef.current) {
//                     await Quagga.start();
//                     if (onScannerReady) {
//                         onScannerReady();
//                     }
//                 }
//             });
//             Quagga.onDetected(errorCheck);
//         };
//         init();
//         // cleanup by turning off the camera and any listeners
//         return () => {
//             ignoreStart = true;
//             Quagga.stop();
//             Quagga.offDetected(errorCheck);
//             Quagga.offProcessed(handleProcessed);
//         };
//     }, [cameraId, onDetected, onScannerReady, scannerRef, errorCheck, constraints, locator, decoders, locate, facingMode]);
//     return null;
// }

// Scanner.propTypes = {
//     onDetected: PropTypes.func.isRequired,
//     scannerRef: PropTypes.object.isRequired,
//     onScannerReady: PropTypes.func,
//     cameraId: PropTypes.string,
//     facingMode: PropTypes.string,
//     constraints: PropTypes.object,
//     locator: PropTypes.object,
//     decoders: PropTypes.array,
//     locate: PropTypes.bool,
// };

// export default Scanner;

import { useCallback, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import Quagga from '@ericblade/quagga2';

function getMedian(arr) {
    const newArr = [...arr];
    newArr.sort((a, b) => a - b);
    const half = Math.floor(newArr.length / 2);
    if (newArr.length % 2 === 1) {
        return newArr[half];
    }
    return (newArr[half - 1] + newArr[half]) / 2;
}

function getMedianOfCodeErrors(decodedCodes) {
    const errors = decodedCodes.flatMap(x => x.error);
    const medianOfErrors = getMedian(errors);
    return medianOfErrors;
}

const defaultConstraints = {
    width: 640,
    height: 480,
};

const defaultLocatorSettings = {
    patchSize: 'medium',
    halfSample: true,
    willReadFrequently: true,
};

const defaultDecoders = [
    'upc_reader',
  
  ];

const Scanner = ({
    onDetected,
    scannerRef,
    onScannerReady,
    cameraId,
    facingMode,
    constraints = defaultConstraints,
    locator = defaultLocatorSettings,
    decoders = defaultDecoders,
    locate = true,
}) => {
    const errorCheck = useCallback((result) => {
        if (!onDetected) {
            return;
        }
        // console.log("📸 Detected raw result:", result);
        const err = getMedianOfCodeErrors(result.codeResult.decodedCodes);
        // console.log("📉 Median error:", err);
        if (err < 0.25) {
            console.log("✅ Code accepted:", result.codeResult.code);
            onDetected(result.codeResult.code);
        } else {
            console.warn("❌ Code rejected due to high error:", err);
        }
    }, [onDetected]);

    const handleProcessed = (result) => {
        // console.log("📷 Frame processed:", result);

        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        drawingCtx.font = "24px Arial";
        drawingCtx.fillStyle = 'green';

        if (result) {
            if (result.boxes) {
                result.boxes.forEach((box, i) => {
                    console.log(`📦 Box ${i}:`, box.map(([x, y]) => `(${x.toFixed(0)}, ${y.toFixed(0)})`).join(" - "));
                  });
                  
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
                result.boxes.filter((box) => box !== result.box).forEach((box) => {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'purple', lineWidth: 2 });
                });
            }
            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: 'blue', lineWidth: 2 });
            }
            if (result.codeResult && result.codeResult.code) {
                drawingCtx.font = "24px Arial";
                drawingCtx.fillText(result.codeResult.code, 10, 20);
            }
        }
    };

    useLayoutEffect(() => {
        let ignoreStart = false;
        const init = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1));
            if (ignoreStart) {
                return;
            }

            await Quagga.init({
                inputStream: {
                    type: 'LiveStream',
                    constraints: {
                        ...constraints,
                        ...(cameraId && { deviceId: cameraId }),
                        ...(!cameraId && { facingMode }),
                    },
                    target: scannerRef.current,
                    willReadFrequently: true,
                },
                locator,
                decoder: { readers: decoders },
                locate,
            }, async (err) => {
                Quagga.onProcessed(handleProcessed);

                if (err) {
                    return console.error('Error starting Quagga:', err);
                }
                if (scannerRef && scannerRef.current) {
                    await Quagga.start();

                    const video = scannerRef.current.querySelector("video");
                    if (video) {
                        video.style.position = "absolute";
                        video.style.top = "0";
                        video.style.left = "0";
                        video.style.width = "640px";
                        video.style.height = "480px";
                        video.style.objectFit = "cover";
                        video.style.zIndex = "1";
                    }

                    if (onScannerReady) {
                        onScannerReady();
                    }
                }
            });
            Quagga.onDetected(errorCheck);
        };
        init();

        return () => {
            ignoreStart = true;
            Quagga.stop();
            Quagga.offDetected(errorCheck);
            Quagga.offProcessed(handleProcessed);
        };
    }, [cameraId, onDetected, onScannerReady, scannerRef, errorCheck, constraints, locator, decoders, locate, facingMode]);
    return null;
}

Scanner.propTypes = {
    onDetected: PropTypes.func.isRequired,
    scannerRef: PropTypes.object.isRequired,
    onScannerReady: PropTypes.func,
    cameraId: PropTypes.string,
    facingMode: PropTypes.string,
    constraints: PropTypes.object,
    locator: PropTypes.object,
    decoders: PropTypes.array,
    locate: PropTypes.bool,
};

export default Scanner;
