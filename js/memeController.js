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
  styleText(line)

  const textWidth = gCtx.measureText(line.txt).width
  const xPos = calculateTextPosition(line)
  const yPos = line.pos.y

  gCtx.fillText(line.txt, xPos, yPos)
  gCtx.strokeText(line.txt, xPos, yPos)

  const { startX, startY, rectWidth, rectHeight } = defineBoundingBox(
    line,
    idx,
    yPos,
    xPos,
    textWidth
  )

  const meme = getMeme()
  const currentLine = meme.selectedLineIdx

  if (idx === currentLine) {
    drawBoundingBox(startX, startY, rectWidth, rectHeight)
  }
}

function styleText(line) {
  gCtx.lineWidth = '1'
  gCtx.strokeStyle = `${line.strokeColor}`
  gCtx.fillStyle = line.color
  gCtx.font = `${line.size}px ${line.font}`
  gCtx.textAlign = line.align
}

function calculateTextPosition(line) {
  const padding = 10
  switch (line.align) {
    case 'left':
      return padding
    case 'right':
      return gElCanvas.width - padding
    case 'center':
    default:
      return gElCanvas.width / 2
  }
}

function onMoveLine(direction) {
  const diff = direction === 'up' ? -5 : 5
  moveLine(diff, 'y')
  renderMeme()
}

function defineBoundingBox(line, idx, yPos, xPos, textWidth) {
  let startX
  switch (line.align) {
    case 'left':
      startX = xPos
      break
    case 'right':
      startX = xPos - textWidth
      break
    case 'center':
    default:
      startX = xPos - textWidth / 2
      break
  }
  const startY = yPos - line.size
  return {
    startX: startX,
    startY: startY,
    rectWidth: textWidth,
    rectHeight: line.size,
  }
}

function drawBoundingBox(startX, startY, rectWidth, rectHeight) {
  const padding = 10
  gCtx.beginPath()
  gCtx.strokeStyle = 'white'
  gCtx.rect(startX - padding, startY - padding, rectWidth + 2 * padding, rectHeight + 2 * padding)
  gCtx.stroke()
}

function onCanvasClicked(ev) {
  const meme = getMeme()

  const adjustedX = ev.offsetX * (gElCanvas.width / gElCanvas.clientWidth)
  const adjustedY = ev.offsetY * (gElCanvas.height / gElCanvas.clientHeight)

  for (let idx = meme.lines.length - 1; idx >= 0; idx--) {
    const line = meme.lines[idx]
    const textWidth = gCtx.measureText(line.txt).width
    const xPos = calculateTextPosition(line)
    const yPos = line.pos.y

    const { startX, startY, rectWidth, rectHeight } = defineBoundingBox(
      line,
      idx,
      yPos,
      xPos,
      textWidth
    )
    const padding = 10

    if (
      adjustedX >= startX - padding &&
      adjustedX <= startX + rectWidth + padding &&
      adjustedY >= startY - padding &&
      adjustedY <= startY + rectHeight + padding
    ) {
      meme.selectedLineIdx = idx
      renderMeme()
      break
    }
  }
}

function getClickedLineIdx(x, y) {
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

function onChangeFontFamily(font) {
  changeFontFamily(font)
  renderMeme()
}

function onSetSizeSelector(ev, size) {
  ev.target.setAttribute('value', size)
  const selectedSize = +size
  setFontSize(selectedSize)
  renderMeme()
}

function onChangeTextAlignment(alignment) {
  changeTextAlignment(alignment)
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
