<template>
  <div class="w-full p-16">
    <div class="flex text-left">
      <div class="flex-col w-full p-2">
        <div class="font-bold">Units</div>
        <button class="mt-5 mb-5 btn-add" @click="openDialogAddUnit">
          + Add unit
        </button>

        <ul class="list-none">
          <li
            class="p-3 font-bold"
            v-for="unit in units"
            :key="unit.id"
            @click="unitHandleClick(unit)"
            :class="{ 'active-li': unitActive === unit.id }"
          >
            <div class="flex">
              <div class="flex-col justify-center w-full">
                {{ unit.title }}
                {{ unit.order }}
              </div>
              <div class="flex-col">
                <div class="div flex items-center">
                  <div class="edit ml-3" @click="openDialogUpdateUnit(unit)">
                    <i class="fas fa-pencil-alt"></i>
                  </div>
                  <div v-if="unitActive === unit.id" class="icon ml-3">
                    <span><i class="fas fa-check p-2"></i></span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="flex-col w-full p-2">
        <div class="font-bold">Levels</div>
        <button
          v-if="unitActive"
          @click="openDialogAddLevel"
          class="mt-5 mb-5 btn-add"
        >
          + Add level
        </button>
        <ul class="list-none" v-if="levelsList">
          <li
            class="p-3 font-bold"
            v-for="level in levelsList"
            :key="level.id"
            @click="levelHandleClick(level)"
            :class="{ 'active-li': levelActive === level.id }"
          >
            <div class="flex">
              <div class="flex-col justify-center w-full">
                {{ level.title }}
                {{ level.order }}
              </div>
              <div class="flex-col">
                <div class="div flex items-center">
                  <div class="edit ml-3" @click="openDialogUpdateLevel(level)">
                    <i class="fas fa-pencil-alt"></i>
                  </div>
                  <div v-if="levelActive === level.id" class="icon ml-3">
                    <span><i class="fas fa-check p-2"></i></span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="flex-col w-full p-2">
        <div class="font-bold">Questions</div>
        <button v-if="levelActive" class="mt-5 mb-5 btn-add">
          + Add question
        </button>
        <draggable
          class="dragArea list-group w-full"
          :list="questions"
          @dragend="updateQuestions"
        >
          <div
            class="list-group-item bg-black-500 p-2"
            v-for="q in questions"
            :key="q.id"
          >
            {{ q.question }}
          </div>
        </draggable>
      </div>
    </div>
  </div>
  <my-dialog v-model:show="showDialogUnit" :title="titleModal">
    <unit-form
      :unit="unitForm"
      :type="type"
      @create="createUnit"
      @update="updateUnit"
      @delete="deleteUnit"
    ></unit-form>
  </my-dialog>

  <my-dialog v-model:show="showDialogLevel" :title="titleModal">
    <level-form
      :level="levelForm"
      :type="type"
      @create="createLevel"
      @update="updateLevel"
      @delete="deleteLevel"
    ></level-form>
  </my-dialog>
</template>

