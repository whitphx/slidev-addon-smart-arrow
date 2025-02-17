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
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  width?: number | string;
  color?: string;
  twoWay?: boolean;
}>();

const { $scale } = useSlideContext();

const elem1 = ref<HTMLElement | null>(null)
const elem2 = ref<HTMLElement | null>(null)
onMounted(() => {
  if (props.id1) {
    elem1.value = document.getElementById(props.id1);
  }
  if (props.id2) {
    elem2.value = document.getElementById(props.id2)
  }
});
const pos1 = computed(() => {
  if (elem1.value) {
    const elem1OffsetParent = elem1.value.offsetParent;
    const elem1OffsetParentRect = elem1OffsetParent?.getBoundingClientRect();
    const rect1 = elem1.value.getBoundingClientRect();
    return {
      x: (rect1.left - (elem1OffsetParentRect?.left ?? 0)) / $scale.value,
      y: (rect1.top - (elem1OffsetParentRect?.top ?? 0)) / $scale.value,
    }
  }
  return { x: 0, y: 0 }
});

const pos2 = computed(() => {
  if (elem2.value) {
    const elem2OffsetParent = elem2.value.offsetParent;
    const elem2OffsetParentRect = elem2OffsetParent?.getBoundingClientRect();
    const rect2 = elem2.value.getBoundingClientRect();
    return {
      x: (rect2.left - (elem2OffsetParentRect?.left ?? 0)) / $scale.value,
      y: (rect2.top - (elem2OffsetParentRect?.top ?? 0)) / $scale.value,
    }
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
    :width="Math.max(+pos1.x, +pos2.x) + 50"
    :height="Math.max(+pos1.y, +pos2.y) + 50"
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
      :x1="pos1.x" :y1="pos1.y" :x2="pos2.x" :y2="pos2.y"
      :stroke="color || 'currentColor'"
      :stroke-width="width || 2"
      :marker-end="`url(#${id})`"
      :marker-start="twoWay ? `url(#${id}-rev)` : 'none'"
      @dblclick="emit('dblclick')"
    />
    <line
      ref="clickArea"
      :x1="pos1.x" :y1="pos1.y" :x2="pos2.x" :y2="pos2.y"
      stroke="transparent"
      stroke-linecap="round"
      :stroke-width="20"
      @dblclick="emit('dblclick')"
    />
  </svg>
</template>
