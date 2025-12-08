<script lang="ts" setup generic="T">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  options: T[]
  modelValue: T | undefined
  displayValue?: (option: T) => string
  filterFunction?: (option: T, query: string) => boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()

const isOpen = ref(false)
const search = ref('')

const filteredOptions = computed(() => {
  const query = search.value.toLowerCase()
  if (!query)
    return props.options
  if (props.filterFunction) {
    return props.options.filter(option => props.filterFunction!(option, query))
  }
  // Default filtering if no function provided (simple string check if T is string, or try stringifying)
  return props.options.filter((option) => {
    const val = props.displayValue ? props.displayValue(option) : String(option)
    return val.toLowerCase().includes(query)
  })
})

function select(option: T) {
  emit('update:modelValue', option)
  isOpen.value = false
  search.value = ''
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    search.value = ''
  }
}

function close(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.combobox-wrapper')) {
    isOpen.value = false
  }
}

watch(isOpen, (value) => {
  if (value) {
    window.addEventListener('click', close)
  }
  else {
    window.removeEventListener('click', close)
  }
})
</script>

<template>
  <div class="combobox-wrapper">
    <div
      class="combobox-trigger"
      @click.stop="toggle"
    >
      <span v-if="modelValue" class="selected-value">
        <slot name="selected" :option="modelValue">
          {{ displayValue ? displayValue(modelValue) : String(modelValue) }}
        </slot>
      </span>
      <span v-else class="placeholder">{{ placeholder || 'Select...' }}</span>
      <span class="chevron">▼</span>
    </div>

    <div v-if="isOpen" class="dropdown">
      <div class="search-wrapper">
        <input
          v-model="search"
          type="text"
          placeholder="Search..."
          class="search-input"
          @click.stop
        >
      </div>
      <ul class="options-list">
        <li
          v-for="(option, index) in filteredOptions"
          :key="index"
          class="option-item"
          @click="select(option)"
        >
          <slot name="option" :option="option">
            {{ displayValue ? displayValue(option) : String(option) }}
          </slot>
        </li>
        <li v-if="filteredOptions.length === 0" class="no-results">
          No results found
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.combobox-wrapper {
  position: relative;
  width: 100%;
  font-size: 1rem;
}

.combobox-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s;
  height: 42px;
}

.combobox-trigger:hover {
  border-color: var(--color-accent-primary);
}

.selected-value {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
}

.chevron {
  font-size: 0.8em;
  opacity: 0.6;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 4px;
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  overflow: hidden;
}

.search-wrapper {
  padding: 8px;
  border-bottom: 1px solid var(--color-border);
}

.search-input {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
}

.options-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.option-item:hover {
  background-color: var(--color-bg-primary);
}

.no-results {
  padding: 12px;
  text-align: center;
  color: var(--color-text-secondary);
}
</style>
