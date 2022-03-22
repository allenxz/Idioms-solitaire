<script setup lang="ts">
import { WordSnake } from '~/composables'

const props = defineProps<{
  list: Idiom[]
}>()

let wordSnake: WordSnakeSVG
onMounted(() => {
  wordSnake = new WordSnake('#viz-word-snake')
  wordSnake.drawWordSnake(props.list)
})

watch(() => [...props.list], (newVal) => {
  wordSnake.render(newVal)
})

</script>

<template>
  <div id="viz-word-snake" />
</template>
