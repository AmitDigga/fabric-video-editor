"use client";

import { fabric } from "fabric";
import React, { useEffect } from "react";
import { SeekPlayer } from "./SeekPlayer";
import { EditorElement, Placement, Store } from "@/store/Store";
import { StoreContext } from "@/store";
import { getUid, isHtmlVideoElement } from "@/utils";
import { observer } from "mobx-react";

function refreshElements(store: Store) {
  if (!store.canvas) return;
  const canvas = store.canvas;
  store.canvas.remove(...store.canvas.getObjects());
  for (let index = 0; index < store.editorElements.length; index++) {
    const element = store.editorElements[index];
    switch (element.type) {
      case "video": {
        console.log("elementid", element.properties.elementId);
        if (document.getElementById(element.properties.elementId) == null)
          continue;
        const videoElement = document.getElementById(
          element.properties.elementId
        );
        if (!isHtmlVideoElement(videoElement)) continue;
        const videoObject = new fabric.Image(videoElement, {
          name: element.id,
          left: element.placement.x,
          top: element.placement.y,
          angle: element.placement.rotation,
          objectCaching: false,
          selectable: true,
          lockUniScaling: true,
        });
        element.fabricObject = videoObject;
        element.properties.imageObject = videoObject;
        const video = {
          w: videoElement.videoWidth,
          h: videoElement.videoHeight,
        };

        const toScale = {
          x: element.placement.width / video.w,
          y: element.placement.height / video.h,
        };
        videoObject.width = video.w;
        videoObject.height = video.h;
        videoElement.width = video.w;
        videoElement.height = video.h;
        videoObject.scaleToHeight(video.w);
        videoObject.scaleToWidth(video.h);
        videoObject.scaleX = toScale.x * element.placement.scaleX;
        videoObject.scaleY = toScale.y * element.placement.scaleY;
        canvas.add(videoObject);
        canvas.on("object:modified", function (e) {
          if (!e.target) return;
          const target = e.target;
          if (target != videoObject) return;
          const placement = element.placement;
          let fianlScale = 1;
          if (target.scaleX && target.scaleX > 0) {
            fianlScale = target.scaleX / toScale.x;
          }
          const newPlacement: Placement = {
            ...placement,
            x: target.left ?? placement.x,
            y: target.top ?? placement.y,
            rotation: target.angle ?? placement.rotation,
            scaleX: fianlScale,
            scaleY: fianlScale,
          };
          const newElement = {
            ...element,
            placement: newPlacement,
          };
          store.updateEditorElement(newElement);
        });
        break;
      }
      case "text": {
        const textObject = new fabric.Textbox(element.properties.text, {
          name: element.id,
          left: element.placement.x,
          top: element.placement.y,
          angle: element.placement.rotation,
          objectCaching: false,
          selectable: true,
          lockUniScaling: true,
        });
        element.fabricObject = textObject;
        canvas.add(textObject);
        canvas.on("object:modified", function (e) {
          if (!e.target) return;
          const target = e.target;
          if (target != textObject) return;
          const placement = element.placement;
          const newPlacement: Placement = {
            ...placement,
            x: target.left ?? placement.x,
            y: target.top ?? placement.y,
            rotation: target.angle ?? placement.rotation,
            // scaleX: fianlScale,
            // scaleY : fianlScale,
          };
          const newElement = {
            ...element,
            placement: newPlacement,
            properties: {
              ...element.properties,
              // @ts-ignore
              text: target?.text,
            },
          };
          store.updateEditorElement(newElement);
        });
        break;
      }
      default: {
        throw new Error("Not implemented");
      }
    }
    store.canvas.renderAll();
  }
}

