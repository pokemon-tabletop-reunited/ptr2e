/* eslint-disable @typescript-eslint/no-unused-vars */
//@ts-nocheck

import { Chart, ChartOptions, RadialLinearScale } from "chart.js/auto";
import { HALF_PI, PI, _longestText, _normalizeAngle, isArray, toDegrees, toFont } from "chart.js/helpers";
import ChartDataLabels from "chartjs-plugin-datalabels";

export const CenterLabelsPlugin = {
    id: 'centerLabels',
    beforeRender: (chart: Chart) => {
        function measureLabelSize(ctx, font, label) {
            label = isArray(label) ? label : [label];
            return {
                w: _longestText(ctx, font.string, label),
                h: label.length * font.lineHeight
            };
        }

        function getTextAlignForAngle(angle) {
            return 'center';
            if (angle === 0 || angle === 180) {
                return 'center';
            } else if (angle < 180) {
                return 'left';
            }

            return 'right';
        }

        function leftForTextAlign(x, w, align) {
            if (align === 'right') {
                x -= w;
            } else if (align === 'center') {
                x -= w;
                // x -= (w / 2);
            }
            return x;
        }

        function yForAngle(y, h, angle) {
            if (angle === 90 || angle === 270) {
                y -= (h / 2);
            } else if (angle > 270 || angle < 90) {
                y -= (h / 2);
                // y -= h;
            } else {
                y -= (h / 2);
            }
            return y;
        }

        const scale: RadialLinearScale = chart.scales.r;
        const items = scale._pointLabelItems;
        const valueCount = items.length;
        const opts = scale.options;
        const pointLabelOpts = scale.options.pointLabels;
        const extra = 15;
        const outerDistance = scale.drawingArea;
        const additionalAngle = opts.pointLabels.centerPointLabels ? PI / valueCount : 0;

        const labelSizes = [];
        const padding = [];

        for (let i = 0; i < valueCount; i++) {
            const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
            padding[i] = opts.padding;
            const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
            const plFont = toFont(opts.font);
            const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
            labelSizes[i] = textSize;
        }

        for (let i = 0; i < valueCount; i++) {
            const pointLabelPosition = scale.getPointPosition(i, outerDistance + extra + padding[i], additionalAngle)
            const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
            const size = labelSizes[i];
            const y = yForAngle(pointLabelPosition.y, size.h, angle);
            const textAlign = getTextAlignForAngle(angle);
            const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);

            items[i].x = pointLabelPosition.x;
            items[i].y = y;
            items[i].textAlign = textAlign;
            items[i].left = left;
            items[i].top = y;
            items[i].right = left + size.w;
            items[i].bottom = y + size.h;
        }
    }
}