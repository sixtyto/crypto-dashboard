import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { useTheme } from '../useTheme'

const TestComponent = defineComponent({
  template: '<div></div>',
  setup() {
    return useTheme()
  },
})

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('should initialize with dark theme by default (no local storage, no system preference)', () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.theme).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('should initialize with light theme if system prefers light', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        // ...
      })),
    })

    const wrapper = mount(TestComponent)
    expect(wrapper.vm.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('should initialize with saved theme from local storage', () => {
    localStorage.setItem('theme', 'light')
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.theme).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('should toggle theme', async () => {
    const wrapper = mount(TestComponent)
    expect(wrapper.vm.theme).toBe('dark')

    wrapper.vm.toggleTheme()
    await nextTick() // Wait for Vue to process the state change and watchers

    expect(wrapper.vm.theme).toBe('light')
    expect(localStorage.getItem('theme')).toBe('light')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    wrapper.vm.toggleTheme()
    await nextTick()

    expect(wrapper.vm.theme).toBe('dark')
    expect(localStorage.getItem('theme')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
