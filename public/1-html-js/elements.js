let cachedElements = null

export function getElements () {
  initCache()
  return cachedElements
}

function initCache () {
  if (!cachedElements) {
    cachedElements = {
      taskList: document.getElementById('task-list'),
      taskNameInput: document.getElementById('task-name'),
      taskDescriptionInput: document.getElementById('task-description'),
      addTaskButton: document.getElementById('add-task'),
      confirmDialog: document.querySelector('dialog'),
      taskTemplate: document.querySelector('#task-list template')
    }
  }
}
