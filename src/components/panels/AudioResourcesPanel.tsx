"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { AudioResource } from "../entity/AudioResource";
import { UploadButton } from "../shared/UploadButton";

export const AudioResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addAudioResource(URL.createObjectURL(file));
  };
  return (
    <>

      {store.audios.map((audio, index) => {
        return <AudioResource key={audio} audio={audio} index={index} />;
      })}
      <div className="flex justify-center mt-4">
        <UploadButton
          accept="audio/mp3,audio/*"
          className="bg-green-400 w-full max-w-[260px]  hover:bg-green-500 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
          onChange={handleFileChange}
          name="Audios"
        />
      </div>
    </>
  );
});
