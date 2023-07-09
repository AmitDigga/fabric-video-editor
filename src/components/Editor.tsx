"use client";

import { fabric } from "fabric";
import React, { useState, useEffect } from "react";
import { SeekPlayer } from "./SeekPlayer";

export type Placement = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

export type TimeFrame = {
  start: number;
  end: number;
};

export type AnimationKeyFrame = {
  id: string;
  time: number;
  placement: Placement;
};

export type EditorElementBase<T extends string, P> = {
  readonly id: string;
  name: string;
  readonly type: T;
  placement: Placement;
  timeFrame: TimeFrame;
  properties: P;
};

export type EditorElement =
  | EditorElementBase<
      "video",
      { src: string; elementId: string; imageObject?: fabric.Image }
    >
  | EditorElementBase<"text", { text: string }>;

function refreshElements(
  canvas: fabric.Canvas | null,
  editorElements: EditorElement[],
  setEditorElements: (elements: EditorElement[]) => void
) {
  if (!canvas) return;
  canvas.remove(...canvas.getObjects());
  for (let index = 0; index < editorElements.length; index++) {
    const element = editorElements[index];
    switch (element.type) {
      case "video": {
        console.log("elementid", element.properties.elementId);
        if (document.getElementById(element.properties.elementId) == null)
          continue;
        const videoElement = getHtmlVideoElement(
          document.getElementById(element.properties.elementId)
        );
        const videoObject = new fabric.Image(videoElement, {
          name: element.id,
          left: element.placement.x,
          top: element.placement.y,
          angle: element.placement.rotation,
          objectCaching: false,
          selectable: true,
          lockUniScaling: true,
        });
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
          const newEditorElements = [...editorElements];
          newEditorElements[index] = newElement;
          setEditorElements(newEditorElements);
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
          const newEditorElements = [...editorElements];
          newEditorElements[index] = newElement;
          setEditorElements(newEditorElements);
        });
        break;
      }
      default: {
        throw new Error("Not implemented");
      }
    }
  }
}

