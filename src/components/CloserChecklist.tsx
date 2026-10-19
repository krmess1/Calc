import React from 'react';
import { CloserCheck } from '../utils/criteria';

export const CloserChecklist: React.FC<{ title: string; checks: CloserCheck[] }> = ({ title, checks }) => {
  const required = checks.filter((c) => !c.advisory);
  const passed = required.filter((c) => c.pass).length;
  return (
    <div className="closer-checklist">
      <div className="detail-head">
        {title} — {passed}/{required.length} {passed === required.length ? '✅ Closer' : ''}
      </div>
      {checks.map((c) => (
        <div
          key={c.id}
          className={`criteria-item ${c.pass ? 'criteria-pass' : c.advisory ? '' : 'criteria-fail'}`}
        >
          {c.pass ? '✓' : c.advisory ? '⚠' : '✗'} <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
};
