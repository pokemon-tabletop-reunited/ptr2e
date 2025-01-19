/**
 * A game settings configuration application
 * This form renders the settings defined via the game.settings.register API which have config = true
 *
 */
declare class SettingsConfig extends FormApplication {
  // @TODO: Declare

  protected override _updateObject(event: Event, formData: {}): Promise<void>;

  /**
   * Confirm if the user wishes to reload the application.
   * @param {object} [options]               Additional options to configure the prompt.
   * @param {boolean} [options.world=false]  Whether to reload all connected clients as well.
   * @returns {Promise<void>}
   */
  static reloadConfirm({ world }?: { world?: boolean }): Promise<void>;
}
