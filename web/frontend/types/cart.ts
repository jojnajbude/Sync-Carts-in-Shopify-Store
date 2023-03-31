export interface Cart {
  id: number
  customer_name: string
  total: number
  reserved_indicator: string
  reservation_time: Date
  qty: number
  items: any[]
}
