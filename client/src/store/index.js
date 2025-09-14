import { proxy } from "valtio";

const state = proxy({
  page: "home", // are we in home page
  logoControlMode: "translate",

  // Which panel/tab is active
  activeFilterTab: null, // "logo" | "logoLeft" | "logoRight"
  
  // center logo
  logoCenterPosition: [0, 0.04, 0.15],
  logoCenterScale: 0.10,

  // left logo
  logoLeftPosition: [-0.12, 0.10, 0.10],
  logoLeftScale: 0.10,

  // right logo
  logoRightPosition: [0.12, 0.10, 0.10],
  logoRightScale: 0.10,

  // Model selection state
  selectedCategory: "tshirts", // Currently selected category
  selectedModel: "tshirt_basic", // Currently selected model ID
  showModelPicker: false, // Whether model picker panel is open

  // Text customization
  textElements: [], // Array of text elements
  activeTextId: null, // Currently selected text element for editing

  // Saved custom products from Customizer
  savedCustoms: [],

  // Selected product for ProductDetailsPage
  selectedProduct: null,

  // Model-specific customizations - each model remembers its own settings
  modelCustomizations: {
    // T-Shirts
    tshirt_basic: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",

      // Existing
      isDotsPattern: false,
      isStripesPattern: false,
      isCirclesPattern: false,
      isSmallDotsPattern: false,
      dotsDecal: "/bigdots.webp",
      stripesDecal: "/stripe.jpg",
      circlesDecal: "/circles.png",
      smallDotsDecal: "/dot.jpg",

      // New patterns
      isPattern1: false,
      isPattern2: false,
      isPattern3: false,
      isPattern4: false,
      isPattern5: false,
      isPattern6: false,
      isPattern7: false,
      isPattern8: false,
      isPattern9: false,
      isPattern10: false,
      pattern1Decal: "/new1.png",
      pattern2Decal: "/new2.png",
      pattern3Decal: "/new3.png",
      pattern4Decal: "/new4.png",
      pattern5Decal: "/new5.jpeg",
      pattern6Decal: "/new6.jpeg",
      pattern7Decal: "/new7.jpeg",
      pattern8Decal: "/new8.jpeg",
      pattern9Decal: "/new9.jpeg",
      pattern10Decal: "/new10.jpeg",
    },

    tshirt_variant1: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    tshirt_variant2: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    tshirt_longsleeve: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    tshirt_hoodie: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    denim_shirt: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    // Jackets
    adidas_jacket: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    men_jacket: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    // Pants
    jeans_denim: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    pants_style2: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    // Shorts
    man_shorts: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    shorts_style2: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
    // Women
    white_grace: {
      color: "#EFBD48",
      isLogoTexture: true,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      fullDecal: "./threejs.png",
    },
  },

  // Computed getters
  get color() {
    return this.modelCustomizations[this.selectedModel]?.color || "#EFBD48";
  },
  get isLogoTexture() {
    const value = this.modelCustomizations[this.selectedModel]?.isLogoTexture;
    return value !== undefined ? value : true;
  },
  get isFullTexture() {
    const value = this.modelCustomizations[this.selectedModel]?.isFullTexture;
    return value !== undefined ? value : false;
  },
  get logoDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.logoDecal ||
      "./threejs.png"
    );
  },
  get fullDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.fullDecal ||
      "./threejs.png"
    );
  },

  // getters for left/right logo support
  get isLogoLeftTexture() {
    return (
      this.modelCustomizations[this.selectedModel]?.isLogoLeftTexture || false
    );
  },
  get isLogoRightTexture() {
    return (
      this.modelCustomizations[this.selectedModel]?.isLogoRightTexture || false
    );
  },
  get logoLeftDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.logoLeftDecal ||
      "./threejs.png"
    );
  },
  get logoRightDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.logoRightDecal ||
      "./threejs.png"
    );
  },

  get isDotsPattern() {
    return this.modelCustomizations[this.selectedModel]?.isDotsPattern || false;
  },
  get isStripesPattern() {
    return (
      this.modelCustomizations[this.selectedModel]?.isStripesPattern || false
    );
  },
  get isCirclesPattern() {
    return (
      this.modelCustomizations[this.selectedModel]?.isCirclesPattern || false
    );
  },
  get isSmallDotsPattern() {
    return (
      this.modelCustomizations[this.selectedModel]?.isSmallDotsPattern || false
    );
  },
  get dotsDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.dotsDecal ||
      "/bigdots.webp"
    );
  },
  get stripesDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.stripesDecal ||
      "/stripe.jpg"
    );
  },
  get circlesDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.circlesDecal ||
      "/circles.png"
    );
  },
  get smallDotsDecal() {
    return (
      this.modelCustomizations[this.selectedModel]?.smallDotsDecal ||
      "/dot.jpg"
    );
  },

  // New pattern states
  get isPattern1() { return this.modelCustomizations[this.selectedModel]?.isPattern1 || false },
  get pattern1Decal() { return this.modelCustomizations[this.selectedModel]?.pattern1Decal || "/new1.png" },

  get isPattern2() { return this.modelCustomizations[this.selectedModel]?.isPattern2 || false },
  get pattern2Decal() { return this.modelCustomizations[this.selectedModel]?.pattern2Decal || "/new2.png" },

  get isPattern3() { return this.modelCustomizations[this.selectedModel]?.isPattern3 || false },
  get pattern3Decal() { return this.modelCustomizations[this.selectedModel]?.pattern3Decal || "/new3.png" },

  get isPattern4() { return this.modelCustomizations[this.selectedModel]?.isPattern4 || false },
  get pattern4Decal() { return this.modelCustomizations[this.selectedModel]?.pattern4Decal || "/new4.png" },

  get isPattern5() { return this.modelCustomizations[this.selectedModel]?.isPattern5 || false },
  get pattern5Decal() { return this.modelCustomizations[this.selectedModel]?.pattern5Decal || "/new5.jpeg" },

  get isPattern6() { return this.modelCustomizations[this.selectedModel]?.isPattern6 || false },
  get pattern6Decal() { return this.modelCustomizations[this.selectedModel]?.pattern6Decal || "/new6.jpeg" },

  get isPattern7() { return this.modelCustomizations[this.selectedModel]?.isPattern7 || false },
  get pattern7Decal() { return this.modelCustomizations[this.selectedModel]?.pattern7Decal || "/new7.jpeg" },

  get isPattern8() { return this.modelCustomizations[this.selectedModel]?.isPattern8 || false },
  get pattern8Decal() { return this.modelCustomizations[this.selectedModel]?.pattern8Decal || "/new8.jpeg" },

  get isPattern9() { return this.modelCustomizations[this.selectedModel]?.isPattern9 || false },
  get pattern9Decal() { return this.modelCustomizations[this.selectedModel]?.pattern9Decal || "/new9.jpeg" },

  get isPattern10() { return this.modelCustomizations[this.selectedModel]?.isPattern10 || false },
  get pattern10Decal() { return this.modelCustomizations[this.selectedModel]?.pattern10Decal || "/new10.jpeg" },
});

