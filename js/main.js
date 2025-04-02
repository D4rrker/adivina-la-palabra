import { winInfo, defeatInfo, words } from './consts.js'
import { renderKeyBoard, eventClick } from './keyBoard.js'

const rowKeyBoardHTML = document.querySelectorAll('.row-section-keyboard')
const rowSectionHTML = document.querySelectorAll('.row-section')
const templateStructure = document.getElementById('card-template')
const main = document.querySelector('main')

const regex = /^[a-zA-Z]$/ // Solo acepta letras
let word
let isGuessed = false

let cols
const rows = rowSectionHTML.length

let currentCol = 0
let currentRow = 0

let descWord

const selectRandomWord = () => {
  word = words[Math.floor(Math.random() * words.length)]
  cols = word.length
}

const addFocusInBox = () => {
  const boxes = document.querySelectorAll('.letterBox')

  boxes.forEach((box) => {
    box.classList.remove('letterBox-selected')
  })

  if (currentCol >= cols) return // Si la posición de la columan es la última no hacemos nada
  rowSectionHTML[currentRow].childNodes[currentCol].classList.add(
    'letterBox-selected'
  )
}

// Aplicar clase 'letterBox-selected' a su correspondiente fila
const setCurrentColInNewRow = () => {
  rowSectionHTML[currentRow].children[currentCol].classList.add(
    'letterBox-selected'
  )
}

// Crear la UI
const createBoxForGrid = () => {
  const div = document.createElement('div')
  div.classList.add('letterBox')
  return div
}

// Evento para cada 'caja' del
const handleUpdateFocusByClick = (event) => {
  const colClicked = event.target.dataset.col
  currentCol = Number(colClicked)

  addFocusInBox()
}

const updateFocusByClick = (isMaxRow = false) => {
  // Antes de añadir un nuevo evento limpiar todos de todas las cajas
  const boxes = document.querySelectorAll('.letterBox')
  boxes.forEach((box) => {
    box.removeEventListener('click', handleUpdateFocusByClick)
    box.classList.remove('current-row')
  })

  const row = rowSectionHTML[currentRow].childNodes

  // Agregar evento y clase solo si no se está en la última fila o si todavia no se ha adivinado la palabra
  row.forEach((box) => {
    isGuessed || isMaxRow
      ? box.removeEventListener('click', handleUpdateFocusByClick)
      : (box.addEventListener('click', handleUpdateFocusByClick),
        box.classList.add('current-row'))
  })
}

// Imprimir la letra pulsada. Se exporta la función para que el 'keyboard' renderizado pueda imprimirlo también
export const printLetter = (letter) => {
  const currentBox = rowSectionHTML[currentRow].children[currentCol]

  if (currentCol >= cols || isGuessed) return // Si la posición de la columan es la última no hacemos nada o si se ha adivinado la palabra
  currentBox.innerHTML = letter
  currentCol++
  addFocusInBox()
}

// Al cambiar de columna con un click se limpia la clase que aparece
const clearClassSelected = () => {
  const row = rowSectionHTML[currentRow].childNodes
  row.forEach((box) => box.classList.remove('letterBox-selected'))
}

const resetGame = () => {
  const boxes = document.querySelectorAll('.letterBox')
  const keyBoxes = document.querySelectorAll('.row-section-keyboard > div')
  boxes.forEach((box) => box.remove())
  keyBoxes.forEach((box) => box.remove())
  currentCol = 0
  currentRow = 0
  isGuessed = false
  render()
}

// En caso de adivinar la palbra aparecerá en formato de cajas
const createWordDisplay = (isWin) => {
  const containerLettersWin = document.createElement('div')
  containerLettersWin.classList.add('container-word')
  Array.from(word).map((letter) => {
    const span = document.createElement('span')
    span.textContent = letter
    span.classList.add('letter-word')
    isWin
      ? span.classList.add('letter-word-win')
      : span.classList.add('letter-word-defeat')
    containerLettersWin.appendChild(span)
  })

  return containerLettersWin
}

// Cuando se gane o se pierda mostrar pantalla
const showEndGameScreen = ({ title }, isWin = false) => {
  const $ = (select, parent) => parent.querySelector(select)

  const clone = templateStructure.content.cloneNode(true)
  const parentCard = $('.container-card', clone)
  const card = $('.card', clone)

  if (isWin) {
    const cardMedal = $('.card-medal', card)
    const img = document.createElement('img')
    img.src = './svgs/medal.svg'
    cardMedal.appendChild(img)
  }

  const cardTitleWord = $('.card-title-word', card)
  const h2 = $('h2', cardTitleWord)
  const wordDiv = $('.word', cardTitleWord)
  h2.textContent = title
  wordDiv.appendChild(createWordDisplay(isWin))

  const button = $('button', card)

  isWin
    ? (button.classList.add('styles-button-win'),
      card.classList.add('card-win'))
    : (button.classList.add('styles-button-defeat'),
      card.classList.add('card-defeat'))

  button.addEventListener('click', () => {
    parentCard.remove()
    resetGame()
  })

  setTimeout(() => card.classList.add('expand-card'), 100)
  main.appendChild(clone)

  if (!isWin) return clearClassSelected()

  isGuessed = true

  updateFocusByClick()
}

