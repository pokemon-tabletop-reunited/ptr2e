import { ActorPTR2e } from "@actor";
import { AttackMessageSystem, ChatMessagePTR2e, DamageAppliedMessageSystem } from "@chat";
import { AttackPTR2e } from "@data";
import { ItemPTR2e, MovePTR2e } from "@item";
import Tagify from "@yaireo/tagify";

export default class TooltipsPTR2e {
    #observer: MutationObserver | undefined;
    #timeout: number | null = null;

    get tooltip(): HTMLElement {
        return document.getElementById("tooltip") as HTMLElement;
    }

    /**
     * Initialize the tooltip observer
     * @remarks
     * This method is called by the Foundry `setup` hook.
     * This is so that the tooltip element is properly setup in the DOM. 
     */
    observe() {
        this.#observer?.disconnect();
        this.#observer = new MutationObserver(this._onMutation.bind(this));
        this.#observer.observe(this.tooltip, { attributeFilter: ["class"], attributeOldValue: true })
    }

    /**
     * Handle changes to the tooltip element
     * @param mutations - The mutations that occurred
     * @param _observer - The observer that triggered the mutations
     */
    _onMutation(mutations: MutationRecord[], _observer: MutationObserver): any {
        for (const { type, attributeName, oldValue } of mutations) {
            if (type === "attributes" && attributeName === "class") {
                const diff = new Set(this.tooltip.classList).difference(new Set(oldValue?.split(" ") ?? []));
                if (diff.has("active")) {
                    this._clearAutoLock();
                    this._activateTooltip().then(result => {
                        if (result) this._autoLockTooltip(result);
                    })
                    return;
                }
            }
        }
    }

    _clearAutoLock() {
        if (this.#timeout) {
            window.clearTimeout(this.#timeout);
            this.#timeout = null;
        }
    }

    _autoLockTooltip(timeout = 2000) {
        if (this.#timeout) return;

        this.#timeout = window.setTimeout(() => {
            this.#timeout = null;
            if (this.tooltip.classList.contains("active")) {
                game.tooltip.lockTooltip();
            }
        }, timeout)
    }

    /**
     * Activate the tooltip
     */
    async _activateTooltip(): Promise<false | number> {
        for (const cls of game.tooltip.element?.classList ?? []) {
            switch (cls) {
                case "trait":
                    return this._onTraitTooltip();
                case "attack":
                    return this._onAttackTooltip();
                case "status":
                    return this._onStatusTooltip();
                case "damage":
                    return this._onDamageTooltip();
                case "content-link": 
                    return this._onContentLinkTooltip();
                case "damage-info":
                    return this._onDamageInfoTooltip();
            }
        }

        return false;
    }

    /**
     * Handle trait tooltips
     */
    async _onTraitTooltip() {
        const trait = game.tooltip.element?.dataset.trait;
        if (!trait) return false;

        const tooltipTrait = game.tooltip.element?.dataset.tooltipTrait ?? false;

        const data = game.ptr.data.traits.get(trait);
        if (!data) return false;

        this.tooltip.innerHTML = `<h4 class="trait">[${data.label}]</h4><cntent>${data.description}</content>
        <div class="progress-circle">
            <svg width="20" height="20" viewBox="0 0 20 20" class="circular-progress">
                <circle class="bg"></circle>
                <circle class="fg"></circle>
                <circle class="fgb"></circle>
            </svg>
        </div>`;
        const tooltipDirection = game.tooltip.element?.dataset.tooltipDirection as TooltipDirections | undefined;
        requestAnimationFrame(() => this._positionTooltip(tooltipDirection));
        return tooltipTrait ? 1 : 2000;
    }

    async _onAttackTooltip() {
        const attackSlug = game.tooltip.element?.dataset.action;
        if (!attackSlug) return false;

        const parentUuid = (game.tooltip.element?.closest("[data-parent]") as HTMLElement)?.dataset.parent;
        if (!parentUuid) return false;

        const parent = await fromUuid(parentUuid) as ActorPTR2e | ItemPTR2e;
        if (!parent) return false;

        const attack = parent.actions.attack!.get(attackSlug) as AttackPTR2e | undefined;
        if (!attack) return false;

        return await this.#createAttackTooltip(attack);
    }

    async #createAttackTooltip(attack: AttackPTR2e) {
        const traits = attack._traits.map(t => ({value: t.slug, label: t.label}));

        this.tooltip.classList.add("attack");
        await this._renderTooltip({ path: "systems/ptr2e/templates/items/embeds/move.hbs", data: { attack, move: parent, traits }, direction: game.tooltip.element?.dataset.tooltipDirection as TooltipDirections | undefined });
        
