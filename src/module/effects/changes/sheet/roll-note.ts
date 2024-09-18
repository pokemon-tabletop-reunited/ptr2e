
import RollNoteChangeSystem from "../roll-note.ts";
import ChangeForm from "./base.ts";

class RollNoteForm extends ChangeForm<RollNoteChangeSystem> {
    override get template() {
        return "systems/ptr2e/templates/effects/changes/roll-note.hbs";
    }
}

export default RollNoteForm;