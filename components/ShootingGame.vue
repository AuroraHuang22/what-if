<template>
  <div id="shooting-game" />
</template>

<script>
import { onMounted, onBeforeUnmount, ref } from "vue";
import nier from "~/assets/nier.png";
import space from "~/assets/space.png";
import robotoFont from "~/assets/Roboto-Bold.ttf";
export default {
  name: "ShootingGame",
  setup() {
    const p5Instance = ref(null);

    const sketch = (p) => {
      let mp, gp, stars;
      let font; // 用於存儲加載的字體
      let userX = 300,
        userY = 452,
        userHP = 3;
      let usermoveX = 0,
        usermoveY = 0;
      let laserX = userX,
        laserY = userY,
        laserMove = 0;
      let hpConditionX = userX,
        hpConditionY = laserY;
      let scores = 0;
      let gameStart = false;

      const RandomX = () => Math.floor(p.random(480));
      const RandomY = () => Math.floor(p.random(250));

      const enemeXlocation = Array.from({ length: 6 }, RandomX);
      const enemeYlocation = Array.from({ length: 6 }, RandomY);

      const resetGame = () => {
        userX = 300;
        userY = 452;
        userHP = 3;
        scores = 0;
        gameStart = false;
      };

      // 單一的 p.preload 定義
      p.preload = () => {
        // 加載字體文件
        font = p.loadFont(
          robotoFont,
          () => {
            console.log("Font loaded successfully");
          },
          () => {
            console.error("Failed to load font");
          }
        );
        // 加載圖片
        gp = p.loadImage(space);
        mp = mp = p.loadImage(nier);
        stars = p.loadImage(space);
      };

      // 單一的 p.setup 定義
      p.setup = () => {
        p.createCanvas(500, 550, p.WEBGL); // 創建畫布
        p.textFont(font);
        p.textSize(24); // 設置文字大小
        p.fill(255); // 設置文字顏色
        p.background(0); // 設置背景顏色
      };

      p.draw = () => {
        if (!gameStart) {
          gameMenu();
        } else {
          gamePlay();
        }
      };

      const gameMenu = () => {
        p.background(255);
        p.image(stars, -250, -275, 500, 550);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(30);
        p.fill(255);
        p.text("Shooting Game", 0, -50);
        p.textSize(15);
        p.fill(150);
        p.text("Press Down arrow to start", 0, 0);
        p.text("Use UP arrow to fire", 0, 50);
        p.text("Use LEFT and RIGHT arrows to avoid attacks", 0, 90);
        if (p.keyIsDown(p.DOWN_ARROW)) {
          gameStart = true;
        }
      };

      const gamePlay = () => {
        p.background(0);
        p.image(gp, -250, -275, 500, 550);

        p.fill(200, 200);
        p.image(mp, userX - 250, userY - 275, 35, 35);

        p.fill(255, 250, 205);
        p.rect(laserX - 250, laserY - 275, 3, 20); // Bullet

        p.fill(255, 227, 132);
        p.rect(hpConditionX - 250, hpConditionY - 237, 35, 5);

        userX += usermoveX;
        userY += usermoveY;
        hpConditionX += usermoveX;

        laserX = userX;
        laserY += laserMove;

        if (laserY < 0) {
          laserX = userX;
          laserY = userY;
          laserMove = 0;
        }

        if (userX > 500 || userX <= 0) {
          userX = 300;
          hpConditionX = userX;
          hpConditionX += usermoveX;
        }

        renderEnemies();
        updateGameStats();
      };

      const renderEnemies = () => {
        const size = 30;
        for (let i = 0; i < 6; i++) {
          p.fill(245, 222, 179);
          p.ellipse(
            enemeXlocation[i] - 250,
            enemeYlocation[i] - 275,
            size,
            size
          );
          enemeYlocation[i] += 1;

          // Check if bullet hits enemy
          if (
            laserY < enemeYlocation[i] + 30 &&
            laserY > enemeYlocation[i] &&
            laserX < enemeXlocation[i] + 30 &&
            laserX > enemeXlocation[i] - 30
          ) {
            enemeXlocation[i] = RandomX();
            enemeYlocation[i] = RandomY();
            scores += 1;
            userHP += 1;
          }

          // Check if enemy reaches bottom
          if (enemeYlocation[i] > 550) {
            enemeXlocation[i] = RandomX();
            enemeYlocation[i] = RandomY();
            userHP -= 1;
          }
        }
      };

      const updateGameStats = () => {
        p.textSize(18);
        p.fill(255);
        p.text(`Your score is: ${scores}`, -125, -250);
        p.text(`Your HP is: ${userHP}`, -125, -220);

        if (userHP <= 0) {
          gameOver();
        }
      };

      const gameOver = () => {
        p.background(0);
        p.fill(255, 0, 0);
        gameStart = false;
        p.textSize(60);
        p.text("GAME OVER", 0, -150);
        p.fill(255);
        p.textSize(40);
        p.text(`Your score was: ${scores}`, 0, 0);
        p.textSize(15);
        p.text("Press DOWN arrow to restart the game", 0, 50);

        if (p.keyIsDown(p.DOWN_ARROW)) {
          resetGame();
          gameStart = true;
        }
      };

      p.keyReleased = () => {
        usermoveX = 0;
        usermoveY = 0;
      };

      p.keyPressed = () => {
        if (p.keyCode === p.RIGHT_ARROW) {
          usermoveX = 5;
        } else if (p.keyCode === p.LEFT_ARROW) {
          usermoveX = -5;
        } else if (p.keyCode === p.UP_ARROW) {
          laserMove -= 50;
        }
      };
    };

    onMounted(() => {
      import("p5").then((p5) => {
        p5Instance.value = new p5.default(
          sketch,
          document.getElementById("shooting-game")
        );
      });
    });

    onBeforeUnmount(() => {
      if (p5Instance.value) {
        p5Instance.value.remove();
      }
    });

    return {};
  },
};
</script>

<style scoped>
#shooting-game {
  width: 500px;
  height: 550px;
  position: absolute;
  top: 50%;
  left: 50%; /* 確保不影響水平定位 */
  right: 40px;
  transform: translateY(-50%); /* 修正垂直位置 */
  z-index: 10;
  background: transparent;
}
</style>
