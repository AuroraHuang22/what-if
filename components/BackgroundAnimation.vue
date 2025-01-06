<template>
  <div id="p5-background"/>
</template>

<script>
import p5 from "p5";

export default {
  name: "BackgroundAnimation",
  mounted() {
    this.p5Instance = new p5(this.sketch, document.getElementById("p5-background"));
  },
  beforeDestroy() {
    if (this.p5Instance) {
      this.p5Instance.remove();
    }
  },
  methods: {
    sketch(p) {
      let fps = 60;
      let w = 1024 * 2;
      let dott = [];
      let n = 1000;
      let mainC;
      let radiusofimpact;

      p.setup = () => {
        preDraw();
        p.frameRate(fps);
        mainC = 360 * f();
        radiusofimpact = 0.5 * (p.width + p.height) / 10;
        for (let i = 0; i < n; i++) dott.push(new dots());
        for (let i = 0; i < n; i++) {
          let a = dott[i];
          for (let j = 0; j < n; j++) {
            let b = dott[j];
            let dis = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
            if (
              dis < radiusofimpact ** 2 &&
              dis > ((p.width * 0.5 + p.height * 0.5) / 100) ** 2
            ) {
              let theta = p.atan2(b.y - a.y, b.x - a.x);
              let r = b.power / a.power;
              a.speedx += r * p.cos(theta);
              a.speedy += r * p.sin(theta);
            }
          }
        }
        p.background(3);
      };

      p.draw = () => {
        p.background(3, 0.1);
        for (let d of dott) {
          d.show();
          d.move();
          d.calc();
        }
      };

      class dots {
        constructor() {
          this.x = p.width * f();
          this.y = p.height * f();
          this.power = f();
          this.speedx = 0;
          this.speedy = 0;
          this.c = p.map(this.power, 0, 1, (mainC + 180) % 360, mainC);
        }
        show() {
          p.stroke(this.c, 80, 80);
          p.strokeWeight(5 * this.power);
          p.point(this.x, this.y);
        }
        move() {
          this.x += this.speedx;
          this.y += this.speedy;
          let k = 0.93;
          this.speedx *= k;
          this.speedy *= k;
        }
        calc() {
          for (let j = 0; j < n; j++) {
            let b = dott[j];
            let dis = (this.x - b.x) ** 2 + (this.y - b.y) ** 2;
            if (
              dis < radiusofimpact ** 2 &&
              dis > ((p.width * 0.5 + p.height * 0.5) / 100) ** 2
            ) {
              let theta = p.atan2(b.y - this.y, b.x - this.x);
              let r = b.power / this.power;
              this.speedx += r * p.cos(theta);
              this.speedy += r * p.sin(theta);
            }
          }
        }
      }

      function f() {
        return p.random();
      }

      function preDraw() {
        let seed = p.floor(999999 * f());
        p.randomSeed(seed);
        p.noiseSeed(seed);
        let w = p.min(p.windowWidth, p.windowHeight);
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.rectMode(p.CENTER);
        p.pixelDensity(1);
        p.colorMode(p.HSB);
      }
    },
  },
};
</script>

<style scoped>
#p5-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1; /* 確保背景在其他元素下層 */
}
</style>
