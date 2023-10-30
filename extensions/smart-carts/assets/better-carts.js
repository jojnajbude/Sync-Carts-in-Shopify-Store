const APP_URL = 'https://better-carts-app-jif2w.ondigitalocean.app';
// const APP_URL = 'https://6f9b-109-68-43-50.ngrok-free.app ';
// const APP_URL = 'https://andrii.ngrok.app';

const customer = window.better_carts.id;
const shop = window.better_carts.shop;

const Sync = window.Sync = {};

class SynchronizeCart {
  constructor() {
    this.customer = customer;

    this.init();
  }

  async init() {
    if (!customer) {
      this.error = {
        message: 'User not logged in.'
      }
      return;
    }

    let [
      lastUpdatedCart,
      currentCart
    ] = await Promise.all([
      fetch(APP_URL + '/storefront/cart/last-updated?customer=' + customer)
        .then(res => res.json()),
      fetch('/cart.js').then(res => res.json())
    ]);

    this.cart = currentCart;

    const items = this.items = await fetch(APP_URL + '/storefront/cart/last-updated/items?customer=' + customer)
      .then(res => res.json());

    if (lastUpdatedCart && !lastUpdatedCart.type === 'error' && !currentCart.items.length && Array.isArray(items)) {
      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: items.reduce((obj, item) => {
            obj[item.variant_id] = Number(item.qty);

            return obj;
          }, {})
        })
      }).then(res => res.json());

      currentCart = await fetch('/cart.js').then(res => res.json());
    } else if (items && Array.isArray(items) && items.length) {
      const notSynchronized = items.some(item => {
        const previousItem = this.cart.items.find(prevItem => Number(prevItem.id) === Number(item.variant_id));

        if (!previousItem) {
          return true;
        }

        return previousItem.quantity !== Number(item.qty);
      }) || items.length !== this.cart.items.length;

      if (notSynchronized) {
        const itemsIds = items.map(item => Number(item.variant_id));

        const toRemove = this.cart.items
          .filter(item => !itemsIds.includes(item.id))
          .reduce((obj, item) => {
            obj[item.id] = 0;

            return obj;
          }, {});

        const response = await fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: items.reduce((obj, item) => {
              obj[item.variant_id] = Number(item.qty);

              return obj;
            }, toRemove),
            sections: this.getSectionsToRender().map(section => section.section),
            sections_url: window.location.pathname
          })
        }).then(res => res.json());

        this.renderSections(response.sections);
      }
    }

    this.createSocket();
  }

  getSectionsToRender() {
    const cartItems = document.querySelector('cart-items');

    if (cartItems && cartItems.getSectionsToRender) {
      return cartItems.getSectionsToRender();
    }

    return [];
  }

  createSocket() {
    const socket = this.socket = io(`${APP_URL}`, {
      path: '/storefront/synchronize',
    });

    socket.on('connect', () => {
      console.log('socket connected');
      const os = getOS();

      if (!Cookies.get('session')) {
        socket.emit('session', customer, os);
      } else if (this.cart && Cookies.get('session') !== this.cart.token) {
        socket.emit('session', customer, os);
        Cookies.set('session', this.cart.token, { expires: 1 });
      } else {
        socket.emit('session', customer, null);
      }

      if (this.cart) {
        Cookies.set('session', this.cart.token, { expires: 1 });
      }
    });

    socket.on('synchronize', this.onSynchronize.bind(this));

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });
  }

  async onSynchronize(data) {
    if (data.create) {
      this.synchronize(this.cart);
      return;
    }

    if (Array.isArray(data)) {
      const itemsIds = data.map(item => Number(item.variant_id));
      const toChange = data.map(item => {
        const cartItem = this.cart.items.find(cartItem => cartItem.id === Number(item.variant_id));

        if (!cartItem) {
          return {
            id: Number(item.variant_id),
            quantity: Number(item.qty)
          };
        }

        if (cartItem.quantity !== Number(item.qty)) {
          return {
            id: cartItem.id,
            quantity: Number(item.qty)
          }
        }

        return;
      }).filter(item => item);
      
      const toRemove = this.cart.items
        .filter(item => !itemsIds.includes(item.id))
        .reduce((obj, item) => {
          obj[item.id] = 0;

          return obj;
        }, {});

        const updatedData = toChange.reduce((obj, item) => {
          obj[item.id] = item.quantity;

          return obj;
        }, toRemove)

      if (Object.keys(updatedData).length) {
        const response = await fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            updates: updatedData,
            sections: this.getSectionsToRender().map(section => section.section),
            sections_url: window.location.pathname
          })
        }).then(res => res.json());

        this.renderSections(response.sections);
      }

      Sync.smartCart.updateData({ items: data });
    }

    if (this.resolve) {
      this.resolve();
    }
  }

  renderSections(sections) {
    if (!sections) {
      return;
    }

    this.getSectionsToRender().forEach(section => {
      const elementToReplace = document.getElementById(section.id).querySelector(section.selector)
        || document.getElementById(section.id);

      if (!elementToReplace) {
        return;
      }

      const parser = new DOMParser();

      const innerHTML =  parser.parseFromString(
          sections[section.section],
          'text/html',
        ).querySelector(section.selector).innerHTML;

      if (innerHTML !== elementToReplace.innerHTML) {
        elementToReplace.innerHTML = innerHTML;
      }
    });
  }

  synchronize(data) {
    if (!this.socket) {
      return Promise.resolve();
    }

    this.socket.emit('synchronize', {
      customer: this.customer,
      data: data || {},
      shop
    });

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
    });
  }
}

