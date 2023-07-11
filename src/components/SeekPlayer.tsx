"use client";

import { StoreContext } from "@/store";
import { formatTimeToMinSecMili } from "@/utils";
import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { MdPlayArrow, MdPause } from "react-icons/md";

export type Props = {};
export const SeekPlayer = observer((_props: Props) => {
  const store = useContext(StoreContext);
  const Icon = store.playing ? MdPause : MdPlayArrow;
  const formattedTime = formatTimeToMinSecMili(store.currentTimeInMs);
  const formattedMaxTime = formatTimeToMinSecMili(store.maxTime);
  return (
    <div className="seek-player flex flex-col">
      <div className="flex flex-row items-center px-2">
        <button
          className="w-[80px] rounded  px-2 py-2"
          onClick={() => {
            store.setPlaying(!store.playing);
          }}
        >
          <Icon size="40"></Icon>
        </button>
        <span className="font-mono">{formattedTime}</span>
        <div className="w-[1px] h-[25px] bg-slate-300 mx-[10px]"></div>
        <span className="font-mono">{formattedMaxTime}</span>
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
