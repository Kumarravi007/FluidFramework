/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { ISharedObject, ISharedObjectEvents } from "@fluidframework/shared-object-base";

export interface ISharedCounterEvents extends ISharedObjectEvents {
    /**
     * This event is raised when the counter is incremented or decremented.
     *
     * @param event - The event name.
     * @param listener - An event listener.
     *
     * @eventProperty
     */
    (event: "incremented", listener: (incrementAmount: number, newValue: number) => void);
}

/**
 * Shared counter interface
 */
export interface ISharedCounter extends ISharedObject<ISharedCounterEvents> {
    /**
     * The counter value.
     */
    value: number;

    /**
     * Increments or decrements the value.  Must only increment or decrement by a whole number value.
     *
     * @param incrementAmount - a whole number to increment or decrement by
     */
    increment(incrementAmount: number): void;
}
