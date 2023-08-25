'use strict'

let gElCanvas
let gCtx
let gStartPos = null

function onInit() {
  gElCanvas = document.getElementById('meme-canvas')
  gCtx = gElCanvas.getContext('2d')
  gElCanvas.addEventListener('click', onCanvasClicked)
  addListeners()
  renderMeme()
  renderGallery()
}

function addListeners() {
  window.addEventListener('resize', () => {
    resizeCanvas()
    renderMeme()
  })

  gElCanvas.addEventListener('mousedown', onMouseDown)
  gElCanvas.addEventListener('mousemove', onMouseMove)
  gElCanvas.addEventListener('mouseup', onMouseUp)

  // Text Size Controls
  document
    .querySelector('.change-size:nth-child(1)')
    .addEventListener('click', () => onChangeFontSize(2))
  document
    .querySelector('.change-size:nth-child(2)')
    .addEventListener('click', () => onChangeFontSize(-2))

  // Line Controls
  document.querySelector('.add-line:nth-child(1)').addEventListener('click', onAddLine)
  document.querySelector('.add-line:nth-child(2)').addEventListener('click', onSwitchLine)
  document.querySelector('.delete-line').addEventListener('click', ondeleteLine)

  // Alignment Controls
  document
    .querySelector('.align-btn:nth-child(1)')
    .addEventListener('click', () => onChangeTextAlignment('right'))
  document
    .querySelector('.align-btn:nth-child(2)')
    .addEventListener('click', () => onChangeTextAlignment('center'))
  document
    .querySelector('.align-btn:nth-child(3)')
    .addEventListener('click', () => onChangeTextAlignment('left'))

  // Position Controls
  document
    .querySelector('.move-line:nth-child(1)')
    .addEventListener('click', () => onMoveLine('up'))
  document
    .querySelector('.move-line:nth-child(2)')
    .addEventListener('click', () => onMoveLine('down'))

  // New Features Controls
  // document.querySelector('.rotate-line').addEventListener('click', onRotateLine)
  document.querySelector('.btn-flexible').addEventListener('click', onGenerateRandomMeme)
  document.querySelectorAll('.sticker-selector').forEach((sticker) => {
    sticker.addEventListener('click', (e) => onAddSticker(e.target.innerText))
  })
  // document.querySelector('.share-facebook').addEventListener('click', onShareFacebook)

  // Emoji Dropdown
  document.querySelector('.emoji-dropdown button').addEventListener('click', toggleEmojiMenu)
  document.querySelectorAll('.emoji-option').forEach((emoji) => {
    emoji.addEventListener('click', (e) => onAddSticker(e.target.innerText))
  })

  // Download Control
  document.querySelector('.btn-download').addEventListener('click', onDownloadMeme)
  document.querySelector('.save-btn').addEventListener('click', onSaveMeme)
}

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

function onMouseDown(ev) {
  const clickPos = {
    x: ev.offsetX * (gElCanvas.width / gElCanvas.clientWidth),
    y: ev.offsetY * (gElCanvas.height / gElCanvas.clientHeight),
  }

  const meme = getMeme()

  for (let i = 0; i < meme.lines.length; i++) {
    const line = meme.lines[i]
    const boundingBox = defineBoundingBox(
      line,
      line.pos.y,
      line.pos.x,
      gCtx.measureText(line.txt).width
    )

    if (isPointInRect(clickPos, boundingBox, 10)) {
      meme.selectedLineIdx = i
      line.isDrag = true
      gStartPos = clickPos
      break
    }
  }
}

function onMouseMove(ev) {
  const meme = getMeme()
  if (meme.selectedLineIdx === -1 || !meme.lines[meme.selectedLineIdx].isDrag || !gStartPos) return

  const currPos = {
    x: ev.offsetX * (gElCanvas.width / gElCanvas.clientWidth),
    y: ev.offsetY * (gElCanvas.height / gElCanvas.clientHeight),
  }

  const deltaX = currPos.x - gStartPos.x
  const deltaY = currPos.y - gStartPos.y

  const selectedLine = meme.lines[meme.selectedLineIdx]
  selectedLine.pos.x += deltaX
  selectedLine.pos.y += deltaY

  gStartPos = currPos

  renderMeme()
}

function onMouseUp() {
  const meme = getMeme()
  if (meme.selectedLineIdx === -1) return

  meme.lines[meme.selectedLineIdx].isDrag = false

  gStartPos = null
}

function onGenerateRandomMeme() {
  generateRandomMeme()
  renderMeme()
}

