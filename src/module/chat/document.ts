import TypeDataModel from "types/foundry/common/abstract/type-data.js";

class ChatMessagePTR2e<TSchema extends TypeDataModel = TypeDataModel> extends ChatMessage<TSchema> {

    override prepareDerivedData(): void {
        const rolls = this._source.rolls.map(r => JSON.parse(r));
        let updated = false;
        for(const roll of rolls) {
            if(!roll.class || ["CheckRoll", "CaptureRoll", "DamageRoll", "AttackRoll", "InitiativeRoll"].includes(roll.class)) {
                roll.class = "Roll";
                updated = true;
            }
        }
        if(updated) {
            // this._source.rolls = rolls.map(r => JSON.stringify(r));
            this.updateSource({"rolls": rolls.map(r => JSON.stringify(r))});
        }
        return super.prepareDerivedData();
    }

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
                this.blind ? "blind" : null,
                this.type
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

        // Add custom listeners
        this.activateListeners(html);

        // Return the rendered HTML
        return html;
    }

    activateListeners(html: JQuery<HTMLElement>) {
        if ('activateListeners' in this.system && this.system && typeof this.system.activateListeners === 'function') this.system.activateListeners(html);

        html.find(".dice-roll").on('click', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const roll = event.currentTarget;
            const expanded = !roll.classList.contains("opened");

            const tooltips = roll.querySelectorAll(".dice-tooltip");
            for (const tip of tooltips) {
                if (expanded) $(tip).slideDown(200);
                else $(tip).slideUp(200);
                tip.classList.toggle("expanded", expanded);
            }

            roll.classList.toggle("opened", expanded);
        })

        html.find('.collapse-rolls').each((_i, el) => {
            $(el).on('click', (event) => {
                event.preventDefault();

                const expanded = !el.classList.contains('expanded');
                const content = el.parentElement?.nextElementSibling as HTMLElement;
                if (!content) return;
                if (expanded) {
                    el.innerHTML = el.innerHTML.replace("Show", "Hide")
                    $(content).slideDown({ duration: 200, start: () => $(content).css('display', 'flex') });
                }
                else {
                    el.innerHTML = el.innerHTML.replace("Hide", "Show")
                    $(content).slideUp(200);
                }

                el.classList.toggle('expanded', expanded);

                const messageElement = $(el).closest(".message")[0]
                const message = game.messages.get(messageElement.dataset.messageId as string);
                if (!message) return;

                if (game.messages.contents.at(-1)?.id === message.id) {
                    setTimeout(() => messageElement.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" }), 360);
                }
            });

            if (el.classList.contains('expanded')) {
                const content = el.parentElement?.nextElementSibling as HTMLElement;
                if (!content) return;

                $(content).css('display', 'flex');
            }
        });
    }

    static async expandCollapsible(element: HTMLElement): Promise<void> {
        if (element.classList.contains('expanded')) return;

        // 
    }
}

export default ChatMessagePTR2e;