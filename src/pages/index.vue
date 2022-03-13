<script setup lang="ts">

interface Idiom {
  derivation?: string
  example?: string
  explanation?: string
  pinyin: string
  word: string
  abbreviation?: string
}

interface Word {
  explanation?: string
  more?: string
  oldword?: string
  pinyin: string
  radicals?: string
  strokes?: string
  word: string
}

let isStarted = $ref(false)

let idioms: Idiom[] = reactive([])
let words: Map<string, string> = reactive([])

onMounted(async() => {
  let { data: idiomsData } = await useFetch('/data/idiom.json')
  idiomsData = JSON.parse(idiomsData.value as string).map(w => [w.word, w.pinyin])
  idioms = new Map(idiomsData)

  let { data: wordData } = await useFetch('/data/word.json')
  wordData = JSON.parse(wordData.value as string).map(w => [w.word, w.pinyin])
  words = new Map(wordData)
})

const getRandomItem = (map: Map) => {
  const arr = [...map.keys()]
  const len = arr.length
  const key = arr[Math.floor(Math.random() * len)]
  return {
    word: key,
    pinyin: map.get(key),
  }
}

const displayList: Idiom[] = $ref([])

const startGame = async() => {
  isStarted = !isStarted
  displayList.push(getRandomItem(idioms))
}

let newIdiom = $ref('')

const getXItem = (str: string, separator: string, index: number) => {
  return str.split(separator).at(index)
}

const idiom2Pinyin = (idiom) => {
  return idiom.split('').map(word => words.get(word)).join(' ')
}

const check = () => {
  const lastIdiom = displayList.at(-1) as Idiom
  const lastWord = getXItem(lastIdiom.word, '', 0)
  const firstWord = getXItem(newIdiom, '', 0)
  const lastPinyin = getXItem(lastIdiom.pinyin, ' ', -1)
  const newPinyin = idiom2Pinyin(newIdiom)
  const firstPinyin = getXItem(newPinyin, ' ', 0)
  if ((idioms.has(newIdiom) && firstPinyin === lastPinyin) || (firstWord === lastWord)) {
    displayList.push({
      word: newIdiom,
      pinyin: newPinyin,
    })
  }
  newIdiom = ''
}
</script>

<template>
  <div>
    <button
      v-if="!isStarted"
      btn
      @click="startGame"
    >
      开始游戏
    </button>
    <!-- 游戏区域 -->
    <div v-else flex flex-col items-center gap-3>
      <ul>
        <li
          v-for="word, index of displayList"
          :key="index"
        >
          {{ word.word }}
        </li>
      </ul>
      <input v-model="newIdiom" w-50 type="text" placeholder="输入成语...">
      <button border-1 w-30 @click="check">
        确定
      </button>
    </div>
  </div>
</template>
