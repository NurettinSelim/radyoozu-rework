"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  playCountdownBlip,
  playGo,
  playMiss,
  playRoundEnd,
  playTimeTick,
  playWhack,
} from "@/lib/game-sfx";
import { cn } from "@/lib/utils";

export type MoleTarget = {
  name: string;
  initials: string;
  from: string;
  to: string;
};

type Phase = "idle" | "countdown" | "running" | "over";

type ActiveMole = {
  hole: number;
  target: MoleTarget;
  whacked: boolean;
};

const ROUND_SECONDS = 30;
const HOLES = 9;
const UP_MS_START = 900;
const UP_MS_END = 450;
const GAP_MS_MIN = 150;
const GAP_MS_MAX = 400;
const WHACK_ANIM_MS = 180;
const COUNTDOWN_STEP_MS = 700;
const BEST_KEY = "radyoozu.whack.best";
const SFX_KEY = "radyoozu.whack.sfx";
const HOLE_INDICES = Array.from({ length: HOLES }, (_, index) => index);

export function WhackAMole({ targets }: { targets: MoleTarget[] }) {
  const t = useTranslations("Game");
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [mole, setMole] = useState<ActiveMole | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [countdownStep, setCountdownStep] = useState(3);
  const [sfxOn, setSfxOn] = useState(true);
  const [hits, setHits] = useState<{ id: number; hole: number }[]>([]);

  const endAtRef = useRef(0);
  const peepTimeoutRef = useRef<number | undefined>(undefined);
  const hideTimeoutRef = useRef<number | undefined>(undefined);
  const tickIntervalRef = useRef<number | undefined>(undefined);
  const countdownTimeoutRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef<Phase>("idle");
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const moleRef = useRef<ActiveMole | null>(null);
  const previousHoleRef = useRef(-1);
  const sfxOnRef = useRef(true);
  const hitIdRef = useRef(0);
  const lastTickSecondRef = useRef(-1);

  useEffect(() => {
    const loadBestTimeout = window.setTimeout(() => {
      try {
        const storedBest = Number.parseInt(
          localStorage.getItem(BEST_KEY) ?? "",
          10,
        );
        if (Number.isFinite(storedBest) && storedBest > 0) {
          bestRef.current = storedBest;
          setBest(storedBest);
        }
        if (localStorage.getItem(SFX_KEY) === "off") {
          sfxOnRef.current = false;
          setSfxOn(false);
        }
      } catch {
        // Storage can be unavailable in privacy modes; the in-memory score still works.
      }
    }, 0);

    return () => {
      window.clearTimeout(loadBestTimeout);
      window.clearTimeout(peepTimeoutRef.current);
      window.clearTimeout(hideTimeoutRef.current);
      window.clearTimeout(countdownTimeoutRef.current);
      window.clearInterval(tickIntervalRef.current);
    };
  }, []);

  function clearTimers() {
    window.clearTimeout(peepTimeoutRef.current);
    window.clearTimeout(hideTimeoutRef.current);
    window.clearInterval(tickIntervalRef.current);
    window.clearTimeout(countdownTimeoutRef.current);
    peepTimeoutRef.current = undefined;
    hideTimeoutRef.current = undefined;
    tickIntervalRef.current = undefined;
    countdownTimeoutRef.current = undefined;
  }

  function toggleSfx() {
    const nextSfxOn = !sfxOnRef.current;
    sfxOnRef.current = nextSfxOn;
    setSfxOn(nextSfxOn);

    if (nextSfxOn) playGo();

    try {
      localStorage.setItem(SFX_KEY, nextSfxOn ? "on" : "off");
    } catch {
      // The toggle still works for this visit if persistence is unavailable.
    }
  }

  function updateMole(nextMole: ActiveMole | null) {
    moleRef.current = nextMole;
    setMole(nextMole);
  }

  function endRound() {
    if (phaseRef.current !== "running") return;

    phaseRef.current = "over";
    clearTimers();
    updateMole(null);
    setTimeLeft(0);
    setPhase("over");

    const finalScore = scoreRef.current;
    const previousBest = bestRef.current;
    const beatBest = finalScore > previousBest;
    setIsNewBest(beatBest);
    if (sfxOnRef.current) playRoundEnd(beatBest);
    setHits([]);

    if (beatBest) {
      bestRef.current = finalScore;
      setBest(finalScore);
      try {
        localStorage.setItem(BEST_KEY, String(finalScore));
      } catch {
        // Keep the new record for this visit if persistence is unavailable.
      }
    }
  }

  function scheduleNextPeep(delay: number) {
    if (phaseRef.current !== "running") return;

    peepTimeoutRef.current = window.setTimeout(() => {
      if (phaseRef.current !== "running") return;

      let hole = Math.floor(Math.random() * HOLES);
      if (hole === previousHoleRef.current) {
        hole =
          (hole + 1 + Math.floor(Math.random() * (HOLES - 1))) % HOLES;
      }
      previousHoleRef.current = hole;

      const target = targets[Math.floor(Math.random() * targets.length)];
      const nextMole: ActiveMole = { hole, target, whacked: false };
      updateMole(nextMole);

      const roundStartedAt = endAtRef.current - ROUND_SECONDS * 1000;
      const elapsedSeconds = Math.min(
        ROUND_SECONDS,
        Math.max(0, (Date.now() - roundStartedAt) / 1000),
      );
      const upMs =
        UP_MS_START +
        (UP_MS_END - UP_MS_START) * (elapsedSeconds / ROUND_SECONDS);

      hideTimeoutRef.current = window.setTimeout(() => {
        if (
          phaseRef.current !== "running" ||
          moleRef.current !== nextMole ||
          nextMole.whacked
        ) {
          return;
        }
        updateMole(null);
        scheduleNextPeep(
          GAP_MS_MIN + Math.random() * (GAP_MS_MAX - GAP_MS_MIN),
        );
      }, upMs);
    }, delay);
  }

  function startRound(startedAt: number, firstGap: number) {
    clearTimers();
    scoreRef.current = 0;
    previousHoleRef.current = -1;
    lastTickSecondRef.current = -1;
    endAtRef.current = startedAt + ROUND_SECONDS * 1000;
    phaseRef.current = "running";

    setScore(0);
    setHits([]);
    setTimeLeft(ROUND_SECONDS);
    setIsNewBest(false);
    updateMole(null);
    setPhase("running");

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((endAtRef.current - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining !== lastTickSecondRef.current) {
        lastTickSecondRef.current = remaining;
        if (remaining <= 5 && remaining > 0 && sfxOnRef.current) {
          playTimeTick();
        }
      }
      if (remaining === 0) endRound();
    };

    tickIntervalRef.current = window.setInterval(tick, 250);
    scheduleNextPeep(firstGap);
  }

  function scheduleCountdownStep(step: number) {
    countdownTimeoutRef.current = window.setTimeout(() => {
      if (phaseRef.current !== "countdown") return;

      if (step > 0) {
        setCountdownStep(step);
        if (sfxOnRef.current) playCountdownBlip();
        scheduleCountdownStep(step - 1);
        return;
      }

      startRound(
        Date.now(),
        GAP_MS_MIN + Math.random() * (GAP_MS_MAX - GAP_MS_MIN),
      );
      if (sfxOnRef.current) playGo();
    }, COUNTDOWN_STEP_MS);
  }

  function beginCountdown() {
    clearTimers();
    setIsNewBest(false);
    setHits([]);
    phaseRef.current = "countdown";
    setPhase("countdown");
    setCountdownStep(3);
    if (sfxOnRef.current) playCountdownBlip();
    scheduleCountdownStep(2);
  }

  function catchMole(hole: number) {
    if (phaseRef.current !== "running") return;

    const currentMole = moleRef.current;
    if (!currentMole || currentMole.hole !== hole) {
      if (sfxOnRef.current) playMiss();
      return;
    }
    if (currentMole.whacked) return;

    if (sfxOnRef.current) playWhack(scoreRef.current);
    const caughtMole = { ...currentMole, whacked: true };
    updateMole(caughtMole);
    setHits((currentHits) => [
      ...currentHits,
      { id: hitIdRef.current++, hole },
    ]);
    scoreRef.current += 1;
    setScore(scoreRef.current);

    window.clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = window.setTimeout(() => {
      if (
        phaseRef.current !== "running" ||
        moleRef.current !== caughtMole
      ) {
        return;
      }
      updateMole(null);
      scheduleNextPeep(
        GAP_MS_MIN + Math.random() * (GAP_MS_MAX - GAP_MS_MIN),
      );
    }, WHACK_ANIM_MS);
  }

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/40 select-none touch-manipulation">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-70"
          style={{
            background:
              "radial-gradient(120% 100% at 0% 0%, rgba(187,32,93,0.22) 0%, transparent 55%), radial-gradient(120% 100% at 100% 100%, rgba(70,33,85,0.35) 0%, transparent 55%)",
          }}
        />

        <div className="mb-4 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 sm:gap-3">
          <div className="flex items-center justify-between gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-widest sm:text-xs">
            <span className="text-foreground/60">{t("score")}</span>
            <strong
              key={score}
              aria-live="polite"
              className={cn(
                "tabular-nums text-foreground",
                score > 0 && "score-bump",
              )}
            >
              {score}
            </strong>
          </div>
          <div
            className={cn(
              "flex items-center justify-between gap-2 rounded-full border bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-widest sm:text-xs",
              phase === "running" && timeLeft <= 5
                ? "border-primary/60"
                : "border-white/10",
            )}
          >
            <span className="text-foreground/60">{t("time")}</span>
            <strong
              className={cn(
                "tabular-nums text-foreground",
                phase === "running" &&
                  timeLeft <= 5 &&
                  "animate-pulse text-primary",
              )}
            >
              {timeLeft}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.65rem] uppercase tracking-widest sm:text-xs">
            <span className="text-foreground/60">{t("best")}</span>
            <strong className="tabular-nums text-foreground">
              {best > 0 ? best : "—"}
            </strong>
          </div>
          <button
            type="button"
            onClick={toggleSfx}
            aria-label={sfxOn ? t("sfxMute") : t("sfxUnmute")}
            aria-pressed={sfxOn}
            className="relative flex size-8 items-center justify-center self-center rounded-full border border-white/10 bg-white/5 text-foreground/60 transition-[background-color,border-color,color] duration-150 ease-out after:absolute after:-inset-1 hover:border-white/20 hover:text-foreground"
          >
            <span className="relative flex size-3.5 items-center justify-center">
              <Volume2
                className={cn(
                  "size-3.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  sfxOn
                    ? "scale-100 opacity-100 blur-0"
                    : "scale-[0.25] opacity-0 blur-[4px]",
                )}
              />
              <VolumeX
                className={cn(
                  "absolute size-3.5 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
                  sfxOn
                    ? "scale-[0.25] opacity-0 blur-[4px]"
                    : "scale-100 opacity-100 blur-0",
                )}
              />
            </span>
          </button>
        </div>

        <div className="relative">
          <div
            className="grid grid-cols-3 gap-3 sm:gap-4"
            style={{
              cursor:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Ctext y='26' font-size='26'%3E%F0%9F%94%A8%3C/text%3E%3C/svg%3E\") 6 26, pointer",
            }}
          >
            {HOLE_INDICES.map((hole) => {
              const isOccupied = mole?.hole === hole;
              const visualTarget = isOccupied
                ? mole.target
                : targets[hole % targets.length];
              const isCaught = isOccupied && mole.whacked;

              return (
                <button
                  key={hole}
                  type="button"
                  tabIndex={phase === "running" ? 0 : -1}
                  aria-disabled={phase !== "running"}
                  aria-label={
                    isOccupied
                      ? t("whackAria", { name: mole.target.name })
                      : t("emptyHoleAria", { number: hole + 1 })
                  }
                  onPointerDown={() => catchMole(hole)}
                  className="relative aspect-square overflow-hidden rounded-xl bg-white/[0.04] shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)] outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-primary/70 motion-safe:active:scale-[0.96]"
                >
                  <span
                    aria-hidden
                    className="absolute bottom-[10%] left-[12%] h-[22%] w-[76%] rounded-[50%] bg-black/40 shadow-[inset_0_4px_10px_rgba(0,0,0,0.35)]"
                  />
                  <span
                    aria-hidden
                    className={`absolute bottom-[12%] left-[15%] flex aspect-square w-[70%] will-change-transform items-center justify-center rounded-full text-xl font-semibold text-white opacity-0 shadow-[0_6px_12px_rgba(0,0,0,0.35)] outline outline-1 -outline-offset-1 outline-white/10 ease-[cubic-bezier(0.2,0,0,1)] motion-safe:transition-[transform,opacity] motion-reduce:transition-opacity sm:text-3xl ${
                      isCaught
                        ? "opacity-0 motion-safe:translate-y-[25%] motion-safe:scale-x-[1.15] motion-safe:scale-y-[0.6]"
                        : isOccupied
                          ? "opacity-100 motion-safe:translate-y-0"
                          : "motion-safe:translate-y-[110%]"
                    }`}
                    style={{
                      backgroundImage: `radial-gradient(120% 120% at 30% 25%, rgba(255,255,255,0.35) 0%, transparent 45%), linear-gradient(135deg, ${visualTarget.from}, ${visualTarget.to})`,
                      transitionDuration: `${isCaught ? WHACK_ANIM_MS : 200}ms`,
                    }}
                  >
                    {visualTarget.initials}
                  </span>
                  {hits
                    .filter((hit) => hit.hole === hole)
                    .map((hit) => (
                      <span
                        key={hit.id}
                        aria-hidden
                        className="pointer-events-none absolute inset-0 flex items-center justify-center"
                      >
                        <span className="hit-ring absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#f4eaca]/80" />
                        <span
                          className="score-pop text-lg font-semibold text-[#f4eaca]"
                          onAnimationEnd={() =>
                            setHits((currentHits) =>
                              currentHits.filter(
                                (currentHit) => currentHit.id !== hit.id,
                              ),
                            )
                          }
                        >
                          +1
                        </span>
                      </span>
                    ))}
                </button>
              );
            })}
          </div>

          {phase !== "running" ? (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/60 p-6 text-center backdrop-blur-sm">
              {phase === "idle" ? (
                <Button
                  type="button"
                  size="lg"
                  onClick={beginCountdown}
                  className="h-11 rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] px-7 text-white"
                >
                  {t("start")}
                </Button>
              ) : phase === "countdown" ? (
                <span
                  key={countdownStep}
                  className="countdown-pop text-7xl font-semibold tabular-nums text-[#f4eaca]"
                >
                  {countdownStep}
                </span>
              ) : (
                <div className="flex flex-col items-center">
                  <h2 className="enter-rise text-3xl font-semibold text-balance">
                    {t("finalTitle")}
                  </h2>
                  <p className="enter-rise enter-delay-1 mt-2 text-sm text-foreground/70">
                    {t("finalScore", { score })}
                  </p>
                  <div className="enter-rise enter-delay-2 flex flex-col items-center">
                    {isNewBest ? (
                      <span className="mt-3 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                        {t("newBest")}
                      </span>
                    ) : null}
                    <Button
                      type="button"
                      size="lg"
                      onClick={beginCountdown}
                      className="mt-5 h-11 rounded-full bg-gradient-to-br from-[#bb205d] to-[#94205a] px-7 text-white"
                    >
                      {t("playAgain")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-medium uppercase tracking-widest text-foreground/60">
          {t("rosterTitle")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {targets.map((target) => (
            <span
              key={target.name}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground/80"
            >
              <span
                aria-hidden
                className="size-2.5 rounded-full outline outline-1 -outline-offset-1 outline-white/10"
                style={{
                  background: `linear-gradient(135deg, ${target.from}, ${target.to})`,
                }}
              />
              {target.name}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm text-foreground/60">{t("hint")}</p>
    </div>
  );
}
