import { MaybeHexString, Types } from 'aptos';
import {
  WalletAccountChangeError,
  WalletDisconnectionError,
  WalletGetNetworkError,
  WalletNetworkChangeError,
  WalletNotConnectedError,
  WalletNotReadyError,
  WalletSignAndSubmitMessageError,
  WalletSignMessageError,
  WalletSignTransactionError
} from '../WalletProviders/errors';
import {
  AccountKeys,
  BaseWalletAdapter,
  NetworkInfo,
  scopePollingDetectionStrategy,
  SignMessagePayload,
  SignMessageResponse,
  WalletAdapterNetwork,
  WalletName,
  WalletReadyState
} from './BaseAdapter';
interface ConnectOKXAccount {
  address: MaybeHexString;
  method: string;
  publicKey: MaybeHexString;
  status: number;
}

interface OKXAccount {
  address: MaybeHexString;
  publicKey?: MaybeHexString;
  authKey?: MaybeHexString;
  isConnected: boolean;
}

const AptosNetworks = {
  Mainnet: 1,
  Testnet: 2,
  Devnet: 39
}

export interface IOKXWallet {
  checkIsConnectedAndAccount: () => Promise<{
    isConnected: boolean;
    accountWallet: MaybeHexString;
  }>;
  connect: () => Promise<ConnectOKXAccount>;
  account(): Promise<{ address: MaybeHexString; publicKey: MaybeHexString }>;
  publicKey(): Promise<MaybeHexString>;
  signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{
    status: number;
    data: Types.HexEncodedBytes;
    method: 'signAndSubmitTransaction';
  }>;
  isConnected(): Promise<boolean>;
  signTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{
    status: number;
    data: Uint8Array;
    method: 'signTransaction';
  }>;
  signMessage(message: SignMessagePayload): Promise<{
    status: number;
    data: SignMessageResponse;
    method: 'signMessage';
  }>;
  generateTransaction(sender: MaybeHexString, payload: any, options?: any): Promise<any>;
  disconnect(): Promise<void>;
  network(): Promise<string>;
  onAccountChange(
    listener: (
      newAccount: { address: MaybeHexString; publicKey: MaybeHexString } | undefined
    ) => void
  ): Promise<void>;
  onNetworkChange(listener: (network: string) => void): Promise<void>;
}

interface OKXWindow extends Window {
  okxwallet?: { aptos: IOKXWallet };
}

declare const window: OKXWindow;

const OKXWalletName = 'OKX' as WalletName<'OKX'>;

export interface OKXWalletAdapterConfig {
  provider?: IOKXWallet;
  // network?: WalletAdapterNetwork;
  timeout?: number;
}

export class OKXWalletAdapter extends BaseWalletAdapter {
  name = OKXWalletName;

  url = 'https://chrome.google.com/webstore/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge';

  icon =
    'https://static.okx.com/cdn/assets/imgs/223/3DF7CFD912F83041.png?x-oss-process=image/format,webp';

  protected _provider: IOKXWallet | undefined;

  protected _network: WalletAdapterNetwork | undefined;

  protected _chainId: string | undefined;

  protected _api: string | undefined;

  protected _timeout: number;

  protected _readyState: WalletReadyState =
    typeof window === 'undefined' || typeof document === 'undefined'
      ? WalletReadyState.Unsupported
      : WalletReadyState.NotDetected;

  protected _connecting: boolean;

  protected _wallet: OKXAccount | null;

  constructor({
    // provider,
    // network = WalletAdapterNetwork.Testnet,
    timeout = 10000
  }: OKXWalletAdapterConfig = {}) {
    super();

    this._provider =
      typeof window !== 'undefined' && typeof window.okxwallet !== 'undefined'
        ? window.okxwallet.aptos
        : undefined;
    this._network = undefined;
    this._timeout = timeout;
    this._connecting = false;
    this._wallet = null;

    if (typeof window !== 'undefined' && this._readyState !== WalletReadyState.Unsupported) {
      scopePollingDetectionStrategy(() => {
        if (window.okxwallet) {
          this._readyState = WalletReadyState.Installed;
          this.emit('readyStateChange', this._readyState);
          return true;
        }
        return false;
      });
    }
  }

  get publicAccount(): AccountKeys {
    return {
      publicKey: this._wallet?.publicKey || null,
      address: this._wallet?.address || null,
      authKey: this._wallet?.authKey || null
    };
  }

