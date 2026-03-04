"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function ParticlesBackground() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options: ISourceOptions = useMemo(
        () => ({
            fullScreen: false,
            fpsLimit: 30,
            particles: {
                number: {
                    value: 100,
                    limit: { value: 120 },
                    density: {
                        enable: true,
                        width: 1920,
                        height: 1080,
                    },
                },
                color: {
                    value: ["#00f0ff", "#00ff88", "#ff0060"],
                },
                shape: {
                    type: "circle",
                },
                opacity: {
                    value: { min: 0.1, max: 0.5 },
                    animation: {
                        enable: true,
                        speed: 0.5,
                        sync: false,
                    },
                },
                size: {
                    value: { min: 1, max: 3 },
                    animation: {
                        enable: true,
                        speed: 1,
                        sync: false,
                    },
                },
                links: {
                    enable: true,
                    distance: 150,
                    color: "#00f0ff",
                    opacity: 0.15,
                    width: 1,
                },
                move: {
                    enable: true,
                    speed: 0.8,
                    direction: "none" as const,
                    random: true,
                    straight: false,
                    outModes: {
                        default: "out" as const,
                    },
                },
            },
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "grab",
                    },
                    onClick: {
                        enable: false,
                    },
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: {
                            opacity: 0.4,
                            color: "#00f0ff",
                        },
                    },
                    push: {
                        quantity: 3,
                    },
                },
            },
            detectRetina: true,
        }),
        []
    );

    if (!init) return null;

    return (
        <Particles
            id="hero-particles"
            options={options}
            className="absolute inset-0 z-0"
        />
    );
}
