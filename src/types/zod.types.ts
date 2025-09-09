import {z} from 'zod'
export const TParams = z.object({
  id: z.uuid()
});