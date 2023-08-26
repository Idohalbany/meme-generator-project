'use strict'

// global //

let gElCanvas
let gCtx
let gStartPos = null
let gIsLineClicked = false
let isInsideText
let resizeTimeout

// oninit //
function onInit() {
  toggleDisplay('.meme-editor-wrapper', false)
  toggleDisplay('.saved-memes-section', false)
  toggleDisplay('.gallery-section', true)
  gElCanvas = document.getElementById('meme-canvas')
  gCtx = gElCanvas.getContext('2d')
  gElCanvas.addEventListener('click', onCanvasClicked)
  addListeners()
  renderMeme()
  renderGallery()
}

// event listeners //

function addListeners() {
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      resizeCanvas()
      renderMeme()
    }, 100)
  })

  window.addEventListener('scroll', () => {
    renderMeme()
  })

  // Text Size Controls
  document.querySelector('.change-size1').addEventListener('click', () => onChangeFontSize(2))
  document.querySelector('.change-size2').addEventListener('click', () => onChangeFontSize(-2))

  // Line Controls
  document.querySelector('.add-line').addEventListener('click', onAddLine)
  document.querySelector('.switch-line').addEventListener('click', onSwitchLine)
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
  document.querySelector('.move-line-up').addEventListener('click', () => onMoveLine('up'))
  document.querySelector('.move-line-down').addEventListener('click', () => onMoveLine('down'))

  // New Features Controls
  document.querySelector('.rotate-line').addEventListener('click', onRotateLine)
  document.querySelector('.btn-flexible').addEventListener('click', onGenerateRandomMeme)
  document.querySelectorAll('.sticker-selector').forEach((sticker) => {
    sticker.addEventListener('click', (e) => onAddSticker(e.target.innerText))
  })
  document.querySelector('.share-facebook').addEventListener('click', onShareFacebook)

  // Emoji Dropdown
  document.querySelector('.emoji-dropdown button').addEventListener('click', toggleEmojiMenu)
  document.querySelectorAll('.emoji-option').forEach((emoji) => {
    emoji.addEventListener('click', (e) => onAddSticker(e.target.innerText))
  })

  // Download Control
  document.querySelector('.btn-download').addEventListener('click', onDownloadMeme)
  document.querySelector('.save-btn').addEventListener('click', onSaveMeme)

  gElCanvas.addEventListener('mousedown', onMouseDown)
  gElCanvas.addEventListener('mousemove', onMouseMove)
  gElCanvas.addEventListener('mouseup', onMouseUp)
  gElCanvas.addEventListener('touchstart', onMouseDown)
  gElCanvas.addEventListener('touchmove', onMouseMove)
  gElCanvas.addEventListener('touchend', onMouseUp)
}

// resize canvas //

function resizeCanvas() {
  const canvasContainer = document.querySelector('.canvas-container')
  const aspectRatio = gElCanvas.width / gElCanvas.height

  gElCanvas.width = canvasContainer.clientWidth
  gElCanvas.height = canvasContainer.clientWidth / aspectRatio

  if (gElCanvas.height > canvasContainer.clientHeight) {
    gElCanvas.height = canvasContainer.clientHeight
    gElCanvas.width = canvasContainer.clientHeight * aspectRatio
  }
}

function renderMeme() {
  const meme = getMeme()

  if (!meme) return
  let imgUrl = meme.uploadedImgUrl ? meme.uploadedImgUrl : getImgUrlById(meme.selectedImgId)

  let imgToRender = new Image()
  imgToRender.onload = function () {
    gCtx.clearRect(0, 0, gElCanvas.width, gElCanvas.height)
    gCtx.drawImage(imgToRender, 0, 0, gElCanvas.width, gElCanvas.height)
    meme.lines.forEach((line, idx) => {
      drawText(line, idx)
    })
  }
  imgToRender.src = imgUrl
}

// mouse and touch events //

function onMouseDown(ev) {
  let clickPos
  if (ev.type === 'touchstart') {
    ev.preventDefault()
    const touch = ev.changedTouches[0]
    clickPos = {
      x: touch.clientX - ev.target.offsetLeft,
      y: touch.clientY - ev.target.offsetTop,
    }
  } else {
    clickPos = {
      x: ev.offsetX * (gElCanvas.width / gElCanvas.clientWidth),
      y: ev.offsetY * (gElCanvas.height / gElCanvas.clientHeight),
    }
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
    updateEditorForClickedLine()

    if (isPointInRect(clickPos, boundingBox, 10)) {
      meme.selectedLineIdx = i
      line.isDrag = true
      gStartPos = clickPos
      // break
    }
  }
}

