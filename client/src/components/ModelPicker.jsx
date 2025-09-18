import React from 'react';
import { useSnapshot } from 'valtio';

import state from '../store';
import { ModelCategories } from '../config/constants';

const ModelPicker = () => {
  const snap = useSnapshot(state);

  const handleCategoryClick = (categoryId) => {
    state.selectedCategory = categoryId;
    state.showModelPicker = true;
  };

  return (
    <div className="modelpicker-container">
      <div className="flex flex-col gap-3">
        <div className="text-center">
          <h3 className="text-black text-sm font-semibold mb-2">Categories</h3>
          <p className="text-black text-xs mb-3">
            Choose a clothing category
          </p>
        </div>

        {/* Category Icons Grid */}
        <div className="grid grid-cols-2 gap-2  ">
          {ModelCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`category-btn ${
                snap.selectedCategory === category.id
                  ? 'bg-white/10 border-white/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              } border rounded-lg p-3 transition-all duration-200`}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="text-white text-lg font-bold bg-black/40 px-2 py-1 rounded">
                  {category.shortTitle}
                </div>
                <span className="text-white text-xs font-medium bg-black/30 px-1 rounded">
                  {category.name}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-2">
          <p className="text-white/50 text-xs">
            Selected: {snap.selectedCategory.charAt(0).toUpperCase() + snap.selectedCategory.slice(1)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelPicker;
