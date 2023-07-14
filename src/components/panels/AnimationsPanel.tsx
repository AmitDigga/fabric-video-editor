"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";

export const AnimationsPanel = observer(() => {
  const store = React.useContext(StoreContext);
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Animations
        <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
          WIP
        </span>
      </div>
      {store.animations.map((animation) => {
        return <div key={animation.id}>{animation.targetId}</div>;
      })}
    </>
  );
});
