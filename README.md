# Shopify App Template - NestJS

This is a template for building a [Shopify app](https://shopify.dev/apps/getting-started) using [NestJS](https://nestjs.com/).

- This repository converted from
  [Shopify App Template Node](https://github.com/Shopify/shopify-app-template-node), so please check it if you would like to know more about Shopify App.
- There are no changes about getting started and deployment from the original repository, so please follow it.

**Please feel free to contribute it.**

# Deploy

```shell
docker build -t better-carts-app --no-cache --build-arg SHOPIFY_API_KEY=<REPLACE_IT> .
docker tag better-carts-app registry.digitalocean.com/better-carts/app
docker push registry.digitalocean.com/better-carts/app
```