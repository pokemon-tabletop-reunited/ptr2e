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
                    this._activateTooltip();
                    this._autoLockTooltip();
                    return;
                }
            }
        }
    }

    _clearAutoLock() {
        if(this.#timeout) {
            window.clearTimeout(this.#timeout);
            this.#timeout = null;
        }
    }

    _autoLockTooltip() {
        if(this.#timeout) return;

        this.#timeout = window.setTimeout(() => {
            this.#timeout = null;
            if(this.tooltip.classList.contains("active")) {
                game.tooltip.lockTooltip();
            }
        }, 2000)
    }

    /**
     * Activate the tooltip
     */
    async _activateTooltip() {
        if (game.tooltip.element?.classList.contains("trait")) {
            return this._onTraitTooltip();
        }
    } 

    /**
     * Handle trait tooltips
     */
    async _onTraitTooltip() {
        const trait = game.tooltip.element?.dataset.trait;
        if (!trait) return;

        const data = game.ptr.data.traits.get(trait);
        if (!data) return;

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

type TooltipDirections = keyof typeof TooltipManager.TOOLTIP_DIRECTIONS;