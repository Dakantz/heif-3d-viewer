<script setup>
import { reactive, computed, onMounted, ref, getCurrentInstance } from 'vue'
import * as hh from "./helper.js"
import { Renderer, Camera, Scene, Box, BasicMaterial, PointLight, AmbientLight } from "troisjs"

import * as THREE from 'three';

const instance = getCurrentInstance();
const file = new hh.HeifFile();
const fileUrl = "/IMG_0749.HEIC";
const initLoad = async function (evt) {
  console.log("event:", evt)
  console.log("path:", evt.value)
  const fileInput = document.getElementById("heif_file");
  if (fileInput.files.length > 0) {
    console.log("file to load:", file);
    let buffer = await fileInput.files[0].arrayBuffer();
    file.heif_imgs = []
    await file.load(buffer);
    update3DView();
  }
}
const three_elements = { scene: null, texture: null, mesh: null };
onMounted(async () => {
  three_elements.scene = instance.refs.scene.scene;
  const heic_fetch = await fetch(fileUrl);
  const heic_binary = await heic_fetch.arrayBuffer();
  await file.load(heic_binary);
  update3DView();

})
const update3DView = function () {
  if (file.heif_imgs.length == 0 || file.heif_imgs[0].depth_data.length == 0) {
    return;
  }
  if (three_elements.mesh != null) {
    three_elements.scene.remove(three_elements.mesh)
    three_elements.texture.dispose();
  }
  const img = file.heif_imgs[0];
  console.log("img:", img)
  const depth_data = img.depth_data;
  const height = depth_data.height
  const width = depth_data.width
  let vertices = []
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      vertices.push(...[i / width - 0.5, -j / height + 0.5, img.iloc(depth_data, i, j, 1) / 255.])
    }
  }
  // console.log(vertices)
  let indices = []
  for (let i = 0; i < width - 1; i++) {
    for (let j = 0; j < height - 1; j++) {
      indices.push(...[i * height + j, i * height + j + 1, (i + 1) * height + j])
      indices.push(...[(i + 1) * height + j, i * height + j + 1, (i + 1) * height + j + 1])
    }
  }

  let uvs = []
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      uvs.push(...[i / width, j / height])
    }
  }

  // Set the attribute on your  geometry
  const heic_plane = new THREE.BufferGeometry();
  heic_plane.setIndex(indices)
  heic_plane.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  heic_plane.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2));
  heic_plane.computeVertexNormals();
  heic_plane.needsUpdate = true;
  console.log("heic_plane:", heic_plane)
  console.log("img.img_data:", img.img_data)
  const texture = new THREE.DataTexture(img.img_data.channels[0].data, img.img_data.width, img.img_data.height, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;

  const material = new THREE.MeshPhongMaterial({ map: texture });
  material.needsUpdate = true;

  const mesh = new THREE.Mesh(heic_plane, material);
  three_elements.scene.add(mesh);
  three_elements.mesh = mesh;
  three_elements.texture = texture;
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
          <p>Select a file to view it in 3D.</p>
          <input type="file" id="heif_file" name="heif_file" accept=".heic" @change="initLoad" />
        </div>
      </div>
      <renderer ref="renderer" antialias orbit-ctrl :resize="true" alpha>
        <camera :position="{ z: 2, x: 1 }"></camera>
        <scene ref="scene">
          <ambient-light intensity="1"></ambient-light>
          <point-light :position="{ x: 10, y: 10, z: 10 }"></point-light>
          <!-- <box ref="box" :rotation="{ y: Math.PI / 4, z: Math.PI / 4 }">
                                        <BasicMaterial :color="0x00ff00"></BasicMaterial>
                                      </box> -->
        </scene>
      </renderer>
    </div>
  </main>
</template>

<style scoped>
.header {

  padding: 0 20px;
  height: 10vh;
  font-family: 'Courier New', Courier, monospace;
  text-align: center;

}

.wrapper {
  max-width: 1200px;
  height: 85vh;
  margin: 0 auto;
  padding: 0 20px;
  font-family: 'Courier New', Courier, monospace;
  background-color: #c6c5c5;
}
</style>