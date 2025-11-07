'use client';

import { useEffect, useMemo, useState } from 'react';

type ChannelInsight = {
  snapshot: {
    handle: string;
    channelId: string;
    channelTitle?: string;
    videos: {
      id: string;
      title: string;
      description: string;
      publishedAt: string;
      link: string;
      keywords: string[];
      hashtags: string[];
    }[];
  };
  titleInsights: {
    averageLength: number;
    topWords: string[];
    frequentOpeners: string[];
  };
  descriptionInsights: {
    averageLength: number;
    linkUsageRate: number;
    topWords: string[];
    commonCallsToAction: string[];
  };
  hashtagInsights: {
    topHashtags: string[];
    topKeywords: string[];
  };
};

type ApiResponse = {
  channels: ChannelInsight[];
  targetVideo?: {
    title: string;
    description: string;
    keywords: string[];
    author?: string;
  };
  suggestions?: {
    optimizedTitles: string[];
    optimizedDescription: string;
    recommendedHashtags: string[];
    recommendedTags: string[];
  };
  error?: string;
};

const DEFAULT_CHANNELS = ['@Top5News4', '@TazaHalaat'];

export default function Home() {
  const [channels, setChannels] = useState<string[]>(DEFAULT_CHANNELS);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void runAnalysis(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasTargetResult = useMemo(
    () => Boolean(analysis?.suggestions),
    [analysis],
  );

  async function runAnalysis(includeVideo: boolean) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelHandles: channels,
          targetVideoUrl: includeVideo && videoUrl ? videoUrl.trim() : undefined,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Something went wrong');
      }

      setAnalysis(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignored
    }
  }

  function updateChannel(index: number, value: string) {
    const next = [...channels];
    next[index] = value;
    setChannels(next);
  }

  function addChannelField() {
    setChannels((prev) => [...prev, '']);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            YouTube SEO Playbook
          </p>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Reverse-engineer top channels and ship optimized titles, descriptions, and hashtags in
            seconds.
          </h1>
          <p className="max-w-3xl text-slate-300">
            The assistant watches your competitors, learns their voice, and applies the same
            framework to any video you provide. Paste a video URL after reviewing the baseline
            channel insights.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">1. Channel baseline</h2>
          <p className="mt-1 text-sm text-slate-300">
            Handles to mirror. You can add more or tweak them at any time.
          </p>
          <div className="mt-4 grid gap-3">
            {channels.map((value, index) => (
              <label key={index} className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase text-slate-400">
                  Channel #{index + 1}
                </span>
                <input
                  value={value}
                  onChange={(event) => updateChannel(index, event.target.value)}
                  placeholder="@YourHandle"
                  className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none ring-0 transition focus:border-cyan-400 focus:bg-slate-900/80 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.2)]"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={addChannelField}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              + Add channel
            </button>
            <button
              type="button"
              onClick={() => runAnalysis(false)}
              className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              disabled={loading}
            >
              {loading ? 'Crunching...' : 'Refresh channel insights'}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-100">2. Target video</h2>
          <p className="mt-1 text-sm text-slate-300">
            Paste the YouTube URL you want to optimize. The agent will pull the current title,
            description, and tags automatically.
          </p>
          <div className="mt-4 flex flex-col gap-3 md:flex-row">
            <input
              value={videoUrl}
              onChange={(event) => setVideoUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:bg-slate-900/80 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.2)]"
            />
            <button
              type="button"
              onClick={() => runAnalysis(true)}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 md:w-auto"
              disabled={loading || !videoUrl}
            >
              {loading ? 'Generating...' : 'Generate SEO kit'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Leave the field blank for now if you only want to inspect how the benchmark channels
            operate.
          </p>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {analysis && (
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Channel insight deck</h2>
              <p className="text-sm text-slate-300">
                Patterns pulled from the most recent uploads. Use them to align tone, pacing, and
                metadata.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {analysis.channels.map((channel) => (
                <article
                  key={channel.snapshot.channelId}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                >
                  <header className="mb-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {channel.snapshot.handle}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {channel.snapshot.channelTitle ?? 'YouTube Channel'}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Sample size: {channel.snapshot.videos.length} latest uploads
                    </p>
                  </header>
                  <div className="space-y-4 text-sm text-slate-200">
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Title playbook
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        Avg length {channel.titleInsights.averageLength} characters
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {channel.titleInsights.topWords.slice(0, 10).map((word) => (
                          <span
                            key={word}
                            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-cyan-300"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Description DNA
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        Avg length {channel.descriptionInsights.averageLength} characters · Links in{' '}
                        {channel.descriptionInsights.linkUsageRate}% of videos
                      </p>
                      <ul className="mt-2 space-y-1 text-xs text-slate-300">
                        {channel.descriptionInsights.commonCallsToAction.length > 0 ? (
                          channel.descriptionInsights.commonCallsToAction.map((cta) => (
                            <li key={cta}>• {cta}</li>
                          ))
                        ) : (
                          <li>• Clean body copy with minimal repeated CTAs.</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Hashtag + keyword focus
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {channel.hashtagInsights.topHashtags.slice(0, 12).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-800 px-3 py-1 text-xs text-emerald-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {channel.hashtagInsights.topKeywords.slice(0, 12).map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {hasTargetResult && analysis?.suggestions && (
          <section className="space-y-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-xl">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-emerald-200">SEO kit ready</h2>
                <p className="text-sm text-emerald-100/70">
                  Tailored to{' '}
                  <span className="font-semibold text-emerald-100">
                    {analysis.targetVideo?.title ?? 'your video'}
                  </span>
                  . Click any block to copy.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    [
                      'TITLE IDEAS:',
                      ...(analysis.suggestions?.optimizedTitles ?? []),
                      '',
                      'DESCRIPTION:',
                      analysis.suggestions?.optimizedDescription ?? '',
                      '',
                      'HASHTAGS:',
                      (analysis.suggestions?.recommendedHashtags ?? []).join(' '),
                      '',
                      'TAGS:',
                      (analysis.suggestions?.recommendedTags ?? []).join(', '),
                    ].join('\n'),
                  )
                }
                className="rounded-lg border border-emerald-400/60 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/10 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
              >
                Copy all
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                Title ideas
              </h3>
              <div className="grid gap-3 md:grid-cols-3">
                {analysis.suggestions.optimizedTitles.map((title) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => copyToClipboard(title)}
                    className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-left text-sm text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-400/20 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                Optimized description
              </h3>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(analysis.suggestions?.optimizedDescription ?? '')
                }
                className="w-full rounded-xl border border-emerald-400/40 bg-slate-950/50 p-4 text-left text-sm text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-400/10 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
              >
                <pre className="whitespace-pre-wrap font-sans">
                  {analysis.suggestions.optimizedDescription}
                </pre>
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                  Hashtags
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      (analysis.suggestions?.recommendedHashtags ?? []).join(' '),
                    )
                  }
                  className="w-full rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-left text-sm text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-400/20 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.suggestions.recommendedHashtags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200/80">
                  Tags
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      (analysis.suggestions?.recommendedTags ?? []).join(', '),
                    )
                  }
                  className="w-full rounded-xl border border-emerald-400/40 bg-slate-950/50 p-4 text-left text-sm text-emerald-100 transition hover:border-emerald-300 hover:bg-emerald-400/10 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.suggestions.recommendedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald-400/60 px-3 py-1 text-xs text-emerald-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
