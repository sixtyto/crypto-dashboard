import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '../ThemeToggle.vue'
import { ref } from 'vue'
import * as useThemeModule from '../../composables/useTheme'

vi.mock('../../composables/useTheme', () => ({
  useTheme: vi.fn()
}))

describe('ThemeToggle.vue', () => {
    const mockTheme = ref('dark')
    const mockToggleTheme = vi.fn()

    beforeEach(() => {
        mockTheme.value = 'dark'
        vi.clearAllMocks()

        vi.mocked(useThemeModule.useTheme).mockReturnValue({
            theme: mockTheme,
            toggleTheme: mockToggleTheme
        })
    })

  it('renders correctly', () => {
    const wrapper = mount(ThemeToggle)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays MoonIcon when theme is dark (indicating current state or action depending on UX)', () => {
    mockTheme.value = 'dark'
    const wrapper = mount(ThemeToggle)

    // When theme is dark, isDark is true.
    // Template: <SunIcon v-if="!isDark" /> <MoonIcon v-else />
    // So it renders MoonIcon.

    expect(wrapper.findComponent({ name: 'MoonIcon' }).exists()).toBe(true)
    expect(wrapper.attributes('title')).toBe('Switch to Light Mode')
  })

  it('displays SunIcon when theme is light (indicating current state or action depending on UX)', () => {
    mockTheme.value = 'light'
    const wrapper = mount(ThemeToggle)

    // When theme is light, isDark is false.
    // Template: <SunIcon v-if="!isDark" />
    // So it renders SunIcon.

    expect(wrapper.findComponent({ name: 'SunIcon' }).exists()).toBe(true)
    expect(wrapper.attributes('title')).toBe('Switch to Dark Mode')
  })

  it('calls toggleTheme on click', async () => {
    const wrapper = mount(ThemeToggle)
    await wrapper.trigger('click')
    expect(mockToggleTheme).toHaveBeenCalled()
  })
})
