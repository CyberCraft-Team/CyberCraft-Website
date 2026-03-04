"use client";

import { useEffect, useRef } from "react";
import { SkinViewer, WalkingAnimation } from "skinview3d";

interface SkinViewer3DProps {
  skinUrl: string | null;
  capeUrl?: string | null;
  width?: number;
  height?: number;
}

export default function SkinViewer3D({
  skinUrl,
  capeUrl,
  width = 300,
  height = 400,
}: SkinViewer3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width,
      height,
    });

    viewer.animation = new WalkingAnimation();

    viewer.camera.position.set(20, 20, 40);
    viewer.camera.lookAt(0, 16, 0);

    viewer.controls.enableRotate = true;
    viewer.controls.enableZoom = true;
    viewer.controls.enablePan = false;

    viewerRef.current = viewer;

    return () => {
      viewer.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    if (!viewerRef.current || !skinUrl) return;

    const urlWithTimestamp = `${skinUrl}?t=${Date.now()}`;
    viewerRef.current.loadSkin(urlWithTimestamp);
  }, [skinUrl]);

  useEffect(() => {
    if (!viewerRef.current) return;

    if (capeUrl) {
      const urlWithTimestamp = `${capeUrl}?t=${Date.now()}`;
      viewerRef.current.loadCape(urlWithTimestamp);
    } else {
      viewerRef.current.loadCape(null);
    }
  }, [capeUrl]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg"
      />
    </div>
  );
}
