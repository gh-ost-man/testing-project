<template>
  <div class="w-full">
    <form @submit.prevent>
      <div class="mt-6">
        <label class="flex text-gray-700 font-serif text-sm font-bold mb-2"
          >Title</label
        >
        <input
          v-model="unitForm.title"
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
      <div class="mt-6">
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
              v-model="unitForm.isLive"
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
      <div class="mt-6" v-if="$props.type == 'Update'">
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
      <div class="mt-6" v-if="$props.type == 'Add'">
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
      <div class="mt-6" v-if="$props.type == 'Update'">
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
  name: "unit-form",
  data() {
    return {
      unitForm: { title: "", isLive: true },
      errors: [],
    };
  },
  props: ["type", "unit"],
  methods: {
    addHandleClick() {
      if (!this.unitForm.title) {
        this.errors.push("Enter title");
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
        this.$emit("create", this.unitForm);
      }
      this.errors = [];
    },
    updateHandleClick() {
      this.$emit("update", this.unitForm, this.$props.unit.id);
    },
    deleteHandleClick() {
      this.$emit("delete", this.$props.unit.id);
    },
  },
  mounted() {
    this.unitForm.title = this.$props.unit.title;
    this.unitForm.isLive = this.$props.unit.isLive;
  },
};
</script>

<style scoped>
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