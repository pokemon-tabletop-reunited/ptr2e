import type { ActorPTR2e } from "@actor";
import { ChangeModel } from "@data";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { UUIDUtils } from "src/util/uuid.ts";
import { TagTokenPrompt } from "./prompt.ts";

export default class TokenTagChangeSystem extends ChangeModel {
  static override TYPE = "token-tag";

  override async preCreate({ changeSource, effectSource, pendingItems }: ChangeModel.PreCreateParams): Promise<void> {
    if (this.ignored) return;
    if (!this.actor) return;

    this.value &&= this.resolveInjectedProperties(this.value);

    if (this.actor.getActiveTokens().length === 0) {
      this.ignored = changeSource.ignored = true;
      return;
    }

    const token =
      fromUuidSync(this.value ?? "")
      ?? (game.user.targets.size === 1
        ? Array.from(game.user.targets)[0].document
        : await new TagTokenPrompt({ prompt: null, requirements: null }).resolveTarget());

    if (!(token instanceof TokenDocumentPTR2e)) {
      // No token was targeted: abort creating item
      pendingItems.splice(pendingItems.findIndex(i => i.effects.find(e => e === effectSource)), 1);
      return;
    }

    if(!(changeSource.key === this.key)) throw new Error(`TokenTagChangeSystem expected changeSource.slug to be ${this.key} but got ${changeSource.key}`);
    this.value = changeSource.value = token.uuid;
  }

  override apply(actor: ActorPTR2e): void {
    this.beforePrepareData(actor);
  }

  override beforePrepareData(actor: ActorPTR2e | null = this.actor,): void {
    if (!actor) return;
    if (UUIDUtils.isTokenUUID(this.value) && this.test()) {
      this.actor?.synthetics.tokenTags.set(this.value, this.key);
    }
  }
}

export default interface TokenAlterationChangeSystem {
  value: string;
}
