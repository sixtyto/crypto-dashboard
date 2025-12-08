import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CoinSelector from '../CoinSelector.vue'

// Mock constants if needed, but they are just data.
// We can import them to check against.
import { COIN_OPTIONS } from '../../constants/coins'

describe('CoinSelector.vue', () => {
  it('renders all options', () => {
    const wrapper = mount(CoinSelector, {
      props: {
        modelValue: 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e })
      }
    })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(COIN_OPTIONS.length)
  })

  it('updates model when selection changes', async () => {
     const wrapper = mount(CoinSelector, {
      props: {
        modelValue: 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e })
      }
    })

    const select = wrapper.find('select')
    await select.setValue('ETH')

    expect(wrapper.props('modelValue')).toBe('ETH')
  })
})
