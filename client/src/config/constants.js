import { swatch, fileIcon, ai, logoShirt, stylishShirt } from "../assets";

export const EditorTabs = [
  {
    name: "colorpicker",
    icon: swatch,
  },
  {
    name: "filepicker",
    icon: fileIcon,
  },
  {
    name: "aipicker",
    icon: ai,
  },
  {
    name: "modelpicker",
    icon: fileIcon,
  },
  {
    name: "patternpicker",
    icon: fileIcon,
  },
];

export const FilterTabs = [
  { name: "logoShirt", icon: logoShirt },
  { name: "stylishShirt", icon: stylishShirt },
  { name: "logoLeftShirt", icon: logoShirt },
  { name: "logoRightShirt", icon: logoShirt },
];  

export const DecalTypes = {
  logo: { stateProperty: "logoDecal", filterTab: "logoShirt" },
  full: { stateProperty: "fullDecal", filterTab: "stylishShirt" },
  logoLeft: { stateProperty: "logoLeftDecal", filterTab: "logoLeftShirt" },
  logoRight: { stateProperty: "logoRightDecal", filterTab: "logoRightShirt" },
  dots: { stateProperty: "dotsDecal", filterTab: "dotsPattern" },
  stripes: { stateProperty: "stripesDecal", filterTab: "stripesPattern" },
  circles: { stateProperty: "circlesDecal", filterTab: "circlesPattern" },
  smallDots: { stateProperty: "smallDotsDecal", filterTab: "smallDotsPattern" },

  // New patterns
  pattern1: { stateProperty: "pattern1Decal", filterTab: "pattern1" },
  pattern2: { stateProperty: "pattern2Decal", filterTab: "pattern2" },
  pattern3: { stateProperty: "pattern3Decal", filterTab: "pattern3" },
  pattern4: { stateProperty: "pattern4Decal", filterTab: "pattern4" },
  pattern5: { stateProperty: "pattern5Decal", filterTab: "pattern5" },
  pattern6: { stateProperty: "pattern6Decal", filterTab: "pattern6" },
  pattern7: { stateProperty: "pattern7Decal", filterTab: "pattern7" },
  pattern8: { stateProperty: "pattern8Decal", filterTab: "pattern8" },
  pattern9: { stateProperty: "pattern9Decal", filterTab: "pattern9" },
  pattern10: { stateProperty: "pattern10Decal", filterTab: "pattern10" },
};

export const ModelCategories = [
  {
    id: "tshirts",
    name: "T-Shirts",
    shortTitle: "SHIRT",
    icon: logoShirt,
  },
  {
    id: "jackets",
    name: "Jackets",
    shortTitle: "JACK",
    icon: fileIcon,
  },
  {
    id: "pants",
    name: "Pants",
    shortTitle: "PANT",
    icon: fileIcon,
  },
  {
    id: "shorts",
    name: "Shorts",
    shortTitle: "SHORT",
    icon: fileIcon,
  },
  {
    id: "women",
    name: "Women",
    shortTitle: "WOMEN",
    icon: fileIcon,
  },
  {
    id: "long",
    name: "longsleeve",
    shortTitle: "Sleeve",
    icon: fileIcon,
  },
];

export const AvailableModels = {
  tshirts: [
    {
      id: "tshirt_basic",
      name: "Basic T-Shirt",
      modelPath: "/shirt_baked.glb",
      geometryNode: "T_Shirt_male",
      materialName: "lambert1",
      preview: "/threejs.png",
      decalPositions: {
        logo: [0, 0.04, 0.15],
        full: [0, 0, 0]
      }
    },
    {
      id: "tshirt_variant1",
      name: "T-Shirt Style 1",
      modelPath: "/shirt_baked-1.glb",
      geometryNode: "T_Shirt_male",
      materialName: "lambert1",
      preview: "/threejs.png",
      decalPositions: {
        logo: [0, 0.04, 0.15],
        full: [0, 0, 0]
      }
    },
    {
      id: "tshirt_variant2",
      name: "T-Shirt Style 2",
      modelPath: "/shirt_baked-2.glb",
      geometryNode: "T_Shirt_male",
      materialName: "lambert1",
      preview: "/threejs.png",
      decalPositions: {
        logo: [0, 0.04, 0.15],
        full: [0, 0, 0]
      }
    },
    /*
  id: "tshirt_longsleeve",
  name: "Long Sleeve T-Shirt",
  modelPath: "/t-shirt_-_lengan_panjang.glb",
  geometryNode: "multi",   // tell loader this is multi-mesh
  materialNames: [
    "Back_FRONT_2239",
    "Collar_FRONT_2229",
    "Front_FRONT_2234",
    "Lower_Left_FRONT_2224",
    "Lower_Right_FRONT_2214",
    "Upper_Left_FRONT_2219",
    "Upper_Right_FRONT_2209"
  ],
  preview: "/threejs.png",
  decalPositions: {
    logo: [0, 0.12, 0.2],  // adjust decal a bit higher for long sleeve
    full: [0, 0, 0]
  },
  scale: [1.2, 1.2, 1.2],   // slightly larger than basic tee
  position: [0, -0.4, 0],   // drop it lower so it sits right
  rotation: [0, 0, 0]



*/  



    {
      id: "tshirt_hoodie",
      name: "Hoodie T-Shirt",
      modelPath: "/t_shirt_hoodie_3d_model.glb",
      geometryNode: "Object_6",
      materialName: "Material.001",
      preview: "/threejs.png",
      decalPositions: {
        logo: [0, 0.04, 0.15],
        full: [0, 0, 0]
      },
      // Special transformations for hoodie
      scale: [0.01, 0.01, 0.01],
      rotation: [Math.PI / 2, 0, 0]
    }
  ],
    jackets: [
    { id: "adidas", name: "Adidas Jacket", preview: "/threejs.png" },
    { id: "mensjacket", name: "Men's Jacket", preview: "/threejs.png" }
  ],

  pants: [
    { id: "jeans", name: "Denim Jeans", preview: "/threejs.png" },
    { id: "baked", name: "Grey Sweatpants", preview: "/threejs.png" }
  ],

  shorts: [
    { id: "ShortModel", name: "Men's Shorts", preview: "/threejs.png" },
    { id: "Shortpuff", name: "Orange Puff Shorts", preview: "/threejs.png" }
  ],

  women: [
    { id: "WomenModel", name: "White Grace Dress", preview: "/threejs.png" }
  ],

  long: [
    { id: "LongModel",name: "LongSleeve", preview: "/threejs.png" }
  ]
};