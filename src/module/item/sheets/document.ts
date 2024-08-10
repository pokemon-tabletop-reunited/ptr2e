import { htmlQueryAll } from "@utils";

export type DocumentSheetConfiguration<TDocument extends foundry.abstract.Document> =
    foundry.applications.api.HandlebarsDocumentSheetConfiguration<TDocument>;
export class DocumentSheetV2<TDocument extends foundry.abstract.Document> extends foundry
    .applications.api.DocumentSheetV2<
    TDocument,
    foundry.applications.api.HandlebarsDocumentSheetConfiguration
> {
    protected override async _onSubmitForm(config: foundry.applications.api.ApplicationFormConfiguration, event: Event | SubmitEvent): Promise<void> {
        event.preventDefault();
        const { handler, closeOnSubmit } = config;
        const element = (event.currentTarget ?? this.element) as HTMLFormElement

        $(element).find("tags ~ input").each((_i, input) => {
            if ((input as HTMLInputElement).value === "") (input as HTMLInputElement).value = "[]";
        });

        const formData = new FormDataExtended(element);
        if (handler instanceof Function) await handler.call(this, event, element, formData);
        if (closeOnSubmit) await this.close();
    }

    override get isEditable(): boolean {
        if(this.document instanceof ActiveEffect && !this.document.parent) return false;
        return super.isEditable;
    }

    override _onRender(context: foundry.applications.api.ApplicationRenderContext, options: foundry.applications.api.HandlebarsDocumentSheetConfiguration): void {
        super._onRender(context, options);
        if (!this.isEditable) {
            const content = this.element.querySelector('.window-content');
            if (!content) return;

            for(const input of ["INPUT", "SELECT", "TEXTAREA", "BUTTON"]) {
                for(const element of content.getElementsByTagName(input)) {
                    if(input === "TEXTAREA") (element as HTMLTextAreaElement).readOnly = true;
                    else (element as HTMLInputElement).disabled = true;
                }
            }
            for(const element of htmlQueryAll(content, ".item-controls a")) {
                (element as HTMLButtonElement).disabled = true;
                element.attributes.setNamedItem(document.createAttribute("disabled"));
            }
        }
    }
}

export interface Tab {
    id: string;
    group: string;
    icon: string;
    label: string;
    active?: boolean;
    cssClass?: string;
}