<template>
    <div>
        <div v-if="ui_state.loading" class="loading_animation">...</div>
        <div v-if="share_id" class="wrapper">
            <TresCanvas alpha>
                <HeifViewer :heif_imgs="heif_imgs" :textCanvas="textCanvas" ref="heifViwerRef" />
            </TresCanvas>
        </div>
        <div v-else>
            <p>No share ID provided in the URL.</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import HeifViewer from '@/components/HeifViewer.vue';
import { reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import * as hh from "@/helper"
import { Api } from '@/api/Api';
import { API_BASE_URL } from '@/config';

const route = useRoute()
const share_id = route.params.share_id as string
const ui_state = reactive({
    loading: false,
    error: null
})
const heif_imgs = ref([])
const textCanvas = ref(null)

const file = new hh.HeifFile();
const setImg = async function () {
    ui_state.loading = true

    let shared_file = await api.files.getHeifFileFilesFilenameGet(share_id, {
        format: 'arraybuffer'
    })
    const heic_binary = shared_file.data as any as ArrayBuffer;
    console.log("shared_file:", heic_binary)
    file.heif_imgs = []
    await file.load(heic_binary);
    heif_imgs.value = file.heif_imgs
    ui_state.loading = false
}
const api = new Api({
    baseURL: API_BASE_URL
})
onMounted(async () => {
    if (share_id) {

        await setImg()
    }
})

</script>

<style scoped></style>