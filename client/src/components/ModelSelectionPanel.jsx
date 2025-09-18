import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnapshot } from 'valtio';

import state, { ensureModelCustomization } from '../store';
import { AvailableModels } from '../config/constants';

const ModelSelectionPanel = () => {
  const snap = useSnapshot(state);

  const currentCategoryModels = AvailableModels[snap.selectedCategory] || [];

  const handleModelSelect = (modelId) => {
    console.log("🔍 Selecting model:", modelId); // Debug log

    // Ensure the model has customization data
    ensureModelCustomization(modelId);

    // Switch to the selected model
    state.selectedModel = modelId;
    state.showModelPicker = false;
  };

  const handleClose = () => {
    state.showModelPicker = false;
  };

  if (!snap.showModelPicker) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="model-selection-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="model-selection-panel bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-6 max-w-4xl w-full mx-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-semibold">
              Select a {snap.selectedCategory.charAt(0).toUpperCase() + snap.selectedCategory.slice(1, -1)}
            </h2>
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {currentCategoryModels.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70 text-lg">
                No models available for this category yet.
              </p>
              <p className="text-white/50 text-sm mt-2">
                More models coming soon!
              </p>
            </div>
          ) : (
            <div className="horizontal-scroll-container overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {currentCategoryModels.map((model) => (
                  <motion.div
                    key={model.id}
                    className={`model-card ${
                      snap.selectedModel === model.id
                        ? 'bg-white/20 border-white/40'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    } border rounded-lg p-4 cursor-pointer transition-all duration-200 min-w-[200px]`}
                    onClick={() => handleModelSelect(model.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="aspect-square bg-white/5 rounded-lg mb-3 flex items-center justify-center">
                      <img
                        src={model.preview}
                        alt={model.name}
                        className="w-16 h-16 object-contain opacity-70"
                      />
                    </div>
                    <h3 className="text-white text-sm font-medium text-center">
                      {model.name}
                    </h3>
                    {snap.selectedModel === model.id && (
                      <div className="mt-2 text-center">
                        <span className="text-xs text-green-400 font-medium">
                          ✓ Selected
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModelSelectionPanel;
