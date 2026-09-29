# Paperful JavaScript SDK

Give documents superpowers with JavaScript

[Documentation](https://paperful.io/docs) · [API Reference](https://paperful.io/docs/api) · [Paperful](https://paperful.io)

> [!WARNING]
> This SDK is intended for **server-side use only**. It is initialized with a secret API key that grants full access to your Paperful account, so it must never be bundled into or run from public-facing code (browser apps, mobile apps, or any environment exposed to end users). Doing so will leak your API key. If you need to access Paperful from a client, do it through your own backend.

## Installation

```bash
# NPM
npm install @paperful/sdk

# Bun
bun add @paperful/sdk

# Yarn
yarn add @paperful/sdk

# pnpm
pnpm add @paperful/sdk
```

## Usage

Create an API key in the [Paperful Console](https://console.paperful.io), then initialize the client:

```ts
import Paperful from "@paperful/sdk";

const paperful = new Paperful({
  apiKey: "pf_xyz",
});

const paper = await paperful.papers.upload();
```

> [!TIP]
> You can also configure the SDK using the `PAPERFUL_API_KEY` environment variable.

> [!CAUTION]
> Keep your API key secret and only use this SDK in trusted server-side environments (e.g. a backend service, a server-rendered app's server, or a CLI/script). Never ship it to the browser or embed it in a mobile app.

## Support

If you have any questions or need help, reach out to us at [hello@paperful.io](mailto:hello@paperful.io).
