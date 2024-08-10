import { ActorPTR2e, EffectRollSource } from "@actor";
import { ScenePTR2e } from "@module/canvas/scene.ts";
import { TokenDocumentPTR2e } from "@module/canvas/token/document.ts";
import { CheckRollContext } from "@system/rolls/data.ts";
import TypeDataModel from "types/foundry/common/abstract/type-data.js";
import { AttackRollResult, CheckRoll, PokeballRollResults } from "../system/rolls/check-roll.ts";
import AttackMessageSystem from "./models/attack.ts";
import * as R from "remeda";

class ChatMessagePTR2e<TSchema extends TypeDataModel = TypeDataModel> extends ChatMessage<TSchema> {
  /** Get the actor associated with this chat message */
  get actor(): ActorPTR2e | null {
    return ChatMessagePTR2e.getSpeakerActor(this.speaker) as ActorPTR2e | null;
  }

  /** Get the token of the speaker if possible */
  get token(): TokenDocumentPTR2e<ScenePTR2e> | null {
    if (!game.scenes) return null; // In case we're in the middle of game setup
    const sceneId = this.speaker.scene ?? "";
    const tokenId = this.speaker.token ?? "";
    return (
      (game.scenes.get(sceneId)?.tokens.get(tokenId) as TokenDocumentPTR2e<ScenePTR2e>) ??
      null
    );
  }

  override prepareDerivedData(): void {
    const rolls = this._source.rolls.map((r) => JSON.parse(r));
    let updated = false;
    for (const roll of rolls) {
      if (
        !roll.class ||
        ["CheckRoll", "CaptureRoll", "DamageRoll", "AttackRoll", "InitiativeRoll"].includes(
          roll.class
        )
      ) {
        roll.class = "Roll";
        updated = true;
      }
    }
    if (updated) {
      // this._source.rolls = rolls.map(r => JSON.stringify(r));
      this.updateSource({ rolls: rolls.map((r) => JSON.stringify(r)) });
    }
    return super.prepareDerivedData();
  }

  /**
   * @inheritdoc
   * @remarks
   * This is a custom override of the `getHTML` method, which is used to render the chat message.
   * The override is purely to replace the basic `this.content` call with a call to `this.system.getHTMLContent` if it exists.
   * If a foundry update changes the `getHTML` method, this override will need to be updated to match.
   */
  override async getHTML(): Promise<JQuery<HTMLElement>> {
    const content =
      "getHTMLContent" in this.system && typeof this.system.getHTMLContent === "function"
        ? ((await this.system.getHTMLContent(this.content)) as string)
        : this.content;

    // Determine some metadata
    const data = this.toObject(false);
    data.content = await TextEditor.enrichHTML(content, {
      rollData: this.getRollData() as Record<string, unknown>,
    });
    const isWhisper = this.whisper.length;

    // Construct message data
    const messageData = {
      message: data,
      user: game.user,
      author: this.author as User,
      alias: this.alias,
      cssClass: [
        this.style === CONST.CHAT_MESSAGE_STYLES.IC ? "ic" : null,
        this.style === CONST.CHAT_MESSAGE_STYLES.EMOTE ? "emote" : null,
        isWhisper ? "whisper" : null,
        this.blind ? "blind" : null,
        this.type,
      ].filterJoin(" "),
      isWhisper: this.whisper.length,
      canDelete: game.user.isGM, // Only GM users are allowed to have the trash-bin icon in the chat log itself
      whisperTo: this.whisper
        .map((u) => {
          const user = game.users.get(u);
          return user ? user.name : null;
        })
        .filterJoin(", "),
    } as ChatMessageRenderData;

    // Render message data specifically for ROLL type messages
    if (this.isRoll) await this._renderRollContent(messageData);

    // Define a border color
    if (this.style === CONST.CHAT_MESSAGE_STYLES.OOC)
      messageData.borderColor = (this.author?.color as Color).css;

    // Render the chat message
    const template = await renderTemplate(CONFIG.ChatMessage.template, messageData);
    const html = $(template);

    // Set the message header color
    html.css("--user-color", `var(--user-color-${this.author.id})`);
    html.css("border-color", `var(--user-color-${this.author.id})`);

    // Flag expanded state of dice rolls
    if (this._rollExpanded) html.find(".dice-tooltip").addClass("expanded");
    Hooks.call("renderChatMessage", this, html, messageData);

    // Add custom listeners
    this.activateListeners(html);

    // Return the rendered HTML
    return html;
  }

