"use client";

import React, { useState, useEffect } from "react";
import CongratsModal from "@/app/components/CongratsModal";
import useGameProgress from "@/hooks/useGameProgress";

export default function GlobalModals() {
  const { state } = useGameProgress();
  const allCompleted = state.classicDone && state.quoteDone && state.bannerDone;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!allCompleted) {
      setShowModal(false);
      return;
    }

    const todayKey = `congratsShown-${new Date().toISOString().slice(0, 10)}`;
    const alreadyShown = localStorage.getItem(todayKey);

    if (!alreadyShown) {
      setShowModal(true);
      localStorage.setItem(todayKey, "1");
    } else {
      setShowModal(false);
    }
  }, [allCompleted]);

  return (
    <CongratsModal show={showModal} onClose={() => setShowModal(false)} />
  );
}
