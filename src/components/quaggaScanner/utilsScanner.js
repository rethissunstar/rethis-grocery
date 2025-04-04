//   const processBarcode = async (code) => {
//     if (!ENABLE_FETCH) {
//       console.log("🔌 Fetch is disabled. Using mock data.");
//       if (code === "710425595028") {
//         setProcessed("✅ This is a UPC for: Borderlands 3 for Xbox");
//       } else {
//         setProcessed("ℹ️ No known match for this UPC.");
//       }
//       return;
//     }
  
//     if (!checkAndUpdateApiUsage()) {
//       setProcessed("⚠️ Daily UPC lookup limit reached (100). Try again tomorrow.");
//       return;
//     }
  
//     try {
//       const response = await fetch("/api/upc", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ upc: code }),
//       });
  
//       const data = await response.json();
  
//       if (data?.items?.length > 0) {
//         const item = data.items[0];
//         setProcessed(`✅ Found: ${item.title} by ${item.brand}`);
//       } else {
//         setProcessed("ℹ️ No known match found on UPCItemDB.");
//       }
//     } catch (err) {
//       console.error("❌ Error fetching UPC info:", err);
//       setProcessed("❌ Server error while fetching UPC info.");
//     }
//   };
  

// utils/processBarcode.js

import { checkAndUpdateApiUsage } from '@/utils/checkApiUsage';

export const processBarcode = async ({
  code,
  setProcessed,
  ENABLE_FETCH = true,
}) => {
  if (!ENABLE_FETCH) {
    console.log("\ud83d\udd0c Fetch is disabled. Using mock data.");
    if (code === "710425595028") {
      setProcessed("\u2705 This is a UPC for: Borderlands 3 for Xbox");
    } else {
      setProcessed("\u2139\ufe0f No known match for this UPC.");
    }
    return;
  }

  if (!checkAndUpdateApiUsage()) {
    setProcessed("\u26a0\ufe0f Daily UPC lookup limit reached (100). Try again tomorrow.");
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
      setProcessed(`\u2705 Found: ${item.title} by ${item.brand}`);
    } else {
      setProcessed("\u2139\ufe0f No known match found on UPCItemDB.");
    }
  } catch (err) {
    console.error("\u274c Error fetching UPC info:", err);
    setProcessed("\u274c Server error while fetching UPC info.");
  }
};
