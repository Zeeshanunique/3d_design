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
  const [generatingSource, setGeneratingSource] = useState(null); // 'custom' or 'pollinations'
  const [generationStatus, setGenerationStatus] = useState('');

  const [activeEditorTab, setActiveEditorTab] = useState('');
  const [showTextCustomizer, setShowTextCustomizer] = useState(false);
  const [showDesignDropdown, setShowDesignDropdown] = useState(false);
  const [showCustomFitPanel, setShowCustomFitPanel] = useState(false);
  const [showHelpDropdown, setShowHelpDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showAddToStoreModal, setShowAddToStoreModal] = useState(false);
  const [storeItemDetails, setStoreItemDetails] = useState({
    name: '',
    price: '',
    description: ''
  });

  // History management for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save state to history
  const saveToHistory = () => {
    const currentModel = state.selectedModel;
    const currentState = {
      modelCustomizations: JSON.parse(JSON.stringify(state.modelCustomizations)),
      textElements: JSON.parse(JSON.stringify(state.textElements)),
      selectedModel: currentModel,
      activeFilterTab: state.activeFilterTab,
    };

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      
      // Restore state
      state.modelCustomizations = JSON.parse(JSON.stringify(previousState.modelCustomizations));
      state.textElements = JSON.parse(JSON.stringify(previousState.textElements));
      state.selectedModel = previousState.selectedModel;
      state.activeFilterTab = previousState.activeFilterTab;
      
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      
      // Restore state
      state.modelCustomizations = JSON.parse(JSON.stringify(nextState.modelCustomizations));
      state.textElements = JSON.parse(JSON.stringify(nextState.textElements));
      state.selectedModel = nextState.selectedModel;
      state.activeFilterTab = nextState.activeFilterTab;
      
      setHistoryIndex(historyIndex + 1);
    }
  };

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
    
    // Save to history
    saveToHistory();
  };

  const handleUpdateText = (id, updates) => {
    state.textElements = state.textElements.map(text =>
      text.id === id ? { ...text, ...updates } : text
    );
    state.activeTextId = id;
    
    // Save to history
    saveToHistory();
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
          generatingSource={generatingSource}
          generationStatus={generationStatus}
          handleSubmit={handleSubmit}
        />
      );
      case 'modelpicker': return <ModelPicker />;
      case 'patternpicker': 
        return <PatternPicker />;
      default: return null;
    }
  };

  const handleSubmit = async (type, source = 'pollinations') => {
    if (!prompt) return alert('Please enter a prompt');
    try {
      setGeneratingImg(true);
      setGeneratingSource(source);
      
      if (source === 'custom') {
        // Use local Flask API
        setGenerationStatus('Connecting to model server...');
        const API_URL = 'http://localhost:5001/generate/stream';
        
        setGenerationStatus('Loading model...');
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            steps: 30,  // Faster generation
            guidance_scale: 7.5,
            height: 512,
            width: 512,
          }),
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        setGenerationStatus('Generating image... This may take 10-30 seconds...');
        const data = await response.json();
        
        if (data.success && data.image_base64) {
          setGenerationStatus('Processing image...');
          // Convert base64 to data URL
          const imageUrl = `data:image/png;base64,${data.image_base64}`;
          handleDecals(type, imageUrl);
          setGenerationStatus('Complete!');
        } else {
          throw new Error(data.error || 'Image generation failed');
        }
      } else {
        // Use pollinations.ai (original)
        setGenerationStatus('Generating with Pollinations AI...');
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
        handleDecals(type, imageUrl);
        setGenerationStatus('Complete!');
      }
    } catch (error) {
      setGenerationStatus(`Error: ${error.message}`);
      alert(`Image generation failed: ${error.message}`);
      console.error(error);
    } finally {
      setTimeout(() => {
        setGeneratingImg(false);
        setGeneratingSource(null);
        setGenerationStatus('');
        setActiveEditorTab('');
      }, 1000); // Small delay to show completion
    }
  };

  const handleDecals = (type, result) => {
    const currentModel = state.selectedModel;
    
    if (!state.modelCustomizations[currentModel]) {
      console.error(`No customizations found for model: ${currentModel}`);
      return;
    }

    console.log(`handleDecals - type: ${type}, activeFilterTab: ${state.activeFilterTab}, model: ${currentModel}`);

    switch (state.activeFilterTab) {
      case "logoShirt":
        state.modelCustomizations[currentModel].logoDecal = result;
        state.modelCustomizations[currentModel].isLogoTexture = true;
        break;
        
      case "logoLeftShirt":
        state.modelCustomizations[currentModel].logoLeftDecal = result;
        state.modelCustomizations[currentModel].isLogoLeftTexture = true;
        break;
        
      case "logoRightShirt":
        state.modelCustomizations[currentModel].logoRightDecal = result;
        state.modelCustomizations[currentModel].isLogoRightTexture = true;
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

    console.log("Updated customizations:", state.modelCustomizations[currentModel]);
    
    // Save to history
    saveToHistory();
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
    
    // Save to history
    saveToHistory();
  };

  const readFile = (type) => {
    if (!file) {
      alert("Please select a file first");
      return;
    }
    
    reader(file).then((result) => {
      console.log(`readFile - type: ${type}, file: ${file.name}`);
      handleDecals(type, result);
      setActiveEditorTab('');
    });
  };

  const handleAddToStore = () => {
    setShowAddToStoreModal(true);
  };

  const handleSaveToStore = () => {
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
        name: storeItemDetails.name || `Custom ${currentModel}`,
        price: parseFloat(storeItemDetails.price) || 1999,
        description: storeItemDetails.description || 'Custom designed item',
        isCustom: true,
        preview,
        model: currentModel,
        customizations: { ...state.modelCustomizations[currentModel] },
        textElements: [...state.textElements],
      };

      state.savedCustoms = [...state.savedCustoms, newItem];
      
      // Reset form and close modal
      setStoreItemDetails({ name: '', price: '', description: '' });
      setShowAddToStoreModal(false);
      alert("Item added to store!");
    } catch (err) {
      console.error("Failed to add to store:", err);
      alert("Something went wrong while saving to store.");
    }
  };

  const handleDownload = () => {
    try {
      const canvas = document.querySelector("canvas");
      if (!canvas) {
        alert("Canvas not found. Please wait for the model to load.");
        return;
      }
      
      // Create a link element
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `design-${state.selectedModel}-${timestamp}.png`;
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (err) {
      console.error("Failed to download:", err);
      alert("Something went wrong while downloading the image.");
    }
  };

  if (snap.page !== "customizer") return null;

  return (
    <AnimatePresence>
      <div className={`flex flex-col h-screen ${themes[snap.theme]?.background || 'bg-gray-100'}`}>
        {/* TOP NAVBAR - Full Width */}
        <motion.div 
          {...slideAnimation("down")}
          className="bg-white border-b-4 border-gray-300 px-6 py-3 flex items-center z-30 w-full"
        >
          <div className="flex items-center space-x-6">
            {/* Logo with Text */}
            <motion.div {...slideAnimation("down")} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">DS</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight" style={{ fontFamily: "'Satisfy', cursive" }}>
                DesignerStudio
              </span>
            </motion.div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-300"></div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-300"></div>

            {/* Designer Studio Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDesignDropdown(!showDesignDropdown)}
                className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span className="text-sm">▼</span>
                </div>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">DESIGN</span>
              </button>
              
              {showDesignDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    New Design
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    Save
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    Save As...
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    Load Design
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    Export
                  </button>
                </motion.div>
              )}
            </div>

            {/* Home Icon */}
            <button
              onClick={() => (state.page = "home")}
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">HOME</span>
            </button>
            
            {/* Undo with Label */}
            <button 
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">UNDO</span>
            </button>

            {/* Redo with Label */}
            <button 
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">REDO</span>
            </button>

            {/* Specs with Label */}
            <button 
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
              title="Specifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">SPECS</span>
            </button>

            {/* Ease with Label */}
            <button 
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
              title="Ease"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">EASE</span>
            </button>

            {/* Sewing with Label */}
            <button
              onClick={() => (state.page = "sketch")}
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">SKETCH</span>
            </button>

            {/* Yardage with Label */}
            <button 
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
              title="Yardage"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">YARDAGE</span>
            </button>

            {/* Custom Fit with Label */}
            <div className="relative">
              <button
                onClick={() => setShowCustomFitPanel(!showCustomFitPanel)}
                className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">CUSTOMIZE FIT</span>
              </button>

              {showCustomFitPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4"
                >
                  <h3 className="font-bold mb-3 text-sm">Size & Fit</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Size</label>
                      <select className="w-full p-2 border rounded text-sm">
                        <option>XS</option>
                        <option>S</option>
                        <option>M</option>
                        <option>L</option>
                        <option>XL</option>
                        <option>XXL</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Fabric Type</label>
                      <select className="w-full p-2 border rounded text-sm">
                        <option>Cotton</option>
                        <option>Polyester</option>
                        <option>Cotton Blend</option>
                        <option>Silk</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Fit</label>
                      <select className="w-full p-2 border rounded text-sm">
                        <option>Regular</option>
                        <option>Slim</option>
                        <option>Relaxed</option>
                      </select>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 rounded text-xs font-bold hover:bg-blue-700">
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Center & Right Side Items */}
          <div className="flex items-center space-x-6 flex-1 ml-6">
            {/* 2D Designer Icon */}
            <button
              onClick={() => (state.page = "designer2d")}
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">2D</span>
            </button>

            {/* Store Icon */}
            <button
              onClick={() => (state.page = "store")}
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">STORE</span>
            </button>

            {/* Add to Store Icon */}
            <button
              onClick={handleAddToStore}
              className="flex flex-col items-center gap-1 hover:text-green-600 transition group"
              title="Add to Store"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-green-600">ADD TO STORE</span>
            </button>

            {/* Download Icon */}
            <button 
              className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
              title="Download"
              onClick={handleDownload}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">DOWNLOAD</span>
            </button>

            {/* Help Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowHelpDropdown(!showHelpDropdown)}
                className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
                title="Help"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">HELP</span>
              </button>

              {showHelpDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                >
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-xs font-bold text-gray-700">Need Help?</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    📧 Email: support@designer.com
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    📞 Phone: +1 234 567 8900
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    💬 Live Chat
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    📚 Documentation
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                    🎥 Video Tutorials
                  </button>
                </motion.div>
              )}
            </div>

            {/* Spacer to push right items to the end */}
            <div className="flex-1"></div>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-300"></div>

            {/* Right Side - Auth & Profile */}
            <motion.div className="flex items-center space-x-6" {...fadeAnimation}>
              {/* Sign Up */}
              <button 
                className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
                title="Sign Up"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">SIGN UP</span>
              </button>

              {/* Sign In */}
              <button 
                className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
                title="Sign In"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">SIGN IN</span>
              </button>

              {/* Profile with Dropdown */}
              <div className="relative">
                <button 
                  className="flex flex-col items-center gap-1 hover:text-blue-600 transition group"
                  title="Profile"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">JD</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-blue-600">PROFILE</span>
                </button>

                {showProfileDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                  >
                    <div className="p-3 border-b border-gray-200">
                      <p className="text-xs font-bold text-gray-700">John Doe</p>
                      <p className="text-xs text-gray-500">john@example.com</p>
                    </div>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                      My Account
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                      My Designs
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm">
                      Settings
                    </button>
                    <div className="border-t border-gray-200"></div>
                    <button className="w-full px-4 py-2 text-left hover:bg-gray-100 transition text-sm text-red-600">
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>

                  {/* MAIN CONTENT - Sidebar + Canvas */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR */}
          <motion.div 
            {...slideAnimation('left')}
            className="w-28 bg-gray-100 border-r border-gray-300 flex flex-col items-center py-6 z-20"
          >

            {/* Editor Tabs - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden w-full px-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <div className="flex flex-col items-center space-y-4">
                {EditorTabs.map((tab) => (
                  <div key={tab.name} className="flex flex-col items-center">
                    <Tab
                      tab={tab}
                      isActive={activeEditorTab === tab.name}
                      handleClick={() => handleTabClick(tab.name)}
                    />
                    <span className="text-xs text-gray-600 mt-1 text-center font-medium">
                      {tab.name.replace('picker', '').toUpperCase()}
                    </span>
                  </div>
                ))}

                <div className="flex flex-col items-center">
                  <CustomButton
                    type="filled"
                    title=""
                    handleClick={() => setShowTextCustomizer(!showTextCustomizer)}
                    customStyles="w-12 h-12 text-lg font-bold flex items-center justify-center"
                  >
                    Aa
                  </CustomButton>
                  <span className="text-xs text-gray-600 mt-1 text-center font-medium">
                    TEXT
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Selector - Fixed at Bottom */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-300">
              {Object.keys(themes).map((theme) => (
                <button
                  key={theme}
                  onClick={() => (state.theme = theme)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    snap.theme === theme ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-400'
                  } hover:scale-110 transition shadow-md`}
                  style={{ 
                    background: theme === 'light' ? '#f3f4f6' : 
                               theme === 'dark' ? '#1a1a1a' : 
                               theme === 'blue' ? '#bfdbfe' : 
                               theme === 'Green' ? '#bbf7d0' : '#fff'
                  }}
                  title={theme}
                />
              ))}
            </div>
          </motion.div>

          {/* CANVAS AREA */}
          <div className="flex-1 relative">
            {/* Your 3D Canvas renders here */}
            
            {/* Floating Tab Content */}
            <AnimatePresence>
              {activeEditorTab && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute left-6 top-6 z-30 bg-white rounded-lg shadow-xl p-4"
                >
                  {generateTabContent()}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Text Customizer Panel */}
            {showTextCustomizer && (
              <motion.div 
                className="absolute left-6 top-6 z-30"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TextCustomizer
                  addTextToModel={handleAddText}
                  activeText={snap.textElements.find(t => t.id === snap.activeTextId)}
                  updateText={handleUpdateText}
                />
              </motion.div>
            )}

            {/* Bottom Center - Filter Tabs */}
            <motion.div
              className="absolute bottom-6 left-[37%] bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2"
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

            {/* Bottom Right - Logo Controls */}
            <motion.div
              className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg flex gap-2"
              {...fadeAnimation}
            >
              {["translate", "scale", "rotate"].map((mode) => (
                <CustomButton
                  key={mode}
                  type="filled"
                  title={mode === "translate" ? "Move" : mode === "scale" ? "Resize" : "Rotate"}
                  handleClick={() => (state.logoControlMode = mode)}
                  isActive={snap.logoControlMode === mode}
                  customStyles="text-xs font-bold"
                />
              ))}
            </motion.div>

            {/* Logo Control Panel */}
            {["logoShirt", "logoLeftShirt", "logoRightShirt"].includes(snap.activeFilterTab) && (
              <LogoControlPanel />
            )}

            {/* Model Selection Panel */}
            <ModelSelectionPanel />
          </div>
        </div>

        {/* Add to Store Modal */}
        {showAddToStoreModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full mx-4"
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">Add to Store</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={storeItemDetails.name}
                    onChange={(e) => setStoreItemDetails({ ...storeItemDetails, name: e.target.value })}
                    placeholder="e.g., Custom T-Shirt Design"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    value={storeItemDetails.price}
                    onChange={(e) => setStoreItemDetails({ ...storeItemDetails, price: e.target.value })}
                    placeholder="19.99"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={storeItemDetails.description}
                    onChange={(e) => setStoreItemDetails({ ...storeItemDetails, description: e.target.value })}
                    placeholder="Describe your custom design..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddToStoreModal(false);
                    setStoreItemDetails({ name: '', price: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToStore}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Save to Store
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default Customizer;