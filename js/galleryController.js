'use strict'

populateDatalistWithTags()
renderKeywords()

function renderGallery(imgs = getImgs()) {
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
  const meme = getMeme()
  meme.uploadedImgUrl = null
  setImg(imgId)
  renderMeme()
  toggleDisplay('.gallery', false)
  toggleDisplay('.meme-editor-wrapper', true)
}

function populateDatalistWithTags() {
  const allKeywords = gImgs.reduce((acc, img) => acc.concat(img.keywords), [])
  const uniqueKeywords = allKeywords.reduce((unique, keyword) => {
    if (unique.indexOf(keyword) === -1) {
      unique.push(keyword)
    }
    return unique
  }, [])

  const datalist = document.getElementById('image-tags')
  datalist.innerHTML = uniqueKeywords.map((keyword) => `<option value="${keyword}">`).join('')
}

function renderKeywords() {
  const elKeywordContainer = document.querySelector('.keyword-container')
  const strHTMLs = Object.keys(gKeywordSearchCountMap).map((keyword) => {
    const fontSize = getFontSizeForKeyword(keyword)
    return `<span style="font-size:${fontSize}px; color: #ffffff; margin-left: 20px; cursor: pointer"
     onclick="onKeywordClick('${keyword}')">${keyword}</span>`
  })
  elKeywordContainer.innerHTML = strHTMLs.join('')
}

function onKeywordClick(keyword) {
  updateKeywordSearchCount(keyword)
  renderKeywords()
  const filteredImgs = filterImagesByKeyword(keyword)
  renderGallery(filteredImgs)
}

function onFilterGallery({ filterBy }) {
  const filteredImgs = filterImagesByKeyword(filterBy)
  updateKeywordSearchCount(filterBy)
  renderGallery(filteredImgs)
}

function onClearFilter() {
  const filterInput = document.querySelector('.filter-input')
  filterInput.value = ''
  renderGallery(gImgs)
}
