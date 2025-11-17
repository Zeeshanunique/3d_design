import React from 'react'
import { useSnapshot } from 'valtio'
import { 
  Palette, 
  Upload, 
  Sparkles, 
  Brain, 
  Shirt, 
  Grid3x3,
  Type,
  Image as ImageIcon
} from 'lucide-react'

import state from '../store';

// Icon mapping for modern SVG icons
const iconMap = {
  color: Palette,
  file: Upload,
  ai: Sparkles,
  aimodel: Brain,
  model: Shirt,
  pattern: Grid3x3,
  text: Type,
  image: ImageIcon,
};

const Tab = ({ tab, isFilterTab, isActiveTab, isActive, handleClick }) => {
  const snap = useSnapshot(state);

  const activeStyles = isFilterTab && isActiveTab
    ? { backgroundColor: snap.color, opacity: 0.5 }
    : { backgroundColor: "transparent", opacity: 1 }

  const handleTabClick = () => {
    if (handleClick) {
      handleClick();
    }
  };

  // Get the icon component
  const IconComponent = tab.iconType ? iconMap[tab.iconType] : null;
  // For editor tabs, use isActive prop; for filter tabs, use isActiveTab
  const activeState = isFilterTab ? isActiveTab : isActive;

  return (
    <div
      key={tab.name}
      className={`
        ${isFilterTab ? 'rounded-full glassmorphism' : 'rounded-xl'} 
        ${activeState ? 'ring-2 ring-blue-500' : ''}
        transition-all duration-200
        hover:scale-105 hover:shadow-md
        ${isFilterTab ? 'w-14 h-14' : 'w-14 h-14'}
        flex items-center justify-center
        cursor-pointer
        ${activeState ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white/80 dark:bg-gray-800/80'}
        border ${activeState ? 'border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700'}
        shadow-sm
      `}
      onClick={handleTabClick}
      style={isFilterTab ? activeStyles : {}}
    >
      {IconComponent ? (
        <IconComponent 
          className={`
            ${isFilterTab ? 'w-6 h-6' : 'w-6 h-6'}
            ${activeState ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}
            transition-colors duration-200
          `}
          strokeWidth={activeState ? 2.5 : 2}
        />
      ) : (
        <img
          src={tab.icon}
          alt={tab.name}
          className={`${isFilterTab ? 'w-2/3 h-2/3' : 'w-11/12 h-11/12 object-contain'}`}
        />
      )}
    </div>
  )
}

export default Tab