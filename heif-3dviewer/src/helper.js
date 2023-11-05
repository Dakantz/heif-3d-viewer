
export class HeifDecodedImg {

    constructor(libheif, img, decoder) {
        this.libheif = libheif;
        this.img = img;
        this.decoder = decoder;
        this.load()
    }
    load() {
        this.dept_handles = this.libheif.heif_js_get_depth_imgs_decoded(this.img.handle)
        console.log("depths:", this.dept_handles);
        this.img_data = this.libheif.heif_js_decode_image2(this.img.handle, this.libheif.heif_colorspace_RGB, this.libheif.heif_chroma_interleaved_RGBA)
        console.log("img_data:", this.img_data);
        if (this.dept_handles.length == 0) {
            alert("Please upload a HEIC-file with depth information!")
        } else {
            this.depth_data = this.libheif.heif_js_decode_image2(this.dept_handles[0], this.libheif.heif_colorspace_monochrome, this.libheif.heif_chroma_monochrome)
            console.log("decoded depths:", this.depth_data);
        }
    }
    iloc(img, x, y, pixel_depth) {
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
    libheif = null
    decoder = null
    heif_imgs = []
    constructor() {
        (async () => {
            console.warn("HeifFile constructor");
            //preload wasm
            //https://web.dev/articles/loading-wasm
            const fetchPromise = await fetch('libheif.wasm');
            const binary = await fetchPromise.arrayBuffer();
            var m = {
                ...libheif,
                "wasmBinary": binary,

            }

            this.libheif = libheif(m);
            console.log("heif library:", this.libheif);
            this.decoder = new this.libheif.HeifDecoder();
            console.log("heif decoder", this.decoder);
        })();
    }
    async load(buffer) {
        console.log("buffer to load:", buffer);

        this.decoded_imgs = await this.decoder.decode(buffer);
        console.log("decoded image:", this.decoded_imgs);
        for (const img of this.decoded_imgs) {
            this.heif_imgs.push(new HeifDecodedImg(this.libheif, img, this.decoder));
        }

    }
}