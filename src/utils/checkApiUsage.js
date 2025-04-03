// lib/checkApiUsage.js

export function checkAndUpdateApiUsage(key = "upcApiUsage", dailyLimit = 100) {
    if (typeof window === "undefined") return true; // SSR safety
  
    const today = new Date().toISOString().split("T")[0];
    const usageData = JSON.parse(localStorage.getItem(key) || "{}");
  
    if (usageData.date !== today) {
      const newData = { date: today, count: 1 };
      localStorage.setItem(key, JSON.stringify(newData));
      return true;
    }
  
    if (usageData.count >= dailyLimit) {
      return false;
    }
  
    usageData.count += 1;
    localStorage.setItem(key, JSON.stringify(usageData));
    return true;
  }
  