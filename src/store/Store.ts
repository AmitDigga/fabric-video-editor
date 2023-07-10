import { makeAutoObservable } from 'mobx';
import { fabric } from 'fabric';
import { getUid, isHtmlVideoElement } from '@/utils';

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

  addVideoResource(video: string) {
    this.videos = [...this.videos, video];
  }



  setEditorElements(editorElements: EditorElement[]) {
    this.editorElements = editorElements;
  }

  updateEditorElement(editorElement: EditorElement) {
    this.editorElements = this.editorElements.map((element) =>
      element.id === editorElement.id ? editorElement : element
    );
  }


  addEditorElement(editorElement: EditorElement) {
    this.editorElements.push(editorElement);
  }

  removeEditorElement(id: string) {
    this.editorElements = this.editorElements.filter(
      (editorElement) => editorElement.id !== id
    );
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

  addVideo(index:number) {
    const videoElement = document.getElementById(`video-${index}`)
    if(!isHtmlVideoElement(videoElement)){
      return;
    }
    const videoDurationMs = videoElement.duration * 1000;
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const id = getUid();
    this.setEditorElements([
      ...this.editorElements,
      {
        id,
        name: `Media(video) ${index + 1}`,
        type: "video",
        placement: {
          x: 0,
          y: 0,
          width: 100 * aspectRatio,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: videoDurationMs,
        },
        properties: {
          elementId: `video-${id}`,
          src: videoElement.src,
        },
      },
    ]);
  }
  addText() {
    const id = getUid();
    const index = this.editorElements.length;
    this.addEditorElement(
      {
        id,
        name: `Text ${index + 1}`,
        type: "text",
        placement: {
          x: 0,
          y: 0,
          width: 100,
          height: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        timeFrame: {
          start: 0,
          end: 1000,
        },
        properties: {
          text: "Text",
        },
      },
    );
  } 
 handlePlay(
  time: number,
) {
  const keyFrames = this.animationKeyFrames.filter(
    (keyFrame) => keyFrame.time >= time
  );

  this.setPlaying(true);
  this.editorElements.forEach((element) => {
    const itsKeyFrame = keyFrames
      .filter((keyFrame) => keyFrame.id === element.id)
      .sort((a, b) => a.time - b.time);
    if (itsKeyFrame.length != 2) {
      console.log("not enough keyframes");
      return;
    }
    const startKeyFrame = itsKeyFrame[0];
    const endKeyFrame = itsKeyFrame[1];
    const animationDuration = endKeyFrame.time - startKeyFrame.time;
    const timeToStartAnimation = startKeyFrame.time - time;
    setTimeout(() => {
      const fabricObject = this.canvas
        ?.getObjects()
        .find((object) => object.name === element.id);
      if (!fabricObject) return;
      fabricObject.animate("left", endKeyFrame.placement.x, {
        duration: animationDuration,
        easing: fabric.util.ease.easeOutCubic,
      });
    }, timeToStartAnimation);
  });
  this.editorElements
    .filter(
      (element): element is EditorElement & { type: "video" } =>
        element.type === "video"
    )
    .forEach((element) => {
      const video = document.getElementById(element.properties.elementId);
      if (isHtmlVideoElement(video)) {
        video.play();
      }
    });
}

 handlePause(
  time:number
) {
  this.setPlaying(false);
  this.editorElements
    .filter(
      (element): element is EditorElement & { type: "video" } =>
        element.type === "video"
    )
    .forEach((element) => {
      const video = document.getElementById(element.properties.elementId);
      if (isHtmlVideoElement(video)) {
        video.pause();
      }
    });
}

 handleSeek(
  seek: number,
) {
  document
    .getElementById("timeframe-indicator")
    ?.style.setProperty("left", `${(seek / this.maxTime) * 100}%`);
  this.editorElements
    .filter(
      (element): element is EditorElement & { type: "video" } =>
        element.type === "video"
    )
    .forEach((element) => {
      const video = document.getElementById(element.properties.elementId);
      if (isHtmlVideoElement(video)) {
        if (element.properties.imageObject) {
          if (
            seek >= element.timeFrame.start &&
            seek <= element.timeFrame.end
          ) {
            element.properties.imageObject.set({ opacity: 1 });
          } else {
            // element.properties.imageObject.set({ opacity: 0 });
          }
          if (!this.playing) {
            video.currentTime = seek / 1000;
          }
        }
      }
    });
}

}
