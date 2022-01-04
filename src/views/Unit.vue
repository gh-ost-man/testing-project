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
        <button
          v-on:click="openDialogAddQuestions()"
          v-if="levelActive"
          class="mt-5 mb-5 btn-add"
        >
          + Add question
        </button>
        <draggable
          class="dragArea list-group w-full"
          :list="questions"
          @dragend="updateQuestions"
        >
          <div
            class="list-group-item flex flex-row bg-black-500 p-2"
            v-for="q in questions"
            :key="q.id"
          >
            {{ q.question }}
            <button
              @click="openDialogUpdateQuestions(q)"
              class="fas ml-2 w-7 h-7 fa-pencil-alt"
            ></button>
          </div>
        </draggable>
      </div>
    </div>

    <my-dialog v-model:show="showDialogQuestions" :title="titleModal">
      <add-questionlevel
        :quest="questForm"
        :type="type"
        :questionsType="questionsType"
        @create="createQuest"
        @update="updateQuest"
        @delete="deleteQuest"
      ></add-questionlevel>
    </my-dialog>
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
import AddQuestionlevel from "./modals/questionLvl.vue";
import UnitForm from "@/components/UnitForm";
import { DateTime } from "luxon";
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
    AddQuestionlevel,
  },
  data() {
    return {
      addQuestionType: true,
      addQuestionLevel: true,
      questionsType: null,
    };
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
    const questForm = ref({
      docId: "",
      id: "",
      createdAt: "",
      levelId: "",
      unitId: "",
      levelQuestions: [],
    });
    const showDialogUnit = ref(false);
    const showDialogQuestions = ref(false);
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
      console.log(level);
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
      showDialogQuestions.value = false;
      titleModal.value = "modal";
      type.value = "none";
      questForm.value = {
        docId: "",
        id: "",
        createdAt: "",
        levelId: "",
        unitId: "",
        levelQuestions: [],
      };
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
        craetedAt: "",
        levelId: "",
        unitId: unitActive,
        levelQuestions: [
          {
            title: "",
            desc: "",
          },
        ],
      };
    };
    const openDialogUpdateLevel = (l) => {
      showDialogLevel.value = true;
      titleModal.value = "Level";
      type.value = "Update";

      levelForm.value = l;
      levelForm.value.unitId = unitActive;
    };
    const openDialogUpdateQuestions = (l) => {
      showDialogQuestions.value = true;
      titleModal.value = "Questions";
      type.value = "Update";

      questForm.value = l;
      questForm.value.id = l.id;
      questForm.value.docId = levelContentActive;
      questForm.value.levelId = levelActive;
      questForm.value.unitId = unitActive;
    };
    const openDialogAddQuestions = () => {
      showDialogQuestions.value = true;
      titleModal.value = "Questions";
      type.value = "Add";

      questForm.value = {
        createdAt: "",
        levelId: levelActive,
        unitId: unitActive,
        levelQuestions: [],
      };
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
    const createQuest = async (newQuest) => {
      db.collection("LevelContent")
        .doc(levelContentActive.value)
        .update({ levelId: levelActive.value })
        .catch((e) => console.log(e));
      let ques = contents.value.find((x) => x.id == levelContentActive.value);
      let max =
        ques.levelQuestions && ques.levelQuestions.length
          ? ques.levelQuestions.slice().sort((a, b) => b.order - a.order)[0]
              .order + 1
          : 0;

      newQuest.order = max;
      questions.value = ques.levelQuestions
        ? [...ques.levelQuestions, newQuest]
        : [newQuest];

      let levelQuestions = questions.value;
      db.collection("LevelContent")
        .doc(levelContentActive.value)
        .update({ levelQuestions })
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
    const createLevel = (newLevel, file, unitId) => {
      db.collection("LevelContent")
        .add({
          unitId: unitActive.value,
          createdAt: DateTime.now().toMillis(),
          levelQuestions: [],
        })
        .then(async (i) => {
          newLevel.id = uuidv4();
          newLevel.levelContentId = i.id;
          let unit = units.value.find((x) => x.id == unitId);
          let max =
            unit.levels && unit.levels.length
              ? unit.levels.slice().sort((a, b) => b.order - a.order)[0].order +
                1
              : 0;

          newLevel.order = max;
          await uploadImage(file, "Level Icons");

          newLevel.iconLink = url.value;

          levelsList.value = unit.levels
            ? [...unit.levels, newLevel]
            : [newLevel];

          let levels = levelsList.value;

          db.collection("Units").doc(unitId).update({ levels });
        }); /* .then(() => { 
         db.collection("LevelContent")
        .add({
        levelId: levelActive.value,
        unitId: unitActive.value,
        createdAt: DateTime.now().toMillis(),
        levelQuestions: [],
        })
      }); */
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
    const updateQuest = async (updQuest, file, questId) => {
      if (file && updQuest.image) {
        await uploadImage(file, "Level Icons");
        updQuest.image = url.value;
      }

     let ques = contents.value.find((x) => x.id == levelContentActive.value);
      questions.value = ques.levelQuestions;
      const index = questions.value.findIndex((x) => x.id == questId);

      questions.value[index].question = updQuest.question;
      questions.value[index].image = updQuest.image;
      questions.value[index].answers = updQuest.answers;

      let levelQuestions = questions.value;

      db.collection("LevelContent").doc(levelContentActive.value).update({ levelQuestions });
      hideDialog();
    };

     const deleteQuest = (questId) => {
      let ques = contents.value.find((x) => x.id == levelContentActive.value);
      questions.value = ques.levelQuestions.filter((x) => x.id !== questId);

      let levelQuestions = questions.value;

      db.collection("LevelContent").doc(levelContentActive.value).update({ levelQuestions });

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
      showDialogQuestions,
      showDialogUnit,
      showDialogLevel,
      titleModal,
      questForm,
      type,
      deleteQuest,
      openDialogUpdateQuestions,
      createQuest,
      unitHandleClick,
      levelHandleClick,
      updateQuestions,
      updateQuest,
      hideDialog,
      openDialogAddUnit,
      openDialogAddQuestions,
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
  watch: {
    questionsType: function (val) {
      if (val) {
        this.$refs.modal2.open({});
      }
    },
  },
  methods: {
    fetchChanges(data) {
      this.questionsType = data.type;
      console.log(this.questionsType);
    },
    addQuestionTypeFunc() {
      this.$refs.modal.open({});
    },
  },
};
</script>

<style scoped>
.nu-modal {
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 3px 6px rgb(0 0 0 / 16%), 0 3px 16px rgb(0 0 0 / 12%);
  position: absolute;
  top: 20%;
  left: 50%;
  width: 80%;
  margin-bottom: 50px;
  max-width: 1600px;
  border-radius: 2px;
  z-index: 1;
  opacity: 0;
}
nu-modal {
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 3px 6px rgb(0 0 0 / 16%), 0 3px 16px rgb(0 0 0 / 12%);
  position: absolute;
  top: 20%;
  left: 50%;
  width: 80%;
  margin-bottom: 50px;
  max-width: 1600px;
  border-radius: 2px;
  z-index: 1;
  opacity: 0;
}
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
  cursor: url("/assets/hand-paper.png") !important;
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
  cursor: url("../../assets/hand-paper.png"), auto;
}
</style>