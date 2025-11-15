import React from 'react'
import { useSnapshot } from 'valtio';

import state from '../store';
import { getContrastingColor } from '../config/helpers';

const CustomButton = ({ type, title, customStyles, handleClick, isActive, disabled }) => {
  const snap = useSnapshot(state);

  const generateStyle = (type) => {
    if (type === 'filled') {
      return {
        backgroundColor: isActive ? '#3B82F6' : snap.color, // 🔹 active = blue
        color: isActive ? '#fff' : getContrastingColor(snap.color)
      }
    } else if (type === "outline") {
      return {
        borderWidth: '1px',
        borderColor: isActive ? '#3B82F6' : snap.color, // 🔹 active = blue border
        color: isActive ? '#3B82F6' : snap.color
      }
    }
  }

  return (
    <button
      className={`px-2 py-1.5 flex-1 rounded-md transition ${customStyles}`}
      style={generateStyle(type)}
      onClick={handleClick}
      disabled={disabled}
    >
      {title}
    </button>
  )
}

export default CustomButton
