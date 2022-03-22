<script setup lang="ts">

let isStarted = $ref(false)
let idioms: Map<string, string>
let words: Map<string, string>

onMounted(async() => {
  const { data: idiomsData } = await useFetch('/data/idiom.json')
  const idiomsArr = JSON.parse(idiomsData.value as string).map((w: Idiom) => [w.word, w.pinyin]) as [string, string][]
  idioms = new Map(idiomsArr)

  const { data: wordData } = await useFetch('/data/word.json')
  const wordArr = JSON.parse(wordData.value as string).map((w: Word) => [w.word, w.pinyin]) as [string, string][]
  words = new Map(wordArr)
})

const getRandomItem = (map: Map<string, string>): Idiom => {
  const arr = [...map.keys()]
  const len = arr.length
  const key = arr[Math.floor(Math.random() * len)]
  return {
    word: key,
    pinyin: map.get(key) as string,
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

const idiom2Pinyin = (idiom: string) => {
  return idiom.split('').map(word => words.get(word)).join(' ')
}

const check = () => {
  const lastIdiom = displayList.at(-1) as Idiom
  const lastWord = getXItem(lastIdiom.word, '', -1)
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
      <!-- <ul max-h-40 overflow-scroll>
        <li
          v-for="item, index of displayList"
          :key="index"
        >
          <Idiom :item="item" />
        </li>
      </ul> -->
      <GameArea :list="displayList" />
      <input v-model="newIdiom" w-50 type="text" placeholder="输入成语...">
      <button border-1 w-30 @click="check">
        确定
      </button>
    </div>
  </div>
</template>
