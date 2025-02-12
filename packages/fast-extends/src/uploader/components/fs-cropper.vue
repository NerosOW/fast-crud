<template>
  <component
    :is="$fsui.dialog.name"
    ref="cropperDialogRef"
    v-model:[$fsui.dialog.visible]="dialogVisible"
    append-to-body
    width="900px"
    :close-on-click-modal="true"
    v-bind="dialogBinding"
    :destroy-on-close="false"
  >
    <div class="fs-cropper-dialog-wrap">
      <input v-show="false" ref="fileInputRef" type="file" :accept="accept" @change="handleChange" />
      <!-- step1 -->
      <div v-show="!isLoaded" class="fs-cropper-dialog__choose fs-cropper-dialog_left">
        <fs-button round text="+选择图片" @click="showFileChooser" />
        <p>{{ _uploadTip }}</p>
      </div>
      <!-- step2 -->
      <div v-show="isLoaded" class="fs-cropper-dialog__edit fs-cropper-dialog_left">
        <div class="fs-cropper-dialog__edit-area">
          <vue-cropper
            ref="cropperRef"
            :src="imgSrc"
            preview=".preview"
            :style="{ height: _cropperHeight }"
            v-bind="_cropper"
          />
        </div>
        <div class="tool-bar">
          <component :is="$fsui.buttonGroup.name">
            <fs-button v-for="(item, index) of computedButtons" :key="index" v-bind="item" />
          </component>
        </div>
      </div>
      <div class="fs-cropper-dialog__preview">
        <span class="fs-cropper-dialog__preview-title">预览</span>
        <div class="fs-cropper-dialog__preview-120 preview"></div>
        <div class="fs-cropper-dialog__preview-65 preview" :class="{ round: _cropper.aspectRatio === 1 }"></div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <fs-button size="small" text="取消" @click="handleClose" />
        <fs-button type="primary" size="small" text="确定" @click="doCropper()" />
      </div>
    </template>
  </component>
</template>

