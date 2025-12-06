import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useQueryParameter(key: string, defaultValue: string = '') {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get: () => (route.query[key] as string) || defaultValue,
    set: (newValue: string) => {
      const query = { ...route.query }
      if (newValue) {
        query[key] = newValue
      }
      else {
        delete query[key]
      }
      router.replace({ query })
    },
  })
}
