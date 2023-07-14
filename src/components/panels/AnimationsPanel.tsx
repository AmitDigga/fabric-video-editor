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
      </div>
      {store.animations.map((animation) => {
        return <div key={animation.id}>{animation.targetId}</div>;
      })}
    </>
  );
});
