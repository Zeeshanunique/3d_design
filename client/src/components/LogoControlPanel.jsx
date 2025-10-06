import React from "react";
import { useSnapshot } from "valtio";
import state from "../store";

const LogoControlPanel = () => {
  const snap = useSnapshot(state);

  const updatePosition = (logoKey, axis, value) => {
    const pos = [...snap[logoKey]];
    if (axis === "x") pos[0] = value;
    if (axis === "y") pos[1] = value;
    if (axis === "z") pos[2] = value;
    state[logoKey] = pos;
  };

  const renderControls = (title, positionKey, scaleKey, enabledKey) => (
    <div className="p-3 border rounded-lg mb-4 bg-white shadow-md">
      <h3 className="font-bold text-sm mb-2">{title}</h3>
      <label className="block mb-1 text-xs">Enable</label>
      <input
        type="checkbox"
        checked={snap[enabledKey]}
        onChange={(e) => (state[enabledKey] = e.target.checked)}
      />

      <div className="mt-2">
        <label className="block text-xs">X Position</label>
        <input
          type="number"
          step="0.01"
          value={snap[positionKey][0]}
          onChange={(e) =>
            updatePosition(positionKey, "x", parseFloat(e.target.value))
          }
          className="border rounded w-full p-1 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs">Y Position</label>
        <input
          type="number"
          step="0.01"
          value={snap[positionKey][1]}
          onChange={(e) =>
            updatePosition(positionKey, "y", parseFloat(e.target.value))
          }
          className="border rounded w-full p-1 text-xs"
        />
      </div>

      <div>
        <label className="block text-xs">Z Position</label>
        <input
          type="number"
          step="0.01"
          value={snap[positionKey][2]}
          onChange={(e) =>
            updatePosition(positionKey, "z", parseFloat(e.target.value))
          }
          className="border rounded w-full p-1 text-xs"
        />
      </div>

      <div className="mt-2">
        <label className="block text-xs">Scale</label>
        <input
          type="number"
          step="0.01"
          value={snap[scaleKey]}
          onChange={(e) => (state[scaleKey] = parseFloat(e.target.value))}
          className="border rounded w-full p-1 text-xs"
        />
      </div>
    </div>
  );

  return (
    <div className="absolute bottom-20 right-4 w-60 bg-white-700 p-3 rounded-lg shadow-lg z-50">
      {snap.activeFilterTab === "logoShirt" &&
        renderControls(
          "Center Logo",
          "logoCenterPosition",
          "logoCenterScale",
          "isLogoTexture"
        )}
      {snap.activeFilterTab === "logoLeftShirt" &&
        renderControls(
          "Left Logo",
          "logoLeftPosition",
          "logoLeftScale",
          "isLogoLeftTexture"
        )}
      {snap.activeFilterTab === "logoRightShirt" &&
        renderControls(
          "Right Logo",
          "logoRightPosition",
          "logoRightScale",
          "isLogoRightTexture"
        )}
    </div>
  );
};

export default LogoControlPanel;
