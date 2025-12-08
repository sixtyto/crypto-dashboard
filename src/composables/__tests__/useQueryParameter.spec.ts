import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useQueryParameter } from '../useQueryParameter'
import { createRouter, createWebHistory } from 'vue-router'
import { defineComponent, nextTick } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'

const TestComponent = defineComponent({
  template: '<div></div>',
  setup() {
    const param = useQueryParameter('q', 'default')
    return { param }
  }
})

describe('useQueryParameter', () => {
    let router: any

    beforeEach(async () => {
        router = createRouter({
            history: createWebHistory(),
            routes: [{ path: '/', component: TestComponent }]
        })
        router.push('/')
        await router.isReady()
    })

    it('should return default value if query param is missing', async () => {
        const wrapper = mount(TestComponent, {
            global: {
                plugins: [router]
            }
        })

        expect(wrapper.vm.param).toBe('default')
    })

    it('should return query param value if present', async () => {
        await router.push({ query: { q: 'test' } })
         const wrapper = mount(TestComponent, {
            global: {
                plugins: [router]
            }
        })
        expect(wrapper.vm.param).toBe('test')
    })

    it('should update query param when value is set', async () => {
        const wrapper = mount(TestComponent, {
            global: {
                plugins: [router]
            }
        })

        wrapper.vm.param = 'newValue'

        // Wait for promises (router navigation) to complete
        await flushPromises()
        await nextTick()

        expect(router.currentRoute.value.query.q).toBe('newValue')
    })

    it('should remove query param when set to empty/null', async () => {
        await router.push({ query: { q: 'test' } })
         const wrapper = mount(TestComponent, {
            global: {
                plugins: [router]
            }
        })

        wrapper.vm.param = ''
        await flushPromises()
        await nextTick()

        expect(router.currentRoute.value.query.q).toBeUndefined()
    })
})
