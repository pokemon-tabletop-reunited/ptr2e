import Clock, { ClockSchema } from "./clock.ts";

class ClockDatabase extends foundry.abstract.DataModel {
    static override defineSchema() {
        const fields = foundry.data.fields;
        return {
            clocks: new fields.ArrayField(new fields.EmbeddedDataField(Clock), {
                required: true,
                label: "PTR2E.FIELDS.clocks.label",
                hint: "PTR2E.FIELDS.clocks.hint",
            }),
        };
    }

    static get instance(): ClockDatabase {
        return game.settings.get("ptr2e", "clocks") as ClockDatabase;
    }
    
    static get clocks() {
        return this.instance.clocks;
    }

    static async update(data: ClockDatabase['_source'], refresh = true): Promise<ClockDatabase> {
        await game.settings.set("ptr2e", "clocks", data) as Promise<ClockDatabase>;

        if(refresh) {
            
        }

        return this.instance;
    }

    static async createClock(data: SourceFromSchema<ClockSchema>) {
        const instance = this.instance.toObject();
        instance.clocks.push(data);
        return this.update(instance);
    }

    async createClock(data: SourceFromSchema<ClockSchema>) {
        return ClockDatabase.createClock(data);
    }

    static async updateClock(id: string, data: SourceFromSchema<ClockSchema>) {
        const instance = this.instance.toObject();
        const index = instance.clocks.findIndex((clock) => clock.id === id);
        if (index === -1) return undefined;
        instance.clocks[index] = data;
        return this.update(instance);
    }

    async updateClock(id: string, data: SourceFromSchema<ClockSchema>) {
        return ClockDatabase.updateClock(id, data);
    }

    static async deleteClock(id: string) {
        const instance = this.instance.toObject();
        const index = instance.clocks.findIndex((clock) => clock.id === id);
        if (index === -1) return undefined;
        instance.clocks.splice(index, 1);
        return this.update(instance);
    }

    async deleteClock(id: string) {
        return ClockDatabase.deleteClock(id);
    }

    static override validateJoint(data: ClockDatabase['_source']) {
        const ids = new Set<string>();
        for (const clock of data.clocks) {
            if (ids.has(clock.id as string)) throw new Error("Clock IDs must be unique");
            ids.add(clock.id as string);
        }
    }
}

interface ClockDatabase {
    clocks: Clock[];

    _source: InstanceType<typeof foundry.abstract.DataModel>['_source'] & {
        clocks: SourceFromSchema<ClockSchema>[];
    };
}

export default ClockDatabase;
