import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseCombobox from '../BaseCombobox.vue'

describe('BaseCombobox.vue', () => {
  const options = [
    { id: 1, label: 'Option 1' },
    { id: 2, label: 'Option 2' },
  ]

  it('renders correctly', () => {
    const wrapper = mount(BaseCombobox, {
      props: {
        options,
        modelValue: undefined,
        displayValue: (o: any) => o.label,
      },
    })
    expect(wrapper.text()).toContain('Select...')
  })

  it('shows options when clicked', async () => {
    const wrapper = mount(BaseCombobox, {
      props: {
        options,
        modelValue: undefined,
        displayValue: (o: any) => o.label,
      },
    })

    await wrapper.find('.combobox-trigger').trigger('click')
    expect(wrapper.findAll('.option-item')).toHaveLength(2)
  })

  it('filters options', async () => {
    const wrapper = mount(BaseCombobox, {
      props: {
        options,
        modelValue: undefined,
        displayValue: (o: any) => o.label,
      },
    })

    await wrapper.find('.combobox-trigger').trigger('click')
    await wrapper.find('input').setValue('Option 1')

    expect(wrapper.findAll('.option-item')).toHaveLength(1)
    expect(wrapper.find('.option-item').text()).toBe('Option 1')
  })

  it('emits update:modelValue on selection', async () => {
    const wrapper = mount(BaseCombobox, {
      props: {
        options,
        modelValue: undefined,
        displayValue: (o: any) => o.label,
      },
    })

    await wrapper.find('.combobox-trigger').trigger('click')
    await wrapper.findAll('.option-item')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([options[1]])
  })
})
