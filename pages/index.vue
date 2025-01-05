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
      <UForm :state="{ key: 'value' }" @submit.prevent="generateStory">
        <p v-text="`請輸入 E-616 的主體代號`" />
        <UInput v-model="name" placeholder="Enter the name" class="mb-4" />
        <p v-text="`載入此宇宙的形象記錄`" />
        <UInput
          v-model="image"
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
        <UButton :disabled="loading" class="mt-4 bg-blue-500">
          <span v-if="loading">Generating...</span>
          <span v-else>Let’s Open the Portal</span>
        </UButton>
      </UForm>
    </UCard>

    <UCard class="w-2/3 p-6 m-4 bg-gray-100 text-black shadow">
      <UCardTitle>Generated Story</UCardTitle>
      <UCardTitle v-if="loading" class="text-center text-gray-500">
        Loading...
      </UCardTitle>
      <div v-else-if="story" class="p-4 bg-white rounded">
        <p v-text="story" />
      </div>
      <div v-else class="text-center text-gray-500">
        Your story will appear here...
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from "vue";

const name = ref("");
const image = ref(null);
const traits = ref("");
const story = ref("");
const loading = ref(false);
const error = ref("");

const generatePrompt = (name, attitudes) => {
  return `
目前的星球是 E-616，請創作一個平行宇宙的日常故事（就如同窺探別的宇宙的我在做什麼）。
請根據以下條件創作一個故事，並用 object 格式回傳，結構如下：
{
  "角色設定": {
    "宇宙星球編號"：“自由設定“，
    "名字": "用 ${name} 作為靈感設定",
    "固定特性": "${attitudes}"
  },
“前言”："",
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
    "情節": "主角利用${attitudes}特性克服障礙或解決問題的場景。",
    "圖片描述": "主角運用${attitudes}特性的具體場景細節，例如表現出緊張或專注的畫面。"
  },
  "橋段5": {
    "情節": "故事結尾，展現主角的改變或選擇。",
    "圖片描述": "場景中主角的表情、身處的環境，反映結局的情感基調。"
  }
}

條件：
1. 角色設定中的名字可以自由變化。
2. 故事需設定在平行宇宙，描述該宇宙的特色(不一定要很科幻，就是另一個宇宙的自己的故事，也可以很中古、很抽象)，並設計創意情節。
3. 主題圍繞${attitudes}特性，並體現該特性如何幫助主角解決問題。
4. 每個橋段需提供一段「圖片描述」，詳細描寫可視化的場景，包含顏色、氛圍、動作、角色的細節等。
5. 請直接輸出完整的故事，且需用標準的 JSON 格式輸出，無需多餘描述。
  `;
};

const generateStory = async () => {
  loading.value = true;
  error.value = "";
  story.value = "";

  const prompt = generatePrompt(name.value, traits.value);
  try {
    const response = await fetch(
      "https://openaiproxy-xfnkw3l2zq-uc.a.run.app",
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
      story.value = data.choices[0]?.text?.trim() || "No response received.";
    } else {
      throw new Error(data.error || "API request failed.");
    }
  } catch (err) {
    error.value = `Error: ${err.message}`;
  } finally {
    loading.value = false;
  }
};
</script>
