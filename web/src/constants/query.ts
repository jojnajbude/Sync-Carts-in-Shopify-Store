export const getAllCarts = `select items.*, customers.name 
from items
left join carts
on items.cart_id = carts.id
left join customers
on carts.customer_id = customers.id
where carts.shop_id = 2`;
