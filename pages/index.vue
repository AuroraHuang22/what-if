<template>
  <div class="flex justify-between min-h-screen text-white">
    <client-only>
      <BackgroundAnimation />
    </client-only>

    <UCard
      class="w-1/3 p-6 m-4 bg-black !ring-0 h-full"
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
          <div v-if="loadingImages && !images[index]">Generating images...</div>
          <img
            :src="images[index]"
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
const styleList = [
  "日本賽博和風",
  "未來科幻日系插畫風格",
  "賽博奇幻",
  "奇幻藝術風格",
  "慕夏風格",
  "宮崎駿風格",
  "維多利亞風格",
  "蒸汽龐克風格",
  "宇宙賽博風格",
  "手繪童趣風",
  "梵谷風格",
  "新藝術風格 (Art Nouveau)",
  "復古未來風 (Retro Futurism)",
  "哥德式風格",
  "水彩寫意風",
  "漫畫風格",
];
const mockObject = {
  角色設定: {
    宇宙星球編號: "E-717",
    名字: "Aiden",
    固定特性: "財富自由",
  },
  角色樣貌描述:
    "Aiden擁有一頭金色的捲髮，碧藍的眼睛如深邃的海洋，穿著一套優雅的白色西裝，搭配銀色的手錶，散發著自信與魅力。",
  前言: "在平行宇宙E-717，財富自由並不僅僅是金錢的象徵，而是一種生活方式的表現。Aiden是一位享受無拘無束生活的富豪，他的每一天都充滿了冒險與挑戰。",
  橋段1: {
    情節: "E-717的城市景觀如夢幻般的宮殿，天際線由閃爍的水晶塔樓組成，Aiden站在私人飛艇上，俯瞰著這座燦爛的都市。此時的天空充滿著奇異的粉色與紫色雲彩，宛如夢幻世界。",
    圖片描述:
      "畫面中，一艘閃著金光的飛艇懸浮在空中，Aiden站在船頭，微笑著面對城市，背景是高聳入雲的水晶塔，星星點點的燈光映照著他的西裝，增添了一層神秘感。",
  },
  橋段2: {
    情節: "Aiden穿梭於一個華麗而獨特的市場，市場中有外星人在推銷他們的獨特商品。此時，他遇到了一位名叫Liora的外星藝術家，她的作品擁有令人驚嘆的能量。",
    圖片描述:
      "在五顏六色的市場中，Liora展出她發光的藝術品，Aiden正在仔細欣賞，周圍是愉快的顧客，天空中懸浮著各式形狀的氣球，呈現出慶典的氛圍。",
  },
  橋段3: {
    情節: "在市場的深處，Aiden發現一個秘密組織正在策劃劫持Liora的藝術作品。他感受到危機逼近，心急如焚。時光如同硬幣般留不住，他必須快速行動。",
    圖片描述:
      "畫面轉至黑暗的角落，Aiden的表情緊張，手握著設備追蹤劫匪，滑稽的陰影讓場景充滿緊迫感，Liora在一旁緊張地看著，周圍的聲音模糊而急促。",
  },
  橋段4: {
    情節: "Aiden利用他的財富自由，啟動了全城市的安全系統，調度警察和私人保安迅速集結，保護Liora的藝術，並同時設計了一個交易，讓劫匪無法逃脫。",
    圖片描述:
      "在閃爍的控制台前，Aiden面對多屏的舊式技術，眼中充滿專注，身後是迅速反應的安保團隊，色彩對比強烈，展現出計畫的高效與他的鬥志。",
  },
  橋段5: {
    情節: "經過一番周折，Aiden成功拯救了Liora的藝術作品，兩人一同欣賞新的作品。Aiden認識到，財富自由不僅是金錢，更是能夠影響他人生活的力量。他決定將一部分财富投入到藝術和教育中，幫助更多的創作者。",
    圖片描述:
      "在夕陽的映照下，Aiden和Liora一起站在畫廊中，周圍的藝術作品在金色的光芒中閃耀，他們的臉上洋溢著滿足的笑容，環境明亮而充滿希望，象徵著未來的變化與可能。",
  },
};

