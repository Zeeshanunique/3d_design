// src/pages/Customizer.jsx
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSnapshot } from 'valtio';

import state from '../store';
import { downloadCanvasToImage, reader } from '../config/helpers';
import { EditorTabs, FilterTabs, DecalTypes } from '../config/constants';
import { fadeAnimation, slideAnimation } from '../config/motion';
import { 
  AIPicker, 
  ColorPicker, 
  CustomButton, 
  FilePicker, 
  Tab, 
  ModelPicker, 
  ModelSelectionPanel, 
  TextCustomizer,
  LogoControlPanel,
  PatternPicker,
} from '../components';

const themes = {
  light: { background: 'bg-gray-260', text: 'text-gray-900' },
  dark: { background: 'bg-gray-900', text: 'text-white' },
  blue: { background: 'bg-blue-200', text: 'text-blue-900' },
  Green: { background: 'bg-green-200', text: 'text-pink-900' },
};

const Customizer = () => {
  const snap = useSnapshot(state);

  const [file, setFile] = useState('');
  const [prompt, setPrompt] = useState('');
  const [generatingImg, setGeneratingImg] = useState(false);

  const [activeEditorTab, setActiveEditorTab] = useState('');
  const [showTextCustomizer, setShowTextCustomizer] = useState(false);

  const handleTabClick = (tabName) => {
    setActiveEditorTab(prev => (prev === tabName ? '' : tabName));
    setShowTextCustomizer(false);
  };

  const activeFilterTab = {
    logoShirt: snap.isLogoTexture,
    stylishShirt: snap.isFullTexture,
    logoLeftShirt: snap.isLogoLeftTexture,
    logoRightShirt: snap.isLogoRightTexture,
  };

  const handleAddText = (textProps) => {
    if (state.activeTextId) {
      handleUpdateText(state.activeTextId, textProps);
      return;
    }

    const newText = {
      ...textProps,
      id: Date.now().toString(),
      position: textProps.position || { x: 0, y: 0.2, z: 0.15 },
      font: textProps.font || '/fonts/Roboto-Bold.ttf'
    };
    state.textElements = [...state.textElements, newText];
    state.activeTextId = newText.id;
  };

  const handleUpdateText = (id, updates) => {
    state.textElements = state.textElements.map(text =>
      text.id === id ? { ...text, ...updates } : text
    );
    state.activeTextId = id;
  };

  const generateTabContent = () => {
    switch (activeEditorTab) {
      case 'colorpicker': return <ColorPicker />;
      case 'filepicker': return <FilePicker file={file} setFile={setFile} readFile={readFile} />;
      case 'aipicker': return (
        <AIPicker
          prompt={prompt}
          setPrompt={setPrompt}
          generatingImg={generatingImg}
          handleSubmit={handleSubmit}
        />
      );
      case 'modelpicker': return <ModelPicker />;
      case 'patternpicker': 
        return <div className="absolute left-[70px] top-0 z-50 w-64"><PatternPicker /></div>;
      default: return null;
    }
  };

  const handleSubmit = async (type) => {
    if (!prompt) return alert('Please enter a prompt');
    try {
      setGeneratingImg(true);
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
      handleDecals(type, imageUrl);
    } catch (error) {
      alert('Image generation failed');
      console.error(error);
    } finally {
      setGeneratingImg(false);
      setActiveEditorTab('');
    }
  };

  const handleDecals = (type, result) => {
    const decalType = DecalTypes[type];
    const currentModel = state.selectedModel;
    if (!state.modelCustomizations[currentModel]) return;

    switch (state.activeFilterTab) {
      case "logoLeftShirt":
        state.modelCustomizations[currentModel].logoLeftDecal = result;
        state.modelCustomizations[currentModel].isLogoLeftTexture = true;
        break;
      case "logoRightShirt":
        state.modelCustomizations[currentModel].logoRightDecal = result;
        state.modelCustomizations[currentModel].isLogoRightTexture = true;
        break;
      case "logoShirt":
        state.modelCustomizations[currentModel].logoDecal = result;
        state.modelCustomizations[currentModel].isLogoTexture = true;
        break;
      case "stylishShirt":
        state.modelCustomizations[currentModel].fullDecal = result;
        state.modelCustomizations[currentModel].isFullTexture = true;
        break;
      default:
        state.modelCustomizations[currentModel].logoDecal = result;
        state.modelCustomizations[currentModel].isLogoTexture = true;
        break;
    }
  };

  const handleActiveFilterTab = (tabName) => {
    const currentModel = state.selectedModel;
    if (!state.modelCustomizations[currentModel]) return;

    state.activeFilterTab = tabName;

    switch (tabName) {
      case 'logoShirt': 
        state.modelCustomizations[currentModel].isLogoTexture = !activeFilterTab[tabName]; 
        break;
      case 'stylishShirt': 
        state.modelCustomizations[currentModel].isFullTexture = !activeFilterTab[tabName]; 
        break;
      case 'logoLeftShirt': 
        state.modelCustomizations[currentModel].isLogoLeftTexture = !activeFilterTab[tabName]; 
        break;
      case 'logoRightShirt': 
        state.modelCustomizations[currentModel].isLogoRightTexture = !activeFilterTab[tabName]; 
        break;
      default:
        state.modelCustomizations[currentModel].isLogoTexture = true;
        state.modelCustomizations[currentModel].isFullTexture = false;
        break;
    }
  };

  const readFile = (type) => {
    reader(file).then((result) => {
      handleDecals(type, result);
      setActiveEditorTab('');
    });
  };

  const handleAddToStore = () => {
    try {
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        alert("Canvas not found. Try again after model loads.");
        return;
      }
      const preview = canvas.toDataURL("image/png");
      const currentModel = state.selectedModel;

      const newItem = {
        id: Date.now().toString(),
        name: `Custom ${currentModel}`,
        price: 1999,
        isCustom: true,
        preview,
        model: currentModel,
        customizations: { ...state.modelCustomizations[currentModel] },
        textElements: [...state.textElements],
      };

      state.savedCustoms = [...state.savedCustoms, newItem];
      alert("Item added to store!");
    } catch (err) {
      console.error("Failed to add to store:", err);
      alert("Something went wrong while saving to store.");
    }
  };

  if (snap.page !== "customizer") return null;

  return (
    <AnimatePresence>
      {/* Outer container with theme applied */}
      <motion.div
        key="customizer-ui"
        className={`${themes[snap.theme]?.background || 'bg-gray-100'} w-screen h-screen`}
      >
        {/* Existing Customizer UI (unchanged) */}
        <motion.div
          key="customizer-inner"
          className="absolute top-0 left-0 z-10 w-full h-full"
          {...slideAnimation('left')}
        >
          <motion.header {...slideAnimation("down")} className="absolute top-5 left-5">
            <img src='./threejs.png' alt="logo" className="w-8 h-8 object-contain" />
          </motion.header>

          <div className="flex items-center min-h-screen">
            <div className="editortabs-container tabs">
              {EditorTabs.map((tab) => (
                <Tab
                  key={tab.name}
                  tab={tab}
                  isActive={activeEditorTab === tab.name}
                  handleClick={() => handleTabClick(tab.name)}
                />
              ))}

              <div className="relative">
                <CustomButton
                  type="filled"
                  title={showTextCustomizer ? "Hide Text Editor" : "Add Text"}
                  handleClick={() => setShowTextCustomizer(!showTextCustomizer)}
                  customStyles="w-fit px-4 py-2.5 font-bold text-sm mt-4"
                />
              </div>

              {showTextCustomizer && (
                <motion.div 
                  className="absolute left-[200px] top-0"
                  {...slideAnimation('left')}
                  style={{ zIndex: 30 }}
                >
                  <TextCustomizer
                    addTextToModel={handleAddText}
                    activeText={snap.textElements.find(t => t.id === snap.activeTextId)}
                    updateText={handleUpdateText}
                  />
                </motion.div>
              )}

              {generateTabContent()}
            </div>
          </div>
        </motion.div>

        <div className="absolute top-1 left-10 flex gap-2 z-20">
  <CustomButton
    type="filled"
    title="Sketch Board"
    handleClick={() => (state.page = "sketch")}
    customStyles="px-4 py-2 font-bold text-sm"
  />
</div>




        {/* Theme Selector Buttons */}
        <div className="absolute bottom-5 left-5 flex flex-row gap-2 z-50">
          {Object.keys(themes).map((theme) => (
            <CustomButton
              key={theme}
              type="filled"
              title={theme.charAt(0).toUpperCase() + theme.slice(1)}
              handleClick={() => (state.theme = theme)}
              customStyles="px-3 py-1 text-sm font-bold"
            />
          ))}
        </div>

        {/* Top Right Buttons */}
        <motion.div
          key="top-buttons"
          className="absolute z-10 top-5 right-5 flex gap-2"
          {...fadeAnimation}
        >
          <CustomButton
            type="filled"
            title="Home"
            handleClick={() => (state.page = "home")}
            customStyles="w-fit px-4 py-2.5 font-bold text-sm"
          />
          <CustomButton
            type="filled"
            title="Go to Store"
            handleClick={() => (state.page = "store")}
            customStyles="w-fit px-4 py-2.5 font-bold text-sm"
          />
          <CustomButton
            type="filled"
            title="Add to Store"
            handleClick={handleAddToStore}
            customStyles="w-fit px-4 py-2.5 font-bold text-sm bg-green-500"
          />
           {/* 2D Button */}
  <CustomButton
    type="filled"
    title="2D Designer"
    handleClick={() => (state.page = "designer2d")}
    customStyles="w-fit px-4 py-2.5 font-bold text-sm bg-blue-500"
  />
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          key="filter-tabs"
          className="filtertabs-container"
          {...slideAnimation('up')}
        >
          {FilterTabs.map((tab) => (
            <Tab
              key={tab.name}
              tab={tab}
              isFilterTab
              isActiveTab={activeFilterTab[tab.name]}
              handleClick={() => handleActiveFilterTab(tab.name)}
            />
          ))}
        </motion.div>

        {/* Logo Control Buttons */}
        <motion.div
          key="logo-controls"
          className="absolute bottom-5 right-5 flex gap-2 bg-white/80 p-2 rounded-xl shadow-md"
          {...fadeAnimation}
        >
          {["translate", "scale", "rotate"].map((mode) => (
            <CustomButton
              key={mode}
              type="filled"
              title={mode === "translate" ? "Move" : mode === "scale" ? "Resize" : "Rotate"}
              handleClick={() => (state.logoControlMode = mode)}
              isActive={snap.logoControlMode === mode}
              customStyles="font-bold text-sm"
            />
          ))}
        </motion.div>

        {/* Logo Panel */}
        {["logoShirt", "logoLeftShirt", "logoRightShirt"].includes(snap.activeFilterTab) && (
          <LogoControlPanel />
        )}

        {/* Model Selection */}
        <ModelSelectionPanel key="model-selection-panel" />
      </motion.div>
    </AnimatePresence>
  );
};

export default Customizer;
