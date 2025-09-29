import React, { useEffect, useState, forwardRef } from "react";
import { Image, Group } from "react-konva";
import useImage from "use-image";

// Forward ref so parent can access the group/layer if needed
const BaseShirt = forwardRef(({ patternUrl, color }, ref) => {
  const [shirtImg] = useImage("/2d/2d-tshirt.png"); // transparent background PNG
  const [patternImg] = useImage(patternUrl);

  return (
    <Group ref={ref}>
      {/* Shirt PNG */}
      {shirtImg && (
        <Image
          image={shirtImg}
          x={0}
          y={0}
          width={500}
          height={600}
        />
      )}

      {/* Overlay: pattern or color */}
      {(patternImg || color) && shirtImg && (
        <Image
          image={patternImg || shirtImg} // fallback if only color
          x={0}
          y={0}
          width={500}
          height={600}
          listening={false}
          // ONLY draw on non-transparent pixels of shirt
          globalCompositeOperation="source-in"
          fill={color} // if you want solid color instead of pattern
        />
      )}
    </Group>
  );
});

export default BaseShirt;