Sync.SynchronizeCart = new SynchronizeCart()

class SyncObserver {
  constructor() {
    if (window.better_carts.product) {
      this.product = window.better_carts.product;
    }

    this.observe();
  }

  formObserve() {
    const forms = document.querySelectorAll('form[action^="/cart"]');

    forms.forEach((form) => {
      const observer = new MutationObserver((mutationsList, observer) => {
        this.getCart()
          .then(() => {
            if (JSON.stringify(this.previousItems) !== JSON.stringify(this.items)) {
              this.synchronize({ cart: this.cart })
            }
          });
      })
      observer.observe(form, {
        subtree: true,
        childList: true,
      });

      let submitBtn = form.querySelector('[type="submit"]');

      if (!submitBtn) {
        submitBtn = document.querySelector(`[form="${form.id}"][type="submit"]`);
      }

      if (!submitBtn) {
        return;
      }

      const cloneSubmitBtn = submitBtn.cloneNode(true);
      cloneSubmitBtn.type = 'button';

      submitBtn.style.display = 'none';

      submitBtn.before(cloneSubmitBtn);

      cloneSubmitBtn.onclick = this.cloneClickHandler.bind(this, form, submitBtn);
    });
  }

  linkObserve() {
    const links = document.querySelectorAll('a[href^="/cart/"]');

    links.forEach(link => {
      const url = new URL(link.href);

      const id = url.searchParams.get('id')?.split(':').shift();
      const qty = url.searchParams.get('quantity');

      link.addEventListener('click', async (event) => {
        event.preventDefault();

        await Sync.SynchronizeCart.synchronize({
          form: {
            id,
            qty
          }
        })
      });
    });
  }

  async cloneClickHandler(form, submitter, event) {
    if (this.product) {
      const product = await fetch(`/products/${this.product.handle}.js`)
        .then(res => res.json());

        this.synchronize({ form: form, details: product });
    } else {
      this.synchronize({ form });
    }

    if (submitter && submitter instanceof HTMLElement) {
      submitter.click();
    }
  }

  async synchronize({ form, cart, details = {} }) {
    if (!form && !cart) {
      return;
    }

    if (form) {
      const formData = new FormData(form);

      const formDataJSON = { ...details };

      formData.forEach((value, key) => {
        formDataJSON[key] = value;
      });

      await Sync.SynchronizeCart.synchronize(formDataJSON);
    } else if (cart) {
      await Sync.SynchronizeCart.synchronize(cart);
    }

    this.setCartInterval();
    return;
  }

