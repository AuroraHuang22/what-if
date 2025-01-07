<template>
  <div class="flex justify-between max-h-screen overflow-y-hidden">
    <client-only>
      <BackgroundAnimation />
    </client-only>
    <UCard
      class="w-1/3 p-6 m-4 bg-black !ring-0 h-full text-white"
      :ui="{
        divide: 'divide-transparent',
      }"
    >
      <template #header>
        <h1 class="text-[48px] font-bold">What if?</h1>
      </template>
      <UForm :state="{ key: 'value' }">
        <p v-text="`請輸入 E-616 的主體代號`" />
        <UInput v-model="name" placeholder="Enter the name" class="mb-4" />

        <p v-text="`無論在哪個宇宙都不變的特性是什麼`" />
        <UInput
          v-model="traits"
          placeholder="Describe the traits"
          class="mb-4"
        />
        <UButton
          :disabled="loading"
          class="mt-4 bg-blue-500"
          @click="handleClickGenerateStory"
        >
          <span v-if="loading">Generating...</span>
          <span v-else>Let’s Open the Portal</span>
        </UButton>
      </UForm>
    </UCard>
    <client-only>
      <ShootingGame />
    </client-only>
    <!-- <div
      v-if="story"
      class="flex flex-col gap-[20px] items-center justify-center flex-grow min-h-[calc(100vh-100px)]"
    >
      <FlipbookVue
        class="h-[600px] w-[600px]"
        :pages="flipbookImages"
        :flipDuration="1000"
        :singlePage="true"
        :clickToZoom="false"
      />
      <button @click="downloadPDF" class="text-white">下載 PDF</button>
    </div> -->
    <!-- 封面 -->
    <!-- <div class="opacity-0 absolute "> -->
    <div class="flex flex-col min-h-[calc(100vh-100px)] overflow-y-scroll">
      <div
        ref="pdfCover"
        class="p-4 bg-white rounded border border-gray-400 w-full flex flex-col justify-center items-center min-h-[calc(100vh-100px)] gap-[48px]"
        style="width: 600px; height: 600px"
      >
        <div class="text-[18px] font-bold">
          你在
          <span class="text-[28px] font-extrabold text-red-800">{{
            story.角色設定.宇宙星球編號
          }}</span>
          的宇宙中 編號是
          <span class="text-[28px] font-extrabold text-red-800">{{
            story.角色設定.名字
          }}</span>
        </div>
        <div class="text-center">{{ story.前言 }}</div>
      </div>

      <!-- 橋段 -->
      <div
        v-for="(scene, index) in scenes"
        :key="index"
        :ref="(el) => (pdfContents[index] = el)"
        class="p-4 bg-white w-[600px] h-[780px] rounded border border-gray-400 flex flex-col justify-center items-center text-black"
      >
        <p class="text-center">{{ scene.情節 }}</p>
        <div v-if="loadingImages && !images[index]">Generating images...</div>
        <div class="w-[400px] flex justify-center items-center">
          <img
            :src="images[index]"
            alt="Generated Scene"
            class="rounded w-full object-contain"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import FlipbookVue from "flipbook-vue";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { ref, computed, onMounted } from "vue";
import { styleList, mockObject, generatePrompt } from "../utils/constants";
const pdfContents = ref([]);
const pdfCover = ref(null);

const story = ref(mockObject);
const loading = ref(false);
const error = ref("");
const name = ref("");
const traits = ref("");
const imageFile = ref(null);

const images = ref([]);

const loadingImages = ref(false);
const errorImages = ref("");
const flipbookImages = ref([]);

const scenes = computed(() => {
  if (!story.value) {
    return [];
  }
  return Object.keys(story.value)
    .filter((key) => key.startsWith("橋段"))
    .map((key) => story.value[key]);
});

const handleClickGenerateStory = async () => {
  await generateStory();
  if (story.value) {
    const prompts = extractImageDescriptions(story.value);
    console.log("prompts", prompts);
    if (prompts.length > 0) {
      await generateImages(prompts);
    }
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

onMounted(() => {
  generateDivImageUrls();
  console.log("flipbookImages", flipbookImages.value);
});

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

  flipbookImages.value = imageUrls;
  return imageUrls;
};

const downloadPDF = async () => {
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  try {
    const imageUrls = await generateDivImageUrls(); // 生成所有圖片 URL

    imageUrls.forEach((imgData, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight); // 填充整個頁面
    });

    pdf.save("multi-page-with-cover.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error.message);
  }
};
</script>
