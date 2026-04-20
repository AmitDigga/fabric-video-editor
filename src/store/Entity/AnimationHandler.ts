import { fabric } from "fabric";
import anime, { get } from "animejs";
import {
  EditorElement,
  SlideDirection,
  TAnimation,
  TextEditorElement,
} from "../../types";
import { FabricUitls } from "../../utils/fabric-utils";
import { TimerHandler } from "./TimerHandler";
import { observable, action, makeObservable, computed } from "mobx";
export class AnimationHandler extends TimerHandler{
  canvas: fabric.Canvas | null;
  animationTimeLine: anime.AnimeTimelineInstance;
  animations: TAnimation[];
  editorElements: EditorElement[];
  constructor() {
    super();
    this.canvas = null;
    this.animationTimeLine = anime.timeline();
    this.animations = [];
    this.editorElements = [];
    makeObservable(this, {
      canvas: observable,
      animationTimeLine: observable,
      animations: observable,
      editorElements: observable,
      addAnimation: action,
      updateAnimation: action,
      refreshAnimations: action,
      removeAnimation: action,
    });
  }
  addAnimation(animation: TAnimation) {
    this.animations = [...this.animations, animation];
    this.refreshAnimations();
  }
  updateAnimation(id: string, animation: TAnimation) {
    const index = this.animations.findIndex((a) => a.id === id);
    this.animations[index] = animation;
    this.refreshAnimations();
  }
  refreshAnimations() {
    anime.remove(this.animationTimeLine);
    this.animationTimeLine = anime.timeline({
      duration: this.maxTime,
      autoplay: false,
    });
    for (let i = 0; i < this.animations.length; i++) {
      const animation = this.animations[i];
      const editorElement = this.editorElements.find(
        (element) => element.id === animation.targetId
      );
      const fabricObject = editorElement?.fabricObject;
      if (!editorElement || !fabricObject) {
        continue;
      }
      fabricObject.clipPath = undefined;
      const animationParams = (opacity: number[]) => {
        return {
          opacity: opacity,
          duration: animation.duration,
          targets: fabricObject,
          easing: "linear",
        };
      };
      switch (animation.type) {
        case "fadeIn": {
          this.animationTimeLine.add(
            animationParams([0,1]),
            editorElement.timeFrame.start
          );
          break;
        }
        case "fadeOut": {
          this.animationTimeLine.add(
            animationParams([1,0]),
            editorElement.timeFrame.end - animation.duration
          );
          break;
        }
        case "slideIn": {
          let { direction, startPosition, targetPosition } = this.slidePozition(
            animation,
            editorElement,
            0
          );
          [startPosition, targetPosition] = [targetPosition, startPosition];
          if (animation.properties.useClipPath) {
            const clipRectangle = FabricUitls.getClipMaskRect(
              editorElement,
              50
            );
            fabricObject.set("clipPath", clipRectangle);
          }
          if (
            editorElement.type === "text" &&
            animation.properties.textType === "character"
          ) {
            if (editorElement.fabricObject instanceof fabric.Text) {
              this.canvas?.remove(...editorElement.properties.splittedTexts);
              // @ts-ignore
              editorElement.properties.splittedTexts =
                getTextObjectsPartitionedByCharacters(
                  editorElement.fabricObject,
                  editorElement
                );
            }
            editorElement.properties.splittedTexts.forEach((textObject) => {
              this.canvas!.add(textObject);
            });
            const duration = animation.duration / 2;
            const delay =
              duration / editorElement.properties.splittedTexts.length;
            for (
              let i = 0;
              i < editorElement.properties.splittedTexts.length;
              i++
            ) {
              const splittedText = editorElement.properties.splittedTexts[i];
              const offset = {
                left: splittedText.left! - editorElement.placement.x,
                top: splittedText.top! - editorElement.placement.y,
              };

              this.animationTimeLine.add(
                {
                  left: [
                    startPosition.left + offset.left,
                    targetPosition.left && targetPosition.left + offset.left,
                  ],
                  top: [
                    startPosition.top! + offset.top,
                    targetPosition.top && targetPosition.top + offset.top,
                  ],
                  delay: i * delay,
                  duration: duration,
                  targets: splittedText,
                },
                editorElement.timeFrame.start
              );
            }
            this.animationTimeLine.add(
              {
                opacity: [1, 0],
                duration: 1,
                targets: fabricObject,
                easing: "linear",
              },
              editorElement.timeFrame.start
            );
            this.animationTimeLine.add(
              {
                opacity: [0, 1],
                duration: 1,
                targets: fabricObject,
                easing: "linear",
              },
              editorElement.timeFrame.start + animation.duration
            );

            this.animationTimeLine.add(
              {
                opacity: [0, 1],
                duration: 1,
                targets: editorElement.properties.splittedTexts,
                easing: "linear",
              },
              editorElement.timeFrame.start
            );
            this.animationTimeLine.add(
              {
                opacity: [1, 0],
                duration: 1,
                targets: editorElement.properties.splittedTexts,
                easing: "linear",
              },
              editorElement.timeFrame.start + animation.duration
            );
          }
          this.animationTimeLine.add(
            {
              left: [startPosition.left, targetPosition.left],
              top: [startPosition.top, targetPosition.top],
              duration: animation.duration,
              targets: fabricObject,
              easing: "linear",
            },
            editorElement.timeFrame.start
          );
          break;
        }
        case "slideOut": {
          const { direction, startPosition, targetPosition } =
            this.slidePozition(animation, editorElement, -100);
          if (animation.properties.useClipPath) {
            const clipRectangle = FabricUitls.getClipMaskRect(
              editorElement,
              50
            );
            fabricObject.set("clipPath", clipRectangle);
          }
          this.animationTimeLine.add(
            this.animationFadePattern(
              startPosition,
              targetPosition as TAnimationDirection,
              animation,
              fabricObject
            ),
            editorElement.timeFrame.end - animation.duration
          );
          break;
        }
        case "breathe": {
          const itsSlideInAnimation = this.animations.find(
            (a) => a.targetId === animation.targetId && a.type === "slideIn"
          );
          const itsSlideOutAnimation = this.animations.find(
            (a) => a.targetId === animation.targetId && a.type === "slideOut"
          );
          const timeEndOfSlideIn = itsSlideInAnimation
            ? editorElement.timeFrame.start + itsSlideInAnimation.duration
            : editorElement.timeFrame.start;
          const timeStartOfSlideOut = itsSlideOutAnimation
            ? editorElement.timeFrame.end - itsSlideOutAnimation.duration
            : editorElement.timeFrame.end;
          if (timeEndOfSlideIn > timeStartOfSlideOut) {
            continue;
          }
          const duration = timeStartOfSlideOut - timeEndOfSlideIn;
          const easeFactor = 4;
          const suitableTimeForHeartbeat = ((1000 * 60) / 72) * easeFactor;
          const upScale = 1.05;
          const currentScaleX = fabricObject.scaleX ?? 1;
          const currentScaleY = fabricObject.scaleY ?? 1;
          const finalScaleX = currentScaleX * upScale;
          const finalScaleY = currentScaleY * upScale;
          const totalHeartbeats = Math.floor(
            duration / suitableTimeForHeartbeat
          );
          if (totalHeartbeats < 1) {
            continue;
          }
          const keyframes = [];
          for (let i = 0; i < totalHeartbeats; i++) {
            keyframes.push({ scaleX: finalScaleX, scaleY: finalScaleY });
            keyframes.push({ scaleX: currentScaleX, scaleY: currentScaleY });
          }

          this.animationTimeLine.add(
            {
              duration: duration,
              targets: fabricObject,
              keyframes,
              easing: "linear",
              loop: true,
            },
            timeEndOfSlideIn
          );

          break;
        }
      }
    }
  }
  private slidePozition(
    animation: TAnimation,
    editorElement: EditorElement | undefined,
    height: number
  ) {
    const direction = (animation.properties as { direction: SlideDirection })
      .direction;
    const startPosition: any = {
      left: editorElement?.placement.x,
      top: editorElement?.placement.y,
    };
    const targetPosition = {
      left:
        direction === "left"
          ? -editorElement!.placement.width
          : direction === "right"
          ? this.canvas?.width
          : editorElement!.placement.x,
      top:
        direction === "top"
          ? height - editorElement!.placement.height
          : direction === "bottom"
          ? this.canvas?.height
          : editorElement!.placement.y,
    };
    return { direction, startPosition, targetPosition };
  }
  private animationFadePattern(
    startPosition: TAnimationDirection,
    targetPosition: TAnimationDirection,
    animation: any,
    fabricObject: any
  ) {
    return {
      left: [startPosition.left, targetPosition.left],
      top: [startPosition.top, targetPosition.top],
      duration: animation.duration,
      targets: fabricObject,
      easing: "linear",
    };
  }
  removeAnimation(id: string) {
    this.animations = this.animations.filter(
      (animation) => animation.id !== id
    );
    this.refreshAnimations();
  }
}

