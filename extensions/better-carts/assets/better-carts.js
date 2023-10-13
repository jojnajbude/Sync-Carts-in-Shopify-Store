// const APP_URL = 'https://better-carts-app-jif2w.ondigitalocean.app';
// const APP_URL_DEV = 'https://smart-carts.dev-test.pro';
const APP_URL = 'https://andrii.ngrok.app';

const socket = io('https://andrii.ngrok.app', {
  path: '/storefront/synchronize',
});

socket.on('connect', () => {
  console.log('socket connected');
});

socket.on('error', (error) => {
  console.log('socket error', error);
})

socket.on('message', (event) => {
  console.log('socket message', event);
});

socket.on('disconnect', () => {
  console.log('socket disconnected');
});

window.socket = socket;

(function initializeBetterCarts() {
  initializeObserver();
  swapAddToCartBtn();

  if (window.better_carts.hasOwnProperty('id')) {
    setInterval(() => {
      const cookie = getCartCookie();  
      const os = getOS()

      updateData(window.better_carts.id, cookie, window.better_carts.shop, os)
    }, 10000)
  }
})()

function getOS() {
  let userAgent = navigator.userAgent;
  let os = "";

  if (userAgent.search('Windows') !== -1){
    os = "Windows";
  } else if (userAgent.search('Mac') !== -1){
    os = "MacOS";
  } else if (userAgent.search('Linux') !== -1){
    os = "Linux";
  } else {
    os = 'Other';
  }
  
  return os;
}

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

async function updateData(id, cart_id, shop_id, os) {
  const checkUpdates = await fetch(`${APP_URL}/storefront/update?cart_id=${cart_id}&customer=${id}&shop_id=${shop_id}&os=${os}`);
  const response = await checkUpdates.json();
  const smartCarts = document.querySelector('.smart-cart');

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

    const cookie = getCartCookie();

    const updateExpireDate = await fetch(`${APP_URL}/storefront/update/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await JSON.stringify([response.data.items, cookie])
    })

    setTimeout(() => smartCarts.updateData(newItems.length), 2000);
  } else if (response.type === 'Update') {
    const smartCarts = document.querySelector('.smart-cart');

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

    const keys = Object.keys(updatedItems.updates);

    const updateItems = await fetch(window.Shopify.routes.root + 'cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItems)
    });

    setTimeout(() => smartCarts.updateData(keys.length), 2000);
  }
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
  const variantTag = document.querySelector('[name="id"]');
  if (variantTag.tagName === 'SELECT' || variantTag.tagName === 'select') {
    const selectedOption = variantTag.querySelector('option[selected="selected"]').value;
    const qtyInput = document.querySelector('[name="quantity"]');
    let qty = 1;

    if (qtyInput) {
      qty = document.querySelector('[name="quantity"]').value;
    }

    const addCart = await fetch(`${APP_URL}/storefront/cart/add?shop=${window.location.hostname}&variant=${selectedOption}&qty=${qty}`)
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

      setTimeout(() => {
        const cookie = getCartCookie();
        const os = getOS();

        const customer = window.better_carts.hasOwnProperty('id') ? window.better_carts.id : null;

        if (customer) {
          updateData(customer, cookie, window.better_carts.shop, os);

          setTimeout(() => {
            console.log('timeout worked')
            const smartCart = document.querySelector('.smart-cart');
            smartCart.updateData();
          }, 2000)
        }
      }, 1000)
    }
  } else {
    const variantId = document.querySelector('input[name="id"]').value;
    const qtyInput = document.querySelector('input[name="quantity"]');
    let qty = 1;

    if (qtyInput) {
      qty = document.querySelector('input[name="quantity"]').value;
    }

    const addCart = await fetch(`${APP_URL}/storefront/cart/add?shop=${window.location.hostname}&variant=${variantId}&qty=${qty}`)
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

      setTimeout(() => {
        const cookie = getCartCookie();
        const os = getOS();

        const customer = window.better_carts.hasOwnProperty('id') ? window.better_carts.id : null;

        if (customer) {
          updateData(customer, cookie, window.better_carts.shop, os);

          setTimeout(() => {
            console.log('timeout worked')
            const smartCart = document.querySelector('.smart-cart');
            smartCart.updateData();
          }, 2000)
        }
      }, 1000)
    }
  }
}

class BetterCartsTimer extends HTMLElement {
  constructor() {
    super();

    this.getData()
      .then(data => {
        this.initializeTimer(data);
      }).catch(error => {
        console.error(error); 
      });
  }

  getData() {
    return new Promise(async (res, rej) => {
      if (window.better_carts.hasOwnProperty('id')) {
        setTimeout(async () => {
          let retryCount = 0;
          const variantId = Number(this.dataset.timerId);
          const userId = window.better_carts.id;
          const shopId = window.better_carts.shop;
          const cartId = document.cookie.split('; ').find((row) => row.startsWith('cart='))?.split('=')[1];
    
          const fromServ = async () => {
            const response = await fetch(`${APP_URL}/storefront/time?item=${variantId}&cart=${cartId}&user=${userId}&shop=${shopId}`);
    
            if (response.ok) {
              const data = await response.json()
              res(data)
            } else {
              retryCount++;
    
              if (retryCount <= 5) {
                setTimeout(async () => await fromServ(), 1000)
                
              } else {
                rej(new Error('Failed to get data after 5 retries.'));
              }
            }
          }
    
          await fromServ();
        }, 1000)
      } else {
        rej(new Error('User not a logged in.'))
      }
    });
  }

  async initializeTimer(cartItemData) {
    const text = this.querySelector('span');
    
    if (cartItemData) {
      if (cartItemData.status === 'unreserved') {
        return;
      } else if (cartItemData.status === 'expired') {
        text.innerHTML = 'Reserve time expired!';

        return;
      } else {
        const endDate = new Date(cartItemData.expire_at);

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

window.customElements.define('better-carts-timer', BetterCartsTimer);

