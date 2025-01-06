<template>
  <div class="flex justify-between min-h-screen bg-gray-800 text-white">
    <!-- 左側表單 -->
    <UCard
      class="w-1/3 p-6 m-4 bg-transparent !ring-0"
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
        <p v-text="`載入此宇宙的形象記錄`" />
        <UInput
          v-model="imageFile"
          type="file"
          size="sm"
          icon="i-heroicons-folder"
          class="mb-4"
        />
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

    <div
      class="w-1/3 p-6 m-4 bg-gray-100 text-black shadow flex flex-col max-h-[calc(100vh-40px)] overflow-y-scroll"
    >
      <h1 v-if="!story" class="text-[48px] font-bold">Generated Story</h1>
      <h2
        class="text-[24px] font-bold text-center text-gray-500"
        v-if="loading"
      >
        Loading...
      </h2>
      <div v-else-if="story" class="flex flex-col">
        <!-- 封面 -->
        <div
          class="p-4 bg-white rounded border border-gray-400 w-full flex flex-col justify-center items-center min-h-[calc(100vh-100px)] gap-[48px]"
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
          class="p-4 bg-white rounded border border-gray-400 w-full flex flex-col justify-center items-center min-h-[calc(100vh-100px)]"
        >
          <p class="text-center">{{ scene.情節 }}</p>
          <div v-if="loadingImages && !images[index]?.imageUrl">
            Generating images...
          </div>
          <img
            :src="images[index]?.imageUrl"
            alt="Generated Scene"
            class="w-full rounded"
          />
        </div>
      </div>
      <div v-else class="text-center text-gray-500">
        Your story will appear here...
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
const mockObject = {
  版本: "1.0",
  角色設定: {
    宇宙星球編號: "E-789",
    名字: "Liora",
    固定特性: "好奇心",
  },
  前言: "在E-789星球的每日晨曦中，彩虹般的雲層秘藏著無數的奇觀。這裡的居民生性好奇，擁有探索與發現的熱情，尤其是Liora，她的心中滿是對未知的渴望。",
  橋段1: {
    情節: "在E-789的晨光照耀下，廣袤的大地被五彩斑斕的光影輕柔地包圍。Liora站在她的小木屋前，周圍全是奇形怪狀的植物和閃爍的光螢，眼中流露出驚奇的神情。她夢想著去探險，去發現那些未被探索的場所。",
    圖片描述:
      "清晨的陽光透過五彩斑斕的雲彩，投射在Liora面前的奇異植物上。她的髮絲隨著微風飄動，穿著淺色的長裙，身旁是各種發光的生物，環境充滿寧靜而神秘的氛圍。",
  },
  橋段2: {
    情節: "在一片神秘的森林中，Liora遇見了她的朋友Lyn，一个擁有透明翅膀的迷小精靈。Lyn在樹間穿梭，對於探索同樣充滿熱情。她們一起分享著各自的發現，討論著未來的夢想，這讓Liora更加堅定了她的冒險決心。",
    圖片描述:
      "Liora和Lyn圍坐在一棵巨大的發光古樹下，星星般的光點在她們周圍閃爍。Liora微笑著，眼神中流露出對Lyn的仰慕，Lyn則用她晶亮的翅膀在空中劃出一些花樣，兩人都全然沉浸在這片奇幻的世界中。",
  },
  橋段3: {
    情節: "就在Liora與Lyn計劃探險時，突如其來的暴風雨席捲了整個星球，強風和暴雨撕扯著周圍的植物。Liora本能地想要逃離，但她的心中卻充滿了對面對挑戰的好奇與興奮，她決定帶著Lyn一起尋找安全的避難處。",
    圖片描述:
      "大雨傾盆而下，強風在樹間呼嘯，Liora和Lyn兩人沉著應對，臉上卻露出不安與堅毅的表情。周圍的林木搖曳不定，閃電划破夜空，照亮了她們面前的道路。",
  },
  橋段4: {
    情節: "Liora帶著好奇的心情，觀察著周遭的情況，突然她注意到一株特別堅韌的植物。她想到了這株植物的根部可能隱藏著天然的洞穴，於是她鼓勵Lyn一起探索。二人小心翼翼地接近那株植物，並終於找到了能夠避難的地方。",
    圖片描述:
      "Liora面對著一株高大的植物，神情專注，雙手輕輕撫摸著它的葉片，周圍雜草中透出微弱的光芒。她的好奇心讓她的眼睛閃爍著期待，Lyn在一旁默默支持著她，空氣中充滿緊張與能量的交織。",
  },
  橋段5: {
    情節: "暴風雨終於過去，Liora和Lyn安全地躲在植物隱秘的空間裡，她們的心中充滿了成就感。這次的冒險不僅讓她們避開了危險，也讓Liora更加確信自己對未知的探索精神是多麼珍貴。她發誓往後要更加勇敢地追尋所有的好奇心源頭。",
    圖片描述:
      "Liora和Lyn走出避難所，臉上洋溢著笑容，陽光再次點亮了大地。Liora的眼中閃爍著堅定的光芒，看向天空，似乎在思考她下一個冒險的目的地。周圍是剛被雨水沖刷過的清新空氣，色彩格外艷麗。",
  },
};
const story = ref(mockObject);
const loading = ref(false);
const error = ref("");
const name = ref("");
const traits = ref("");
const imageFile = ref(null);

