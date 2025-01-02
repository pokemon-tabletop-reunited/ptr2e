import type { AuraAppearanceData } from "@actor";

interface TokenAuraData {
  /** The radius of the aura, measured in feet from the boundary of a token's space */
  radius: number;

  /** The token from which this aura is emanating */
  token: Token.ConfiguredInstance | TokenDocument.ConfiguredInstance;

  /** The rectangle defining this aura's space */
  bounds: PIXI.Rectangle;

  /** The pixel-coordinate radius of this aura, measured from the center */
  radiusPixels: number;

  appearance: AuraAppearanceData;

  // /** Traits (especially "visual" and "auditory") associated with this aura */
  // traits: Trait[];
}

export type { TokenAuraData}