"use client";

import { fabric } from "fabric";
import { Canvas } from "fabric/fabric-impl";
import { useState, useEffect } from "react";

export type Placement = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type TimeFrame = {
  start: number;
  end: number;
}

export type EditorElementBase<T extends string,P> = {
  readonly id: string;
  name: string;
  readonly type : T;
  placement: Placement;
  timeFrame: TimeFrame;
  properties: P;
}

export type EditorElement = EditorElementBase<"video",{ elementId:string }> | EditorElementBase<"image",{ src: string }>;

export const Editor = () => {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [editorElements, setEditorElements] = useState<EditorElement[]>([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setVideos([...videos, URL.createObjectURL(file)]);
  };
  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 800,
      backgroundColor: "pink",
    });
    setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
  }, []);
  useEffect(() => {
    if (!canvas) return;
    canvas.remove(...canvas.getObjects());
      for(const element of editorElements){
        switch(element.type){
          case "video":
            const videoElement = getHtmlVideoElement(
              document.getElementById(element.properties.elementId)
            );
            const videoObject = new fabric.Image(videoElement, {
              // backgroundColor: "red",
              left: element.placement.x,
              top: element.placement.y,
              objectCaching: false,
              stroke: "black",
              strokeWidth: 1,
              // height: element.placement.height,
              // width: element.placement.width,
              selectable: true,
            });
            canvas.add(videoObject);
            console.log(videoObject)
            break;
          case "image": {
            throw new Error("Not implemented")
          };
          default:{
            throw new Error("Not implemented")
          };
        }
      }
  }, [editorElements]);
  return (
    <div className="grid grid-rows-[500px_1fr] grid-cols-[60px_200px_800px_1fr] h-[100%]">
      <div className="tile row-span-2 bg-slate-400">Menu</div>
      <div className="row-span-2 flex flex-col bg-slate-200">
        {videos.map((video, index) => {
          return (
            <div key={index} className="rounded bg-slate-800 m-4 flex flex-col">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]"
                onClick={() => {
                  if (!canvas) return;
                  console.log("add");
                  const videoElement = getHtmlVideoElement(
                    document.getElementById(`video-${index}`)
                  );
                  console.log(videoElement);
                  setEditorElements([...editorElements, {
                    id: getUid(),
                    name: `Media(video) ${index+1}`,
                    type: "video",
                    placement: {
                      x: 0,
                      y: 0,
                      width:100,
                      height: 100,
                      rotation: 0,
                    },
                    timeFrame: {
                      start: 0,
                      end: 0,
                    },
                    properties: {
                      elementId: `video-${index}`,
                      // src: videoElement.src,
                    },
                  }])
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
        className="h-[500px] w-[800px] row col-start-3"
      />
      <div className="bg-slate-400 col-start-4 row-start-1">
        {/* Heading for elements */}
        <div className="flex flex-row justify-between">
          <div>Elements</div>
          </div>
        <div className="flex flex-col">
          {editorElements.map((element) => {
            return (
              <div className="flex flex-row justify-between" key={element.id}>
                <div>{element.name}</div>
                <div>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-[100px]"
                    onClick={() => {
                      setEditorElements(
                        editorElements.filter((e) => e.id !== element.id)
                      );
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          </div>
      </div>
      <div className="bg-slate-500 col-start-3 row-start-2 col-span-2">time line</div>
    </div>
  );
};

function getUid() {
  return Math.random().toString(36).substring(2, 9);
}

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
