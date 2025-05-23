"use client";

import { useEffect, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { checkAndUpdateApiUsage } from "@/utils/checkApiUsage";

export default function StaticImageBarcodeScanner() {
  const [result, setResult] = useState(null);
  const [processed, setProcessed] = useState(null);
  const [error, setError] = useState(null);

  const ENABLE_FETCH = false; // 🔄 set to true when ready to use the API

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();

    const scan = async () => {
      let result;
      try {
        result = await codeReader.decodeFromImageUrl("/IMG_2359.JPG");
        console.log("✅ Barcode detected:", result);
        const code = result?.getText() || "710425595028";
        setResult(code);
        setError(null);
        processBarcode(code);
      } catch (err) {
        console.warn("❌ No barcode detected:", err.message);
        console.log("Fallback to hardcoded code.");
        setError("No barcode detected");
        setResult(null);
        processBarcode("710425595028");
      }
    };

    scan();
  }, []);

  const processBarcode = async (code) => {
    if (!ENABLE_FETCH) {
      console.log("🔌 Fetch is disabled. Using mock data.");
      if (code === "710425595028") {
        setProcessed("✅ This is a UPC for: Borderlands 3 for Xbox");
      } else {
        setProcessed("ℹ️ No known match for this UPC.");
      }
      return;
    }
  
    if (!checkAndUpdateApiUsage()) {
      setProcessed("⚠️ Daily UPC lookup limit reached (100). Try again tomorrow.");
      return;
    }
  
    try {
      const response = await fetch("/api/upc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ upc: code }),
      });
  
      const data = await response.json();
  
      if (data?.items?.length > 0) {
        const item = data.items[0];
        setProcessed(`✅ Found: ${item.title} by ${item.brand}`);
      } else {
        setProcessed("ℹ️ No known match found on UPCItemDB.");
      }
    } catch (err) {
      console.error("❌ Error fetching UPC info:", err);
      setProcessed("❌ Server error while fetching UPC info.");
    }
  };
  

  return (
    <div className="space-y-4 text-center">
      <img
        src="/IMG_2359.JPG"
        alt="Test barcode"
        className="max-w-xs mx-auto border rounded"
      />
      {result && <p className="text-green-600">Raw Code: {result}</p>}
      {processed && <p className="text-blue-600">{processed}</p>}
      {error && <p className="text-red-600">❌ {error}</p>}
    </div>
  );
}
