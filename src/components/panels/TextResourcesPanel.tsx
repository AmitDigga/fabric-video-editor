"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";

export const TextResourcesPanel = observer(() => {
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
          store.refreshElements();
        }}
      >
        Text
      </button>
    </>
  );
});
