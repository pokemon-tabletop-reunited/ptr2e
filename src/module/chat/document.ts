class ChatMessagePTR2e extends ChatMessage {

    /**
     * @inheritdoc
     * @remarks
     * This is a custom override of the `getHTML` method, which is used to render the chat message.
     * The override is purely to replace the basic `this.content` call with a call to `this.system.getHTMLContent` if it exists.
     * If a foundry update changes the `getHTML` method, this override will need to be updated to match.
     */
    override async getHTML(): Promise<JQuery<HTMLElement>> {
        const content = 'getHTMLContent' in this.system && typeof this.system.getHTMLContent === 'function'
            ? await this.system.getHTMLContent(this.content) as string
            : this.content;

        // Determine some metadata
        const data = this.toObject(false);
        data.content = await TextEditor.enrichHTML(content, { rollData: this.getRollData() as Record<string, unknown> });
        const isWhisper = this.whisper.length;

        // Construct message data
        const messageData = {
            message: data,
            user: game.user,
            author: this.author as User,
            alias: this.alias,
            cssClass: [
                this.style === CONST.CHAT_MESSAGE_STYLES.IC ? "ic" : null,
                this.style === CONST.CHAT_MESSAGE_STYLES.EMOTE ? "emote" : null,
                isWhisper ? "whisper" : null,
                this.blind ? "blind" : null
            ].filterJoin(" "),
            isWhisper: this.whisper.length,
            canDelete: game.user.isGM,  // Only GM users are allowed to have the trash-bin icon in the chat log itself
            whisperTo: this.whisper.map(u => {
                let user = game.users.get(u);
                return user ? user.name : null;
            }).filterJoin(", "),
        } as ChatMessageRenderData;

        // Render message data specifically for ROLL type messages
        if (this.isRoll) await this._renderRollContent(messageData);

        // Define a border color
        if (this.style === CONST.CHAT_MESSAGE_STYLES.OOC) messageData.borderColor = (this.author?.color as Color).css;

        // Render the chat message
        const template = await renderTemplate(CONFIG.ChatMessage.template, messageData);
        let html = $(template);

        // Flag expanded state of dice rolls
        if (this._rollExpanded) html.find(".dice-tooltip").addClass("expanded");
        Hooks.call("renderChatMessage", this, html, messageData);
        return html;
    }
}

export { ChatMessagePTR2e }