function onSaveMeme() {
  saveMeme()
  // renderSavedMemes()
}

function renderSavedMemes() {
  const savedMemes = getSavedMemes()
  const elSavedMemesSection = document.querySelector('.saved-memes-section')

  const strHTMLs = savedMemes.map((meme, idx) => {
    const imgs = getImgs()
    const memeImg = imgs.find((img) => img.id === meme.selectedImgId)
    const imgUrl = memeImg ? memeImg.url : `img/1.jpg`

    return `
            <div onclick="onEditMeme(${idx});">
                <img src="${imgUrl}" alt="Saved Meme ${idx}" class="meme-img">
            </div>`
  })

  elSavedMemesSection.innerHTML = strHTMLs.join('')
}

function onEditMeme(memeIdx) {
  const savedMemes = getSavedMemes()
  const memeToEdit = savedMemes[memeIdx]
  setImg(memeToEdit.selectedImgId)
  renderMeme()
  toggleDisplay('.saved-memes-section', false)
  toggleDisplay('.meme-editor-wrapper', true)
}

function drawText(line, idx) {
  styleText(line)

  const textWidth = gCtx.measureText(line.txt).width
  let xPos = line.pos.x
  const yPos = line.pos.y

  switch (line.align) {
    case 'left':
      break
    case 'right':
      xPos -= textWidth
      break
    case 'center':
      xPos -= textWidth / 2
      break
  }

  gCtx.fillText(line.txt, xPos, yPos)
  gCtx.strokeText(line.txt, xPos, yPos)

  const { startX, startY, rectWidth, rectHeight } = defineBoundingBox(line, yPos, xPos, textWidth)

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

function calculateTextPosition(line, textWidth) {
  const padding = 10
  switch (line.align) {
    case 'left':
      return padding
    case 'right':
      return gElCanvas.width - textWidth - padding
    case 'center':
    default:
      return (gElCanvas.width - textWidth) / 2
  }
}

function onMoveLine(direction) {
  const memes = getMeme()
  if (memes.selectedLineIdx === -1) return
  const diff = direction === 'up' ? -5 : 5
  moveLine(diff, 'y')
  renderMeme()
}

function defineBoundingBox(line, yPos, xPos, textWidth) {
  const startY = yPos - line.size
  let startX = xPos

  switch (line.align) {
    case 'left':
      startX = xPos
      break
    case 'center':
      startX = xPos - textWidth / 2
      break
    case 'right':
      startX = xPos - textWidth
      break
    default:
      break
  }

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
    const xPos = calculateTextPosition(line, textWidth)
    const yPos = line.pos.y

    const { startX, startY, rectWidth, rectHeight } = defineBoundingBox(line, yPos, xPos, textWidth)
    const padding = 10

    if (
      adjustedX >= startX - padding &&
      adjustedX <= startX + rectWidth + padding &&
      adjustedY >= startY - padding &&
      adjustedY <= startY + rectHeight + padding
    ) {
      setLinesProperties(idx, startX, startY, rectWidth, rectHeight)
      meme.selectedLineIdx = idx
      renderMeme()
      break
    }
  }
}

function updateEditorForClickedLine() {
  const meme = getMeme()
  const selectedLine = meme.lines[meme.selectedLineIdx]

  const elTxtInput = document.querySelector('.meme-text')
  const elColorInput = document.getElementById('text-color')
  if (selectedLine === undefined) return
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
  if (el) {
    if (isShown) el.style.display = 'grid'
    else el.style.display = 'none'
  }
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
    case 'savedMemes':
      toggleDisplay('.saved-memes-section', true)
      renderSavedMemes()
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

function onAddSticker(emoji) {
  addStickerLine(emoji)
  renderMeme()
}

function toggleEmojiMenu() {
  const emojiMenu = document.getElementById('emojiMenu')
  const isDisplayed = getComputedStyle(emojiMenu).display === 'block'

  if (isDisplayed) {
    emojiMenu.style.display = 'none'
  } else {
    emojiMenu.style.display = 'block'
  }
}

document.addEventListener('click', function (event) {
  const emojiMenu = document.getElementById('emojiMenu')

  if (!event.target.closest('.emoji-dropdown')) {
    emojiMenu.style.display = 'none'
  }
})

function isPointInRect(point, rect, space = 10) {
  return (
    point.x > rect.startX - space &&
    point.x < rect.startX + rect.rectWidth + space &&
    point.y > rect.startY - space &&
    point.y < rect.startY + rect.rectHeight + space
  )
}
