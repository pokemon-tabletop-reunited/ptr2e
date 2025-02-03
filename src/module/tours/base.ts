declare global {
  interface NumberConstructor {
    between(num: number, min: number, max: number, inclusive?: boolean): boolean;
  }

  interface TourStep {
    sidebarTab?: string;
    click?: boolean;
    app?: {
      tab: string;
      group?: string;
    }[]
  }
}

export class PTRTour extends Tour {
  override exit(): void {
    super.exit();
    this._tearDown();
  }

  override async complete() {
    await super.complete();
    this._tearDown(true);
  }

  /**
   * Clean up after the tour. Runs on exit or completion. This is never awaited.
   * @param _complete - True if exiting due to completion, false if exiting early
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Unused param & empty function is intentional.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async _tearDown(complete?: boolean): Promise<void> {
    if (this.app) await this.app.close();
  }

  /**
   * Get the application instance for the current step, if applicable
   * Subclasses should override this to return the relevant application instance
   */
  protected get app(): Application | foundry.applications.api.ApplicationV2 | undefined {
    return undefined;
  }

  protected override async _preStep(): Promise<void> {
    await super._preStep();
    if (this.currentStep?.sidebarTab) {
      ui.sidebar?.expand();
      ui.sidebar?.activateTab(this.currentStep.sidebarTab);
    }
    if (this.currentStep?.app?.length && this.app) {
      if (this.app instanceof Application) {
        //@ts-expect-error - Ignore the fact that the property is protected
        await this.app._render(true);
        if(this.currentStep.app[0].tab) this.app.activateTab(this.currentStep.app[0].tab);
      } else {
        await this.app.render(true);
        for (const step of this.currentStep.app) {
          if (!step.tab || !step.group) continue;
          this.app.changeTab(step.tab, step.group);
        }
      }
    }
  }

  protected override async _postStep(): Promise<void> {
    await super._postStep();
    if (this.currentStep?.click) {
      document.querySelector<HTMLElement>(this.currentStep.selector!)?.click();
    }

    if (this.currentStep && !this.currentStep.selector) this.targetElement?.remove();
    else game.tooltip.deactivate(true);
    if (this.fadeElement) {
      this.fadeElement.remove();
      this.fadeElement = undefined;
    }
    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = undefined;
    }
  }

  override async progress(stepIndex: number): Promise<void> {
    // Ensure we are provided a valid tour step
    if (!Number.between(stepIndex, -1, this.steps.length)) {
      throw new Error(`Step index ${stepIndex} is not valid for Tour ${this.id} with ${this.steps.length} steps.`);
    }

    // Ensure that only one Tour is active at a given time
    if (Tour.activeTour && (Tour.activeTour !== this)) {
      if ((stepIndex !== -1) && (stepIndex !== this.steps.length)) throw new Error(`You cannot begin the ${this.title} Tour because the `
        + `${Tour.activeTour.title} Tour is already in progress`);
    }

    if (stepIndex === 0 && this.currentStep) {
      await this._postStep();
      console.debug(`Tour [${this.namespace}.${this.id}] | Completed step 1 of ${this.steps.length}`);
    }

    return super.progress(stepIndex);
  }
}