/* eslint-disable @typescript-eslint/no-explicit-any */
import { PTUActor } from "@actor";
import { PTUItem } from "@item";
import { ItemSheetOptions } from "@item/sheet.ts";

export default class PTUSheet extends DocumentSheet {
    static override get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "/systems/ptr2e/templates/ptu-conversion.hbs";
        options.width = 580;
        options.height = 680;
        options.classes.push("ptu-sheet");
        options.resizable = true;
        return options;
    }

    protected override _getHeaderButtons(): ApplicationHeaderButton[] {
        const buttons = super._getHeaderButtons();
        if (this.document.isOwner && this.document.type === "ptu-actor") {
            buttons.unshift({
                label: "Attempt 2e Conversion",
                class: "ptu-convert",
                icon: "fas fa-file-import",
                onclick: () => {
                    console.log("Not yet implemented");
                },
            });
        }
        return buttons.filter(b => b.class !== "configure-sheet");
    }

    override async getData(
        option?: Partial<ItemSheetOptions> | undefined
    ): Promise<ItemSheetData<PTUItem>> {
        const data: any = await super.getData(option);

        const traverseTree = (branch: object, depth = 0): string => {
            if (typeof branch !== "object") return branch ? `<li>${branch}</li>` : "";
            if (depth > 5) return "";
            try {
                const nodes = [];
                const iterator: object = Array.isArray(branch)
                    ? branch.reduce((acc, value, index) => {
                          acc[value.name || index + ""] = value;
                          return acc;
                      }, {})
                    : branch;
                for (const [key, value] of Object.entries(iterator)) {
                    if (
                        [
                            "_id",
                            "_stats",
                            "sort",
                            "folder",
                            "type",
                            "schema",
                            "source",
                            "ownership",
                            "slug",
                            "contestType",
                            "origin",
                        ].includes(key)
                    )
                        continue;
                    if (key === "img") {
                        nodes.push(
                            `<li><details><summary>${key}</summary><ul><li><img src="${value}" height="64" width="64"/></li><li>${value}</li></ul></details></li>`
                        );
                        continue;
                    }
                    const details = traverseTree(value, depth + 1);
                    if (typeof value !== "object" && value) {
                        nodes.push(
                            `<li class="key-value"><span class="key">${key}:</span><ul><li><span class="value">${value}</span></li></ul></li>`
                        );
                        continue;
                    }
                    nodes.push(
                        details
                            ? `<li><details><summary>${key}</summary><ul>${details}</ul></details></li>`
                            : ""
                    );
                }
                return nodes.join("");
            } catch (error) {
                return branch + "";
            }
        };
        data.tree = {
            name: this.document.name,
            html: `<ul class="summary-tree">${traverseTree(this.document.toObject())}</ul>`,
        };

        return data;
    }

    protected override async _onSubmit(
    ): Promise<false | Record<string, unknown>> {
        return false;
    }
}

export default interface PTUSheet {
    get document(): PTUItem | PTUActor;
}
