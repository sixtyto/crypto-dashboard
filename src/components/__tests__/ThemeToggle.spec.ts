import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import * as useThemeModule from '../../composables/useTheme'
import ThemeToggle from '../ThemeToggle.vue'

vi.mock('../../composables/useTheme', () => ({
  useTheme: vi.fn(),
}))

describe('themeToggle.vue', () => {
  const mockTheme = ref('dark')
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    mockTheme.value = 'dark'
    vi.clearAllMocks()

    vi.mocked(useThemeModule.useTheme).mockReturnValue({
      theme: mockTheme,
      toggleTheme: mockToggleTheme,
    })
  })

  it('renders correctly', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays MoonIcon when theme is dark', () => {
    mockTheme.value = 'dark'
    const wrapper = mount(ThemeToggle)
    expect(wrapper.findComponent({ name: 'MoonIcon' }).exists()).toBe(true)
    expect(wrapper.attributes('title')).toBe('Switch to Light Mode')
  })

  it('displays SunIcon when theme is light', () => {
    mockTheme.value = 'light'
    const wrapper = mount(ThemeToggle)
    expect(wrapper.findComponent({ name: 'SunIcon' }).exists()).toBe(true)
    expect(wrapper.attributes('title')).toBe('Switch to Dark Mode')
  })

  it('calls toggleTheme on click', async () => {
    const wrapper = mount(ThemeToggle)
    await wrapper.trigger('click')
    expect(mockToggleTheme).toHaveBeenCalled()
  })
})