const mockImages = [
  "https://oaidalleapiprodscus.blob.core.windows.net/private/org-ZfZCji7FdjrDaMC8MHOQlsQj/user-2UFaAA7cO04jrbGXXNrZdAak/img-H3scptmTr6QvHCsgdfiNMW6K.png?st=2025-01-06T14%3A54%3A48Z&se=2025-01-06T16%3A54%3A48Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-01-06T00%3A32%3A55Z&ske=2025-01-07T00%3A32%3A55Z&sks=b&skv=2024-08-04&sig=NedRrUtIj/ZKEtbTu11svkrM80oPIKjy4kHtlStUYug%3D",
  "https://oaidalleapiprodscus.blob.core.windows.net/private/org-ZfZCji7FdjrDaMC8MHOQlsQj/user-2UFaAA7cO04jrbGXXNrZdAak/img-o27LFtyFZePWExsT2aeviwSI.png?st=2025-01-06T14%3A55%3A06Z&se=2025-01-06T16%3A55%3A06Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-01-06T00%3A34%3A49Z&ske=2025-01-07T00%3A34%3A49Z&sks=b&skv=2024-08-04&sig=SCZsvPdD%2BGwjB7DTVkyenRIwhpHP7Z47HliTeOtZA9E%3D",
  "https://oaidalleapiprodscus.blob.core.windows.net/private/org-ZfZCji7FdjrDaMC8MHOQlsQj/user-2UFaAA7cO04jrbGXXNrZdAak/img-XcHiAXck2QThsJ2dsZN0SzmV.png?st=2025-01-06T14%3A55%3A24Z&se=2025-01-06T16%3A55%3A24Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-01-06T00%3A28%3A43Z&ske=2025-01-07T00%3A28%3A43Z&sks=b&skv=2024-08-04&sig=J91qERhQWphlsMEkKhl/KTJ5iILVGcogbjwMHJZjXvY%3D",
  "https://oaidalleapiprodscus.blob.core.windows.net/private/org-ZfZCji7FdjrDaMC8MHOQlsQj/user-2UFaAA7cO04jrbGXXNrZdAak/img-AwqvicopHsXP4w8ZmWTYwAMF.png?st=2025-01-06T14%3A55%3A34Z&se=2025-01-06T16%3A55%3A34Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-01-06T07%3A39%3A04Z&ske=2025-01-07T07%3A39%3A04Z&sks=b&skv=2024-08-04&sig=/zHJi3zhuow3eHQd92K8hEAd0RQ%2B5g1CCY8JBZivOjY%3D",
  "https://oaidalleapiprodscus.blob.core.windows.net/private/org-ZfZCji7FdjrDaMC8MHOQlsQj/user-2UFaAA7cO04jrbGXXNrZdAak/img-HPfhytmjrSZtqx1gQD9PEzbp.png?st=2025-01-06T14%3A55%3A54Z&se=2025-01-06T16%3A55%3A54Z&sp=r&sv=2024-08-04&sr=b&rscd=inline&rsct=image/png&skoid=d505667d-d6c1-4a0a-bac7-5c84a87759f8&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-01-06T00%3A51%3A37Z&ske=2025-01-07T00%3A51%3A37Z&sks=b&skv=2024-08-04&sig=McGhd4W6%2BOZ73vDt6BYQE0MyEyrlLAVE8Flnexz1jpU%3D",
];

const story = ref(mockObject);
const loading = ref(false);
const error = ref("");
const name = ref("");
const traits = ref("");
const imageFile = ref(null);

const images = ref(mockImages);
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
  "角色樣貌描述": "描述主角的外貌特徵（髮色、眼睛顏色、衣著等）",
  "前言": "",
  "橋段1": {
    "情節": "描述該宇宙/時空的場景，以及主角的角色。",
    "圖片描述": "設計此橋段的場景圖，例如宇宙的整體風格、主角在場景中的位置與動作"
  },
  "橋段2": {
    "情節": "主角與該宇宙中獨特角色的互動場景",
    "圖片描述": "描述該橋段中的特寫場景，例如主角與其他角色的互動細節"
  },
  "橋段3": {
    "情節": "故事的衝突或挑戰的關鍵時刻",
    "圖片描述": "描述衝突場景的畫面，例如危機發生的環境、角色的表情與行動"
  },
  "橋段4": {
    "情節": "主角利用 ${attitudes} 特性克服障礙或解決問題的場景",
    "圖片描述": "主角運用 ${attitudes} 特性的具體場景，例如表現出緊張或專注的畫面"
  },
  "橋段5": {
    "情節": "故事結尾，展現主角的改變或選擇",
    "圖片描述": "場景中主角的表情、身處的環境，反映結局的情感基調"
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
  await generateStory(); // 生成故事
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
  const characterDescription = story["角色樣貌描述"] || "";
  const selectedStyle = styleList[Math.floor(Math.random() * styleList.length)];
  return Object.keys(story)
    .filter((key) => key.startsWith("橋段"))
    .map((key) => {
      const sceneDescription = story[key].圖片描述 || "";
      return `請用${selectedStyle}畫出：${sceneDescription} 角色樣貌: ${characterDescription}`;
    });
};

const handleFileChange = (event) => {
  if (event.target && event.target.files && event.target.files.length > 0) {
    imageFile.value = event.target.files[0];
    console.log("Selected file:", imageFile.value);
  } else {
    console.error("No file selected or invalid event.");
  }
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
