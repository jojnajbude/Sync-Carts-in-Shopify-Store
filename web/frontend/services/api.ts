import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BaseQueryFn } from '@reduxjs/toolkit/query/react'
import { useAuthenticatedFetch } from '../hooks'

interface Cart {
  id: number
  customer_id: number
  qty: number
  products: any
  state: string
  total: number
  customer_name: string
  email: string
  reserved_indicator: string
  shop_id: number
  reservation_time: any
}

type CartsResponse = Cart[]

// const authenticatedBaseQuery =
//   ({ baseUrl }: { baseUrl: string } = { baseUrl: '' }): BaseQueryFn =>
//   async ({ url, method, data, params }) => {
//     try {
//       const fetch = useAuthenticatedFetch()
//       const result = await fetch({ url: baseUrl + url, method, data, params})
//       return { data: result.data }
//     } catch (error) {
//       return {
//         error: {
//           status: error.response?.status,
//           data: error.response?.data || error.message,
//         },
//       }
//     }
//   }

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),

  endpoints: (build) => ({
    getShopCarts: build.query<CartsResponse, void>({
      query: () => ({
        url: 'api/carts/all',
        method: 'GET',
      }),
    }),
  }),
})

export const { useGetShopCartsQuery } = api
