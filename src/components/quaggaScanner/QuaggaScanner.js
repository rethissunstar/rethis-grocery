import React, { useState, useRef, useEffect, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import Scanner from './Scanner';
import Result from './Result';
import { Button } from '../Button';
import { useSetAtom, useAtom } from 'jotai';
import { upcAtom } from '@/store/ListRoute';

const QuaggaScanner = () => {
    const [scanning, setScanning] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [cameraId, setCameraId] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [results, setResults] = useState([]);
    const [torchOn, setTorch] = useState(false);
    const scannerRef = useRef(null);
    const [upc, setUPC] = useAtom(upcAtom);

    useEffect(() => {
        const enableCamera = async () => {
            await Quagga.CameraAccess.request(null, {});
        };
        const disableCamera = async () => {
            await Quagga.CameraAccess.release();
        };
        const enumerateCameras = async () => {
            const cameras = await Quagga.CameraAccess.enumerateVideoDevices();
            console.log('Cameras Detected: ', cameras);
            return cameras;
        };
        enableCamera()
            .then(disableCamera)
            .then(enumerateCameras)
            .then((cameras) => setCameras(cameras))
            .then(() => Quagga.CameraAccess.disableTorch())
            .catch((err) => setCameraError(err));
        return () => disableCamera();
    }, []);

    const onTorchClick = useCallback(() => {
        const torch = !torchOn;
        setTorch(torch);
        if (torch) {
            Quagga.CameraAccess.enableTorch();
        } else {
            Quagga.CameraAccess.disableTorch();
        }
    }, [torchOn]);

    const handleDetected = (code) => {
        console.log("✅ Scanned:", code);
        setResults((prev) => [...prev, { codeResult: { code } }]);
        setUPC(code);
        setScanning(false);
    };

    return (
        <div className="space-y-4 text-center">
            {cameraError ? <p>ERROR INITIALIZING CAMERA {JSON.stringify(cameraError)} -- DO YOU HAVE PERMISSION?</p> : null}
            {cameras.length === 0 ? <p>Enumerating Cameras, browser may be prompting for permissions beforehand</p> :
                <form>
                    <select onChange={(event) => setCameraId(event.target.value)}>
                        {cameras.map((camera) => (
                            <option key={camera.deviceId} value={camera.deviceId}>
                                {camera.label || camera.deviceId}
                            </option>
                        ))}
                    </select>
                </form>
            }
            <Button className="m-4" onClick={onTorchClick}>{torchOn ? 'Disable Torch' : 'Enable Torch'}</Button>
            <Button onClick={() => setScanning(!scanning)}>{scanning ? 'Stop' : 'Start'}</Button>

            {!scanning && upc && (
  <div className="mt-4 space-y-2">
    <p className="text-gray-600">Scanned UPC:</p>
    <Button
      className="w-full bg-blue-600 text-white"
      onClick={() => {
        console.log("🔎 Check this UPC:", upc);
        // Replace this with your fetch/logic
      }}
    >
      {upc} — Tap to check
    </Button>

    <Button
      className="w-full bg-gray-300 text-black"
      onClick={() => {
        setUPC(""); // Clear UPC
        setScanning(true); // Restart scanning
      }}
    >
      🔄 Rescan
    </Button>
  </div>
)}


            <ul className="results">
                {results.map((result) => (
                    result.codeResult && <Result key={result.codeResult.code} result={result} />
                ))}
            </ul>

            {scanning && (
                <div ref={scannerRef} style={{ position: 'relative', border: '3px solid red' }}>
                    <video style={{ width: window.innerWidth, height: 480, border: '3px solid orange' }} />
                    <canvas className="drawingBuffer" style={{
                        position: 'absolute',
                        top: '0px',
                        border: '3px solid green',
                    }} width="640" height="480" />
                    <Scanner
                        scannerRef={scannerRef}
                        cameraId={cameraId}
                        onDetected={handleDetected}
                    />
                </div>
            )}
        </div>
    );
};

export default QuaggaScanner;


// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import Quagga from '@ericblade/quagga2';
// import Scanner from './Scanner';
// import Result from './Result';
// import { Button } from '../Button';
// import { useSetAtom } from 'jotai';
// import { upcAtom } from '@/store/ListRoute';

// const QuaggaScanner = () => {
//     const [scanning, setScanning] = useState(false);
//     const [cameras, setCameras] = useState([]);
//     const [cameraId, setCameraId] = useState(null);
//     const [cameraError, setCameraError] = useState(null);
//     const [results, setResults] = useState([]);
//     const [torchOn, setTorch] = useState(false);
//     const scannerRef = useRef(null);
//     const setUPC = useSetAtom(upcAtom);

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
//             .then(disableCamera)
//             .then(enumerateCameras)
//             .then((cameras) => setCameras(cameras))
//             .then(() => Quagga.CameraAccess.disableTorch())
//             .catch((err) => setCameraError(err));
//         return () => disableCamera();
//     }, []);

//     const onTorchClick = useCallback(() => {
//         const torch = !torchOn;
//         setTorch(torch);
//         if (torch) {
//             Quagga.CameraAccess.enableTorch();
//         } else {
//             Quagga.CameraAccess.disableTorch();
//         }
//     }, [torchOn]);

//     const handleDetected = (code) => {
//         console.log("✅ Scanned:", code);
//         setResults((prev) => [...prev, { codeResult: { code } }]);
//         setUPC(code);
//         setScanning(false); // stop scanning to hide scanner
//     };

//     return (
//         <div>
//             {cameraError ? <p>ERROR INITIALIZING CAMERA {JSON.stringify(cameraError)} -- DO YOU HAVE PERMISSION?</p> : null}
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
//             <Button onClick={() => setScanning(!scanning)}>{scanning ? 'Stop' : 'Start'}</Button>
//             <ul className="results">
//                 {results.map((result) => (
//                     result.codeResult && <Result key={result.codeResult.code} result={result} />
//                 ))}
//             </ul>
//             <div ref={scannerRef} style={{ position: 'relative', border: '3px solid red' }}>
//                 <video style={{ width: window.innerWidth, height: 480, border: '3px solid orange' }} />
//                 <canvas className="drawingBuffer" style={{
//                     position: 'absolute',
//                     top: '0px',
//                     border: '3px solid green',
//                 }} width="640" height="480" />
//                 {scanning ? (
//                     <Scanner
//                         scannerRef={scannerRef}
//                         cameraId={cameraId}
//                         onDetected={handleDetected}
//                     />
//                 ) : null}
//             </div>
//         </div>
//     );
// };

// export default QuaggaScanner;
