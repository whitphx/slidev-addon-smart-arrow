<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";
import { ref, computed } from "vue";
import { makeId } from "@slidev/client/logic/utils.ts";
import { useElementPosition, type SnapPosition } from "./use-element-position";
import roughjs from "roughjs";

const props = defineProps<{
  id1?: string;
  id2?: string;
  pos1?: SnapPosition;
  pos2?: SnapPosition;
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  rough?: boolean;
  width?: number | string;
  color?: string;
  twoWay?: boolean;
}>();

const point1 = props.id1
  ? useElementPosition(props.id1, props.pos1)
  : { x: Number(props.x1 ?? 0), y: Number(props.y1 ?? 0) };
const point2 = props.id2
  ? useElementPosition(props.id2, props.pos2)
  : { x: Number(props.x2 ?? 0), y: Number(props.y2 ?? 0) };

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

  // Create rough line
  const line = rc.line(point1.x, point1.y, point2.x, point2.y, {
    stroke: props.color || "currentColor",
    strokeWidth: Number(props.width) || 2,
  });
  svg.appendChild(line);

  const createArrowHead = (): SVGGElement => {
    const arrowSize = 20;
    const arrowAngle = Math.PI / 6; // 30 degrees

    const x1 = -arrowSize * Math.cos(arrowAngle);
    const y1 = arrowSize * Math.sin(arrowAngle);
    const x2 = -arrowSize * Math.cos(arrowAngle);
    const y2 = arrowSize * Math.sin(-arrowAngle);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const line1 = rc.line(x1, y1, 0, 0, {
      stroke: props.color || "currentColor",
      strokeWidth: Number(props.width) || 2,
    });
    g.appendChild(line1);

    const line2 = rc.line(x2, y2, 0, 0, {
      stroke: props.color || "currentColor",
      strokeWidth: Number(props.width) || 2,
    });
    g.appendChild(line2);

    return g;
  };

  const head1 = createArrowHead();
  head1.setAttribute(
    "transform",
    `translate(${point2.x},${point2.y}) rotate(${(angle * 180) / Math.PI})`,
  );
  svg.appendChild(head1);

  if (props.twoWay) {
    const head2 = createArrowHead();
    head2.setAttribute(
      "transform",
      `translate(${point1.x},${point1.y}) rotate(${((angle + Math.PI) * 180) / Math.PI})`,
    );
    svg.appendChild(head2);
  }

  return svg.innerHTML;
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
