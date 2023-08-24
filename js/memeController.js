'use strict'

let gElCanvas
let gCtx
let gStartPos

function onInit() {
  gElCanvas = document.getElementById('meme-canvas')
  gCtx = gElCanvas.getContext('2d')
  gElCanvas.addEventListener('click', onCanvasClicked)
  renderMeme()
  renderGallery()
}

window.addEventListener('resize', () => {
  resizeCanvas()
  renderMeme()
})

function resizeCanvas() {
  const canvasContainer = document.querySelector('.canvas-container')
  gElCanvas.width = canvasContainer.clientWidth
  gElCanvas.height = canvasContainer.clientHeight
  console.log('Resizing canvas...')
  console.log('Container size:', canvasContainer.clientWidth, canvasContainer.clientHeight)
}

function renderMeme() {
  let meme = getMeme()

  if (!meme) return

  let imgUrl = getImgUrlById(meme.selectedImgId)

  let img = new Image()

  img.onload = function () {
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
    meme.lines.forEach((line, idx) => {
      drawText(line, idx)
    })
  }

  img.src = imgUrl
}

function drawText(line, idx) {
  let yPos = (idx + 1) * (line.size + 30) + 10 + line.size

  gCtx.lineWidth = '2'
  gCtx.strokeStyle = 'black'
  gCtx.fillStyle = line.color
  gCtx.font = `${line.size}px Arial`
  gCtx.textAlign = 'center'
  gCtx.fillText(line.txt, gElCanvas.width / 2, yPos)
  gCtx.strokeText(line.txt, gElCanvas.width / 2, yPos)

  const textWidth = gCtx.measureText(line.txt).width
  const startX = (gElCanvas.width - textWidth) / 2
  const startY = yPos - line.size
  const rectWidth = textWidth
  const rectHeight = line.size

  setLinesProperties(idx, startX, startY, rectWidth, rectHeight)

  const meme = getMeme()
  const currentLine = meme.selectedLineIdx

  if (idx === currentLine) {
    const padding = 10

    gCtx.beginPath()
    gCtx.strokeStyle = 'white'
    gCtx.rect(startX - padding, startY - padding, rectWidth + 2 * padding, rectHeight + 2 * padding)
    gCtx.stroke()
  }
}

function onCanvasClicked(ev) {
  const { offsetX, offsetY } = ev
  const lineIdx = getClickedLineIdx(offsetX, offsetY)
  if (lineIdx !== -1) {
    setSelectedLineIdx(lineIdx)
    updateEditorForClickedLine()
    renderMeme()
  }
}

function getClickedLineIdx(x, y) {
  console.log(`Clicked at: x=${x}, y=${y}`)

  const meme = getMeme()

  return meme.lines.findIndex(
    (line) => x >= line.x && x <= line.x + line.width && y >= line.y && y <= line.y + line.height
  )
}

function updateEditorForClickedLine() {
  const meme = getMeme()
  const selectedLine = meme.lines[meme.selectedLineIdx]

  const elTxtInput = document.querySelector('.meme-text')
  const elColorInput = document.getElementById('text-color')

  elTxtInput.value = selectedLine.txt
  elColorInput.value = selectedLine.color
}

function ondeleteLine() {
  deleteLine()
  renderMeme()
  updateEditorForClickedLine()
}

function onAddLine() {
  addLine()
  renderMeme()
}

function onSwitchLine() {
  switchLine()
  renderMeme()
}

function onTextChange(txt) {
  setLineTxt(txt)
  renderMeme()
}

function onColorChange(color) {
  const selectedLineIdx = getSelectedLineIdx()
  updateLineColor(selectedLineIdx, color)
  renderMeme()
}

function onChangeFontSize(num) {
  const selectedLineIdx = getSelectedLineIdx()
  updateFontSize(selectedLineIdx, num)
  renderMeme()
}

function toggleDisplay(elSelector, isShown) {
  const el = document.querySelector(elSelector)
  if (isShown) el.style.display = 'grid'
  else el.style.display = 'none'
}

function onChangeSection(ev, sectionName) {
  ev.preventDefault()
  toggleDisplay('.gallery', false)
  toggleDisplay('.meme-editor-wrapper', false)
  toggleDisplay('.saved-memes-section', false)

  switch (sectionName) {
    case 'gallery':
      toggleDisplay('.gallery', true)
      break
    case 'createMemes':
      toggleDisplay('.meme-editor-wrapper', true)
      break
    case 'gallery':
      toggleDisplay('.saved-meme-section', true)
      break
  }
}

function onDownloadMeme() {
  const downloadLink = document.getElementById('download-link')
  downloadLink.href = gElCanvas.toDataURL('image/jpeg')
  downloadLink.download = 'my-meme.jpg'
  downloadLink.click()
}

function toggleMenu(state) {
  const elMobileMenu = document.querySelector('.mobile-menu')
  const elCloseMenu = document.querySelector('.close-menu')
  const elNavBar = document.querySelector('.nav')

  if (state === 'open') {
    elMobileMenu.style.display = 'none'
    elCloseMenu.style.display = 'block'
    elNavBar.style.display = 'flex'
  } else {
    elMobileMenu.style.display = ''
    elCloseMenu.style.display = 'none'
    elNavBar.style.display = ''
  }
}
