import * as d3 from 'd3';

export const lineTransition = (path, transitionTime) => {
    path.transition()
        .duration(transitionTime)
        .attrTween("stroke-dasharray", tweenDash);
};

export function tweenDash() {
    const l = this.getTotalLength();
    const i = d3.interpolateString("0," + l, l + "," + l);
    return function (t) { return i(t); };
}