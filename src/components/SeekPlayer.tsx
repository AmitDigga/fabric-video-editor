"use client";

import { StoreContext } from "@/store";
import { observer } from "mobx-react-lite";
import { useContext } from "react";

export type Props = {};
export const SeekPlayer = observer((_props: Props) => {
  const store = useContext(StoreContext);
  return (
    <div className="seek-player flex flex-col">
      <div className="flex flex-row items-center px-2">
        <button
          className="w-[80px] rounded bg-black text-white px-2 py-2"
          onClick={() => {
            store.setPlaying(!store.playing);
          }}
        >
          {store.playing ? "Pause" : "Play"}
        </button>
        <span className="w-[50px] ml-2">
          {Math.floor((store.currentTimeInMs / 1000) * 10) / 10}s
        </span>
        <span className="w-[50px]">
          / {Math.floor((store.maxTime / 1000) * 10) / 10}s
        </span>
      </div>
      <input
        className="flex-1"
        type="range"
        min={0}
        max={store.maxTime}
        value={store.currentTimeInMs}
        onChange={(event) => {
          store.handleSeek(parseInt(event.target.value));
        }}
      />
    </div>
  );
});
