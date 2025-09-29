import React, { useEffect, useState } from "react";
import { Image } from "react-konva";
import { useSnapshot } from "valtio";
import state from "../../store";

const PatternLayer = () => {
  const snap = useSnapshot(state);
  const [pattern, setPattern] = useState(null);

  // Pick first active pattern decal
  const activePattern = (() => {
    if (snap.isDotsPattern) return snap.dotsDecal;
    if (snap.isStripesPattern) return snap.stripesDecal;
    if (snap.isCirclesPattern) return snap.circlesDecal;
    if (snap.isSmallDotsPattern) return snap.smallDotsDecal;
    if (snap.isPattern1) return snap.pattern1Decal;
    if (snap.isPattern2) return snap.pattern2Decal;
    if (snap.isPattern3) return snap.pattern3Decal;
    if (snap.isPattern4) return snap.pattern4Decal;
    if (snap.isPattern5) return snap.pattern5Decal;
    if (snap.isPattern6) return snap.pattern6Decal;
    if (snap.isPattern7) return snap.pattern7Decal;
    if (snap.isPattern8) return snap.pattern8Decal;
    if (snap.isPattern9) return snap.pattern9Decal;
    if (snap.isPattern10) return snap.pattern10Decal;
    return null;
  })();

  useEffect(() => {
    if (!activePattern) return;
    const img = new window.Image();
    img.src = activePattern;
    img.onload = () => setPattern(img);
  }, [activePattern]);

  if (!pattern) return null;

  return (
    <Image
      image={pattern}
      x={0}
      y={0}
      width={500}
      height={600}
      opacity={0.4}
    />
  );
};

export default PatternLayer;
