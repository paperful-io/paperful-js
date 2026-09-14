import { $ } from "bun";

await $`bunx openapi-typescript ${process.env.PAPERFUL_BASE_URL || "https://api.paperful.io/v1"}/openapi -o ./src/generated/schema.ts`;