function onMouseMove(ev) {
  let currPos
  if (ev.type === 'touchmove') {
    ev.preventDefault()
    const touch = ev.changedTouches[0]
    currPos = {
      x: touch.clientX - ev.target.offsetLeft,
      y: touch.clientY - ev.target.offsetTop,
    }
  } else {
    currPos = {
      x: ev.offsetX * (gElCanvas.width / gElCanvas.clientWidth),
      y: ev.offsetY * (gElCanvas.height / gElCanvas.clientHeight),
    }
  }

  const meme = getMeme()
  if (meme.selectedLineIdx === -1 || !meme.lines[meme.selectedLineIdx].isDrag || !gStartPos) return

  const deltaX = currPos.x - gStartPos.x
  const deltaY = currPos.y - gStartPos.y

  const selectedLine = meme.lines[meme.selectedLineIdx]
  selectedLine.pos.x += deltaX
  selectedLine.pos.y += deltaY

  gStartPos = currPos

  renderMeme()
}

function onMouseUp(ev) {
  if (ev.type === 'touchend') ev.preventDefault()

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
  showNotification()
}

// saved memes //

function renderSavedMemes() {
  const savedMemes = getSavedMemes()
  const elSavedMemesSection = document.querySelector('.saved-memes-section')

  const strHTMLs = savedMemes.map((meme, idx) => {
    const imgUrl = meme.dataUrl
    return `
      <div class="meme-container" data-meme-id="${idx}">
          <img src="${imgUrl}" alt="Saved Meme ${idx}" class="saved-meme">
          <div class="meme-actions">
              <button class="edit-saved-meme" onclick="onEditMeme(${idx});"><i class="fa-solid fa-screwdriver-wrench"></i></button>
              <button class="remove-saved-meme" onclick="onDeleteMeme(${idx});"><i class="fa-solid fa-trash"></i></button>
          </div>
      </div>`
  })

  elSavedMemesSection.innerHTML = strHTMLs.join('')
}

function onEditMeme(memeIdx) {
  const savedMemes = getSavedMemes()
  const memeToEdit = savedMemes[memeIdx]
  setMeme(memeToEdit)
  renderMeme()
  toggleDisplay('.saved-memes-section', false)
  toggleDisplay('.meme-editor-wrapper', true)
}

// draw lines //

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

  if (idx === currentLine && (isInsideText || gIsLineClicked)) {
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

// calculate positions //

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

// move line //

function onMoveLine(direction) {
  const memes = getMeme()
  if (memes.selectedLineIdx === -1) return
  const diff = direction === 'up' ? -5 : 5
  moveLine(diff, 'y')
  renderMeme()
}

// draw frame //

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
  gCtx.strokeStyle = '#ffffff'
  gCtx.rect(startX - padding, startY - padding, rectWidth + 2 * padding, rectHeight + 2 * padding)
  gCtx.stroke()
}

// check clicks on canvas //

function onCanvasClicked(ev) {
  const meme = getMeme()

  const adjustedX = ev.offsetX * (gElCanvas.width / gElCanvas.clientWidth)
  const adjustedY = ev.offsetY * (gElCanvas.height / gElCanvas.clientHeight)

  isInsideText = false
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
      isInsideText = true
      setLinesProperties(idx, startX, startY, rectWidth, rectHeight)
      meme.selectedLineIdx = idx
      gIsLineClicked = true
      break
    }
  }
  if (!isInsideText) gIsLineClicked = false
  renderMeme()
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

// delete meme //

function onDeleteMeme(idx) {
  const savedMemes = getSavedMemes()
  savedMemes.splice(idx, 1)
  saveToStorage('memesDB', savedMemes)
  renderSavedMemes()
}

// delete line //

function ondeleteLine() {
  deleteLine()
  renderMeme()
  updateEditorForClickedLine()
}

// add lines //

function onAddLine() {
  addLine()
  renderMeme()
}

// switch lines //

function onSwitchLine() {
  switchLine()
  updateEditorForClickedLine()
  renderMeme()
}

// set line text //

function onTextChange(txt) {
  setLineTxt(txt)
  renderMeme()
}

// change color //

function onColorChange(color) {
  const selectedLineIdx = getSelectedLineIdx()
  updateLineColor(selectedLineIdx, color)
  renderMeme()
}

