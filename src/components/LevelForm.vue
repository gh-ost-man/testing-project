<template>
  <div class="w-full">
    <form @submit.prevent>
      <div class="mb-6">
        <label class="flex text-gray-700 font-serif text-sm font-bold mb-2"
          >Image</label
        >
        <div class="image" @click="handleClick">
          <img
            ref="img"
            :src="filePath ? filePath :''"
          />
          <input
            ref="image"
            style="visibility: hidden"
            @change="hanldeChange"
            type="file"
          />
        </div>
      </div>
      <div class="mb-6">
        <label class="flex text-gray-700 font-serif text-sm font-bold mb-2"
          >Title</label
        >
        <input
          v-model="levelForm.title"
          class="
            bg-white
            font-serif
            appearance-none
            border border-black
            rounded
            w-full
            focus
            py-3
            px-3
            text-gray-700
            leading-tight
            focus:outline-none focus:bg-white focus:border-green-500
          "
          type="text"
        />
      </div>
      <div class="mb-6">
        <label class="flex text-gray-700 font-serif text-sm font-bold mb-2"
          >Level Title</label
        >
        <input
          v-model="levelForm.subTitle"
          class="
            bg-white
            font-serif
            appearance-none
            border border-black
            rounded
            w-full
            focus
            py-3
            px-3
            text-gray-700
            leading-tight
            focus:outline-none focus:bg-white focus:border-green-500
          "
          type="text"
        />
      </div>
      <div class="mb-6">
        <label for="toggleA" class="flex items-center cursor-pointer">
          <div
            class="mr-8 w-full text-left font-bold text-gray-700 font-medium"
          >
            Live
          </div>
          <!-- toggle -->
          <div class="relative">
            <!-- input -->
            <input
              type="checkbox"
              id="toggleA"
              class="sr-only"
              v-model="levelForm.isLive"
            />
            <!-- line -->
            <div class="block bg-gray-200 w-14 h-8 rounded-full"></div>
            <!-- dot -->
            <div
              class="
                dot
                absolute
                left-1
                top-1
                bg-mywhite
                w-6
                h-6
                rounded-full
                transition
              "
            ></div>
          </div>
          <!-- label -->
        </label>
      </div>
      <div class="mb-6" v-if="$props.type == 'Add'">
        <button
          class="
            w-full
            font-sans
            h-12
            px-6
            font-bold font-sans
            text-mywhite
            transition-colors
            duration-150
            bg-mygreen
            rounded-full
            focus:border-current
          "
          @click="addHandleClick"
        >
          {{ $props.type }}
        </button>
      </div>
      <div class="mb-6" v-if="$props.type == 'Update'">
        <button
          class="
            w-full
            font-sans
            h-12
            px-6
            font-bold font-sans
            text-mygreen
            transition-colors
            duration-150
            rounded-full
            border border-mygreen
            focus:border-current
          "
          @click="deleteHandleClick"
        >
          Delete
        </button>
      </div>
      <div class="mb-6" v-if="$props.type == 'Update'">
        <button
          class="
            w-full
            font-sans
            h-12
            px-6
            font-bold font-sans
            text-mywhite
            transition-colors
            duration-150
            bg-mygreen
            rounded-full
            focus:border-current
          "
          @click="updateHandleClick"
        >
          {{ $props.type }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { createToast } from "mosha-vue-toastify";
export default {
  name: "level-form",
  props: ["type", "level"],
  data() {
    return {
      levelForm: { title: "", subTitle: "", isLive: true, iconLink: "" },
      file: null,
      filePath: "",
      errors: [],
    };
  },

  methods: {
    addHandleClick() {
      if (!this.file) {
        this.errors.push("Select image for level");
      }

      if (!this.levelForm.title) {
        this.errors.push("Enter title");
      }

      if (!this.levelForm.subTitle) {
        this.errors.push("Enter subTitle");
      }

      if (this.errors.length) {
        createToast(
          {
            title: "Incorect data ",
            description: this.errors[0],
          },
          {
            type: "danger",
            position: "top-center",
            transition: "bounce",
          }
        );
      } else {
        this.$emit(
          "create",
          this.levelForm,
          this.file,
          this.$props.level.unitId
        );
      }
      this.errors = [];
    },
    updateHandleClick() {
      if (!this.file && !this.levelForm.iconLink) {
        this.errors.push("Select image for level");
      }

      if (!this.levelForm.title) {
        this.errors.push("Enter Title");
      }

      if (!this.levelForm.subTitle) {
        this.errors.push("Enter Level Title");
      }

      if (this.errors.length) {
        createToast(
          {
            title: "Incorect data ",
            description: this.errors[0],
          },
          {
            type: "danger",
            position: "top-center",
            transition: "bounce",
          }
        );
      } else {
        this.$emit( "update", this.levelForm,  this.file, this.$props.level.unitId, this.$props.level.id);
      }
      this.errors = [];
    },
    deleteHandleClick() {
      this.$emit("delete", this.$props.level.id, this.$props.level.unitId);
    },

    hanldeChange(e) {
      const selected = e.target.files[0];

      if (selected) {
        this.file = selected;
        this.filePath = URL.createObjectURL(this.file);
      }
    },
    handleClick() {
      this.$refs.image.click();
    },
  },
  mounted() {
    this.levelForm.title = this.$props.level.title;
    this.levelForm.subTitle = this.$props.level.subTitle;
    this.levelFormisLive = this.$props.level.isLive;
    this.levelForm.iconLink = this.$props.level.iconLink;
    this.filePath = this.$props.level.iconLink;
  },
};
</script>

<style scoped>
.image {
  height: 100px;
  width: 100px;
}

.image img {
  width: 100%;
}

.loader {
  border-top-color: #3498db;
  -webkit-animation: spinner 1.5s linear infinite;
  animation: spinner 1.5s linear infinite;
}

@-webkit-keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.w-d {
  width: 315px;
}
button:disabled {
  background: transparent;
  color: green;
}
/* Toggle B */
input:checked ~ .dot {
  transform: translateX(100%);
  background-color: #f0f0f0;
}
input:checked ~ .block {
  background-color: #0e0e0e;
}
</style>