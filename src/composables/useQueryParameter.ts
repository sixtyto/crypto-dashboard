import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useQueryParameter<T extends string = string>(
  key: string,
  defaultValue: T,
  validator?: (value: string) => boolean,
) {
  const route = useRoute()
  const router = useRouter()

  return computed({
    get: () => {
      const val = route.query[key] as T
      if (val && validator && !validator(val)) {
        return defaultValue
      }
      return val || defaultValue
    },
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
