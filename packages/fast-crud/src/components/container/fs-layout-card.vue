<template>
  <fs-container class="fs-layout-card">
    <template v-if="searchShow" #header>
      <div class="fs-header-top">
        <slot name="header-top"></slot>
      </div>
      <component :is="cardComponentName">
        <slot name="search"></slot>
      </component>
      <div class="fs-header-bottom">
        <slot name="header-bottom"></slot>
      </div>
    </template>

    <component :is="cardComponentName" class="fs-layout-card-body">
      <template #title>
        <div class="top-bar">
          <slot name="actionbar"></slot>
          <slot name="toolbar"></slot>
        </div>
      </template>
      <template #header>
        <div class="top-bar">
          <slot name="actionbar"></slot>
          <slot name="toolbar"></slot>
        </div>
      </template>
      <fs-container>
        <!-- 默认插槽 -->
        <slot></slot>
        <!-- table -->
        <slot name="table"></slot>
        <slot name="form"></slot>
        <template #footer>
          <div class="fs-crud-footer">
            <slot name="footer-top"></slot>
            <slot name="pagination"></slot>
            <slot name="footer-bottom"></slot>
          </div>
        </template>
      </fs-container>
    </component>
  </fs-container>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from "vue";
import { useUi } from "../../use/use-ui";
/**
 * card布局
 */
export default defineComponent({
  name: "FsLayoutCard",
  setup() {
    const getCrudBinding = inject("get:crudBinding");
    const searchShow = computed(() => {
      if (getCrudBinding == null) {
        return true;
      }
      // @ts-ignore
      return getCrudBinding()?.search?.show;
    });

    const { ui } = useUi();

    const cardComponentName = ref(ui.card.name);
    return {
      searchShow,
      cardComponentName
    };
  }
});
</script>

<style lang="less">
.fs-layout-card {
  & > .box > .inner > .header {
    margin: 10px 10px 5px 10px;
  }
  & > .box > .inner > .body {
    margin: 5px 10px 10px 10px;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
  }

  .fs-layout-card-body {
    height: 100%;
    display: flex;
    flex-direction: column;
    .fs-container {
      padding: 0;
    }
    .ant-card-body {
      flex: 1;
      padding: 10px;
    }
    .el-card__body {
      flex: 1;
      padding: 10px;
    }
  }
}
</style>