  async getCart() {
    this.cart = await fetch('/cart.js')
      .then(res => res.json());

    this.previousItems = this.items
      ? [ ...this.items ]
      : [];

    this.items = this.cart.items.map(item => {
      return {
        id: item.id,
        quantity: item.quantity
      }
    });

    return;
  }

  setCartInterval() {
    clearInterval(this.cartInterval);
    this.cartInterval = setInterval(async () => {
      await this.getCart();

      const notSynchronized = this.items.some(item => {
        const previousItem = this.previousItems.find(prevItem => prevItem.id === item.id);

        if (!previousItem) {
          return true;
        }

        return previousItem.quantity !== item.quantity;
      });

      if (notSynchronized) {
        await this.synchronize({ cart: this.cart});
      }
    }, 15000);
  }

  initCartRefresh() {
    this.getCart()
      .then(() => {
        this.setCartInterval();
      });
  }

  async observe() {
    this.formObserve();
    this.linkObserve();

    this.initCartRefresh();
  }
}

Sync.observer = new SyncObserver();

class SmartCart extends HTMLElement {
  constructor() {
    super();

    this.colors = [
      {
        name: 'black',
        hex: '#000000'
      },
      {
        name: 'red',
        hex: '#F44336'
      },
      {
        name: 'pink',
        hex: '#E91E63'
      },
      {
        name: 'purple',
        hex: '#9C27B0'
      }, {
        name: 'deep-purple',
        hex: '#673AB7'
      }, {
        name: 'indigo',
        hex: '#3F51B5'
      }, {
        name: 'blue',
        hex: '#2196F3'
      }, {
        name: 'light-blue',
        hex: '#03A9F4'
      }, {
        name: 'cyan',
        hex: '#00BCD4'
      }, {
        name: 'teal',
        hex: '#009688'
      }, {
        name: 'green',
        hex: '#4CAF50'
      }, {
        name: 'light-green',
        hex: '#8BC34A'
      }, {
        name: 'orange',
        hex: '#FF9800'
      }, {
        name: 'deep-orange',
        hex: '#FF5722'
      }, {
        name: 'brown',
        hex: '#795548'
      }, {
        name: 'grey',
        hex: '#9E9E9E'
      }, {
        name: 'blue-grey',
        hex: '#607D8B'
      }
    ]

    this.APP_URL = APP_URL;
    this.customer = window.better_carts.id;
    this.shop = window.better_carts.shop;
    this.shopCurrency = window.better_carts.shopCurrency;

    this.initialized = this.init();
  }

  async init() {
    if (!localStorage.getItem('smart-cart__primary-color')) {
      localStorage.setItem('smart-cart__primary-color', this.colors[0].hex);
    }

    document.documentElement.style.setProperty('--primary-color', localStorage.getItem('smart-cart__primary-color'));

    this.container = this.initContainer();
    const header = this.initHeader(this.colors);

    if (this.customer) {
      const cartData = await fetch(`${this.APP_URL}/storefront/cart/get?customer=${this.customer}&shop=${this.shop}`);

      if (!cartData.ok) {

      }

      const [cart] = await cartData.json();

      this.container.append(header, this.createCartScreen(cart.items), this.initFooter(cart));
    } else {
      this.container.append(header, this.createLoginScreen(), this.initFooter());
    }
    const opener = this.initOpener();

    this.append(this.container, opener);
  }

  initContainer() {
    const container = document.createElement('div');
    container.classList.add('smart-cart__container');

    return container;
  }

