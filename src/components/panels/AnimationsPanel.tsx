"use client";
import React from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { AnimationResource } from "../entity/AnimationResource";

export const AnimationsPanel = observer(() => {
  const store = React.useContext(StoreContext);
  const selectedElement = store.selectedElement;
  const selectedElementAnimations = store.animations.filter((animation) => {
    return animation.targetId === selectedElement?.id;
  });
  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Animations
      </div>
      {selectedElementAnimations.map((animation) => {
        return <AnimationResource key={animation.id} animation={animation} />;
      })}
    </>
  );
});
