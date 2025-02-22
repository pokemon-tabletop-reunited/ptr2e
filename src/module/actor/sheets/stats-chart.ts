import { ActorPTR2e, Attribute } from "@actor";
import { ActorSheetPTR2e } from "@actor";
import { CenterLabelsPlugin } from "@scripts/chart-plugins.ts";
import { Chart, ChartOptions } from "chart.js/auto";

export class StatsChart {
  sheet: ActorSheetPTR2e | foundry.applications.api.DocumentSheetV2<ActorPTR2e>;
  chart: Chart | undefined;
  _options: ChartOptions;
  id: string | undefined;
  cssclass: string;
  initialized: boolean;

  constructor(sheet: ActorSheetPTR2e | foundry.applications.api.DocumentSheetV2<ActorPTR2e>, options: Partial<ChartOptions> = {}, { id, cssclass }: { id?: string, cssclass: string } = { cssclass: "stats-chart" }) {
    this.sheet = sheet;
    this._options = options;
    this.id = id;
    this.cssclass = cssclass;
    this.initialized = false;
  }

  get canvas(): HTMLCanvasElement {
    return this.sheet.element.querySelector(`canvas.${this.cssclass}${this.id ? `#${this.id}` : ""}`) as HTMLCanvasElement
  }

  static get defaultOptions() {
    const isDarkTheme = document?.body?.classList?.contains("theme-dark");
    return {
      maintainAspectRatio: true,
      aspectRatio: 16 / 15,
      animation: {
        duration: 0
      },
      hover: {
        mode: null
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: isDarkTheme ? "#fff" : "#000",
          }
        },
        tooltip: {
          enabled: false
        }
      },
      elements: {
        point: {
          hoverRadius: 0,
          hitRadius: 0
        },
        line: {
          borderWidth: 0,
          tension: 0.05
        }
      },
      scales: {
        r: {
          grid: {
            color: isDarkTheme ? '#ffffff70' : '#00000070',
          },
          ticks: {
            display: false,
            maxTicksLimit: 7
          },
          pointLabels: {
            color: isDarkTheme ? '#fff' : '#000',
            font: {
              size: 13,
              weight: 'bold',
              family: 'monospace',
              lineHeight: 1.4
            }
          },
          beginAtZero: true
        }
      }
    };
  }

  get data() {
    const attributes = this.sheet.document.system.attributes;
    const highestStat = (() => {
      const max = Math.max(...Object.values(attributes).map((attr) => (attr as Attribute).value));
      return Math.ceil(max / 20) * 20;
    })();

    return {
      labels: [["HP", attributes.hp.value], ["ATK", attributes.atk.value], [attributes.def.value, "DEF"], [attributes.spe.value, "SPD"], [attributes.spd.value, "SP.DEF"], ["SP.ATK", attributes.spa.value]],
      datasets: [
        {
          label: "EVs",
          data: [
            Math.min(highestStat, attributes.hp.evs),
            Math.min(highestStat, attributes.atk.evs),
            Math.min(highestStat, attributes.def.evs),
            Math.min(highestStat, attributes.spe.evs),
            Math.min(highestStat, attributes.spd.evs),
            Math.min(highestStat, attributes.spa.evs)
          ],
          fill: true,
          backgroundColor: game.user?.color?.toString() + "bb",// || '#88c5fe40',
          datalabels: {
            display: false
          },
          pointStyle: false
        },
        {
          label: "Stats",
          data: [
            attributes.hp.value,
            attributes.atk.value,
            attributes.def.value,
            attributes.spe.value,
            attributes.spd.value,
            attributes.spa.value
          ],
          fill: true,
          //@ts-expect-error - Foundry types missing
          backgroundColor: game.user?.color?.linear.toString() + "bb",// || '#88c5febc',
          pointStyle: false,
        }
      ]
    }
  }

  get options() {
    return foundry.utils.mergeObject((this.constructor as typeof StatsChart).defaultOptions, this._options, { inplace: false });
  }

  render(): this {
    if (this.initialized) return this._rerender();

    if (!this.canvas) {
      console.error("No canvas found for stats chart");
      return this;
    }

    this.chart = new Chart(this.canvas, {
      plugins: [
        CenterLabelsPlugin
      ],
      type: "radar",
      options: this.options,
      data: this.data
    });
    this.initialized = true;
    return this;
  }

  _rerender(updateOnly = false) {
    if (!this.initialized) return this.render();
    if (updateOnly) {
      this.chart!.update();
      return this;
    }
    this.chart!.destroy();
    this.initialized = false;
    return this.render();
  }
}