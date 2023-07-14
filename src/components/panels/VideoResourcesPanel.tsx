"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResource } from "../entity/VideoResource";

export const VideoResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addVideoResource(URL.createObjectURL(file));
    store.refreshElements();
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