  initHeader(colors) {
    const header = document.createElement('div');
    header.classList.add('smart-cart__header');

    const settings = document.createElement('button');
    settings.classList.add('smart-cart__settings');
    settings.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="white"><circle cx="10" cy="15" r="2"/><circle cx="10" cy="10" r="2"/><circle cx="10" cy="5" r="2"/></g></svg>'
    settings.addEventListener('click', () => {
      const colorList = header.querySelector('.smart-cart__color-list');
      colorList.classList.toggle('smart-cart__color-list--is-active');
    });

    const colorList = document.createElement('ul');
    colorList.classList.add('smart-cart__color-list');

    colors.forEach(color => {
      const colorItem = document.createElement('li');
      colorItem.classList.add('smart-cart__color-item');
      colorItem.style.border = `5px solid ${
        color.hex
      }`;
      colorItem.style.backgroundColor = color.hex;
      colorItem.addEventListener('click', () => {
        localStorage.setItem('smart-cart__primary-color', color.hex);
        document.documentElement.style.setProperty('--primary-color', color.hex);
      });

      colorList.append(colorItem);
    });

    const title = document.createElement('h2');
    title.classList.add('smart-cart__title');
    title.textContent = 'Your Cart';

    header.append(settings, colorList, title);

    return header;
  }

  initFooter(cart = null) {
    const footer = document.createElement('div');
    footer.classList.add('smart-cart__footer');

    if (better_carts.id) {
      const totalWrapper = document.createElement('div');
      totalWrapper.classList.add('smart-cart__total-wrapper');

      const total = document.createElement('span');
      total.classList.add('smart-cart__total');
      total.textContent = 'Total: ';

      const amount = document.createElement('span');
      amount.classList.add('smart-cart__amount');
      amount.textContent = `${
        this.formatter(cart.total / 100, this.shopCurrency)
      }`;

      totalWrapper.append(total, amount);

      footer.append(totalWrapper);
    } else {
      footer.textContent = ' ';
    }

    return footer;
  }

  createLineItem(item) {
    const lineItem = document.createElement('div');
    lineItem.classList.add('smart-cart__line-item');

    const image = (() => {
      if (item.image_link) {
        const image = document.createElement('img');
        image.classList.add('smart-cart__image');
        image.src = item.image_link;
  
        lineItem.append(image);

        return image;
      } else {
        const image = document.createElement('div');
        image.classList.add('smart-cart__image');
        image.innerHTML = window.better_carts.productSVG;
  
        lineItem.append(image);

        return image;
      }
    })();

    const line_item_info = document.createElement('div');
    line_item_info.classList.add('smart-cart__line-item-info');

    const title = document.createElement('h3');
    title.classList.add('smart-cart__line-item-title');
    title.textContent = item.title || 'Default title';

    const price = document.createElement('span');
    price.classList.add('smart-cart__price');
    price.textContent = this.formatter(item.price / 100, this.shopCurrency) || this.formatter('0.00', this.shopCurrency);

    const variant = document.createElement('span');
    variant.classList.add('smart-cart__variant');
    variant.textContent = item.variant_title || 'Default variant';

    const reservation_timer = this.initializeTimer(item);

    line_item_info.append(title, price, variant, reservation_timer);

    const quantity_container = document.createElement('div');
    quantity_container.classList.add('smart-cart__quantity-container');

    const quantity_minus = document.createElement('button');
    quantity_minus.classList.add('smart-cart__quantity-minus');
    quantity_minus.textContent = '-';

    quantity_minus.addEventListener('click', () => {
      const quantity = quantity_container.querySelector('.smart-cart__quantity');
      if (quantity.value > 1) {
        quantity.value--;

        const updatedItems = {
          updates: {
            [item.variant_id]: quantity.value
          }
        };

        fetch(window.Shopify.routes.root + 'cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedItems)
        })
        .then(res => res.json())
        .then(res => Sync.SynchronizeCart.synchronize(res));
      }
    });

    const quantity = document.createElement('input');
    quantity.classList.add('smart-cart__quantity');
    quantity.type = 'number';
    quantity.name = item.variant_id;
    quantity.value = Number(item.qty);

