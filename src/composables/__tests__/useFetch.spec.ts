import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useFetch } from '../useFetch'

// Mock global fetch
globalThis.fetch = vi.fn()

describe('useFetch', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    ;(globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })

    const { data, isFetching } = useFetch('https://api.example.com/data')

    // We need to wait for the promise to resolve.
    // Since we are mocking fetch to be immediate resolved value,
    // we just need to wait for microtasks.
    await vi.runAllTimersAsync()

    expect(data.value).toEqual(mockData)
    expect(isFetching.value).toBe(false)
  })

  it('should handle fetch errors and retry', async () => {
    const errorMessage = 'Network error'
    ;(globalThis.fetch as any).mockRejectedValue(new Error(errorMessage))

    const { data, error, isFetching } = useFetch('https://api.example.com/error')

    // 1st attempt fails, waits 1s
    await vi.runAllTimersAsync()
    // It should have called fetch 4 times (1 initial + 3 retries)
    expect(globalThis.fetch).toHaveBeenCalledTimes(4)

    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
    expect(isFetching.value).toBe(false)
  })

  it('should handle non-ok response', async () => {
    ;(globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
    })

    const { error } = useFetch('https://api.example.com/404')

    await vi.runAllTimersAsync()

    expect(globalThis.fetch).toHaveBeenCalledTimes(4) // Retries on error thrown
    expect(error.value).toBeTruthy()
    expect(error.value.message).toBe('Resource not found')
  })

  it('should handle non-ok response without json message', async () => {
    ;(globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('No JSON') },
    })

    const { error } = useFetch('https://api.example.com/500')

    await vi.runAllTimersAsync()

    expect(error.value.message).toBe('Error: 500 Internal Server Error')
  })

  it('should not fetch if url is empty', async () => {
    const { isFetching } = useFetch('')
    expect(isFetching.value).toBe(false)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('should refetch when url changes', async () => {
    const mockData1 = { id: 1 }
    const mockData2 = { id: 2 }

    const url = ref('https://api.example.com/1')

    ;(globalThis.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData1,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData2,
      })

    const { data } = useFetch(url)

    await vi.runAllTimersAsync()
    expect(data.value).toEqual(mockData1)

    url.value = 'https://api.example.com/2'
    await vi.runAllTimersAsync()
    expect(data.value).toEqual(mockData2)
  })
})
