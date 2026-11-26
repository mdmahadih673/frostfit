"use client";

import { useEffect, useRef } from "react";

const SOURCE = "/images/summit-puffer.png";

function isBackgroundPixel(data: Uint8ClampedArray, pixel: number) {
  const offset = pixel * 4;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];

  return red > 246 && green > 246 && blue > 246 && Math.max(red, green, blue) - Math.min(red, green, blue) < 7;
}

export function PufferCutout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = new window.Image();
    image.src = SOURCE;

    image.onload = () => {
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      context.drawImage(image, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const { data, width, height } = imageData;
      const visited = new Uint8Array(width * height);
      const queue: number[] = [];

      const addPixel = (pixel: number) => {
        if (visited[pixel] || !isBackgroundPixel(data, pixel)) return;
        visited[pixel] = 1;
        queue.push(pixel);
      };

      for (let x = 0; x < width; x += 1) {
        addPixel(x);
        addPixel((height - 1) * width + x);
      }

      for (let y = 0; y < height; y += 1) {
        addPixel(y * width);
        addPixel(y * width + width - 1);
      }

      for (let index = 0; index < queue.length; index += 1) {
        const pixel = queue[index];
        data[pixel * 4 + 3] = 0;

        const x = pixel % width;
        const y = Math.floor(pixel / width);
        if (x > 0) addPixel(pixel - 1);
        if (x < width - 1) addPixel(pixel + 1);
        if (y > 0) addPixel(pixel - width);
        if (y < height - 1) addPixel(pixel + width);
      }

      context.putImageData(imageData, 0, 0);
    };

    return () => {
      image.onload = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Cloud Summit puffer jacket with an insulated hood"
      className="h-full w-full object-contain object-bottom drop-shadow-[0_28px_22px_rgba(87,88,81,0.14)]"
    />
  );
}
