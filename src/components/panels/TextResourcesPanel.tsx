"use client";
import React from "react";
import { observer } from "mobx-react";
import { TextResource } from "../entity/TextResource";

export const TextResourcesPanel = observer(() => {
  return (
    <div className="bg-slate-800 h-full">
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold text-white">
        Add Text
      </div>
      <TextResource sampleText="Title" fontSize={28} fontWeight={600} />
      <TextResource sampleText="Subtitle" fontSize={16} fontWeight={600} />
      <TextResource sampleText="Body" fontSize={14} fontWeight={400} />
      <TextResource sampleText="Caption" fontSize={12} fontWeight={400} />
      <TextResource sampleText="Heading 1" fontSize={24} fontWeight={800} />
      <TextResource sampleText="Heading 2" fontSize={20} fontWeight={800} />
      <TextResource sampleText="Heading 3" fontSize={18} fontWeight={800} />
      <TextResource sampleText="Heading 4" fontSize={16} fontWeight={800} />
      <TextResource sampleText="Heading 5" fontSize={14} fontWeight={800} />
      <TextResource sampleText="Heading 6" fontSize={12} fontWeight={800} />
    </div>
  );
});
