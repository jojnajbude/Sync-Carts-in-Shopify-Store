const APP_URL = 'https://better-carts.dev-test.pro';

(function initializeBetterCarts() {
  if (window.customer) {
    initializeObserver();
    swapAddToCartBtn();
    const cookie = getCartCookie();
    
    updateData(window.customer.id, window.customer.shop, cookie);
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

async function updateData(id, shop, cart_id) {
  const data = await fetch(`${APP_URL}/storefront/update?user_id=${id}&shop_id=${shop}&cart_id=${cart_id}`);
  // ---------------------------------------
  console.log(data)
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
  const qty = document.querySelector('input[name="quantity"]').value;
  const cart = getCartCookie();

  const addCart = await fetch(`${APP_URL}/storefront/cart/add?customer=${window.customer.id}&shop=${window.customer.shop}&cart=${cart}&variant=${variantId}&qty=${qty}`)
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
    if (!Date.prototype.addHours) {
      Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h * 60 * 60 * 1000));
        return this;
      }
    }

    const variantId = Number(this.dataset.timerId);
    const userId = window.customer.id;
    const shopId = window.customer.shop;
    const cartId = document.cookie.split('; ').find((row) => row.startsWith('cart='))?.split('=')[1];

    const reservationDate = await fetch(`https://better-carts.dev-test.pro/storefront/time?item=${variantId}&cart=${cartId}&user=${userId}&shop=${shopId}`);
    const date = new Date(await reservationDate.json());
    const endDate = new Date(date).addHours(24);

    let _second = 1000;
    let _minute = _second * 60;
    let _hour = _minute * 60;
    let _day = _hour * 24;
    let timer;

    function showRemaining(endDate) {
      let now = new Date();
      let distance = endDate - now;

      const text = document.getElementById(`bc-countdown-${variantId}`);

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

window.customElements.define('better-carts-timer', BetterCartsTimer)
