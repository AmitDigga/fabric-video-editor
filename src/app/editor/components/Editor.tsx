"use client";

import fabric from "fabric";
import { Canvas } from "fabric/fabric-impl";
import { useState, useEffect } from "react";

export const Editor = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  useEffect(() => {
    const canvas = new fabric.fabric.Canvas("canvas", {
      height: 400,
      width: 400,
      backgroundColor: "pink",
    });
    setCanvas(canvas);
  }, []);
  return (
    <div>
      <div>Hello</div>
      <canvas id="canvas" className="h-[400px] w-[400px]" />
    </div>
  );
};
