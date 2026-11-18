import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Flag,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
  ThumbsUp,
  UserPlus,
} from 'lucide-react';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  ChatRoomFilter,
  CommunityChatMessage,
  Language,
  MemberProfile,
} from '../types';
import {
  checkClientRateLimit,
  sanitizeAndFilterChatMessage,
} from '../utils/appSecurity';
import { getChatModerationReason } from '../utils/chatModeration';

interface CommunityTrustViewProps {
  lang: Language;
  currentMember: MemberProfile | null;
  chatMessages: CommunityChatMessage[];
  blockedMemberIds: string[];
  reportedMessageIds: string[];
  onOpenAuthModal: () => void;
  onPostMessage: (msg: CommunityChatMessage) => void;
  onHelpfulMessage: (msgId: string) => void;
  onReportMessage: (msgId: string) => void;
  onBlockMember: (memberId: string) => void;
}

export const CommunityTrustView: React.FC<CommunityTrustViewProps> = ({
  lang,
  currentMember,
  chatMessages,
  blockedMemberIds,
  reportedMessageIds,
  onOpenAuthModal,
  onPostMessage,
  onHelpfulMessage,
  onReportMessage,
  onBlockMember,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [roomFilter, setRoomFilter] = useState<ChatRoomFilter>('all');
  const [postRoom, setPostRoom] = useState<'trust' | 'exams' | 'careers'>('trust');
  const [draftText, setDraftText] = useState('');
  const [includePhoneInPost, setIncludePhoneInPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [revealedPhoneMsgIds, setRevealedPhoneMsgIds] = useState<Set<string>>(new Set());

  const visibleMessages = useMemo(() => {
    return chatMessages.filter((msg) => {
      if (blockedMemberIds.includes(msg.memberId)) return false;
      if (roomFilter !== 'all' && msg.room !== roomFilter) return false;
      return getChatModerationReason(msg.message) === null;
    });
  }, [chatMessages, blockedMemberIds, roomFilter]);

  const toggleRevealPhone = (msgId: string) => {
    setRevealedPhoneMsgIds((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMember) {
      onOpenAuthModal();
      return;
    }
    if (!checkClientRateLimit('community_chat_post', 10)) {
      setPostError('Slow down a bit — rate limit reached (max 10 messages/min).');
      return;
    }

    const { clean, flaggedSpam } = sanitizeAndFilterChatMessage(draftText);
    if (getChatModerationReason(clean)) {
      setPostError('This message was blocked because it may contain violent, hateful, abusive, or self-harm content.');
      return;
    }
    if (clean.length < 3) {
      setPostError('Please enter at least 3 characters.');
      return;
    }
    if (flaggedSpam) {
      setPostError('Spam protection: Please remove multiple external links from your message.');
      return;
    }

    setPostError(null);
    const newMsg: CommunityChatMessage = {
      id: `msg-${Date.now()}`,
      memberId: currentMember.id,
      authorName: currentMember.fullName,
      authorRegion: `${currentMember.region}${currentMember.verifiedBuyer ? ' · Verified Buyer' : ''}`,
      authorRole: currentMember.role,
      verifiedBuyer: currentMember.verifiedBuyer,
      room: postRoom,
      message: clean,
      optionalPhone:
        includePhoneInPost && /^[+0-9\s-]{7,}$/.test(currentMember.contact)
          ? currentMember.contact
          : undefined,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };

    onPostMessage(newMsg);
    setDraftText('');
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header + Member Status */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Community chat safety</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t.communityChatTitle}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-stone-600 dark:text-stone-400">
            {t.communityChatSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAuthModal}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600"
        >
          <UserPlus className="h-4 w-4" />
          <span>{currentMember ? currentMember.fullName : t.memberSignUpLoginBtn}</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12 flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
          {/* Room Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'All Rooms' },
                  { id: 'trust', label: 'Receipts & Trust' },
                  { id: 'exams', label: 'Exams & Textbooks' },
                  { id: 'careers', label: 'Jobs, CV & PDF' },
                ] as { id: ChatRoomFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoomFilter(tab.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    roomFilter === tab.id
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 dark:text-stone-400">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{visibleMessages.length}</span>
            </span>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 max-h-[520px] overflow-y-auto divide-y divide-stone-100 p-4 sm:p-5 space-y-4 dark:divide-zinc-800">
            {visibleMessages.map((msg) => {
              const phoneRevealed = revealedPhoneMsgIds.has(msg.id);
              const isReported = reportedMessageIds.includes(msg.id);
              return (
                <div key={msg.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-stone-900 dark:text-stone-100">
                        {msg.authorName}
                      </span>
                      {msg.verifiedBuyer && (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{t.memberVerifiedBuyer}</span>
                        </span>
                      )}
                      <span className="text-stone-400">·</span>
                      <span className="text-stone-500 dark:text-stone-400">
                        {msg.authorRegion}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-stone-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {msg.message}
                  </p>

                  {/* Privacy Controls, Helpful Vote & Moderation Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {msg.optionalPhone && (
                        <button
                          type="button"
                          onClick={() => toggleRevealPhone(msg.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-300"
                        >
                          {phoneRevealed ? (
                            <>
                              <EyeOff className="h-3 w-3 text-stone-500" />
                              <span className="font-mono text-emerald-800 dark:text-emerald-400">
                                {msg.optionalPhone}
                              </span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 text-emerald-700 dark:text-emerald-400" />
                              <span>{t.communityRevealPhoneBtn}</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onHelpfulMessage(msg.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-zinc-700 dark:text-stone-400"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>Helpful ({msg.helpfulCount})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isReported}
                        onClick={() => onReportMessage(msg.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-amber-700 disabled:text-amber-600"
                      >
                        <Flag className="h-3 w-3" />
                        <span>{isReported ? 'Reported' : t.communityReportBtn}</span>
                      </button>

                      {(!currentMember || msg.memberId !== currentMember.id) && (
                        <button
                          type="button"
                          onClick={() => onBlockMember(msg.memberId)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400 hover:text-rose-600"
                        >
                          <ShieldAlert className="h-3 w-3" />
                          <span>{t.communityBlockBtn}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            {currentMember ? (
              <form onSubmit={handleSendMessage} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Room:</span>
                    <select
                      value={postRoom}
                      onChange={(e) =>
                        setPostRoom(e.target.value as 'trust' | 'exams' | 'careers')
                      }
                      className="h-8 rounded-lg border border-stone-200 bg-white px-2 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="trust">Receipts &amp; Trust</option>
                      <option value="exams">Exams &amp; Textbooks</option>
                      <option value="careers">Jobs, CV &amp; PDF</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 text-[11px] text-stone-600 dark:text-stone-400">
                    <input
                      type="checkbox"
                      checked={includePhoneInPost}
                      onChange={(e) => setIncludePhoneInPost(e.target.checked)}
                      className="rounded border-stone-300"
                    />
                    <span>Attach Click-to-Reveal Phone</span>
                  </label>
                </div>

                {postError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                    {postError}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder={t.communityMessagePlaceholder}
                    className="h-11 flex-1 rounded-xl border border-stone-200 bg-white px-3.5 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{t.communitySendBtn}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-medium text-stone-600 dark:text-stone-300">
                  {t.communitySignInToChat}
                </span>
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t.memberSignUpLoginBtn}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
