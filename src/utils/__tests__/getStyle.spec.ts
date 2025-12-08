import { describe, expect, it, vi } from 'vitest'
import { getStyle } from '../getStyle'

describe('getStyle', () => {
  it('should return the computed style property value', () => {
    // Mock getComputedStyle
    const mockGetComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(' 16px '),
    })
    vi.stubGlobal('getComputedStyle', mockGetComputedStyle)

    const result = getStyle('font-size')

    expect(mockGetComputedStyle).toHaveBeenCalledWith(document.documentElement)
    expect(result).toBe('16px')
  })

  it('should trim the returned value', () => {
    const mockGetComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('  red  '),
    })
    vi.stubGlobal('getComputedStyle', mockGetComputedStyle)

    expect(getStyle('color')).toBe('red')
  })
})