        for (const input of this.tooltip.querySelectorAll<HTMLInputElement>(
            "input.ptr2e-tagify"
        )) {
            new Tagify(input, {
                enforceWhitelist: true,
                keepInvalidTags: false,
                editTags: false,
                tagTextProp: "label",
                dropdown: {
                    enabled: 0,
                    mapValueTo: "label",
                },
                templates: {
                    tag: function(tagData): string {
                        return `
                        <tag contenteditable="false" spellcheck="false" tabindex="-1" class="tagify__tag" ${this.getAttributes(tagData)}>
                        <x title="" class="tagify__tag__removeBtn" role="button" aria-label="remove tag"></x>
                        <div>
                            <span class='tagify__tag-text'>
                                <span class="trait" data-tooltip-direction="UP" data-trait="${tagData.value}" data-tooltip="${tagData.label}" data-tooltip-trait="true"><span>[</span><span class="tag">${tagData.label}</span><span>]</span></span>
                            </span>
                        </div>
                        `;
                    },
                },
                whitelist: traits
            });
        }

        return 2000;
    }

    async _onStatusTooltip() {
        const element = game.tooltip.element;
        if (!element) return false;

        const targetUuid = (element.closest("[data-target-uuid]") as HTMLElement)?.dataset?.targetUuid;
        if (!targetUuid) return false;

        const messageId = (element.closest("[data-message-id]") as HTMLElement)?.dataset?.messageId;
        if (!messageId) return false;

        const message = game.messages.get(messageId) as ChatMessagePTR2e<AttackMessageSystem>;
        if (!message) return false;

        const target = message.system.context?.targets.get(targetUuid);
        if (!target) return false;

        const accuracy = target.accuracy;

        this.tooltip.classList.add("status");
        await this._renderTooltip({ path: "systems/ptr2e/templates/chat/tooltips/status.hbs", data: { target, accuracy }, direction: game.tooltip.element?.dataset.tooltipDirection as TooltipDirections | undefined });

        for (const button of this.tooltip.querySelectorAll("button")) {
            button.addEventListener("click", async (event) => {
                const type = (event.currentTarget as HTMLElement).id as 'hit' | 'critical' | 'miss';
                if (!type) return;
                message.system.updateTarget(targetUuid, { status: type });
                game.tooltip.deactivate();
                game.tooltip.dismissLockedTooltips();
            });
        }

        return 500;
    }

    async _onDamageTooltip() {
        const element = game.tooltip.element;
        if (!element) return false;

        const targetUuid = (element.closest("[data-target-uuid]") as HTMLElement)?.dataset?.targetUuid;
        if (!targetUuid) return false;

        const messageId = (element.closest("[data-message-id]") as HTMLElement)?.dataset?.messageId;
        if (!messageId) return false;

        const message = game.messages.get(messageId) as ChatMessagePTR2e<AttackMessageSystem>;
        if (!message) return false;

        const target = message.system.context?.targets.get(targetUuid);
        if (!target) return false;

        const damage = target.damage;

        this.tooltip.classList.add("damage");
        await this._renderTooltip({ path: "systems/ptr2e/templates/chat/tooltips/damage.hbs", data: { target, damage }, direction: game.tooltip.element?.dataset.tooltipDirection as TooltipDirections | undefined });

        for (const button of this.tooltip.querySelectorAll("button")) {
            button.addEventListener("click", async (event) => {
                const type = (event.currentTarget as HTMLElement).id as 'hit' | 'critical' | 'miss';
                if (!type) return;
                // message.system.updateTarget(targetUuid, { status: type });
                game.tooltip.deactivate();
                game.tooltip.dismissLockedTooltips();
            });
        }

        return 500;
    }

    async _onDamageInfoTooltip() {
        const element = game.tooltip.element;
        if (!element) return false;

        const uuid = element.dataset.message
        if (!uuid) return false;

        const message = await fromUuid(uuid) as ChatMessagePTR2e<DamageAppliedMessageSystem>;
        if (!message) return false;

        this.tooltip.classList.add("damage-info");
        await this._renderTooltip({ path: "systems/ptr2e/templates/chat/tooltips/damage-info.hbs", data: { notes: message.system._notesHTML }, direction: game.tooltip.element?.dataset.tooltipDirection as TooltipDirections | undefined });

        return 500;
    }

    async _onContentLinkTooltip() {
        const element = game.tooltip.element;
        if (!element) return false;

        const uuid = element.dataset.uuid;
        if (!uuid) return false;

        const entityType = element.dataset.type;
        if(entityType !== "Item") return false;

        const embedFigure = element.closest("figure.content-embed") as HTMLElement | undefined;
        if(embedFigure?.classList.contains("no-tooltip") && embedFigure.dataset.uuid === uuid) return false;

        const entity = await fromUuid(uuid) as ItemPTR2e | null;
        if (!entity) return false;

        switch(entity.type) {
            case "move":
                const move = entity as MovePTR2e;
                const attack = move.system.attack;
                if(!attack) return false;

                if(game.tooltip.element) game.tooltip.element.dataset.tooltipDirection ||= "LEFT";

                return await this.#createAttackTooltip(attack);
            default: return false;
        }
    }

    async _renderTooltip({ path, data, direction = TooltipManager.TOOLTIP_DIRECTIONS.DOWN, autoLock = true }: { path: string; data: any; direction?: TooltipDirections; autoLock?: boolean }) {
        let html = await renderTemplate(path, data);
        if (autoLock) html += `<div class="progress-circle">
            <svg width="20" height="20" viewBox="0 0 20 20" class="circular-progress">
                <circle class="bg"></circle>
                <circle class="fg"></circle>
                <circle class="fgb"></circle>
            </svg>
        </div>`;
        this.tooltip.innerHTML = await TextEditor.enrichHTML(html);
        requestAnimationFrame(() => this._positionTooltip(direction));
    }

    /**
     * Position the tooltip
     * @param direction - The direction to position the tooltip
     */
    _positionTooltip(direction: TooltipDirections = TooltipManager.TOOLTIP_DIRECTIONS.DOWN) {
        const padding = TooltipManager.TOOLTIP_MARGIN_PX;
        const targetBox = game.tooltip.element?.getBoundingClientRect() ?? new DOMRect();
        let position: {
            textAlign?: "left" | "center" | "right";
            left?: number | null;
            right?: number | null;
            top?: number | null;
            bottom?: number | null;
        } = {};
        switch (direction) {
            case TooltipManager.TOOLTIP_DIRECTIONS.DOWN:
                position = {
                    textAlign: "center",
                    left: targetBox.left - (this.tooltip.offsetWidth / 2) + (targetBox.width / 2),
                    top: targetBox.bottom + padding
                }
                break;
            case TooltipManager.TOOLTIP_DIRECTIONS.LEFT:
                position = {
                    textAlign: "left",
                    right: window.innerWidth - targetBox.left + padding,
                    top: targetBox.top + (targetBox.height / 2) - (this.tooltip.offsetHeight / 2)
                }
                break;
            case TooltipManager.TOOLTIP_DIRECTIONS.RIGHT:
                position = {
                    textAlign: "right",
                    left: targetBox.right + padding,
                    top: targetBox.top + (targetBox.height / 2) - (this.tooltip.offsetHeight / 2)
                }
                break;
            case TooltipManager.TOOLTIP_DIRECTIONS.UP:
                position = {
                    textAlign: "center",
                    left: targetBox.left - (this.tooltip.offsetWidth / 2) + (targetBox.width / 2),
                    bottom: window.innerHeight - targetBox.top + padding
                }
                break;
            case TooltipManager.TOOLTIP_DIRECTIONS.CENTER:
                position = {
                    textAlign: "center",
                    left: targetBox.left - (this.tooltip.offsetWidth / 2) + (targetBox.width / 2),
                    top: targetBox.top - (targetBox.height / 2) - (this.tooltip.offsetHeight / 2)
                }
                break;
        }

        position = {
            top: null,
            right: null,
            bottom: null,
            left: null,
            textAlign: "left",
            ...position
        }

        const style = this.tooltip.style;

        // Left or Right
        const maxW = window.innerWidth - this.tooltip.offsetWidth;
        if (position.left) position.left = Math.clamp(position.left, padding, maxW - padding);
        if (position.right) position.right = Math.clamp(position.right, padding, maxW - padding);

        // Top or Bottom
        const maxH = window.innerHeight - this.tooltip.offsetHeight;
        if (position.top) position.top = Math.clamp(position.top, padding, maxH - padding);
        if (position.bottom) position.bottom = Math.clamp(position.bottom, padding, maxH - padding);

        // Assign styles
        for (const k of ["top", "right", "bottom", "left"]) {
            const v = position[k as keyof typeof position];
            // @ts-ignore
            style[k] = v ? `${v}px` : null;
        }

        this.tooltip.classList.remove(...["center", "left", "right"].map(dir => `text-${dir}`));
        this.tooltip.classList.add(`text-${position.textAlign}`);
    }
}

export type TooltipDirections = keyof typeof TooltipManager.TOOLTIP_DIRECTIONS;