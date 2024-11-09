import { ItemPTR2e, ItemSystemPTR } from "@item";

class PerkDirectory extends ItemDirectory<ItemPTR2e<ItemSystemPTR, null>> {
    get popout() {
        return this._popout;
    }

    static override get defaultOptions(): SidebarDirectoryOptions {
        return fu.mergeObject(super.defaultOptions, {
            popOut: true
        });
    }

    override get title() {
        return `${game.i18n.localize("TYPES.Item.perk")} ${game.i18n.localize("Directory")}`;
    }

    static override entryPartial =
        "systems/ptr2e/templates/sidebar/perk-directory-entry.hbs";

    async _onCreateEntry(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event: { preventDefault: () => void; stopPropagation: () => void; currentTarget: any },
        // eslint-disable-next-line no-empty-pattern
        {} = {}
    ) {
        event.preventDefault(); 
        event.stopPropagation();
        const button = event.currentTarget;
        const li = button.closest(".directory-item");
        const data = { folder: li?.dataset?.folderId, type: "perk" };
        const options = { width: 320, left: window.innerWidth - 630, top: button.offsetTop, perksOnly: true};
        return ItemPTR2e.createDialog(data, options);
    }

    override async close(options = {}) {
        if (game.ptr.web.editMode) {
            this.minimize();
            return;
        }
        return super.close(options);
    }

    override bringToTop() {
        if (ui.activeWindow === this) return;
        const element = this.element[0];
        const z = Number(document.defaultView!.getComputedStyle(element).zIndex);
        if (z < _maxZ) {
            this.position.zIndex = Math.clamp(++_maxZ, 100, 99999);
            element.style.zIndex = "" + this.position.zIndex;
            ui.activeWindow = this;
        }
    }

    override renderPopout() {
        const pop = this.createPopout();
        pop.render(true, { top: 0, left: window.innerWidth - 310 - 250 });
    }
}

interface PerkDirectory extends ItemDirectory<ItemPTR2e<ItemSystemPTR, null>> {}

export { PerkDirectory };