    const quantity_plus = document.createElement('button');
    quantity_plus.classList.add('smart-cart__quantity-plus');
    quantity_plus.textContent = '+';
    quantity_plus.addEventListener('click', () => {
      const quantity = quantity_container.querySelector('.smart-cart__quantity');
      quantity.value++;

      const updatedItems = {
        updates: {
          [item.variant_id]: quantity.value
        }
      };

      fetch(window.Shopify.routes.root + 'cart/update.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      }).then(res => res.json())
        .then(res => Sync.SynchronizeCart.synchronize(res));;
    });

    quantity_container.append(quantity_minus, quantity, quantity_plus);

    const line_item_info_wrapper = document.createElement('div');
    line_item_info_wrapper.classList.add('smart-cart__line-item-info-wrapper');
    line_item_info_wrapper.append(line_item_info, quantity_container);

    const remove = document.createElement('button');
    remove.classList.add('smart-cart__remove');
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => {
      const updatedItems = {
        'id': item.variant_id,
        'quantity': 0
      };

      fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems)
      }).then(res => res.json())
        .then(res => {
          Sync.SynchronizeCart.synchronize(res);

          lineItem.remove();
        });
    });

    lineItem.append(line_item_info_wrapper, remove);

    return lineItem;
  }

  initializeTimer(cartItemData) {
    const timerContainer = document.createElement('span');
    timerContainer.classList.add('smart-cart__reservation-timer');

    if (cartItemData.status) {
      if (cartItemData.status === 'unreserved') {
        timerContainer.textContent = 'Not reserved';
        timerContainer.style.color = 'grey';
      } else if (cartItemData.status === 'expired') {
        timerContainer.textContent = 'Reserve time expired!';
        timerContainer.style.color = 'red';
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
            timerContainer.textContent = 'Reserve time expired!';
            timerContainer.style.color = 'red';

            return;
          }

          let days = Math.floor(distance / _day);
          let hours = Math.floor((distance % _day) / _hour);
          let minutes = Math.floor((distance % _hour) / _minute);
          let seconds = Math.floor((distance % _minute) / _second);

          if (days || hours >= 2) {
            timerContainer.style.color = 'green';
          } else if (hours < 2) {
            timerContainer.style.color = 'orange';
          }

          const addLeadingZero = (value, isLast = false) => {
            if (value === 0) return '';

            return (value > 9 ? value : '0' + value) + (isLast ? '' : ':');
          }

          timerContainer.textContent = `Reserve time: ${addLeadingZero(days) + addLeadingZero(hours) + addLeadingZero(minutes) + addLeadingZero(seconds, true)}`;
        }

        timer = setInterval(() => showRemaining(endDate), 1000);
      }
    }

    return timerContainer;
  }

  createLoginScreen() {
    const body = document.createElement('div');
    body.classList.add('smart-cart__body');

    const subtitle = document.createElement('h3');
    subtitle.classList.add('smart-cart__subtitle');
    subtitle.textContent = 'Login or create an account to view your cart';

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('smart-cart__button-container');

    const signup = document.createElement('a');
    signup.classList.add('smart-cart__button');
    signup.classList.add('smart-cart__signup');
    signup.textContent = 'Sign up';
    signup.href = '/account/register';

    const signin = document.createElement('a');
    signin.classList.add('smart-cart__button');
    signin.classList.add('smart-cart__signin');
    signin.textContent = 'Sign in';
    signin.href = '/account/login';

    buttonContainer.append(signup, signin);

    const tab = document.createElement('div');
    tab.classList.add('smart-cart__tab');

    const collapsibleBtn = document.createElement('button');
    collapsibleBtn.classList.add('smart-cart__collapsible-btn');
    collapsibleBtn.textContent = 'What is this?';

    const collapsibleContent = document.createElement('div');
    collapsibleContent.classList.add('smart-cart__collapsible-content');

    const collapsibleText = document.createElement('p');
    collapsibleText.classList.add('smart-cart__collapsible-text');
    collapsibleText.innerHTML = '<span>Enhance your shopping journey with us by logging in! Enjoy these personalized perks when you log into your account:<br><br><b>&bull; Order Tracking:</b> Keep tabs on your orders with a simple click - from processing to delivery! <br><b>&bull; Faster Checkout:</b> Say goodbye to repetitive information entry. Save your details once and breeze through checkouts on future purchases. <br><b>&bull; Reserved Shopping Cart:</b> Enjoy the luxury of time! All items added to your cart are reserved for a limited period, giving you the freedom to shop at your own pace, without the fear of losing the item. <br><b>&bull; Shop From Social Media:</b> We value your engagement! When you comment on our social media posts, we can conveniently add requested items to your shopping cart.<br><br>Experience a smoother, more interactive shopping experience by logging in today!</span>';

    collapsibleContent.append(collapsibleText);

    collapsibleBtn.addEventListener('click', () => {
      collapsibleBtn.classList.toggle('smart-cart__collapsible-btn--is-active');
      if (collapsibleContent.style.maxHeight) {
        collapsibleContent.style.maxHeight = null;
      } else {
        collapsibleContent.style.maxHeight = collapsibleContent.scrollHeight + 'px';
      }
    });

    tab.append(collapsibleBtn, collapsibleContent);

    body.append(subtitle, buttonContainer, tab);

    return body;
  }

  createCartScreen(items) {
    const body = document.createElement('div');
    body.classList.add('smart-cart__body');

    const cartform = document.createElement('form');
    cartform.action = '/cart';
    cartform.method = 'POST';
    cartform.id='cartform';

    const checkout = document.createElement('button');
    checkout.classList.add('smart-cart__checkout', 'smart-cart__button');
    checkout.type = 'submit';
    checkout.id = 'checkoutform';
    checkout.name = 'checkout';
    checkout.textContent = 'Checkout now';

    cartform.append(checkout);
    body.append(cartform);

    const lineItems = document.createElement('div');
    lineItems.classList.add('smart-cart__line-items');

    items.forEach(item => {
      const lineItem = this.createLineItem(item);
      lineItems.append(lineItem);
    });

    body.append(lineItems);

    return body;
  }

  initOpener() {
    const button = document.createElement('button');
    button.classList.add('smart-cart__opener');

    const iconBadge = this.initIconBadge();
    button.append(iconBadge);

    button.addEventListener('click', () => {
      this.querySelector('.smart-cart__container').classList.toggle('is-open');
      button.classList.toggle('is-active');

      const iconBadge = button.querySelector('.smart-cart__icon-badge');

      if (iconBadge.classList.contains('has-updates')) {
        iconBadge.classList.remove('has-updates');
        iconBadge.textContent = '';
      }
    });

    return button;
  }

  async updateData({ items, cart }) {
    if (this.initialized) {
      await this.initialized;

      this.initialized = null;
    }

    if (this.customer) {
      if (items) {
        const totalCartQuantity = items.reduce((acc, item) => {
          return acc + Number(item.qty);
        }, 0);

        const lineItems = this.querySelectorAll('.smart-cart__line-item');
        const lineItemsQuantity = Array.from(lineItems).reduce((acc, item) => {
          const quantity = item.querySelector('.smart-cart__quantity').value;
          return acc + Number(quantity);
        }, 0);

        if (totalCartQuantity !== lineItemsQuantity) {
          const cartScreen = this.querySelector('.smart-cart__body');
          const newCartScreen = this.createCartScreen(items);
          cartScreen.replaceWith(newCartScreen);

          const cartButton = this.querySelector('.smart-cart__opener');
          const iconBadge = cartButton.querySelector('.smart-cart__icon-badge');

          // if (updates && !cartButton.classList.contains('is-active')) {
          //   iconBadge.classList.add('has-updates');
          //   iconBadge.textContent = updates;
          // } else {
          //   iconBadge.classList.remove('has-updates');
          //   iconBadge.textContent = '';
          // }
        }
      }
    }
  }

  formatter(price, currency) {
    const formatter = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
    });

    return formatter.format(Number(price));
  }

  initIconBadge() {
    const iconBadge = document.createElement('div');
    iconBadge.classList.add('smart-cart__icon-badge');

    return iconBadge;
  }
}

