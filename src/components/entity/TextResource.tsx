"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { MdAdd } from "react-icons/md";

type TextResourceProps = {
  fontSize: number;
  fontWeight: number;
  sampleText: string;
};
export const TextResource = observer(
  ({ fontSize, fontWeight, sampleText }: TextResourceProps) => {
    const store = React.useContext(StoreContext);
    return (
      <div className="items-center m-[15px] flex flex-row">
        <div
          className="flex-1 text-black px-2 py-1"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: `${fontWeight}`,
          }}
        >
          {sampleText}
        </div>
        <button
          className="h-[32px] w-[32px] hover:bg-black bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 flex items-center justify-center"
          onClick={() =>
            store.addText({
              text: sampleText,
              fontSize: fontSize,
              fontWeight: fontWeight,
            })
          }
        >
          <MdAdd size="25" />
        </button>
      </div>
    );
  }
);
