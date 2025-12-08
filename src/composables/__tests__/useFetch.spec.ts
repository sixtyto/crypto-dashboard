import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useFetch } from '../useFetch'

// Mock global fetch
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

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
    mockFetch.mockResolvedValue({
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
    mockFetch.mockRejectedValue(new Error(errorMessage))

    const { data, error, isFetching } = useFetch('https://api.example.com/error')

    // 1st attempt fails, waits 1s
    await vi.runAllTimersAsync()
    // It should have called fetch 4 times (1 initial + 3 retries)
    expect(mockFetch).toHaveBeenCalledTimes(4)

    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
    expect(isFetching.value).toBe(false)
  })

  it('should handle non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Resource not found' }),
    })

    const { error } = useFetch('https://api.example.com/404')

    await vi.runAllTimersAsync()

    expect(mockFetch).toHaveBeenCalledTimes(4) // Retries on error thrown
    expect(error.value).toBeTruthy()
    expect(error.value.message).toBe('Resource not found')
  })

  it('should handle non-ok response without json message', async () => {
    mockFetch.mockResolvedValue({
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
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should refetch when url changes', async () => {
    const mockData1 = { id: 1 }
    const mockData2 = { id: 2 }

    const url = ref('https://api.example.com/1')

    mockFetch
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

  it('should support polling', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    })

    const scope = effectScope()
    await scope.run(async () => {
      const url = ref('https://api.example.com/data')
      const { data, lastUpdated } = useFetch(url, { pollingInterval: 1000 })

      // Wait for initial fetch
      await vi.advanceTimersByTimeAsync(100)
      await nextTick()

      // First fetch
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(data.value).toEqual({ data: 'test' })
      expect(lastUpdated.value).toBeInstanceOf(Date)

      const firstUpdate = lastUpdated.value

      // Advance time by 1s (polling interval)
      await vi.advanceTimersByTimeAsync(1000)

      // Second fetch
      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(lastUpdated.value).not.toBe(firstUpdate)
    })
    scope.stop()
  })

  it('should stop polling when scope is disposed', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    })

    const scope = effectScope()

    await scope.run(async () => {
      const url = ref('https://api.example.com/data')
      useFetch(url, { pollingInterval: 1000 })
      await vi.advanceTimersByTimeAsync(100)
    })

    // First fetch
    expect(mockFetch).toHaveBeenCalledTimes(1)

    // Dispose scope
    scope.stop()

    // Advance time
    await vi.advanceTimersByTimeAsync(1000)

    // Should not fetch again
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