// set font size //

function onChangeFontSize(num) {
  const selectedLineIdx = getSelectedLineIdx()
  updateFontSize(selectedLineIdx, num)
  renderMeme()
}

// set font family //

function onChangeFontFamily(font) {
  changeFontFamily(font)
  renderMeme()
}

// set size with selector //

function onSetSizeSelector(ev, size) {
  ev.target.setAttribute('value', size)
  const selectedSize = +size
  setFontSize(selectedSize)
  renderMeme()
}

// text alignment //

function onChangeTextAlignment(alignment) {
  changeTextAlignment(alignment)
  renderMeme()
}

// rotate lines //

function onRotateLine() {
  alert('Sike! didnt have time')
}

// add stickers //

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

// display sections //

function toggleDisplay(elSelector, isShown) {
  const el = document.querySelector(elSelector)
  if (el) {
    if (isShown) el.style.display = 'grid'
    else el.style.display = 'none'
  }
}

function onChangeSection(ev, sectionName) {
  ev.preventDefault()
  toggleDisplay('.gallery-section', false)
  toggleDisplay('.meme-editor-wrapper', false)
  toggleDisplay('.saved-memes-section', false)
  onResetEditor()
  toggleMenu('close')

  document.querySelectorAll('.links a').forEach((link) => link.classList.remove('active'))

  switch (sectionName) {
    case 'gallery':
      toggleDisplay('.gallery-section', true)
      ev.target.classList.add('active')
      break
    case 'createMemes':
      toggleDisplay('.meme-editor-wrapper', true)
      ev.target.classList.add('active')
      break
    case 'savedMemes':
      toggleDisplay('.saved-memes-section', true)
      renderSavedMemes()
      ev.target.classList.add('active')
      break
  }
}

// reset editor //

function onResetEditor() {
  resetEditorValues()
  resetEditor()
  renderMeme()
}

function resetEditorValues() {
  document.querySelector('.meme-text').value = ''
  document.getElementById('text-color').value = '#ffffff'
  document.querySelector('.font-family').value = ''
  document.querySelector('.size-selector').value = '30'
  let sizeInput = document.querySelector('.size-selector')
  sizeInput.value = '30'
  sizeInput.setAttribute('value', '30')
  setFontSize(25)
}

// download meme //

function onDownloadMeme() {
  const downloadLink = document.getElementById('download-link')
  downloadLink.href = gElCanvas.toDataURL('image/jpeg')
  downloadLink.download = 'my-meme.jpg'
  downloadLink.click()
}

// toggle menus //

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

// check if clicked on line //

function isPointInRect(point, rect, space = 10) {
  return (
    point.x > rect.startX - space &&
    point.x < rect.startX + rect.rectWidth + space &&
    point.y > rect.startY - space &&
    point.y < rect.startY + rect.rectHeight + space
  )
}

// Upload User Image //

function onPickImage(ev) {
  loadImageFromInput(ev, renderMeme)
}

function loadImageFromInput(ev, onImageReady) {
  const reader = new FileReader()

  reader.onload = function (event) {
    const meme = getMeme()
    meme.uploadedImgUrl = event.target.result
    onImageReady()
  }

  reader.readAsDataURL(ev.target.files[0])
}

// Share On Facebook //

function onShareFacebook() {
  const imgDataUrl = gElCanvas.toDataURL('image/jpeg')
  function onSuccess(uploadedImgUrl) {
    const url = encodeURIComponent(uploadedImgUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${url}`)
  }
  doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
  const formData = new FormData()
  formData.append('img', imgDataUrl)
  const XHR = new XMLHttpRequest()
  XHR.onreadystatechange = () => {
    if (XHR.readyState !== XMLHttpRequest.DONE) return
    if (XHR.status !== 200) return console.error('Error uploading image')
    const { responseText: url } = XHR
    onSuccess(url)
  }
  XHR.onerror = (req, ev) => {
    console.error('Error connecting to server with request:', req, '\nGot response data:', ev)
  }
  XHR.open('POST', '//ca-upload.com/here/upload.php')
  XHR.send(formData)
}

// show save notfication //

function showNotification() {
  const elNotification = document.querySelector('.notification')
  elNotification.style.display = 'block'
  elNotification.style.opacity = '1'

  setTimeout(() => {
    elNotification.style.opacity = '0'
    setTimeout(() => {
      elNotification.style.display = 'none'
    }, 300)
  }, 2000)
}