type TAnimationDirection = {
  left: number;
  top: number;
};
function getTextObjectsPartitionedByCharacters(
  textObject: fabric.Text,
  element: TextEditorElement
): fabric.Text[] {
  let copyCharsObjects: fabric.Text[] = [];
  // replace all line endings with blank
  const characters = (textObject.text ?? "")
    .split("")
    .filter((m) => m !== "\n");
  const charObjects = textObject.__charBounds;
  if (!charObjects) return [];
  const charObjectFixed = charObjects
    .map((m, index) => m.slice(0, m.length - 1).map((m) => ({ m, index })))
    .flat();
  const lineHeight = textObject.getHeightOfLine(0);
  for (let i = 0; i < characters.length; i++) {
    if (!charObjectFixed[i]) continue;
    const { m: charObject, index: lineIndex } = charObjectFixed[i];
    const char = characters[i];
    const scaleX = textObject.scaleX ?? 1;
    const scaleY = textObject.scaleY ?? 1;
    const charTextObject = new fabric.Text(char, {
      left: charObject.left * scaleX + element.placement.x,
      scaleX: scaleX,
      scaleY: scaleY,
      top: lineIndex * lineHeight * scaleY + element.placement.y,
      fontSize: textObject.fontSize,
      fontWeight: textObject.fontWeight,
      fill: "#fff",
    });
    copyCharsObjects.push(charTextObject);
  }
  return copyCharsObjects;
}
