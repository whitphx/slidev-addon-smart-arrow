<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref, reactive, onMounted, computed } from "vue";
import { makeId } from "@slidev/client/logic/utils.ts";
import { useSlideContext, onSlideEnter } from "@slidev/client";
import roughjs from "roughjs";

const props = defineProps<{
  id1?: string;
  id2?: string;
  pos1?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topleft"
    | "topright"
    | "bottomleft"
    | "bottomright";
  pos2?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "topleft"
    | "topright"
    | "bottomleft"
    | "bottomright";
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  rough?: boolean;
  width?: number | string;
  color?: string;
  twoWay?: boolean;
}>();

const { $scale } = useSlideContext();

// DOM element refs
const elem1 = ref<HTMLElement | null>(null);
const elem2 = ref<HTMLElement | null>(null);

// Reactive point values
const point1 = reactive({ x: props.x1, y: props.y1 });
const point2 = reactive({ x: props.x2, y: props.y2 });

// Update functions for each point.
const updatePoint1 = () => {
  if (elem1.value) {
    const rect = elem1.value?.getBoundingClientRect();
    const parentRect = elem1.value?.offsetParent?.getBoundingClientRect();
    let x = (rect.left - (parentRect?.left ?? 0)) / $scale.value;
    let y = (rect.top - (parentRect?.top ?? 0)) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

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
    point1.x = x;
    point1.y = y;
  }
};

const updatePoint2 = () => {
  if (elem2.value) {
    const rect = elem2.value.getBoundingClientRect();
    const parentRect = elem2.value.offsetParent?.getBoundingClientRect();
    let x = (rect.left - (parentRect?.left ?? 0)) / $scale.value;
    let y = (rect.top - (parentRect?.top ?? 0)) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

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
    point2.x = x;
    point2.y = y;
  }
};

// A single update function to refresh both points.
const updatePoints = () => {
  updatePoint1();
  updatePoint2();
};

onMounted(() => {
  if (props.id1) {
    elem1.value = document.getElementById(props.id1);
    if (elem1.value) {
      const observer = new MutationObserver(updatePoints);
      observer.observe(elem1.value, { attributes: true });
      const parent = elem1.value.offsetParent;
      if (parent) {
        const parentObserver = new MutationObserver(updatePoints);
        parentObserver.observe(parent, { attributes: true });
      }
    }
  }
  if (props.id2) {
    elem2.value = document.getElementById(props.id2);
    if (elem2.value) {
      const observer = new MutationObserver(updatePoints);
      observer.observe(elem2.value, { attributes: true });
      const parent = elem2.value.offsetParent;
      if (parent) {
        const parentObserver = new MutationObserver(updatePoints);
        parentObserver.observe(parent, { attributes: true });
      }
    }
  }
  updatePoints(); // Do an initial update.
});

// Also update when the slide is entered.
onSlideEnter(() => {
  setTimeout(updatePoints);
});

const emit = defineEmits(["dblclick", "clickOutside"]);
const id = makeId();

const markerAttrs = {
  markerUnits: "strokeWidth",
  markerHeight: 7,
  refY: 3.5,
  orient: "auto",
};

const roughSvg = computed(() => {
  if (!props.rough) return null;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const rc = roughjs.svg(svg);

  // Calculate arrow direction and position
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const angle = Math.atan2(dy, dx);

  // Arrow head size
  const arrowSize = 20;
  const arrowAngle = Math.PI / 6; // 30 degrees

  // Create rough line
  const line = rc.line(point1.x, point1.y, point2.x, point2.y, {
    stroke: props.color || "currentColor",
    strokeWidth: Number(props.width) || 2,
  });

  // Create arrow heads
  const elementSVGs = [line.outerHTML];

  // Function to create arrow head points
  const createArrowHead = (tipX: number, tipY: number, baseAngle: number) => {
    const x1 = tipX - arrowSize * Math.cos(baseAngle - arrowAngle);
    const y1 = tipY - arrowSize * Math.sin(baseAngle - arrowAngle);
    const x2 = tipX - arrowSize * Math.cos(baseAngle + arrowAngle);
    const y2 = tipY - arrowSize * Math.sin(baseAngle + arrowAngle);

    return (
      rc.line(x1, y1, tipX, tipY, {
        stroke: props.color || "currentColor",
        strokeWidth: Number(props.width) || 2,
      }).outerHTML +
      rc.line(x2, y2, tipX, tipY, {
        stroke: props.color || "currentColor",
        strokeWidth: Number(props.width) || 2,
      }).outerHTML
    );
  };

  // Forward arrow
  elementSVGs.push(createArrowHead(point2.x, point2.y, angle));

  // Reverse arrow for two-way
  if (props.twoWay) {
    elementSVGs.push(createArrowHead(point1.x, point1.y, angle + Math.PI));
  }

  return elementSVGs.join("");
});

const clickArea = ref<HTMLElement>();
onClickOutside(clickArea, () => emit("clickOutside"));
</script>

<template>
  <svg
    class="absolute left-0 top-0"
    :width="Math.max(point1.x, point2.x) + 50"
    :height="Math.max(point1.y, point2.y) + 50"
  >
    <template v-if="props.rough">
      <g v-html="roughSvg" @dblclick="emit('dblclick')" />
    </template>
    <template v-else>
      <defs>
        <marker :id="id" markerWidth="10" refX="9" v-bind="markerAttrs">
          <polygon
            points="0 0, 10 3.5, 0 7"
            :fill="color || 'currentColor'"
            @dblclick="emit('dblclick')"
          />
        </marker>
        <marker
          v-if="twoWay"
          :id="`${id}-rev`"
          markerWidth="20"
          refX="11"
          v-bind="markerAttrs"
        >
          <polygon
            points="20 0, 10 3.5, 20 7"
            :fill="color || 'currentColor'"
            @dblclick="emit('dblclick')"
          />
        </marker>
      </defs>
      <line
        :x1="point1.x"
        :y1="point1.y"
        :x2="point2.x"
        :y2="point2.y"
        :stroke="color || 'currentColor'"
        :stroke-width="width || 2"
        :marker-end="`url(#${id})`"
        :marker-start="twoWay ? `url(#${id}-rev)` : 'none'"
        @dblclick="emit('dblclick')"
      />
    </template>
    <line
      ref="clickArea"
      :x1="point1.x"
      :y1="point1.y"
      :x2="point2.x"
      :y2="point2.y"
      stroke="transparent"
      stroke-linecap="round"
      :stroke-width="20"
      @dblclick="emit('dblclick')"
    />
  </svg>
</template>
