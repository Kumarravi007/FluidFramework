## API Report File for "@fluidframework/counter"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { IChannelFactory } from '@fluidframework/datastore-definitions';
import { IChannelStorageService } from '@fluidframework/datastore-definitions';
import { IFluidDataStoreRuntime } from '@fluidframework/datastore-definitions';
import { IFluidSerializer } from '@fluidframework/core-interfaces';
import { ISequencedDocumentMessage } from '@fluidframework/protocol-definitions';
import { ISharedObject } from '@fluidframework/shared-object-base';
import { ISharedObjectEvents } from '@fluidframework/shared-object-base';
import { ITree } from '@fluidframework/protocol-definitions';
import { SharedObject } from '@fluidframework/shared-object-base';

// @public
export interface ISharedCounter extends ISharedObject<ISharedCounterEvents> {
    increment(incrementAmount: number): void;
    value: number;
}

// @public (undocumented)
export interface ISharedCounterEvents extends ISharedObjectEvents {
    // @eventProperty
    (event: "incremented", listener: (incrementAmount: number, newValue: number) => void): any;
}

// @public
export class SharedCounter extends SharedObject<ISharedCounterEvents> implements ISharedCounter {
    protected applyStashedOp(): void;
    static create(runtime: IFluidDataStoreRuntime, id?: string): SharedCounter;
    static getFactory(): IChannelFactory;
    increment(incrementAmount: number): void;
    // (undocumented)
    protected loadCore(storage: IChannelStorageService): Promise<void>;
    protected onDisconnect(): void;
    protected processCore(message: ISequencedDocumentMessage, local: boolean, localOpMetadata: unknown): void;
    // (undocumented)
    protected registerCore(): void;
    protected snapshotCore(serializer: IFluidSerializer): ITree;
    get value(): number;
    }


```
