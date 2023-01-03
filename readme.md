# maxhurl.co.uk

My [homepage](https://www.maxhurl.co.uk/). Built with [Svelte Kit](https://kit.svelte.dev/).

## Running locally

1. Install the dependencies (requires [nvm](https://github.com/nvm-sh/nvm)):

   ```bash
   nvm use
   npm install
   ```

2. Start the dev server

   ```bash
   npm run dev
   ```

## Running in prod mode with docker

```bash
docker build -t max-hurl-site .
docker run -t --init --rm -p 8080:80 max-hurl-site
```
