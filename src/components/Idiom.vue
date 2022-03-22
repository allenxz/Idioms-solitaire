<script setup lang="ts">
const props = defineProps<{
  item: Idiom
}>()

const wordList: Word[] = $ref([])

onMounted(() => {
  const { word, pinyin } = props.item
  const wordArr = word.split('')
  const pinyinArr = pinyin.split(' ')
  wordArr.forEach((w, index) => {
    wordList.push({
      word: w,
      pinyin: pinyinArr[index],
    })
  })
})
</script>
<template>
  <div flex>
    <word
      v-for="wItem,index of wordList"
      :key="index"
      :item="wItem"
      px-5 w-15
    />
  </div>
</template>
