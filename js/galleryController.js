'use strict'

function renderGallery() {
  let imgs = getImgs()
  let strHtmls = imgs.map(
    (img) => `
            <img src="${img.url}" 
                 alt="Meme ${img.id}" 
                 class="meme-img" 
                 onclick="onImgSelect(${img.id})">
        `
  )
  document.querySelector('.gallery').innerHTML = strHtmls.join('')
}

function onImgSelect(imgId) {
  setImg(imgId)
  renderMeme()
  toggleDisplay('.gallery', false)
  toggleDisplay('.meme-editor-wrapper', true)
}

