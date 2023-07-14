"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { AudioResource } from "../entity/AudioResource";

export const AudioResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addAudioResource(URL.createObjectURL(file));
    store.refreshElements();
  };
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Add Audio
      </div>
      {store.audios.map((audio, index) => {
        return <AudioResource key={audio} audio={audio} index={index} />;
      })}
      <label
        htmlFor="fileInput"
        className="flex flex-col justify-center items-center bg-gray-500 rounded-lg cursor-pointer m-4 py-2 text-white"
      >
        <input
          id="fileInput"
          type="file"
          accept="audio/mp3,audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
        Upload
      </label>
    </>
  );
});
