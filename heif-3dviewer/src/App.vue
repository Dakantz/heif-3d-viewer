<script setup>
import { reactive, computed, onMounted, ref, getCurrentInstance } from 'vue'
import * as hh from "./helper.js"
import HeifViewer from './components/HeifViewer.vue'



const file = new hh.HeifFile();
const fileUrl = "/IMG_0749.HEIC";
const heif_imgs = ref([])
const textCanvas = ref(null)
const initLoad = async function (evt) {
  console.log("event:", evt)
  console.log("path:", evt.value)
  const fileInput = document.getElementById("heif_file");
  if (fileInput.files.length > 0) {
    console.log("file to load:", file);
    let buffer = await fileInput.files[0].arrayBuffer();
    file.heif_imgs = []
    await file.load(buffer);
    heif_imgs.value = file.heif_imgs
  }
}

onMounted(async () => {
  const heic_fetch = await fetch(fileUrl);
  const heic_binary = await heic_fetch.arrayBuffer();
  await file.load(heic_binary);
  heif_imgs.value = file.heif_imgs
  console.log("heif_imgs set to:", heif_imgs.value)

})

const heifViwerRef = ref(null);
const exportObj = function () {
  console.log("exportObj")
  heifViwerRef.value.exportObj()
}
</script>

<template>
  <header>

    <div class="header">
      <h1>HEIF 3D Viewer</h1>
    </div>
  </header>

  <main>
    <div class="wrapper">
      <div class="item">
        <i class="fas fa-file-alt"></i>
        <div class="details">
          <h3>Select a file</h3>
          <p>Select a file to view it in 3D (you have to first save it in the camera roll as an 'Unmodified Original' to
            your files!) <br/>
            The HEIC files need to be captured either in Portrait mode or an iPhone 15 with a subject in frame.
          </p>
          <input class="button" type="file" id="heif_file" name="heif_file" accept=".heic" @change="initLoad" />
        </div>
        <button @click="exportObj" class="button">Export OBJ</button>
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
  </main>
</template>

<style scoped>
.header {

  padding: 20px;
  height: 10vh;
  font-family: 'Courier New', Courier, monospace;
  text-align: center;

}

.wrapper {
  max-width: 1200px;
  height: 85vh;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Courier New', Courier, monospace;
  background-color: #c6c5c5;
}
.button{
  background-color: #ececec;
  font-family: 'Courier New', Courier, monospace;
  padding: 5px 10px;
  border: black solid 1px;
  margin: 5px;

}
</style>