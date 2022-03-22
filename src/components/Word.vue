<script setup lang="ts">
const props = defineProps<{
  item: Word
}>()
</script>

<template>
  <div flex flex-col items-center>
    <span>{{ props.item.pinyin }}</span>
    <span>{{ props.item.word }}</span>
  </div>
</template>
