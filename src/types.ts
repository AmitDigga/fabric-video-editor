import { fabric } from "fabric";

export type EditorElementBase<T extends string, P> = {
  readonly id: string;
  fabricObject?: fabric.Object;
  name: string;
  readonly type: T;
  placement: Placement;
  timeFrame: TimeFrame;
  properties: P;
};
export type VideoEditorElement = EditorElementBase<
  "video",
  { src: string; elementId: string; imageObject?: fabric.Image }
>;
export type ImageEditorElement = EditorElementBase<
  "image",
  { src: string; elementId: string; imageObject?: fabric.Object }
>;

export type AudioEditorElement = EditorElementBase<
  "audio",
  { src: string; elementId: string }
>;
export type TextEditorElement = EditorElementBase<
  "text",
  {
    text: string;
    fontSize: number;
    fontWeight: number;
  }
>;

export type EditorElement =
  | VideoEditorElement
  | ImageEditorElement
  | AudioEditorElement
  | TextEditorElement;

export type Placement = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
};

export type TimeFrame = {
  start: number;
  end: number;
};

export type AnimationKeyFrame = {
  id: string;
  time: number;
  placement: Placement;
};

export type Animation = {
  id: string;
  targetId: string;
  endTime: number;
  easing: "linear";
  targetProperty: keyof fabric.Object;
  targetValue: number;
  delay?: number;
};

export type MenuOption =
  | "Video"
  | "Audio"
  | "Text"
  | "Image"
  | "Export"
  | "Animation"
  | "Fill";
