"use client";

import { fabric } from "fabric";
import { Canvas } from "fabric/fabric-impl";
import { useState, useEffect } from "react";

export const Editor = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [videos, setVideos] = useState<string[]>([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setVideos([...videos, URL.createObjectURL(file)]);
  };
  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 400,
      width: 400,
      backgroundColor: "pink",
    });
    setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
  }, []);
  return (
    <div>
      <div>
        <div className="flex flex-row">
          {videos.map((video, index) => {
            return (
              <div key={index}>
                <button
                  onClick={() => {
                    if (!canvas) return;
                    const videoElement = getHtmlVideoElement(
                      document.getElementById(`video-${index}`)
                    );
                    const videoObject = new fabric.Image(videoElement, {
                      // backgroundColor: "red",
                      left: 20,
                      top: 20,
                      objectCaching: false,
                      stroke: "black",
                      strokeWidth: 1,
                      selectable: true,
                      // scaleX: 0.5,
                      // scaleY: 0.5,
                    });
                    // videoObject.scaleToHeight(300);
                    // videoObject.scaleToWidth(300);
                    canvas.add(videoObject);
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setVideos(videos.filter((_, i) => i !== index));
                  }}
                >
                  Remove
                </button>
                <video
                  src={video}
                  controls
                  height={200}
                  width={200}
                  id={`video-${index}`}
                  // className="h-[200px] w-[200px]"
                ></video>
              </div>
            );
          })}
          <input type="file" onChange={handleFileChange} />
        </div>
      </div>
      <div>Hello</div>
      <canvas id="canvas" className="h-[400px] w-[400px]" />
    </div>
  );
};

function isHtmlVideoElement(
  element:
    | HTMLVideoElement
    | HTMLImageElement
    | HTMLCanvasElement
    | null
    | HTMLElement
): element is HTMLVideoElement {
  if (!element) return false;
  return element.tagName === "VIDEO";
}
function isHtmlImageElement(
  element:
    | HTMLVideoElement
    | HTMLImageElement
    | HTMLCanvasElement
    | null
    | HTMLElement
): element is HTMLImageElement {
  if (!element) return false;
  return element.tagName === "IMG";
}

function getHtmlVideoElement(
  element:
    | HTMLVideoElement
    | HTMLImageElement
    | HTMLCanvasElement
    | null
    | HTMLElement
): HTMLVideoElement {
  if (!isHtmlVideoElement(element)) {
    throw new Error("Element is not a video element");
  }
  return element;
}
