/**
 * Quick and dirty API around the Loading bar.
 * Does not handle conflicts; multiple instances of this class will fight for the same loading bar, but once all but
 * once are completed, the bar should return to normal
 */
export class Progress {
    steps: number;
    counter: number;
    label: string;
    loader: HTMLElement;

    constructor({ steps = 1 }: {steps?: number, label?: string} = {}) {
        this.steps = steps;
        this.counter = -1;
        this.label = "";
    }

    advance(label?: string | { by?: number; label?: string }) {
        if(this.counter === this.steps) return;
        if (typeof label === "object") {
            this.label = label.label || this.label;
            this.counter += (label.by || 1);
        } else {
            this.counter += 1;
            this.label = label || this.label;
        }
        this.#updateUI();
    }

    close(label?: string) {
        if (label) {
            this.label = label;
        }
        this.counter = this.steps;
        this.#updateUI();
    }

    #updateUI() {
        if(!this.loader) {
            this.loader = document.createElement("div");
            this.loader.id = "loading";

            const loadingBar = document.createElement("div");
            loadingBar.id = "loading-bar";

            const context = document.createElement("label");
            context.id = "context";
            context.textContent = this.label;

            const progress = document.createElement("label");
            progress.id = "progress";

            loadingBar.appendChild(context);
            loadingBar.appendChild(progress);
            this.loader.appendChild(loadingBar);

            $("ol#notifications").prepend(this.loader);
        }

        const $loader = $(this.loader);
        if ($loader.length === 0) return;
        const pct = Math.clamp((100 * this.counter) / this.steps, 0, 100);
        $loader.find("#context").text(this.label);
        $loader.find("#loading-bar").css({ width: `${pct}%`, whiteSpace: "nowrap" });
        $loader.find("#progress").text(`${this.counter} / ${this.steps}`);
        $loader.css({ display: "block" });
        if (this.counter === this.steps && !$loader.is(":hidden")) {
            $loader.fadeOut(2000, () => $loader.remove());
        }
    }
}