const images = ref([]);
const loadingImages = ref(false);
const errorImages = ref("");

const scenes = computed(() => {
  if (!story.value) {
    return [];
  }
  return Object.keys(story.value)
    .filter((key) => key.startsWith("橋段"))
    .map((key) => story.value[key]);
});

const generatePrompt = (name, attitudes) => {
  return `
目前的星球是 E-616，請創作一個平行宇宙的日常故事（就如同窺探別的宇宙的我在做什麼）。
請根據以下條件創作一個情節有趣的故事，並用 JSON 格式回傳，結構如下：
{
  "角色設定": {
    "宇宙星球編號": "自由設定，不重複即可",
    "名字": "用 ${name} 作為靈感設定",
    "固定特性": "${attitudes}"
  },
  "前言": "",
  "橋段1": {
    "情節": "描述該宇宙/時空的場景，以及主角的角色。",
    "圖片描述": "用於設計此橋段的場景圖，例如宇宙的整體風格、主角在場景中的位置與動作。"
  },
  "橋段2": {
    "情節": "主角與該宇宙中獨特角色的互動場景。",
    "圖片描述": "描述該橋段中的特寫場景，例如主角與其他角色的互動細節。"
  },
  "橋段3": {
    "情節": "故事的衝突或挑戰或有趣的關鍵時刻。",
    "圖片描述": "描述衝突場景的畫面感，例如危機發生的環境、角色的表情與行動。"
  },
  "橋段4": {
    "情節": "主角利用 ${attitudes} 特性克服障礙或解決問題的場景。",
    "圖片描述": "主角運用 ${attitudes} 特性的具體場景細節，例如表現出緊張或專注的畫面。"
  },
  "橋段5": {
    "情節": "故事結尾，展現主角的改變或選擇。",
    "圖片描述": "場景中主角的表情、身處的環境，反映結局的情感基調。"
  }
}

條件：
1. 返回的內容應完全符合上述 JSON 格式。
2. 請勿添加多餘的內容或 Markdown 標記，例如 \`\`\`json 或 \`\`\`。
3.角色設定中的名字可以自由變化。
4.故事需設定在平行宇宙，描述該宇宙的特色，並設計創意情節（可以是日常、懸疑、驚悚、冒險、科幻、愛情故事、開放式結局）。
5.主題圍繞 ${attitudes} 特性，並體現該特性如何幫助主角解決問題。
6.每個橋段需提供一段「圖片描述」，詳細描寫可視化的場景，包含顏色、氛圍、動作、角色的細節等。
7.不需要過於拘泥格式，內容完整性和創意優先。
  `;
};

const handleClickGenerateStory = async () => {
  // await generateStory(); // 生成故事
  if (story.value) {
    const prompts = extractImageDescriptions(story.value);
    console.log("prompts", prompts);
    await generateImages(imageFile.value, prompts);
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

const generateImages = async (imageFile, prompts) => {
  loadingImages.value = true;
  errorImages.value = "";
  images.value = []; // 清空之前的图片列表
  console.log("generateImages");

  try {
    const base64Image = imageFile
      ? await fileToBase64(imageFile)
      : null;

    const response = await fetch(
      "https://generateimages-xfnkw3l2zq-uc.a.run.app",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, prompts }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Generated images:", data);

    if (data.images && Array.isArray(data.images)) {
      images.value = data.images;
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
  return Object.keys(story)
    .filter((key) => key.startsWith("橋段"))
    .map((key) => story[key].圖片描述);
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
</script>
