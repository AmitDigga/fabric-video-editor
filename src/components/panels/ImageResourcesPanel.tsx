"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { ImageResource } from "../entity/ImageResource";
import { UploadButton } from "../shared/UploadButton";

export const ImageResourcesPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    store.addImageResource(URL.createObjectURL(file));
  };
  return (
    <>
      <div className="flex justify-center mt-4">
        <UploadButton
          accept="image/*"
          className="bg-green-400 w-full max-w-[260px]  hover:bg-green-500 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
          onChange={handleFileChange}
          name="Images"
        /></div>
      <div >
        {store.images.map((image, index) => {
          return <ImageResource key={image} image={image} index={index} />;
        })}
      </div>

    </>
  );
});
