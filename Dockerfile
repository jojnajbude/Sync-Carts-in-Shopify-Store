FROM --platform=linux/amd64 node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY web .
RUN npm ci
RUN cd frontend && npm ci && npm run build
CMD ["npm", "run", "serve"]
