const APP_URL = 'https://better-carts.dev-test.pro';

(function initializeBetterCarts() {
  if (window.customer) {
    const cookie = getCartCookie()
    getCart(window.customer.id, window.customer.shop)

    swapAddToCartBtn();
  }
})()

function swapAddToCartBtn() {
  const addToCartBtn = document.querySelector('form[action="/cart/add"] button[type="submit"]');

  if (addToCartBtn) {
    const betterCartBtn = addToCartBtn.cloneNode(true);

    betterCartBtn.setAttribute('type', 'button')
    betterCartBtn.addEventListener('click', addToCart);
    
    addToCartBtn.parentNode.insertBefore(betterCartBtn, addToCartBtn);
    addToCartBtn.style.display = "none";
  } 
}

function getCartCookie() {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('cart='))
    ?.split('=')[1];

  console.log(cookie)
}

async function getCart(id, shop) {
  const cart = await fetch(`${APP_URL}/storefront/cart/update?user_id=${id}&shop_id=${shop}`)
  console.log(cart)
}

async function addToCart(event) {
    const addCart = await fetch(`${APP_URL}/storefront/cart/add`)
    const data = await addCart.json()

    console.log(data)
}
