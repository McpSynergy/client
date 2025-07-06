<script setup lang="ts">
import { ChatComponent } from '@mcp-synergy/vue'
</script>

<template>
  <div class="about">
    <h1>This is an about page</h1>
    <ChatComponent
      name="HelloWorld"
      server-name="mcp-component-render"
      :props="{ msg: 'Hello, World!' }"
    />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