// Helper function to ensure a model has customization data
export const ensureModelCustomization = (modelId) => {
  if (!state.modelCustomizations[modelId]) {
    state.modelCustomizations[modelId] = {
      color: "#EFBD48",
      isLogoTexture: true,
      isLogoLeftTexture: false,
      isLogoRightTexture: false,
      isFullTexture: false,
      logoDecal: "./threejs.png",
      logoLeftDecal: "./threejs.png",
      logoRightDecal: "./threejs.png",
      fullDecal: "./threejs.png",

      // existing pattern toggles + decals
      isDotsPattern: false,
      isStripesPattern: false,
      isCirclesPattern: false,
      isSmallDotsPattern: false,
      dotsDecal: "/bigdots.webp",
      stripesDecal: "/stripe.jpg",
      circlesDecal: "/circles.png",
      smallDotsDecal: "/dot.jpg",

      // New patterns (1 - 10)
      isPattern1: false,
      isPattern2: false,
      isPattern3: false,
      isPattern4: false,
      isPattern5: false,
      isPattern6: false,
      isPattern7: false,
      isPattern8: false,
      isPattern9: false,
      isPattern10: false,

      pattern1Decal: "/new1.png",
      pattern2Decal: "/new2.png",
      pattern3Decal: "/new3.png",
      pattern4Decal: "/new4.png",
      pattern5Decal: "/new5.jpeg",
      pattern6Decal: "/new6.jpeg",
      pattern7Decal: "/new7.jpeg",
      pattern8Decal: "/new8.jpeg",
      pattern9Decal: "/new9.jpeg",
      pattern10Decal: "/new10.jpeg",
    };
  }
};

// Helper function to switch category and ensure proper model selection
export const switchToCategory = (categoryId, AvailableModels) => {
  // Switch to the new category
  state.selectedCategory = categoryId;
  
  // Get available models for this category
  const categoryModels = AvailableModels[categoryId] || [];
  
  if (categoryModels.length > 0) {
    // Check if current model exists in new category
    const currentModelExists = categoryModels.find(model => model.id === state.selectedModel);
    
    if (!currentModelExists) {
      // Switch to first available model in new category
      const firstModel = categoryModels[0];
      state.selectedModel = firstModel.id;
      ensureModelCustomization(firstModel.id);
      console.log(`Switched to category ${categoryId}, selected model: ${firstModel.id}`);
    }
  } else {
    console.warn(`No models available for category: ${categoryId}`);
  }
};

export default state;