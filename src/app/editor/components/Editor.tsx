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
    <div className="grid grid-rows-[60%_40%] grid-cols-[60px_200px_1fr] h-[100%]">
      <div className="tile row-span-2 bg-slate-400">Menu</div>
      <div className="row-span-2 flex flex-col bg-slate-200">
        {videos.map((video, index) => {
          return (
            <div key={index} className="rounded bg-slate-800 m-4 flex flex-col">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]"
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
                  });
                  canvas.add(videoObject);
                }}
              >
                Add
              </button>
              <video
                src={video}
                height={200}
                width={200}
                id={`video-${index}`}
              ></video>
            </div>
          );
        })}
        <label
          htmlFor="fileInput"
          className="flex flex-col justify-center items-center bg-gray-500 rounded-lg cursor-pointer m-4  h-[150px] text-white"
        >
          <input id="fileInput" type="file"  className="hidden" onChange={handleFileChange} />
          Add Video
          <svg
            className="h-6 w-6 text-white mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </label>
      </div>
      <canvas
        id="canvas"
        className="h-[400px] w-[400px] row col-start-3 start-1"
      />
      <div className="bg-slate-500 col-start-3 row-start-2">time line</div>
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
