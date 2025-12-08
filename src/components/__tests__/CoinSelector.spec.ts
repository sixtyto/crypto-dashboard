import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { COIN_OPTIONS } from '../../constants/coins'
import CoinSelector from '../CoinSelector.vue'

describe('coinSelector.vue', () => {
  it('renders all options', () => {
    const wrapper = mount(CoinSelector, {
      props: {
        'modelValue': 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e }),
      },
    })

    const options = wrapper.findAll('option')
    expect(options).toHaveLength(COIN_OPTIONS.length)
  })

  it('updates model when selection changes', async () => {
    const wrapper = mount(CoinSelector, {
      props: {
        'modelValue': 'BTC',
        'onUpdate:modelValue': (e: any) => wrapper.setProps({ modelValue: e }),
      },
    })

    const select = wrapper.find('select')
    await select.setValue('ETH')

    expect(wrapper.props('modelValue')).toBe('ETH')
  })
})
