import { computed, ref } from "vue";
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
  point1: { x: number; y: number };
  point2: { x: number; y: number };
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
    return rc.value.line(point1.x, point1.y, point2.x, point2.y, {
      stroke: color,
      strokeWidth: width,
    });
  });

  return computed(() => {
    svg.value.innerHTML = "";

    svg.value.appendChild(line.value);

    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const angle = Math.atan2(dy, dx);

    arrowHead2.value.setAttribute(
      "transform",
      `translate(${point2.x},${point2.y}) rotate(${(angle * 180) / Math.PI})`,
    );
    svg.value.appendChild(arrowHead2.value);

    if (twoWay) {
      arrowHead1.value.setAttribute(
        "transform",
        `translate(${point1.x},${point1.y}) rotate(${(angle * 180) / Math.PI + 180})`,
      );
      svg.value.appendChild(arrowHead1.value);
    }

    return svg.value.innerHTML;
  });
}
