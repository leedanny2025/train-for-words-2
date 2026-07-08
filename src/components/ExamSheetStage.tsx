import React, { useState } from 'react';
import { RotateCcw, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { StudyItem } from '../types';
import { calculateSimilarity } from '../utils';

interface Props {
  items: StudyItem[];
  categoryLabel: string;
  startNumbers?: number[];
  onExit: () => void;
}

type SheetMode = '빈칸채우기' | '전체쓰기';

export default function ExamSheetStage({ items, categoryLabel, startNumbers, onExit }: Props) {
  const [mode, setMode] = useState<SheetMode>('전체쓰기');

  // Both modes share the same answer matrix: answers[item_i][blank_j]
  const [answers, setAnswers] = useState<string[][]>(() =>
    items.map(item => Array(item.blanks.length).fill(''))
  );
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<number[][]>([]); // scores[item][blank]

  // 1단계: shuffled options per item (re-shuffled on reset)
  const [shuffledOptions, setShuffledOptions] = useState<string[][]>(() =>
    items.map(item => [...item.blanks].sort(() => Math.random() - 0.5))
  );
  // Which dropdown is open: "${itemIndex}-${blankIndex}"
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const resetAll = () => {
    setAnswers(items.map(item => Array(item.blanks.length).fill('')));
    setScores([]);
    setSubmitted(false);
    setOpenDropdownId(null);
    setShuffledOptions(items.map(item => [...item.blanks].sort(() => Math.random() - 0.5)));
  };

  const handleModeChange = (m: SheetMode) => { setMode(m); resetAll(); };

  const handleSubmit = () => {
    const computed = items.map((item, i) =>
      item.blanks.length > 0
        ? item.blanks.map((blank, j) => calculateSimilarity(answers[i]?.[j] || '', blank))
        : [0]
    );
    setScores(computed);
    setSubmitted(true);
    setOpenDropdownId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setAnswer = (itemIdx: number, blankIdx: number, value: string) => {
    setAnswers(prev => prev.map((row, ri) =>
      ri === itemIdx ? row.map((v, ci) => ci === blankIdx ? value : v) : row
    ));
  };

  const selectOption = (itemIdx: number, blankIdx: number, value: string) => {
    setAnswer(itemIdx, blankIdx, value);
    setOpenDropdownId(null);
  };

  const isEmpty = answers.every(row => row.every(v => !v.trim()));

  const allItemScores = submitted
    ? scores.map(row => row.length ? Math.round(row.reduce((a, b) => a + b, 0) / row.length) : 0)
    : [];
  const avgScore = allItemScores.length
    ? Math.round(allItemScores.reduce((a, b) => a + b, 0) / allItemScores.length) : 0;
  const passCount = allItemScores.filter(s => s >= 85).length;

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <span className="px-3 py-1 text-xs font-bold bg-violet-50 text-violet-700 rounded-full border border-violet-100 flex items-center gap-1 w-max">
            <Trophy className="w-3 h-3" /> {categoryLabel} — 시험지 모드
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-2">{items.length}문항</h2>
          {startNumbers && startNumbers.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">#{startNumbers[0]} ~ #{startNumbers[startNumbers.length - 1]}</p>
          )}
        </div>
        <button onClick={onExit} className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer bg-white shrink-0">
          종료
        </button>
      </div>

      {/* Mode selector */}
      {!submitted && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">학습 단계 선택</p>
          <div className="flex gap-2">
            {(['빈칸채우기', '전체쓰기'] as SheetMode[]).map(m => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  mode === m ? 'bg-violet-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {m === '빈칸채우기' ? '1단계 빈칸채우기' : '2단계 전체쓰기'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            {mode === '빈칸채우기'
              ? '빈칸을 클릭하면 선택지가 나타납니다. 알맞은 답을 골라 선택하세요.'
              : '각 빈칸 번호에 맞는 답을 직접 작성하세요.'}
          </p>
        </div>
      )}

      {/* Result summary */}
      {submitted && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-violet-900">채점 결과 ({mode})</p>
            <p className="text-xs text-violet-700 mt-0.5">{passCount}/{items.length}문항 통과 (85점 이상)</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-3xl font-extrabold ${avgScore >= 85 ? 'text-emerald-600' : avgScore >= 60 ? 'text-amber-500' : 'text-rose-600'}`}>
              {avgScore}점
            </span>
            <button onClick={resetAll} className="flex items-center gap-1 text-xs border border-violet-300 bg-white text-violet-700 px-3 py-1.5 rounded-lg font-bold cursor-pointer hover:bg-violet-50">
              <RotateCcw className="w-3 h-3" /> 다시 도전
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close open dropdown */}
      {openDropdownId && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
      )}

      {/* Item list */}
      <div className="flex flex-col gap-3 mb-6">
        {items.map((item, i) => {
          const num = startNumbers ? startNumbers[i] : i + 1;
          const itemScore = submitted ? allItemScores[i] ?? null : null;
          const passed = itemScore !== null && itemScore >= 85;

          return (
            <div
              key={item.id}
              className={`border rounded-xl p-4 transition-colors ${
                itemScore === null ? 'bg-white border-slate-200' :
                passed ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/20 border-rose-200'
              }`}
            >
              {/* Question header */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{num}</span>
                <span className="text-sm font-extrabold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
                  {item.question}
                </span>
                {itemScore !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ml-auto ${passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {itemScore}점
                  </span>
                )}
              </div>

              {/* Blank inputs */}
              <div className="flex flex-col gap-2">
                {item.blanks.map((_, j) => {
                  const blankScore = submitted && scores[i] ? scores[i][j] ?? null : null;
                  const blankPassed = blankScore !== null && blankScore >= 85;
                  const dropdownId = `${i}-${j}`;
                  const isOpen = openDropdownId === dropdownId;
                  const currentValue = answers[i]?.[j] || '';

                  return (
                    <div key={j} className="flex items-start gap-2">
                      <span className="text-[11px] font-extrabold text-indigo-500 w-8 shrink-0 mt-2.5 text-center">
                        ({j + 1})
                      </span>

                      <div className="flex-1 relative">
                        {mode === '빈칸채우기' ? (
                          <>
                            {/* Clickable blank button */}
                            <button
                              type="button"
                              disabled={submitted}
                              onClick={() => !submitted && setOpenDropdownId(isOpen ? null : dropdownId)}
                              className={`w-full text-left px-3 py-2.5 text-sm border rounded-xl transition-all relative z-20 ${
                                submitted
                                  ? blankPassed
                                    ? 'bg-emerald-50/20 border-emerald-200 text-slate-800 cursor-default'
                                    : 'bg-rose-50/20 border-rose-200 text-slate-800 cursor-default'
                                  : currentValue
                                    ? 'bg-indigo-50/40 border-indigo-300 text-slate-800 hover:border-indigo-400 cursor-pointer'
                                    : 'bg-slate-50 border-dashed border-slate-300 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer'
                              }`}
                            >
                              {currentValue || `(${j + 1}) 빈칸 — 클릭하여 선택`}
                            </button>

                            {/* Options dropdown */}
                            {isOpen && !submitted && (
                              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-indigo-200 rounded-xl shadow-xl p-2 z-30 flex flex-col gap-1">
                                <p className="text-[10px] font-bold text-slate-400 px-2 pb-1 border-b border-slate-100 mb-1">
                                  답 선택지 ({shuffledOptions[i].length}개)
                                </p>
                                {shuffledOptions[i].map((opt, k) => (
                                  <button
                                    key={k}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); selectOption(i, j, opt); }}
                                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all cursor-pointer font-medium ${
                                      currentValue === opt
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-800 border border-transparent hover:border-indigo-200'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          /* 2단계: text input per blank */
                          <input
                            type="text"
                            value={currentValue}
                            onChange={e => {
                              if (submitted) return;
                              setAnswer(i, j, e.target.value);
                            }}
                            disabled={submitted}
                            placeholder={`(${j + 1}) 직접 작성...`}
                            className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 transition-all ${
                              blankScore === null ? 'bg-slate-50 border-slate-200' :
                              blankPassed ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Score indicator per blank */}
                      {submitted && (
                        blankPassed
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-2.5" />
                          : <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-2.5" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Correct answers after grading */}
              {submitted && (
                <div className="mt-2.5 bg-white border border-violet-100 rounded-lg p-2.5">
                  <p className="text-[10px] font-bold text-violet-600 mb-1.5 uppercase tracking-wide">정답</p>
                  <div className="flex flex-col gap-0.5">
                    {item.blanks.map((blank, j) => (
                      <p key={j} className="text-xs text-slate-700">
                        <span className="font-bold text-indigo-500">({j + 1})</span> {blank}
                      </p>
                    ))}
                  </div>
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
            disabled={isEmpty}
            className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전체 채점하기
          </button>
        </div>
      )}
    </div>
  );
}
