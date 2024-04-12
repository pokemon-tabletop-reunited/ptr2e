import { DocumentSheetConfiguration, DocumentSheetV2 } from "@item/sheets/document.ts";
import FolderPTR2e from "./document.ts";
import { HandlebarsRenderOptions } from "types/foundry/common/applications/api.js";

class FolderConfigPTR2e extends foundry.applications.api.HandlebarsApplicationMixin(
    DocumentSheetV2<FolderPTR2e>
) {
    static override DEFAULT_OPTIONS = fu.mergeObject(
        super.DEFAULT_OPTIONS,
        {
            classes: ["folder-edit"],
            position: {
                width: 360,
                height: "auto",
            },
            form: {
                handler: FolderConfigPTR2e.#onSubmit,
                closeOnSubmit: true,
                submitOnChange: false,
            },
        },
        { inplace: false }
    );

    static override PARTS: Record<string, foundry.applications.api.HandlebarsTemplatePart> = {
        sheet: {
            id: "sheet",
            template: "/systems/ptr2e/templates/folder/folder-edit.hbs",
        },
    };

    override get id() {
        return this.document.id ? super.id : "folder-create";
    }

    /* -------------------------------------------- */

    override get title() {
        if (this.document.id)
            return `${game.i18n.localize("FOLDER.Update")}: ${this.document.name}`;
        return game.i18n.localize("FOLDER.Create");
    }

    /* -------------------------------------------- */

    // override async close(options={}) {
    //     if ( !this.options.form?.submitOnChange ) this.options.resolve?.(null);
    //     return super.close(options);
    // }

    override async _prepareContext(options?: DocumentSheetConfiguration<FolderPTR2e>) {
        const context = await super._prepareContext(options);
        const folder = this.document.toObject();
        //@ts-ignore
        const label = game.i18n.localize(Folder.implementation.metadata.label);

        return {
            ...context,
            folder: folder,
            name: folder._id ? folder.name : "",
            newName: game.i18n.format("DOCUMENT.New", { type: label }),
            safeColor:
                typeof folder.color === "string"
                    ? folder.color
                    : //@ts-expect-error
                      folder.color?.css ?? "#000000",
            sortingModes: { a: "FOLDER.SortAlphabetical", m: "FOLDER.SortManual" },
            submitText: game.i18n.localize(folder._id ? "FOLDER.Update" : "FOLDER.Create"),
        };
    }

    override _attachPartListeners(
        _partId: string,
        htmlElement: HTMLElement,
        _options: HandlebarsRenderOptions
    ): void {
        const colorElement = htmlElement.querySelector<HTMLInputElement>("input[type='color']")!;
        const edits = colorElement.dataset.edit;
        if (edits) {
            colorElement.addEventListener("input", () => {
                const sibling = colorElement.previousElementSibling as HTMLInputElement | undefined;
                if (sibling?.getAttribute("name") !== edits) return;

                sibling.value = colorElement.value;
                colorElement.style.setProperty("--color-input-border-color", colorElement.value);
            });
        }
    }

    static async #onSubmit(
        this: FolderConfigPTR2e,
        event: SubmitEvent | Event,
        _form: HTMLFormElement,
        formData: FormDataExtended
    ) {
        event.preventDefault();
        const data = formData.object as { name?: string } & Record<string, unknown>;
        const folder = await (async () => {
            if (!data.name?.trim()) data.name = Folder.defaultName();
            if (this.document.id) return await this.document.update(data);
            else {
                this.document.updateSource(data);
                return await FolderPTR2e.create(
                    this.document instanceof Folder ? this.document.toObject() : this.document,
                    { pack: this.document.pack }
                );
            }
        })();
        if ("resolve" in this.options && typeof this.options.resolve === "function")
            this.options.resolve(folder);
        return folder;
    }
}

export default FolderConfigPTR2e;
