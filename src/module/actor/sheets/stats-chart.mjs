import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";

export class StatsChart {
    constructor(sheet, options = {}, { id, cssclass } = { cssclass: "stats-chart" }) {
        this.sheet = sheet;
        this._options = options;
        this.id = id;
        this.cssclass = cssclass;
        this.initialized = false;
    }

    get canvas() {
        return this.sheet.element.find(`canvas.${this.cssclass}${this.id ? `#${this.id}` : ""}`);
    }

    static get defaultOptions() {
        return {
            hover: {
                mode: null
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: "#fff"
                    }
                },
                tooltip: {
                    enabled: false
                },
                datalabels: {
                    formatter: function (value, context) {
                        return context.chart.data.labels[context.value];
                    },
                    anchor: 'end',
                    clamp: false,
                    align: 'end',
                    offset: 0,
                    color: 'white'
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
                        color: '#ffffff70'
                    },
                    ticks: {
                        display: false
                    },
                    pointLabels: {
                        color: '#fff'
                    }
                }
            }
        };
    }

    get data() {
        // Sample data
        return {
            labels: ["HP", "ATK", "DEF", "SPD", "SP.DEF", "SP.ATK"],
            datasets: [
                {
                    label: "EVs",
                    data: [20, 60, 25, 60, 15, 55],
                    fill: true,
                    backgroundColor: '#88c5fe40',
                    datalabels: {
                        display: false
                    },
                    pointStyle: false
                },
                {
                    label: "Stats",
                    data: [12, 30, 22, 30, 6, 25],
                    fill: true,
                    backgroundColor: '#88c5febc',
                    pointStyle: false
                }
            ]
        }
    }

    get options() {
        return foundry.utils.mergeObject(this.constructor.defaultOptions, this._options, { inplace: false });
    }

    render() {
        if (this.initialized) return this._rerender();

        if (this.canvas.length === 0) return console.error("No canvas found for stats chart");

        this.chart = new Chart(this.canvas, {
            plugins: [ChartDataLabels],
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
            this.chart.update();
            return this;
        }
        this.chart.destroy();
        this.initialized = false;
        return this.render();
    }
}