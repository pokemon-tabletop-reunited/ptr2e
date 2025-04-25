export const CHANGE_MODES = Object.freeze({
  CUSTOM: 0,
  MULTIPLY: 1,
  ADD: 2,
  DOWNGRADE: 3,
  UPGRADE: 4,
  OVERRIDE: 5,
  REMOVE: 6
})

const changeModelSchema = {

}

declare namespace ChangeModel {
  type Schema = typeof changeModelSchema;
};

class ChangeModel<TSchema extends ChangeModel.Schema = ChangeModel.Schema> extends foundry.abstract.DataModel<TSchema/*, ActiveEffectSystem*/> {
  static TYPE = "";

  static override defineSchema(): ChangeModel.Schema {
    return changeModelSchema;
  }

  public apply(_: Actor.Implementation, __?: string[] | Set<string>): unknown {
    throw new Error("The apply method must be implemented by the subclass");
  }
} 

export default ChangeModel;