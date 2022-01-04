<template>
  <div class="dialog" v-if="show" @click.stop="hideDialog">
    <div @click.stop class="dialog__content">
      <div class="flex mb-6">
          <div class="flex-col text-gray-500 text-left w-full font-bold uppercase tracking-widest">{{title}}</div>
          <div class="flex-col text-right" @click="hideDialog()">
            <i class="fas fa-times"></i>
          </div>
       </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: "my-dialog",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type:String,
      default:"Modal"
    }
  },
  methods: {
      hideDialog() {
        this.$emit("update:show", false);
      }
  }
};
</script>

<style scoped>
.dialog {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  position: fixed;
  display: flex;
}

.dialog__content {
  margin: auto;
  background: white;
  border-radius: 12px;
  min-height: 50px;
  min-width: 30%;
  padding: 20px;
}
</style>