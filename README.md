# aptos-wallet-framework

React `WalletProvider` supporting loads of aptos wallets.

This repo is initially forked from [Hippo space](https://github.com/hippospace/aptos-wallet-adapter), the reason for doing this is that original implementation supports a lot of wallets and put all the dependencies into one and I couldn't stand it.

This Repo takes almost the same code from the original one, but split all the extensions into different packages, by doing this, developers can choose to install packages freely without having to worry about extra wasted node modules.

### Extension list

- [AptosSnap-Wallet](https://github.com/AptStats/aptossnap-wallet-extension)
- [Bitkeep-Wallet](https://github.com/AptStats/bitkeep-wallet-extension)
- [Blocto-Wallet](https://github.com/AptStats/blocto-wallet-extension)
- [Coin98-Wallet](https://github.com/AptStats/coin98-wallet-extension)
- [Fewcha-Wallet](https://github.com/AptStats/fewcha-wallet-extension)
- [Fletch-Wallet](https://github.com/AptStats/fletch-wallet-extension)
- [Fox-Wallet](https://github.com/AptStats/fox-wallet-extension)
- [Hippo-Wallet](https://github.com/AptStats/hippo-wallet-extension)
- [HippoWeb-Wallet](https://github.com/AptStats/hippoweb-wallet-extension)
- [HyperPay-Wallet](https://github.com/AptStats/hyperpay-wallet-extension)
- [Martian-Wallet](https://github.com/AptStats/martian-wallet-extension)
- [Nightly-Wallet](https://github.com/AptStats/nightly-wallet-extension)
- [OKX-Wallet](https://github.com/AptStats/okx-wallet-extension)
- [ONTO-Wallet](https://github.com/AptStats/onto-wallet-extension)
- [Petra-Wallet](https://github.com/AptStats/petra-wallet-extension)
- [Pontem-Wallet](https://github.com/AptStats/pontem-wallet-extension)
- [Rise-Wallet](https://github.com/AptStats/rise-wallet-extension)
- [SafePal-Wallet](https://github.com/AptStats/safepal-wallet-extension)
- [Spacecy-Wallet](https://github.com/AptStats/spacecy-wallet-extension)
- [Spika-Wallet](https://github.com/AptStats/spika-wallet-extension)
- [TokenPocket-Wallet](https://github.com/AptStats/tokenpocket-wallet-extension)

### Advertisement.

- You are welcome to submit your projects to [Aptos Network Stats](https://aptstats.xyz/)

# Installation

with `yarn`

```
yarn add @aptstats/aptos-wallet-framework
```

with `npm`

```
npm install @aptstats/aptos-wallet-framework
```

# Examples

### **Wallet integration**

#### Use React Provider

```typescript
import React from 'react';
import { WalletProvider } from '@aptstats/aptos-wallet-framework';
import { PetraWalletAdapter } from '@aptstats/petra-wallet-extension';
import { SpacecyWalletAdapter } from '@aptstats/spacecy-wallet-extension';
import { OKXWalletAdapter } from '@aptstats/okx-wallet-extension';

const wallets = [new PetraWalletAdapter(), new SpacecyWalletAdapter(), new OKXWalletAdapter()];

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

### Web3 Hook

```typescript
import { useWallet } from 'aptstats/aptos-wallet-adapter';

const { connected, account, network, ...rest } = useWallet();
```

#### Connect & Disconnect

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
