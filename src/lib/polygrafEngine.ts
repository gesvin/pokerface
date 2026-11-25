import { TRANSLATIONS } from "../data/i18n";
import type { SupportedLanguage } from "../data/questions";

export type SensorMode = "live" | "partial" | "fallback";

export interface PolygrafReading {
  tension: number; // 0 a 100
  voiceLevel: number; // 0 a 100
  motionLevel: number; // 0 a 100
  peakTension: number; // Pico máximo en la ronda
  mode: SensorMode;
  activeSources: string[];
  statusLabel: string;
}

export class PolygrafSensorEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;

  private rafId: number | null = null;
  private running = false;
  private onUpdate: (reading: PolygrafReading) => void;
  private language: SupportedLanguage;
  private forceFallback: boolean;

  private smoothedVoice = 0;
  private smoothedMotion = 0;
  private rawMotionSpike = 0;
  private peakTension = 0;
  private fallbackPhase = 0;

  private micEnabled = false;
  private motionEnabled = false;
  private motionListener: ((e: DeviceMotionEvent) => void) | null = null;

  constructor(
    onUpdate: (reading: PolygrafReading) => void,
    options?: { language?: SupportedLanguage; forceFallback?: boolean }
  ) {
    this.onUpdate = onUpdate;
    this.language = options?.language ?? "nl";
    this.forceFallback = options?.forceFallback ?? false;
  }

  public setLanguage(language: SupportedLanguage): void {
    this.language = language;
  }

  public async start(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.peakTension = 0;
    this.smoothedVoice = 0;
    this.smoothedMotion = 0;
    this.rawMotionSpike = 0;

    if (!this.forceFallback) {
      await Promise.allSettled([this.initMicrophone(), this.initMotion()]);
    }

    this.loop();
  }

  private async initMicrophone(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) return;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;

      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.75;
      source.connect(this.analyser);

      this.freqData = new Uint8Array(
        new ArrayBuffer(this.analyser.frequencyBinCount)
      );
      this.micEnabled = true;
    } catch {
      this.micEnabled = false;
    }
  }

  private async initMotion(): Promise<void> {
    if (typeof window.DeviceMotionEvent === "undefined") return;

    const DME = window.DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    try {
      if (typeof DME.requestPermission === "function") {
        const permissionState = await DME.requestPermission();
        if (permissionState !== "granted") {
          this.motionEnabled = false;
          return;
        }
      }

      this.motionListener = (event: DeviceMotionEvent) => {
        const acc = event.acceleration || event.accelerationIncludingGravity;
        if (!acc) return;

        const x = acc.x ?? 0;
        const y = acc.y ?? 0;
        const z = acc.z ?? 0;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        const delta = event.acceleration ? magnitude : Math.abs(magnitude - 9.81);

        const spike = Math.min(100, Math.max(0, (delta - 0.35) * 28));
        if (spike > this.rawMotionSpike) {
          this.rawMotionSpike = spike;
        }
      };

      window.addEventListener("devicemotion", this.motionListener, {
        passive: true,
      });
      this.motionEnabled = true;
    } catch {
      this.motionEnabled = false;
    }
  }

  private sampleVoice(): number {
    if (!this.micEnabled || !this.analyser || !this.freqData) return 0;

    this.analyser.getByteFrequencyData(this.freqData);
    let sum = 0;
    for (let i = 0; i < this.freqData.length; i++) {
      sum += this.freqData[i];
    }

    const avg = sum / this.freqData.length;
    const normalized = Math.min(100, Math.max(0, ((avg - 12) / 95) * 100));
    this.smoothedVoice += (normalized - this.smoothedVoice) * 0.25;
    return this.smoothedVoice;
  }

  private sampleMotion(): number {
    if (!this.motionEnabled) return 0;

    this.rawMotionSpike *= 0.86;
    this.smoothedMotion += (this.rawMotionSpike - this.smoothedMotion) * 0.3;
    return Math.min(100, this.smoothedMotion);
  }

  private loop = (): void => {
    if (!this.running) return;

    const dict = TRANSLATIONS[this.language];
    const voice = this.sampleVoice();
    const motion = this.sampleMotion();

    const activeSources: string[] = [];
    if (this.micEnabled) activeSources.push("mic");
    if (this.motionEnabled) activeSources.push("motion");

    let tension = 0;
    let mode: SensorMode = "fallback";
    let statusLabel = dict.sensorFallback;

    if (activeSources.length === 2) {
      mode = "live";
      tension = voice * 0.58 + motion * 0.42;
      statusLabel = dict.sensorLive;
    } else if (activeSources.length === 1) {
      mode = "partial";
      this.fallbackPhase += 0.045;
      const subtleBase = 16 + Math.sin(this.fallbackPhase) * 8;
      const sensorValue = this.micEnabled ? voice : motion;
      tension = sensorValue * 0.78 + subtleBase * 0.22;
      statusLabel = dict.sensorPartial;
    } else {
      mode = "fallback";
      this.fallbackPhase += 0.055;
      const wave =
        42 +
        Math.sin(this.fallbackPhase) * 18 +
        Math.cos(this.fallbackPhase * 2.3) * 10;
      tension = Math.min(95, Math.max(12, wave));
      statusLabel = dict.sensorFallback;
    }

    const finalTension = Math.round(Math.min(100, Math.max(0, tension)));
    if (finalTension > this.peakTension) {
      this.peakTension = finalTension;
    }

    this.onUpdate({
      tension: finalTension,
      voiceLevel: Math.round(this.micEnabled ? voice : finalTension * 0.6),
      motionLevel: Math.round(this.motionEnabled ? motion : finalTension * 0.5),
      peakTension: this.peakTension,
      mode,
      activeSources,
      statusLabel,
    });

    this.rafId = requestAnimationFrame(this.loop);
  };

  public stop(): void {
    this.running = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.motionListener) {
      window.removeEventListener("devicemotion", this.motionListener);
      this.motionListener = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }

    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }

    this.micEnabled = false;
    this.motionEnabled = false;
  }
}