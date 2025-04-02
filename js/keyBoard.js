import { keyBoard } from './consts.js'
import { printLetter, deleteLetter, verifyWordFromUser } from './main.js'

export const eventClick = (event) => {
  const letter = event.target.textContent
  printLetter(letter)
}

const addEventClick = (div) => {
  const divEnter = div.classList.contains('keyboard-click')
  const divDelete = div.classList.contains('keyboard-delete')

  if (divEnter) div.addEventListener('click', verifyWordFromUser)
  else if (divDelete) div.addEventListener('click', deleteLetter)
  else div.addEventListener('click', eventClick)
}

export const renderKeyBoard = (rowSection) => {
  keyBoard.forEach((row, index) => {
    const currentRow = rowSection[index]

    if (index > 1) currentRow.classList.add('special')

    row.forEach((letter, index) => {
      const div = document.createElement('div')
      div.textContent = letter.toUpperCase()

      if (letter === '' && index === 0) {
        // Agregar en 'img' un SVG de 'click' en su casilla
        const img = document.createElement('img')
        img.src = './svgs/click.svg'

        div.appendChild(img)
        div.classList.add('keyboard-special-row', 'keyboard-click')
      } else if (letter === '' && index === 8) {
        // Agregar en 'img' un SVG de 'delete' en su casilla
        const img = document.createElement('img')
        img.src = './svgs/delete.svg'

        div.appendChild(img)
        div.classList.add('keyboard-special-row', 'keyboard-delete')
      }

      currentRow.appendChild(div)
      addEventClick(div)
    })
  })
}
