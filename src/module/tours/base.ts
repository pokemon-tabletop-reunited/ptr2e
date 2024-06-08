//@ts-nocheck
export class PTRTour extends Tour {
    protected override async _postStep(): Promise<void> {
        if ( this.currentStep && !this.currentStep.selector ) this.targetElement?.remove();
        else game.tooltip.deactivate(true);
        if ( this.fadeElement ) {
            this.fadeElement.remove();
            this.fadeElement = undefined;
        }
        if ( this.overlayElement ) this.overlayElement = this.overlayElement.remove();
    }
}