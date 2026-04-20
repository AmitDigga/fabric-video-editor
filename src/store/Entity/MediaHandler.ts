import { EditorElement, TimeFrame } from "@/types";
import {
  getUid,
  isHtmlAudioElement,
  isHtmlImageElement,
  isHtmlVideoElement,
} from "../../utils";
import { MediaPlayer } from "./MediaPlayer";
import { action, makeObservable } from "mobx";
export class MediaHandler extends MediaPlayer {
  constructor() {
    super();
    makeObservable(this, {
      addAudio: action,
      addVideo: action,
      addImage: action,
      addText: action,
      updateEditorElementTimeFrame: action,
    });
  }
  addVideo(index: number) {
    const videoElement = document.getElementById(`video-${index}`);
    if (!isHtmlVideoElement(videoElement)) {
      return;
    }
    const videoDurationMs = videoElement.duration * 1000;
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const id = getUid();
    this.addEditorElement({
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
        effect: {
          type: "none",
        },
      },
    });
  }

  addImage(index: number) {
    const imageElement = document.getElementById(`image-${index}`);
    if (!isHtmlImageElement(imageElement)) {
      return;
    }
    const aspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const id = getUid();
    this.addEditorElement({
      id,
      name: `Media(image) ${index + 1}`,
      type: "image",
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
        end: this.maxTime,
      },
      properties: {
        elementId: `image-${id}`,
        src: imageElement.src,
        effect: {
          type: "none",
        },
      },
    });
  }

  addAudio(index: number) {
    const audioElement = document.getElementById(`audio-${index}`);
    if (!isHtmlAudioElement(audioElement)) {
      return;
    }
    const audioDurationMs = audioElement.duration * 1000;
    const id = getUid();
    this.addEditorElement({
      id,
      name: `Media(audio) ${index + 1}`,
      type: "audio",
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
        end: audioDurationMs,
      },
      properties: {
        elementId: `audio-${id}`,
        src: audioElement.src,
      },
    });
  }
  addText(options: { text: string; fontSize: number; fontWeight: number }) {
    const id = getUid();
    const index = this.editorElements.length;
    this.addEditorElement({
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
        end: this.maxTime,
      },
      properties: {
        text: options.text,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        splittedTexts: [],
      },
    });
  }
  updateEditorElementTimeFrame(
    editorElement: EditorElement,
    timeFrame: Partial<TimeFrame>
  ) {
    if (timeFrame.start != undefined && timeFrame.start < 0) {
      timeFrame.start = 0;
    }
    if (timeFrame.end != undefined && timeFrame.end > this.maxTime) {
      timeFrame.end = this.maxTime;
    }
    const newEditorElement = {
      ...editorElement,
      timeFrame: {
        ...editorElement.timeFrame,
        ...timeFrame,
      },
    };
    this.updateVideoElements();
    this.updateAudioElements();
    this.updateEditorElement(newEditorElement);
    this.refreshAnimations();
  }
}
