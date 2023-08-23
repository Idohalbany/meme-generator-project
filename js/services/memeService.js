'use strict'

var gImgs = [
  { id: 1, url: `img/1.jpg`, keywords: ['politics', 'akward'] },
  { id: 2, url: `img/2.jpg`, keywords: ['animal', 'cute'] },
  { id: 3, url: `img/3.jpg`, keywords: ['animal', 'baby'] },
  { id: 4, url: `img/4.jpg`, keywords: ['funny', 'animal'] },
  { id: 5, url: `img/5.jpg`, keywords: ['cute', 'baby'] },
  { id: 6, url: `img/6.jpg`, keywords: ['akward', 'movies'] },
  { id: 7, url: `img/7.jpg`, keywords: ['funny', 'baby'] },
  { id: 8, url: `img/8.jpg`, keywords: ['funny', 'circus'] },
  { id: 9, url: `img/9.jpg`, keywords: ['funny', 'baby'] },
  { id: 10, url: `img/10.jpg`, keywords: ['politics', 'happy'] },
  { id: 11, url: `img/11.jpg`, keywords: ['akward', 'funny'] },
  { id: 12, url: `img/12.jpg`, keywords: ['funny', 'bad'] },
  { id: 13, url: `img/13.jpg`, keywords: ['happy', 'movies'] },
  { id: 14, url: `img/14.jpg`, keywords: ['bad', 'movies'] },
  { id: 15, url: `img/15.jpg`, keywords: ['movies', 'bad'] },
  { id: 16, url: `img/16.jpg`, keywords: ['movies', 'funny'] },
  { id: 17, url: `img/17.jpg`, keywords: ['politics', 'bad'] },
  { id: 18, url: `img/18.jpg`, keywords: ['movies', 'akward'] },
]
var gKeywordSearchCountMap = { funny: 12, cat: 16, baby: 2 }

var gMeme = {
  selectedImgId: 5,
  selectedLineIdx: 0,
  lines: [
    {
      txt: 'I sometimes eat Falafel',
      size: 20,
      color: 'red',
    },
    {
      txt: 'And shit myself',
      size: 20,
      color: 'white',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  ],
}

function setLinesProperties(lineIdx, x, y, width, height) {
  const line = gMeme.lines[lineIdx]
  if (line) {
    line.x = x
    line.y = y
    line.width = width
    line.height = height
  }
}

function getMeme() {
  return gMeme
}

function getImgs() {
  return gImgs
}

function setImg(imgId) {
  gMeme.selectedImgId = imgId
}

function getImgUrlById(imgId) {
  const img = gImgs.find((image) => image.id === imgId)
  return img ? img.url : null
}

function getSelectedLineIdx() {
  return gMeme.selectedLineIdx
}

function setSelectedLineIdx(idx) {
  gMeme.selectedLineIdx = idx
}

function setLineTxt(txt) {
  let lineIdx = gMeme.selectedLineIdx
  gMeme.lines[lineIdx].txt = txt
}

function updateLineColor(selectedLineIdx, color) {
  gMeme.lines[selectedLineIdx].color = color
}

function updateFontSize(selectedLineIdx, num) {
  gMeme.lines[selectedLineIdx].size += num
}

function addLine() {
  gMeme.lines.push({
    txt: 'New Line',
    size: 20,
    color: 'white',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  gMeme.selectedLineIdx = gMeme.lines.length - 1
}

function deleteLine() {
  if (gMeme.lines.length === 0) return

  gMeme.lines.splice(gMeme.selectedLineIdx, 1)

  if (gMeme.selectedLineIdx >= gMeme.lines.length) {
    gMeme.selectedLineIdx = gMeme.lines.length - 1
  }
}

function switchLine() {
  gMeme.selectedLineIdx++
  if (gMeme.selectedLineIdx >= gMeme.lines.length) gMeme.selectedLineIdx = 0
}
