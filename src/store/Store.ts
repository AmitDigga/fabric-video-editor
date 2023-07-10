import { makeAutoObservable } from 'mobx';
import { fabric } from 'fabric';

export type EditorElementBase<T extends string, P> = {
  readonly id: string;
  name: string;
  readonly type: T;
  placement: Placement;
  timeFrame: TimeFrame;
  properties: P;
};

export type EditorElement =
  | EditorElementBase<
      "video",
      { src: string; elementId: string; imageObject?: fabric.Image }
    >
  | EditorElementBase<"text", { text: string }>;

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



export class Store {
  canvas: fabric.Canvas | null 
  videos: string[] 
  editorElements: EditorElement[] 
  maxTime: number 
  animationKeyFrames: AnimationKeyFrame[]

  playing: boolean;

  constructor() {
    this.canvas = null;
    this.videos = [];
    this.editorElements = [];
    this.maxTime = 60 * 1000;
    this.animationKeyFrames = [];
    this.playing = false;
    makeAutoObservable(this);
  }

  setCanvas(canvas: fabric.Canvas | null) {
    this.canvas = canvas;
  }

  setVideos(videos: string[]) {
    this.videos = videos;
  }

  setEditorElements(editorElements: EditorElement[]) {
    this.editorElements = editorElements;
  }

  setMaxTime(maxTime: number) {
    this.maxTime = maxTime;
  }

  setAnimationKeyFrames(animationKeyFrames: AnimationKeyFrame[]) {
    this.animationKeyFrames = animationKeyFrames;
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
  }
}
