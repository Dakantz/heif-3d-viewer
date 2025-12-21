<script setup lang="ts">
import { reactive, computed, onMounted, ref, getCurrentInstance, watch } from 'vue'
import * as hh from "@/helper"
import HeifViewer from '@/components/HeifViewer.vue'
import { API_BASE_URL } from '@/config';
import { Api } from '@/api/Api';

const api = new Api({
    baseURL: API_BASE_URL
})

const file = new hh.HeifFile();
const default_imgs = {
    'Face': '/IMG_0749.HEIC',
    'Christmas': '/IMG_0756.HEIC',
    'Vase': '/IMG_5345.HEIC',
    'Column 1': '/IMG_5426.HEIC',
    'Column 2': '/IMG_5427.HEIC'
}
const fileUrl = "/IMG_0749.HEIC";
const heif_imgs = ref([])
const textCanvas = ref(null)
const ui_state = reactive({
    loading: false,
    error: null,
    uploading: false,
    latest_share_link: null,
    copied: false,
    current_file: null as File | null

})
const loadFile = async function (evt) {
    ui_state.loading = true
    console.log("event:", evt)
    console.log("path:", evt.value)
    const fileInput = document.getElementById("heif_file") as HTMLInputElement;
    if (fileInput.files.length > 0) {
        console.log("file to load:", file);

        let buffer = await fileInput.files[0].arrayBuffer();
        ui_state.current_file = fileInput.files[0]

        file.heif_imgs = []
        await file.load(buffer);
        heif_imgs.value = file.heif_imgs
    }
    ui_state.loading = false
}

onMounted(async () => {
    setImg(default_imgs['Column 2'])

})

const heifViwerRef = ref(null);
const exportObj = function () {
    console.log("exportObj")
    heifViwerRef.value.exportObj()
}
const shareObj = async function () {
    console.log("shareObj")
    ui_state.uploading = true
    try {
        let file = ui_state.current_file
        console.log("file to upload:", file, file)
        let response = await api.upload.uploadHeifUploadPost({
            file: file
        })
        console.log("share response:", response)
        ui_state.latest_share_link = window.location.origin + "/shared/" + response.data.filename
    } catch (err) {
        console.error("error uploading file:", err)
        ui_state.error = "Error uploading file: " + err.message
    } finally {

        ui_state.uploading = false
    }
}
const setImg = async function (url) {
    ui_state.loading = true
    console.log("setImg:", url)
    const heic_fetch = await fetch(url);
    const heic_binary = await heic_fetch.arrayBuffer();
    file.heif_imgs = []
    await file.load(heic_binary);
    heif_imgs.value = file.heif_imgs
    ui_state.loading = false
}
const copyToClipboard = async function (text: string) {
    try {
        await navigator.clipboard.writeText(text);
        ui_state.copied = true
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}
watch(() => ui_state.latest_share_link, () => {
    ui_state.copied = false
})
</script>

<template>
    <div class="wrapper">
        <div class="item">
            <i class="fas fa-file-alt"></i>
            <div class="details">
                <h3>Select a file</h3>
                <p>Select a file to view it in 3D (you have to first save it in the camera roll as an 'Unmodified
                    Original' to
                    your files!) <br />
                    The HEIC files need to be captured either in Portrait mode or an iPhone 15 with a subject in frame.
                </p>
                <div class="input_sel">
                    <input class="button" type="file" id="heif_file" name="heif_file" accept=".heic"
                        @change="loadFile" />
                    <button v-for="(v, k) of default_imgs" @click="setImg(v)" class="button">Set {{ k }}</button>
                    <div v-if="ui_state.loading" class="loading_animation">...</div>
                </div>
            </div>
            <button @click="exportObj" class="button prominent">Export OBJ</button>
            <p></p>
            <div v-if="ui_state.current_file">
                <button @click="shareObj" class="button prominent">Share Me!</button>
                <div v-if="ui_state.uploading" class="loading_animation">...</div>
                <div v-if="ui_state.latest_share_link">
                    Share Link:
                    <a :href="ui_state.latest_share_link" target="_blank">{{ ui_state.latest_share_link }}</a>
                    <button class="button" @click="copyToClipboard(ui_state.latest_share_link)">
                        {{ ui_state.copied ? 'Copied!' : 'Copy to Clipboard' }}
                    </button>
                </div>
            </div>
        </div>
        <div>

        </div>
        <TresCanvas alpha>
            <HeifViewer :heif_imgs="heif_imgs" :textCanvas="textCanvas" ref="heifViwerRef" />
        </TresCanvas>

        <canvas ref="textCanvas" hidden>
        </canvas>
        <!-- <renderer ref="renderer" antialias orbit-ctrl :resize="true" alpha>
                            <camera :position="{ z: 2, x: 1 }"></camera>
                            <scene ref="scene">
                              <ambient-light intensity="1"></ambient-light>
                              <point-light :position="{ x: 10, y: 10, z: 10 }"></point-light>
                            </scene>
                          </renderer> -->
    </div>
</template>

<style scoped></style>