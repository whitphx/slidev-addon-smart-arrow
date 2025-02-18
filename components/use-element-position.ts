import { ref, reactive, onMounted } from "vue";
import { useSlideContext, onSlideEnter } from "@slidev/client";

export type SnapPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "topleft"
  | "topright"
  | "bottomleft"
  | "bottomright";

export function useElementPosition(
  id: string,
  pos?: SnapPosition,
): { x: number; y: number } {
  const { $scale } = useSlideContext();
  const elem = ref<HTMLElement | null>(null);
  const point = reactive({ x: 0, y: 0 });

  const updatePoint = () => {
    if (!elem.value) return;

    const rect = elem.value.getBoundingClientRect();
    const parentRect = elem.value.offsetParent?.getBoundingClientRect();

    let x = (rect.left - (parentRect?.left ?? 0)) / $scale.value;
    let y = (rect.top - (parentRect?.top ?? 0)) / $scale.value;
    const width = rect.width / $scale.value;
    const height = rect.height / $scale.value;

    if (pos?.includes("right")) {
      x += width;
    } else if (!pos?.includes("left")) {
      x += width / 2;
    }
    if (pos?.includes("bottom")) {
      y += height;
    } else if (!pos?.includes("top")) {
      y += height / 2;
    }

    point.x = x;
    point.y = y;
  };

  onSlideEnter(() => {
    updatePoint();
  });

  onMounted(() => {
    elem.value = document.getElementById(id);
    if (elem.value) {
      const observer = new MutationObserver(updatePoint);
      observer.observe(elem.value, { attributes: true });

      const parent = elem.value.offsetParent;
      if (parent) {
        const parentObserver = new MutationObserver(updatePoint);
        parentObserver.observe(parent, { attributes: true });
      }
    }
    updatePoint();
  });

  return point;
}
