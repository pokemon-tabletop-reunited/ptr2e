import ActorPTR2e from "@actor/base.ts";

class ActorComponent {
    static TEMPLATE: string;
    static TOOLTIP: string;

    actor: ActorPTR2e;

    constructor(actor: ActorPTR2e) {
        this.actor = actor;
    }

    get template() {
        return (this.constructor as typeof ActorComponent).TEMPLATE;
    }

    async renderComponent(data: Record<string, unknown>) {
        const html = await renderTemplate(this.template, data);
        return html;
    }

    /**
     * For injecting header buttons and other elements into the frame
     */
    renderFrame(_close: HTMLElement) {
        // Implement in subclass
    }

    attachListeners(_html: HTMLElement) {
        // Implement in subclass
    }
}

export { ActorComponent }