import BezierEasing from "./math/bezier-easing.js";

export default class MyAnimation {
    constructor(duration = 500, bezier = { x1: 0, y1: 0, x2: 0, y2: 0 }) {
        this.duration = duration;
        this.timingFunction = new BezierEasing(bezier.x1, bezier.y1, bezier.x2, bezier.y2)
        this.figures = [];
    }

    add(figure, propName, start = 0, end = 1) {
        let d = end - start;
        if (d == 0) return;
        this.figures.push({
            'figure': figure,
            'prop': propName,
            'start': start,
            'end': end,
            'delta': d
        });
    }

    forward(trigger) {
        if (this.running) return;
        let refNum = Math.floor(this.duration / 16.6);
        this._run(trigger, refNum);
    }

    reverse(trigger) {
        if (this.running) return;
        let refNum = Math.floor(this.duration / 16.6);
        this._run(trigger, refNum, 0, true);
    }

    _run(trigger, totalRef, current = 0, reverse = false) {
        let progress = current / totalRef;
        let value = this.timingFunction.easing(progress);
        this.figures.forEach((obj) => {
            if (obj.delta == 0) return;
            let f = obj.figure;
            let pro = obj.prop;
            if (!reverse) {
                f[pro] = obj.delta * value + obj.start;
            } else {
                f[pro] = obj.end - obj.delta * value;
            }
        });
        current++;
        if (trigger) trigger(value);
        if (current > totalRef) {
            this.running = false;
            return;
        }
        requestAnimationFrame(() => {
            this._run(trigger, totalRef, current, reverse); ''
        });
    }
}