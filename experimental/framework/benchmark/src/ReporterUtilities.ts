/*!
 * Copyright (c) Microsoft Corporation and contributors. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert } from 'chai';

/**
 * This file contains generic utilities of use to a mocha reporter, especially for convenient formatting of textual
 * output to the command line.
 */

/**
 * @returns a red version of the input string
 */
export function red(s: string): string {
	return `\u001b[31m${s}\u001b[0m`;
}

/**
 * @returns a green version of the input string
 */
export function green(s: string): string {
	return `\u001b[32m${s}\u001b[0m`;
}

/**
 * @returns a yellow version of the input string
 */
export function yellow(s: string): string {
	return `\u001b[33m${s}\u001b[0m`;
}

/**
 * @returns an italicized version of the input string
 */
export function italicize(s: string): string {
	return `\x1b[3m${s}\x1b[23m`;
}

/**
 * @returns a bolded version of the input string
 */
export function bold(s: string): string {
	return `\x1B[1m${s}\x1B[22m`;
}

/**
 * @param num - Number of characters to pad
 * @param chr - Character to use for padding (space by default)
 * @returns a padding string consisting of `num` copies of `chr`
 */
export function pad(num: number, chr = ' '): string {
	return Array(num + 1).join(chr);
}

/**
 * Nicely format a decimal number to make it human-readable.
 * @param num - Number to format
 * @param numDecimals - Number of digits after the decimal point to retain
 * @public
 */
export function prettyNumber(num: number, numDecimals = 3): string {
	// Split the string to determine parts before and after the decimal
	const split: string[] = num.toFixed(numDecimals).split('.');
	// Show exponential if we have more than 9 digits before the decimal
	if (split[0].length > 9) {
		return num.toExponential(numDecimals);
	}
	// Add commas to the numbers before the decimal
	split[0] = split[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
	return split.join('.');
}

/**
 * Computes the mean of a number of geometric values. All values must be greater than 0.
 * @param values - Set of values whose geometric mean should be computed.
 * @public
 */
export function geometricMean(values: number[]): number {
	// Compute the geometric mean of values, but do it using log and exp to reduce overflow/underflow.
	let sum = 0;
	for (const value of values) {
		assert(value > 0, 'invalid value in geometricMean');
		sum += Math.log(value);
	}
	return Math.exp(sum / values.length);
}
