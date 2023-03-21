import {extend, Button} from '@shopify/admin-ui-extensions';

extend('BetterCarts', (root, api) => {
  const sessionToken = api.sessionToken;

  const sendRequest = async () => {
    const token = await sessionToken.getSessionToken();
    const response = await fetch('https://cc76-109-68-43-50.eu.ngrok.io', {
      headers: {
        'app-extension-key': token || 'unknown token',
      },
    });
    console.log('Response', response.text());
  }

  const button = root.createComponent(Button, {
    title: 'Send request',
    onClick: sendRequest,
  });
  root.append(button)
});

(function initializeBetterCarts() {
  const addToCartBtn = document.querySelector('form[action="/cart/add"] button[type="submit"]');

  const betterCartBtn = addToCartBtn.cloneNode(true);

  betterCartBtn.setAttribute('type', 'button')
  betterCartBtn.addEventListener('click', addToCart);
  
  addToCartBtn.parentNode.insertBefore(betterCartBtn, addToCartBtn);
  addToCartBtn.style.display = "none";
})()

async function addToCart(event) {
  const addCart = await fetch('/api/carts/create');
  console.log(addCart)
}
