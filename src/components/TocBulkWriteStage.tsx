"use client";
import React, { useState } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';
import { StudyItem } from '../types';
import { calculateSimilarity } from '../utils';

interface Props {
  items: StudyItem[];
  categoryLabel: string;
  onExit: () => void;
}

export default function TocBulkWriteStage({ items, categoryLabel, onExit }: Props) {
  const [answers, setAnswers] = useState<string[]>(Array(items.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<number[]>([]);

  const handleSubmit = () => {
    const computed = items.map((item, i) => calculateSimilarity(answers[i], item.fullAnswer));
    setScores(computed);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnswers(Array(items.length).fill(''));
    setScores([]);
    setSubmitted(false);
  };

  const avgScore = submitted && scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const passCount = submitted ? scores.filter(s => s >= 85).length : 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-1 w-max">
            <Trophy className="w-3 h-3" /> {categoryLabel} — 전체 백지 쓰기
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">{items.length}문항 전부 작성</h2>
          <p className="text-xs text-slate-500 mt-1">힌트 없이 각 과의 답을 직접 모두 써보세요.</p>
        </div>
        <button
          onClick={onExit}
          className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer bg-white"
        >
          종료
        </button>
      </div>

      {/* Result summary bar */}
      {submitted && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-indigo-900">채점 결과</p>
            <p className="text-xs text-indigo-700 mt-0.5">
              {passCount}/{items.length}문항 통과 (85점 이상)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-extrabold ${avgScore >= 85 ? 'text-emerald-600' : avgScore >= 60 ? 'text-amber-500' : 'text-rose-600'}`}>
              {avgScore}점
            </span>
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-xs border border-indigo-300 bg-white text-indigo-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-indigo-50"
            >
              <RotateCcw className="w-3 h-3" /> 다시 도전
            </button>
          </div>
        </div>
      )}

      {/* Item list */}
      <div className="flex flex-col gap-3 mb-8">
        {items.map((item, i) => {
          const score = submitted ? scores[i] : null;
          const passed = score !== null && score >= 85;
          return (
            <div
              key={item.id}
              className={`border rounded-xl p-4 transition-colors ${
                score === null
                  ? 'bg-white border-slate-200'
                  : passed
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-rose-50/20 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                  {item.question}
                </span>
                {score !== null && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {score}점
                  </span>
                )}
              </div>
              <textarea
                value={answers[i]}
                onChange={(e) => {
                  if (submitted) return;
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                disabled={submitted}
                rows={2}
                placeholder="답 전체를 작성하세요..."
                className={`w-full p-3 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 transition-all ${
                  submitted
                    ? passed
                      ? 'bg-emerald-50/20 border-emerald-200'
                      : 'bg-rose-50/20 border-rose-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              />
              {submitted && (
                <div className="mt-2 bg-white border border-indigo-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">정답</p>
                  <p className="text-sm font-semibold text-slate-800">{item.fullAnswer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={answers.every(a => a.trim() === '')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전체 채점하기
          </button>
        </div>
      )}
    </div>
  );
}
