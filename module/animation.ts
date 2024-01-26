import { Listener } from "./listener.js";
import { SmartInterval } from "./smartInterval.js";

export class FAnimation<Types extends string> {
  readonly interpolator: (t: number) => number;
  readonly totalTicks: number;
  private ticks: number = 0;
  readonly listener = new Listener<"animate" | "stop" | "tick", Partial<Record<Types, number>>>(); // animate internal, tick triggered externally
  private readonly interval = new SmartInterval(this.run.bind(this));
  
  private readonly vals = new Map<Types, [from: number, to: number]>();

  /**
   * @param time Length of time (ms) the animation will take
   * @param interpolator Takes in a number in the range [0,1]. The output should start at 0, and end on 1. Default is linear interpolation
   */
  constructor({
    time = 1000,
    tStep = 100,
    interpolator = ((t) => t)
  }: {
    time?: number,
    tStep?: number,
    interpolator?: (t: number) => number
  }) {
    this.interpolator = interpolator;
    this.totalTicks = time / tStep;

    this.interval.setInterval(tStep);
    
    this.listener.on("tick", this.run.bind(this));
  }

  setValMovement(val: Types, from: number, to: number) {
    this.vals.set(val, [from,to]);
  }

  setValStart(val: Types, from: number) {
    if (!this.vals.has(val)) this.vals.set(val, [from,0]); // default value is 0
    else this.vals.get(val)[0] = from;
  }

  setValEnd(val: Types, to: number) {
    if (!this.vals.has(val)) this.vals.set(val, [0, to]); // default value is 0
    else this.vals.get(val)[1] = to;
  }

  start() {
    if (this.ticks >= this.totalTicks) return; // animation over
    this.interval.play();
  }

  stop() {
    this.interval.pause();
  }

  private run() {
    if (this.ticks >= this.totalTicks) {
      if (this.ticks != this.totalTicks) this.sendAnimateGiven(1); // non-exact match // reached final 
      this.listener.trigger("stop", {});
      this.interval.pause(); // animation over
      return;
    }

    this.sendAnimateGiven(this.interpolator(this.ticks / this.totalTicks));
    this.ticks++;
  }

  private sendAnimateGiven(interpolated: number) {
    const vals: Partial<Record<Types, number>> = {};
    for (const [val, [start, end]] of this.vals.entries()) {
      vals[val] = start + (end-start)*interpolated;
    }

    this.listener.trigger("animate", vals);
  }
}
