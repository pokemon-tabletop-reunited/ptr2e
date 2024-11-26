import { Size, SIZES } from "@actor/data.ts";

interface SizeDimensions {
  length: number;
  width: number;
}

export class ActorSizePTR2e {
  /** The size category of this category */
  value: Size;
  /** The length dimension of this actor's space */
  length: number;
  /** The width dimension of this actor's space */
  width: number;

  /** The default space (in a PTR 2e rules context) of each size */
  private static defaultSpaces: Record<Size, SizeDimensions> = {
    diminutive: { length: 0.5, width: 0.5 },
    tiny: { length: 0.5, width: 0.5 },
    small: { length: 1, width: 1 },
    medium: { length: 1, width: 1 },
    large: { length: 2, width: 2 },
    huge: { length: 3, width: 3 },
    gigantic: { length: 4, width: 4 },
    titanic: { length: 5, width: 5 },
    max: { length: 6, width: 6 },
  };

  /**
   * @param value A size category
   * @param [length] A length of a Pathfinder "space"
   * @param [width]  A width of a Pathfinder "space"
   * @param [smallIsMedium] Treat small as medium
   */
  constructor(params: { value?: Size; length?: number; width?: number; smallIsMedium?: boolean }) {
    if (typeof params.value !== "string" || (params.smallIsMedium && params.value === "small")) {
      params.value = "medium";
    }

    this.value = params.value;
    const spaces = ActorSizePTR2e.defaultSpaces[params.value] ?? ActorSizePTR2e.defaultSpaces.medium;
    this.length = params.length ?? spaces.length;
    this.width = params.width ?? spaces.width;
  }

  private static sizeRanks: Record<Size, number> = {
    diminutive: 0,
    tiny: 1,
    small: 2,
    medium: 3,
    large: 4,
    huge: 5,
    gigantic: 6,
    titanic: 7,
    max: 8,
  }

  get rank(): number {
    return ActorSizePTR2e.sizeRanks[this.value];
  }

  /**
   * Test for equality between this and another size, falling back to comparing areas in case of a category tie
   * @param size The size to which this size is being compared
   * @param [smallIsMedium] Treat small as medium for both sizes
   */
  equals(size: ActorSizePTR2e, { smallIsMedium = false } = {}): boolean {
    const thisSize = this.getEffectiveSize(this.value, { smallIsMedium });
    const otherSize = this.getEffectiveSize(size.value, { smallIsMedium });
    return thisSize === otherSize;
  }

  /**
   * Test whether this size is larger than another, falling back to comparing areas in case of a category tie
   * @param size The size to which this size is being compared
   * @param [smallIsMedium] Treat small as medium for both sizes
   */
  isLargerThan(size: ActorSizePTR2e | Size, { smallIsMedium = false } = {}): boolean {
    const other = size instanceof ActorSizePTR2e ? size : new ActorSizePTR2e({ value: size });
    const thisSize = this.getEffectiveSize(this.value, { smallIsMedium });
    const otherSize = this.getEffectiveSize(other.value, { smallIsMedium });
    return ActorSizePTR2e.sizeRanks[thisSize] > ActorSizePTR2e.sizeRanks[otherSize];
  }

  /**
   * Test whether this size is smaller than another, falling back to comparing areas in case of a category tie
   * @param size The size to which this size is being compared
   * @param [smallIsMedium] Treat small as medium for both sizes
   */
  isSmallerThan(size: ActorSizePTR2e | Size, { smallIsMedium = false } = {}): boolean {
    const other = size instanceof ActorSizePTR2e ? size : new ActorSizePTR2e({ value: size });
    const thisSize = this.getEffectiveSize(this.value, { smallIsMedium });
    const otherSize = this.getEffectiveSize(other.value, { smallIsMedium });
    return ActorSizePTR2e.sizeRanks[thisSize] < ActorSizePTR2e.sizeRanks[otherSize];
  }

  /**
   * Get the difference in number of size categories between this and another size
   * @param size The size to which this size is being compared
   * @param [smallIsMedium] Ignore the difference between small and medium
   */
  difference(size: ActorSizePTR2e, { smallIsMedium = false } = {}): number {
    const thisSize = this.getEffectiveSize(this.value, { smallIsMedium });
    const otherSize = this.getEffectiveSize(size.value, { smallIsMedium });
    return ActorSizePTR2e.sizeRanks[thisSize] - ActorSizePTR2e.sizeRanks[otherSize];
  }

  /**
   * Get the "effective" size of a size category in case the `smallIsMedium` option was passed
   * @param size The size used for comparison in the calling method
   * @param [smallIsMedium] Return this size if both this and `size` are small or medium
   */
  private getEffectiveSize(size: Size, { smallIsMedium }: { smallIsMedium: boolean }): Size {
    return smallIsMedium && size === "small" ? "medium" : size;
  }

  /**
   * Increase this size the next larger category
   * @param [skipSmall] Skip a size if the current size is tiny or small
   */
  increment({ skipSmall = false } = {}): void {
    this.value =
      this.value === "tiny" && skipSmall
        ? "medium"
        : this.value === "small" && skipSmall
          ? "large"
          : SIZES[SIZES.indexOf(this.value) + 1];

    const newSpace = ActorSizePTR2e.defaultSpaces[this.value];
    this.length = newSpace.length;
    this.width = newSpace.width;
  }

  /**
   * Increase this size the next smaller category
   * @param [skipSmall] Skip a size if the current size is tiny or small
   */
  decrement({ skipSmall = false } = {}): void {
    const toTiny = (this.value === "medium" && skipSmall) || this.value === "tiny";
    this.value = toTiny ? "tiny" : SIZES[SIZES.indexOf(this.value) - 1];

    const newSpace = ActorSizePTR2e.defaultSpaces[this.value];
    this.length = newSpace.length;
    this.width = newSpace.width;
  }

  toString(): string {
    return game.i18n.localize(CONFIG.PTR.actorSizes[this.value]);
  }
}
