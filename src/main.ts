import "./style.css"

import {
  addCategory,
  createTodo,
  deleteCategory,
  getAllCategories,
  getAllTodos,
} from "./todoModel"
import { initTodoViewer, renderTodoList } from "./todoViewer"
import {
  showAlertModal,
  showConfirmModal,
  showFormModal,
  setupModalHost,
} from "./modalService"
import { getTaskHelpFromAI } from "./apiService" // make sure this is at the top of main.ts

// ---------- AI LOADING OVERLAY HELPERS ----------

function addAiLoadingOverlay() {
  const overlay = document.createElement("div")
  overlay.id = "ai-loading-overlay"
  overlay.className =
    "fixed inset-0 z-50 hidden items-center justify-center bg-black/10"

  overlay.innerHTML = `
    <div class="flex items-center gap-4 rounded-2xl bg-white border border-gray-200 px-6 py-5 shadow-lg">
      <div class="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
      <div class="space-y-0.5">
        <p class="text-sm font-semibold text-gray-800">Getting help from AI…</p>
        <p class="text-xs text-gray-500">This may take a moment.</p>
      </div>
    </div>
  `

  document.body.appendChild(overlay)
}

function showAiLoading() {
  const el = document.getElementById("ai-loading-overlay")
  if (!el) return
  el.classList.remove("hidden")
  el.classList.add("flex")
}

function hideAiLoading() {
  const el = document.getElementById("ai-loading-overlay")
  if (!el) return
  el.classList.add("hidden")
  el.classList.remove("flex")
}

// --------------------------------------------------

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
  addAiLoadingOverlay() // ⬅️ inject overlay once
  initApp()
})

function initApp(): void {
  setupModalHost()
  // Set up the main UI
  setupUI()

  // Initialize the todo viewer
  initTodoViewer()

  // Set up event listeners
  setupEventListeners()
}

