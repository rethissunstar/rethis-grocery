
import { checkAndUpdateApiUsage } from "@/utils/checkApiUsage";

export const processBarcode = async ({ code, ENABLE_FETCH }) => {
  if (!ENABLE_FETCH) {
    console.log("🔌 Fetch is disabled. Using mock data.");
    if (code === "710425595028") {
      return { title: "Borderlands 3 for Xbox", brand: "2K", images: [] };
    } else {
      return null;
    }
  }

  if (!checkAndUpdateApiUsage()) {
    return { error: "⚠️ Daily UPC lookup limit reached (100). Try again tomorrow." };
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
        console.log("📦 Full response object from UPC API:", data); // This logs everything
        const item = data.items[0];
        return item;
      } else {
        console.log("ℹ️ UPC API returned no items. Full response:", data);
        return null;
      }
      
  } catch (err) {
    console.error("❌ Error fetching UPC info:", err);
    return { error: "❌ Server error while fetching UPC info." };
  }
};
