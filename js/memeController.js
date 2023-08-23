'use strict'

let gElCanvas
let gCtx
let gStartPos

function onInit() {
  gElCanvas = document.getElementById('meme-canvas')
  gCtx = gElCanvas.getContext('2d')
  renderMeme()
  renderGallery()
}

function renderMeme() {
  let meme = getMeme()

  if (!meme) return

  let imgUrl = getImgUrlById(meme.selectedImgId)

  let img = new Image()

  img.onload = function () {
    // Draw the image on the canvas
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
    meme.lines.forEach((line, idx) => {
      drawText(line, idx)
    })
  }

  img.src = imgUrl
}

function drawText(line, idx) {
  let yPos = (idx + 1) * line.size + 10

  gCtx.lineWidth = '2'
  gCtx.strokeStyle = 'black'
  gCtx.fillStyle = line.color
  gCtx.font = `${line.size}px Arial`
  gCtx.textAlign = 'center'
  gCtx.fillText(line.txt, gElCanvas.width / 2, yPos)
  gCtx.strokeText(line.txt, gElCanvas.width / 2, yPos)

  const meme = getMeme()
  const currentLine = meme.selectedLineIdx

  if (idx === currentLine) {
    const textWidth = gCtx.measureText(line.txt).width
    const padding = 10 // You can adjust this value as needed

    const startX = (gElCanvas.width - textWidth) / 2 - padding
    const startY = yPos - line.size - padding
    const rectWidth = textWidth + 2 * padding
    const rectHeight = line.size + 2 * padding

    gCtx.beginPath()
    gCtx.strokeStyle = 'white'
    gCtx.rect(startX, startY, rectWidth, rectHeight)
    gCtx.stroke()
  }
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
  if (isShown) el.style.display = 'block'
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
