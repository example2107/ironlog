import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "./supabase";

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────────
const DEFAULT_EXERCISES = [
  { name: "Ноги — Квадрицепсы", slug: "legs_quads", exercises: [
    { id: 1,  name: "Приседания со штангой",        last_weight: "40",         last_reps: "3x10", last_date: "2026-03-05", comment: "можно прибавить до 45 кг." },
    { id: 2,  name: "Гакк-приседания",              last_weight: "50",         last_reps: "3x10", last_date: "2026-03-05", comment: "можно прибавлять до 55 кг." },
    { id: 3,  name: "Жим ногами",                   last_weight: "75",         last_reps: "3x10", last_date: "2026-02-05", comment: "прибавить вес до 80 кг." },
  ]},
  { name: "Ноги — Задняя поверхность + Ягодицы", slug: "legs_posterior", exercises: [
    { id: 4,  name: "Становая тяга",                last_weight: "50",         last_reps: "3x8",  last_date: "2026-02-05", comment: "прибавить вес до 55 кг." },
    { id: 5,  name: "Румынская тяга",               last_weight: "40",         last_reps: "3x10", last_date: "2026-02-01", comment: "прибавить до 45 кг. и делать по 8 повторений" },
    { id: 6,  name: "Гиперэкстензия",              last_weight: "5",          last_reps: "3x12", last_date: "2026-01-23", comment: "прибавить вес до 7.5 кг." },
  ]},
  { name: "Спина — Ширина", slug: "back_width", exercises: [
    { id: 7,  name: "Тяга вертикального блока широким хватом", last_weight: "40-40-45", last_reps: "3x10", last_date: "2026-01-13", comment: "Сделать все подходы 45 кг." },
    { id: 8,  name: "Тяга вертикального блока средним хватом", last_weight: "40",       last_reps: "3x10", last_date: "2026-03-05", comment: "прибавить вес до 45 кг." },
    { id: 9,  name: "Тяга вертикального блока в хаммере",      last_weight: "50",       last_reps: "3x10", last_date: "2026-01-23", comment: "прибавляем до 55 кг." },
  ]},
  { name: "Спина — Толщина", slug: "back_thickness", exercises: [
    { id: 10, name: "Тяга горизонтального блока к поясу", last_weight: "30", last_reps: "4x10", last_date: "2026-01-17", comment: "Было легко, прибавляй до 40 кг. и делай 3 подхода" },
    { id: 11, name: "Тяга т-грифа",                      last_weight: "30", last_reps: "3x10", last_date: "2026-02-01", comment: "Можно прибавить до 32.5 кг." },
  ]},
  { name: "Грудь — Горизонтальные жимы", slug: "chest_flat", exercises: [
    { id: 12, name: "Жим штанги лёжа (свободный вес)",       last_weight: "45",         last_reps: "3x8-7-7", last_date: "2026-01-17", comment: "с этим же весом все подходы на 8 повторений" },
    { id: 13, name: "Horizontal Bench Press (тренажёр)",      last_weight: "50",         last_reps: "3x10",    last_date: "2026-02-05", comment: "прибавляем вес до 55 кг. и делаем 3х8" },
    { id: 14, name: "Жим гантелей на горизонтальной скамье", last_weight: "15",         last_reps: "3x10",    last_date: "2026-01-20", comment: "Оставить вес таким же" },
  ]},
  { name: "Грудь — Наклонные жимы", slug: "chest_incline", exercises: [
    { id: 15, name: "Жим штанги на наклонной скамье",    last_weight: "40",           last_reps: "3x8",  last_date: "2026-01-20", comment: "можно прибавить вес до 40 кг." },
    { id: 16, name: "Жим гантелей на наклонной скамье", last_weight: "15-17.5-17.5", last_reps: "3x10", last_date: "2026-01-23", comment: "все подхода 17.5 кг." },
  ]},
  { name: "Плечи", slug: "shoulders_press", exercises: [
    { id: 17, name: "Махи гантелей в сторону",     last_weight: "6",  last_reps: "3x12", last_date: "2026-01-20", comment: "оставить вес таким же" },
    { id: 18, name: "Жим на плечи в хаммере",      last_weight: "30", last_reps: "3x10", last_date: "2026-02-01", comment: "прибавить до 35 кг." },
    { id: 19, name: "Обратная бабочка (тренажер)", last_weight: "30", last_reps: "3x12", last_date: "2026-02-05", comment: "Прибавить вес до 33 кг." },
    { id: 31, name: "Подъем гантелей перед собой", last_weight: "6",  last_reps: "3x12", last_date: "2026-01-23", comment: "оставить таким же вес для закрепления" },
  ]},
  { name: "Бицепс", slug: "biceps", exercises: [
    { id: 20, name: "Подъём гантелей на бицепс стоя",                last_weight: "12.5", last_reps: "3x12", last_date: "2026-02-01", comment: "оставить вес таким же, последний подход на пределе" },
    { id: 21, name: "Бицепс стоя с EZ-грифом",                       last_weight: "20",   last_reps: "3x12", last_date: "2026-02-05", comment: "Прибавить вес до 22.5 кг." },
    { id: 22, name: "Бицепс на скамье Скотта",                       last_weight: "13",   last_reps: "3x12", last_date: "2026-01-20", comment: "Оставить вес таким же (10+3)" },
    { id: 23, name: "Молотковые сгибания на бицепс (скамья Скотта)", last_weight: "10",   last_reps: "3x12", last_date: "2026-01-23", comment: "Прибавить вес до 12 кг." },
  ]},
  { name: "Трицепс", slug: "triceps", exercises: [
    { id: 24, name: "Тяга косички от груди в кроссовере", last_weight: "25", last_reps: "3x12", last_date: "2026-01-20", comment: "Прибавить до 27 кг" },
    { id: 29, name: "Triceps extension (тренажер)",        last_weight: "30", last_reps: null,   last_date: "2026-02-05", comment: "прибавить вес до 33 кг." },
    { id: 30, name: "Seated dip (тренажер)",               last_weight: "50", last_reps: "3x12", last_date: "2026-01-23", comment: "оставить вес таким же для закрепления" },
  ]},
  { name: "Пресс", slug: "abs", exercises: [
    { id: 27, name: "Подъём коленей в висе",       last_weight: "0",  last_reps: "3x12", last_date: "2026-01-23", comment: "легче, чем в прошлый раз" },
    { id: 28, name: "Abdominal crunch (тренажер)", last_weight: "35", last_reps: "3x12", last_date: "2026-02-05", comment: "прибавить вес до 40 кг." },
  ]},
];

// ─── STYLES ──────────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
:root {
  --ink:#0a0a0f; --ink2:#13131c; --ink3:#1c1c28; --ink4:#24243a;
  --line:#2a2a42; --line2:#353555;
  --acid:#c8ff00; --acid-dim:rgba(200,255,0,0.08);
  --red:#ff3b3b; --red-dim:rgba(255,59,59,0.1);
  --amber:#ffaa00; --amber-dim:rgba(255,170,0,0.08);
  --green:#1aff8c; --green-dim:rgba(26,255,140,0.1);
  --blue:#38bdf8; --blue-dim:rgba(56,189,248,0.1);
  --steel:#7070a0; --snow:#ededff; --snow2:#a0a0cc;
  --rec:#a259ff; --rec-dim:rgba(162,89,255,0.10);
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0a0a0f;}
.g{font-family:'DM Sans',sans-serif;background:var(--ink);color:var(--snow);min-height:100vh;
  background-image:radial-gradient(ellipse 100% 40% at 50% 0%,rgba(200,255,0,0.05) 0%,transparent 60%);}

/* NAV */
.g-nav{position:sticky;top:0;z-index:100;background:rgba(10,10,15,0.94);backdrop-filter:blur(24px);
  border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;
  padding:0 20px;height:58px;gap:12px;
  padding-top:env(safe-area-inset-top);
  height:calc(58px + env(safe-area-inset-top));
  padding-left:max(20px,env(safe-area-inset-left));
  padding-right:max(20px,env(safe-area-inset-right));}
.g-logo{display:flex;flex-direction:column;gap:1px;}
.g-logo-main{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:3px;color:var(--acid);line-height:1;}
.g-logo-sub{font-size:10px;color:var(--steel);letter-spacing:1.5px;text-transform:uppercase;}
.g-tabs{display:flex;gap:2px;}
.g-tab{padding:7px 14px;border:none;background:transparent;color:var(--steel);font-size:13px;
  font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;border-radius:8px;transition:all 0.15s;white-space:nowrap;}
.g-tab:hover{color:var(--snow);background:var(--ink3);}
.g-tab.on{color:var(--acid);background:var(--acid-dim);}

/* LAYOUT */
.g-wrap{max-width:680px;margin:0 auto;padding:24px 18px 80px;
  padding-bottom:calc(80px + env(safe-area-inset-bottom));
  padding-left:max(14px,env(safe-area-inset-left));
  padding-right:max(14px,env(safe-area-inset-right));}

/* STATS */
.g-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}
.g-stat{background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:20px 22px;
  position:relative;overflow:hidden;transition:border-color 0.18s,transform 0.18s,box-shadow 0.18s;}
.g-stat::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--acid),transparent);}
.g-stat-n{font-family:'Bebas Neue',sans-serif;font-size:48px;line-height:1;color:var(--acid);}
.g-stat-l{font-size:11px;color:var(--steel);letter-spacing:1.5px;text-transform:uppercase;margin-top:4px;}
.g-stat.clickable{cursor:pointer;}
.g-stat.clickable:hover{border-color:rgba(200,255,0,0.4);transform:translateY(-2px);box-shadow:0 6px 24px rgba(200,255,0,0.1);}
.g-stat-hint{font-size:10px;color:var(--acid);opacity:0.7;margin-top:6px;letter-spacing:1px;text-transform:uppercase;}

/* BUTTONS */
.g-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:none;border-radius:12px;
  cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;transition:all 0.17s;white-space:nowrap;}
