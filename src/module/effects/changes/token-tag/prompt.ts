import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { TokenPTR2e } from "@module/canvas/token/object.ts";
import { Predicate } from "@system/predication/predication.ts";

class TagTokenPrompt {
  constructor(params: PromptParameters) {
    this.prompt = params.prompt ?? "PTR2E.UI.TokenTagPrompt.TargetToken";
    this.requirements = params.requirements;
  }

  async resolveTarget(): Promise<Maybe<TokenDocumentPTR2e>> {
    game.user.targets.clear();
    this.activateListeners();
    ui.notifications.info(this.prompt, {localize: true});

    return new Promise((resolve) => {
      this._resolve = resolve;
    })
  }

  activateListeners() {
    if(document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const hookParams: HookParamsTargetToken = [
      "targetToken",
      (_user, token, targeted) => {
        this._target = targeted && token instanceof TokenPTR2e ? token.document : null;
        this._resolve?.(this._target);
      }
    ]
    Hooks.once(...hookParams);

    const cancelHandler = this.cancelHandler(hookParams);
    document.addEventListener("keyup", cancelHandler);
    window.setTimeout(() => {
      Hooks.off(...hookParams);
      document.removeEventListener("keyup", cancelHandler);
      if(this._target === undefined) this._resolve?.(null);
    }, 15_000);
  }

  private cancelHandler(hookParams: HookParamsTargetToken): (event: KeyboardEvent) => void {
    const handler = (event: KeyboardEvent): void => {
      if(event.key !== "Escape") return;
      event.stopPropagation();
      ui.notifications.info("PTR2E.UI.TokenTagPrompt.Timeout", {localize: true});
      Hooks.off(...hookParams);
      document.removeEventListener("keyup", handler);
    }

    return handler;
  }
}

interface TagTokenPrompt {
  prompt: string;
  requirements: TargetRequirements | null;

  _target?: Maybe<TokenDocumentPTR2e>;
  _resolve?: (value: Maybe<TokenDocumentPTR2e>) => void;
}

interface PromptParameters {
  prompt: string | null;
  requirements: TargetRequirements | null;
}

interface TargetRequirements {
  label: string;
  predicate: Predicate;
}

export { TagTokenPrompt };