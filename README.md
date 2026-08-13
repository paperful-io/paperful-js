# Paperful JavaScript SDK

Give documents superpowers with JavaScript

[Documentation](...) · [API Reference](...) · [Paperful](https://paperful.io)

## Installation

```bash
npm install @paperful/sdk
```

Or with Bun:

```bash
bun add @paperful/sdk
```

## Usage

Create an API key in the [Paperful Console](https://paperful.io/console), then initialize the client:

```ts
import Paperful from "@paperful/sdk";

const paperful = new Paperful({
  apiKey: "pf_xyz",
});

const paper = await paperful.papers.upload();
```

> [!TIP]
> You can also configure the SDK using the `PAPERFUL_API_KEY` environment variable.

## Support

If you have any questions or need help, reach out to us at [hello@paperful.io](mailto:hello@paperful.io).
