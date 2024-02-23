import { _Document } from "../../../common/abstract/document.js";
import { ApplicationV2 } from "../../../common/applications/api.js";
import { DataSchema } from "../../../common/data/fields.js";
import type { ClientBaseScene } from "./client-base-mixes.d.ts";

declare global {
    // Interfaces for ClientDocuments, given there is no common base with the generated intermediate classes
    interface ClientDocument extends foundry.abstract.Document {
        name?: string | null;

        /**
          * Return a reference to the parent Collection instance which contains this Document.
          */
        get collection(): Collection<this>;

        /**
         * A reference to the Compendium Collection which contains this Document, if any, otherwise undefined.
         */
        get compendium(): CompendiumCollection | undefined;

        /**
         * A boolean indicator for whether the current game User has ownership rights for this Document.
         * Different Document types may have more specialized rules for what constitutes ownership.
         */
        get isOwner(): boolean;

        /**
         * Test whether this Document is owned by any non-Gamemaster User.
         */
        get hasPlayerOwner(): boolean;

        /**
         * A boolean indicator for whether the current game User has exactly LIMITED visibility (and no greater).
         */
        get limited(): boolean;

        /**
         * Return a string which creates a dynamic link to this Document instance.
         */
        get link(): string;

        /**
         * Return the permission level that the current game User has over this Document.
         * See the CONST.DOCUMENT_OWNERSHIP_LEVELS object for an enumeration of these levels.
         * 
         * @example Get the permission level the current user has for a document
         * ```js
         * game.user.id; // "dkasjkkj23kjf"
         * actor.data.permission; // {default: 1, "dkasjkkj23kjf": 2};
         * actor.permission; // 2
         * ```
         */
        get permission(): DocumentOwnershipLevel;

        /**
         * Lazily obtain a FormApplication instance used to configure this Document, or null if no sheet is available.
         */
        get sheet(): FormApplication | ApplicationV2;

        /**
         * A boolean indicator for whether the current game User has at least limited visibility for this Document.
         * Different Document types may have more specialized rules for what determines visibility.
         * @type {boolean}
         * @memberof ClientDocumentMixin#
         */
        get visible(): boolean;
    }

    interface CanvasDocument extends ClientDocument {
        readonly parent: ClientBaseScene | null;
        hidden?: boolean;
    }
}
