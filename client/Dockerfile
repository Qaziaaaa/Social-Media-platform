FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.ts postcss.config.js ./
COPY index.html ./
COPY src/ ./src/

EXPOSE 5173

CMD ["npm", "run", "dev"]