export function saveCanvasToVideo() {
  const video = document.createElement("video");
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const stream = canvas.captureStream();
  video.srcObject = stream;
  video.play();
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = function (e) {
    console.log("data available");
    console.log(e.data);
    chunks.push(e.data);
  };
  mediaRecorder.onstop = function (e) {
    const blob = new Blob(chunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "video.webm";
    a.click();
  };
  mediaRecorder.start();
  setTimeout(() => {
    mediaRecorder.stop();
  }, 4000);
}

const Element = observer((props: { element: EditorElement }) => {
  const store = React.useContext(StoreContext);
  const { element } = props;
  return (
    <div
      className="flex flex-row justify-between items-center max-h-[50px]"
      key={element.id}
    >
      <div className="truncate min-w-[100px]">{element.name}</div>
      <div>
        {element.type === "video" ? (
          <video
            className="opacity-0"
            src={element.properties.src}
            onLoad={() => {
              refreshElements(store);
            }}
            onLoadedData={() => {
              refreshElements(store);
            }}
            height={20}
            width={20}
            id={element.properties.elementId}
          ></video>
        ) : null}
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-1 rounded w-[30px]"
        onClick={() => {
          store.removeEditorElement(element.id);
          refreshElements(store);
        }}
      >
        X
      </button>
    </div>
  );
});
type VideoResourceProps = {
  video: string;
  index: number;
};

const VideoResource = observer(({ video, index }: VideoResourceProps) => {
  const store = React.useContext(StoreContext);

  return (
    <div className="rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col">
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1  w-full"
        onClick={() => store.addVideo(index)}
      >
        Use -{">"}
      </button>
      <video
        className="max-h-[150px] max-w-[150px]"
        src={video}
        height={200}
        width={200}
        id={`video-${index}`}
      ></video>
    </div>
  );
});

export const TimeFrameView = observer((props: { element: EditorElement }) => {
  const store = React.useContext(StoreContext);
  const { element } = props;
  const pxPerMs = 100 / store.maxTime;
  const left = Math.ceil(element.timeFrame.start * pxPerMs);
  const width = Math.ceil(
    (element.timeFrame.end - element.timeFrame.start) * pxPerMs
  );
  return (
    <div key={element.id} className="relative">
      <div
        className={`bg-slate-800 my-[5px] text-white`}
        style={{ width: `${width}%`, marginLeft: `${left}%` }}
      >
        {element.name}
      </div>
      <div className="absolute right-0 top-0">
        <button
          onClick={() => {
            const time = document.getElementById("timeframe-indicator");
            if (time) {
              const left = time.style.left;
              if (left) {
                const timePercentOfMaxTime = parseInt(left.replace("%", ""));
                const time = (timePercentOfMaxTime / 100) * store.maxTime;
                store.addAnimation({
                  id: getUid(),
                  targetId: element.id,
                  endTime: time,
                  easing: "linear",
                  targetProperty: "left",
                  targetValue: element.placement.x,
                });
              }
            }
          }}
        >
          Record Key Frame
        </button>
      </div>
    </div>
  );
});

export const Editor = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addVideoResource(URL.createObjectURL(file));
    refreshElements(store);
  };
  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 800,
      backgroundColor: "#ededed",
    });
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#00a0f5";
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerStrokeColor = "#0063d8";
    fabric.Object.prototype.cornerSize = 10;

    store.setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
  }, []);
  return (
    <div className="grid grid-rows-[50px_500px_1fr] grid-cols-[60px_200px_800px_1fr] h-[100%]">
      <div className="col-span-4 bg-slate-300">
        Video Edtior Prototype Created By Amit Digga
      </div>
      <div className="tile row-span-2 bg-slate-400 flex flex-col">
        Menu
        <button
          onClick={saveCanvasToVideo}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1  w-full"
        >
          Export
        </button>
      </div>
      <div className="row-span-2 flex flex-col bg-slate-200 overflow-auto">
        <div>Resources</div>
        {store.videos.map((video, index) => {
          return <VideoResource key={video} video={video} index={index} />;
        })}
        <label
          htmlFor="fileInput"
          className="flex flex-col justify-center items-center bg-gray-500 rounded-lg cursor-pointer m-4 py-2 text-white"
        >
          <input
            id="fileInput"
            type="file"
            accept="video/mp4,video/x-m4v,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          Add Video
        </label>
        <button
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-1 rounded-lg m-4"
          onClick={() => {
            store.addText();
            refreshElements(store);
          }}
        >
          Add Text
        </button>
        {store.animations.map((animation) => {
          return <div key={animation.id}>{animation.targetId}</div>;
        })}
      </div>
      <canvas id="canvas" className="h-[500px] w-[800px] row col-start-3" />
      <div className="bg-slate-400 col-start-4 row-start-2">
        <div className="flex flex-row justify-between">
          <div>Elements</div>
        </div>
        <div className="flex flex-col">
          {store.editorElements.map((element) => {
            return <Element key={element.id} element={element} />;
          })}
        </div>
      </div>
      <div className="bg-slate-500 col-start-3 row-start-3 col-span-2 relative">
        {/* Heading for timeline */}
        <div className="flex flex-col justify-between">
          <div>Timeline</div>
          <SeekPlayer />
        </div>
        <div
          id="timeframe-indicator"
          className="w-[2px] bg-red-400 absolute left-0 top-0 bottom-0"
        ></div>
        {store.editorElements.map((element) => {
          return <TimeFrameView key={element.id} element={element} />;
        })}
      </div>
    </div>
  );
});
