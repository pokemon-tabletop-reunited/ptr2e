import { AuraAppearanceData } from "@actor";
// import { Trait } from "@data";
import { TokenDocumentPTR2e } from "../document.ts";
import { TokenPTR2e } from "../object.ts";

interface TokenAuraData {
  /** The radius of the aura, measured in feet from the boundary of a token's space */
  radius: number;

  /** The token from which this aura is emanating */
  token: TokenPTR2e | TokenDocumentPTR2e;

  /** The rectangle defining this aura's space */
  bounds: PIXI.Rectangle;

  /** The pixel-coordinate radius of this aura, measured from the center */
  radiusPixels: number;

  appearance: AuraAppearanceData;

  // /** Traits (especially "visual" and "auditory") associated with this aura */
  // traits: Trait[];
}

export type { TokenAuraData}