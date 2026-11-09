"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

type Point = { x: number; y: number };
type Transform = Point & { scale: number };
const initial: Transform = { x: 0, y: 0, scale: 1 };
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export function usePhotoGestures({
  photo,
  onNext,
  onPrevious,
  onClose,
  canNavigate = true,
}: {
  photo: string;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  canNavigate?: boolean;
}) {
  const [transform, setTransform] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const value = useRef(initial);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{
    start: Point;
    transform: Transform;
    distance: number;
    pinched: boolean;
  } | null>(null);
  const lastTap = useRef<{ point: Point; time: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const enteringFrom = useRef(0);

  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cssTransform = (next: Transform) =>
    `translate(${next.x}px, ${next.y}px) scale(${next.scale})`;

  function finishSwipe(direction: -1 | 1 | "close") {
    const image = imageRef.current;
    const action =
      direction === "close" ? onClose : direction === -1 ? onNext : onPrevious;
    if (!image || reducedMotion()) {
      update(initial);
      action();
      return;
    }
    const destination =
      direction === "close"
        ? { x: value.current.x, y: window.innerHeight, scale: 0.9 }
        : { x: direction * window.innerWidth, y: 0, scale: 1 };
    enteringFrom.current = direction === "close" ? 0 : -direction;
    const animation = image.animate(
      [
        { transform: cssTransform(value.current), opacity: 1 },
        {
          transform: cssTransform(destination),
          opacity: direction === "close" ? 0 : 0.5,
        },
      ],
      {
        duration: 180,
        easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
        fill: "forwards",
      },
    );
    animationRef.current = animation;
    void animation.finished
      .then(() => {
        if (animationRef.current !== animation) return;
        animationRef.current = null;
        animation.cancel();
        update(initial);
        action();
      })
      .catch(() => {});
  }

  function update(next: Transform) {
    value.current = next;
    setTransform(next);
  }

  useEffect(() => {
    animationRef.current?.cancel();
    animationRef.current = null;
    value.current = initial;
    setTransform(initial);
    setDragging(false);
    pointers.current.clear();
    gesture.current = null;
    lastTap.current = null;
    const image = imageRef.current;
    if (image && enteringFrom.current && !reducedMotion()) {
      const animation = image.animate(
        [
          {
            transform: `translateX(${enteringFrom.current * 48}px)`,
            opacity: 0.5,
          },
          { transform: cssTransform(initial), opacity: 1 },
        ],
        { duration: 180, easing: "cubic-bezier(0.2, 0.7, 0.2, 1)" },
      );
      animationRef.current = animation;
      void animation.finished
        .then(() => {
          if (animationRef.current === animation) animationRef.current = null;
        })
        .catch(() => {});
    }
    enteringFrom.current = 0;
    return () => {
      animationRef.current?.cancel();
      animationRef.current = null;
    };
  }, [photo]);

  function bounded(image: HTMLImageElement, next: Transform): Transform {
    if (next.scale <= 1) return initial;
    const fit = Math.min(
      image.clientWidth / (image.naturalWidth || image.clientWidth),
      image.clientHeight / (image.naturalHeight || image.clientHeight),
    );
    const maxX = Math.max(
      0,
      ((image.naturalWidth || image.clientWidth) * fit * next.scale -
        image.clientWidth) /
        2,
    );
    const maxY = Math.max(
      0,
      ((image.naturalHeight || image.clientHeight) * fit * next.scale -
        image.clientHeight) /
        2,
    );
    return {
      scale: next.scale,
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }

  function begin() {
    const points = [...pointers.current.values()];
    if (!points.length) return;
    gesture.current = {
      start: points.length > 1 ? midpoint(points[0], points[1]) : points[0],
      distance: points.length > 1 ? distance(points[0], points[1]) : 0,
      transform: value.current,
      pinched: points.length > 1,
    };
  }

  return {
    transform,
    dragging,
    props: {
      ref: imageRef,
      "data-dragging": dragging,
      draggable: false,
      onPointerDown(event: PointerEvent<HTMLImageElement>) {
        if (animationRef.current) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
        setDragging(true);
        begin();
      },
      onPointerMove(event: PointerEvent<HTMLImageElement>) {
        if (!pointers.current.has(event.pointerId) || !gesture.current) return;
        pointers.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
        const points = [...pointers.current.values()];
        const start = gesture.current;
        if (points.length > 1) {
          if (!start.distance) return;
          const scale = Math.max(
            1,
            Math.min(
              4,
              (start.transform.scale * distance(points[0], points[1])) /
                start.distance,
            ),
          );
          const ratio = scale / start.transform.scale;
          const middle = midpoint(points[0], points[1]);
          const image = event.currentTarget;
          const parent = image.parentElement!.getBoundingClientRect();
          const centerX =
            parent.left + image.offsetLeft + image.clientWidth / 2;
          const centerY = parent.top + image.offsetTop + image.clientHeight / 2;
          update(
            bounded(image, {
              scale,
              x:
                middle.x -
                centerX -
                (start.start.x - centerX - start.transform.x) * ratio,
              y:
                middle.y -
                centerY -
                (start.start.y - centerY - start.transform.y) * ratio,
            }),
          );
        } else if (start.transform.scale > 1) {
          update(
            bounded(event.currentTarget, {
              scale: start.transform.scale,
              x: start.transform.x + event.clientX - start.start.x,
              y: start.transform.y + event.clientY - start.start.y,
            }),
          );
        } else {
          const dx = event.clientX - start.start.x;
          const dy = event.clientY - start.start.y;
          const horizontal = Math.abs(dx) > Math.abs(dy);
          update({
            scale: 1,
            x: horizontal ? dx * (canNavigate ? 1 : 0.2) : dx * 0.15,
            y: horizontal ? 0 : dy * (dy > 0 ? 1 : 0.2),
          });
        }
      },
      onPointerUp(event: PointerEvent<HTMLImageElement>) {
        if (!pointers.current.has(event.pointerId)) return;
        pointers.current.delete(event.pointerId);
        const start = gesture.current;
        if (pointers.current.size) {
          begin();
          // Lifting the second finger must never count as a tap or swipe.
          if (gesture.current) gesture.current.pinched = true;
          return;
        }
        gesture.current = null;
        setDragging(false);
        if (!start || start.pinched) {
          update(bounded(event.currentTarget, value.current));
          return;
        }
        const point = { x: event.clientX, y: event.clientY };
        const dx = point.x - start.start.x;
        const dy = point.y - start.start.y;
        if (Math.hypot(dx, dy) < 12) {
          const previous = lastTap.current;
          const now = Date.now();
          if (
            previous &&
            now - previous.time < 320 &&
            distance(previous.point, point) < 32
          ) {
            update(
              value.current.scale > 1 ? initial : { ...initial, scale: 2.5 },
            );
            lastTap.current = null;
          } else {
            lastTap.current = { point, time: now };
            if (value.current.scale === 1) update(initial);
          }
        } else {
          lastTap.current = null;
          if (start.transform.scale > 1) return;
          if (
            canNavigate &&
            Math.abs(dx) >= 50 &&
            Math.abs(dx) > Math.abs(dy) * 1.5
          ) {
            finishSwipe(dx < 0 ? -1 : 1);
          } else if (dy >= 100 && dy > Math.abs(dx) * 1.5) {
            finishSwipe("close");
          } else update(initial);
        }
      },
      onPointerCancel() {
        pointers.current.clear();
        gesture.current = null;
        lastTap.current = null;
        setDragging(false);
        if (value.current.scale === 1) update(initial);
      },
    },
  };
}
