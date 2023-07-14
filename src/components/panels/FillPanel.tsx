"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { BlockPicker } from "react-color";

export const FillPanel = observer(() => {
  const store = React.useContext(StoreContext);
  // Color Picker
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Fill
      </div>
      <div className="flex items-center justify-center">
        <BlockPicker
          color={store.backgroundColor}
          onChangeComplete={(color: any) => {
            console.log(color);
            store.setBackgroundColor(color.hex);
          }}
        ></BlockPicker>
      </div>
    </>
  );
});
