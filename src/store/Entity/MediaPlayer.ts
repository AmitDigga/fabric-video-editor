import { getUid, isHtmlAudioElement, isHtmlVideoElement } from "../../utils";
import { ElementHandler } from "./ElementHandler";
import { AudioEditorElement, VideoEditorElement } from "../../types";
import { observable, action, makeObservable, computed } from "mobx";
export class MediaPlayer extends ElementHandler {
  playing: boolean;
  constructor() {
    super();
    this.playing = false;
    makeObservable(this, {
      playing: observable,
      setPlaying: action,
      playFrames: action,
      updateVideoElements: action,
      updateAudioElements: action,

      handleSeek: action,
    });
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
    this.updateVideoElements();
    this.updateAudioElements();
    if (playing) {
      this.startedTime = Date.now();
      this.startedTimePlay = this.currentTimeInMs;
      requestAnimationFrame(() => {
        this.playFrames();
      });
    }
  }
  updateAudioElements() {
    this.editorElements
      .filter(
        (element): element is AudioEditorElement => element.type === "audio"
      )
      .forEach((element) => {
        const audio = document.getElementById(element.properties.elementId);
        if (isHtmlAudioElement(audio)) {
          const audioTime =
            (this.currentTimeInMs - element.timeFrame.start) / 1000;
          audio.currentTime = audioTime;
          if (this.playing) {
            audio.play();
          } else {
            audio.pause();
          }
        }
      });
  }
  startedTime = 0;
  startedTimePlay = 0;

  playFrames() {
    if (!this.playing) {
      return;
    }
    const elapsedTime = Date.now() - this.startedTime;
    const newTime = this.startedTimePlay + elapsedTime;
    this.updateTimeTo(newTime);
    if (newTime > this.maxTime) {
      this.currentKeyFrame = 0;
      this.setPlaying(false);
    } else {
      requestAnimationFrame(() => {
        this.playFrames();
      });
    }
  }


  handleSeek(seek: number) {
    if (this.playing) {
      this.setPlaying(false);
    }
    this.updateTimeTo(seek);
    this.updateVideoElements();
    this.updateAudioElements();
  }
  updateVideoElements() {
    this.editorElements
      .filter(
        (element): element is VideoEditorElement => element.type === "video"
      )
      .forEach((element) => {
        const video = document.getElementById(element.properties.elementId);
        if (isHtmlVideoElement(video)) {
          const videoTime =
            (this.currentTimeInMs - element.timeFrame.start) / 1000;
          video.currentTime = videoTime;
          if (this.playing) {
            video.play();
          } else {
            video.pause();
          }
        }
      });
  }
}
