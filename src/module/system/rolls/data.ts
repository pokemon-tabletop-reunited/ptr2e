import type { CheckDC } from "./degree-of-success.ts";
import type { RollNote, RollNoteSource } from "@system/notes.ts";
import type { Trait } from "@data";
import type { EffectRoll } from "@actor";
import type { CheckRoll, CheckType } from "./check-roll.ts";
import type { ModifierPTR2e } from "@module/effects/modifiers.ts";

interface RollData extends Roll.Options {
  rollerId?: string;
  totalModifier?: number;
  /** Whether roll breakdown should be visible to players */
  showBreakdown?: boolean;
}

/** Params for a RollFunction */
interface RollParameters {
  /** The triggering event */
  event?: MouseEvent | JQuery.TriggeredEvent;
  /** Any Roll options which should be used for this roll */
  options?: Iterable<string>;
  /** Optional DC for the roll */
  dc?: CheckDC | null;
  /** Callback after the roll resolves */
  callback?: (roll: Roll.Evaluated<Roll>) => void;
  /** Should a message be created from the roll */
  createMessage?: boolean;
}

interface AttackRollParams extends RollParameters {
  /** A target token: pulled from `game.users.targets` if not provided */
  target?: Token.ConfiguredInstance | null;
  /** Retrieve the formula of the strike roll without following through to the end */
  getFormula?: true;
  /** Should this strike consume ammunition, if applicable? */
  consumeAmmo?: boolean;
}

interface DamageRollParams extends Omit<AttackRollParams, "consumeAmmo"> { }

interface RollTarget {
  actor: Actor.ConfiguredInstance;
  token: TokenDocument.ConfiguredInstance;
  distance: number;
  rangeIncrement: number | null;
}

interface BaseRollContext {
  /** Any Roll options which should be used for this roll */
  options?: Set<string>;
  /** Any notes which should be shown for the roll. */
  notes?: (RollNote | RollNoteSource)[];
  /** The roll mode (i.e., 'roll', 'blindroll', etc) to use when rendering this roll. */
  rollMode?: CONFIG.Dice.RollModes | "roll";
  /** If this is an attack, the target of that attack */
  target?: RollTarget | null;
  /** Action traits associated with the roll */
  traits?: Trait[];
  /** The outcome a roll (usually relevant only to rerolls) */
  outcome?: number | null;
  /** The outcome prior to being changed by abilities raising or lowering degree of success */
  unadjustedOutcome?: number | null;
  /** Should the roll be immediately created as a chat message? */
  createMessage?: boolean;
  /** Skip the roll dialog regardless of user setting  */
  skipDialog?: boolean;
}

interface CheckRollContext extends BaseRollContext {
  /** The type of this roll */
  type?: CheckType;
  /** A string of some kind to identify the roll: will be included in `CheckRoll#options` */
  identifier?: Maybe<string>;
  /** The slug of an action, of which this roll is a workflow component */
  action?: Maybe<string>;
  /** The (virtual) attack data */
  attack?: PTR.Models.Action.Models.Attack.Instance;
  /** Targeting data for the check, if applicable */
  targets?: RollTarget[] | null;
  /** The actor which initiated this roll. */
  actor?: Actor.ConfiguredInstance;
  /** The token which initiated this roll. */
  token?: TokenDocument.ConfiguredInstance | null;
  /** The originating item of this attack, if any */
  item?: Item.ConfiguredInstance | null;
  /** Optional title of the roll options dialog; defaults to the check name */
  title?: string;
  /** Optional DC data for the check */
  dc?: CheckDC | null;
  /** The domains this roll had, for reporting purposes */
  domains?: string[];
  /** Is this check part of an action that deals damage? */
  damaging?: boolean;
  /** Is the roll a reroll? */
  isReroll?: boolean;
  /** Omitted Subrolls */
  omittedSubrolls?: Set<'accuracy' | 'crit' | 'damage'>;
  /** PP Cost */
  ppCost?: number;
  /** Should PP be consumed */
  consumePP?: boolean;
  /** Modifier information to be stored on chat message object */
  modifiers?: ModifierPTR2e[];
  /** Self Effect Rolls */
  selfEffectRolls?: EffectRoll[];
  /** Target Effect Rolls */
  effectRolls?: {
    target: EffectRoll[];
    origin: EffectRoll[];
  };
  /** Attack Variants' slugs */
  variants?: string[];
}

interface CaptureCheckRollContext extends CheckRollContext {
  accuracyRoll: Roll.Evaluated<CheckRoll>;
}

export type { AttackRollParams, BaseRollContext, CheckRollContext, CaptureCheckRollContext, DamageRollParams, RollParameters, RollData };
