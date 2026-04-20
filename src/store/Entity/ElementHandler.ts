import { fabric } from "fabric";
import { EditorElement, Effect, Placement } from "../../types";
import { isHtmlImageElement, isHtmlVideoElement } from "../../utils";
import { AnimationHandler } from "./AnimationHandler";
import { observable, action, makeObservable, computed } from "mobx";
import { isEditorImageElement, isEditorVideoElement } from "../Store";
export class ElementHandler extends AnimationHandler{
  selectedElement: EditorElement | null;
  backgroundColor: string;
  audios: string[];
  videos: string[];
  images: string[];
  constructor() {
    super();
    this.videos = [];
    this.images = [];
    this.audios = [];
    this.selectedElement = null;
    this.backgroundColor = '#111111';
    makeObservable(this, {
      selectedElement: observable,
      backgroundColor: observable,
      audios: observable,
      videos: observable,
      images: observable,
      addVideoResource: action,
      addAudioResource: action,
      addImageResource: action,
      addEditorElement: action,
      setEditorElements: action,
      setSelectedElement: action,
      updateSelectedElement: action,
      updateEditorElement: action,
      refreshElements: action,
      updateTimeTo: action,
      updateEffect: action,
      removeEditorElement:action
    });
  }
  updateEffect(id: string, effect: Effect) {
    const index = this.editorElements.findIndex((element) => element.id === id);
    const element = this.editorElements[index];
    if (isEditorVideoElement(element) || isEditorImageElement(element)) {
      element.properties.effect = effect;
    }
    this.refreshElements();
  }
  setBackgroundColor(backgroundColor: string) {
    this.backgroundColor = backgroundColor;
    if (this.canvas) {
      this.canvas.backgroundColor = backgroundColor;
    }
  }
  removeEditorElement(id: string) {
    this.setEditorElements(this.editorElements.filter(
      (editorElement) => editorElement.id !== id
    ));
    this.refreshElements();
  }
  addVideoResource(video: string) {
    this.videos = [...this.videos, video];
  }
  addAudioResource(audio: string) {
    this.audios = [...this.audios, audio];
  }
  addImageResource(image: string) {
    this.images = [...this.images, image];
  }
  addEditorElement(editorElement: EditorElement) {
    this.setEditorElements([...this.editorElements, editorElement]);
    this.refreshElements();
    this.setSelectedElement(
      this.editorElements[this.editorElements.length - 1]
    );
  }
  setEditorElements(editorElements: EditorElement[]) {
    this.editorElements = editorElements;
    this.updateSelectedElement();
    this.refreshElements();
    // this.refreshAnimations();
  }
  updateSelectedElement() {
    this.selectedElement =
      this.editorElements.find(
        (element) => element.id === this.selectedElement?.id
      ) ?? null;
  }
  setSelectedElement(selectedElement: EditorElement | null) {
    this.selectedElement = selectedElement;
    if (this.canvas) {
      if (selectedElement?.fabricObject)
        this.canvas.setActiveObject(selectedElement.fabricObject);
      else this.canvas.discardActiveObject();
    }
  }
  updateEditorElement(editorElement: EditorElement) {
    this.setEditorElements(
      this.editorElements.map((element) =>
        element.id === editorElement.id ? editorElement : element
      )
    );
  }
  refreshElements() {
    const store = this;
    if (!store.canvas) return;
    const canvas = store.canvas;
    store.canvas.remove(...store.canvas.getObjects());
    for (let index = 0; index < store.editorElements.length; index++) {
      const element = store.editorElements[index];
      switch (element.type) {
        case "video": {
          console.log("elementid", element.properties.elementId);
          if (document.getElementById(element.properties.elementId) === null)
            continue;
          const videoElement = document.getElementById(
            element.properties.elementId
          );
          if (!isHtmlVideoElement(videoElement)) continue;
          // const filters = [];
          // if (element.properties.effect?.type === "blackAndWhite") {
          //   filters.push(new fabric.Image.filters.Grayscale());
          // }
          const videoObject = new fabric.CoverVideo(videoElement, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            width: element.placement.width,
            height: element.placement.height,
            scaleX: element.placement.scaleX,
            scaleY: element.placement.scaleY,
            angle: element.placement.rotation,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            // filters: filters,
            // @ts-ignore
            customFilter: element.properties.effect.type,
          });

          element.fabricObject = videoObject;
          element.properties.imageObject = videoObject;
          videoElement.width = 100;
          videoElement.height =
            (videoElement.videoHeight * 100) / videoElement.videoWidth;
          canvas.add(videoObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != videoObject) return;
            const placement = element.placement;
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              width:
                target.width && target.scaleX
                  ? target.width * target.scaleX
                  : placement.width,
              height:
                target.height && target.scaleY
                  ? target.height * target.scaleY
                  : placement.height,
              scaleX: 1,
              scaleY: 1,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
            };
            store.updateEditorElement(newElement);
          });
          break;
        }

        case "image": {
          if (document.getElementById(element.properties.elementId) == null)
            continue;
          const imageElement = document.getElementById(
            element.properties.elementId
          );
          if (!isHtmlImageElement(imageElement)) continue;
          // const filters = [];
          // if (element.properties.effect?.type === "blackAndWhite") {
          //   filters.push(new fabric.Image.filters.Grayscale());
          // }
          const imageObject = new fabric.CoverImage(imageElement, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            angle: element.placement.rotation,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            // filters
            // @ts-ignore
            customFilter: element.properties.effect.type,
          });
          // imageObject.applyFilters();
          element.fabricObject = imageObject;
          element.properties.imageObject = imageObject;
          const image = {
            w: imageElement.naturalWidth,
            h: imageElement.naturalHeight,
          };

          imageObject.width = image.w;
          imageObject.height = image.h;
          imageElement.width = image.w;
          imageElement.height = image.h;
          imageObject.scaleToHeight(image.w);
          imageObject.scaleToWidth(image.h);
          const toScale = {
            x: element.placement.width / image.w,
            y: element.placement.height / image.h,
          };
          imageObject.scaleX = toScale.x * element.placement.scaleX;
          imageObject.scaleY = toScale.y * element.placement.scaleY;
          canvas.add(imageObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != imageObject) return;
            const placement = element.placement;
            let fianlScale = 1;
            if (target.scaleX && target.scaleX > 0) {
              fianlScale = target.scaleX / toScale.x;
            }
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              scaleX: fianlScale,
              scaleY: fianlScale,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        case "audio": {
          break;
        }
        case "text": {
          const textObject = new fabric.Textbox(element.properties.text, {
            name: element.id,
            left: element.placement.x,
            top: element.placement.y,
            scaleX: element.placement.scaleX,
            scaleY: element.placement.scaleY,
            width: element.placement.width,
            height: element.placement.height,
            angle: element.placement.rotation,
            fontSize: element.properties.fontSize,
            fontWeight: element.properties.fontWeight,
            objectCaching: false,
            selectable: true,
            lockUniScaling: true,
            fill: "#ffffff",
          });
          element.fabricObject = textObject;
          canvas.add(textObject);
          canvas.on("object:modified", function (e) {
            if (!e.target) return;
            const target = e.target;
            if (target != textObject) return;
            const placement = element.placement;
            const newPlacement: Placement = {
              ...placement,
              x: target.left ?? placement.x,
              y: target.top ?? placement.y,
              rotation: target.angle ?? placement.rotation,
              width: target.width ?? placement.width,
              height: target.height ?? placement.height,
              scaleX: target.scaleX ?? placement.scaleX,
              scaleY: target.scaleY ?? placement.scaleY,
            };
            const newElement = {
              ...element,
              placement: newPlacement,
              properties: {
                ...element.properties,
                // @ts-ignore
                text: target?.text,
              },
            };
            store.updateEditorElement(newElement);
          });
          break;
        }
        default: {
          throw new Error("Not implemented");
        }
      }
      if (element.fabricObject) {
        element.fabricObject.on("selected", function (e) {
          store.setSelectedElement(element);
        });
      }
    }
    const selectedEditorElement = store.selectedElement;
    if (selectedEditorElement && selectedEditorElement.fabricObject) {
      canvas.setActiveObject(selectedEditorElement.fabricObject);
    }
    this.refreshAnimations();
    this.updateTimeTo(this.currentTimeInMs);
    store.canvas.renderAll();
  }
  updateTimeTo(newTime: number) {
    this.setCurrentTimeInMs(newTime);
    this.animationTimeLine.seek(newTime);
    if (this.canvas) {
      this.canvas.backgroundColor = this.backgroundColor;
    }
    this.editorElements.forEach((e) => {
      if (!e.fabricObject) return;
      const isInside =
        e.timeFrame.start <= newTime && newTime <= e.timeFrame.end;
      e.fabricObject.visible = isInside;
    });
  }
}
