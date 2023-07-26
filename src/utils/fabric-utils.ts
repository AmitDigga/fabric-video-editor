import { EditorElement, EffecType } from "@/types";
import { fabric } from "fabric";
// https://jsfiddle.net/i_prikot/pw7yhaLf/

export const CoverImage = fabric.util.createClass(fabric.Image, {
    type: "coverImage",

    customFilter: "none",
    disableCrop: false,
    cropWidth: 0,
    cropHeight: 0,

    initialize(element: HTMLImageElement | HTMLVideoElement, options: any) {
        options = options || {};

        options = Object.assign({
            cropHeight: this.height,
            cropWidth: this.width
        }, options);
        this.callSuper("initialize", element, options);
    },

    getCrop(image: { width: number, height: number }, size: { width: number, height: number }) {
        const width = size.width;
        const height = size.height;
        const aspectRatio = width / height;

        let newWidth;
        let newHeight;

        const imageRatio = image.width / image.height;

        if (aspectRatio >= imageRatio) {
            newWidth = image.width;
            newHeight = image.width / aspectRatio;
        } else {
            newWidth = image.height * aspectRatio;
            newHeight = image.height;
        }
        const x = (image.width - newWidth) / 2;
        const y = (image.height - newHeight) / 2;
        return {
            cropX: x,
            cropY: y,
            cropWidth: newWidth,
            cropHeight: newHeight
        };
    },

    _render(ctx: CanvasRenderingContext2D) {
        if (this.disableCrop) {
            this.callSuper("_render", ctx);
            return;
        }
        const width = this.width;
        const height = this.height;
        const crop = this.getCrop(
            this.getOriginalSize(),
            {
                width: this.getScaledWidth(),
                height: this.getScaledHeight(),
            }
        );
        const {
            cropX,
            cropY,
            cropWidth,
            cropHeight,
        } = crop;
        ctx.save();
        const customFilter: EffecType = this.customFilter;
        ctx.filter = getFilterFromEffectType(customFilter);
        ctx.drawImage(
            this._element,
            Math.max(cropX, 0),
            Math.max(cropY, 0),
            Math.max(1, cropWidth),
            Math.max(1, cropHeight),
            -width / 2,
            -height / 2,
            Math.max(0, width),
            Math.max(0, height)
        );
        ctx.filter = "none";
        ctx.restore();
    },

});

export const CoverVideo = fabric.util.createClass(fabric.Image, {
    type: "coverVideo",
    customFilter: "none",
    disableCrop: false,
    cropWidth: 0,
    cropHeight: 0,

    initialize(element: HTMLVideoElement, options: any) {
        options = options || {};

        options = Object.assign({
            cropHeight: this.height,
            cropWidth: this.width
        }, options);
        this.callSuper("initialize", element, options);
    },

    getCrop(image: { width: number, height: number }, size: { width: number, height: number }) {
        const width = size.width;
        const height = size.height;
        const aspectRatio = width / height;
        let newWidth;
        let newHeight;

        const imageRatio = image.width / image.height;

        if (aspectRatio >= imageRatio) {
            newWidth = image.width;
            newHeight = image.width / aspectRatio;
        } else {
            newWidth = image.height * aspectRatio;
            newHeight = image.height;
        }
        const x = (image.width - newWidth) / 2;
        const y = (image.height - newHeight) / 2;
        return {
            cropX: x,
            cropY: y,
            cropWidth: newWidth,
            cropHeight: newHeight
        };
    },

    _render(ctx: CanvasRenderingContext2D) {
        if (this.disableCrop) {
            this.callSuper("_render", ctx);
            return;
        }
        const width = this.width;
        const height = this.height;
        const crop = this.getCrop(
            this.getOriginalSize(),
            {
                width: this.getScaledWidth(),
                height: this.getScaledHeight(),
            }
        );
        const {
            cropX,
            cropY,
            cropWidth,
            cropHeight,
        } = crop;

        const video = this._element as HTMLVideoElement;
        const videoScaledX = video.width / video.videoWidth;
        const videoScaledY = video.height / video.videoHeight;

        ctx.save();
        const customFilter: EffecType = this.customFilter;
        ctx.filter = getFilterFromEffectType(customFilter);
        ctx.drawImage(
            this._element,
            Math.max(cropX, 0) / videoScaledX,
            Math.max(cropY, 0) / videoScaledY,
            Math.max(1, cropWidth) / videoScaledX,
            Math.max(1, cropHeight) / videoScaledY,
            -width / 2,
            -height / 2,
            Math.max(0, width),
            Math.max(0, height)
        );
        ctx.filter = "none";
        ctx.restore();
    },

});

function getFilterFromEffectType(effectType: EffecType){
    switch(effectType){
        case "blackAndWhite":
            return "grayscale(100%)";
        case "sepia":
            return "sepia(100%)";
        case "invert":
            return "invert(100%)";
        case "saturate":
            return "saturate(100%)";
        default:
            return "none";
    }
}



declare module "fabric" {
    namespace fabric {
        class CoverVideo extends Image {
            type: "coverVideo";
            disableCrop: boolean;
            cropWidth: number;
            cropHeight: number;
        }
        class CoverImage extends Image {
            type: "coverImage";
            disableCrop: boolean;
            cropWidth: number;
            cropHeight: number;
        }
    }
}

fabric.CoverImage = CoverImage;
fabric.CoverVideo = CoverVideo;


export class FabricUitls {
    static getClipMaskRect(editorElement: EditorElement, extraOffset: number) {
        const extraOffsetX = extraOffset / editorElement.placement.scaleX;
        const extraOffsetY = extraOffsetX / editorElement.placement.scaleY;
        const clipRectangle = new fabric.Rect({
            left: editorElement.placement.x - extraOffsetX,
            top: editorElement.placement.y - extraOffsetY,
            width: editorElement.placement.width + extraOffsetX * 2,
            height: editorElement.placement.height + extraOffsetY * 2,
            scaleX: editorElement.placement.scaleX,
            scaleY: editorElement.placement.scaleY,
            absolutePositioned: true,
            fill: 'transparent',
            stroke: 'transparent',
            opacity: .5,
            strokeWidth: 0,
        });
        return clipRectangle;
    }
}