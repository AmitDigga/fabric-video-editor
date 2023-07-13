import { fabric } from "fabric";
// https://jsfiddle.net/i_prikot/pw7yhaLf/

export const CoverImage = fabric.util.createClass(fabric.Image, {
    type: "userImage",

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
        ctx.restore();
    },

});



declare module "fabric" {
    namespace fabric {
        class CoverImage extends Image {
            type: "userImage";
            disableCrop: boolean;
            cropWidth: number;
            cropHeight: number;
        }
    }
}

fabric.CoverImage = CoverImage;

