// import React, { useState } from "react";

// export default function Tabs({ tabs = [], initial = 0 }) {
//   const [active, setActive] = useState(initial);

//   return (
//     <div className="w-full">
//       <div className="grid grid-cols-2 gap-2 mb-4">
//         {tabs.map((tab, index) => (
//           <button
//             key={tab.label}
//             onClick={() => setActive(index)}
//             className={`w-full py-3 text-lg font-semibold rounded-md transition ${
//               index === active
//                 ? "bg-green-800 text-white"
//                 : "bg-gray-200 text-gray-700"
//             }`}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       <div className="w-full">{tabs[active]?.content}</div>
//     </div>
//   );
// }

import React, { useState } from "react";

export default function Tabs({ tabs = [], initial = 0, onTabChange }) {
  const [active, setActive] = useState(initial);

  const handleTabClick = (index) => {
    setActive(index);
    if (typeof onTabChange === "function") {
      onTabChange(index); // ✅ notify parent
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-2 mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            onClick={() => handleTabClick(index)}
            className={`w-full py-3 text-lg font-semibold rounded-md transition ${
              index === active
                ? "bg-green-800 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full">{tabs[active]?.content}</div>
    </div>
  );
}
