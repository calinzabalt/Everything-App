import { timingSafeEqual } from "crypto";

export function secretsEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  const size = Math.max(a.length, b.length, 1);
  const pa = Buffer.alloc(size);
  const pb = Buffer.alloc(size);
  a.copy(pa);
  b.copy(pb);
  return timingSafeEqual(pa, pb) && a.length === b.length;
}