.g-btn.acid{background:var(--acid);color:var(--ink);font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.2px;padding:16px 24px;}
.g-btn.acid:hover{background:#d8ff1a;box-shadow:0 6px 28px rgba(200,255,0,0.22);transform:translateY(-1px);}
.g-btn.ghost{background:transparent;color:var(--snow2);border:1px solid var(--line2);font-size:14px;padding:12px 18px;}
.g-btn.ghost:hover{background:var(--ink3);color:var(--snow);}
.g-btn.red{background:var(--red);color:#fff;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;letter-spacing:0.2px;padding:14px 22px;}
.g-btn.red:hover{background:#ff5252;}
.g-btn.green{background:var(--green);color:var(--ink);font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;letter-spacing:0.2px;padding:16px 24px;}
.g-btn.green:hover{background:#33ffaa;box-shadow:0 6px 28px rgba(26,255,140,0.22);transform:translateY(-1px);}
.g-btn.sm{font-size:13px;padding:8px 14px;font-family:'DM Sans',sans-serif;letter-spacing:0;border-radius:9px;}
.g-btn.full{width:100%;}
.g-btn:active{opacity:0.85;transform:scale(0.98);}
.ib{width:32px;height:32px;border-radius:8px;flex-shrink:0;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;font-size:14px;transition:all 0.15s;}
.ib.del{background:var(--red-dim);border:1px solid rgba(255,59,59,0.18);color:var(--red);}
.ib.del:hover{background:rgba(255,59,59,0.25);}
.ib.edit{background:var(--blue-dim);border:1px solid rgba(56,189,248,0.2);color:var(--blue);}
.ib.edit:hover{background:rgba(56,189,248,0.2);}
.ib:active{opacity:0.7;}

/* SECTION HEADER */
.g-sh{font-family:'DM Sans',sans-serif;font-weight:800;font-size:22px;letter-spacing:-0.3px;color:var(--snow);
  margin-bottom:14px;display:flex;align-items:center;gap:10px;}
.g-sh::after{content:'';flex:1;height:1px;background:var(--line);}

/* CARDS */
.g-card{background:var(--ink2);border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:12px;}
.g-card-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid var(--line);}
.g-card-t{font-family:'DM Sans',sans-serif;font-weight:800;font-size:18px;letter-spacing:-0.2px;color:var(--acid);}

/* EXERCISE LIST */
.g-group{background:var(--ink2);border:1px solid var(--line);border-radius:14px;margin-bottom:10px;overflow:hidden;}
.g-group-h{padding:12px 16px;background:var(--ink3);border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px;}
.g-group-dot{width:6px;height:6px;border-radius:50%;background:var(--acid);flex-shrink:0;}
.g-group-name{font-size:12px;font-weight:600;color:var(--snow2);text-transform:uppercase;letter-spacing:1px;flex:1;}
.g-ex{padding:13px 16px;border-bottom:1px solid var(--line);cursor:pointer;transition:background 0.13s;position:relative;}
.g-ex:last-child{border-bottom:none;}
.g-ex:hover{background:rgba(200,255,0,0.035);}
.g-ex:active{background:rgba(200,255,0,0.05);}
.g-ex.sel{background:rgba(200,255,0,0.065);}
.g-ex.sel::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--acid);border-radius:0 2px 2px 0;}
.g-ex.rec{background:var(--rec-dim);}
.g-ex.rec::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--rec);border-radius:0 2px 2px 0;}
.g-ex.sel.rec::before{background:var(--acid);}
.g-ex-name{font-size:14px;font-weight:500;color:var(--snow);margin-bottom:5px;display:flex;align-items:center;gap:7px;flex-wrap:wrap;}
.g-ex-tick{width:17px;height:17px;border-radius:50%;background:var(--acid);color:var(--ink);font-size:9px;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.g-rec-badge{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--rec);
  background:rgba(162,89,255,0.15);border:1px solid rgba(162,89,255,0.3);padding:2px 7px;border-radius:100px;}
.g-ex-meta{display:flex;gap:12px;flex-wrap:wrap;}
.g-ex-meta-item{font-size:11px;color:var(--steel);}
.g-ex-meta-item b{color:var(--snow2);font-weight:500;}
.g-ex-note{font-size:11px;color:var(--amber);margin-top:4px;font-style:italic;}
.g-ex-nodate{font-size:11px;color:var(--steel);font-style:italic;}

/* BADGES */
.g-badges{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px;}
.g-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(200,255,0,0.1);
  border:1px solid rgba(200,255,0,0.22);padding:5px 11px;border-radius:100px;font-size:12px;color:var(--acid);}
.g-badge-rm{background:none;border:none;color:var(--red);cursor:pointer;font-size:13px;line-height:1;padding:0;}

/* FORM FIELDS */
.g-field{margin-bottom:14px;}
.g-field label{display:block;font-size:12px;font-weight:600;color:var(--steel);text-transform:none;letter-spacing:0;margin-bottom:7px;}
.g-field input,.g-field select,.g-field textarea{width:100%;padding:11px 13px;background:var(--ink3);border:1px solid var(--line);
  border-radius:10px;color:var(--snow);font-size:16px;font-family:'DM Sans',sans-serif;transition:border-color 0.14s;
  -webkit-appearance:none;}
.g-field input:focus,.g-field select:focus,.g-field textarea:focus{outline:none;border-color:var(--acid);box-shadow:0 0 0 3px rgba(200,255,0,0.07);}
.g-field select option{background:var(--ink3);color:var(--snow);}
.g-field input.err{border-color:var(--red) !important;box-shadow:0 0 0 3px rgba(255,59,59,0.15);}
.g-2col{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.g-3col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}

/* EXEC CARD */
.g-ecard{background:var(--ink3);border:1px solid var(--line);border-radius:13px;padding:17px;margin-bottom:11px;}
.g-ecard-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--line2);}
.g-ecard-t{font-weight:600;font-size:15px;color:var(--snow);padding-top:6px;line-height:1.35;}
.g-ecard-actions{display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end;}
.g-hint{padding:9px 13px;margin-bottom:13px;background:var(--amber-dim);border-left:3px solid var(--amber);
  border-radius:0 8px 8px 0;font-size:12px;color:var(--amber);line-height:1.5;}
.replace-list{display:grid;gap:8px;margin-bottom:16px;}
.replace-item{width:100%;text-align:left;background:var(--ink3);border:1px solid var(--line);border-radius:10px;padding:12px 13px;
  color:var(--snow);font-family:'DM Sans',sans-serif;cursor:pointer;transition:border-color 0.14s,background 0.14s;}
.replace-item:hover{border-color:rgba(200,255,0,0.35);background:rgba(200,255,0,0.05);}
.replace-name{font-size:14px;font-weight:600;margin-bottom:4px;}
.replace-meta{font-size:11px;color:var(--steel);line-height:1.5;}

/* SETS TABLE */
.sets-table{width:100%;border-collapse:collapse;margin-bottom:10px;}
.sets-table th{font-size:10px;font-weight:700;color:var(--steel);text-transform:uppercase;letter-spacing:1px;padding:4px 6px 8px;text-align:left;}
.sets-table td{padding:3px 3px;}
.set-num{font-size:12px;color:var(--steel);font-weight:600;padding:0 4px;white-space:nowrap;display:inline-block;min-width:22px;text-align:center;}
.set-input{width:100%;padding:10px 8px;background:var(--ink4);border:1px solid var(--line2);border-radius:8px;
  color:var(--snow);font-size:16px;font-family:'DM Sans',sans-serif;text-align:center;-webkit-appearance:none;}
.set-input:focus{outline:none;border-color:var(--acid);box-shadow:0 0 0 2px rgba(200,255,0,0.08);}
.set-input.err{border-color:var(--red) !important;}
.set-del{background:none;border:none;color:var(--steel);font-size:18px;cursor:pointer;padding:2px 6px;line-height:1;transition:color 0.13s;}
.set-del:hover,.set-del:active{color:var(--red);}
.add-set-btn{background:var(--ink4);border:1px dashed var(--line2);border-radius:8px;color:var(--steel);
  font-size:13px;font-family:'DM Sans',sans-serif;cursor:pointer;padding:9px;width:100%;margin-bottom:12px;transition:all 0.14s;}
.add-set-btn:hover,.add-set-btn:active{border-color:var(--acid);color:var(--acid);}

/* BODY WEIGHT */
.bw-bar{display:flex;align-items:center;gap:10px;background:var(--green-dim);border:1px solid rgba(26,255,140,0.2);
  border-radius:12px;padding:12px 16px;margin-bottom:16px;}
.bw-label{font-size:12px;color:var(--green);font-weight:600;text-transform:uppercase;letter-spacing:1px;flex-shrink:0;}
.bw-input{background:transparent;border:none;border-bottom:1px solid rgba(26,255,140,0.4);color:var(--snow);
  font-size:18px;font-family:'Bebas Neue',sans-serif;letter-spacing:1px;width:80px;text-align:center;padding:2px 4px;
  -webkit-appearance:none;}
.bw-input:focus{outline:none;border-bottom-color:var(--green);}
.bw-unit{font-size:13px;color:var(--steel);}
.bw-tag{display:inline-flex;align-items:center;gap:6px;background:var(--green-dim);border:1px solid rgba(26,255,140,0.2);
  border-radius:100px;padding:3px 10px;font-size:12px;color:var(--green);font-weight:600;}

/* HISTORY */
.g-witem{border:1px solid var(--line);border-radius:13px;padding:15px;margin-bottom:9px;transition:border-color 0.14s;}
.g-witem:hover{border-color:rgba(200,255,0,0.28);}
.g-witem:active{border-color:rgba(200,255,0,0.28);}
.g-witem-date{font-size:12px;color:var(--steel);margin-bottom:3px;}
.g-witem-n{font-family:'DM Sans',sans-serif;font-weight:800;font-size:18px;color:var(--acid);letter-spacing:-0.2px;}
.g-witem-list{font-size:12px;color:var(--snow2);margin-top:4px;line-height:1.5;}
.g-hist-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}
.g-hist-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}
.g-hist-ex{padding:11px 13px;background:var(--ink3);border-radius:9px;margin-bottom:7px;border-left:3px solid var(--acid);}
.g-hist-name{font-size:14px;font-weight:500;color:var(--snow);margin-bottom:3px;}
.g-hist-meta{font-size:12px;color:var(--steel);}
.g-hist-note{font-size:11px;color:var(--amber);margin-top:3px;font-style:italic;}
.hist-edit-ex{background:var(--ink3);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:12px;}
.hist-edit-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}
.hist-edit-title{font-size:15px;font-weight:700;color:var(--snow);line-height:1.35;}
.g-dg{font-size:11px;font-weight:700;color:var(--steel);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;margin-top:6px;}

