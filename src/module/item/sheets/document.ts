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

    // override _attachFrameListeners(): void {
    //     super._attachFrameListeners();
    //     const button = this.element.querySelector<HTMLButtonElement>(".header-control[data-action=copyId]");
    //     if (button) {
    //         button.addEventListener("contextmenu", async () => {
    //             //@ts-ignore
    //             const uuid = this.document.uuid;
    //             //@ts-ignore
    //             const label = game.i18n.localize(this.document.constructor.metadata.label);
    //             game.clipboard.copyPlainText(uuid);
    //             ui.notifications.info(game.i18n.format("DOCUMENT.IdCopiedClipboard", {label, type: "uuid", id: uuid}));
    //         });
    //     }
    // }
}

export type Tab = {
    id: string;
    group: string;
    icon: string;
    label: string;
    active?: boolean;
    cssClass?: string;
};