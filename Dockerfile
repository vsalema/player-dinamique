FROM buildkite/puppeteer:latest
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node","server-puppeteer.js"]
