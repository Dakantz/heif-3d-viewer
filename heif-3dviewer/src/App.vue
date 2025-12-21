<template>
  <div class="header">
    <h1>HEIF 3D Viewer :)</h1>
    <strong>Current route path:</strong> {{ $route.fullPath }}
  </div>
  <main>
    <RouterView />
  </main>
</template>
<script setup lang="ts">

</script>
<style>
body {
  font-family: 'Courier New', Courier, monospace;
  background-color: #c6c5c5;
  text-align: center;
}

.header {

  padding: 20px;
  height: 10vh;
  text-align: center;

}

.wrapper {
  max-width: 1200px;
  height: 70vh;
  margin: 0 auto;
  padding: 20px;
}

.prominent {
  background-color: #a4a4a4;
  /* font-weight: bold; */
  font-size: 1.3em;
}

.button {
  background-color: #ececec;
  font-family: 'Courier New', Courier, monospace;
  padding: 5px 10px;
  border: black solid 1px;
  margin: 5px;

}

.button:hover {
  background-color: #d4d4d4;
  cursor: pointer;
}

.button:active {
  background-color: #bcbcbc;
}

.input_sel {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
}

.loading_animation {
  font-size: 2em;
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}
</style>