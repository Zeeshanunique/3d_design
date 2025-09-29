import React, { useEffect, useState } from "react";
import { Image } from "react-konva";
import { useSnapshot } from "valtio";
import state from "../../store";

const LogoLayer = () => {
  const snap = useSnapshot(state);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    if (!snap.logoDecal) return;
    const img = new window.Image();
    img.src = snap.logoDecal;
    img.onload = () => setLogo(img);
  }, [snap.logoDecal]);

  if (!logo) return null;

  return (
    <Image
      image={logo}
      x={150}
      y={200}
      width={200}
      height={200}
      draggable
    />
  );
};

export default LogoLayer;
