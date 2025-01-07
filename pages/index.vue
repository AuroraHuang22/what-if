<template>
  <div class="flex justify-between max-h-screen overflow-y-hidden">
    <client-only>
      <BackgroundAnimation />
    </client-only>
    <UCard
      v-if="!flipbookImages.length > 0"
      class="w-1/3 p-6 m-4 bg-black bg-opacity-45 !ring-0 h-full text-white"
      :ui="{
        divide: 'divide-transparent',
      }"
    >
      <template #header>
        <h1 class="text-[48px] font-bold">What if?</h1>
      </template>
      <UForm :state="{ key: 'value' }">
        <p v-text="`請輸入 E-616 的主體代號`" />
        <UInput
          :padded="false"
          v-model="name"
          variant="none"
          placeholder="你的名字..."
          class="mb-[60px]"
        />

        <p v-text="`無論在哪個宇宙都不變的特質是什麼`" />
        <UInput
          v-model="traits"
          :padded="false"
          variant="none"
          class="mb-[60px]"
          placeholder="你的靈魂特質..."
        />

        <!-- <UButton
          :disabled="loading"
          class="mt-4 bg-blue-500"
          @click="handleClickGenerateStory"
        >
          <span v-if="loading">Generating...</span>
          <span v-else>Let’s Open the Portal</span>
        </UButton> -->

        <UButton
          label="Button"
          :disabled="loading"
          class="bg-[#F7715B]"
          @click="handleClickGenerateStory"
        >
          <template #trailing>
            <UIcon name="i-heroicons-arrow-right-20-solid" class="w-5 h-5" />
          </template>
          <span v-if="loading">Generating...</span>
          <span v-else>Let’s Open the Portal</span>
        </UButton>
      </UForm>
      <!-- <button @click="downloadPDF" class="text-white">下載 PDF</button> -->
    </UCard>
    <client-only>
      <ShootingGame v-if="shouldShowShootingGame" />
    </client-only>
    <h3 v-if="errorMessages" v-text="errorMessages" />
    <div
      v-if="flipbookImages.length > 0"
      class="flex flex-col gap-[20px] items-center justify-center flex-grow min-h-[100vh]"
    >
      <FlipbookVue
        class="h-[700px] w-[525px]"
        :pages="flipbookImages"
        :flipDuration="1000"
        :singlePage="true"
        :clickToZoom="false"
      />
      <UButton
        color="#F7715B"
        @click="downloadPDF"
      >
        下載 PDF
      </UButton>
    </div>
    <!-- 封面 -->
    <!-- <div class="opacity-0 absolute "> -->
    <div v-if="story" class="opacity-0 absolute right-0">
      <div
        ref="pdfCover"
        class="pl-[110px] pr-[60px] rounded border border-gray-400 w-[600px] min-h-[800px] flex flex-col justify-center items-center gap-[48px] text-white"
        :style="{
          backgroundImage: `url(${cover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      >
        <div class="text-[18px] font-bold">
          你在
          <span class="text-[28px] font-extrabold text-[#F7715B]">{{
            story.角色設定.宇宙星球編號
          }}</span>
          的宇宙中 編號是
          <span class="text-[28px] font-extrabold text-[#F7715B]">{{
            story.角色設定.名字
          }}</span>
        </div>
        <div class="text-left text-[18px]">{{ story.前言 }}</div>
      </div>

      <!-- 橋段 -->
      <div
        v-for="(scene, index) in scenes"
        :key="index"
        :ref="(el) => (pdfContents[index] = el)"
        class="px-[60px] bg-white rounded border border-gray-400 w-[600px] min-h-[800px] flex flex-col justify-center items-center gap-[24px]"
      >
        <p class="block text-left text-[22px]">{{ scene.情節 }}</p>
        <div class="w-full flex justify-center items-center">
          <img
            :src="images[index]"
            alt="Generated Scene"
            class="rounded w-full object-contain"
          />
        </div>
      </div>
      <!-- 封底 -->
      <div
        ref="pdfEnd"
        class="w-[600px] min-h-[800px]"
        :style="{
          backgroundImage: `url(${coverEnd})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      />
    </div>
  </div>
</template>

<script setup>
import FlipbookVue from "flipbook-vue";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import cover from "~/assets/cover-bg.png";
import coverEnd from "~/assets/end.png";

import { ref, computed, onMounted } from "vue";
import {
  styleList,
  mockObject,
  generatePrompt,
  mockImages,
} from "../utils/constants";
const pdfContents = ref([]);
const pdfCover = ref(null);
const pdfEnd = ref(null);

const story = ref();
const loading = ref(false);
const error = ref("");
const name = ref("");
const traits = ref("");
const errorMessages = ref("");

const images = ref();

