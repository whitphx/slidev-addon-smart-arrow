import { computed, ref, type Ref } from "vue";
import roughjs from "roughjs";

type RoughSVG = ReturnType<typeof roughjs.svg>;

const createArrowHeadSvg = (
  rc: RoughSVG,
  color: string,
  width: number,
): SVGGElement => {
  const arrowSize = 20;
  const arrowAngle = Math.PI / 6; // 30 degrees

  const x1 = -arrowSize * Math.cos(arrowAngle);
  const y1 = arrowSize * Math.sin(arrowAngle);
  const x2 = -arrowSize * Math.cos(arrowAngle);
  const y2 = arrowSize * Math.sin(-arrowAngle);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  const line1 = rc.line(x1, y1, 0, 0, {
    stroke: color,
    strokeWidth: width,
  });
  g.appendChild(line1);

  const line2 = rc.line(x2, y2, 0, 0, {
    stroke: color,
    strokeWidth: width,
  });
  g.appendChild(line2);

  return g;
};

export function useRoughArrow(props: {
  point1: Ref<{ x: number; y: number } | undefined>;
  point2: Ref<{ x: number; y: number } | undefined>;
  color: string;
  width: number;
  twoWay: boolean;
}) {
  const { point1, point2, color, width, twoWay } = props;

  const svg = ref<SVGSVGElement>(
    document.createElementNS("http://www.w3.org/2000/svg", "svg"),
  );
  const rc = ref(roughjs.svg(svg.value));

  const arrowHead1 = ref(
    createArrowHeadSvg(rc.value as RoughSVG, color, width),
  );
  const arrowHead2 = ref(
    createArrowHeadSvg(rc.value as RoughSVG, color, width),
  );

  const line = computed(() => {
    if (!point1.value || !point2.value) {
      return null;
    }

    return rc.value.line(
      point1.value.x,
      point1.value.y,
      point2.value.x,
      point2.value.y,
      {
        stroke: color,
        strokeWidth: width,
      },
    );
  });

  return computed(() => {
    svg.value.innerHTML = "";

    if (line.value == null || point1.value == null || point2.value == null) {
      return null;
    }

    svg.value.appendChild(line.value);

    const dx = point2.value.x - point1.value.x;
    const dy = point2.value.y - point1.value.y;
    const angle = Math.atan2(dy, dx);

    arrowHead2.value.setAttribute(
      "transform",
      `translate(${point2.value.x},${point2.value.y}) rotate(${(angle * 180) / Math.PI})`,
    );
    svg.value.appendChild(arrowHead2.value);

    if (twoWay) {
      arrowHead1.value.setAttribute(
        "transform",
        `translate(${point1.value.x},${point1.value.y}) rotate(${(angle * 180) / Math.PI + 180})`,
      );
      svg.value.appendChild(arrowHead1.value);
    }

    return svg.value.innerHTML;
  });
}
