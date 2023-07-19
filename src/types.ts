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
  { src: string; elementId: string; imageObject?: fabric.Image, effect: Effect }
>;
export type ImageEditorElement = EditorElementBase<
  "image",
  { src: string; elementId: string; imageObject?: fabric.Object, effect: Effect }
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

export type EffectBase<T extends string> = {
  type: T;
}

export type BlackAndWhiteEffect = EffectBase<"none"> | EffectBase<"blackAndWhite">;
export type Effect = BlackAndWhiteEffect;

export type AnimationBase<T> = {
  id: string;
  targetId: string;
  duration: number;
  type: T;
}

export type FadeInAnimation = AnimationBase<"fadeIn">;
export type FadeOutAnimation = AnimationBase<"fadeOut">;

export type Animation = FadeInAnimation | FadeOutAnimation;

export type MenuOption =
  | "Video"
  | "Audio"
  | "Text"
  | "Image"
  | "Export"
  | "Animation"
  | "Effect"
  | "Fill";
