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
  notification: number | null = null;

  constructor({ steps = 1 }: { steps?: number, label?: string } = {}) {
    this.steps = steps;
    this.counter = -1;
    this.label = "";
  }

  advance(label?: string | { by?: number; label?: string }) {
    if (this.counter === this.steps) return;
    if (typeof label === "object") {
      this.label = label.label || this.label;
      this.counter += (label.by || 1);
    } else {
      this.counter += 1;
      this.label = label || this.label;
    }
    if (this.notification) {
      ui.notifications.update(this.notification, {
        pct: this.counter / this.steps,
        message: this.label,
      });
    }
    else {
      this.notification = ui.notifications.notify(this.label, "info", {
        progress: true,
        escape: false,
        clean: false,
        localize: true
      });
    }
  }

  close(label?: string) {
    if (!this.notification) return;
    ui.notifications.update(this.notification, {
      pct: 1,
      message: label || this.label,
    });
  }
}