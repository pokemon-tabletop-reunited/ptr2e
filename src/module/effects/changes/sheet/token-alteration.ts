import type TokenAlterationChangeSystem from "../token-alterations.ts";
import ChangeForm from "./base.ts";

class TokenAlterationForm extends ChangeForm<TokenAlterationChangeSystem> {
    // eslint-disable-next-line @typescript-eslint/class-literal-property-style
    override get template() {
        return "systems/ptr2e/templates/effects/changes/token-alteration.hbs";
    }
}

export default TokenAlterationForm;