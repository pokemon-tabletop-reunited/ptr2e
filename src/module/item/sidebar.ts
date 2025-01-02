export default class ItemDirectoryPTR2e extends ItemDirectory {
  protected override _onDrop(event: DragEvent): void {
    const data = TextEditor.getDragEventData(event) as unknown as Record<string, unknown>
    if (!data?.type) return;
    
    if (data.type === "ActiveEffect") {
      const target = (event.target as HTMLElement)?.closest(".directory-item") || null;
      this._handleDroppedEntry(target as HTMLElement, data);
      return;
    }
    return super._onDrop(event);
  }

  protected override _createDroppedEntry(entry: Item.ConfiguredInstance, folderId?: string | undefined): Promise<Item.ConfiguredInstance> {
    const data = entry.toObject();
    data.folder = folderId || null;
    const options = { keepId: false };
    if (data._id) {
      const statusEffect = CONFIG.statusEffects.find(effect => effect._id === data._id);
      if (statusEffect) options.keepId = true;
    }
    return entry.constructor.create(data, options);
  }
}