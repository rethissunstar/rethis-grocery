"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Quagga from "@ericblade/quagga2";

export default function BarcodeScanner() {
  const [result, setResult] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraId, setCameraId] = useState(null);
  const [cameras, setCameras] = useState([]);
  const scannerRef = useRef(null);

  useLayoutEffect(() => {
    const setupCameras = async () => {
      await Quagga.CameraAccess.request(null);
      await Quagga.CameraAccess.release();
      const devices = await Quagga.CameraAccess.enumerateVideoDevices();
      setCameras(devices);
    //   await Quagga.CameraAccess.disableTorch();
    };
    setupCameras();
  }, []);

  useLayoutEffect(() => {
    let ignoreStart = false;

    const resizeCanvas = () => {
      const canvas = Quagga.canvas.dom.overlay;
      const video = scannerRef.current?.querySelector("video");
      if (canvas) {
        const width = 400;
        const height = 480;

        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      if (video) {
        video.width = 400;
        video.height = 480;
        video.style.width = "400px";
        video.style.height = "480px";
      }
    };

    const init = async () => {
      await new Promise((res) => setTimeout(res, 1));
      if (ignoreStart) return;

      await Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            ...(cameraId ? { deviceId: cameraId } : { facingMode: "environment" }),
            width: { ideal: 400 },
            height: { ideal: 480 },
          },
          area: {
            top: "0%",
            right: "0%",
            left: "0%",
            bottom: "0%",
          },
          singleChannel: false,
          willReadFrequently: true,
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
          willReadFrequently: true,
        },
        decoder: {
          readers: ["upc_reader", "ean_reader"],
        },
        locate: true,
        debug: {
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
          showPattern: true,
        },
      }, async (err) => {
        if (err) {
          console.error("Quagga init error:", err);
          return;
        }

        Quagga.onProcessed((result) => {
          const canvas = Quagga.canvas.dom.overlay;
          const ctx = Quagga.canvas.ctx.overlay;
          if (!result || !canvas || !ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (result.boxes) {
            result.boxes.filter((b) => b !== result.box).forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, ctx, {
                color: "purple",
                lineWidth: 2,
              });
            });
          }

          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, {
              color: "blue",
              lineWidth: 2,
            });
          }

          if (result.codeResult?.code) {
            ctx.font = "24px Arial";
            ctx.fillStyle = "green";
            ctx.fillText(result.codeResult.code, 10, 20);
          }
        });

        Quagga.onDetected((data) => {
          console.log("📦 Full Quagga result:", data);
          const rawCode = data?.codeResult?.code;
          if (!rawCode) return;

          const cleanedCode = rawCode.replace(/[^\d]/g, "");

          if (cleanedCode.length === 12) {
            Quagga.stop();
            setResult(cleanedCode);
            setProcessed(`📦 Scanned code: ${cleanedCode}`);
          } else {
            console.warn("⚠️ Ignored invalid scan:", cleanedCode);
          }
        });

        await Quagga.start();
        resizeCanvas();
        // window.addEventListener("resize", resizeCanvas);
        console.log("✅ Quagga started");
      });
    };

    init();

    return () => {
      ignoreStart = true;
      Quagga.stop();
      Quagga.offDetected();
      Quagga.offProcessed();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [cameraId]);

  return (
    <div className="space-y-4 text-center">
      <div className="flex flex-col items-center gap-2">
        {/* <button
          onClick={toggleTorch}
          className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded"
        >
          {torchOn ? "🔦 Torch On" : "💡 Torch Off"}
        </button> */}
        <select
          onChange={(e) => setCameraId(e.target.value)}
          className="px-2 py-1 border rounded"
        >
          <option value="">Default (Back Camera)</option>
          {cameras.map((cam) => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || cam.deviceId}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={scannerRef}
        className="relative w-full max-w-md mx-auto border-2 border-blue-500 rounded"
        style={{ width: "300px", height: "300px" }}
      ></div>

      {result && <p className="text-green-600">Raw Code: {result}</p>}
      {processed && <p className="text-blue-600">{processed}</p>}
    </div>
  );
}


// "use client";

// import { useState, useRef, useLayoutEffect, useCallback } from "react";
// import Quagga from "@ericblade/quagga2";

// export default function BarcodeScanner() {
//   const [result, setResult] = useState(null);
//   const [processed, setProcessed] = useState(null);
//   const [torchOn, setTorch] = useState(false);
//   const [cameraId, setCameraId] = useState(null);
//   const [cameras, setCameras] = useState([]);
//   const scannerRef = useRef(null);

//   useLayoutEffect(() => {
//     const setupCameras = async () => {
//       await Quagga.CameraAccess.request(null, {});
//       await Quagga.CameraAccess.release();
//       const devices = await Quagga.CameraAccess.enumerateVideoDevices();
//       setCameras(devices);
//     //   await Quagga.CameraAccess.disableTorch();
//     };
//     setupCameras();
//   }, []);

// //   const toggleTorch = () => {
// //     const next = !torchOn;
// //     setTorch(next);
// //     next ? Quagga.CameraAccess.enableTorch() : Quagga.CameraAccess.disableTorch();
// //   };

//   const getMedian = (arr) => {
//     const sorted = [...arr].sort((a, b) => a - b);
//     const mid = Math.floor(sorted.length / 2);
//     return sorted.length % 2 !== 0
//       ? sorted[mid]
//       : (sorted[mid - 1] + sorted[mid]) / 2;
//   };

//   const getMedianOfCodeErrors = (decodedCodes) => {
//     const errors = decodedCodes.flatMap((x) => x.error).filter((e) => e !== undefined);
//     return getMedian(errors);
//   };

