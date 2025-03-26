export default class ClockPanel extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  // eslint-disable-next-line @typescript-eslint/unbound-method, @typescript-eslint/no-deprecated
  public refresh = foundry.utils.debounce(this.render, 100);
}