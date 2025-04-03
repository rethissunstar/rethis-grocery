// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import Quagga from '@ericblade/quagga2';
// import Scanner from './Scanner';
// import Result from './Result';
// import { Button } from '../Button';
// import { useSetAtom } from 'jotai';
// import { upcAtom } from '@/store/atoms';

// const QuaggaScanner = () => {
//     const [scanning, setScanning] = useState(false); // toggleable state for "should render scanner"
//     const [cameras, setCameras] = useState([]); // array of available cameras, as returned by Quagga.CameraAccess.enumerateVideoDevices()
//     const [cameraId, setCameraId] = useState(null); // id of the active camera device
//     const [cameraError, setCameraError] = useState(null); // error message from failing to access the camera
//     const [results, setResults] = useState([]); // list of scanned results
//     const [torchOn, setTorch] = useState(false); // toggleable state for "should torch be on"
//     const scannerRef = useRef(null); // reference to the scanner element in the DOM

//     // at start, we need to get a list of the available cameras.  We can do that with Quagga.CameraAccess.enumerateVideoDevices.
//     // HOWEVER, Android will not allow enumeration to occur unless the user has granted camera permissions to the app/page.
//     // AS WELL, Android will not ask for permission until you actually try to USE the camera, just enumerating the devices is not enough to trigger the permission prompt.
//     // THEREFORE, if we're going to be running in Android, we need to first call Quagga.CameraAccess.request() to trigger the permission prompt.
//     // AND THEN, we need to call Quagga.CameraAccess.release() to release the camera so that it can be used by the scanner.
//     // AND FINALLY, we can call Quagga.CameraAccess.enumerateVideoDevices() to get the list of cameras.

//     // Normally, I would place this in an application level "initialization" event, but for this demo, I'm just going to put it in a useEffect() hook in the App component.

//     useEffect(() => {
//         const enableCamera = async () => {
//             await Quagga.CameraAccess.request(null, {});
//         };
//         const disableCamera = async () => {
//             await Quagga.CameraAccess.release();
//         };
//         const enumerateCameras = async () => {
//             const cameras = await Quagga.CameraAccess.enumerateVideoDevices();
//             console.log('Cameras Detected: ', cameras);
//             return cameras;
//         };
//         enableCamera()
//         .then(disableCamera)
//         .then(enumerateCameras)
//         .then((cameras) => setCameras(cameras))
//         .then(() => Quagga.CameraAccess.disableTorch()) // disable torch at start, in case it was enabled before and we hot-reloaded
//         .catch((err) => setCameraError(err));
//         return () => disableCamera();
//     }, []);

//     // provide a function to toggle the torch/flashlight
//     const onTorchClick = useCallback(() => {
//         const torch = !torchOn;
//         setTorch(torch);
//         if (torch) {
//             Quagga.CameraAccess.enableTorch();
//         } else {
//             Quagga.CameraAccess.disableTorch();
//         }
//     }, [torchOn, setTorch]);

//     return (
//         <div>
//             {cameraError ? <p>ERROR INITIALIZING CAMERA ${JSON.stringify(cameraError)} -- DO YOU HAVE PERMISSION?</p> : null}
//             {cameras.length === 0 ? <p>Enumerating Cameras, browser may be prompting for permissions beforehand</p> :
//                 <form>
//                     <select onChange={(event) => setCameraId(event.target.value)}>
//                         {cameras.map((camera) => (
//                             <option key={camera.deviceId} value={camera.deviceId}>
//                                 {camera.label || camera.deviceId}
//                             </option>
//                         ))}
//                     </select>
//                 </form>
//             }
//             <Button className={"m-4"} onClick={onTorchClick}>{torchOn ? 'Disable Torch' : 'Enable Torch'}</Button>
//             <Button onClick={() => setScanning(!scanning) }>{scanning ? 'Stop' : 'Start'}</Button>
//             <ul className="results">
//                 {results.map((result) => (result.codeResult && <Result key={result.codeResult.code} result={result} />))}
//             </ul>
//             <div ref={scannerRef} style={{position: 'relative', border: '3px solid red'}}>
//                 <video style={{ width: window.innerWidth, height: 480, border: '3px solid orange' }}/>
//                 <canvas className="drawingBuffer" style={{
//                     position: 'absolute',
//                     top: '0px',
//                     // left: '0px',
//                     // height: '100%',
//                     // width: '100%',
//                     border: '3px solid green',
//                 }} width="640" height="480" />
//                 {scanning ? <Scanner scannerRef={scannerRef} cameraId={cameraId} onDetected={(result) => {
//   console.log("✅ Scanned:", result);
//   setResults([...results, result]);
// }}
//  /> : null}
//             </div>
//         </div>
//     );
// };

// export default QuaggaScanner;

import { useCallback, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import Quagga from '@ericblade/quagga2';
import { useSetAtom } from 'jotai';
import { upcAtom } from '@/store/atoms';

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

const defaultDecoders = ['upc_reader'];

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
    const setUPC = useSetAtom(upcAtom);

    const errorCheck = useCallback((result) => {
        if (!onDetected) return;

        console.log("📸 Detected raw result:", result);
        const err = getMedianOfCodeErrors(result.codeResult.decodedCodes);
        console.log("📉 Median error:", err);

        if (err < 0.25) {
            const rawCode = result.codeResult.code;
            console.log("✅ Code accepted:", rawCode);
            setUPC(rawCode); // ✅ Set global UPC atom
            Quagga.stop(); // ✅ Stop camera after successful scan
            onDetected(rawCode); // 🔁 Notify parent if needed
        } else {
            console.warn("❌ Code rejected due to high error:", err);
        }
    }, [onDetected, setUPC]);

    const handleProcessed = (result) => {
        console.log("📷 Frame processed:", result);
        if (result.boxes) {
            result.boxes.forEach((box, i) => {
                console.log(`📦 Box ${i}:`, box.map(([x, y]) => `(${x.toFixed(0)}, ${y.toFixed(0)})`).join(" - "));
            });
        }

        const drawingCtx = Quagga.canvas.ctx.overlay;
        const drawingCanvas = Quagga.canvas.dom.overlay;
        drawingCtx.font = "24px Arial";
        drawingCtx.fillStyle = 'green';

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute('width')), parseInt(drawingCanvas.getAttribute('height')));
                result.boxes.filter((box) => box !== result.box).forEach((box) => {
                    Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: 'lime', lineWidth: 2 });
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
            if (ignoreStart) return;

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
};

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
