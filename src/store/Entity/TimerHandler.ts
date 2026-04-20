import { observable, action, makeObservable, computed } from "mobx";
export class TimerHandler {
  currentKeyFrame: number;
  fps: number;
  maxTime: number;
  constructor() {
    this.fps = 60;
    this.currentKeyFrame = 0;
    this.maxTime = 30 * 1000;
    makeObservable(this, {
      currentKeyFrame: observable,
      fps: observable,
      maxTime: observable,
      setCurrentTimeInMs: action,
      setMaxTime: action,
      currentTimeInMs: computed,
    });
  }
  get currentTimeInMs() {
    return (this.currentKeyFrame * 1000) / this.fps;
  }

  setCurrentTimeInMs(time: number) {
    this.currentKeyFrame = Math.floor((time / 1000) * this.fps);
  }
  setMaxTime(maxTime: number) {
    this.maxTime = maxTime;
  }
}
