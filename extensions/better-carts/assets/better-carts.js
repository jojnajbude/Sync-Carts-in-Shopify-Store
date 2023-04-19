const APP_URL = 'https://better-carts.dev-test.pro';

(function initializeBetterCarts() {
  initializeObserver();
  swapAddToCartBtn();

  if (window.customer) {
    const cookie = getCartCookie();  
    updateData(window.customer.id, cookie, window.customer.shop);
  }
})()

function initializeObserver() {
  const target = document.body;

  const config = {
    childList: true
  }

  const callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      swapAddToCartBtn();
    }
  }

  const observer = new MutationObserver(callback);
  observer.observe(target, config);
}

function getCartCookie() {
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('cart='))
    ?.split('=')[1];

  return cookie;
}

async function updateData(id, cart_id, shop_id) {
  const checkUpdates = await fetch(`${APP_URL}/storefront/update?cart_id=${cart_id}&customer=${id}&shop_id=${shop_id}`);
  const response = await checkUpdates.json();

  if (response.type === 'New cart') {
    const newItems = [];

    for (const item of response.data.items) {
      newItems.push({
        'id': Number(item.variant_id),
        'quantity': Number(item.qty)
      })
    }

    const formData = {
      'items': newItems
    }

    const newCartData = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
  } else if (response.type === 'Update') {
    const updatedItems = {
      updates: {}
    };

    if (response.data.hasOwnProperty('addedItems')) {
      for (const item of response.data.addedItems) {
        updatedItems.updates[item.variant_id] = item.qty;
      }
    }

    if (response.data.hasOwnProperty('updatedItems')) {
      for (const item of response.data.updatedItems) {
        updatedItems.updates[item.variant_id] = item.qty;
      }
    }
    
    if (response.data.hasOwnProperty('removedItems')) {
      for (const item of response.data.removedItems) {
        updatedItems.updates[item.variant_id] = 0;
      }
    }

    console.log(updatedItems)

    const updateItems = await fetch(window.Shopify.routes.root + 'cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItems)
    });
  }

  // ---------------------------------------
  // ---------------------------------------
}

function swapAddToCartBtn() {
  const addToCartBtn = document.querySelector('form[action="/cart/add"] button[type="submit"]');

  if (addToCartBtn) {
    let betterCartBtn = document.querySelector('#better-carts-btn');

    if (!betterCartBtn) {
      betterCartBtn = addToCartBtn.cloneNode(true);

      betterCartBtn.setAttribute('type', 'button');
      betterCartBtn.setAttribute('id', 'better-carts-btn')
      betterCartBtn.addEventListener('click', addToCart);
      
      addToCartBtn.parentNode.insertBefore(betterCartBtn, addToCartBtn);
      addToCartBtn.style.display = "none";
    }
  } 
}

async function addToCart() {
  const variantId = document.querySelector('input[name="id"]').value;
  const qtyInput = document.querySelector('input[name="quantity"]');
  let qty= 1;

  if (qtyInput) {
    qty = document.querySelector('input[name="quantity"]').value;
  }

  const addCart = await fetch(`${APP_URL}/storefront/cart/add?shop=${window.customer.shop}&variant=${variantId}&qty=${qty}`)
  const resText = await addCart.text();

  if (resText === 'All items reserved') {
    this.setAttribute('disabled', true)
    const reservedText = document.createElement('span')
    reservedText.textContent = 'All items already reserved!'
    const parent = this.parentNode
    parent.insertBefore(reservedText, this.nextSibling)
  } else {
    const button = document.querySelector('form[action="/cart/add"] button[type="submit"]');
    button.click()
  }
}

class BetterCartsTimer extends HTMLElement {
  constructor() {
    super();

    this.initializeTimer();
  }

  async initializeTimer() {
    const variantId = Number(this.dataset.timerId);
    const userId = window.customer.id;
    const shopId = window.customer.shop;
    const cartId = document.cookie.split('; ').find((row) => row.startsWith('cart='))?.split('=')[1];

    const cartItem = await fetch(`${APP_URL}/storefront/time?item=${variantId}&cart=${cartId}&user=${userId}&shop=${shopId}`);

    const text = document.getElementById(`bc-countdown-${variantId}`);
    
    if (cartItem.ok) {
      const cartItemData = await cartItem.json();

      if (cartItemData.status === 'unreserved') {
        return;
      } else if (cartItemData.status === 'expired') {
        text.innerHTML = 'Reserve time expired!';

        return;
      } else {
        const endDate = new Date(cartItemData.expireAt);

        let _second = 1000;
        let _minute = _second * 60;
        let _hour = _minute * 60;
        let _day = _hour * 24;
        let timer;

        function showRemaining(endDate) {
          let now = new Date();
          let distance = endDate - now;

          if (distance < 0) {
            clearInterval(timer);
            text.innerHTML = 'Reserve time expired!';

            return;
          }

          let days = Math.floor(distance / _day);
          let hours = Math.floor((distance % _day) / _hour);
          let minutes = Math.floor((distance % _hour) / _minute);
          let seconds = Math.floor((distance % _minute) / _second);

          text.innerHTML = 'Reserve time: ';
          text.innerHTML += days > 9 ? days + ':' : '0' + days + ':';
          text.innerHTML += hours > 9 ? hours + ':' : '0' + hours + ':';
          text.innerHTML += minutes > 9 ? minutes + ':' : '0' + minutes + ':';
          text.innerHTML += seconds > 9 ? seconds : '0' + seconds;
        }

        timer = setInterval(() => showRemaining(endDate), 1000);
      }
    }
  }
}

window.customElements.define('better-carts-timer', BetterCartsTimer)
