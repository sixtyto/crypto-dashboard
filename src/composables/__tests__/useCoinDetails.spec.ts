import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useCoinDetails } from '../useCoinDetails'
import * as useFetchModule from '../useFetch'

vi.mock('../useFetch', () => ({
  useFetch: vi.fn(),
}))

describe('useCoinDetails', () => {
  const mockUseFetchData = ref<any>(null)
  const mockUseFetchError = ref<any>(null)
  const mockUseFetchIsFetching = ref(false)

  beforeEach(() => {
    mockUseFetchData.value = null
    mockUseFetchError.value = null
    mockUseFetchIsFetching.value = false
    vi.clearAllMocks()

    vi.mocked(useFetchModule.useFetch).mockReturnValue({
      data: mockUseFetchData,
      error: mockUseFetchError,
      isFetching: mockUseFetchIsFetching,
      refetch: vi.fn(),
    })
  })

  it('should return coin details when data is fetched successfully', () => {
    mockUseFetchData.value = {
      status: 'success',
      data: {
        coin: {
          'price': '50000',
          'change': '5',
          'marketCap': '1000000000',
          '24hVolume': '50000000',
        },
      },
    }

    const { details } = useCoinDetails('Qwsogvtv82FCd')

    expect(details.value).toEqual({
      'price': '50000',
      'change': '5',
      'marketCap': '1000000000',
      '24hVolume': '50000000',
    })
  })

  it('should return null when data fetch fails or is invalid', () => {
    mockUseFetchData.value = {
      status: 'fail',
    }
    const { details } = useCoinDetails('Qwsogvtv82FCd')
    expect(details.value).toBeNull()
  })

  it('should construct the correct URL', () => {
    useCoinDetails('razxDUgYGNAdQ')

    const useFetchMock = vi.mocked(useFetchModule.useFetch)
    expect(useFetchMock).toHaveBeenCalled()
    const passedUrlRef = useFetchMock.mock.calls[0][0]
    expect(passedUrlRef.value).toContain('razxDUgYGNAdQ')
  })

  it('should not construct URL if coin uuid is empty', () => {
    useCoinDetails('')

    const useFetchMock = vi.mocked(useFetchModule.useFetch)
    const passedUrlRef = useFetchMock.mock.calls[0][0]
    expect(passedUrlRef.value).toBe('')
  })
})
