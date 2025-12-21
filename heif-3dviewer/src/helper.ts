import type { ClassHandle, EmbindModule, heif_image_handle, MainModule } from "./lib/libheif"
import libheif from "./lib/libheif"
type heif_module = EmbindModule & MainModule | null;

export class HeifDecodedImg {

    libheif = null as heif_module
    img = null as heif_image_handle | null
    decoder = null as any
    dept_handles = [] as any[]
    img_data = null as any
    depth_data = null as any
    constructor(libheif: heif_module, img: heif_image_handle, decoder: string) {
        this.libheif = libheif;
        this.img = img;
        this.decoder = decoder;
        this.load()
    }
    load() {
        if (!this.libheif) {
            console.error("libheif not loaded yet!")
            return
        }
        console.log("decoding heif image:", this.img);
        this.dept_handles = this.libheif.heif_js_get_depth_imgs_decoded(this.img)
        console.log("depths:", this.dept_handles);
        this.img_data = this.libheif.heif_js_decode_image2(this.img, this.libheif.heif_colorspace.heif_colorspace_RGB, this.libheif.heif_chroma.heif_chroma_interleaved_RGBA)
        console.log("img_data:", this.img_data);
        if (this.dept_handles.length == 0) {
            alert("Please upload a HEIC-file with depth information!")
        } else {
            this.depth_data = this.libheif.heif_js_decode_image2(this.dept_handles[0], this.libheif.heif_colorspace.heif_colorspace_monochrome, this.libheif.heif_chroma.heif_chroma_monochrome)
            console.log("decoded depths:", this.depth_data);
        }
    }
    iloc(img: any, x: number, y: number, pixel_depth: number) {
        let data = [];
        let channel = img.channels[0]
        for (let i = 0; i < pixel_depth; i++) {
            data.push(channel.data[y * channel.stride + x * pixel_depth + i]);
        }
        return data
    }
}
export class HeifFile {
    file = ""
    libheif = null as EmbindModule & MainModule | null
    dec = null as any
    heif_imgs = [] as HeifDecodedImg[]
    decoded_imgs = [] as any[]
    constructor() {
    }
    async preload() {
        console.warn("HeifFile constructor");
        //preload wasm
        //https://web.dev/articles/loading-wasm
        const fetchPromise = await fetch('/libheif.wasm');
        const binary = await fetchPromise.arrayBuffer();
        var m = {
            ...libheif,
            "wasmBinary": binary,

        }
        console.log("initializing libheif with wasm binary:", m, libheif);
        this.libheif = await libheif(m) as heif_module;
        if (!this.libheif) {
            console.error("libheif failed to load!");
            return;
        }
        console.log("heif library:", this.libheif);
        this.dec = new (this.libheif as any).HeifDecoder();
        console.log("heif decoder", this.dec);
    }
    async load(buffer: ArrayBuffer) {
        if(!this.libheif){
            await this.preload()
        }
        console.log("buffer to load:", buffer);

        this.decoded_imgs = await this.dec.decode(buffer);
        console.log("decoded image:", this.decoded_imgs);
        for (const img of this.decoded_imgs) {
            this.heif_imgs.push(new HeifDecodedImg(this.libheif, img.handle, this.dec));
        }

    }
}