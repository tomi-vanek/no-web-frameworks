import { getElements } from './elements.js'
import { confirmNewTask, updateButtonDisabling } from './actions.js'

export function startApp () {
  const page = getElements()
  page.addTaskButton.onclick = confirmNewTask
  page.taskNameInput.oninput = updateButtonDisabling
  updateButtonDisabling()
}
