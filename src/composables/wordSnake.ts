import * as d3 from 'd3'
const darkgrey = '#161616'
const lightgrey = '#afafaf'

interface Grid {
  xLoc: number[]
  xLocArc: number[]
  numCircle: number
}

export class WordSnake {
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

  constructor(selector: string) {
    this.selector = selector
    this.divWidth = parseInt(d3.select(selector).style('width'))
    this.margin = {
      top: 10,
      right: 10,
      bottom: 40,
      left: 10,
    }
    this.width = this.divWidth - this.margin.left - this.margin.right
    this.height = this.width
    this.angle = 35 * Math.PI / 180
    this.radius = 75
    this.newXmargin = this.margin.left
    this.n = 0

    this.init()
  }

  init() {
    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    this.grid = this.calculateGrid()
  }

  render(list: Idiom[]) {
    const element = document.querySelector('#viz-word-snake') as HTMLElement
    while (element.firstChild)
      element.removeChild(element.firstChild)
    this.init()
    this.drawWordSnake(list)
  }

  // Round number to 2 behind the decimal
  round2(num: number) {
    return (Math.round((num + 0.00001) * 100) / 100)
  }

  calculateGrid() {
    // How many circles fir in one "row"
    const s = this.width / Math.cos(this.angle)
    let numCircle = Math.min(4, Math.floor(s / (2 * this.radius)))
    // I don't want 1 circle
    if (numCircle === 1) numCircle = 2
    // If it's not an exact fit, make it so
    this.radius = Math.min(this.radius, this.round2((s / numCircle) / 2))

    // Save the x-locations if each circle
    const xLoc = new Array(numCircle)
    for (let i = 0; i < numCircle; i++)
      xLoc[i] = this.round2((1 + 2 * i) * this.radius * Math.cos(this.angle))
    // for i

    // Locations for the textPath
    const xLocArc = new Array(numCircle + 1)
    for (let i = 0; i <= numCircle; i++)
      xLocArc[i] = this.round2(2 * i * this.radius * Math.cos(this.angle))
    // for i

    // New width & divide margins so it will sit in the center
    this.width = xLocArc[numCircle]
    this.newXmargin = this.round2((this.divWidth - this.width) / 2)
    this.svg.attr('transform', `translate(${this.newXmargin},${this.margin.top})`)

    return { xLoc, xLocArc, numCircle }
  }

  drawWordSnake(list: Idiom[]) {
    ///////////////////////////////////////////////////////////////////////////
    /// ///////////////////////// Create node data /////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    const wordString = list.reduce((acc, cur) => acc + cur.pinyin, '')
    const nodes: Node[] = []

    list.forEach((d) => {
      nodes.push({
        radius: this.radius,
        pinyin: d.pinyin,
        word: d.word,
      } as Node)
    })

    this.n = nodes.length

    ///////////////////////////////////////////////////////////////////////////
    /// ////////////////////////// Create the nodes ////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    const nodeWrapper = this.svg.append('g').attr('class', 'node-wrapper')

    // Create a group for each circle
    let pos = 0; let add = 1
    const node = nodeWrapper.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node noselect')
      .attr('transform', (d: Node, i: number) => {
        // Save the locations
        d.x = this.grid.xLoc[pos]
        d.y = (1 + 2 * i) * this.radius * Math.sin(this.angle)

        // Figure out which position of the xLoc to use on the next one
        if (pos === this.grid.numCircle - 1) add = -1
        else if (pos === 0) add = 1
        pos = pos + add

        return `translate(${d.x},${d.y})`
      })

    ///////////////////////////////////////////////////////////////////////////
    /// ///////////////////// Create the central words /////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // Create background circle for the hover & click
    node.append('circle')
      .attr('class', 'circle-background')
      .attr('r', this.radius)

    // Attach center words to each group
    node.append('text')
      .attr('class', 'circle-center-original')
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('fill', darkgrey)
      .text((d: Node) => { return d.word })
    node.append('text')
      .attr('class', 'circle-center-translation')
      .attr('y', -25)
      .attr('dy', '0.35em')
      .style('fill', '#787878')
      .text((d: Node) => { return d.pinyin })

    ///////////////////////////////////////////////////////////////////////////
    /// /////////////////// Create the outer circular paths ////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // Create path
    this.svg.append('path')
      .attr('class', 'circle-path')
      .attr('id', 'circle-word-path')
      .attr('d', this.calculateSnakePath(this.grid))

    // Create text on path
    this.svg.append('text')
      .attr('class', 'circle-path-text noselect')
      .style('fill', 'none')
      .attr('dy', '0.15em')
      .append('textPath')
      .attr('id', 'top-word-string')
      .style('text-anchor', 'middle')
      .style('fill', lightgrey)
      .attr('xlink:href', '#circle-word-path')
      .attr('startOffset', '0%')
      .text(`${wordString}\u00A0\u00A0\u00A0${wordString}`)

    ///////////////////////////////////////////////////////////////////////////
    /// //////////////////// Create the word string legend /////////////////////
    ///////////////////////////////////////////////////////////////////////////

    const legend = this.svg.append('g')
      .attr('class', 'word-snake-legend')
      .attr('transform', `translate(${this.grid.xLoc[1]},${3 * this.radius * Math.sin(this.angle)})`)

    // Create the path for the legend
    legend.append('path')
      .attr('class', 'circle-path')
      .attr('id', 'circle-legend-path')
      .attr('d', () => {
        const r = this.radius * 1.2
        return `M${-r * Math.cos(this.angle)},${-r * Math.sin(this.angle)
        } A${r},${r} 0 1,1${-r * Math.cos(this.angle * 0.99)},${-r * Math.sin(this.angle * 0.99)} `
      })

    // Append text to path
    legend.append('text')
      .attr('class', 'circle-path-legend noselect')
      .style('fill', 'none')
      .attr('dy', '0.15em')
      .append('textPath')
      .style('text-anchor', 'middle')
      .attr('startOffset', '25%')
      .style('fill', darkgrey)
      .attr('xlink:href', '#circle-legend-path')
    this.animateWordSnake()
  }

