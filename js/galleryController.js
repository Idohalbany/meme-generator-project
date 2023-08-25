'use strict'

populateDatalistWithTags()

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
