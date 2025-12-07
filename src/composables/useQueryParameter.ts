import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useQueryParameter<T extends string = string>(key: string, defaultValue: T) {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get: () => (route.query[key] as T) || defaultValue,
    set: (newValue: T) => {
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
