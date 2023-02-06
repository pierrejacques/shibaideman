import { catchRuntimeError, uniqueId } from "./lang";

export interface Subscription {
  (): void;
}

export interface Subscriber<T> {
  (value: T): void;
}

export interface Listener<T> {
  subscriber: Subscriber<T>;
  next: Listener<T> | null;
  prev: Listener<T> | null;
}

export interface ListenerCollection<T> {
  clear(): void;
  notify(value: T): void;
  subscribe(subscriber: Subscriber<T>): Subscription
}

export function createListenerCollection<T>(): ListenerCollection<T> {
  let first: Listener<T> | null = null;
  let last: Listener<T> | null = null;

  return {
    clear() {
      first = null;
      last = null;
    },

    notify(value: T) {
      let listener = first;
      while (listener) {
        listener.subscriber(value);
        listener = listener.next;
      }
    },

    subscribe(subscriber: Subscriber<T>): Subscription {
      let isSubscribed = true;

      const listener: Listener<T> = {
        subscriber,
        next: null,
        prev: last,
      };
      last = listener;

      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }

      return function unsubscribe() {
        if (!isSubscribed || first === null) return;
        isSubscribed = false;

        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }
        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    },
  };
}

export interface StorePortaMessageBase {
  type: 'store-porta';
  storeName: string;
  sender: string;
}

export type StorePortaMessageAddons<T> = {
  action: 'request';
} | {
  action: 'update';
  version: number;
  value: T;
  stamp: number;
}

export type StorePortaMessage<T> = StorePortaMessageBase & StorePortaMessageAddons<T>;

export interface StorePortaSubscriber<T> {
  (value: T, prev: T): void;
}

export type Mutator<S> = S | ((prev: S) => S);

export class StorePorta<T> {
  private prev: T;
  private value: T;
  private version = 0;
  private stamp = 0;
  private id = uniqueId();
  private storeName: string;
  private listenerCollection = createListenerCollection<void>();

  constructor(storeName: string, initialValue: T) {
    this.storeName = storeName;
    this.value = initialValue;
    this.prev = initialValue;
    chrome.runtime.onMessage.addListener((message: StorePortaMessage<T>) => {
      if (message?.type === 'store-porta' && message.storeName === storeName) {
        switch (message.action) {
          case 'request':
            this.send({
              action: 'update',
              version: this.version,
              value: this.value,
              stamp: this.stamp,
            });
            break;
          case 'update': {
            const { value, version, stamp } = message;
            if (
              this.version < version ||
              (this.version === version && this.stamp < stamp)
            ) {
              if (!Object.is(value, this.value)) {
                this.prev = this.value;
                this.value = value;
                this.listenerCollection.notify();
              }
              this.version = version;
              this.stamp = stamp;
            }
            break;
          }
        }
      }
    });
    this.send({
      action: 'request',
    })
  }

  private send(message: StorePortaMessageAddons<T>) {
    chrome.runtime.sendMessage<StorePortaMessage<T>>({
      type: 'store-porta',
      storeName: this.storeName,
      sender: this.id,
      ...message,
    }, catchRuntimeError);
  }

  subscribe(subscriber: StorePortaSubscriber<T>): Subscription {
    return this.listenerCollection.subscribe(
      () => subscriber(this.value, this.prev)
    );
  }

  push(mutator: Mutator<T>) {
    const nextValue = typeof mutator === 'function' ? (mutator as (prev: T) => T)(this.value) : mutator;
    if (!Object.is(nextValue, this.value)) {
      this.version++;
      this.prev = this.value;
      this.value = nextValue;
      this.stamp = Date.now();
      this.listenerCollection.notify();
      this.send({
        action: 'update',
        version: this.version,
        value: this.value,
        stamp: this.stamp,
      })
    }
  };

  getValue() {
    return this.value;
  }
}

export interface MessagePortaMessage<T> {
  type: 'message-porta';
  eventName: string;
  data: T;
}

export class MessagePorta<T> {
  private eventName: string;
  private listenerCollection = createListenerCollection<T>();

  constructor(eventName: string) {
    this.eventName = eventName;
    chrome.runtime.onMessage.addListener((message: MessagePortaMessage<T>) => {
      if (message?.type === 'message-porta' && message.eventName === eventName) {
        this.listenerCollection.notify(message.data);
      }
    });
  }

  subscribe(subscriber: Subscriber<T>): Subscription {
    return this.listenerCollection.subscribe(
      subscriber
    );
  }

  push(messageData: T) {
    chrome.runtime.sendMessage<MessagePortaMessage<T>>({
      type: 'message-porta',
      eventName: this.eventName,
      data: messageData,
    }, catchRuntimeError);
  };
}