function setupUI(): void {
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
    <div class="min-h-screen bg-[#f5f5f7] py-10 px-4 rounded-3xl">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <header class="mb-10 text-center">
          <h1 class="text-4xl font-semibold ext-4xl font-bold tracking-tight
         bg-gradient-to-r from-[#5856D6] via-[#5E5CE6] to-[#0A84FF]
         bg-clip-text text-transparent drop-shadow-[0_0_1px_rgba(0,0,0,0.15)]">
            Todo App with AI Assistance
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            Organize your tasks and AI will help you complete them!
          </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Control Panel -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Actions</h2>

              <div class="space-y-4">

                <!-- iOS Buttons -->
                <button
                  type="button"
                  id="addCategory"
                  class="w-full py-3 rounded-2xl bg-gradient-to-b from-green-400 to-green-500 text-white font-semibold shadow-md active:scale-[0.98] transition">
                  Add Category
                </button>

                <button
                  type="button"
                  id="addTodo"
                  class="w-full py-3 rounded-2xl bg-gradient-to-b from-blue-400 to-blue-500 text-white font-semibold shadow-md active:scale-[0.98] transition">
                  Add Todo
                </button>

                <button
                  type="button"
                  id="deleteCategory"
                  class="w-full py-3 rounded-2xl bg-gradient-to-b from-red-400 to-red-500 text-white font-semibold shadow-md active:scale-[0.98] transition">
                  Delete Category
                </button>

                <button
                  type="button"
                  id="aiHelp"
                  class="w-full py-3 rounded-2xl bg-gradient-to-b from-purple-400 to-purple-500 text-white font-semibold shadow-md active:scale-[0.98] transition">
                  AI Help for a Task
                </button>

                <!-- iOS Select Menu -->
                <select
                  id="categoriesDropdown"
                  class="w-full mt-4 py-3 px-4 rounded-2xl bg-gray-100 border border-gray-300 text-gray-700 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition">
                  <option value="" disabled selected>Select a category</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Todo List -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">My Tasks</h2>

              <div id="todo-list" class="space-y-4">
                <!-- Todos generated here -->
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
}

function setupEventListeners(): void {
  // Add Category
  const addCategoryButton = document.querySelector<HTMLButtonElement>("#addCategory")
  if (addCategoryButton) {
    addCategoryButton.onclick = async () => {
      try {
        const result = await showFormModal({
          title: "Add category",
          message: "Organize your tasks by grouping them into categories.",
          confirmLabel: "Create category",
          fields: [
            {
              name: "categoryName",
              label: "Category name",
              type: "text",
              placeholder: "e.g. School",
              required: true,
            },
          ],
        })

        if (!result) return

        const categoryName = result.categoryName.trim()
        if (!categoryName) {
          await showAlertModal({
            title: "Category name required",
            message: "Please provide a category name before saving.",
          })
          return
        }

        const newCategory = await addCategory(categoryName)
        updateCategoriesDropdown()

        await showAlertModal({
          title: "Category added",
          message: `Category "${newCategory.name}" added successfully!`,
        })
      } catch (error) {
        console.error("Error adding category:", error)
        await showAlertModal({
          title: "Error",
          message: "There was an error adding the category. Please try again.",
        })
      }
    }
  }

  // Add Todo
  const addTodoButton = document.querySelector<HTMLButtonElement>("#addTodo")
  if (addTodoButton) {
    addTodoButton.onclick = async () => {
      const categories = await getAllCategories()
      if (categories.length === 0) {
        await showAlertModal({
          title: "Add a category first",
          message: "Create a category before adding your first todo.",
        })
        return
      }

      const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0]

      const result = await showFormModal({
        title: "Add todo",
        message: "Create a new todo and assign it to a category.",
        confirmLabel: "Create todo",
        fields: [
          {
            name: "name",
            label: "Todo name",
            type: "text",
            placeholder: "e.g. Finish homework",
            required: true,
          },
          {
            name: "categoryId",
            label: "Category",
            type: "select",
            required: true,
            options: categories.map((category) => ({
              label: category.name,
              value: category.id,
            })),
            initialValue: categories[0]?.id,
          },
          {
            name: "dueDate",
            label: "Due date",
            type: "date",
            required: true,
            initialValue: defaultDueDate,
          },
        ],
      })

      if (!result) return

      const name = result.name?.trim()
      if (!name) {
        await showAlertModal({
          title: "Todo name required",
          message: "Please provide a name for your todo.",
        })
        return
      }

      const dueDate = new Date(result.dueDate)
      if (Number.isNaN(dueDate.getTime())) {
        await showAlertModal({
          title: "Invalid due date",
          message: "Please select a valid due date.",
        })
        return
      }

      const newTodo = await createTodo({
        name,
        status: "pending",
        categoryId: result.categoryId,
        dueDate,
      })
      renderTodoList()
      updateCategoriesDropdown()

      await showAlertModal({
        title: "Todo added",
        message: `Todo "${newTodo.name}" added successfully!`,
      })
    }
  }

  // Delete Category
  const deleteCategoryButton = document.querySelector<HTMLButtonElement>("#deleteCategory")
  if (deleteCategoryButton) {
    deleteCategoryButton.onclick = async () => {
      const categories = await getAllCategories()
      if (categories.length === 0) {
        await showAlertModal({
          title: "No categories to delete",
          message: "Add a category before trying to delete one.",
        })
        return
      }

      const selection = await showFormModal({
        title: "Delete category",
        message: "Select the category you want to remove.",
        confirmLabel: "Continue",
        cancelLabel: "Back",
        fields: [
          {
            name: "categoryId",
            label: "Category",
            type: "select",
            required: true,
            options: categories.map((category) => ({
              label: category.name,
              value: category.id,
            })),
            initialValue: categories[0]?.id,
          },
        ],
      })

      if (!selection) return

      const category = categories.find((cat) => cat.id === selection.categoryId)
      if (!category) {
        await showAlertModal({
          title: "Category not found",
          message: "The selected category could not be found.",
        })
        updateCategoriesDropdown()
        return
      }

      const todos = await getAllTodos()
      const hasTodos = todos.some((todo) => todo.categoryId === category.id)
      if (hasTodos) {
        await showAlertModal({
          title: "Cannot delete category",
          message: `Reassign or delete todos in "${category.name}" before removing this category.`,
        })
        return
      }

      const confirmed = await showConfirmModal({
        title: "Delete category",
        message: `This action cannot be undone. Delete "${category.name}"?`,
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "danger",
        dismissible: false,
      })

      if (!confirmed) return

      await deleteCategory(category.id)
      updateCategoriesDropdown()
      await showAlertModal({
        title: "Category deleted",
        message: `Category "${category.name}" has been deleted.`,
      })
    }
  }

  // AI Help for a Task  ⚙️ now with loading overlay
  const aiHelpButton = document.querySelector<HTMLButtonElement>("#aiHelp")
  if (aiHelpButton) {
    aiHelpButton.onclick = async () => {
      const result = await showFormModal({
        title: "AI Help for a Task",
        message: "Describe the task you want help accomplishing.",
        confirmLabel: "Get help",
        cancelLabel: "Cancel",
        fields: [
          {
            name: "task",
            label: "Task",
            type: "text",
            placeholder: "e.g. Study for my biology exam",
            required: true,
          },
        ],
      })

      if (!result || !result.task?.trim()) return

      const taskText = result.task.trim()

      try {
        aiHelpButton.disabled = true
        aiHelpButton.classList.add("opacity-60", "cursor-not-allowed")
        showAiLoading()

        const explanation = await getTaskHelpFromAI(taskText)

        await showAlertModal({
          title: "How to accomplish this task",
          message: explanation,
        })
      } catch (err) {
        console.error(err)
        await showAlertModal({
          title: "AI Error",
          message: "Couldn't retrieve AI help. Please try again.",
        })
      } finally {
        hideAiLoading()
        aiHelpButton.disabled = false
        aiHelpButton.classList.remove("opacity-60", "cursor-not-allowed")
      }
    }
  }

  const deleteTodoButton = document.querySelector<HTMLButtonElement>("#deleteTodo")
  if (deleteTodoButton) {
    deleteTodoButton.onclick = async () => {
      await showAlertModal({
        title: "Tip",
        message: "Use the Delete button on individual todos in the list below.",
      })
    }
  }

  // Initialize categories dropdown
  updateCategoriesDropdown()
}

// Function to populate categories dropdown
async function updateCategoriesDropdown(): Promise<void> {
  const dropdown = document.querySelector<HTMLSelectElement>("#categoriesDropdown")!
  const categories = await getAllCategories()

  // Clear existing options (except the first placeholder)
  dropdown.innerHTML = '<option value="" disabled selected>Select a category</option>'

  // Add each category as an option
  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category.id
    option.textContent = category.name
    dropdown.appendChild(option)
  })
}
