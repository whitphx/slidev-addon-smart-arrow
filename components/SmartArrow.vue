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
import { useSlideContext, onSlideEnter } from "@slidev/client";
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

const trigger = ref<number>(0);
const onChange = () => {
  trigger.value++;
}
const elem1 = ref<HTMLElement | null>(null);
const elem2 = ref<HTMLElement | null>(null);
onMounted(() => {
  if (props.id1) {
    elem1.value = document.getElementById(props.id1)
    if (elem1.value) {
      const observer = new MutationObserver(onChange)
      observer.observe(elem1.value, { attributes: true });

      const elem1OffsetParent = elem1.value.offsetParent
      if (elem1OffsetParent) {
        const observer = new MutationObserver(onChange)
        observer.observe(elem1OffsetParent, { attributes: true });
      }
    }
  }
  if (props.id2) {
    elem2.value = document.getElementById(props.id2)
    if (elem2.value) {
      const observer = new MutationObserver(onChange)
      observer.observe(elem2.value, { attributes: true });

      const elem2OffsetParent = elem2.value.offsetParent
      if (elem2OffsetParent) {
        const observer = new MutationObserver(onChange)
        observer.observe(elem2OffsetParent, { attributes: true });
      }
    }
  }
});
onSlideEnter(() => {
  setTimeout(() => {
    trigger.value++;
  });
})
const point1 = computed(() => {
  trigger.value;  // Trigger re-computation
  const elem1Rect = elem1.value?.getBoundingClientRect();
  const elem1OffsetParentRect = elem1.value?.offsetParent?.getBoundingClientRect();
  if (elem1Rect) {
    let x = (elem1Rect.left - (elem1OffsetParentRect?.left ?? 0)) / $scale.value;
    let y = (elem1Rect.top - (elem1OffsetParentRect?.top ?? 0)) / $scale.value;
    const width = elem1Rect.width / $scale.value;
    const height = elem1Rect.height / $scale.value;

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
  trigger.value;  // Trigger re-computation
  if (elem2.value) {
    const elem2Rect = elem2.value.getBoundingClientRect();
    const elem2OffsetParentRect = elem2.value.offsetParent?.getBoundingClientRect();
    let x = (elem2Rect.left - (elem2OffsetParentRect?.left ?? 0)) / $scale.value;
    let y = (elem2Rect.top - (elem2OffsetParentRect?.top ?? 0)) / $scale.value;
    const width = elem2Rect.width / $scale.value;
    const height = elem2Rect.height / $scale.value;

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