<script>
import { ref, computed } from "vue";
import VueCropper from "./utils/vue-cropperjs.js";
import "cropperjs/dist/cropper.css";
import { uiContext, useI18n } from "@fast-crud/fast-crud";
// 图片裁剪对话框，封装cropperjs
export default {
  name: "FsCropper",
  components: {
    VueCropper
  },
  props: {
    // 对话框标题
    title: {
      type: String,
      default: "图片裁剪"
    },
    // cropper的高度，默认为浏览器可视窗口高度的40%，最小270
    cropperHeight: {
      type: [String, Number]
    },
    // 对话框宽度，默认50%
    dialogWidth: {
      type: [String, Number],
      default: "50%"
    },
    // 图片大小限制，单位MB，0为不限制
    maxSize: {
      type: Number,
      default: 5
    },
    // 上传提示
    uploadTip: {
      type: String
    },
    // cropperjs的参数，详见：https://github.com/fengyuanchen/cropperjs
    cropper: {
      type: Object
    },
    // 可接收的文件后缀
    accept: {
      type: String,
      default: ".jpg, .jpeg, .png, .gif, .webp"
    },
    // 输出类型，blob,dataUrl,all
    output: {
      type: String,
      default: "blob" // blob
    }
  },
  emits: ["cancel", "done", "ready"],
  setup(props, ctx) {
    const { t } = useI18n();
    const ui = uiContext.get();
    const dialogVisible = ref(false);
    const cropperRef = ref();
    const fileInputRef = ref();
    const isLoaded = ref(false);
    const imgSrc = ref();
    const data = ref();
    const file = ref();
    const scale = ref({
      x: 1,
      y: 1
    });
    // 点击关闭弹窗
    function handleClose() {
      dialogVisible.value = false;
    }

    function handleClosed() {
      ctx.emit("cancel");
    }
    const vClosed = ui.dialog.buildOnClosedBind(handleClosed);
    const customClass = ui.dialog.customClass;
    const dialogBinding = ref({
      ...vClosed,
      [customClass]: "fs-cropper-dialog",
      ...ui.formWrapper.buildWidthBind(ui.dialog.name, "960px"),
      ...ui.formWrapper.buildInitBind(ui.dialog.name)
    });

    function open(url) {
      dialogVisible.value = true;
      if (url != null && url !== "") {
        imgSrc.value = url;
      }
    }
    function close() {
      dialogVisible.value = false;
    }
    function clear() {
      isLoaded.value = false;
      if (fileInputRef.value != null) {
        fileInputRef.value = null;
      }
      if (cropperRef.value != null) {
        cropperRef.value.clear();
      }
    }
    // 获取vue-cropper组件对象
    function getCropperRef() {
      return cropperRef.value;
    }

    function ready(event) {
      console.info("cropper ready:", event);
      // this.zoom(-0.3)
      ctx.emit("ready");
    }
    function preventDefault(e) {
      e.preventDefault();
      return false;
    }
    // 点击按钮打开文件资源窗口
    function handleClick() {
      fileInputRef.value.click();
    }

    // 检测选择的文件是否合适
    function checkFile(file) {
      // 仅限图片
      if (file.type.indexOf("image") === -1) {
        ui.message.warn("请选择合适的文件类型");
        return false;
      }
      // 超出大小
      if (props.maxSize > 0 && file.size / 1024 / 1024 > props.maxSize) {
        ui.message.warn(`图片大小超出最大限制（${props.maxSize}MB），请重新选择.`);
        return false;
      }
      return true;
    }

    function setImage(e) {
      const selectFile = e.target.files[0];
      if (selectFile.type.indexOf("image/") === -1) {
        ui.message.warn("Please select an image file");
        return;
      }
      if (typeof FileReader === "function") {
        const reader = new FileReader();
        reader.onload = (event) => {
          imgSrc.value = event.target.result;
          // rebuild cropperjs with the updated source
          cropperRef.value.replace(event.target.result);
        };
        reader.readAsDataURL(selectFile);
      } else {
        ui.message.error("Sorry, FileReader API not supported");
      }
    }
    // 触发input框的change事件选择图片
    function handleChange(e) {
      e.preventDefault();
      const files = e.target.files || e.dataTransfer.files;
      isLoaded.value = true;
      const selectedFile = files[0];
      if (checkFile(selectedFile)) {
        file.value = selectedFile;
        setImage(e);
        // setTimeout(() => {
        //   this.zoom(-0.3)
        // }, 1)
      }
    }

    function getCropImageDataUrl() {
      // get image data for post processing, e.g. upload or setting image src
      return cropperRef.value.getCroppedCanvas().toDataURL();
    }
    function getCropImageBlob(callback, type, quality) {
      return cropperRef.value.getCroppedCanvas().toBlob(callback, type, quality);
    }
    function emit(result) {
      console.info("crop done:", result);
      ctx.emit("done", result);
    }
    function doOutput(file) {
      console.info("output this:", this);
      const ret = { file };
      if (props.output === "all") {
        getCropImageBlob((blob) => {
          const dataUrl = getCropImageDataUrl();
          ret.blob = blob;
          ret.dataUrl = dataUrl;
          emit(ret);
        });
        return;
      }

      if (props.output === "blob") {
        getCropImageBlob((blob) => {
          ret.blob = blob;
          emit(ret);
        });
        return;
      }
      if (props.output === "dataUrl") {
        ret.dataUrl = getCropImageDataUrl();
        emit(ret);
      }
    }

    function doCropper() {
      if (!isLoaded.value) {
        ui.message.warn("请先选择图片");
        return;
      }
      dialogVisible.value = false;
      doOutput(file.value);
    }

    function flipX() {
      cropperRef.value.scaleX((scale.value.x *= -1));
    }
    function flipY() {
      cropperRef.value.scaleY((scale.value.y *= -1));
    }
    function getCropBoxData() {
      data.value = JSON.stringify(cropperRef.value.getCropBoxData(), null, 4);
    }
    function getData() {
      data.value = JSON.stringify(cropperRef.value.getData(), null, 4);
    }
    function move(offsetX, offsetY) {
      cropperRef.value.move(offsetX, offsetY);
    }
    function reset() {
      cropperRef.value.reset();
    }
    function rotate(deg) {
      cropperRef.value.rotate(deg);
    }
    function setCropBoxData() {
      if (!this.data) return;
      cropperRef.value.setCropBoxData(JSON.parse(data.value));
    }
    function setData() {
      if (!this.data) return;
      cropperRef.value.setData(JSON.parse(data.value));
    }

    function showFileChooser() {
      fileInputRef.value.click();
    }
    function zoom(percent) {
      cropperRef.value.relativeZoom(percent);
    }

    const computedButtons = computed(() => {
      const size = "small";
      const round = true;
      const buttons = [
        {
          size,
          round,
          icon: ui.icons.edit,
          text: t("fs.extends.cropper.reChoose"),
          onClick() {
            handleClick();
          }
        },
        {
          size,
          round,
          text: t("fs.extends.cropper.flipX"),
          onClick() {
            flipX();
          }
        },
        {
          size,
          round,
          text: t("fs.extends.cropper.flipY"),
          onClick() {
            flipY();
          }
        },
        {
          size,
          round,
          icon: ui.icons.zoomIn,
          onClick() {
            zoom(0.1);
          }
        },
        {
          size,
          round,
          icon: ui.icons.zoomOut,
          onClick() {
            zoom(-0.1);
          }
        },
        {
          size,
          round,
          icon: ui.icons.refreshLeft,
          onClick() {
            rotate(90);
          }
        },
        {
          size,
          round,
          icon: ui.icons.refreshRight,
          onClick() {
            rotate(-90);
          }
        },
        {
          size,
          round,
          icon: ui.icons.refresh,
          text: t("fs.extends.cropper.reset"),
          onClick() {
            reset();
          }
        }
      ];

      return buttons;
    });

    return {
      cropperRef,
      fileInputRef,
      dialogVisible,
      dialogBinding,
      isLoaded,
      imgSrc,
      data,
      file,
      scale,
      computedButtons,
      handleClose,
      setData,
      handleClosed,
      close,
      showFileChooser,
      zoom,
      setCropBoxData,
      rotate,
      reset,
      move,
      getData,
      getCropBoxData,
      flipY,
      flipX,
      doCropper,
      doOutput,
      getCropImageBlob,
      getCropImageDataUrl,
      handleChange,
      setImage,
      checkFile,
      handleClick,
      preventDefault,
      open,
      clear,
      getCropperRef,
      ready
    };
  },
  data() {
    return {};
  },
  computed: {
    _uploadTip() {
      if (this.uploadTip != null && this.uploadTip !== "") {
        return this.uploadTip;
      }
      if (this.maxSize > 0) {
        return `只支持${this.accept.replace(/,/g, "、")},大小不超过${this.maxSize}M`;
      } else {
        return `只支持${this.accept},大小无限制`;
      }
    },
    _cropper() {
      const def = {
        aspectRatio: 1,
        ready: this.ready
      };
      if (this.cropper == null) {
        return def;
      }
      const assign = Object.assign(def, this.cropper);
      console.info("cropper options:", assign);
      return assign;
    },
    _cropperHeight() {
      let height = this.cropperHeight;
      if (height == null) {
        height = document.documentElement.clientHeight * 0.55;
        if (height < 270) {
          height = 270;
        }
      }
      if (typeof height === "number") {
        height += "px";
      }
      return height;
    },
    _dialogWidth() {
      let width = this.dialogWidth;
      if (width == null) {
        width = "50%";
      }
      if (typeof width === "number") {
        width += "px";
      }
      return width;
    }
  }
};
</script>