  get network(): NetworkInfo {
    return {
      name: this._network,
      api: this._api,
      chainId: this._chainId
    };
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get connected(): boolean {
    return !!this._wallet?.isConnected;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  async connect(): Promise<void> {
    try {
      if (this.connected || this.connecting) return;
      if (
        !(
          this._readyState === WalletReadyState.Loadable ||
          this._readyState === WalletReadyState.Installed
        )
      )
        throw new WalletNotReadyError();
      this._connecting = true;
      const provider = this._provider || window.okxwallet.aptos;
      const response: any = await provider?.connect();

      if (!response) {
        throw new WalletNotConnectedError('No connect response');
      }
      const walletAccount = response.address;
      const publicKey = response.publicKey;
      if (walletAccount) {
        this._wallet = {
          address: walletAccount,
          publicKey,
          isConnected: true
        };

        try {
          const networkName = await provider?.network();
          if (networkName) {
            this._network = networkName as WalletAdapterNetwork;
            this._chainId = AptosNetworks[networkName];
            this._api = undefined; //networkInfo.data.rpcProvider;
          }
        } catch (error: any) {
          const errMsg = error.message;
          this.emit('error', new WalletGetNetworkError(errMsg));
          throw error;
        }
      }

      this.emit('connect', this._wallet?.address || '');
    } catch (error: any) {
      this.emit('error', new Error('User has rejected the connection'));
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    const wallet = this._wallet;
    const provider = this._provider || window.okxwallet.aptos;
    if (wallet) {
      this._wallet = null;
      try {
        await provider?.disconnect();
      } catch (error: any) {
        this.emit('error', new WalletDisconnectionError(error?.message, error));
      }
    }
    this.emit('disconnect');
  }

  async signTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<Uint8Array> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.okxwallet.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const tx = await provider.generateTransaction(wallet.address || '', transactionPyld, options);
      if (!tx) throw new Error('Cannot generate transaction');
      const response = await provider?.signTransaction(tx.data);
      if (!response) {
        throw new Error('No response');
      }
      return response.data;
    } catch (error: any) {
      this.emit('error', new WalletSignTransactionError(error));
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transactionPyld: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.okxwallet.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const response = await provider?.signAndSubmitTransaction(transactionPyld, options);

      if (!response || response.status != 200) {
        throw new Error('No response');
      }
      return { hash: response.data };
    } catch (error: any) {
      this.emit('error', new WalletSignAndSubmitMessageError(error.message));
      throw error;
    }
  }

  async signMessage(messagePayload: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.okxwallet.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();

      const response = await provider?.signMessage(messagePayload);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Sign Message failed');
      }
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletSignMessageError(errMsg));
      throw error;
    }
  }

  async onAccountChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.okxwallet.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleAccountChange = async (
        newAccount: { address: MaybeHexString; publicKey: MaybeHexString } | undefined
      ) => {
        // disconnect wallet if newAccount is undefined
        if (!newAccount) {
          if (this.connected) {
            await this.disconnect();
          }
          return;
        }
        if (!newAccount) {
          this._wallet = { publicKey: '', address: '', authKey: '', isConnected: false };
        }
        // const newPublicKey = await provider?.publicKey();
        if (this._wallet != null) {
          this._wallet = {
            ...this._wallet,
            address: newAccount.address,
            publicKey: newAccount.publicKey
          };
        }
        this.emit('accountChange', newAccount?.address as string);
      };
      await provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletAccountChangeError(errMsg));
      throw error;
    }
  }

  // OKX wallet doesn't support switching network yet.
  async onNetworkChange(): Promise<void> {
    try {
      const wallet = this._wallet;
      const provider = this._provider || window.okxwallet.aptos;
      if (!wallet || !provider) throw new WalletNotConnectedError();
      const handleNetworkChange = (networkName: string) => {
        this._network = networkName as WalletAdapterNetwork
        this._api = undefined;
        this._chainId = AptosNetworks[networkName];
        if (this._network) {
          this.emit('networkChange', this._network);
        }
      };
      await provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }

  async checkIsConnectedAndAccount(): Promise<{
    isConnected: boolean;
    accountWallet: MaybeHexString;
  }> {
    try {
      const provider = this._provider || window.okxwallet.aptos;
      if (!provider) throw new WalletNotConnectedError();
      const { address } = await provider?.account();
      const isConnected = await provider?.isConnected();
      return { accountWallet: address, isConnected: isConnected };
    } catch (error: any) {
      const errMsg = error.message;
      this.emit('error', new WalletNetworkChangeError(errMsg));
      throw error;
    }
  }
}
