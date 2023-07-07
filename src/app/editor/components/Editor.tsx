"use client";

import fabric from "fabric";
import { Canvas } from "fabric/fabric-impl";
import { useState, useEffect, useRef } from "react";

export const Editor = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [videos, setVideos] = useState<string[]>([]);

  const videoRef = useRef(null);

  const handleFileChange = (event) => {
    if (!event.target.files[0]) return;
    setVideos([...videos, URL.createObjectURL(event.target.files[0])]);
  };
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
      <div>
        {" "}
        {videos.map((video) => {
          return (
            <video src={video} controls className="h-[200px] w-[200px]"></video>
          );
        })}{" "}
      </div>
      <div>
        <input type="file" accept="video/*" onChange={handleFileChange} />
      </div>
      <div>Hello</div>
      <canvas id="canvas" className="h-[400px] w-[400px]" />
    </div>
  );
};