  calculateSnakePath(grid: Grid) {
    let pos = 0; let add = 1
    function newPos() {
      if (pos === grid.numCircle) add = -1
      else if (pos === 0) add = 1
      pos = pos + add
    }

    let x, y
    let yOld = 0
    let sweep = 0
    let switchSide = 1

    let path = 'M0,0 '

    // Construct the custom SVG paths out of arcs
    for (let i = 1; i <= this.n; i++) {
      if (i !== 1 && (i - 1) % (grid.numCircle - 1) === 0 && grid.numCircle % 2 === 1 && switchSide === 1) {
        // For the outside in an uneven row count when the arc should be the short side
        switchSide = 0

        x = grid.xLocArc[pos]
        newPos()
        newPos()

        y = yOld + this.round2(2 * this.radius * Math.sin(this.angle))
        path = `${path} A${this.radius},${this.radius} 0 0,${sweep} ${x},${y} `
        yOld = y
        sweep = sweep ? 0 : 1
      }
      else if (i !== 1 && (i - 1) % (grid.numCircle - 1) === 0) {
        // For the outside rows in the even row count or,
        // For the outside in an uneven row count when the arc should be the long side
        if (grid.numCircle % 2 === 1) switchSide = 1

        newPos()
        x = grid.xLocArc[pos]
        y = yOld + this.round2(2 * this.radius * Math.sin(this.angle))
        path = `${path} A${this.radius},${this.radius} 0 0,${sweep} ${x},${y} `

        newPos()
        x = grid.xLocArc[pos]
        path = `${path} A${this.radius},${this.radius} 0 0,${sweep} ${x},${y} `

        yOld = y
        sweep = sweep ? 0 : 1
      }
      else {
        // For the inbetween circles
        newPos()
        x = grid.xLocArc[pos]
        y = yOld + this.round2(2 * this.radius * Math.sin(this.angle))
        path = `${path} A${this.radius},${this.radius} 0 0,${sweep} ${x},${y} `
        yOld = y
        sweep = sweep ? 0 : 1
      }
    }

    // Adjust the height of the SVG
    this.height = yOld
    d3.select(`${this.selector} svg`).attr('height', this.height + this.margin.top + this.margin.bottom)

    return path
  }

  animateWordSnake() {
    d3.select('#top-word-string')
      .transition('move').duration(10000)
      .ease(d3.easeLinear)
      .attr('startOffset', '100%')
      .transition().duration(10000)
      .ease(d3.easeLinear)
      .attr('startOffset', '0%')
      .on('end', this.animateWordSnake)
  }
}
