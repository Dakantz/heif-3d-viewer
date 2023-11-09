<script setup>

import { reactive, watch, onMounted,ref, getCurrentInstance } from 'vue'
import * as THREE from 'three';

import { OrbitControls } from '@tresjs/cientos'
import { extend, useTresContext } from '@tresjs/core'
import { OBJExporter } from 'three/addons/exporters/OBJExporter.js';

import { saveAs } from 'file-saver';


const instance = getCurrentInstance();

const props = defineProps({
  heif_imgs: Array,
  textCanvas: Object,
})

const { scene, state, renderer, camera } = useTresContext()
const three_elements = { scene: null, texture: null, mesh: null };

const light = new THREE.AmbientLight(); // soft white light
onMounted(async () => {
  update3DView()
})

const exporter = new OBJExporter();
const exportObj = async function () {
  if (three_elements.mesh != null) {
    //https://stackoverflow.com/a/42411243
    console.log(props.textCanvas)
    const img_data = props.heif_imgs[0].img_data;
    const img_data_canvas = new ImageData(new Uint8ClampedArray(img_data.channels[0].data), img_data.width, img_data.height);
    const bmp = await createImageBitmap(img_data_canvas)
    props.textCanvas.width = img_data.width;
    props.textCanvas.height = img_data.height;


    var ctx = props.textCanvas.getContext("2d");
    //flip the image along both axes
    ctx.translate(0, img_data.height);
    ctx.scale(1, -1)
    ctx.drawImage(bmp, 0, 0, img_data.width, img_data.height);


    let obj_file = exporter.parse(scene.value);
    obj_file += "\nmtllib heif-3d.mtl\nusemtl heif-3d\n "
    let mtl_file = `# HEIF 3D Viewer MTL
    newmtl heif-3d
    Ka 1.000 1.000 1.000
    Kd 1.000 1.000 1.000
    Ks 0.000 0.000 0.000
    d 1.0
    illum 2
    map_Ka heif-3d.png
    map_Kd heif-3d.png
    `

    console.log("data:", obj_file)

    var blob_obj = new Blob([obj_file], { type: "text/plain;charset=utf-8" });
    var blob_mtl = new Blob([mtl_file], { type: "text/plain;charset=utf-8" });
    props.textCanvas.toBlob(function (blob) {
      saveAs(blob, "heif-3d.png");
    });
    saveAs(blob_obj, "heif-3d.obj");
    saveAs(blob_mtl, "heif-3d.mtl");

  }

}
defineExpose({ exportObj })

const initialized = ref(false);
const update3DView = function () {
  console.log("heif_imgs:", props.heif_imgs)
  if (props.heif_imgs.length == 0 || props.heif_imgs[0].depth_data.length == 0) {
    return;
  }
  if(!initialized.value){
    initialized.value = true;
    three_elements.scene = scene.value;
    three_elements.scene.add(light);

  }
  if (three_elements.mesh != null) {
    three_elements.scene.remove(three_elements.mesh)
    three_elements.texture.dispose();
  }
  const img = props.heif_imgs[0];
  console.log("img:", img)
  const depth_data = img.depth_data;
  const height = depth_data.height
  const width = depth_data.width
  const ratio = width / height
  let vertices = []
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      vertices.push(...[ratio * i / width - 0.5, -j / height + 0.5, img.iloc(depth_data, i, j, 1) / 255.])
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
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({ map: texture });
  material.needsUpdate = true;

  const mesh = new THREE.Mesh(heic_plane, material);
  three_elements.scene.add(mesh);
  three_elements.mesh = mesh;
  three_elements.texture = texture;
}
watch(() => props.heif_imgs, () => {
  console.log("props.heif_imgs changed")
  update3DView()
}, { deep: true })
</script>

<template>
  <OrbitControls />
</template>

<style scoped></style>
