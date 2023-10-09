import { getElements } from './elements.js'

export function updateButtonDisabling () {
  const page = getElements()

  const disabled = !page.taskNameInput.value.length
  if (disabled) {
    page.addTaskButton.setAttribute('disabled', true)
  } else {
    page.addTaskButton.removeAttribute('disabled')
  }
}

export function confirmNewTask () {
  openConfirmDialog(addTaskHandler)
}

function openConfirmDialog (submitHandler) {
  const page = getElements()

  const taskName = page.taskNameInput.value
  const taskNameText = page.confirmDialog.querySelector('em')
  taskNameText.innerText = taskName
  page.confirmDialog.addEventListener('close', submitHandler)
  page.confirmDialog.showModal()
}

function addTaskHandler (event) {
  if (event.target.returnValue === 'yes') {
    addTaskToList()
    resetTaskInputs()
  }
  event.target.returnValue = undefined
}

function addTaskToList () {
  const page = getElements()

  const newTaskItem = page.taskTemplate.content.cloneNode(true)

  const newTaskSummary = newTaskItem.querySelector('summary')
  newTaskSummary.innerText = page.taskNameInput.value

  const newTaskDetails = newTaskItem.querySelector('details p')
  newTaskDetails.innerText = page.taskDescriptionInput.value

  const deleteButton = newTaskItem.querySelector('button')
  deleteButton.onclick = removeParentElement

  page.taskList.appendChild(newTaskItem)
}

function resetTaskInputs () {
  const page = getElements()

  page.taskNameInput.value = ''
  page.taskDescriptionInput.value = ''
  updateButtonDisabling()
}

function removeParentElement (event) {
  event.target.parentElement.remove()
}
