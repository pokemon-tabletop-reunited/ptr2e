import ActorPTR2e from "@actor/base.ts";

class ActorComponent {
    static TEMPLATE: string;
    static TOOLTIP: string;

    static ACTIONS: Record<string, (event: Event) => Promise<void>> = {};

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    renderFrame(_close: HTMLElement) {
        // Implement in subclass
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attachListeners(_html: HTMLElement) {
        // Implement in subclass
    }
}

interface ActorComponent {
    constructor: typeof ActorComponent;
}

export { ActorComponent }