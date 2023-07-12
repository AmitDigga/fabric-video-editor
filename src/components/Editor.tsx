"use client";

import { fabric } from "fabric";
import React, { useEffect } from "react";
import { SeekPlayer } from "./SeekPlayer";
import { EditorElement, Placement, Store } from "@/store/Store";
import { StoreContext } from "@/store";
import {
  formatTimeToMinSec,
  isHtmlImageElement,
  isHtmlVideoElement,
} from "@/utils";
import { observer } from "mobx-react";
import {
  MdDownload,
  MdVideoLibrary,
  MdImage,
  MdTransform,
  MdTitle,
  MdOutlineTextFields,
  MdMovie,
  MdAdd,
} from "react-icons/md";
import DragableView from "./DragableView";

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
      case "image": {
        if (document.getElementById(element.properties.elementId) == null)
          continue;
        const imageElement = document.getElementById(
          element.properties.elementId
        );
        if (!isHtmlImageElement(imageElement)) continue;
        const imageObject = new fabric.Image(imageElement, {
          name: element.id,
          left: element.placement.x,
          top: element.placement.y,
          angle: element.placement.rotation,
          objectCaching: false,
          selectable: true,
          lockUniScaling: true,
        });
        element.fabricObject = imageObject;
        element.properties.imageObject = imageObject;
        const image = {
          w: imageElement.naturalWidth,
          h: imageElement.naturalHeight,
        };

        imageObject.width = image.w;
        imageObject.height = image.h;
        imageElement.width = image.w;
        imageElement.height = image.h;
        imageObject.scaleToHeight(image.w);
        imageObject.scaleToWidth(image.h);
        const toScale = {
          x: element.placement.width / image.w,
          y: element.placement.height / image.h,
        };
        imageObject.scaleX = toScale.x * element.placement.scaleX;
        imageObject.scaleY = toScale.y * element.placement.scaleY;
        canvas.add(imageObject);
        canvas.on("object:modified", function (e) {
          if (!e.target) return;
          const target = e.target;
          if (target != imageObject) return;
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
  const Icon = element.type === "video" ? MdMovie : MdOutlineTextFields;
  return (
    <div
      className="flex py-2 px-1 flex-row justify-start items-center"
      key={element.id}
    >
      <Icon size="20" color="gray"></Icon>
      <div className="truncate text-xs ml-2 flex-1 font-medium">
        {element.name}
      </div>
      <div>
        {element.type === "video" ? (
          <video
            className="opacity-0 max-w-[20px] max-h-[20px]"
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
        {element.type === "image" ? (
          <img
            className="opacity-0 max-w-[20px] max-h-[20px]"
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
          ></img>
        ) : null}
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 text-white text-xs py-0 px-1 rounded"
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
const Elements = observer((_props: {}) => {
  const store = React.useContext(StoreContext);
  return (
    <div>
      <div className="flex flex-row justify-between">
        <div className="text-sm px-[16px] py-[7px] font-semibold">Elements</div>
      </div>
      <div className="flex flex-col">
        {store.editorElements.map((element) => {
          return <Element key={element.id} element={element} />;
        })}
      </div>
    </div>
  );
});

type VideoResourceProps = {
  video: string;
  index: number;
};

const VideoResource = observer(({ video, index }: VideoResourceProps) => {
  const store = React.useContext(StoreContext);
  const ref = React.useRef<HTMLVideoElement>(null);
  const [formatedVideoLength, setFormatedVideoLength] = React.useState("00:00");

  return (
    <div className="rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col relative">
      <div className="bg-[rgba(0,0,0,.25)] text-white py-1 absolute text-base top-2 right-2">
        {formatedVideoLength}
      </div>
      <button
        className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
        onClick={() => store.addVideo(index)}
      >
        <MdAdd size="25" />
      </button>
      <video
        onLoadedData={() => {
          const videoLength = ref.current?.duration ?? 0;
          setFormatedVideoLength(formatTimeToMinSec(videoLength));
        }}
        ref={ref}
        className="max-h-[100px] max-w-[150px]"
        src={video}
        height={200}
        width={200}
        id={`video-${index}`}
      ></video>
    </div>
  );
});
type ImageResourceProps = {
  image: string;
  index: number;
};
const ImageResource = observer(({ image, index }: ImageResourceProps) => {
  const store = React.useContext(StoreContext);
  const ref = React.useRef<HTMLImageElement>(null);
  const [resolution, setResolution] = React.useState({ w: 0, h: 0 });

  return (
    <div className="rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col relative">
      <div className="bg-[rgba(0,0,0,.25)] text-white py-1 absolute text-base top-2 right-2">
        {resolution.w}x{resolution.h}
      </div>
      <button
        className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
        onClick={() => store.addImage(index)}
      >
        <MdAdd size="25" />
      </button>
      <img
        onLoad={() => {
          setResolution({
            w: ref.current?.naturalWidth ?? 0,
            h: ref.current?.naturalHeight ?? 0,
          });
        }}
        ref={ref}
        className="max-h-[100px] max-w-[150px]"
        src={image}
        height={200}
        width={200}
        id={`image-${index}`}
      ></img>
    </div>
  );
});

export const TimeFrameView = observer((props: { element: EditorElement }) => {
  const store = React.useContext(StoreContext);
  const { element } = props;

  return (
    <div key={element.id} className="relative width-full h-[25px] my-2">
      <DragableView
        className="z-10"
        value={element.timeFrame.start}
        total={store.maxTime}
        onChange={(value) => {
          store.updateEditorElementTimeFrame(element, {
            start: value,
          });
        }}
      >
        <div className="bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] cursor-ew-resize"></div>
      </DragableView>

      <DragableView
        className="cursor-col-resize"
        value={element.timeFrame.start}
        style={{
          width: `${
            ((element.timeFrame.end - element.timeFrame.start) /
              store.maxTime) *
            100
          }%`,
        }}
        total={store.maxTime}
        onChange={(value) => {
          const { start, end } = element.timeFrame;
          store.updateEditorElementTimeFrame(element, {
            start: value,
            end: value + (end - start),
          });
        }}
      >
        <div className="bg-slate-800 h-full w-full text-white text-xs min-w-[0px] px-2 leading-[25px]">
          {element.name}
        </div>
      </DragableView>
      <DragableView
        className="z-10"
        value={element.timeFrame.end}
        total={store.maxTime}
        onChange={(value) => {
          store.updateEditorElementTimeFrame(element, {
            end: value,
          });
        }}
      >
        <div className="bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] cursor-ew-resize"></div>
      </DragableView>
    </div>
  );
});

export const TimeLine = observer(() => {
  const store = React.useContext(StoreContext);
  const percentOfCurrentTime = (store.currentTimeInMs / store.maxTime) * 100;
  return (
    <>
      <SeekPlayer />
      <div className="relative height-auto">
        <div
          className="w-[2px] bg-red-400 absolute top-0 bottom-0 z-20"
          style={{
            left: `${percentOfCurrentTime}%`,
          }}
        ></div>
        {store.editorElements.map((element) => {
          return <TimeFrameView key={element.id} element={element} />;
        })}
      </div>
    </>
  );
});

export const Menu = observer(() => {
  const store = React.useContext(StoreContext);
  const menuOptions = [
    {
      name: "Video",
      icon: MdVideoLibrary,
      action: () => {
        store.setSelectedMenuOption("Video");
      },
    },
    {
      name: "Image",
      icon: MdImage,
      action: () => {
        store.setSelectedMenuOption("Image");
      },
    },
    {
      name: "Text",
      icon: MdTitle,
      action: () => {
        store.setSelectedMenuOption("Text");
      },
    },
    {
      name: "Animation",
      icon: MdTransform,
      action: () => {
        store.setSelectedMenuOption("Animation");
      },
    },
    {
      name: "Export",
      icon: MdDownload,
      action: () => {
        store.setSelectedMenuOption("Export");
      },
    },
  ];
  return (
    <>
      {menuOptions.map((option) => {
        return (
          <button
            key={option.name}
            onClick={option.action}
            className="py-4 px-2 w-full flex flex-col items-center text-xs"
          >
            <option.icon
              className=""
              size="20"
              color={
                store.selectedMenuOption === option.name ? "#00a0f5" : "black"
              }
            />
            <div
              className={
                store.selectedMenuOption === option.name
                  ? "font-semibold"
                  : "font-light"
              }
            >
              {option.name}
            </div>
          </button>
        );
      })}
    </>
  );
});

export const Resources = observer(() => {
  const store = React.useContext(StoreContext);
  const selectedMenuOption = store.selectedMenuOption;
  return (
    <>
      {selectedMenuOption === "Video" ? <VideoResources /> : null}
      {selectedMenuOption === "Image" ? <ImageResources /> : null}
      {selectedMenuOption === "Text" ? <TextResources /> : null}
      {selectedMenuOption === "Animation" ? <Animations /> : null}
      {selectedMenuOption === "Export" ? <Export /> : null}
    </>
  );
});
export const Animations = observer(() => {
  const store = React.useContext(StoreContext);
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Animations
      </div>
      {store.animations.map((animation) => {
        return <div key={animation.id}>{animation.targetId}</div>;
      })}
    </>
  );
});
export const Export = observer(() => {
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Export
      </div>
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-1 rounded-lg m-4"
        onClick={() => {
          saveCanvasToVideo();
        }}
      >
        Export
      </button>
    </>
  );
});
export const VideoResources = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addVideoResource(URL.createObjectURL(file));
    refreshElements(store);
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Add Video
      </div>
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
        Upload
      </label>
    </>
  );
});
export const ImageResources = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addImageResource(URL.createObjectURL(file));
    refreshElements(store);
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Add Image
      </div>
      {store.images.map((image, index) => {
        return <ImageResource key={image} image={image} index={index} />;
      })}
      <label
        htmlFor="fileInput"
        className="flex flex-col justify-center items-center bg-gray-500 rounded-lg cursor-pointer m-4 py-2 text-white"
      >
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        Upload
      </label>
    </>
  );
});

export const TextResources = observer(() => {
  const store = React.useContext(StoreContext);
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Add Text
      </div>
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-1 rounded-lg m-4"
        onClick={() => {
          store.addText();
          refreshElements(store);
        }}
      >
        Text
      </button>
    </>
  );
});

export const Editor = observer(() => {
  const store = React.useContext(StoreContext);

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
    <div className="grid grid-rows-[50px_500px_1fr] grid-cols-[60px_150px_800px_1fr] h-[100%]">
      <div className="col-span-4 bg-slate-300">
        Video Edtior Prototype Created By Amit Digga
      </div>
      <div className="tile row-span-2 flex flex-col">
        <Menu />
      </div>
      <div className="row-span-2 flex flex-col overflow-auto">
        <Resources />
      </div>
      <canvas id="canvas" className="h-[500px] w-[800px] row col-start-3" />
      <div className="col-start-4 row-start-2">
        <Elements />
      </div>
      <div className="col-start-3 row-start-3 col-span-2 relative overflow-scroll px-[10px] py-[4px]">
        <TimeLine />
      </div>
    </div>
  );
});