export const Editor = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [editorElements, setEditorElements] = useState<EditorElement[]>([]);
  const [maxTime] = useState<number>(60 * 1000);
  const [animationKeyFrames, setAnimationKeyFrames] = useState<
    AnimationKeyFrame[]
  >([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideos([...videos, URL.createObjectURL(file)]);
  };
  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 800,
      backgroundColor: "#ededed",
    });
    setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });
  }, []);
  useEffect(
    () => refreshElements(canvas, editorElements, setEditorElements),
    [editorElements, canvas]
  );
  return (
    <div className="grid grid-rows-[50px_500px_1fr] grid-cols-[60px_200px_800px_1fr] h-[100%]">
      <div className="col-span-4 bg-slate-300">
        Video Edtior Prototype Created By Amit Digga
      </div>
      <div className="tile row-span-2 bg-slate-400 flex flex-col">
        Menu
        <button
          onClick={() => {
            // save canvas to video
            const video = document.createElement("video");
            const canvas = document.getElementById(
              "canvas"
            ) as HTMLCanvasElement;
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
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1  w-full"
        >
          Export
        </button>
      </div>
      <div className="row-span-2 flex flex-col bg-slate-200 overflow-auto">
        <div>Resources</div>
        {videos.map((video, index) => {
          return (
            <div
              key={index}
              className="rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col"
            >
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1  w-full"
                onClick={() => {
                  if (!canvas) return;
                  const videoElement = getHtmlVideoElement(
                    document.getElementById(`video-${index}`)
                  );
                  const videoDurationMs = videoElement.duration * 1000;
                  const aspectRatio =
                    videoElement.videoWidth / videoElement.videoHeight;
                  const id = getUid();
                  setEditorElements([
                    ...editorElements,
                    {
                      id,
                      name: `Media(video) ${index + 1}`,
                      type: "video",
                      placement: {
                        x: 0,
                        y: 0,
                        width: 100 * aspectRatio,
                        height: 100,
                        rotation: 0,
                        scaleX: 1,
                        scaleY: 1,
                      },
                      timeFrame: {
                        start: 0,
                        end: videoDurationMs,
                      },
                      properties: {
                        elementId: `video-${id}`,
                        src: videoElement.src,
                      },
                    },
                  ]);
                }}
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
            if (!canvas) return;
            const id = getUid();
            setEditorElements([
              ...editorElements,
              {
                id,
                name: `Text ${editorElements.length + 1}`,
                type: "text",
                placement: {
                  x: 0,
                  y: 0,
                  width: 100,
                  height: 100,
                  rotation: 0,
                  scaleX: 1,
                  scaleY: 1,
                },
                timeFrame: {
                  start: 0,
                  end: maxTime,
                },
                properties: {
                  text: "Text",
                },
              },
            ]);
          }}
        >
          Add Text
        </button>
      </div>
      <canvas id="canvas" className="h-[500px] w-[800px] row col-start-3" />
      <div className="bg-slate-400 col-start-4 row-start-2">
        {/* Heading for elements */}
        <div className="flex flex-row justify-between">
          <div>Elements</div>
        </div>
        <div className="flex flex-col">
          {editorElements.map((element) => {
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
                        refreshElements(
                          canvas,
                          editorElements,
                          setEditorElements
                        );
                      }}
                      onLoadedData={() => {
                        refreshElements(
                          canvas,
                          editorElements,
                          setEditorElements
                        );
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
                    setEditorElements(
                      editorElements.filter((e) => e.id !== element.id)
                    );
                  }}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="bg-slate-500 col-start-3 row-start-3 col-span-2 relative">
        {/* Heading for timeline */}
        <div className="flex flex-col justify-between">
          <div>Timeline</div>
          <SeekPlayer
            key={editorElements.length}
            onPlay={(time) => {
              console.log(animationKeyFrames);
              const keyFrames = animationKeyFrames.filter(
                (keyFrame) => keyFrame.time >= time
              );

              setIsPlaying(true);
              editorElements.forEach((element) => {
                const itsKeyFrame = keyFrames
                  .filter((keyFrame) => keyFrame.id === element.id)
                  .sort((a, b) => a.time - b.time);
                if (itsKeyFrame.length != 2) {
                  console.log("not enough keyframes");
                  return;
                }
                const startKeyFrame = itsKeyFrame[0];
                const endKeyFrame = itsKeyFrame[1];
                const animationDuration = endKeyFrame.time - startKeyFrame.time;
                const timeToStartAnimation = startKeyFrame.time - time;
                setTimeout(() => {
                  const fabricObject = canvas
                    ?.getObjects()
                    .find((object) => object.name === element.id);
                  if (!fabricObject) return;
                  fabricObject.animate("left", endKeyFrame.placement.x, {
                    duration: animationDuration,
                    easing: fabric.util.ease.easeOutCubic,
                  });
                }, timeToStartAnimation);
              });
              editorElements
                .filter(
                  (element): element is EditorElement & { type: "video" } =>
                    element.type === "video"
                )
                .forEach((element) => {
                  const video = document.getElementById(
                    element.properties.elementId
                  );
                  if (isHtmlVideoElement(video)) {
                    video.play();
                  }
                });
            }}
            onPause={() => {
              setIsPlaying(false);
              editorElements
                .filter(
                  (element): element is EditorElement & { type: "video" } =>
                    element.type === "video"
                )
                .forEach((element) => {
                  const video = document.getElementById(
                    element.properties.elementId
                  );
                  if (isHtmlVideoElement(video)) {
                    video.pause();
                  }
                });
            }}
            maxTime={maxTime}
            onSeek={(seek) => {
              document
                .getElementById("timeframe-indicator")
                ?.style.setProperty("left", `${(seek / maxTime) * 100}%`);
              editorElements
                .filter(
                  (element): element is EditorElement & { type: "video" } =>
                    element.type === "video"
                )
                .forEach((element) => {
                  const video = document.getElementById(
                    element.properties.elementId
                  );
                  if (isHtmlVideoElement(video)) {
                    if (element.properties.imageObject) {
                      if (
                        seek >= element.timeFrame.start &&
                        seek <= element.timeFrame.end
                      ) {
                        element.properties.imageObject.set({ opacity: 1 });
                      } else {
                        element.properties.imageObject.set({ opacity: 0 });
                      }
                      if (!isPlaying) {
                        video.currentTime = seek / 1000;
                      }
                    }
                  }
                });
            }}
          />
        </div>
        <div
          id="timeframe-indicator"
          className="w-[2px] bg-red-400 absolute left-0 top-0 bottom-0"
        ></div>
        {editorElements.map((element) => {
          const pxPerMs = 100 / maxTime;
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
                        const timePercentOfMaxTime = parseInt(
                          left.replace("%", "")
                        );
                        const time = (timePercentOfMaxTime / 100) * maxTime;
                        const keyFrame: AnimationKeyFrame = {
                          id: element.id,
                          time: time,
                          placement: element.placement,
                        };
                        setAnimationKeyFrames([
                          ...animationKeyFrames,
                          keyFrame,
                        ]);
                      }
                    }
                  }}
                >
                  Record Key Frame
                </button>
              </div>
            </div>
          );
        })}
      </div>
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
