import type { Document, DocumentMetadata } from "../abstract/module.d.ts";
import type { BaseActor, BaseCombat, BaseItem, BaseUser } from "./module.d.ts";
import type * as fields from "../data/fields.d.ts";

/**
 * The ActiveEffect document model.
 * @param data    Initial data from which to construct the document.
 * @param context Construction context options
 */
export default class BaseActiveEffect<TParent extends BaseActor | BaseItem<BaseActor | null> | null> extends Document<
    TParent,
    ActiveEffectSchema
> {
    /* -------------------------------------------- */
    /*  Model Configuration                         */
    /* -------------------------------------------- */

    static override get metadata(): ActiveEffectMetadata;

    static override defineSchema(): ActiveEffectSchema;

    /* -------------------------------------------- */
    /*  Model Methods                               */
    /* -------------------------------------------- */

    override canUserModify(user: BaseUser, action: UserAction, data?: object): boolean;

    override testUserPermission(
        user: BaseUser,
        permission: DocumentOwnershipString | DocumentOwnershipLevel,
        { exact }?: { exact?: boolean },
    ): boolean;

    /* -------------------------------------------- */
    /*  Database Event Handlers                     */
    /* -------------------------------------------- */

    protected override _preCreate(
        data: this["_source"],
        options: DocumentModificationContext<TParent>,
        user: BaseUser,
    ): Promise<boolean | void>;
}

export default interface BaseActiveEffect<TParent extends BaseActor | BaseItem<BaseActor | null> | null>
    extends Document<TParent, ActiveEffectSchema>,
    ModelPropsFromSchema<ActiveEffectSchema> {
    get documentName(): ActiveEffectMetadata["name"];
}

export interface ActiveEffectMetadata extends DocumentMetadata {
    name: "ActiveEffect";
    collection: "effects";
    label: "DOCUMENT.ActiveEffect";
    isEmbedded: true;
}

type ActiveEffectSchema<
    TType extends string = string,
    TSystemSource extends object = object
> = {
    _id: fields.DocumentIdField;
    /** An Actor subtype which configures the system data model applied */
    type: fields.StringField<TType, TType, true, false, false>;
    system: fields.TypeDataField<TSystemSource>;
    name: fields.StringField<string, string, true, false, false>;
    changes: fields.ArrayField<
        fields.SchemaField<{
            key: fields.StringField<string, string, true, false, false>;
            value: fields.StringField<string, string, true, false, false> | fields.NumberField<number, number, true, true, true>;
            priority: fields.NumberField;
        }>
    >;
    disabled: fields.BooleanField;
    start: fields.SchemaField<{
      combat: fields.StringField<string, string, true, true, true>;
      combatant: fields.StringField<string, string, true, true, true>;
      initiative: fields.NumberField<number, number, true, true, true>;
      round: fields.NumberField<number, number, true, true, true>;
      turn: fields.NumberField<number, number, true, true, true>;
      time: fields.NumberField<number, number, true, false, true>;
    }, SourceFromSchema<{
      combat: fields.StringField<string, string, true, true, true>;
      combatant: fields.StringField<string, string, true, true, true>;
      initiative: fields.NumberField<number, number, true, true, true>;
      round: fields.NumberField<number, number, true, true, true>;
      turn: fields.NumberField<number, number, true, true, true>;
      time: fields.NumberField<number, number, true, false, true>;
    }>, {
      combat: Combat | null;
      combatant: string | null;
      initiative: number | null;
      round: number | null;
      turn: number | null;
      time: number;
    }, false, true, false>;
    duration: fields.SchemaField<{
        units: fields.StringField<"years" | "months" | "days" | "hours" | "minutes" | "seconds" | "rounds" | "turns">
        value: fields.NumberField<number, number, true, true, true>;
        expiry: fields.StringField;
        expired: fields.BooleanField;

        // startTime: fields.NumberField<number, number, false, true, true>;
        // seconds: fields.NumberField;
        // combat: fields.ForeignDocumentField;
        // rounds: fields.NumberField;
        // turns: fields.NumberField;
        // startRound: fields.NumberField;
        // startTurn: fields.NumberField;
    }>;
    description: fields.HTMLField;
    icon: fields.FilePathField<ImageFilePath>;
    img: fields.FilePathField<ImageFilePath>;
    origin: fields.StringField<ActorUUID | ItemUUID, ActorUUID | ItemUUID, false, true, true>;
    tint: fields.ColorField;
    transfer: fields.BooleanField;
    statuses: fields.SetField<fields.StringField<string, string, true, false, false>>;
    flags: fields.ObjectField<DocumentFlags>;
    showIcon: fields.NumberField<0 | 1 | 2, 0 | 1 | 2, false, true, true>;
    _stats: fields.DocumentStatsField;
};

export type ActiveEffectSource<TType extends string = string, TSystemSource extends object = object> = SourceFromSchema<ActiveEffectSchema<TType, TSystemSource>>;

export type EffectChangeData = BaseActiveEffect<null>["changes"][number];
export type EffectDurationData = BaseActiveEffect<null>["duration"];
export type EffectStartData = BaseActiveEffect<null>["start"];
