import React, { useEffect, useRef, useState } from 'react';
import { generateAiDocument } from '@/lib/ai.functions';
import {
  Download,
  Film,
  Loader2,
  Megaphone,
  Pause,
  Play,
  Share2,
  Sparkles,
  Video,
} from 'lucide-react';
import { AdConfig, Language } from '@/types';
import { checkClientRateLimit, sanitizeUserInput } from '@/utils/appSecurity';
import { AdSlot } from './AdSlot';

interface VideoStudioViewProps {
  lang: Language;
  adConfig: AdConfig;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

type StudioMode = 'video_studio' | 'ad_studio';

interface StoryboardScene {
  headline: string;
  caption: string;
}

const AD_PLATFORMS = ['TikTok', 'YouTube Shorts', 'Facebook Reels', 'Instagram Reels', 'Telegram Channel'] as const;

function parseStoryboardScenes(text: string, fallbackTitle: string): StoryboardScene[] {
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[#*\-\d.)\s]+/, '').trim())
    .filter((l) => l.length > 8);

  if (lines.length === 0) {
    return [
      { headline: fallbackTitle || 'AddisVault Studio', caption: 'Opening hook & visual headline frame' },
      { headline: 'Core Message & Offer', caption: 'Clear value delivered for Ethiopian audiences' },
      { headline: 'Call to Action', caption: 'Order via Telebirr / Visit Today' },
    ];
  }

  const scenes: StoryboardScene[] = [];
  for (let i = 0; i < Math.min(lines.length, 6); i++) {
    const line = lines[i];
    const parts = line.split(/[:—\-|]/);
    scenes.push({
      headline: (parts[0] || `Scene ${i + 1}`).slice(0, 48),
      caption: (parts.slice(1).join(' ').trim() || line).slice(0, 110),
    });
  }
  return scenes;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = word;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
  }
}

export const VideoStudioView: React.FC<VideoStudioViewProps> = ({
  adConfig,
  lang,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const [mode, setMode] = useState<StudioMode>('video_studio');
  const [title, setTitle] = useState('');
  const [promptText, setPromptText] = useState('');
  const [visualStyle, setVisualStyle] = useState('Modern Ethiopian Motion');
  const [durationSec, setDurationSec] = useState(45);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['TikTok', 'YouTube Shorts']);

  const [scriptOutput, setScriptOutput] = useState<string>('');
  const [scenes, setScenes] = useState<StoryboardScene[]>(() =>
    parseStoryboardScenes('', 'AddisVault Motion Studio')
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(p)) {
        return prev.length > 1 ? prev.filter((item) => item !== p) : prev;
      }
      return [...prev, p];
    });
  };

  const handleGenerate = async () => {
    if (!title.trim() && !promptText.trim()) {
      setErrorMsg('Please enter a video topic, product name, or script idea first.');
      return;
    }
    if (!checkClientRateLimit('video_studio_ai', 10)) {
      setErrorMsg('Rate limit reached. Wait a minute before generating again.');
      return;
    }

    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const res = await generateAiDocument({
        data: {
          toolTitle:
            mode === 'video_studio'
              ? `AI Video Studio (${durationSec}s · ${visualStyle})`
              : `AI Video Ad Studio (${selectedPlatforms.join(', ')} · ${durationSec}s)`,
          language: lang,
          systemInstruction:
            mode === 'video_studio'
              ? 'You are an Ethiopian Motion Graphics & Video Director. Write a crisp scene-by-scene storyboard (4–6 scenes) with clear timestamps, voiceover lines, and bold on-screen overlay captions ready for automated rendering.'
              : 'You are a high-converting Ethiopian social media video ad strategist. Write a 4–6 scene video ad script tailored for TikTok/YouTube/Facebook/Instagram/Telegram with Hook (0-3s), Product Proof, Local Telebirr Offer, and Direct Call-To-Action.',
          inputs: {
            ProjectTitle: sanitizeUserInput(title, 120),
            PromptAndOffer: sanitizeUserInput(promptText, 1200),
            DurationSeconds: String(durationSec),
            VisualStyle: visualStyle,
            TargetPlatforms: mode === 'ad_studio' ? selectedPlatforms.join(', ') : 'General HD Video',
          },
        },
      });

      if (!res.content) {
        setErrorMsg(res.error || 'Could not generate AI video storyboard.');
        return;
      }

      setScriptOutput(res.content);
      setScenes(parseStoryboardScenes(res.content, title || 'AddisVault Studio'));
      setIsPlaying(true);
    } catch {
      setErrorMsg('Network error reaching AI Video Studio.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Animated HTML5 Canvas storyboard renderer.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const start = performance.now();

    const drawFrame = (now: number) => {
      const elapsedSec = isPlaying ? (now - start) / 1000 : 0;
      const w = canvas.width;
      const h = canvas.height;
      const activeScenes = scenes.length > 0 ? scenes : [{ headline: 'AddisVault Video Studio', caption: 'Ready to render' }];
      const sceneDuration = Math.max(2, durationSec / activeScenes.length);
      const sceneIdx = Math.floor((elapsedSec / sceneDuration) % activeScenes.length);
      const scene = activeScenes[sceneIdx];
      const progress = (elapsedSec % durationSec) / Math.max(1, durationSec);

      // Emerald & gold animated gradient background
      const grad = ctx.createLinearGradient(0, 0, w, h);
      if (mode === 'ad_studio') {
        grad.addColorStop(0, '#022c22');
        grad.addColorStop(0.6, '#065f46');
        grad.addColorStop(1, '#78350f');
      } else {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.65, '#047857');
        grad.addColorStop(1, '#111827');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Motion decorative ring
      const pulse = 18 + Math.sin(elapsedSec * 2.2) * 8;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(w - 76, 76, 36 + pulse * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Top metadata badge
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(
        `${mode === 'ad_studio' ? 'AD STUDIO' : 'VIDEO STUDIO'} · SCENE ${sceneIdx + 1}/${activeScenes.length} · ${durationSec}s`,
        32,
        42
      );

      // Scene headline
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      wrapText(ctx, scene.headline, 32, 118, w - 64, 34);

      // Scene caption
      ctx.fillStyle = '#d1fae5';
      ctx.font = '18px sans-serif';
      wrapText(ctx, scene.caption, 32, 200, w - 64, 26);

      // Bottom progress bar
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.fillRect(32, h - 28, w - 64, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(32, h - 28, (w - 64) * progress, 6);

      if (isPlaying) {
        animFrameRef.current = requestAnimationFrame(drawFrame);
      }
    };

    animFrameRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [scenes, durationSec, mode, isPlaying]);

  const handleDownloadStoryboardHtml = () => {
    const slug = (title || 'addisvault-video').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title || 'AddisVault Video'}</title><style>body{font-family:system-ui,sans-serif;max-width:780px;margin:40px auto;padding:0 20px;line-height:1.65;color:#1c1917;}h1{color:#065f46;}pre{white-space:pre-wrap;background:#f5f5f4;padding:16px;border-radius:12px;}</style></head><body><h1>${sanitizeUserInput(title || 'AddisVault Video Production', 120)}</h1><p><strong>Mode:</strong> ${mode} · <strong>Duration:</strong> ${durationSec}s · <strong>Style:</strong> ${visualStyle}</p><pre>${sanitizeUserInput(scriptOutput || scenes.map((s, i) => `Scene ${i + 1}: ${s.headline} — ${s.caption}`).join('\n'), 15000)}</pre></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-storyboard.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const shareText = encodeURIComponent(
    `${title || 'Check out my video'} — Created with AddisVault AI Studio`
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <AdSlot
        slot="top_banner"
        adConfig={adConfig}
        lang={lang}
        onTrackImpression={onTrackAdImpression}
        onTrackClick={onTrackAdClick}
      />

      {/* Header & Mode Switch */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Film className="h-4 w-4" />
            <span>AI Video &amp; Commercial Ad Studio · የቪዲዮ እና ማስታወቂያ ስቱዲዮ</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            AI Video Storyboard &amp; Ad Studio
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-stone-600 dark:text-stone-400">
            Create animated storyboards, marketing scripts, and motion previews, then download your project as a standalone HTML file.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setMode('video_studio')}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              mode === 'video_studio'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>AI Video Storyboard</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('ad_studio')}
            className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              mode === 'ad_studio'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-700 dark:text-stone-300'
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span>AI Video Ad Storyboard</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Controls */}
        <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {mode === 'ad_studio' ? 'Product / Brand Headline *' : 'Video Title / Topic *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                mode === 'ad_studio'
                  ? 'e.g. Sheba Roasted Coffee Grand Opening'
                  : 'e.g. Ethiopian Solar Irrigation Training'
              }
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Story Prompt, Offer &amp; Key Call-to-Action *
            </label>
            <textarea
              rows={4}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe scenes, target Ethiopian audience, Telebirr order instructions, and key selling points..."
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Duration: <span className="font-mono text-emerald-700 dark:text-emerald-400">{durationSec}s</span>
              </label>
              <input
                type="range"
                min={15}
                max={mode === 'ad_studio' ? 60 : 540}
                step={15}
                value={durationSec}
                onChange={(e) => setDurationSec(Number(e.target.value))}
                className="mt-2 w-full accent-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Visual Style
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              >
                <option>Modern Ethiopian Motion</option>
                <option>Clean Corporate Explainer</option>
                <option>High-Energy Promo Reel</option>
                <option>Educational Whiteboard</option>
              </select>
            </div>
          </div>

          {mode === 'ad_studio' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Target Ad Platforms ({selectedPlatforms.length} selected)
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {AD_PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        active
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-200 bg-stone-50 text-stone-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-amber-300" />
            )}
            <span>{isGenerating ? 'Generating Video Storyboard...' : 'Generate Free AI Video Preview'}</span>
          </button>
        </div>

        {/* Right Preview & Pay-After-Preview Export */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 text-xs font-semibold text-stone-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {scenes.length} Scenes · {durationSec}s
                </span>
              </div>

              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Ready to export
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-stone-200 bg-zinc-950 dark:border-zinc-800">
              <canvas
                ref={canvasRef}
                width={720}
                height={380}
                className="w-full h-auto block aspect-[720/380]"
              />
            </div>

            {scriptOutput && (
              <div className="max-h-44 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs leading-relaxed text-stone-800 whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-200">
                {scriptOutput}
              </div>
            )}

            <div className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadStoryboardHtml}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                  >
                    <Film className="h-4 w-4" />
                    <span>Download Full Script &amp; Storyboard (.html)</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-500 dark:text-stone-400">
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Direct Social Share:</span>
                  </span>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${shareText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-stone-200 px-2.5 py-1 font-semibold text-sky-700 hover:bg-sky-50 dark:border-zinc-700 dark:text-sky-400"
                  >
                    Telegram
                  </a>
                  <a
                    href="https://www.tiktok.com/upload"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-stone-200 px-2.5 py-1 font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:text-stone-200"
                  >
                    TikTok Upload
                  </a>
                  <a
                    href="https://studio.youtube.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-stone-200 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-50 dark:border-zinc-700 dark:text-rose-400"
                  >
                    YouTube Studio
                  </a>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
};