  activateListeners(html: JQuery<HTMLElement>) {
    if (
      "activateListeners" in this.system &&
      this.system &&
      typeof this.system.activateListeners === "function"
    )
      this.system.activateListeners(html);

    html.find(".dice-roll").on("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const roll = event.currentTarget;
      const expanded = !roll.classList.contains("opened");

      const tooltips = roll.querySelectorAll(".dice-tooltip");
      for (const tip of tooltips) {
        if (expanded) $(tip).slideDown(200);
        else $(tip).slideUp(200);
        tip.classList.toggle("expanded", expanded);
      }

      roll.classList.toggle("opened", expanded);
    });

    html.find(".collapse-rolls").each((_i, el) => {
      $(el).on("click", (event) => {
        event.preventDefault();

        const expanded = !el.classList.contains("expanded");
        const content = el.parentElement?.nextElementSibling as HTMLElement;
        if (!content) return;
        if (expanded) {
          el.innerHTML = el.innerHTML.replace("Show", "Hide");
          $(content).slideDown({
            duration: 200,
            start: () => $(content).css("display", "flex"),
          });
        } else {
          el.innerHTML = el.innerHTML.replace("Hide", "Show");
          $(content).slideUp(200);
        }

        el.classList.toggle("expanded", expanded);

        const messageElement = $(el).closest(".message")[0];
        const message = game.messages.get(messageElement.dataset.messageId as string);
        if (!message) return;

        if (game.messages.contents.at(-1)?.id === message.id) {
          setTimeout(
            () =>
              messageElement.scrollIntoView({
                behavior: "smooth",
                block: "end",
                inline: "nearest",
              }),
            360
          );
        }
      });

      if (el.classList.contains("expanded")) {
        const content = el.parentElement?.nextElementSibling as HTMLElement;
        if (!content) return;

        $(content).css("display", "flex");
      }

      if (el.dataset.uuid) {
        let highlights: Token[] = [];
        el.addEventListener("mouseover", async (event) => {
          event.preventDefault();
          if (!canvas.ready) return;

          const actor = (await fromUuid(el.dataset.uuid)) as ActorPTR2e;
          if (!actor) return;

          const tokens = actor.getActiveTokens(false);
          if (!tokens?.length) return;

          if (tokens.every((t) => t.isVisible)) {
            //@ts-expect-error ignore protected clause.
            tokens.forEach((t) => t._onHoverIn(event));
            highlights = tokens;
          }
        });

        el.addEventListener("mouseout", async (event) => {
          event.preventDefault();
          if (!canvas.ready) return;

          if (!highlights.length) return;

          //@ts-expect-error ignore protected clause.
          highlights.forEach((t) => t._onHoverOut(event));
          highlights = [];
        });
      }
    });
  }

  static async expandCollapsible(element: HTMLElement): Promise<void> {
    if (element.classList.contains("expanded")) return;

    //
  }

  static async createFromRoll<TTypeDataModel extends TypeDataModel = TypeDataModel>(
    context: CheckRollContext & { notesList?: HTMLUListElement | null },
    roll: Rolled<CheckRoll>
  ): Promise<ChatMessagePTR2e<TTypeDataModel> | undefined> {
    let type = (() => {
      switch (context.type ?? roll.data.type) {
        case "check":
          return "check";
        case "attack-roll":
          return "attack";
        case "skill-check":
          return "skill";
        case "luck-check":
          return "luck";
      }
      return "base";
    })();
    const rollJson = roll.toJSON();
    rollJson.data = roll.data;
    const system: Record<string, unknown> = {
      roll: rollJson,
      origin: context.actor?.toJSON(),
      slug: context.action ?? context.title ?? type,
      luckRoll: null,
    };
    const rolls = [rollJson];

    if (type === "luck") {
      const luckRoll = await (async () => {
        if (
          "luckRoll" in context &&
          context.luckRoll &&
          context.luckRoll instanceof CheckRoll
        )
          return context.luckRoll;
        return await CheckRoll.createFromData({ type: "luck-roll" })!.roll();
      })();
      const luckRollJson = luckRoll.toJSON();
      luckRollJson.data = luckRoll.data;
      system.luckRoll = luckRollJson;
      rolls.push(luckRollJson);
      type = "skill";
    }

    if(type == "skill") {
      system.result = {
        modifiers: context.modifiers,
        ...R.pick(context, ["action", "domains", "notes", "title", "type"]),
        options: Array.from(context.options ?? [])
      }
    }

    const speaker = ChatMessagePTR2e.getSpeaker({
      actor: context.actor!,
      token: context.token!,
    });
    const flavor = context.notesList ? context.notesList.innerHTML : context.title ?? "";

    //@ts-expect-error - Chatmessages aren't typed properly yet
    return ChatMessagePTR2e.create<ChatMessagePTR2e<TTypeDataModel>>({
      type,
      speaker,
      flavor,
      system,
    });
  }

  static createFromPokeballResults<TTypeDataModel extends TypeDataModel = TypeDataModel>(
    context: CheckRollContext,
    results: PokeballRollResults
  ): Promise<ChatMessagePTR2e<TTypeDataModel> | undefined> {
    const type = "capture";

    const system = {
      rolls: {
        accuracy: results.rolls.accuracy?.toJSON() ?? null,
        crit: results.rolls.crit?.toJSON() ?? null,
        shake1: results.rolls.shake1?.toJSON() ?? null,
        shake2: results.rolls.shake2?.toJSON() ?? null,
        shake3: results.rolls.shake3?.toJSON() ?? null,
        shake4: results.rolls.shake4?.toJSON() ?? null,
      },
      origin: context.actor?.toJSON(),
      slug: context.action ?? context.title ?? type,
      target: context.target?.actor.uuid ?? null,
      result: {
        modifiers: results.context.modifiers,
        ...R.pick(results.context, ["action", "domains", "notes", "title", "type"]),
        options: Array.from(results.context.options ?? [])
      }
    };
    // const rolls = Object.values(system.rolls).filter((r) => r); 

    const speaker = ChatMessagePTR2e.getSpeaker({
      actor: context.actor!,
      token: context.token!,
    });
    const flavor = context.title ?? "";

    //@ts-expect-error - Chatmessages aren't typed properly yet
    return ChatMessagePTR2e.create<ChatMessagePTR2e<TTypeDataModel>>({
      type,
      speaker,
      flavor,
      system,
    });
  }

  static async createFromResults(
    context: CheckRollContext & { notesList?: HTMLUListElement | null },
    results: AttackRollResult[],
    dataOnly: true
  ): Promise<DeepPartial<ChatMessagePTR2e<AttackMessageSystem>> | undefined>;
  static async createFromResults(
    context: CheckRollContext & { notesList?: HTMLUListElement | null },
    results: AttackRollResult[],
    dataOnly?: false
  ): Promise<ChatMessagePTR2e<AttackMessageSystem> | undefined>;
  static async createFromResults(
    context: CheckRollContext & { notesList?: HTMLUListElement | null },
    results: AttackRollResult[],
    dataOnly = false
  ): Promise<
    | ChatMessagePTR2e<AttackMessageSystem>
    | DeepPartial<ChatMessagePTR2e<AttackMessageSystem>>
    | undefined
  > {
    if (!context.action) return;
    if (!context.actor) return;

    const speaker = ChatMessagePTR2e.getSpeaker({
      actor: context.actor!,
      token: context.token!,
    });
    const flavor = context.notesList ? context.notesList.innerHTML : context.title ?? "";

    const system: {
      pp: {
        spent: boolean;
        cost: number;
      };
      attackSlug: string;
      origin: Record<string, unknown>;
      results: Record<string, unknown>[];
      selfEffects: {
        applied: boolean;
        rolls: EffectRollSource[];
      } | null;
    } = {
      pp: {
        spent: !!context.consumePP,
        cost: context.ppCost ?? 0,
      },
      attackSlug: context.action,
      origin: (() => {
        const json: Record<string, unknown> = context.actor!.toJSON();
        json.uuid = context.token?.actor?.uuid ?? context.actor.uuid;
        return json;
      })(),
      results: results.map((r) => ({
        target: (() => {
          const json: Record<string, unknown> = r.context.target!.actor.toJSON();
          json.uuid =
            r.context.target!.token?.actor?.uuid ?? r.context.target!.actor.uuid;
          return json;
        })(),
        accuracy: r.rolls.accuracy?.toJSON() ?? null,
        crit: r.rolls.crit?.toJSON() ?? null,
        damage: r.rolls.damage?.toJSON() ?? null,
        context: {
          check: r.check,
          ...R.pick(r.context, ["action", "domains", "notes", "title", "type"]),
          options: Array.from(r.context.options ?? [])
        },
        effectRolls: r.context.effectRolls ?? null
      })),
      selfEffects: context.selfEffectRolls?.length ? {
        applied: true,
        rolls: await Promise.all(context.selfEffectRolls.map(async (r) => ({
          chance: r.chance,
          effect: r.effect,
          label: r.label,
          roll: r.roll ? r.roll.toJSON() : (await new Roll("1d100ms@dc", {dc: r.chance}).roll()).toJSON(),
        })))
      } : null
    };

    // @ts-expect-error - Chatmessages aren't typed properly yet
    return dataOnly
      ? {
        type: "attack",
        speaker,
        flavor,
        system,
      } // @ts-expect-error - Chatmessages aren't typed properly yet
      : ChatMessagePTR2e.create<ChatMessagePTR2e<AttackMessageSystem>>({
        type: "attack",
        speaker,
        flavor,
        system,
      });
  }
}

interface ChatMessagePTR2e<TSchema extends TypeDataModel = TypeDataModel> {
  type: string;
  system: TSchema;
}

export default ChatMessagePTR2e;