const loadingImages = ref(false);
const errorImages = ref("");
const flipbookImages = ref([]);
const shouldShowShootingGame = ref(false);

const scenes = computed(() => {
  if (!story.value) {
    return [];
  }
  return Object.keys(story.value)
    .filter((key) => key.startsWith("橋段"))
    .map((key) => story.value[key]);
});

const handleClickGenerateStory = async () => {
  shouldShowShootingGame.value = true;
  try {
    await generateStory();
    if (story.value) {
      const prompts = extractImageDescriptions(story.value);
      console.log("prompts", prompts);
      if (prompts.length > 0) {
        await generateImages(prompts);
      }
    }
    if (images.value.length > 0) {
      await generateDivImageUrls();
    }
    shouldShowShootingGame.value = false;
  } catch (error) {
    errorMessages.value = "宇宙連線失敗，再試一次";
    loading.value = false;
    loadingImages.value = false;
    shouldShowShootingGame.value = false;
    console.error("Error generating story:", error);
  }
};

const generateStory = async () => {
  loading.value = true;
  error.value = "";
  story.value = "";
  if (!name.value || !traits.value) {
    error.value = "Please enter the name and traits.";
    loading.value = false;
    return;
  }

  const prompt = generatePrompt(name.value, traits.value)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ");
  try {
    const response = await fetch(
      "https://generatestory-xfnkw3l2zq-uc.a.run.app",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      }
    );

    const data = await response.json();
    console.log("data", data);
    if (response.ok) {
      story.value = data.story;
    } else {
      throw new Error(data.error || "API request failed.");
    }
  } catch (err) {
    error.value = `Error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};

const generateImages = async (prompts) => {
  loadingImages.value = true;
  errorImages.value = "";
  images.value = [];
  try {
    const response = await fetch(
      "https://generateimages-xfnkw3l2zq-uc.a.run.app",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompts }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Generated images:", data);

    if (data.images && Array.isArray(data.images)) {
      images.value = data.images.map((b64) => `data:image/png;base64,${b64}`);
    } else {
      throw new Error("Invalid response format: No images found");
    }

    loadingImages.value = false;
  } catch (err) {
    console.error("Error generating images:", err);
    errorImages.value = `Error: ${err.message}`;
    loadingImages.value = false;
  }
};

const extractImageDescriptions = (story) => {
  const characterDescription = story["角色樣貌描述"] || "";
  const selectedStyle = styleList[Math.floor(Math.random() * styleList.length)];
  return Object.keys(story)
    .filter((key) => key.startsWith("橋段"))
    .map((key) => {
      const sceneDescription = story[key].圖片描述 || "";
      return `請用${selectedStyle}畫出：${sceneDescription} 角色樣貌: ${characterDescription}`;
    });
};

const generateDivImageUrls = async () => {
  const imageUrls = [];

  // 處理封面
  if (pdfCover.value) {
    const coverCanvas = await html2canvas(pdfCover.value, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });
    const coverImgData = coverCanvas.toDataURL("image/png");
    imageUrls.push(coverImgData);
  }

  // 處理橋段內容
  for (const element of pdfContents.value) {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });
    const imgData = canvas.toDataURL("image/png");
    imageUrls.push(imgData);
  }

  if (pdfEnd.value) {
    const coverCanvas = await html2canvas(pdfEnd.value, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
    });
    const coverImgData = coverCanvas.toDataURL("image/png");
    imageUrls.push(coverImgData);
  }

  flipbookImages.value = imageUrls;
  return imageUrls;
};

const downloadPDF = async () => {
  try {
    // 生成所有 div 的圖片 URL
    const imageUrls = await generateDivImageUrls();

    // 假設所有的 div 尺寸一致，取第一個圖片的尺寸作為 PDF 的基準尺寸
    const firstImage = new Image();
    firstImage.src = imageUrls[0];

    firstImage.onload = () => {
      const imgWidth = firstImage.width;
      const imgHeight = firstImage.height;

      // 創建 PDF，使用與 div 尺寸一致的頁面大小
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? "landscape" : "portrait",
        unit: "px", // 使用 px 作為單位，與 div 尺寸保持一致
        format: [imgWidth, imgHeight],
      });

      // 將每張圖片添加到 PDF 中
      imageUrls.forEach((imgData, index) => {
        if (index > 0) {
          pdf.addPage([imgWidth, imgHeight]); // 添加新頁，尺寸相同
        }
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight); // 填充整個頁面
      });

      // 保存 PDF 文件
      pdf.save(
        `${name.value}_in_${story.value.角色設定.宇宙星球編號}_story.pdf`
      );
    };

    firstImage.onerror = (error) => {
      console.error("Error loading image for size reference:", error);
    };
  } catch (error) {
    console.error("Error generating PDF:", error.message);
  }
};
</script>
