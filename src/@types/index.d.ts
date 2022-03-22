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

interface Node {
  radius: number
  pinyin: string
  word: string
  x?: number
  y?: number
}

interface Grid {
  xLoc: number[]
  xLocArc: number[]
  numCircle: number
}

interface WordSnakeSVG {
  selector: string
  svg: any
  width: number
  height: number
  divWidth: number
  n: number
  angle: number
  radius: number
  newXmargin: number
  grid: Grid
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  render: Function
  drawWordSnake: Function
}
