<!-- Copied from https://github.com/slidevjs/slidev/blob/149790750bf561ef48e141f4a080057cc96a39db/packages/client/builtin/Arrow.vue -->
<!--

Simple Arrow

<arrow x1="10" y1="20" x2="100" y2="200" color="green" width="3" />

<arrow v-bind="{ x1:10, y1:10, x2:200, y2:200 }"/>

-->

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { ref, computed, onMounted } from 'vue'
import { makeId } from '@slidev/client/logic/utils.ts'
import { useSlideContext } from "@slidev/client";
const props = defineProps<{
  id1?: string;
  id2?: string;
  pos1?: "top" | "bottom" | "left" | "right" | "topleft" | "topright" | "bottomleft" | "bottomright";
  pos2?: "top" | "bottom" | "left" | "right" | "topleft" | "topright" | "bottomleft" | "bottomright";
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  width?: number | string;
  color?: string;
  twoWay?: boolean;
}>();

const { $scale } = useSlideContext();

const elem1Rect = ref<DOMRect | null>(null);
const elem2Rect = ref<DOMRect | null>(null);
const elem1OffsetParentRect = ref<DOMRect | null>(null);
const elem2OffsetParentRect = ref<DOMRect | null>(null);
onMounted(() => {
  if (props.id1) {
    const elem = document.getElementById(props.id1)
    if (elem) {
      const onChange = () => {
        elem1Rect.value = elem.getBoundingClientRect()
      }
      onChange();
      const observer = new MutationObserver(onChange)
      observer.observe(elem, { attributes: true });

      const elem1OffsetParent = elem.offsetParent
      if (elem1OffsetParent) {
        const onChange = () => {
          elem1OffsetParentRect.value = elem1OffsetParent.getBoundingClientRect()
        }
        onChange();
        const observer = new MutationObserver(onChange)
        observer.observe(elem1OffsetParent, { attributes: true });
      }
    }
  }
  if (props.id2) {
    const elem = document.getElementById(props.id2)
    if (elem) {
      const onChange = () => {
        elem2Rect.value = elem.getBoundingClientRect()
      }
      onChange();
      const observer = new MutationObserver(onChange)
      observer.observe(elem, { attributes: true });

      const elem2OffsetParent = elem.offsetParent
      if (elem2OffsetParent) {
        const onChange = () => {
          elem2OffsetParentRect.value = elem2OffsetParent.getBoundingClientRect()
        }
        onChange();
        const observer = new MutationObserver(onChange)
        observer.observe(elem2OffsetParent, { attributes: true });
      }
    }
  }
});
const point1 = computed(() => {
  if (elem1Rect.value) {
    let x = (elem1Rect.value.left - (elem1OffsetParentRect.value?.left ?? 0)) / $scale.value;
    let y = (elem1Rect.value.top - (elem1OffsetParentRect.value?.top ?? 0)) / $scale.value;
    const width = elem1Rect.value.width / $scale.value;
    const height = elem1Rect.value.height / $scale.value;

    if (props.pos1?.includes("right")) {
      x += width;
    } else if (!props.pos1?.includes("left")) {
      x += width / 2;
    }
    if (props.pos1?.includes("bottom")) {
      y += height;
    } else if (!props.pos1?.includes("top")) {
      y += height / 2;
    }
    return { x, y }
  }
  return { x: 0, y: 0 }
});

const point2 = computed(() => {
  if (elem2Rect.value) {
    let x = (elem2Rect.value.left - (elem2OffsetParentRect.value?.left ?? 0)) / $scale.value;
    let y = (elem2Rect.value.top - (elem2OffsetParentRect.value?.top ?? 0)) / $scale.value;
    const width = elem2Rect.value.width / $scale.value;
    const height = elem2Rect.value.height / $scale.value;

    if (props.pos2?.includes("right")) {
      x += width;
    } else if (!props.pos2?.includes("left")) {
      x += width / 2;
    }
    if (props.pos2?.includes("bottom")) {
      y += height;
    } else if (!props.pos2?.includes("top")) {
      y += height / 2;
    }
    return { x, y }
  }
  return { x: 0, y: 0 }
})

const emit = defineEmits(['dblclick', 'clickOutside'])

const id = makeId()

const markerAttrs = {
  markerUnits: 'strokeWidth',
  markerHeight: 7,
  refY: 3.5,
  orient: 'auto',
}

const clickArea = ref<HTMLElement>()
onClickOutside(clickArea, () => emit('clickOutside'))
</script>

<template>
  <svg
    class="absolute left-0 top-0"
    :width="Math.max(+point1.x, +point2.x) + 50"
    :height="Math.max(+point1.y, +point2.y) + 50"
  >
    <defs>
      <marker :id="id" markerWidth="10" refX="9" v-bind="markerAttrs">
        <polygon points="0 0, 10 3.5, 0 7" :fill="color || 'currentColor'" @dblclick="emit('dblclick')" />
      </marker>
      <marker v-if="twoWay" :id="`${id}-rev`" markerWidth="20" refX="11" v-bind="markerAttrs">
        <polygon points="20 0, 10 3.5, 20 7" :fill="color || 'currentColor'" @dblclick="emit('dblclick')" />
      </marker>
    </defs>
    <line
      :x1="point1.x" :y1="point1.y" :x2="point2.x" :y2="point2.y"
      :stroke="color || 'currentColor'"
      :stroke-width="width || 2"
      :marker-end="`url(#${id})`"
      :marker-start="twoWay ? `url(#${id}-rev)` : 'none'"
      @dblclick="emit('dblclick')"
    />
    <line
      ref="clickArea"
      :x1="point1.x" :y1="point1.y" :x2="point2.x" :y2="point2.y"
      stroke="transparent"
      stroke-linecap="round"
      :stroke-width="20"
      @dblclick="emit('dblclick')"
    />
  </svg>
</template>
