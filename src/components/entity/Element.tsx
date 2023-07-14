"use client";
import React from "react";
import { EditorElement } from "@/types";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { MdOutlineTextFields, MdMovie } from "react-icons/md";

export type ElementProps = {
  element: EditorElement;
};

export const Element = observer((props: ElementProps) => {
  const store = React.useContext(StoreContext);
  const { element } = props;
  const Icon = element.type === "video" ? MdMovie : MdOutlineTextFields;
  const isSelected = store.selectedElement?.id === element.id;
  const bgColor = isSelected ? "rgba(0, 160, 245, 0.1)" : "";
  return (
    <div
      style={{
        backgroundColor: bgColor,
      }}
      className={`flex mx-2 my-1 py-2 px-1 flex-row justify-start items-center ${bgColor} max-w-[200px]`}
      key={element.id}
      onClick={() => {
        store.setSelectedElement(element);
      }}
    >
      <Icon size="20" color="gray"></Icon>
      <div className="truncate text-xs ml-2 flex-1 font-medium">
        {element.name}
      </div>
      <div>
        {element.type === "video" ? (
          <video
            className="opacity-0 max-w-[20px] max-h-[20px]"
            src={element.properties.src}
            onLoad={() => {
              store.refreshElements();
            }}
            onLoadedData={() => {
              store.refreshElements();
            }}
            height={20}
            width={20}
            id={element.properties.elementId}
          ></video>
        ) : null}
        {element.type === "image" ? (
          <img
            className="opacity-0 max-w-[20px] max-h-[20px]"
            src={element.properties.src}
            onLoad={() => {
              store.refreshElements();
            }}
            onLoadedData={() => {
              store.refreshElements();
            }}
            height={20}
            width={20}
            id={element.properties.elementId}
          ></img>
        ) : null}
        {element.type === "audio" ? (
          <audio
            className="opacity-0 max-w-[20px] max-h-[20px]"
            src={element.properties.src}
            onLoad={() => {
              store.refreshElements();
            }}
            onLoadedData={() => {
              store.refreshElements();
            }}
            id={element.properties.elementId}
          ></audio>
        ) : null}
      </div>
      <button
        className="bg-red-500 hover:bg-red-700 text-white mr-2 text-xs py-0 px-1 rounded"
        onClick={(e) => {
          store.removeEditorElement(element.id);
          store.refreshElements();
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        X
      </button>
    </div>
  );
});
