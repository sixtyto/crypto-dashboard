import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCoinHistory } from '../useCoinHistory'
import { ref } from 'vue'
import * as useFetchModule from '../useFetch'

vi.mock('../useFetch', () => ({
  useFetch: vi.fn(),
}))

vi.mock('../../constants/coins', () => ({
  COIN_MAP: {
    BTC: 'Qwsogvtv82FCd',
  },
}))

describe('useCoinHistory', () => {
    const mockUseFetchData = ref<any>(null)

    beforeEach(() => {
        mockUseFetchData.value = null
        vi.clearAllMocks()

        vi.mocked(useFetchModule.useFetch).mockReturnValue({
            data: mockUseFetchData,
            error: ref(null),
            isFetching: ref(false),
            refetch: vi.fn(),
        })
    })

  it('should return reversed history when data is fetched', () => {
    mockUseFetchData.value = {
      status: 'success',
      data: {
        history: [
          { price: '100', timestamp: 1 },
          { price: '200', timestamp: 2 },
        ],
      },
    }

    const { history } = useCoinHistory('BTC', '24h')

    expect(history.value).toEqual([
      { price: '200', timestamp: 2 },
      { price: '100', timestamp: 1 },
    ])
  })

  it('should return empty array if data is invalid', () => {
      mockUseFetchData.value = { status: 'fail' }
      const { history } = useCoinHistory('BTC', '24h')
      expect(history.value).toEqual([])
  })

  it('should not construct URL if coin is not in map', () => {
    // @ts-ignore
    useCoinHistory('INVALID', '24h')

    const useFetchMock = vi.mocked(useFetchModule.useFetch)
    const passedUrlRef = useFetchMock.mock.calls[0][0]
    expect(passedUrlRef.value).toBe('')
  })
})
