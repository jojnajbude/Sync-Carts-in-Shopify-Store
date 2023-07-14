# Shopify App Template - NestJS

This is a template for building a [Shopify app](https://shopify.dev/apps/getting-started) using [NestJS](https://nestjs.com/).

- This repository converted from
  [Shopify App Template Node](https://github.com/Shopify/shopify-app-template-node), so please check it if you would like to know more about Shopify App.
- There are no changes about getting started and deployment from the original repository, so please follow it.

# Deploy

```shell
docker build -t better-carts-app --no-cache --build-arg SHOPIFY_API_KEY=7932e54b0d151d9f38928401d7140759 .
docker tag better-carts-app registry.digitalocean.com/better-carts/app
docker push registry.digitalocean.com/better-carts/app
```

```
start - npm run dev
pass to pgadmin - 1736

when launch local: 
  comment in app.module.ts migrations and ssl (rows 62-63)
  uncomment synchronize (row 61)

BEFORE DEPLOY TO DIGITAL OCEAN:
  comment synchronize
  uncomment migrations and ssl

local app - better-carts-dev in devit partner (shop: better-carts-dev)
prod app - Smart Carts in Simplify Apps (shop: better-carts-prod)
```