# aptos-wallet-adapter

React `WalletProvider` supporting loads of aptos wallets.

Supports:

- [Aptos official wallet](https://github.com/aptos-labs/aptos-core/releases/tag/wallet-v0.1.1)
- [Martian wallet](https://martianwallet.xyz/)
- [Fewcha wallet](https://fewcha.app/)
- [Hippo wallet](https://github.com/hippospace/hippo-wallet)
- [Hippo web wallet](https://hippo-wallet-test.web.app/)
- [Pontem Wallet](https://pontem.network/pontem-wallet)
- [Spika wallet](https://spika.app)
- [Rise Wallet](https://risewallet.io/)
- [Fletch wallet](http://fletchwallet.io/)
- [TokenPocket Wallet](https://tokenpocket.pro)
- [ONTO Wallet](https://onto.app)
- [Blocto wallet](https://portto.com/download)
- [Nightly Wallet](https://nightly.app/download)
- [FoxWallet](https://foxwallet.com)
- [SpacecyWallet](https://spacecywallet.com)
- [OKXWallet](https://www.okx.com/web3)

# Installation

with `yarn`

```
yarn add @aptstats/aptos-wallet-adapter
```

with `npm`

```
npm install @aptstats/aptos-wallet-adapter
```

# Examples

## **Frontend Integration**

### **Wallet integration**

# Use React Provider

```typescript
import React from 'react';
import {
  WalletProvider,
  HippoWalletAdapter,
  AptosWalletAdapter,
  HippoExtensionWalletAdapter,
  MartianWalletAdapter,
  FewchaWalletAdapter,
  PontemWalletAdapter,
  SpikaWalletAdapter,
  RiseWalletAdapter,
  FletchWalletAdapter,
  TokenPocketWalletAdapter,
  ONTOWalletAdapter,
  SafePalWalletAdapter,
  FoxWalletAdapter,
  SpacecyWalletAdapter
} from '@aptstats/aptos-wallet-adapter';

const wallets = [
  new SpacecyWalletAdapter(),
  new HippoWalletAdapter(),
  new MartianWalletAdapter(),
  new AptosWalletAdapter(),
  new FewchaWalletAdapter(),
  new HippoExtensionWalletAdapter(),
  new PontemWalletAdapter(),
  new SpikaWalletAdapter(),
  new RiseWalletAdapter(),
  new FletchWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new ONTOWalletAdapter(),
  new SafePalWalletAdapter(),
  new FoxWalletAdapter()
];

const App: React.FC = () => {
  return (
    <WalletProvider
      wallets={wallets}
      autoConnect={true | false} /** allow auto wallet connection or not **/
      onError={(error: Error) => {
        console.log('Handle Error Message', error);
      }}
    >
      {/* your website */}
    </WalletProvider>
  );
};

export default App;
```

# Web3 Hook

```typescript
import { useWallet } from '@aptstats/aptos-wallet-adapter';

const { connected, account, network, ...rest } = useWallet();
```

# Connect & Disconnect

```typescript
import { AptosWalletName, useWallet } from "@aptstats/aptos-wallet-adapter"

...

const { connect, disconnect, connected } = useWallet();

/* No more manual connection required if you disable auto-connect mode while the previous select + connect will still work */

if (!connected) {
  return (
    <button
      onClick={() => {
        connect(walletName); // E.g. connecting to the Aptos official wallet
      }}
    >
      Connect
    </button>
  );
} else {
  return (
    <button
      onClick={() => {
        disconnect();
      }}
    >
      Disconnect
    </button>
  );
}
```
