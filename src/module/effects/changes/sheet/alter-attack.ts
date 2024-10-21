import AlterAttackChangeSystem from "../alter-attack.ts";
import ChangeForm from "./base.ts";

class AlterAttackForm extends ChangeForm<AlterAttackChangeSystem> {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get template() {
        return "systems/ptr2e/templates/effects/changes/alter-attack.hbs";
    }
}

export default AlterAttackForm;