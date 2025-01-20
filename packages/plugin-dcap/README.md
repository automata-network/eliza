# @elizaos/plugin-dcap

A basic DCAP attestation plugin for the Eliza AI framework.

## Description

This plugin provides actions for verifying (i.e., attesting) raw-quotes on EVM-compatible chains, including various testnets and mainnets.

## Installation

```bash
pnpm install @elizaos/plugin-dcap
```

## Configuration

### Required Environment Variables

```env
# Required
EVM_PRIVATE_KEY=your-private-key-here
```

## Actions

### 1. DCAP_ON_CHAIN

Performs the on-chain verification for a rawQuote, which might come from SGX or TEE.

## Development

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Build the plugin:

```bash
pnpm run build
```

4. Run tests:

```bash
pnpm test
```

## Usage

Import and register the plugin in your Eliza configuration:

```typescript
import { dcapPlugin } from "@ai16z/eliza-plugin-dcap";

export default {
    plugins: [teePlugin],
    // ... other configuration
};
```

We welcome community feedback and contributions.

## License

This plugin is part of the Eliza project. See the main project repository for license information.