<style lang="less">
//@width: 10px;
//@height: @width + 10px;
.fs-cropper-dialog {
  &-wrap {
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    padding-bottom: 20px;
  }
  .dialog-footer {
    > .fs-button {
      margin: 2px;
    }
  }

  &_left {
    font-size: 13px;
    color: #999999;
    position: relative;
    background: #ecf2f6;
    flex-grow: 5;
    margin: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }

  &__choose {
    p {
      width: 100%;
      text-align: center;
    }
  }

  &__edit {
    &-area {
      width: 100%;
      overflow: hidden;

      &-img {
        object-fit: cover;
      }
    }
    .tool-bar {
      margin: 10px;
      position: absolute;
      bottom: -50px;
    }
  }

  &__preview {
    background: #ecf2f6;
    text-align: center;
    width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 13px;
    margin: 10px;
    padding: 10px;
    &-title {
      color: #999999;
    }
    .preview {
      overflow: hidden;
      margin: 10px;
      border: 1px #cacaca solid;
    }
    .round {
      border-radius: 500px;
    }

    img {
      background: #fff;
      margin-top: 5px;
      border-radius: 500px;
    }

    &-120 {
      height: 120px;
      width: 120px;
    }

    &-65 {
      height: 65px;
      width: 65px;
    }

    &-40 {
      height: 30px;
      width: 30px;
    }
  }
}
</style>