//   const handleDetection = useCallback((data) => {
//     const err = getMedianOfCodeErrors(data.codeResult.decodedCodes);
//     const raw = data.codeResult.code;
//     if (err < 0.25 && raw) {
//       const cleaned = raw.replace(/[^\d]/g, "");
//       if (cleaned.length === 12) {
//         Quagga.stop();
//         setResult(cleaned);
//         setProcessed(`\u{1F4E6} Scanned code: ${cleaned}`);
//       }
//     }
//   }, []);

//   const handleProcessed = (result) => {
//     // console.log("this is the result", result)
//     if (!result) return;
//     const canvas = Quagga?.canvas?.dom?.overlay;
//     const ctx = Quagga?.canvas?.ctx?.overlay;
//     console.log(" this is the canvas and ctx", canvas, ctx)
//     if (!canvas || !ctx) return;

//     ctx.clearRect(
//       0,
//       0,
//       parseInt(canvas.getAttribute("width")),
//       parseInt(canvas.getAttribute("height"))
//     );

//     if (result.boxes) {
//       result.boxes
//         .filter((b) => b !== result.box)
//         .forEach((box) => {
//           Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, ctx, {
//             color: "purple",
//             lineWidth: 2,
//           });
//         });
//     }

//     if (result.box) {
//       Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, {
//         color: "blue",
//         lineWidth: 2,
//       });
//     }

//     if (result.codeResult?.code) {
//       ctx.font = "24px Arial";
//       ctx.fillStyle = "green";
//       ctx.fillText(result.codeResult.code, 10, 20);
//     }
//   };

//   useLayoutEffect(() => {
//     let ignoreStart = false;
//     let resizeCanvas;

//     const init = async () => {
//       await new Promise((res) => setTimeout(res, 1));
//       if (ignoreStart) return;

//       await Quagga.init({
//         inputStream: {
//           type: "LiveStream",
//           constraints: {
//             ...(cameraId ? { deviceId: cameraId } : { facingMode: "environment" }),
        
//           },
//           target: scannerRef.current,
//           willReadFrequently: true,
//         },
//         locator: {
//           patchSize: "medium",
//           halfSample: true,
//           willReadFrequently: true,
//         },
//         decoder: {
//           readers: ["upc_reader", "ean_reader"],
//         },
//         locate: true,
//         debug: {
//           drawBoundingBox: true,
//           showFrequency: true,
//           drawScanline: true,
//           showPattern: true,
//         },
//       }, async (err) => {
//         if (err) {
//           console.error("Quagga init error:", err);
//           return;
//         }
//         Quagga.onProcessed(handleProcessed);
//         Quagga.onDetected((data) => {
//             console.log("📦 Full Quagga result:", data);
//             const rawCode = data?.codeResult?.code;
          
//             if (!rawCode) return;
          
//             const cleanedCode = rawCode.replace(/[^\d]/g, "");
          
//             if (cleanedCode.length === 12) {
//               Quagga.stop();
//               setResult(cleanedCode);
//               processBarcode(cleanedCode);
//             } else {
//               console.warn("⚠️ Ignored invalid scan:", cleanedCode);
//             }
//           });
          
//         await Quagga.start();

//         // checking the camera stream
// //         const track = Quagga.CameraAccess.getActiveTrack();
// // console.log("📷 Camera resolution:", track);

//         resizeCanvas = () => {
//             const canvas = Quagga.canvas.dom.overlay;
//             // const container = scannerRef.current;
//             console.log("this is the canvas", canvas)
//             // console.log("this is container object", container)
//             // console.log("this is the scannerRef.current", scannerRef)
//             // if (canvas && container) {
//                 if (canvas ) {
//             //   const width = container.offsetWidth;
//             //   const height = container.offsetHeight;
//             //   console.log("this is the width of the canvas", width)
//             //   console.log("this is the height of the canvas", height)
          
//             //   canvas.width = width;
//             //   canvas.height = height;
//             //   canvas.style.width = `${width}px`;
//             //   canvas.style.height = `${height}px`;
//             const width = 640;
//             const height = 480;
        
//             console.log("🧱 Forcing canvas to 640x480");
        
//             canvas.width = width;
//             canvas.height = height;
//             canvas.style.width = `${width}px`;
//             canvas.style.height = `${height}px`;
//             }
//           };
          
   
          

//         resizeCanvas();
//         window.addEventListener("resize", resizeCanvas);

//         console.log("✅ Quagga started");
//       });
//     };

//     init();

//     return () => {
//       ignoreStart = true;
//       Quagga.stop();
//       Quagga.offDetected(handleDetection);
//       Quagga.offProcessed(handleProcessed);
//       window.removeEventListener("resize", resizeCanvas);
//     };
//   }, [cameraId, handleDetection]);

//   return (
//     <div className="space-y-4 text-center">
//       <div className="flex flex-col items-center gap-2">
//         {/* <button
//           onClick={toggleTorch}
//           className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded"
//         >
//           {torchOn ? "🔦 Torch On" : "💡 Torch Off"}
//         </button> */}
//         <select
//           onChange={(e) => setCameraId(e.target.value)}
//           className="px-2 py-1 border rounded"
//         >
//           <option value="">Default (Back Camera)</option>
//           {cameras.map((cam) => (
//             <option key={cam.deviceId} value={cam.deviceId}>
//               {cam.label || cam.deviceId}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div
//         ref={scannerRef}
//         className="relative w-full max-w-md mx-auto border-2 border-blue-500 rounded"
//         style={{ aspectRatio: "4 / 3" }}
//       />

//       {result && <p className="text-green-600">Raw Code: {result}</p>}
//       {processed && <p className="text-blue-600">{processed}</p>}
//     </div>
//   );
// }