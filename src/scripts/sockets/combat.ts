import { CombatPTR2e } from "@combat";
import { PTR2eSocketInternalError } from "./errors.ts";

let _combat: CombatPTR2e | null = null;
let _debounce: ReturnType<typeof fu.debounce<[string]>> | null = null;
let _function: ((this: CombatPTR2e, combatantId: string) => Promise<void>) | null = null;
let _promise: Promise<CombatPTR2e> | null = null;

export async function handleNextTurn({combatId, combatantId}: {combatId: string, combatantId: string}): Promise<CombatPTR2e> {
  const combat = game.combats.get(combatId) as CombatPTR2e | undefined;
  if (!combat) throw new PTR2eSocketInternalError("Combat not found.");

  if (_combat !== combat) {
    _combat = combat;

    _promise = new Promise<CombatPTR2e>((resolve) => {
      _function = async function (this: CombatPTR2e, combatantId: string): Promise<void> {
        if(this.combatant?.id !== combatantId) {
          // if the combatant ID doesn't match, we likely raced and another turn was already started. In this case, just resolve with the current combat state.
          resolve(this);
          return;
        }
        resolve(await CombatPTR2e.handleNextTurn.call(this));
      }
      _debounce = fu.debounce<[string]>(_function.bind(combat), 200);
    });

  }

  _debounce?.call(combat, combatantId);
  return _promise!;
}