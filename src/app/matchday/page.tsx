"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "../eye-animation.css";

const MatchdayPage = () => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const eyes = document.querySelectorAll(".eye");
    console.log("Found eyes:", eyes.length);

    if (eyes.length === 0) {
      console.log("No eyes found in DOM");
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      eyes.forEach((eye) => {
        const iris = (eye as HTMLElement).querySelector(".iris") as HTMLElement;
        if (!iris) return;

        const rect = (eye as HTMLElement).getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = e.clientX - centerX;
        let dy = e.clientY - centerY;

        const max = 20;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > max) {
          dx = (dx / dist) * max;
          dy = (dy / dist) * max;
        }

        iris.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Video Background - loops, cannot be paused */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
        controls={false}
        disablePictureInPicture
        preload="auto"
      >
        <source src="/ca.mp4" type="video/mp4" />
      </video>

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Home Button */}
      <button
        onClick={() => window.location.href = "/"}
        className="absolute top-20 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all hover:bg-white/30 z-50 cursor-pointer"
        aria-label="Go to Home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center text-white">
        {/* 404 Text */}
        <h1 className="inline-block font-display text-[200px] leading-none tracking-wider text-white opacity-90 md:text-[140px]">
          <span className="text-red-500">C</span>
          <span className="text-white">O</span>
          <span className="text-red-500">M</span>
          <span className="text-white">I</span>
          <span className="text-red-500">N</span>
          <span className="text-white">G</span>
          <span> </span>
          <span className="text-white">S</span>
          <div className="inline-block">
            <div className="container" ref={containerRef}>
              <div className="eyes">
                <div className="eye" style={{ background: "radial-gradient(circle at 30% 30%, #b88686ff, #ce1c1cff)" }}>
                  <div className="iris" style={{ background: "radial-gradient(circle, #000000ff, #ffffffff)" }}>
                    <div className="pupil"></div>
                    <div className="shine"></div>
                  </div>
                  <div className="eyelid-top"></div>
                  <div className="eyelid-bottom"></div>
                </div>

                <div className="eye">
                  <div className="iris">
                    <div className="pupil"></div>
                    <div className="shine"></div>
                  </div>
                  <div className="eyelid-top"></div>
                  <div className="eyelid-bottom"></div>
                </div>
              </div>
            </div>
          </div>
          <span className="text-red-500">N</span>
        </h1>

        {/* Error message */}
        <p className="mt-8 text-lg font-light tracking-wider text-gray-200 md:text-xl">
          The page you are looking for is still under development
        </p>

        {/* Mute/Unmute Button */}
        <div className="absolute bottom-8 right-8">
          {/* Main Button */}
          <button
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-black/40 backdrop-blur-md transition-all duration-200 hover:bg-white/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => {
              toggleMute();
            }}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {/* Button Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              {isMuted ? (
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM16.5 12c0 1.77-1.02 3.29-2.5 4.03v2.06c2.89-.86 5-3.54 5-6.71s-2.11-5.85-5-6.71v2.06c1.48.73 2.5 2.25 2.5 4.02z" />
              )}
            </svg>

            {/* Ripple Effect on Click */}
            <span className="absolute inset-0 rounded-full bg-white/0 transition-all duration-300 group-active:bg-white/20 group-active:scale-150" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchdayPage;
