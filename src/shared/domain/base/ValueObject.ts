/**
 * A value object has no identity: two instances of the same class are equal
 * when their primitive representations are equal.
 */
export abstract class ValueObject<T> {
  abstract toPrimitive(): T

  equals(other: ValueObject<T> | null | undefined): boolean {
    if (!other) {
      return false
    }
    if (other.constructor !== this.constructor) {
      return false
    }
    return this.propsAreEqual(other)
  }

  protected propsAreEqual(other: ValueObject<T>): boolean {
    return this.toPrimitive() === other.toPrimitive()
  }
}

export default ValueObject
