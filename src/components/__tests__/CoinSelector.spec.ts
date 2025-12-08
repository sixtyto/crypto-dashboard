import type { Coin } from '../../composables/useCoins'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import CoinSelector from '../CoinSelector.vue'

describe('coinSelector.vue', () => {
  const mockCoins: Coin[] = [
    {
      uuid: 'Qwsogvtv82FCd',
      symbol: 'BTC',
      name: 'Bitcoin',
      color: '#f7931A',
      iconUrl: 'https://cdn.coinranking.com/bOabBYkcX/bitcoin_btc.svg',
      marketCap: '1000',
      price: '50000',
      listedAt: 1234567890,
      tier: 1,
      change: '1.2',
      rank: 1,
    },
    {
      uuid: 'razxDUgYGNAdQ',
      symbol: 'ETH',
      name: 'Ethereum',
      color: '#3C3C3D',
      iconUrl: 'https://cdn.coinranking.com/rk4RKHOuW/eth.svg',
      marketCap: '500',
      price: '3000',
      listedAt: 1234567890,
      tier: 1,
      change: '2.5',
      rank: 2,
    },
  ]

  it('renders selected coin correctly', () => {
    const wrapper = mount(CoinSelector, {
      props: {
        'modelValue': 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e }),
        'coins': mockCoins,
      },
    })

    expect(wrapper.text()).toContain('Bitcoin (BTC)')
  })

  it('updates model when selection changes', async () => {
    const wrapper = mount(CoinSelector, {
      props: {
        'modelValue': 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e }),
        'coins': mockCoins,
      },
    })

    // Open dropdown
    await wrapper.find('.combobox-trigger').trigger('click')

    // Find option for ETH
    const options = wrapper.findAll('.option-item')
    const ethOption = options.find(o => o.text().includes('Ethereum'))

    await ethOption?.trigger('click')

    expect(wrapper.props('modelValue')).toBe('ETH')
  })

  it('filters options based on search', async () => {
    const wrapper = mount(CoinSelector, {
      props: {
        'modelValue': 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e }),
        'coins': mockCoins,
      },
    })

    // Open dropdown
    await wrapper.find('.combobox-trigger').trigger('click')

    // Set search query
    const input = wrapper.find('input')
    await input.setValue('Eth')

    const options = wrapper.findAll('.option-item')
    expect(options).toHaveLength(1)
    expect(options[0].text()).toContain('Ethereum')
  })
})
