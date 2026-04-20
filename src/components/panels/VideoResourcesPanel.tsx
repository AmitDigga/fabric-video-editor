"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { VideoResource } from "../entity/VideoResource";
import { UploadButton } from "../shared/UploadButton";

export const VideoResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addVideoResource(URL.createObjectURL(file));
  };
  return (
    <>

      {store.videos.map((video, index) => {
        return <VideoResource key={video} video={video} index={index} />;
      })}
      <div className="flex justify-center mt-4">
        <UploadButton
          accept="video/mp4,video/x-m4v,video/*"
          className="bg-green-400 w-full max-w-[260px]  hover:bg-green-500 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
          onChange={handleFileChange}
          name={'Videos'}
        />
      </div>
    </>
  );
});
