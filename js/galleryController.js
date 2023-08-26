'use strict'

populateDatalistWithTags()
renderKeywords()

// render gallery //

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

// img select //

function onImgSelect(imgId) {
  const meme = getMeme()
  meme.uploadedImgUrl = null
  setImg(imgId)
  renderMeme()
  toggleDisplay('.gallery-section', false)
  toggleDisplay('.meme-editor-wrapper', true)
}

// keywords //

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
  let strHTMLs = `<span style="font-size:16px; color: #ffffff; margin-left: 20px; cursor: pointer"
     onclick="onKeywordClick('all')">all</span>`

  strHTMLs += Object.keys(gKeywordSearchCountMap)
    .map((keyword) => {
      const fontSize = getFontSizeForKeyword(keyword)
      return `<span style="font-size:${fontSize}px; color: #ffffff; margin-left: 20px; cursor: pointer"
     onclick="onKeywordClick('${keyword}')">${keyword}</span>`
    })
    .join('')

  elKeywordContainer.innerHTML = strHTMLs
}

// filtering //

function onKeywordClick(keyword) {
  if (keyword === 'all') {
    renderGallery(gImgs)
  } else {
    updateKeywordSearchCount(keyword)
    renderKeywords()
    const filteredImgs = filterImagesByKeyword(keyword)
    renderGallery(filteredImgs)
  }
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
