// src/components/PatternPicker.jsx
import React from "react";
import state from "../store";
import { useSnapshot } from "valtio";

const patterns = [
  { id: "pattern1", label: "Pattern 1", decal: "/new1.png" },
  { id: "pattern2", label: "Pattern 2", decal: "/new2.png" },
  { id: "pattern3", label: "Pattern 3", decal: "/new3.png" },
  { id: "pattern4", label: "Pattern 4", decal: "/new4.png" },
  { id: "pattern5", label: "Pattern 5", decal: "/new5.jpeg" },
  { id: "pattern6", label: "Pattern 6", decal: "/new6.jpeg" },
  { id: "pattern7", label: "Pattern 7", decal: "/new7.jpeg" },
  { id: "pattern8", label: "Pattern 8", decal: "/new8.jpeg" },
  { id: "pattern9", label: "Pattern 9", decal: "/new9.jpeg" },
  { id: "pattern10", label: "Pattern 10", decal: "/new10.jpeg" },
  { id: "dots", label: "Pattern 11", decal: "/bigdots.webp" },
  { id: "stripes", label: "Pattern 12", decal: "/stripe.jpg" },
  { id: "circles", label: "Pattern 13", decal: "/circles.png" },
  { id: "smallDots", label: "Pattern 14", decal: "/dot.jpg" },
];

const PatternPicker = () => {
  const snap = useSnapshot(state);

  const handleSelectPattern = (pattern) => {
    if (!state.modelCustomizations[snap.selectedModel]) {
      state.modelCustomizations[snap.selectedModel] = {};
    }

    const modelCustomization = state.modelCustomizations[snap.selectedModel];

    // Set pattern depending on active filter tab
   switch (snap.activeFilterTab) {
  case "logoShirt": // center logo pattern
    modelCustomization.patternCenter =
      modelCustomization.patternCenter === pattern.decal
        ? null
        : pattern.decal;
    break;

  case "stylishShirt": // full pattern
    modelCustomization.patternFull =
      modelCustomization.patternFull === pattern.decal
        ? null
        : pattern.decal;
    break;

  case "logoLeftShirt": // ✅ match FilterTabs
    modelCustomization.patternLeft =
      modelCustomization.patternLeft === pattern.decal
        ? null
        : pattern.decal;
    break;

  case "logoRightShirt": // ✅ match FilterTabs
    modelCustomization.patternRight =
      modelCustomization.patternRight === pattern.decal
        ? null
        : pattern.decal;
    break;

  default:
    modelCustomization.patternCenter =
      modelCustomization.patternCenter === pattern.decal
        ? null
        : pattern.decal;
    break;
}

  };

  // Detect active pattern for current model
  const activePattern =
    snap.modelCustomizations[snap.selectedModel]?.patternCenter ||
    snap.modelCustomizations[snap.selectedModel]?.patternFull ||
    snap.modelCustomizations[snap.selectedModel]?.patternLeft ||
    snap.modelCustomizations[snap.selectedModel]?.patternRight ||
    null;

    

  return (
    <div className="grid grid-cols-3 gap-2 p-2 bg-white rounded-lg shadow-md max-h-60 overflow-y-auto">
      {patterns.map((p) => (
        <button
          key={p.id}
          className={`border rounded-lg overflow-hidden hover:scale-105 transition ${
            activePattern === p.decal ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() => handleSelectPattern(p)}
        >
          <img
            src={p.decal}
            alt={p.label}
            className="w-full h-16 object-cover"
          />
          <p className="text-xs text-center">{p.label}</p>
        </button>
      ))}
    </div>
  );
};

export default PatternPicker;
