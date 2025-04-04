import React, { useState, useRef, useEffect, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import Scanner from './Scanner';
import Result from './Result';
import { Button } from '../Button';
import { useSetAtom, useAtom } from 'jotai';
import { upcAtom } from '@/store/ListRoute';
import { processBarcode } from './utilsScanner';

const QuaggaScanner = () => {
    const [scanning, setScanning] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [cameraId, setCameraId] = useState(null);
    const [cameraError, setCameraError] = useState(null);
    const [results, setResults] = useState([]);
    const [torchOn, setTorch] = useState(false);
    const scannerRef = useRef(null);
    const [upc, setUPC] = useAtom(upcAtom);
    const ENABLE_FETCH = true;
    const [scannedItems, setScannedItems] = useState([]);
    const [statusMessage, setStatusMessage] = useState(null);

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

    const handleDetected = (code) => {
        console.log("✅ Scanned:", code);
        setResults((prev) => [...prev, { codeResult: { code } }]);
        setUPC(code);
        setScanning(false);
        setStatusMessage(null);
    };

    const handleScanClick = async () => {
        setStatusMessage("🔍 Checking UPC...");
        console.log("🔎 Checking UPC:", upc);

        const cached = localStorage.getItem(`upc-${upc}`);
        if (cached) {
            const item = JSON.parse(cached);
            console.log("📦 Cached item found:", item);
            setScannedItems((prev) => [...prev, item]);
            setStatusMessage("📦 Found cached result");
            return;
        }

        const result = await processBarcode({ code: upc, ENABLE_FETCH });
        if (result) {
            console.log("📦 New item fetched:", result);
            localStorage.setItem(`upc-${upc}`, JSON.stringify(result));
            setScannedItems((prev) => [...prev, result]);
            setStatusMessage("✅ Item found and stored");
        } else {
            console.warn("❌ No result for scanned UPC");
            setStatusMessage("❌ No result found for this UPC");
        }
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
            <Button onClick={() => setScanning(!scanning)}>{scanning ? 'Stop' : 'Start'}</Button>

            {!scanning && (
                <div className="mt-4 space-y-2">
                    <div className="flex w-full items-center rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <input
                            type="text"
                            value={upc}
                            onChange={(e) => setUPC(e.target.value)}
                            placeholder="Enter or scan UPC"
                            className="flex-1 px-3 py-2 text-base focus:outline-none"
                        />
                        <Button
                            onClick={handleScanClick}
                            className="bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none"
                        >
                            Check
                        </Button>
                    </div>

                    {upc && (
                        <Button
                            className="w-full bg-gray-300 text-black"
                            onClick={() => {
                                setUPC("");
                                setScanning(true);
                                setStatusMessage(null);
                            }}
                        >
                            🔄 Rescan
                        </Button>
                    )}

                    {statusMessage && <p className="text-sm text-gray-500 italic mt-2">{statusMessage}</p>}
                </div>
            )}

            {scannedItems.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold">Scanned Items</h3>
                    {scannedItems.map((item, idx) => {
                        const samePrice = item.highest_recorded_price === item.lowest_recorded_price;
                        return (
                            <div key={idx} className="p-2 border rounded bg-white">
                                <p><strong>{item.title}</strong></p>
                                <p className="text-sm text-gray-600">{item.brand}</p>
                                {item.images?.[0] && <img src={item.images[0]} alt={item.title} className="mx-auto max-h-32 mt-2" />}
                                {item.lowest_recorded_price && item.highest_recorded_price && (
                                    <p className="text-sm text-gray-700 mt-1">
                                        Price: {samePrice ? `$${item.lowest_recorded_price}` : `$${item.lowest_recorded_price} – $${item.highest_recorded_price}`}
                                    </p>
                                )}
                            </div>
                        );
                    })}
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
