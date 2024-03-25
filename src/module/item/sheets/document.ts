export type DocumentSheetConfiguration<TDocument extends foundry.abstract.Document> =
    foundry.applications.api.HandlebarsDocumentSheetConfiguration<TDocument>;
export class DocumentSheetV2<TDocument extends foundry.abstract.Document> extends foundry
    .applications.api.DocumentSheetV2<
    TDocument,
    foundry.applications.api.HandlebarsDocumentSheetConfiguration
> {
    protected override async _onSubmitForm(event: Event | SubmitEvent): Promise<void> {
        event.preventDefault();
        const { handler, closeOnSubmit } = this.options.form || {};
        const element = this.element as HTMLFormElement

        $(element).find("tags ~ input").each((_i, input) => {
            if ((input as HTMLInputElement).value === "") (input as HTMLInputElement).value = "[]";
        });

        const formData = new FormDataExtended(element);
        if (handler instanceof Function) await handler.call(this, event, element, formData);
        if (closeOnSubmit) await this.close();
    }
}
