import BasicChangeSystem from "../basic.ts";
import FlatModifierChangeSystem from "../flat-modifier.ts";
import GrantItemChangeSystem from "../grant-item.ts";
import RollOptionChangeSystem from "../roll-option.ts";
import AELikeModifierForm from "./ae-like.ts";
import ChangeForm from "./base.ts";
import FlatModifierForm from "./flat-modifier.ts";
import GrantItemForm from "./grant-item.ts";
import RollOptionForm from "./roll-option.ts";

const CHANGE_FORMS: Partial<Record<string, ConstructorOf<ChangeForm>>> = {
    [FlatModifierChangeSystem.TYPE]: FlatModifierForm,
    [RollOptionChangeSystem.TYPE]: RollOptionForm,
    [GrantItemChangeSystem.TYPE]: GrantItemForm,
    [BasicChangeSystem.TYPE]: AELikeModifierForm
};

export { CHANGE_FORMS, ChangeForm}
export type * from "./base.ts";