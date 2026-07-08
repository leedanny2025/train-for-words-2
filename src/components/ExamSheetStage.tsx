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
  const [fillAnswers, setFillAnswers] = useState<string[][]>(() =>
    items.map(item => Array(item.blanks.length).fill(''))
  );
  const [writeAnswers, setWriteAnswers] = useState<string[]>(() =>
    Array(items.length).fill('')
  );
  const [submitted, setSubmitted] = useState(false);
  const [fillScores, setFillScores] = useState<number[][]>([]);
  const [writeScores, setWriteScores] = useState<number[]>([]);

  const resetAll = () => {
    setFillAnswers(items.map(item => Array(item.blanks.length).fill('')));
    setWriteAnswers(Array(items.length).fill(''));
    setFillScores([]);
    setWriteScores([]);
    setSubmitted(false);
  };

  const handleModeChange = (m: SheetMode) => { setMode(m); resetAll(); };

  const handleSubmit = () => {
    if (mode === '빈칸채우기') {
      setFillScores(items.map((item, i) =>
        item.blanks.length > 0
          ? item.blanks.map((blank, j) => calculateSimilarity(fillAnswers[i]?.[j] || '', blank))
          : [0]
      ));
    } else {
      setWriteScores(items.map((item, i) => calculateSimilarity(writeAnswers[i] || '', item.fullAnswer)));
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEmpty = mode === '빈칸채우기'
    ? fillAnswers.every(row => row.every(v => !v.trim()))
    : writeAnswers.every(a => !a.trim());

  const allScores: number[] = submitted
    ? mode === '빈칸채우기'
      ? fillScores.map(row => row.length ? Math.round(row.reduce((a, b) => a + b, 0) / row.length) : 0)
      : writeScores
    : [];
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const passCount = allScores.filter(s => s >= 85).length;

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

      {/* Items */}
      <div className="flex flex-col gap-3 mb-6">
        {items.map((item, i) => {
          const num = startNumbers ? startNumbers[i] : i + 1;
          const itemScore = submitted ? allScores[i] ?? null : null;
          const passed = itemScore !== null && itemScore >= 85;

          return (
            <div
              key={item.id}
              className={`border rounded-xl p-4 transition-colors ${
                itemScore === null ? 'bg-white border-slate-200' :
                passed ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/20 border-rose-200'
              }`}
            >
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

              {mode === '빈칸채우기' ? (
                <div className="flex flex-col gap-2">
                  {item.blanks.map((blank, j) => {
                    const bs = submitted && fillScores[i] ? fillScores[i][j] ?? null : null;
                    const bp = bs !== null && bs >= 85;
                    return (
                      <div key={j} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 w-8 shrink-0">빈{j + 1}</span>
                        <input
                          type="text"
                          value={fillAnswers[i]?.[j] || ''}
                          onChange={e => {
                            if (submitted) return;
                            setFillAnswers(prev => prev.map((row, ri) =>
                              ri === i ? row.map((v, ci) => ci === j ? e.target.value : v) : row
                            ));
                          }}
                          disabled={submitted}
                          placeholder={`빈칸 ${j + 1}`}
                          className={`flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 min-w-0 transition-all ${
                            bs === null ? 'bg-slate-50 border-slate-200' :
                            bp ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200'
                          }`}
                        />
                        {bs !== null && (bp
                          ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                  {submitted && (
                    <div className="mt-1.5 bg-white border border-violet-100 rounded-lg p-2.5">
                      <p className="text-[10px] font-bold text-violet-600 mb-1 uppercase tracking-wide">정답</p>
                      {item.blanks.map((blank, j) => (
                        <p key={j} className="text-xs text-slate-700"><span className="text-slate-400 font-bold">빈{j + 1}:</span> {blank}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <textarea
                    value={writeAnswers[i] || ''}
                    onChange={e => {
                      if (submitted) return;
                      setWriteAnswers(prev => prev.map((v, ri) => ri === i ? e.target.value : v));
                    }}
                    disabled={submitted}
                    rows={2}
                    placeholder="답 전체를 작성하세요..."
                    className={`w-full p-3 text-sm border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 transition-all ${
                      submitted ? (passed ? 'bg-emerald-50/20 border-emerald-200' : 'bg-rose-50/20 border-rose-200') : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                  {submitted && (
                    <div className="mt-1.5 bg-white border border-violet-100 rounded-lg p-2.5">
                      <p className="text-[10px] font-bold text-violet-600 mb-0.5 uppercase tracking-wide">정답</p>
                      <p className="text-sm font-semibold text-slate-800">{item.fullAnswer}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit */}
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