customElements.define('smart-cart', SmartCart);
Sync.smartCart = document.querySelector('smart-cart');

(function initializeBetterCarts() {
  if (window.better_carts.hasOwnProperty('id')) {
      const cookie = getCartCookie();

      updateData(window.better_carts.id, cookie, window.better_carts.shop)
  }
})();

function getOS() {
  let userAgent = navigator.userAgent;
  let os = "";

  if (userAgent.search('Windows') !== -1){
    os = "Windows";
  } else if (userAgent.search('iPhone') !== -1 && userAgent.search('Mac') !== -1) {
    os = 'iOS';
  } else if (userAgent.search('Mac') !== -1){
    os = "MacOS";
  } else if (userAgent.search('Android') !== -1) {
    os = 'Android';
  } else if (userAgent.search('Linux') !== -1){
    os = "Linux";
  } else {
    os = 'Other';
  }
  
  return os;
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

// async function addToCart() {
//   const variantTag = document.querySelector('[name="id"]');
//   if (variantTag.tagName === 'SELECT' || variantTag.tagName === 'select') {
//     const selectedOption = variantTag.querySelector('option[selected="selected"]').value;
//     const qtyInput = document.querySelector('[name="quantity"]');
//     let qty = 1;

//     if (qtyInput) {
//       qty = document.querySelector('[name="quantity"]').value;
//     }

//     const addCart = await fetch(`${APP_URL}/storefront/cart/add?shop=${window.location.hostname}&variant=${selectedOption}&qty=${qty}`)
//     const resText = await addCart.text();

//     if (resText === 'All items reserved') {
//       this.setAttribute('disabled', true)
//       const reservedText = document.createElement('span')
//       reservedText.textContent = 'All items already reserved!'
//       const parent = this.parentNode
//       parent.insertBefore(reservedText, this.nextSibling)
//     } else {
//       const button = document.querySelector('form[action="/cart/add"] button[type="submit"]');
//       button.click()

//       setTimeout(() => {
//         const cookie = getCartCookie();
//         const os = getOS();

//         const customer = window.better_carts.hasOwnProperty('id') ? window.better_carts.id : null;

//         if (customer) {
//           updateData(customer, cookie, window.better_carts.shop, os);

//           setTimeout(() => {
//             console.log('timeout worked')
//             const smartCart = document.querySelector('.smart-cart');
//             smartCart.updateData();
//           }, 2000)
//         }
//       }, 1000)
//     }
//   } else {
//     const variantId = document.querySelector('input[name="id"]').value;
//     const qtyInput = document.querySelector('input[name="quantity"]');
//     let qty = 1;

//     if (qtyInput) {
//       qty = document.querySelector('input[name="quantity"]').value;
//     }

//     const addCart = await fetch(`${APP_URL}/storefront/cart/add?shop=${window.location.hostname}&variant=${variantId}&qty=${qty}`)
//     const resText = await addCart.text();

//     console.log(resText);

//     if (resText === 'All items reserved') {
//       this.setAttribute('disabled', true)
//       const reservedText = document.createElement('span')
//       reservedText.textContent = 'All items already reserved!'
//       const parent = this.parentNode
//       parent.insertBefore(reservedText, this.nextSibling)
//     } else {
//       const button = document.querySelector('form[action="/cart/add"] button[type="submit"]');
//       button.click()

//       setTimeout(() => {
//         const cookie = getCartCookie();
//         const os = getOS();

//         const customer = window.better_carts.hasOwnProperty('id') ? window.better_carts.id : null;

//         if (customer) {
//           updateData(customer, cookie, window.better_carts.shop, os);

//           setTimeout(() => {
//             console.log('timeout worked')
//             const smartCart = document.querySelector('.smart-cart');
//             smartCart.updateData();
//           }, 2000)
//         }
//       }, 1000)
//     }
//   }
// }

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
        }, 10)
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

        timer = setInterval(() => showRemaining(endDate), 10);
      }
    }
  }
}

window.customElements.define('better-carts-timer', BetterCartsTimer);
window.BetterCartsTimer = BetterCartsTimer;

