'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type Source = { src: string; width: number; height: number };
type State = 'off' | 'buffering' | 'playing' | 'paused' | 'blocked';
type AutoplayNavigator = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
  getAutoplayPolicy?: (element: HTMLMediaElement) => 'allowed' | 'allowed-muted' | 'disallowed';
};

/**
 * Decorative hero loop layered over a server-rendered poster (the LCP image).
 * The source is attached only after hydration and never with reduced motion, Save-Data or a 2G/3G
 * connection; screens below 48rem get the square crop. Playback starts (autoplay attribute, and
 * explicitly on `canplaythrough`) only once the browser has enough data to play through, so the
 * first frame shown is frame 0, the same image as the poster: the video appears without a jump or
 * a ghosted cross-fade and does not stall. A slow, failed or refused video simply leaves the
 * poster; refused autoplay offers the play button. No scroll coupling. The pause/resume button is
 * required for moving content longer than five seconds (WCAG 2.2.2).
 */
export function HeroVideo({ desktop, mobile, labels }: { desktop: Source; mobile: Source; labels: { pause: string; play: string } }) {
  const ref = useRef<HTMLVideoElement>(null);
  const revealed = useRef(false);
  const userPlay = useRef(false);
  const userPaused = useRef(false);
  const [state, setState] = useState<State>('off');
  const wideSrc = desktop.src;
  const narrowSrc = mobile.src;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const nav = navigator as AutoplayNavigator;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Save-Data or a 2G/3G-class connection: the poster only (the loop needs ~2–8 Mbit/s to run smoothly).
    const constrained = nav.connection?.saveData === true || /[23]g$/.test(nav.connection?.effectiveType ?? '');
    let smoothFrom = -1;
    let kick: ReturnType<typeof setTimeout> | undefined;

    const show = () => {
      revealed.current = true;
      setState('playing');
    };
    const refused = (error: DOMException) => {
      if (error.name === 'NotAllowedError') setState('blocked');
    };
    const start = () => {
      clearTimeout(kick);
      if (reduce.matches || constrained) {
        video.pause();
        revealed.current = false;
        setState('off');
        return;
      }
      if (!video.getAttribute('src')) {
        // Autoplay policies require muted playback; React does not reflect `muted` during hydration.
        video.muted = true;
        video.preload = 'auto';
        video.src = window.matchMedia('(min-width: 48rem)').matches ? wideSrc : narrowSrc;
      }
      if (nav.getAutoplayPolicy?.(video) === 'disallowed') {
        video.autoplay = false;
        setState('blocked');
        return;
      }
      setState(revealed.current ? 'playing' : 'buffering');
      if (revealed.current || userPlay.current) {
        video.play().catch(refused);
        return;
      }
      // Browsers that never report enough data before playback (some mobile Safari modes): ask once,
      // so a refusal shows the play button; an accepted start is revealed once it runs smoothly.
      kick = setTimeout(() => {
        if (video.paused && !userPaused.current) video.play().catch(refused);
      }, 4000);
    };
    const onPlaying = () => {
      smoothFrom = video.currentTime;
      if (revealed.current || userPlay.current || video.readyState === HTMLMediaElement.HAVE_ENOUGH_DATA) show();
    };
    const onWaiting = () => {
      smoothFrom = -1;
    };
    // Fallback for playback that started early: reveal after two seconds without a stall.
    const onTime = () => {
      if (!revealed.current && smoothFrom >= 0 && video.currentTime - smoothFrom >= 2) show();
    };
    // Enough data to play through: start from frame 0 (the poster) unless the visitor paused.
    const onEnough = () => {
      if (userPaused.current) return;
      if (video.paused) video.play().catch(refused);
      else show();
    };
    const onError = () => {
      clearTimeout(kick);
      revealed.current = false;
      setState('off');
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('canplaythrough', onEnough);
    video.addEventListener('error', onError);
    reduce.addEventListener('change', start);
    start();
    return () => {
      clearTimeout(kick);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('canplaythrough', onEnough);
      video.removeEventListener('error', onError);
      reduce.removeEventListener('change', start);
      video.pause();
    };
  }, [wideSrc, narrowSrc]);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (state === 'playing') {
      userPaused.current = true;
      video.pause();
      setState('paused');
      return;
    }
    userPaused.current = false;
    userPlay.current = true;
    video.play().catch(() => setState('blocked'));
  }

  const controllable = state === 'playing' || state === 'paused' || state === 'blocked';
  const label = state === 'playing' ? labels.pause : labels.play;

  return (
    <>
      <video
        ref={ref}
        className="hero__video"
        data-state={state}
        width={desktop.width}
        height={desktop.height}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      />
      {controllable ? (
        <button type="button" className="hero__toggle" onClick={toggle} aria-label={label} title={label}>
          <Icon name={state === 'playing' ? 'pause' : 'play'} size={16} />
        </button>
      ) : null}
    </>
  );
}