/* OVERLAY / MODAL */
.g-ov{position:fixed;inset:0;background:rgba(0,0,0,0.82);z-index:999;display:flex;align-items:center;justify-content:center;padding:18px;}
.g-modal{background:var(--ink2);border:1px solid var(--line);border-radius:18px;padding:26px;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;}
.g-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px;}
.g-modal-head .g-modal-t{margin-bottom:0;}
.modal-x{width:34px;height:34px;border-radius:9px;background:var(--ink3);border:1px solid var(--line2);color:var(--snow2);
  font-size:20px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.modal-x:hover{color:var(--snow);border-color:rgba(200,255,0,0.35);}
.g-modal-t{font-family:'DM Sans',sans-serif;font-weight:800;font-size:20px;letter-spacing:-0.3px;color:var(--acid);margin-bottom:6px;}
.g-modal-sub{font-size:12px;color:var(--steel);margin-bottom:18px;}
.g-modal-body{background:var(--ink3);border-radius:10px;padding:14px;font-size:12px;color:var(--snow2);
  white-space:pre-wrap;font-family:monospace;line-height:1.8;margin-bottom:16px;max-height:300px;overflow-y:auto;}
.g-modal-acts{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;}

/* CONFIRM DIALOG */
.confirm-box{background:var(--ink2);border:1px solid var(--line2);border-radius:16px;padding:24px;max-width:360px;width:100%;}
.confirm-msg{font-size:15px;color:var(--snow);margin-bottom:20px;line-height:1.5;}
.confirm-acts{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;}

/* TOAST */
.toast{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);
  background:var(--ink3);border:1px solid var(--line2);border-radius:10px;
  padding:12px 20px;font-size:14px;color:var(--snow);z-index:2000;white-space:nowrap;
  animation:toastIn 0.2s ease;pointer-events:none;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* LIBRARY */
.lib-section{margin-bottom:6px;}
.lib-group-row{display:flex;align-items:center;gap:6px;padding:10px 12px;
  background:var(--ink3);border-radius:10px;margin-bottom:4px;}
.lib-group-row.dragging{opacity:0.35;}
.lib-group-row.drag-over{background:rgba(200,255,0,0.06);outline:1px solid rgba(200,255,0,0.25);}
.lib-group-name{font-size:13px;font-weight:600;color:var(--snow2);text-transform:uppercase;letter-spacing:0.8px;flex:1;min-width:0;}
.lib-ex-row{display:flex;align-items:flex-start;gap:6px;padding:9px 10px 9px 14px;
  background:rgba(255,255,255,0.02);border-radius:8px;margin-bottom:3px;border-left:2px solid var(--line2);transition:background 0.12s;}
.lib-ex-row:hover{background:rgba(255,255,255,0.04);}
.lib-ex-row.dragging{opacity:0.35;}
.lib-ex-row.drag-over{background:rgba(200,255,0,0.06);border-left-color:var(--acid);}
.lib-ex-info{flex:1;min-width:0;}
.lib-ex-name{font-size:13px;font-weight:500;color:var(--snow);margin-bottom:2px;}
.lib-ex-meta{font-size:11px;color:var(--steel);line-height:1.6;}
.lib-actions{display:flex;gap:5px;flex-shrink:0;margin-top:1px;}
.lib-divider{height:1px;background:var(--line);margin:16px 0;}
.lib-form-box{background:var(--ink3);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:14px;}
.lib-form-title{font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;letter-spacing:-0.1px;color:var(--acid);margin-bottom:12px;}
.drag-handle{cursor:grab;color:var(--steel);font-size:18px;padding:2px 6px;user-select:none;
  flex-shrink:0;touch-action:none;-webkit-user-select:none;}
.drag-handle:active{cursor:grabbing;color:var(--acid);}
.drop-zone{height:5px;border-radius:3px;margin:2px 0;transition:all 0.12s;}
.drop-zone.active{height:32px;background:rgba(200,255,0,0.08);border:1px dashed rgba(200,255,0,0.35);border-radius:8px;
  display:flex;align-items:center;justify-content:center;}
.drop-zone.active::after{content:'↓';color:var(--acid);font-size:14px;font-weight:700;}
.group-drop-zone{height:6px;border-radius:4px;margin:3px 0;transition:all 0.12s;}
.group-drop-zone.active{height:34px;background:rgba(200,255,0,0.08);border:1px dashed rgba(200,255,0,0.35);
  display:flex;align-items:center;justify-content:center;}
.group-drop-zone.active::after{content:'переместить сюда';color:var(--acid);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;}
.edit-box{background:var(--ink4);border:1px solid var(--line2);border-radius:10px;padding:14px;margin:6px 0 8px 0;}

/* MISC */
.g-crumb{font-size:12px;color:var(--steel);margin-bottom:18px;display:flex;align-items:center;gap:6px;}
.g-crumb-l{color:var(--acid);cursor:pointer;font-weight:500;}
.g-crumb-l:hover{text-decoration:underline;}
.g-row{display:flex;gap:9px;align-items:center;}
.g-between{display:flex;justify-content:space-between;align-items:flex-start;gap:9px;}
.g-info{background:var(--acid-dim);border:1px solid rgba(200,255,0,0.14);border-radius:10px;padding:12px 15px;margin-bottom:16px;font-size:13px;color:var(--snow2);line-height:1.5;}
.g-pill{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.g-pill-a{background:var(--amber-dim);color:var(--amber);border:1px solid rgba(255,170,0,0.2);}
.g-empty{text-align:center;padding:50px 20px;color:var(--steel);}
.g-empty-i{font-size:50px;margin-bottom:12px;display:block;}
.g-sp{height:18px;}
.g-legend{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--steel);margin-bottom:14px;}
.g-legend-dot{width:8px;height:8px;border-radius:50%;background:var(--rec);flex-shrink:0;}

/* MOBILE */
@media(max-width:600px){
  .g-ov{padding:0;align-items:flex-end;}
  .g-modal{border-radius:20px 20px 0 0;max-height:92vh;padding:20px 16px calc(20px + env(safe-area-inset-bottom));max-width:100%;}
  .confirm-box{border-radius:20px 20px 0 0;max-width:100%;padding:24px 20px calc(24px + env(safe-area-inset-bottom));}
  .g-tab{padding:8px 11px;font-size:12px;}
  .g-btn.acid,.g-btn.green{font-size:16px;padding:15px 20px;}
  .g-btn.ghost{font-size:13px;padding:11px 16px;}
  .g-ex{padding:14px 14px;}
  .ib{width:36px;height:36px;font-size:15px;}
  .g-stat-n{font-size:38px;}
  .g-stat{padding:16px 16px;}
  .g-ecard{padding:13px;}
  .g-modal-acts .g-btn{flex:1;justify-content:center;}
  .g-3col{grid-template-columns:1fr;}
  .g-ecard-head{display:block;}
  .g-ecard-actions{justify-content:flex-start;margin-top:10px;}
}
@media(max-width:360px){
  .g-2col{grid-template-columns:1fr;}
}
@media(hover:none){
  .g-stat.clickable:hover{transform:none;box-shadow:none;border-color:var(--line);}
  .g-btn.acid:hover,.g-btn.green:hover,.g-btn.red:hover{transform:none;box-shadow:none;}
  .g-ex:hover{background:transparent;}
  .g-ex.sel:hover{background:rgba(200,255,0,0.065);}
  .g-witem:hover{border-color:var(--line);}
  .lib-ex-row:hover{background:rgba(255,255,255,0.02);}
}

/* AUTH */
.auth-page{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;}
.auth-box{background:var(--ink2);border:1px solid var(--line);border-top:2px solid var(--acid);border-radius:20px;padding:36px 32px;width:100%;max-width:400px;box-shadow:0 24px 60px rgba(0,0,0,0.4);}
.auth-logo{text-align:center;margin-bottom:28px;}
.auth-logo .g-logo-main{font-size:26px;letter-spacing:4px;}
.auth-logo .g-logo-sub{font-size:11px;letter-spacing:2px;}
.auth-title{font-family:'DM Sans',sans-serif;font-size:22px;font-weight:700;color:var(--snow);margin-bottom:5px;text-align:center;letter-spacing:-0.3px;}
.auth-sub{font-size:13px;color:var(--steel);text-align:center;margin-bottom:24px;}
.auth-err{color:var(--red);font-size:13px;margin:0 0 12px;text-align:center;background:var(--red-dim);border-radius:8px;padding:10px;}
.auth-switch{width:100%;background:transparent;border:none;color:var(--steel);font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;margin-top:14px;padding:8px;text-align:center;transition:color 0.15s;}
.auth-switch:hover{color:var(--snow2);}
.auth-box .g-field label{font-size:12px;font-weight:500;letter-spacing:0;text-transform:none;color:var(--snow2);}
.auth-box .g-field input{background:var(--ink3);border-color:var(--line2);font-size:15px;}
.auth-box .g-field input::placeholder{color:#4a4a6a;opacity:1;}
.auth-pwd-wrap{position:relative;}
.auth-pwd-wrap input{padding-right:44px;}
.auth-pwd-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#4a4a6a;padding:4px;display:flex;align-items:center;transition:color 0.15s;}
.auth-pwd-toggle:hover{color:var(--snow2);}
.auth-box .g-btn.acid{font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;}

/* NAV USER */
.g-nav-user{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.g-nav-login{font-size:12px;color:var(--acid);font-weight:600;letter-spacing:0.5px;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
@media(max-width:480px){
  .g-nav-login{display:none;}
  .g-tabs .g-tab{padding:7px 8px;font-size:12px;}
}
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const ls = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const fmtDate = (iso) => {
  if (!iso) return null;
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}.${parts[1]}.${parts[0]}`;
};

const todayISO = () => new Date().toISOString().split("T")[0];

const getRecId = (group) => {
  if (!group.exercises.length) return null;
  return [...group.exercises].sort((a, b) => {
    if (!a.last_date && !b.last_date) return 0;
    if (!a.last_date) return -1;
    if (!b.last_date) return 1;
    return new Date(a.last_date) - new Date(b.last_date);
  })[0].id;
};

const emptyExForm = { groupIdx: "", name: "", w: "", s: "", r: "", d: "", c: "" };

const buildSets = (lw, lr) => {
  if (!lr) return [{ weight: lw != null ? String(lw) : "", reps: "" }];
  const parts = lr.split("x");
  const nSets = parseInt(parts[0]) || 1;
  const repParts = parts.slice(1).join("x").split("-");
  const wStr = lw != null ? String(lw) : "";
  const wParts = wStr.split("-");
  return Array.from({ length: nSets }, (_, i) => ({
    weight: wParts[i] !== undefined ? wParts[i] : (wParts[0] || ""),
    reps: repParts[i] || repParts[0] || "",
  }));
};

const setsToSummary = (sets) => {
  const filled = sets.filter(s => s.reps);
  if (!filled.length) return { weight: null, reps: null };
  const allSameW = filled.every(s => String(s.weight) === String(filled[0].weight));
  const allSameR = filled.every(s => s.reps === filled[0].reps);
  const n = filled.length;
  return {
    weight: allSameW ? (filled[0].weight || null) : filled.map(s => s.weight || "0").join("-"),
    reps: allSameR ? `${n}x${filled[0].reps}` : `${n}x${filled.map(s => s.reps).join("-")}`,
  };
};

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  // ── AUTH STATE ────────────────────────────────────────────────────────────
  const [session,     setSession]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode,    setAuthMode]    = useState("login"); // "login" | "register"
  const [authForm,    setAuthForm]    = useState({ login: "", password: "" });
  const [authError,   setAuthError]   = useState(null);
  const [authBusy,    setAuthBusy]    = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const [screen, setScreen]       = useState("home");
  const [exercises, setExercises] = useState([]);
  const [workouts,  setWorkouts]  = useState([]);
  const prevWorkoutsRef           = useRef([]);
  const [cur, setCur]             = useState(null);
  const [date, setDate]           = useState(todayISO);

  // Update date on tab focus (user may have left app open overnight)
  useEffect(() => {
    const onFocus = () => setDate(todayISO());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ── LOAD DATA FROM SUPABASE ───────────────────────────────────────────────
  useEffect(() => {
    if (!session) {
      setExercises([]); setWorkouts([]); prevWorkoutsRef.current = [];
      return;
    }
    const uid = session.user.id;
    (async () => {
      const { data, error } = await supabase.from("exercises").select("data").eq("user_id", uid).single();
      if (error && error.code === "PGRST116") {
        // First login — migrate from localStorage or use defaults
        const localEx = ls.get("wtp_ex", null);
        const toSave  = (localEx && localEx.length) ? localEx : DEFAULT_EXERCISES;
        await supabase.from("exercises").insert({ user_id: uid, data: toSave });
        setExercises(toSave);
      } else if (data) {
        setExercises(data.data);
      }
    })();
    (async () => {
      const { data } = await supabase.from("workouts").select("id, data").eq("user_id", uid).order("id");
      const arr = (data || []).map(r => r.data);
      setWorkouts(arr);
      prevWorkoutsRef.current = arr;
    })();
  }, [session]);

  // modals
  const [detailModal, setDetailModal] = useState(null);
  const [libOpen, setLibOpen]         = useState(false);
  const [bodyWeightModal, setBodyWeightModal] = useState(null); // { woId, value }
  const [replaceModal, setReplaceModal] = useState(null); // { exId, groupName }
  const [finishPrompt, setFinishPrompt] = useState(false);
  const [finishBusy, setFinishBusy] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState({});

  // confirm dialog
  const [confirmDialog, setConfirmDialog] = useState(null);

  // toast
  const [toast, setToast]  = useState(null);
  const toastTimer          = useRef(null);

  // library state
  const [exForm, setExForm]         = useState(emptyExForm);
  const [grpForm, setGrpForm]       = useState({ name: "" });
  const [editingEx, setEditingEx]   = useState(null);
  const [editingGrp, setEditingGrp] = useState(null);

  // drag
  const dragRef    = useRef(null);
  const touchDrag  = useRef(null);
  const execCardRefs = useRef({});

  const upEx = (k, v) => setExForm(p => ({ ...p, [k]: v }));

  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const saveEx = useCallback(async (d) => {
    const prev = exercises;
    setExercises(d);
    if (!session) return true;
    const { error } = await supabase.from("exercises").upsert({ user_id: session.user.id, data: d });
    if (error) {
      console.error("Failed to save exercises", error);
      setExercises(prev);
      showToast("Не удалось сохранить базу упражнений");
      return false;
    }
    return true;
  }, [exercises, session]);

  const saveWo = useCallback(async (newArr) => {
    const prevArr = workouts;
    const prevRef = prevWorkoutsRef.current;
    setWorkouts(newArr);
    if (!session) { prevWorkoutsRef.current = newArr; return true; }
    const uid    = session.user.id;
    const oldArr = prevWorkoutsRef.current;
    prevWorkoutsRef.current = newArr;
    try {
      const oldMap = new Map(oldArr.map(w => [w.id, w]));
      const newMap = new Map(newArr.map(w => [w.id, w]));
      const deletedIds = oldArr.filter(w => !newMap.has(w.id)).map(w => w.id);
      if (deletedIds.length) {
        const { error } = await supabase.from("workouts").delete().in("id", deletedIds).eq("user_id", uid);
        if (error) throw error;
      }
      const inserted = newArr.filter(w => !oldMap.has(w.id));
      if (inserted.length) {
        const { error } = await supabase.from("workouts").insert(inserted.map(w => ({ id: w.id, user_id: uid, data: w })));
        if (error) throw error;
      }
      const updated = newArr.filter(w => oldMap.has(w.id) && JSON.stringify(oldMap.get(w.id)) !== JSON.stringify(w));
      for (const w of updated) {
        const { error } = await supabase.from("workouts").update({ data: w }).eq("id", w.id).eq("user_id", uid);
        if (error) throw error;
      }
      return true;
    } catch (error) {
      console.error("Failed to save workouts", error);
      setWorkouts(prevArr);
      prevWorkoutsRef.current = prevRef;
      showToast("Не удалось сохранить тренировку");
      return false;
    }
  }, [session, workouts]);

  const confirm = (msg, onOk, opts = {}) => setConfirmDialog({
    msg,
    onOk,
    okText: opts.okText || "Удалить",
    cancelText: opts.cancelText || "Отмена",
    okClass: opts.okClass || "red",
    onCancel: opts.onCancel,
  });

  const totalEx    = exercises.reduce((s, g) => s + g.exercises.length, 0);
  const lastWo     = workouts.length ? workouts[workouts.length - 1] : null;
  const lastWoDate = lastWo ? fmtDate(lastWo.date) : "—";

  const countsForLibrary = (wo) => wo?.libraryIncluded !== false;

  const findEx = id => {
    for (const g of exercises) { const e = g.exercises.find(x => x.id === id); if (e) return e; }
    return null;
  };

  const findGroupByExercise = id =>
    exercises.find(g => g.exercises.some(e => e.id === id));

  const recalcExerciseLibrary = (workoutArr, baseExercises = exercises, affectedIds = null) => {
    const affected = affectedIds ? new Set(affectedIds) : null;
    const latestByEx = new Map();
    workoutArr.filter(countsForLibrary).forEach(wo => {
      (wo.exercises || []).forEach(done => {
        if (affected && !affected.has(done.id)) return;
        const prev = latestByEx.get(done.id);
        const prevTime = prev ? new Date(prev.wo.date).getTime() : -Infinity;
        const nextTime = new Date(wo.date).getTime();
        if (!prev || nextTime > prevTime || (nextTime === prevTime && wo.id > prev.wo.id)) {
          latestByEx.set(done.id, { wo, done });
        }
      });
    });
    return baseExercises.map(group => ({
      ...group,
      exercises: group.exercises.map(ex => {
        if (affected && !affected.has(ex.id)) return ex;
        const latest = latestByEx.get(ex.id);
        if (!latest) {
          return { ...ex, last_weight: null, last_reps: null, last_date: null, comment: null };
        }
        const { weight, reps } = setsToSummary(latest.done.sets || []);
        return {
          ...ex,
          last_weight: weight,
          last_reps: reps,
          last_date: latest.wo.date,
          comment: String(latest.done.comment || "").trim() || null,
        };
      }),
    }));
  };

  const saveWorkoutsAndRecalc = async (nextWorkouts, affectedIds) => {
    const savedWorkouts = await saveWo(nextWorkouts);
    if (!savedWorkouts) return false;
    const savedExercises = await saveEx(recalcExerciseLibrary(nextWorkouts, exercises, affectedIds));
    return savedExercises;
  };

  // ── WORKOUT ──────────────────────────────────────────────────────────────
  const startCreate = () => {
    setCur({ id: Date.now(), date, exercises: [], bodyWeight: "", completed: false });
    setScreen("select");
  };

  const toggleEx = (ex, groupName) => {
    const exists = cur?.exercises.some(e => e.id === ex.id);
    if (exists) {
      setCur(p => ({ ...p, exercises: p.exercises.filter(e => e.id !== ex.id) }));
    } else {
      setCur(p => ({ ...p, exercises: [...p.exercises, {
        id: ex.id, name: ex.name, group: groupName,
        sets: buildSets(ex.last_weight, ex.last_reps),
        comment: ex.comment || "",
      }] }));
    }
  };

  const updateCurExercise = (exId, updater) =>
    setCur(p => {
      if (!p) return p;
      const exs = [...p.exercises];
      const exIdx = exs.findIndex(e => e.id === exId);
      if (exIdx === -1) return p;
      exs[exIdx] = updater(exs[exIdx]);
      return { ...p, exercises: exs };
    });

  const updSet = (exId, setIdx, field, val) =>
    updateCurExercise(exId, ex => {
      const sets = [...ex.sets];
      if (!sets[setIdx]) return ex;
      sets[setIdx] = { ...sets[setIdx], [field]: val };
      return { ...ex, sets };
    });

  const updComment = (exId, val) =>
    updateCurExercise(exId, ex => ({ ...ex, comment: val }));

  const addSet = (exId) =>
    updateCurExercise(exId, ex => {
      const last = ex.sets[ex.sets.length - 1] || { weight: "", reps: "" };
      return { ...ex, sets: [...ex.sets, { ...last }] };
    });

  const removeSet = (exId, setIdx) =>
    updateCurExercise(exId, ex => {
      if (ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) };
    });

  const removeCurrentExercise = (exId) => confirm("Удалить упражнение из текущей тренировки?", () => {
    setCur(p => {
      if (!p) return p;
      return { ...p, exercises: p.exercises.filter(e => e.id !== exId) };
    });
  }, { okText: "Удалить", okClass: "red" });

  const openReplace = (ex) => {
    const group = exercises.find(g => g.name === ex.group) || findGroupByExercise(ex.id);
    if (!group) { showToast("Группа упражнения не найдена"); return; }
    const selectedIds = new Set(cur?.exercises.map(e => e.id) || []);
    const options = group.exercises.filter(item => item.id !== ex.id && !selectedIds.has(item.id));
    if (!options.length) {
      showToast("В этой группе нет доступной замены");
      return;
    }
    setReplaceModal({ exId: ex.id, groupName: group.name });
  };

  const replaceCurrentExercise = (oldId, newId) => {
    const group = exercises.find(g => g.exercises.some(e => e.id === newId));
    const next = group?.exercises.find(e => e.id === newId);
    if (!group || !next) { showToast("Упражнение не найдено"); return; }
    setCur(p => {
      if (!p) return p;
      return { ...p, exercises: p.exercises.map(ex => ex.id === oldId ? {
        id: next.id,
        name: next.name,
        group: group.name,
        sets: buildSets(next.last_weight, next.last_reps),
        comment: next.comment || "",
      } : ex) };
    });
    setReplaceModal(null);
    showToast("Упражнение заменено");
  };

  const doStart = () => {
    if (!cur?.exercises.length) { showToast("Выберите хотя бы одно упражнение"); return; }
    execCardRefs.current = {};
    setScreen("exec");
  };

  const abort = () => confirm("Отменить тренировку? Данные будут потеряны.", () => {
    setCur(null); setScreen("home");
  }, { okText: "Отменить", okClass: "red" });

  const finish = () => {
    if (!cur?.exercises.length) {
      showToast("В тренировке нет упражнений");
      return;
    }
    let firstBad = -1;
    for (let i = 0; i < cur.exercises.length; i++) {
      if (cur.exercises[i].sets.some(s => !s.reps)) { firstBad = i; break; }
    }
    if (firstBad !== -1) {
      execCardRefs.current[firstBad]?.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast(`Заполните повторения в упражнении ${firstBad + 1}`);
      return;
    }
    setFinishPrompt(true);
  };

  const completeWorkout = async (updateLibrary) => {
    if (!cur || finishBusy) return;
    setFinishBusy(true);
    const wo = { ...cur, completed: true, libraryIncluded: updateLibrary };
    const savedWorkout = await saveWo([...workouts, wo]);
    if (!savedWorkout) {
      setFinishBusy(false);
      return;
    }
    let librarySaved = true;
    if (updateLibrary) {
      const affectedIds = cur.exercises.map(e => e.id);
      const updEx = recalcExerciseLibrary([...workouts, wo], exercises, affectedIds);
      librarySaved = await saveEx(updEx);
    }
    setFinishPrompt(false);
    setFinishBusy(false);
    setCur(null);
    setScreen("home");
    // Prompt for body weight
    setBodyWeightModal({ woId: wo.id, value: "" });
    showToast(updateLibrary && !librarySaved
      ? "Тренировка в истории, база не обновилась"
      : updateLibrary ? "✓ Тренировка завершена!" : "✓ Тренировка сохранена только в историю");
  };

  // ── BODY WEIGHT ───────────────────────────────────────────────────────────
  const saveBodyWeight = (woId, value) => {
    const bw = value.trim();
    saveWo(workouts.map(w => w.id === woId ? { ...w, bodyWeight: bw } : w));
    setBodyWeightModal(null);
    if (bw) showToast(`✓ Вес тела ${bw} кг сохранён`);
  };

  const cloneWorkoutForEdit = (wo) => ({
    ...wo,
    bodyWeight: wo.bodyWeight || "",
    libraryIncluded: countsForLibrary(wo),
    exercises: (wo.exercises || []).map(ex => ({
      ...ex,
      comment: ex.comment || "",
      sets: Array.isArray(ex.sets)
        ? ex.sets.map(s => ({ weight: s.weight ?? "", reps: s.reps ?? "" }))
        : [{ weight: ex.weight ?? "", reps: ex.reps ?? "" }],
    })),
  });

  // ── HISTORY ──────────────────────────────────────────────────────────────
  const toggleWorkoutExpanded = id =>
    setExpandedWorkouts(p => ({ ...p, [id]: !p[id] }));

  const openDetails = wo => {
    let t = `📋 ТРЕНИРОВКА ОТ ${fmtDate(wo.date)}\n`;
    if (wo.bodyWeight) t += `⚖ Вес тела: ${wo.bodyWeight} кг\n`;
    t += `${"═".repeat(34)}\n\n`;
    wo.exercises.forEach((e, i) => {
      const sStr = e.sets
        ? e.sets.map((s, si) => `  Подход ${si+1}: ${s.weight ? s.weight+" кг" : "б/в"} × ${s.reps}`).join("\n")
        : `  ${e.weight||"б/в"} кг × ${e.reps}`;
      t += `${i+1}. ${e.name}\n${sStr}\n`;
      if (e.comment) t += `   💬 ${e.comment}\n`;
      t += "\n";
    });
    setDetailModal(t);
  };

  const delWo = id => confirm("Удалить тренировку?", () => {
    const removed = workouts.find(w => w.id === id);
    const next = workouts.filter(w => w.id !== id);
    const affectedIds = [...new Set((removed?.exercises || []).map(e => e.id))];
    (async () => {
      const ok = countsForLibrary(removed)
        ? await saveWorkoutsAndRecalc(next, affectedIds)
        : await saveWo(next);
      if (ok) {
        setExpandedWorkouts(p => {
          const copy = { ...p };
          delete copy[id];
          return copy;
        });
        showToast("Тренировка удалена");
      }
    })();
  });

  const startEditWorkout = (wo) => setEditingWorkout(cloneWorkoutForEdit(wo));
  const upEditWorkout = (k, v) => setEditingWorkout(p => ({ ...p, [k]: v }));
  const upEditWorkoutSet = (exIdx, setIdx, field, value) =>
    setEditingWorkout(p => ({
      ...p,
      exercises: p.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((set, si) => si === setIdx ? { ...set, [field]: value } : set),
        };
      }),
    }));
  const upEditWorkoutComment = (exIdx, value) =>
    setEditingWorkout(p => ({
      ...p,
      exercises: p.exercises.map((ex, i) => i === exIdx ? { ...ex, comment: value } : ex),
    }));
  const addEditWorkoutSet = (exIdx) =>
    setEditingWorkout(p => ({
      ...p,
      exercises: p.exercises.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1] || { weight: "", reps: "" };
        return { ...ex, sets: [...ex.sets, { ...last }] };
      }),
    }));
  const removeEditWorkoutSet = (exIdx, setIdx) =>
    setEditingWorkout(p => ({
      ...p,
      exercises: p.exercises.map((ex, i) => {
        if (i !== exIdx || ex.sets.length <= 1) return ex;
        return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) };
      }),
    }));
  const removeEditWorkoutExercise = (exIdx) => {
    if (editingWorkout?.exercises.length <= 1) {
      showToast("В тренировке должно остаться хотя бы одно упражнение");
      return;
    }
    setEditingWorkout(p => {
      return { ...p, exercises: p.exercises.filter((_, i) => i !== exIdx) };
    });
  };
  const saveEditedWorkout = async () => {
    if (!editingWorkout?.date) { showToast("Укажите дату тренировки"); return; }
    const firstBad = editingWorkout.exercises.findIndex(ex => ex.sets.some(s => !String(s.reps || "").trim()));
    if (firstBad !== -1) {
      showToast(`Заполните повторения в упражнении ${firstBad + 1}`);
      return;
    }
    const oldWorkout = workouts.find(w => w.id === editingWorkout.id);
    const cleaned = {
      ...editingWorkout,
      bodyWeight: String(editingWorkout.bodyWeight || "").trim(),
      exercises: editingWorkout.exercises.map(ex => ({
        ...ex,
        comment: String(ex.comment || "").trim(),
        sets: ex.sets.map(s => ({
          weight: String(s.weight ?? "").trim(),
          reps: String(s.reps ?? "").trim(),
        })),
      })),
    };
    const next = workouts.map(w => w.id === cleaned.id ? cleaned : w);
    const affectedIds = [...new Set([
      ...(oldWorkout?.exercises || []).map(e => e.id),
      ...cleaned.exercises.map(e => e.id),
    ])];
    const ok = countsForLibrary(cleaned)
      ? await saveWorkoutsAndRecalc(next, affectedIds)
      : await saveWo(next);
    if (ok) {
      setEditingWorkout(null);
      showToast("✓ Тренировка обновлена");
    }
  };

  // ── LIBRARY ───────────────────────────────────────────────────────────────
  const handleAddGroup = () => {
    const name = grpForm.name.trim();
    if (!name) { showToast("Введите название группы"); return; }
    if (exercises.find(g => g.name === name)) { showToast("Такая группа уже есть"); return; }
    saveEx([...exercises, { name, slug: name.toLowerCase().replace(/\s+/g,"_"), exercises: [] }]);
    setGrpForm({ name: "" });
    showToast("✓ Группа добавлена");
  };

  const startEditGroup = g => { setEditingGrp({ oldName: g.name, newName: g.name }); setEditingEx(null); };
  const saveEditGroup  = () => {
    const nn = editingGrp.newName.trim();
    if (!nn) { showToast("Название не может быть пустым"); return; }
    saveEx(exercises.map(g => g.name === editingGrp.oldName ? { ...g, name: nn } : g));
    setEditingGrp(null); showToast("✓ Группа обновлена");
  };

  const handleDelGroup = groupName => {
    const g = exercises.find(x => x.name === groupName);
    const msg = g?.exercises.length
      ? `Удалить "${groupName}"? Вместе с ней ${g.exercises.length} упражнений.`
      : `Удалить группу "${groupName}"?`;
    confirm(msg, () => { saveEx(exercises.filter(x => x.name !== groupName)); showToast("Группа удалена"); });
  };

  const handleAddExercise = () => {
    if (exForm.groupIdx === "" || !exForm.name.trim()) { showToast("Выберите группу и название"); return; }
    const idx    = parseInt(exForm.groupIdx);
    const allIds = exercises.flatMap(g => g.exercises.map(e => e.id));
    const nextId = allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
    const repsStr = exForm.s && exForm.r ? `${exForm.s}x${exForm.r}` : (exForm.r || null);
    saveEx(exercises.map((g, i) => i === idx ? { ...g, exercises: [...g.exercises, {
      id: nextId, name: exForm.name.trim(),
      last_weight: exForm.w !== "" ? exForm.w : null,
      last_reps: repsStr, last_date: exForm.d || null, comment: exForm.c.trim() || null,
    }]} : g));
    setExForm(emptyExForm); showToast("✓ Упражнение добавлено");
  };

  const startEditEx = (groupName, ex) => {
    const parts = ex.last_reps ? ex.last_reps.split("x") : ["",""];
    setEditingEx({ groupName, exId: ex.id, f: {
      name: ex.name, w: ex.last_weight != null ? String(ex.last_weight) : "",
      s: parts[0] || "", r: parts.slice(1).join("x") || "",
      d: ex.last_date || "", c: ex.comment || "",
    }});
    setEditingGrp(null);
  };
  const upEditEx   = (k, v) => setEditingEx(p => ({ ...p, f: { ...p.f, [k]: v } }));
  const saveEditEx = () => {
    const { groupName, exId, f } = editingEx;
    if (!f.name.trim()) { showToast("Название не может быть пустым"); return; }
    const repsStr = f.s && f.r ? `${f.s}x${f.r}` : (f.r || null);
    saveEx(exercises.map(g => g.name === groupName ? { ...g, exercises: g.exercises.map(ex =>
      ex.id === exId ? { ...ex, name: f.name.trim(), last_weight: f.w !== "" ? f.w : null,
        last_reps: repsStr, last_date: f.d || null, comment: f.c.trim() || null } : ex
    )} : g));
    setEditingEx(null); showToast("✓ Упражнение обновлено");
  };

  const handleDelEx = (groupName, exId) => {
    confirm("Удалить упражнение?", () => {
      saveEx(exercises.map(g => g.name === groupName
        ? { ...g, exercises: g.exercises.filter(e => e.id !== exId) } : g));
      showToast("Упражнение удалено");
    });
  };

  // ── DRAG & DROP ───────────────────────────────────────────────────────────
  const [draggingId, setDraggingId] = useState(null);
  const [dragOver, setDragOver]     = useState(null);
  const [draggingGroup, setDraggingGroup] = useState(null);
  const [groupDragOver, setGroupDragOver] = useState(undefined);

  const commitGroupMove = useCallback((groupName, beforeName) => {
    if (groupName === beforeName) return;
    const moved = exercises.find(g => g.name === groupName);
    if (!moved) return;
    const rest = exercises.filter(g => g.name !== groupName);
    const next = [...rest];
    const idx = beforeName === null ? next.length : next.findIndex(g => g.name === beforeName);
    next.splice(idx === -1 ? next.length : idx, 0, moved);
    saveEx(next);
  }, [exercises, saveEx]);

  const commitMove = useCallback((exId, toGroup, afterId) => {
    let moved = null;
    for (const g of exercises) { const f = g.exercises.find(e => e.id === exId); if (f) { moved = f; break; } }
    if (!moved) return;
    const without = exercises.map(g => ({ ...g, exercises: g.exercises.filter(e => e.id !== exId) }));
    const result  = without.map(g => {
      if (g.name !== toGroup) return g;
      const exs = [...g.exercises];
      if (afterId === null) exs.unshift(moved);
      else { const i = exs.findIndex(e => e.id === afterId); exs.splice(i === -1 ? exs.length : i+1, 0, moved); }
      return { ...g, exercises: exs };
    });
    saveEx(result);
  }, [exercises, saveEx]);

  const onDragStart = (e, exId, fromGroup) => {
    dragRef.current = { type: "exercise", exId, fromGroup };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ exId, fromGroup }));
    setDraggingId(exId);
  };
  const onDragOver = (e, groupName, afterId) => {
    if (dragRef.current?.type !== "exercise") return;
    e.preventDefault();
    e.stopPropagation();
    setDragOver({ groupName, afterId });
  };
  const onDrop = (e, toGroup, afterId) => {
    e.preventDefault(); e.stopPropagation();
    const { type, exId } = dragRef.current || {};
    dragRef.current = null; setDraggingId(null); setDragOver(null);
    if (type === "exercise" && exId) commitMove(exId, toGroup, afterId);
  };
  const onGroupDragStart = (e, groupName) => {
    dragRef.current = { type: "group", groupName };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", groupName);
    setDraggingGroup(groupName);
  };
  const onGroupDragOver = (e, beforeName) => {
    if (dragRef.current?.type !== "group") return;
    e.preventDefault();
    e.stopPropagation();
    setGroupDragOver(beforeName);
  };
  const onGroupDrop = (e, beforeName) => {
    e.preventDefault();
    e.stopPropagation();
    const { type, groupName } = dragRef.current || {};
    dragRef.current = null;
    setDraggingGroup(null);
    setGroupDragOver(undefined);
    if (type === "group" && groupName) commitGroupMove(groupName, beforeName);
  };
  const onDragEnd = () => {
    dragRef.current = null;
    setDraggingId(null);
    setDragOver(null);
    setDraggingGroup(null);
    setGroupDragOver(undefined);
  };

  const onTouchStart = (e, exId) => {
    const touch = e.touches[0];
    const src   = e.currentTarget;
    const rect  = src.getBoundingClientRect();
    const ghost = src.cloneNode(true);
    ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;
      opacity:0.85;pointer-events:none;z-index:9999;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.5);transform:scale(1.03);`;
    document.body.appendChild(ghost);
    touchDrag.current = { exId, ghost, offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top, lastOver: null };
    setDraggingId(exId);
    e.preventDefault();
  };

  const startTouchDrag = (e, exId, fromGroup) => {
    onTouchStart(e, exId);
    const move = (ev) => {
      const td = touchDrag.current; if (!td) return;
      ev.preventDefault();
      const t = ev.touches[0];
      td.ghost.style.left = (t.clientX - td.offsetX) + "px";
      td.ghost.style.top  = (t.clientY - td.offsetY) + "px";
      td.ghost.style.display = "none";
      const el = document.elementFromPoint(t.clientX, t.clientY);
      td.ghost.style.display = "";
      const zone = el?.closest("[data-dropzone]");
      if (zone) {
        const gn = zone.dataset.group;
        const ai = zone.dataset.after === "null" ? null : Number(zone.dataset.after);
        if (td.lastOver?.groupName !== gn || td.lastOver?.afterId !== ai) {
          td.lastOver = { groupName: gn, afterId: ai };
          setDragOver({ groupName: gn, afterId: ai });
        }
      } else if (td.lastOver) { td.lastOver = null; setDragOver(null); }
    };
    const end = (ev) => {
      const td = touchDrag.current; if (!td) return;
      td.ghost.remove();
      const over = td.lastOver;
      touchDrag.current = null; setDraggingId(null); setDragOver(null);
      if (over) commitMove(td.exId, over.groupName, over.afterId);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    };
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
  };

  const startTouchGroupDrag = (e, groupName) => {
    const touch = e.touches[0];
    const src = e.currentTarget.closest(".lib-group-row") || e.currentTarget;
    const rect = src.getBoundingClientRect();
    const ghost = src.cloneNode(true);
    ghost.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;
      opacity:0.85;pointer-events:none;z-index:9999;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,0.5);transform:scale(1.02);`;
    document.body.appendChild(ghost);
    touchDrag.current = { type: "group", groupName, ghost, offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top, lastOver: undefined };
    setDraggingGroup(groupName);
    e.preventDefault();

    const move = (ev) => {
      const td = touchDrag.current; if (!td || td.type !== "group") return;
      ev.preventDefault();
      const t = ev.touches[0];
      td.ghost.style.left = (t.clientX - td.offsetX) + "px";
      td.ghost.style.top = (t.clientY - td.offsetY) + "px";
      td.ghost.style.display = "none";
      const el = document.elementFromPoint(t.clientX, t.clientY);
      td.ghost.style.display = "";
      const zone = el?.closest("[data-group-dropzone]");
      if (zone) {
        const beforeName = zone.dataset.before === "null" ? null : zone.dataset.before;
        if (td.lastOver !== beforeName) {
          td.lastOver = beforeName;
          setGroupDragOver(beforeName);
        }
      } else if (td.lastOver !== undefined) {
        td.lastOver = undefined;
        setGroupDragOver(undefined);
      }
    };
    const end = () => {
      const td = touchDrag.current; if (!td || td.type !== "group") return;
      td.ghost.remove();
      const beforeName = td.lastOver;
      touchDrag.current = null;
      setDraggingGroup(null);
      setGroupDragOver(undefined);
      if (beforeName !== undefined) commitGroupMove(td.groupName, beforeName);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
    };
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
  };

  // ── AUTH ACTIONS ─────────────────────────────────────────────────────────
  const doAuth = async (mode) => {
    const login = authForm.login.trim().toLowerCase();
    const pwd   = authForm.password;
    if (!login || !pwd) { setAuthError("Заполните все поля"); return; }
    if (pwd.length < 6) { setAuthError("Пароль — минимум 6 символов"); return; }
    setAuthBusy(true); setAuthError(null);
    const email = `${login}@ironlog.local`;
    if (mode === "register") {
      const { error } = await supabase.auth.signUp({ email, password: pwd, options: { data: { username: login } } });
      if (error) setAuthError(error.message.includes("already") ? "Логин уже занят" : error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
      if (error) setAuthError("Неверный логин или пароль");
    }
    setAuthBusy(false);
  };

  const doLogout = () => supabase.auth.signOut();

  // ── UI ────────────────────────────────────────────────────────────────────
  const Nav = ({ label }) => (
    <div className="g-crumb">
      <span className="g-crumb-l" onClick={() => setScreen("home")}>Главная</span>
      <span>/</span><span>{label}</span>
    </div>
  );
  const Btn = ({ c, onClick, full, sm, children, style }) => (
    <button className={`g-btn ${c}${full?" full":""}${sm?" sm":""}`} onClick={onClick} style={style}>{children}</button>
  );
  const IB = ({ type, onClick, title }) => (
    <button className={`ib ${type}`} onClick={onClick} title={title}>{type==="del"?"🗑":"✏️"}</button>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",
      color:"#7070a0",fontFamily:"DM Sans,sans-serif",fontSize:14,letterSpacing:1}}>
      Загрузка…
    </div>
  );

  if (!session) return (
    <>
      <style>{G}</style>
      <div className="g auth-page">
        <div className="auth-box">
          <div className="auth-logo">
            <div className="g-logo-main">IRON LOG</div>
            <div className="g-logo-sub">Workout Tracker</div>
          </div>
          <div className="auth-title">{authMode === "login" ? "Добро пожаловать" : "Создать аккаунт"}</div>
          <div className="auth-sub">{authMode === "login" ? "Войдите, чтобы продолжить" : "Начните отслеживать тренировки"}</div>
          <div className="g-field">
            <label>Логин</label>
            <input type="text" placeholder="Ваш логин" value={authForm.login} autoCapitalize="none"
              onChange={e => setAuthForm(p => ({ ...p, login: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && doAuth(authMode)}/>
          </div>
          <div className="g-field">
            <label>Пароль</label>
            <div className="auth-pwd-wrap">
              <input type={showPwd ? "text" : "password"} placeholder="Минимум 6 символов" value={authForm.password}
                onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && doAuth(authMode)}/>
              <button type="button" className="auth-pwd-toggle" onClick={() => setShowPwd(v => !v)} tabIndex={-1}>
                {showPwd
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
          {authError && <div className="auth-err">{authError}</div>}
          <button className="g-btn acid full" onClick={() => doAuth(authMode)} disabled={authBusy} style={{marginTop:8}}>
            {authBusy ? "…" : authMode === "login" ? "Войти" : "Создать аккаунт"}
          </button>
          <button className="auth-switch"
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(null); }}>
            {authMode === "login" ? "Нет аккаунта? Создать" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{G}</style>
      <div className="g">

        {/* NAV */}
        <nav className="g-nav">
          <div className="g-logo">
            <div className="g-logo-main">IRON LOG</div>
            <div className="g-logo-sub">Workout Tracker</div>
          </div>
          <div className="g-tabs">
            {[["home","🏠 Главная"],["history","📋 История"]].map(([s,l]) => (
              <button key={s} className={`g-tab${screen===s?" on":""}`} onClick={() => setScreen(s)}>{l}</button>
            ))}
          </div>
          <div className="g-nav-user">
            <span className="g-nav-login">{session?.user?.user_metadata?.username}</span>
            <button className="g-btn ghost sm" onClick={doLogout}>Выйти</button>
          </div>
        </nav>

        <div className="g-wrap">

          {/* HOME */}
          {screen === "home" && <>
            <div className="g-stats">
              <div className="g-stat clickable" onClick={() => { setEditingEx(null); setEditingGrp(null); setLibOpen(true); }}>
                <div className="g-stat-n">{totalEx}</div>
                <div className="g-stat-l">Упражнений в базе</div>
                <div className="g-stat-hint">↗ Открыть базу</div>
              </div>
              <div className="g-stat">
                <div className="g-stat-n">{lastWoDate}</div>
                <div className="g-stat-l">Последняя тренировка</div>
              </div>
            </div>
            <Btn c="acid" full onClick={startCreate}>+ Начать тренировку</Btn>
            <div className="g-sp"/>
            {workouts.length === 0
              ? <div className="g-empty"><span className="g-empty-i">🏋️</span>Нет тренировок — создайте первую!</div>
              : <>
                <div className="g-sh">Последние</div>
                {[...workouts].reverse().slice(0,3).map(w => (
                  <div key={w.id} className="g-witem">
                    <div className="g-between">
                      <div style={{flex:1,cursor:"pointer"}} onClick={() => openDetails(w)}>
                        <div className="g-witem-date">
                          {new Date(w.date).toLocaleDateString("ru-RU",{weekday:"short",day:"2-digit",month:"2-digit",year:"2-digit"})}
                          {w.bodyWeight ? <span className="bw-tag" style={{marginLeft:8}}>⚖ {w.bodyWeight} кг</span> : null}
                        </div>
                        <div className="g-witem-n">{w.exercises.length} УПРАЖНЕНИЙ</div>
                        <div className="g-witem-list">{w.exercises.slice(0,4).map(e=>e.name).join(" · ")}{w.exercises.length>4?` +${w.exercises.length-4}`:""}</div>
                      </div>
                      <button className="ib del" onClick={() => delWo(w.id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </>
            }
          </>}

          {/* SELECT */}
          {screen === "select" && <>
            <Nav label="Выбор упражнений"/>
            <div className="g-sh">Выберите упражнения</div>
            <div className="g-info">Нажмите на упражнение чтобы добавить в тренировку.</div>
            <div className="g-legend"><div className="g-legend-dot"/><span>Рекомендуется — давно не делалось или ещё не выполнялось</span></div>
            {cur?.exercises.length > 0 && (
              <div className="g-badges">
                {cur.exercises.map(ex => (
                  <div key={ex.id} className="g-badge">
                    {ex.name}
                    <button className="g-badge-rm" onClick={() => toggleEx({id:ex.id}, ex.group)}>✕</button>
                  </div>
                ))}
              </div>
            )}
            {exercises.map(group => {
              const recId = getRecId(group);
              return (
                <div key={group.slug} className="g-group">
                  <div className="g-group-h"><div className="g-group-dot"/><div className="g-group-name">{group.name}</div></div>
                  {group.exercises.map(ex => {
                    const sel   = cur?.exercises.some(e => e.id === ex.id);
                    const isRec = ex.id === recId;
                    return (
                      <div key={ex.id} className={`g-ex${sel?" sel":""}${isRec&&!sel?" rec":""}`} onClick={() => toggleEx(ex, group.name)}>
                        <div className="g-ex-name">
                          {sel && <span className="g-ex-tick">✓</span>}
                          {ex.name}
                          {isRec && !sel && <span className="g-rec-badge">⭐ рекомендуется</span>}
                        </div>
                        {ex.last_date
                          ? <div className="g-ex-meta">
                              <div className="g-ex-meta-item">📅 <b>{fmtDate(ex.last_date)}</b></div>
                              <div className="g-ex-meta-item">💪 <b>{ex.last_weight != null && ex.last_weight !== "" ? ex.last_weight+" кг" : "б/в"}</b></div>
                              {ex.last_reps && <div className="g-ex-meta-item">📊 <b>{ex.last_reps}</b></div>}
                            </div>
                          : <div className="g-ex-nodate">Ещё не выполнялось</div>
                        }
                        {ex.comment && <div className="g-ex-note">💬 {ex.comment}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div className="g-row" style={{marginTop:18}}>
              <Btn c="ghost" onClick={() => setScreen("home")}>← Назад</Btn>
              <Btn c="acid" onClick={doStart} style={{flex:1}}>Начать тренировку →</Btn>
            </div>
          </>}

          {/* EXEC */}
          {screen === "exec" && cur && <>
            <Nav label={`Тренировка · ${fmtDate(cur.date)}`}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div className="g-sh" style={{marginBottom:0}}>В процессе</div>
              <span className="g-pill g-pill-a">⏱ {cur.exercises.length} упр.</span>
            </div>
            {cur.exercises.map((ex, idx) => {
              const orig = findEx(ex.id);
              return (
                <div key={ex.id} className="g-ecard" ref={el => execCardRefs.current[idx] = el}>
                  <div className="g-ecard-head">
                    <div className="g-ecard-t">{idx+1}. {ex.name}</div>
                    <div className="g-ecard-actions">
                      <Btn c="ghost" sm onClick={() => openReplace(ex)}>Заменить</Btn>
                      <button className="ib del" onClick={() => removeCurrentExercise(ex.id)} title="Удалить из текущей тренировки">🗑</button>
                    </div>
                  </div>
                  {orig?.last_date && (
                    <div className="g-hint">
                      Прошлый раз {fmtDate(orig.last_date)}: {orig.last_weight != null && orig.last_weight !== "" ? orig.last_weight+" кг" : "б/в"}{orig.last_reps ? " · "+orig.last_reps : ""}
                      {orig.comment ? " · "+orig.comment : ""}
                    </div>
                  )}
                  <table className="sets-table">
                    <thead>
                      <tr>
                        <th style={{width:28}}>#</th>
                        <th>Вес (кг)</th>
                        <th>Повторения *</th>
                        <th style={{width:32}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((s, si) => (
                        <tr key={si}>
                          <td><span className="set-num">{si+1}</span></td>
                          <td><input className="set-input" type="number" placeholder="кг" step="0.5"
                            inputMode="decimal" value={s.weight}
                            onChange={e => updSet(ex.id, si, "weight", e.target.value)}/></td>
                          <td><input className={`set-input${!s.reps?" err":""}`} type="text" placeholder="повт."
                            inputMode="numeric" value={s.reps}
                            onChange={e => updSet(ex.id, si, "reps", e.target.value)}/></td>
                          <td>{ex.sets.length > 1 &&
                            <button className="set-del" onClick={() => removeSet(ex.id, si)}>✕</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="add-set-btn" onClick={() => addSet(ex.id)}>+ добавить подход</button>
                  <div className="g-field" style={{marginBottom:0}}>
                    <label>Комментарий</label>
                    <textarea rows={2} placeholder="Заметка..." value={ex.comment} onChange={e => updComment(ex.id, e.target.value)}/>
                  </div>
                </div>
              );
            })}
            <div className="g-row" style={{marginTop:10}}>
              <Btn c="ghost" onClick={abort}>Отменить</Btn>
              <Btn c="green" onClick={finish} style={{flex:1}}>✓ ЗАВЕРШИТЬ</Btn>
            </div>
          </>}

          {/* HISTORY */}
          {screen === "history" && <>
            <Nav label="История"/>
            <div className="g-sh">История</div>
            {workouts.length === 0
              ? <div className="g-empty"><span className="g-empty-i">📭</span>История пуста</div>
              : (() => {
                  const byDate = {};
                  [...workouts].reverse().forEach(w => {
                    const d = new Date(w.date).toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"});
                    if (!byDate[d]) byDate[d] = [];
                    byDate[d].push(w);
                  });
                  return Object.entries(byDate).map(([d, ws]) => (
                    <div key={d} style={{marginBottom:22}}>
                      <div className="g-dg">{d}</div>
                      {ws.map(w => {
                        const expanded = !!expandedWorkouts[w.id];
                        return (
                        <div key={w.id} className="g-card">
                          <div className="g-hist-head">
                            <div>
                              <div className="g-witem-date">
                                {new Date(w.date).toLocaleDateString("ru-RU",{weekday:"short",day:"2-digit",month:"2-digit",year:"numeric"})}
                              </div>
                              <div className="g-card-t">{w.exercises.length} УПРАЖНЕНИЙ</div>
                              {w.bodyWeight
                                ? <span className="bw-tag" style={{marginTop:4,display:"inline-flex"}}>⚖ {w.bodyWeight} кг</span>
                                : <button className="add-set-btn" style={{marginTop:6,padding:"5px 10px",width:"auto",fontSize:11}}
                                    onClick={() => setBodyWeightModal({ woId: w.id, value: w.bodyWeight || "" })}>
                                    + вес тела
                                  </button>
                              }
                              {!countsForLibrary(w) && <span className="g-pill g-pill-a" style={{marginTop:6,display:"inline-block"}}>не влияет на базу</span>}
                            </div>
                            <div className="g-hist-actions">
                              <Btn c="ghost" sm onClick={() => toggleWorkoutExpanded(w.id)}>{expanded ? "Свернуть" : "Развернуть"}</Btn>
                              <Btn c="ghost" sm onClick={() => openDetails(w)}>Детали</Btn>
                              <button className="ib edit" onClick={() => startEditWorkout(w)} title="Редактировать тренировку">✏️</button>
                              <button className="ib del" onClick={() => delWo(w.id)}>🗑</button>
                            </div>
                          </div>
                          {expanded && w.exercises.map(e => (
                            <div key={e.id} className="g-hist-ex">
                              <div className="g-hist-name">{e.name}</div>
                              <div className="g-hist-meta">
                                {e.sets && Array.isArray(e.sets)
                                  ? e.sets.map((s,i) => `П${i+1}: ${s.weight||"б/в"}кг×${s.reps}`).join("  ·  ")
                                  : `${e.weight||"б/в"} кг · ${e.sets}×${e.reps}`}
                              </div>
                              {e.comment && <div className="g-hist-note">💬 {e.comment}</div>}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    </div>
                  ));
                })()
            }
          </>}
        </div>

        {/* DETAIL MODAL */}
        {detailModal && (
          <div className="g-ov" onMouseDown={() => setDetailModal(null)}>
            <div className="g-modal" onMouseDown={e => e.stopPropagation()}>
              <div className="g-modal-t">Детали</div>
              <div className="g-modal-body">{detailModal}</div>
              <div className="g-modal-acts">
                <Btn c="ghost" sm onClick={() => navigator.clipboard?.writeText(detailModal).then(() => showToast("✓ Скопировано!"))}>📋 Копировать</Btn>
                <Btn c="acid" sm onClick={() => setDetailModal(null)}>Закрыть</Btn>
              </div>
            </div>
          </div>
        )}

        {/* BODY WEIGHT MODAL */}
        {bodyWeightModal && (
          <div className="g-ov" style={{zIndex:1050}}>
            <div className="confirm-box" style={{maxWidth:340}}>
              <div className="g-modal-t" style={{fontSize:20}}>Вес тела</div>
              <div style={{fontSize:13,color:"var(--snow2)",marginBottom:16,lineHeight:1.5}}>
                Укажите ваш вес тела на момент тренировки (необязательно)
              </div>
              <div className="bw-bar" style={{marginBottom:20}}>
                <span className="bw-label">⚖</span>
                <input
                  className="bw-input"
                  type="number" step="0.1" placeholder="—"
                  inputMode="decimal"
                  value={bodyWeightModal.value}
                  autoFocus
                  onChange={e => setBodyWeightModal(p => ({ ...p, value: e.target.value }))}
                  onKeyDown={e => { if (e.key==="Enter") saveBodyWeight(bodyWeightModal.woId, bodyWeightModal.value); }}
                  style={{width:100}}
                />
                <span className="bw-unit">кг</span>
              </div>
              <div className="confirm-acts">
                <Btn c="ghost" sm onClick={() => setBodyWeightModal(null)}>Пропустить</Btn>
                <Btn c="acid" sm onClick={() => saveBodyWeight(bodyWeightModal.woId, bodyWeightModal.value)}>Сохранить</Btn>
              </div>
            </div>
          </div>
        )}

        {/* EDIT WORKOUT MODAL */}
        {editingWorkout && (
          <div className="g-ov" style={{zIndex:1070}}>
            <div className="g-modal" style={{maxWidth:680}}>
              <div className="g-modal-head">
                <div>
                  <div className="g-modal-t">Редактировать тренировку</div>
                  <div className="g-modal-sub" style={{marginBottom:0}}>
                    {countsForLibrary(editingWorkout) ? "Изменения пересчитают базу упражнений" : "Эта тренировка не влияет на базу упражнений"}
                  </div>
                </div>
                <button className="modal-x" onClick={() => setEditingWorkout(null)} title="Закрыть">×</button>
              </div>

              <div className="g-2col">
                <div className="g-field">
                  <label>Дата тренировки</label>
                  <input type="date" value={editingWorkout.date} onChange={e => upEditWorkout("date", e.target.value)}/>
                </div>
                <div className="g-field">
                  <label>Вес тела (кг)</label>
                  <input type="number" step="0.1" inputMode="decimal" placeholder="—"
                    value={editingWorkout.bodyWeight}
                    onChange={e => upEditWorkout("bodyWeight", e.target.value)}/>
                </div>
              </div>

              {editingWorkout.exercises.map((ex, exIdx) => (
                <div key={`${ex.id}-${exIdx}`} className="hist-edit-ex">
                  <div className="hist-edit-head">
                    <div className="hist-edit-title">{exIdx + 1}. {ex.name}</div>
                    <button className="ib del" onClick={() => removeEditWorkoutExercise(exIdx)} title="Удалить из этой тренировки">🗑</button>
                  </div>
                  <table className="sets-table">
                    <thead>
                      <tr>
                        <th style={{width:28}}>#</th>
                        <th>Вес (кг)</th>
                        <th>Повторения *</th>
                        <th style={{width:32}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {ex.sets.map((s, si) => (
                        <tr key={si}>
                          <td><span className="set-num">{si + 1}</span></td>
                          <td>
                            <input className="set-input" type="number" step="0.5" inputMode="decimal"
                              value={s.weight}
                              onChange={e => upEditWorkoutSet(exIdx, si, "weight", e.target.value)}/>
                          </td>
                          <td>
                            <input className={`set-input${!String(s.reps || "").trim()?" err":""}`} type="text" inputMode="numeric"
                              value={s.reps}
                              onChange={e => upEditWorkoutSet(exIdx, si, "reps", e.target.value)}/>
                          </td>
                          <td>{ex.sets.length > 1 &&
                            <button className="set-del" onClick={() => removeEditWorkoutSet(exIdx, si)}>✕</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="add-set-btn" onClick={() => addEditWorkoutSet(exIdx)}>+ добавить подход</button>
                  <div className="g-field" style={{marginBottom:0}}>
                    <label>Комментарий</label>
                    <textarea rows={2} value={ex.comment} onChange={e => upEditWorkoutComment(exIdx, e.target.value)}/>
                  </div>
                </div>
              ))}

              <div className="g-modal-acts">
                <Btn c="ghost" sm onClick={() => setEditingWorkout(null)}>Отмена</Btn>
                <Btn c="acid" sm onClick={saveEditedWorkout}>Сохранить</Btn>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY MODAL */}
        {libOpen && (
          <div className="g-ov" onMouseDown={() => { setLibOpen(false); setEditingEx(null); setEditingGrp(null); }}>
            <div className="g-modal" style={{maxWidth:620}} onMouseDown={e => e.stopPropagation()}>
              <div className="g-modal-head">
                <div className="g-modal-t">База упражнений</div>
                <button className="modal-x" onClick={() => { setLibOpen(false); setEditingEx(null); setEditingGrp(null); }} title="Закрыть">×</button>
              </div>
              <div className="g-modal-sub">{totalEx} упражнений · {exercises.length} групп · ⠿ перетащить</div>

              {exercises.map(group => (
                <div key={group.slug} className="lib-section">
                  <div className={`group-drop-zone${groupDragOver===group.name?" active":""}`}
                    data-group-dropzone="1" data-before={group.name}
                    onDragOver={e => onGroupDragOver(e, group.name)}
                    onDrop={e => onGroupDrop(e, group.name)}/>
                  <div className={`lib-group-row${draggingGroup===group.name?" dragging":""}${groupDragOver===group.name?" drag-over":""}`}
                    draggable onDragStart={e => onGroupDragStart(e, group.name)} onDragEnd={onDragEnd}>
                    <span className="drag-handle" title="Перетащить группу" onTouchStart={e => startTouchGroupDrag(e, group.name)}>⠿</span>
                    <div className="lib-group-name">💪 {group.name}</div>
                    <div className="lib-actions">
                      <IB type="edit" onClick={() => startEditGroup(group)} title="Редактировать"/>
                      <IB type="del"  onClick={() => handleDelGroup(group.name)} title="Удалить"/>
                    </div>
                  </div>

                  {editingGrp?.oldName === group.name && (
                    <div className="edit-box">
                      <div className="g-field" style={{marginBottom:10}}>
                        <label>Новое название</label>
                        <input type="text" value={editingGrp.newName}
                          onChange={e => setEditingGrp(p => ({ ...p, newName: e.target.value }))}/>
                      </div>
                      <div className="g-row">
                        <Btn c="acid" sm onClick={saveEditGroup}>Сохранить</Btn>
                        <Btn c="ghost" sm onClick={() => setEditingGrp(null)}>Отмена</Btn>
                      </div>
                    </div>
                  )}

                  <div className={`drop-zone${dragOver?.groupName===group.name && dragOver?.afterId===null?" active":""}`}
                    data-dropzone="1" data-group={group.name} data-after="null"
                    onDragOver={e => onDragOver(e, group.name, null)}
                    onDrop={e => onDrop(e, group.name, null)}/>

                  {group.exercises.length === 0 &&
                    <div style={{fontSize:12,color:"var(--steel)",padding:"4px 0 4px 14px",fontStyle:"italic"}}>Упражнений нет</div>}

                  {group.exercises.map(ex => (
                    <div key={ex.id}>
                      <div className={`lib-ex-row${draggingId===ex.id?" dragging":""}${dragOver?.groupName===group.name&&dragOver?.afterId===ex.id?" drag-over":""}`}
                        draggable onDragStart={e => onDragStart(e, ex.id, group.name)} onDragEnd={onDragEnd}>
                        <span className="drag-handle" onTouchStart={e => startTouchDrag(e, ex.id, group.name)}>⠿</span>
                        <div className="lib-ex-info">
                          <div className="lib-ex-name">{ex.name}</div>
                          <div className="lib-ex-meta">
                            {ex.last_date ? `📅 ${fmtDate(ex.last_date)}` : "Не выполнялось"}
                            {ex.last_weight != null && ex.last_weight !== "" ? `  ·  💪 ${ex.last_weight} кг` : ""}
                            {ex.last_reps ? `  ·  📊 ${ex.last_reps}` : ""}
                            {ex.comment ? `  ·  💬 ${ex.comment}` : ""}
                          </div>
                        </div>
                        <div className="lib-actions">
                          <IB type="edit" onClick={() => startEditEx(group.name, ex)}/>
                          <IB type="del"  onClick={() => handleDelEx(group.name, ex.id)}/>
                        </div>
                      </div>

                      <div className={`drop-zone${dragOver?.groupName===group.name&&dragOver?.afterId===ex.id?" active":""}`}
                        data-dropzone="1" data-group={group.name} data-after={ex.id}
                        onDragOver={e => onDragOver(e, group.name, ex.id)}
                        onDrop={e => onDrop(e, group.name, ex.id)}/>

                      {editingEx?.groupName === group.name && editingEx?.exId === ex.id && (
                        <div className="edit-box">
                          <div className="g-field">
                            <label>Название</label>
                            <input type="text" value={editingEx.f.name} onChange={e => upEditEx("name", e.target.value)}/>
                          </div>
                          <div className="g-2col">
                            <div className="g-field">
                              <label>Вес (кг)</label>
                              <input type="text" placeholder="40 или 35-40-45" value={editingEx.f.w} onChange={e => upEditEx("w", e.target.value)}/>
                            </div>
                            <div className="g-field">
                              <label>Дата</label>
                              <input type="date" value={editingEx.f.d} onChange={e => upEditEx("d", e.target.value)}/>
                            </div>
                          </div>
                          <div className="g-2col">
                            <div className="g-field">
                              <label>Подходы</label>
                              <input type="text" placeholder="3" value={editingEx.f.s} onChange={e => upEditEx("s", e.target.value)}/>
                            </div>
                            <div className="g-field">
                              <label>Повторения</label>
                              <input type="text" placeholder="10" value={editingEx.f.r} onChange={e => upEditEx("r", e.target.value)}/>
                            </div>
                          </div>
                          <div className="g-field">
                            <label>Комментарий</label>
                            <textarea rows={2} value={editingEx.f.c} onChange={e => upEditEx("c", e.target.value)}/>
                          </div>
                          <div className="g-row">
                            <Btn c="acid" sm onClick={saveEditEx}>Сохранить</Btn>
                            <Btn c="ghost" sm onClick={() => setEditingEx(null)}>Отмена</Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div className={`group-drop-zone${groupDragOver===null && draggingGroup?" active":""}`}
                data-group-dropzone="1" data-before="null"
                onDragOver={e => onGroupDragOver(e, null)}
                onDrop={e => onGroupDrop(e, null)}/>

              <div className="lib-divider"/>

              <div className="lib-form-box" style={{marginBottom:12}}>
                <div className="lib-form-title">+ НОВОЕ УПРАЖНЕНИЕ</div>
                <div className="g-field">
                  <label>Группа мышц</label>
                  <select value={exForm.groupIdx} onChange={e => upEx("groupIdx", e.target.value)}>
                    <option value="">— Выберите группу —</option>
                    {exercises.map((g,i) => <option key={i} value={i}>{g.name}</option>)}
                  </select>
                </div>
                <div className="g-field">
                  <label>Название</label>
                  <input type="text" placeholder="Название упражнения" value={exForm.name} onChange={e => upEx("name", e.target.value)}/>
                </div>
                <div className="g-2col">
                  <div className="g-field">
                    <label>Вес (кг)</label>
                    <input type="text" placeholder="40 или 35-40-45" value={exForm.w} onChange={e => upEx("w", e.target.value)}/>
                  </div>
                  <div className="g-field">
                    <label>Дата</label>
                    <input type="date" value={exForm.d} onChange={e => upEx("d", e.target.value)}/>
                  </div>
                </div>
                <div className="g-2col">
                  <div className="g-field">
                    <label>Подходы</label>
                    <input type="text" placeholder="3" value={exForm.s} onChange={e => upEx("s", e.target.value)}/>
                  </div>
                  <div className="g-field">
                    <label>Повторения</label>
                    <input type="text" placeholder="10" value={exForm.r} onChange={e => upEx("r", e.target.value)}/>
                  </div>
                </div>
                <div className="g-field">
                  <label>Комментарий</label>
                  <textarea rows={2} placeholder="Заметка..." value={exForm.c} onChange={e => upEx("c", e.target.value)}/>
                </div>
                <Btn c="acid" sm onClick={handleAddExercise}>+ Добавить упражнение</Btn>
              </div>

              <div className="lib-form-box">
                <div className="lib-form-title">+ НОВАЯ ГРУППА МЫШЦ</div>
                <div className="g-field" style={{marginBottom:10}}>
                  <label>Название группы</label>
                  <input type="text" placeholder="Пример: Предплечья" value={grpForm.name}
                    onChange={e => setGrpForm({ name: e.target.value })}/>
                </div>
                <Btn c="acid" sm onClick={handleAddGroup}>+ Добавить группу</Btn>
              </div>

              <div className="g-modal-acts" style={{marginTop:16}}>
                <Btn c="ghost" sm onClick={() => { setLibOpen(false); setEditingEx(null); setEditingGrp(null); }}>Закрыть</Btn>
              </div>
            </div>
          </div>
        )}

        {/* REPLACE EXERCISE MODAL */}
        {replaceModal && (() => {
          const group = exercises.find(g => g.name === replaceModal.groupName);
          const selectedIds = new Set(cur?.exercises.map(e => e.id) || []);
          const options = (group?.exercises || []).filter(ex => ex.id !== replaceModal.exId && !selectedIds.has(ex.id));
          return (
            <div className="g-ov" style={{zIndex:1080}} onMouseDown={() => setReplaceModal(null)}>
              <div className="g-modal" style={{maxWidth:440}} onMouseDown={e => e.stopPropagation()}>
                <div className="g-modal-t">Заменить упражнение</div>
                <div className="g-modal-sub">{replaceModal.groupName}</div>
                <div className="replace-list">
                  {options.map(ex => (
                    <button key={ex.id} type="button" className="replace-item"
                      onClick={() => replaceCurrentExercise(replaceModal.exId, ex.id)}>
                      <div className="replace-name">{ex.name}</div>
                      <div className="replace-meta">
                        {ex.last_date ? `Прошлый раз ${fmtDate(ex.last_date)}` : "Ещё не выполнялось"}
                        {ex.last_weight != null && ex.last_weight !== "" ? ` · ${ex.last_weight} кг` : ""}
                        {ex.last_reps ? ` · ${ex.last_reps}` : ""}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="g-modal-acts">
                  <Btn c="ghost" sm onClick={() => setReplaceModal(null)}>Отмена</Btn>
                </div>
              </div>
            </div>
          );
        })()}

        {/* FINISH PROMPT */}
        {finishPrompt && (
          <div className="g-ov" style={{zIndex:1090}}>
            <div className="confirm-box" style={{maxWidth:420}}>
              <div className="confirm-msg">
                Учитывать данные этой тренировки в базе упражнений?
              </div>
              <div style={{fontSize:12,color:"var(--steel)",lineHeight:1.5,marginBottom:18}}>
                Если выбрать “нет”, тренировка сохранится в истории, но последние веса, повторы, дата и комментарии в базе упражнений не изменятся.
              </div>
              <div className="confirm-acts">
                <Btn c="ghost" sm onClick={() => completeWorkout(false)}>{finishBusy ? "…" : "Нет, только история"}</Btn>
                <Btn c="green" sm onClick={() => completeWorkout(true)}>{finishBusy ? "…" : "Да, обновить базу"}</Btn>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRM DIALOG */}
        {confirmDialog && (
          <div className="g-ov" style={{zIndex:1100}}>
            <div className="confirm-box">
              <div className="confirm-msg">{confirmDialog.msg}</div>
              <div className="confirm-acts">
                <Btn c="ghost" sm onClick={() => { confirmDialog.onCancel?.(); setConfirmDialog(null); }}>
                  {confirmDialog.cancelText}
                </Btn>
                <Btn c={confirmDialog.okClass} sm onClick={() => { confirmDialog.onOk(); setConfirmDialog(null); }}>
                  {confirmDialog.okText}
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* TOAST */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
