/*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) */
// Abelian group utilities
import { IField, validateField, nLength } from './modular';
import { validateObject } from './utils';
const _0n = BigInt(0);
const _1n = BigInt(1);

export type AffinePoint<T> = {
  x: T;
  y: T;
} & { z?: never; t?: never };

export interface Group<T extends Group<T>> {
  double(): T;
  negate(): T;
  add(other: T): T;
  subtract(other: T): T;
  equals(other: T): boolean;
  multiply(scalar: bigint): T;
}

export type GroupConstructor<T> = {
  BASE: T;
  ZERO: T;
};
export type Mapper<T> = (i: T[]) => T[];

// Elliptic curve multiplication of Point by scalar. Fragile.
// Scalars should always be less than curve order: this should be checked inside of a curve itself.
// Creates precomputation tables for fast multiplication:
// - private scalar is split by fixed size windows of W bits
// - every window point is collected from window's table & added to accumulator
// - since windows are different, same point inside tables won't be accessed more than once per calc
// - each multiplication is 'Math.ceil(CURVE_ORDER / 𝑊) + 1' point additions (fixed for any scalar)
// - +1 window is necessary for wNAF
// - wNAF reduces table size: 2x less memory + 2x faster generation, but 10% slower multiplication
// TODO: Research returning 2d JS array of windows, instead of a single window. This would allow
// windows to be in different memory locations
export function wNAF<T extends Group<T>>(c: GroupConstructor<T>, bits: number) {
  const constTimeNegate = (condition: boolean, item: T): T => {
    const neg = item.negate();
    return condition ? neg : item;
  };
  const opts = (W: number) => {
    const windows = Math.ceil(bits / W) + 1; // +1, because
    const windowSize = 2 ** (W - 1); // -1 because we skip zero
    return { windows, windowSize };
  };
  return {
    constTimeNegate,
    // non-const time multiplication ladder
    unsafeLadder(elm: T, n: bigint) {
      let p = c.ZERO;
      let d: T = elm;
      while (n > _0n) {
        if (n & _1n) p = p.add(d);
        d = d.double();
        n >>= _1n;
      }
      return p;
    },

    /**
     * Creates a wNAF precomputation window. Used for caching.
     * Default window size is set by `utils.precompute()` and is equal to 8.
     * Number of precomputed points depends on the curve size:
     * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
     * - 𝑊 is the window size
     * - 𝑛 is the bitlength of the curve order.
     * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
     * @returns precomputed point tables flattened to a single array
     */
    precomputeWindow(elm: T, W: number): Group<T>[] {
      const { windows, windowSize } = opts(W);
      const points: T[] = [];
      let p: T = elm;
      let base = p;
      for (let window = 0; window < windows; window++) {
        base = p;
        points.push(base);
        // =1, because we skip zero
        for (let i = 1; i < windowSize; i++) {
          base = base.add(p);
          points.push(base);
        }
        p = base.double();
      }
      return points;
    },

    /**
     * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
     * @param W window size
     * @param precomputes precomputed tables
     * @param n scalar (we don't check here, but should be less than curve order)
     * @returns real and fake (for const-time) points
     */
    wNAF(W: number, precomputes: T[], n: bigint): { p: T; f: T } {
      // TODO: maybe check that scalar is less than group order? wNAF behavious is undefined otherwise
      // But need to carefully remove other checks before wNAF. ORDER == bits here
      const { windows, windowSize } = opts(W);

      let p = c.ZERO;
      let f = c.BASE;

      const mask = BigInt(2 ** W - 1); // Create mask with W ones: 0b1111 for W=4 etc.
      const maxNumber = 2 ** W;
      const shiftBy = BigInt(W);

      for (let window = 0; window < windows; window++) {
        const offset = window * windowSize;
        // Extract W bits.
        let wbits = Number(n & mask);

        // Shift number by W bits.
        n >>= shiftBy;

        // If the bits are bigger than max size, we'll split those.
        // +224 => 256 - 32
        if (wbits > windowSize) {
          wbits -= maxNumber;
          n += _1n;
        }

        // This code was first written with assumption that 'f' and 'p' will never be infinity point:
        // since each addition is multiplied by 2 ** W, it cannot cancel each other. However,
        // there is negate now: it is possible that negated element from low value
        // would be the same as high element, which will create carry into next window.
        // It's not obvious how this can fail, but still worth investigating later.

        // Check if we're onto Zero point.
        // Add random point inside current window to f.
        const offset1 = offset;
        const offset2 = offset + Math.abs(wbits) - 1; // -1 because we skip zero
        const cond1 = window % 2 !== 0;
        const cond2 = wbits < 0;
        if (wbits === 0) {
          // The most important part for const-time getPublicKey
          f = f.add(constTimeNegate(cond1, precomputes[offset1]));
        } else {
          p = p.add(constTimeNegate(cond2, precomputes[offset2]));
        }
      }
      // JIT-compiler should not eliminate f here, since it will later be used in normalizeZ()
      // Even if the variable is still unused, there are some checks which will
      // throw an exception, so compiler needs to prove they won't happen, which is hard.
      // At this point there is a way to F be infinity-point even if p is not,
      // which makes it less const-time: around 1 bigint multiply.
      return { p, f };
    },

    wNAFCached(P: T, precomputesMap: Map<T, T[]>, n: bigint, transform: Mapper<T>): { p: T; f: T } {
      // @ts-ignore
      const W: number = P._WINDOW_SIZE || 1;
      // Calculate precomputes on a first run, reuse them after
      let comp = precomputesMap.get(P);
      if (!comp) {
        comp = this.precomputeWindow(P, W) as T[];
        if (W !== 1) {
          precomputesMap.set(P, transform(comp));
        }
      }
      return this.wNAF(W, comp, n);
    },
  };
}

// Generic BasicCurve interface: works even for polynomial fields (BLS): P, n, h would be ok.
// Though generator can be different (Fp2 / Fp6 for BLS).
export type BasicCurve<T> = {
  Fp: IField<T>; // Field over which we'll do calculations (Fp)
  n: bigint; // Curve order, total count of valid points in the field
  nBitLength?: number; // bit length of curve order
  nByteLength?: number; // byte length of curve order
  h: bigint; // cofactor. we can assign default=1, but users will just ignore it w/o validation
  hEff?: bigint; // Number to multiply to clear cofactor
  Gx: T; // base point X coordinate
  Gy: T; // base point Y coordinate
  allowInfinityPoint?: boolean; // bls12-381 requires it. ZERO point is valid, but invalid pubkey
};

export function validateBasic<FP, T>(curve: BasicCurve<FP> & T) {
  validateField(curve.Fp);
  validateObject(
    curve,
    {
      n: 'bigint',
      h: 'bigint',
      Gx: 'field',
      Gy: 'field',
    },
    {
      nBitLength: 'isSafeInteger',
      nByteLength: 'isSafeInteger',
    }
  );
  // Set defaults
  return Object.freeze({
    ...nLength(curve.n, curve.nBitLength),
    ...curve,
    ...{ p: curve.Fp.ORDER },
  } as const);
}