// Si la posición de la letra coincide con el de la letra de la palbra a adivinar se marca como 'adivinada'
const markCorrectLetter = ({
  correctPositions,
  wordLetterCount,
  letterUserWord,
  letterWord,
  index,
  currentBox,
  keyMap,
}) => {
  if (letterUserWord === letterWord) {
    currentBox.classList.add('guessed', 'letterBox-checked')
    correctPositions[index] = true
    wordLetterCount[letterUserWord]-- // Reducimos la cantidad disponible

    if (keyMap.has(letterUserWord)) {
      keyMap.get(letterUserWord).classList.add('guessed')
    }
  }
}

// Comprobar si coinciden las letras según la posición. Hace conteo de las letras repetidas para que no se duplique la comprobación
const checkWordGuess = (wordUser) => {
  const row = rowSectionHTML[currentRow].childNodes
  const keys = Array.from(
    document.querySelectorAll('.row-section-keyboard > div')
  )

  const keyMap = new Map()
  keys.forEach((keyBox) => {
    const letter = keyBox.textContent.trim().toLowerCase()
    if (letter) keyMap.set(letter, keyBox)
  })

  const wordToArray = Array.from(word)
  const correctPositions = new Array(word.length).fill(false) // Marcar los aciertos
  const wordLetterCount = {} // Para contar cuántas veces aparece cada letra en la palabra a adivinar

  for (let letter of wordToArray) {
    wordLetterCount[letter] = (wordLetterCount[letter] || 0) + 1
  }

  // Marcar las letras correctas en la posición exacta 'verde'
  for (let i = 0; i < word.length; i++) {
    const currentBox = row[i]
    const letterWord = word[i]
    const letterUserWord = wordUser[i]

    markCorrectLetter({
      correctPositions,
      wordLetterCount,
      letterUserWord,
      letterWord,
      index: i,
      currentBox,
      keyMap,
    })
  }

  // Marcar las letras en posición incorrecta 'amarillo'
  for (let i = 0; i < word.length; i++) {
    if (correctPositions[i]) continue

    const currentBox = row[i]
    const letterUserWord = wordUser[i]

    if (wordLetterCount[letterUserWord] > 0) {
      currentBox.classList.add('misplaced', 'letterBox-checked')
      if (
        keyMap.has(letterUserWord) &&
        !keyMap.get(letterUserWord).classList.contains('guessed')
      ) {
        keyMap.get(letterUserWord).classList.add('misplaced')
      }
      wordLetterCount[letterUserWord]--
    } else {
      currentBox.classList.add('missing', 'letterBox-checked')
      if (
        keyMap.has(letterUserWord) &&
        !keyMap.get(letterUserWord).classList.contains('keyboard-missing')
      ) {
        keyMap.get(letterUserWord).classList.add('keyboard-missing')
        keys.forEach((keysBox) => {
          if (keysBox.classList.contains('keyboard-missing')) {
            keysBox.removeEventListener('click', eventClick)
          }
        })
      }
    }
  }

  if (wordUser === word) return showEndGameScreen(winInfo, true) //1. Validar si la palabra del usuario es la misma que la palabra a adivinar

  if (currentRow < rows - 1) {
    currentRow++
    currentCol = 0
    setCurrentColInNewRow()
    return false
  } else {
    updateFocusByClick(true)
    clearClassSelected()
    return true
  }
}

// Verificar que no se reciba un carácter vacío y que tenga la misma longitud que la palabra a adivinar
export const verifyWordFromUser = () => {
  const row = rowSectionHTML[currentRow].childNodes
  const wordFromUser = []

  row.forEach((box) => {
    const letter = box.textContent
    wordFromUser.push(letter)
  })

  const wordJoined = wordFromUser.join('').toLocaleLowerCase()

  const isAvailable = wordJoined.length < word.length ? false : true //1. Comprobar que la palabra del usuario sea la misma longitud que la palabra a adivinar
  if (!isAvailable) return

  const isLastRow = checkWordGuess(wordJoined) //2. Devuelve 'TRUE' o 'FALSE' para comprobar que si está en la última fila no hacer nada

  if (isLastRow) return showEndGameScreen(defeatInfo) //2. No hacer nada si ya se ha jugado en la última fila

  updateFocusByClick()
}

export const deleteLetter = () => {
  const row = rowSectionHTML[currentRow].childNodes
  if (currentCol === 0) return

  currentCol--
  row[currentCol].innerHTML = ''
  addFocusInBox()
}

const render = () => {
  selectRandomWord()

  let row = 0
  for (let i = 0; i < rowSectionHTML.length; i++) {
    const currentRow = rowSectionHTML[i]
    let col = 0
    for (let c = 0; c < cols; c++) {
      const div = createBoxForGrid()
      div.dataset.col = col
      div.dataset.row = row
      currentRow.appendChild(div)
      col++
    }
    row++
  }
  updateFocusByClick()
  setCurrentColInNewRow()
  addFocusInBox() // Cada vez que se renderice agregar el 'FOCUS' a su respectivo elemento
  renderKeyBoard(rowKeyBoardHTML)
}

render()

document.addEventListener('keydown', (event) => {
  const letter = event.key

  if (regex.test(letter)) printLetter(letter)
  if (event.key === 'Tab') event.preventDefault()
  if (event.key === 'Enter') verifyWordFromUser()
  if (event.key === 'Backspace') deleteLetter()
})
