import BasicChangeSystem from "../basic.ts";
import FlatModifierChangeSystem from "../flat-modifier.ts";
import GrantItemChangeSystem from "../grant-item.ts";
import PercentileModifierSystem from "../percentile-modifier.ts";
import RollOptionChangeSystem from "../roll-option.ts";
import StageModifierSystem from "../stage-modifier.ts";
import AELikeModifierForm from "./ae-like.ts";
import ChangeForm from "./base.ts";
import FlatModifierForm from "./flat-modifier.ts";
import GrantItemForm from "./grant-item.ts";
import RollOptionForm from "./roll-option.ts";
import StageModifierForm from "./stage-modifier.ts";
import PercentileModifierForm from "./percentile-modifier.ts";
import RollNoteChangeSystem from "../roll-note.ts";
import RollNoteForm from "./roll-note.ts";
import RollEffectChangeSystem from "../effect-roll.ts";
import RollEffectForm from "./effect-roll.ts";
import GrantEffectChangeSystem from "../grant-effect.ts";
import GrantEffectForm from "./grant-effect.ts";

const CHANGE_FORMS: Partial<Record<string, ConstructorOf<ChangeForm>>> = {
    [FlatModifierChangeSystem.TYPE]: FlatModifierForm,
    [StageModifierSystem.TYPE]: StageModifierForm,
    [PercentileModifierSystem.TYPE]: PercentileModifierForm,
    [RollOptionChangeSystem.TYPE]: RollOptionForm,
    [GrantItemChangeSystem.TYPE]: GrantItemForm,
    [GrantEffectChangeSystem.TYPE]: GrantEffectForm,
    [BasicChangeSystem.TYPE]: AELikeModifierForm,
    [RollNoteChangeSystem.TYPE]: RollNoteForm,
    [RollEffectChangeSystem.TYPE]: RollEffectForm,
};

export { CHANGE_FORMS, ChangeForm}
export type * from "./base.ts";