<script>
import getCollection from "@/composables/getCollection";
import { ref } from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import firebase from "firebase/compat";
import UnitForm from "@/components/UnitForm";
import LevelForm from "@/components/LevelForm";
import MyDialog from "@/components/MyDialog";
import { v4 as uuidv4 } from "uuid";
import useStorage from "@/composables/useStorage";
import { db } from "@/firebase/config";
export default {
  components: {
    UnitForm,
    MyDialog,
    LevelForm,
    draggable: VueDraggableNext,
  },
  setup() {
    const { documents: units } = getCollection("Units");
    const { documents: contents } = getCollection("LevelContent");
    const { url, uploadImage } = useStorage();
    const unitActive = ref(null); //id unit
    const levelActive = ref(null); //id level
    const levelContentActive = ref(null); //id ContentLevel
    const levelsList = ref([]);
    const questions = ref([]);
    const unitForm = ref({ title: "", isLive: true });
    const levelForm = ref({
      title: "",
      subTitle: "",
      iconLink: "",
      isLive: true,
      unitId: "",
    });
    const showDialogUnit = ref(false);
    const showDialogLevel = ref(false);
    const titleModal = ref("modal");
    const type = ref("none");

    const unitHandleClick = (unit) => {
      unitActive.value = unit.id;

      levelActive.value = null;
      levelsList.value = unit.levels;
      questions.value = [];
    };

    const levelHandleClick = (level) => {
      levelActive.value = level.id;

      let data = contents.value.find((x) => x.levelId === level.id);

      levelContentActive.value = level.levelContentId;
      questions.value = data ? data.levelQuestions : [];
    };

    const updateQuestions = () => {
      const levelQuestions = []; //for updated data
      questions.value.forEach((element, index) => {
        element.order = index;
        levelQuestions.push(element);
      });

      const updateRef = firebase
        .firestore()
        .collection("LevelContent")
        .doc(levelContentActive.value);

      updateRef.update({ levelQuestions }).catch((error) => {
        console.log(error);
      });
    };

    const hideDialog = () => {
      showDialogUnit.value = false;
      showDialogLevel.value = false;
      titleModal.value = "modal";
      type.value = "none";

      unitForm.value = { title: "", isLive: true };
      levelForm.value = { title: "", subTitle: "", iconLink: "", isLive: true };
    };

    const openDialogAddUnit = async () => {
      showDialogUnit.value = true;
      titleModal.value = "Unit";
      type.value = "Add";

      unitForm.value = { title: "", isLive: true };
    };
    const openDialogUpdateUnit = (u) => {
      showDialogUnit.value = true;
      titleModal.value = "Unit";
      type.value = "Update";

      unitForm.value = u;
    };
    const openDialogAddLevel = () => {
      showDialogLevel.value = true;
      titleModal.value = "Level";
      type.value = "Add";

      levelForm.value = {
        title: "",
        subTitle: "",
        iconLink: "",
        isLive: true,
        unitId: unitActive,
      };
    };
    const openDialogUpdateLevel = (l) => {
      showDialogLevel.value = true;
      titleModal.value = "Level";
      type.value = "Update";

      levelForm.value = l;
      levelForm.value.unitId = unitActive;
    };

    const createUnit = (newUnit) => {
      let max =
        units.value && units.value.length
          ? units.value.slice().sort((a, b) => b.order - a.order)[0].order + 1
          : 0;
      newUnit.createdAt = Date.now();
      newUnit.order = max;

      db.collection("Units")
        .add(newUnit)
        .catch((e) => console.log(e));

      hideDialog();
    };
    const updateUnit = (updUnit, id) => {
      updUnit.updatedAt = Date.now();

      db.collection("Units")
        .doc(id)
        .update(updUnit)
        .catch((e) => console.log(e));

      hideDialog();
    };
    const deleteUnit = (id) => {
      db.collection("Units")
        .doc(id)
        .delete()
        .catch((e) => console.log(e));

      hideDialog();
    };

    const createLevel = async (newLevel, file, unitId) => {
      newLevel.id = uuidv4();

      let unit = units.value.find((x) => x.id == unitId);
      let max =
        unit.levels && unit.levels.length
          ? unit.levels.slice().sort((a, b) => b.order - a.order)[0].order + 1
          : 0;

      newLevel.order = max;
      await uploadImage(file, "Level Icons");

      newLevel.iconLink = url.value;

      levelsList.value = unit.levels ? [...unit.levels, newLevel] : [newLevel];

      let levels = levelsList.value;

      db.collection("Units").doc(unitId).update({ levels });

      hideDialog();
    };
    const updateLevel = async (updLevel, file, unitId, levelId) => {
      if (file && updLevel.iconLink) {
        await uploadImage(file, "Level Icons");
        updLevel.iconLink = url.value;
      }

      const unit = units.value.find((x) => x.id == unitId);
      levelsList.value = unit.levels;
      const index = levelsList.value.findIndex((x) => x.id == levelId);

      levelsList.value[index].title = updLevel.title;
      levelsList.value[index].subTitle = updLevel.subTitle;
      levelsList.value[index].iconLink = updLevel.iconLink;
      levelsList.value[index].isLive = updLevel.isLive;

      let levels = levelsList.value;

      db.collection("Units").doc(unitId).update({ levels });

      hideDialog();
    };
    const deleteLevel = (levelId, unitId) => {
      const unit = units.value.find((x) => x.id == unitId);
      levelsList.value = unit.levels.filter((x) => x.id !== levelId);

      let levels = levelsList.value;

      db.collection("Units").doc(unitId).update({ levels });

      hideDialog();
    };

    return {
      units,
      levelsList,
      unitActive,
      levelActive,
      levelContentActive,
      questions,
      unitForm,
      levelForm,
      showDialogUnit,
      showDialogLevel,
      titleModal,
      type,
      unitHandleClick,
      levelHandleClick,
      updateQuestions,
      hideDialog,
      openDialogAddUnit,
      openDialogUpdateUnit,
      openDialogAddLevel,
      openDialogUpdateLevel,
      createUnit,
      deleteUnit,
      updateUnit,
      createLevel,
      updateLevel,
      deleteLevel,
    };
  },
  methods: {},
};
</script>

<style scoped>
.active-li {
  border: 1px solid #eda81c;
  box-sizing: border-box;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.15);
  position: relative;
}

.icon {
  /* position: absolute;
  top: 10px;
  right: 10px; */

  border-radius: 50%;
  background: #eda81c;
  font-size: 14px;
}

.edit {
  display: none;
  cursor: pointer;
}

.active-li:hover .edit {
  display: block;
}

@media screen and (max-width: 500px) {
  .span {
    display: none;
  }
}

.sortable-chosen {
  border: 1px solid #eda81c !important;
  box-sizing: border-box !important;
  opacity: 1 !important;
  background: white !important;
  color: black;
  z-index: 999 !important;
}
.sortable-ghost {
  visibility: hidden;
}

.btn-add {
  font-size: 14px;
  color: #51a045;
}

.list-group-item {
}
</style>