"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";

export const ExportVideoPanel = observer(() => {
  const store = React.useContext(StoreContext);

  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Export
      </div>
      {/* Set max time from number input */}
      <div className="px-[16px]">
        <div className="flex flex-row items-center my-2">
          <div className="text-xs font-semibold mr-2">Video Length:</div>
          <input
            type="number"
            className="rounded text-center border-slate-200 placeholder-slate-400 contrast-more:border-slate-400 contrast-more:placeholder-slate-500 max-w-[50px] mr-2"
            value={store.maxTime / 1000}
            onChange={(e) => {
              const value = e.target.value;
              store.setMaxTime(Number(value) * 1000);
            }}
          />
          <div>secs</div>
        </div>
        <div className="flex flex-row items-center my-2">
          <div className="text-xs font-semibold mr-2">Canvas Resolution:</div>
          <div className="text-xs mr-2">Todo</div>
        </div>
      </div>
      {/*  Format selection with radio button */}
      <div className="px-[16px]">
        <div className="text-xs font-semibold mr-2">Video Format:</div>
        <div className="flex flex-row items-center my-2">
          <input
            type="radio"
            className="mr-2"
            name="video-format"
            value="mp4"
            checked={store.selectedVideoFormat === "mp4"}
            onChange={(e) => {
              store.setVideoFormat("mp4");
            }}
          />
          <div className="text-xs mr-2">MP4</div>
          <input
            type="radio"
            className="mr-2"
            name="video-format"
            value="gif"
            checked={store.selectedVideoFormat === "webm"}
            onChange={(e) => {
              store.setVideoFormat("webm");
            }}
          />
          <div className="text-xs mr-2">webm</div>
        </div>
      </div>

      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-1 rounded-lg m-4"
        onClick={() => {
          store.handleSeek(0);
          store.setSelectedElement(null);
          setTimeout(() => {
            if (store.selectedVideoFormat === "mp4") {
              store.setPlaying(false);
              store.saveCanvasToVideoWithAudio();
            } else {
              store.setPlaying(true);
              store.saveCanvasToVideoWithAudio();
            }
          }, 1000);
        }}
      >
        Export Video ({store.maxTime / 1000} secs)
      </button>
    </>
  );
});
