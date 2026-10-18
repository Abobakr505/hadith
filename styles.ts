export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Tajawal:wght@400;500;700;800&display=swap');

:root{
  --fs:1;
  --bg:#f7f3ea; --card:#ffffff; --card2:#fbf8f1; --ink:#1f2a24; --muted:#6b7a70;
  --line:#e6dfcd; --brand:#0f766e; --brand2:#059669; --gold:#b8941f; --goldsoft:#f6ecc4;
  --shadow:0 10px 30px -12px rgba(15,60,45,.25);
  color-scheme:light;
}
:root.dark{
  --bg:#09130f; --card:#10201a; --card2:#142a21; --ink:#e8efe9; --muted:#93a79b;
  --line:#21392e; --brand:#2dd4bf; --brand2:#34d399; --gold:#e0be4a; --goldsoft:#2a2610;
  --shadow:0 10px 30px -12px rgba(0,0,0,.7);
  color-scheme:dark;
}

html,body,#root{height:100%;margin:0}
.hx-root{
  font-family:'Tajawal',system-ui,sans-serif; color:var(--ink); background-color:var(--bg);
  background-image:
    radial-gradient(circle at 15% 0%, rgba(16,185,129,.13), transparent 40%),
    radial-gradient(circle at 90% 100%, rgba(201,162,39,.12), transparent 40%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23c9a227' stroke-opacity='.12' stroke-width='1'%3E%3Cpath d='M30 4l7 19 19 7-19 7-7 19-7-19-19-7 19-7z'/%3E%3Crect x='14' y='14' width='32' height='32' transform='rotate(45 30 30)'/%3E%3C/g%3E%3C/svg%3E");
  transition:background-color .4s, color .4s;
}
.hadith-font{font-family:'Amiri',serif}

/* ---------- مقاييس النصوص (تتأثر بتكبير الخط) ---------- */
.hx-t-hadith{font-size:calc(1.3rem*var(--fs));line-height:2.15}
.hx-t-body{font-size:calc(.95rem*var(--fs));line-height:1.9}
.hx-t-small{font-size:calc(.8rem*var(--fs));line-height:1.8}
.hx-t-tiny{font-size:calc(.7rem*var(--fs))}

/* ---------- الحركات ---------- */
@keyframes hx-up{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:none}}
@keyframes hx-fade{from{opacity:0}to{opacity:1}}
@keyframes hx-pop{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
@keyframes hx-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
@keyframes hx-pan{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
@keyframes hx-shine{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}
@keyframes hx-pulse{0%,100%{box-shadow:0 0 0 0 rgba(52,211,153,.5)}50%{box-shadow:0 0 0 9px rgba(52,211,153,0)}}
@keyframes hx-dot{0%,80%,100%{transform:scale(.5);opacity:.4}40%{transform:scale(1);opacity:1}}
@keyframes hx-spin{to{transform:rotate(360deg)}}
@keyframes hx-drawer{from{transform:translateX(-100%)}to{transform:none}}
@keyframes hx-toast{from{opacity:0;transform:translate(-50%,16px) scale(.95)}to{opacity:1;transform:translate(-50%,0) scale(1)}}
@keyframes hx-star{0%{transform:scale(1) rotate(0)}40%{transform:scale(1.5) rotate(-18deg)}100%{transform:scale(1) rotate(0)}}
@keyframes hx-skel{0%{background-position:200% 0}100%{background-position:-200% 0}}

.hx-up{animation:hx-up .55s cubic-bezier(.2,.8,.2,1) both}
.hx-fade{animation:hx-fade .3s ease both}
.hx-pop{animation:hx-pop .5s cubic-bezier(.2,.9,.3,1.3) both}
.hx-float{animation:hx-float 4.5s ease-in-out infinite}

/* ---------- الهيدر ---------- */
.hx-header{
  position:sticky;top:0;z-index:30;color:#fff;
  background:linear-gradient(115deg,#04241f,#0b5d4b 50%,#04241f);background-size:200% 100%;
  animation:hx-pan 16s ease infinite;box-shadow:0 12px 30px -14px rgba(0,0,0,.6);
}
.hx-header::after{
  content:"";position:absolute;inset-inline:0;bottom:0;height:2px;
  background:linear-gradient(90deg,transparent,#e6c453,transparent);
}
.hx-logo{
  background:linear-gradient(135deg,#0f766e,#064e3b);border:1px solid rgba(230,196,83,.4);
  box-shadow:inset 0 0 12px rgba(0,0,0,.35), 0 0 18px rgba(230,196,83,.18);
  position:relative;overflow:hidden;
}
.hx-logo::after{
  content:"";position:absolute;inset:0;width:40%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent);
  animation:hx-shine 3.6s ease-in-out infinite;
}
.hx-hbtn{
  display:inline-flex;align-items:center;justify-content:center;border:0;cursor:pointer;
  padding:.6rem;border-radius:.9rem;color:#a7f3d0;background:rgba(2,26,21,.55);
  transition:transform .2s, background .2s, color .2s;
}
.hx-hbtn:hover{background:rgba(6,78,59,.9);transform:translateY(-2px)}
.hx-hbtn:active{transform:scale(.88)}
.hx-hbtn:disabled{opacity:.4;cursor:not-allowed;transform:none}
.hx-hbtn.danger:hover{background:rgba(244,63,94,.25);color:#fda4af}
.hx-fontbox{
  display:flex;align-items:center;gap:.15rem;padding:.2rem;border-radius:1rem;
  background:rgba(2,26,21,.55);border:1px solid rgba(167,243,208,.15);
}
.hx-fontbox .hx-hbtn{padding:.4rem;background:transparent}
.hx-fontbox .hx-hbtn:hover{background:rgba(6,78,59,.9)}
.hx-fontlvl{display:flex;flex-direction:column;align-items:center;gap:3px;padding:0 .3rem;min-width:2rem}
.hx-fontlvl b{font-size:.85rem;line-height:1;color:#fde68a}
.hx-dots{display:flex;gap:3px}
.hx-dots i{width:5px;height:5px;border-radius:50%;background:rgba(167,243,208,.3);transition:.3s}
.hx-dots i.on{background:#fcd34d;transform:scale(1.15)}

/* ---------- البطاقات ---------- */
.hx-card{
  background:var(--card);border:1px solid var(--line);border-radius:1.25rem;
  box-shadow:var(--shadow);transition:background .4s,border-color .4s,transform .25s, box-shadow .25s;
}
.hx-hero{
  background:color-mix(in srgb,var(--card) 80%,transparent);backdrop-filter:blur(10px);
  border:1px solid var(--line);border-radius:2.2rem;box-shadow:0 20px 50px -20px rgba(5,150,105,.35);
}
.hx-hero-icon{
  background:linear-gradient(135deg,#d1fae5,#fef3c7);border:1px solid #a7f3d0;
  box-shadow:inset 0 0 20px rgba(16,185,129,.2),0 10px 25px -8px rgba(16,185,129,.5);
}
:root.dark .hx-hero-icon{background:linear-gradient(135deg,#064e3b,#3f3410);border-color:#115e45}
.hx-gradtext{background:linear-gradient(90deg,#047857,#b8941f);-webkit-background-clip:text;background-clip:text;color:transparent}
:root.dark .hx-gradtext{background:linear-gradient(90deg,#34d399,#fde68a);-webkit-background-clip:text;background-clip:text}
.hx-chipbtn{
  display:flex;align-items:center;gap:.75rem;width:100%;text-align:right;cursor:pointer;
  padding:.8rem 1.1rem;border-radius:1rem;font-weight:700;font-size:.85rem;color:var(--ink);
  background:var(--card);border:1px solid var(--line);
  transition:transform .25s, border-color .25s, box-shadow .25s, background .25s;
}
.hx-chipbtn:hover{transform:translateX(-6px);border-color:var(--brand2);box-shadow:0 8px 20px -10px rgba(5,150,105,.5)}
.hx-chipbtn:active{transform:scale(.97)}
.hx-chipbtn span{color:var(--gold)}

/* ---------- الدرجات ---------- */
.hx-lv-sahih{--c:#059669}.hx-lv-hasan{--c:#0d9488}.hx-lv-daif{--c:#d97706}.hx-lv-mawdu{--c:#e11d48}.hx-lv-unknown{--c:#64748b}
:root.dark .hx-lv-sahih{--c:#34d399}:root.dark .hx-lv-hasan{--c:#2dd4bf}:root.dark .hx-lv-daif{--c:#fbbf24}
:root.dark .hx-lv-mawdu{--c:#fb7185}:root.dark .hx-lv-unknown{--c:#94a3b8}
.hx-lvchip{
  display:inline-flex;align-items:center;gap:.4rem;padding:.3rem .85rem;border-radius:999px;font-weight:800;
  font-size:calc(.78rem*var(--fs));color:var(--c);
  background:color-mix(in srgb,var(--c) 13%,transparent);border:1px solid color-mix(in srgb,var(--c) 38%,transparent);
}

/* ---------- بطاقة الحديث ---------- */
.hx-hcard{position:relative;overflow:hidden;background:var(--card);border:1px solid var(--line);border-radius:1.3rem;box-shadow:var(--shadow);transition:transform .3s, box-shadow .3s}
.hx-hcard:hover{transform:translateY(-3px)}
.hx-hcard::before{content:"";position:absolute;inset-block:0;inset-inline-start:0;width:6px;background:linear-gradient(180deg,var(--c),color-mix(in srgb,var(--c) 40%,transparent))}
.hx-hcard.alt{border:2px dashed color-mix(in srgb,var(--brand2) 55%,transparent);background:color-mix(in srgb,var(--brand2) 7%,var(--card))}
.hx-quote{position:absolute;top:.2rem;inset-inline-end:.9rem;font-family:'Amiri',serif;font-size:4.5rem;line-height:1;color:var(--gold);opacity:.18;pointer-events:none}
.hx-field{display:flex;gap:.45rem;align-items:flex-start;color:var(--muted)}
.hx-field b{color:var(--ink)}
.hx-act{
  border:0;background:transparent;cursor:pointer;padding:.5rem;border-radius:.75rem;color:var(--muted);
  transition:transform .2s, background .2s, color .2s;
}
.hx-act:hover{transform:scale(1.15);background:color-mix(in srgb,var(--brand2) 14%,transparent);color:var(--brand2)}
.hx-act.fav{color:#f59e0b}
.hx-act.fav svg{animation:hx-star .5s ease}
.hx-act.ok{color:var(--brand2)}

/* ---------- الخلاصة والملاحظة ---------- */
.hx-summary{
  border-radius:1.2rem;padding:1rem 1.1rem;border:1px solid color-mix(in srgb,var(--brand2) 30%,transparent);
  background:linear-gradient(135deg,color-mix(in srgb,var(--brand2) 12%,var(--card)),color-mix(in srgb,var(--gold) 9%,var(--card)));
}
.hx-note{border-radius:1rem;padding:.8rem 1rem;border:1px solid color-mix(in srgb,var(--gold) 40%,transparent);background:color-mix(in srgb,var(--gold) 10%,var(--card))}
.hx-h{display:flex;align-items:center;gap:.4rem;font-weight:800;margin-bottom:.35rem;font-size:calc(.78rem*var(--fs))}
.hx-more{
  display:flex;width:100%;align-items:center;justify-content:space-between;cursor:pointer;
  padding:.7rem 1rem;border-radius:1rem;font-weight:800;font-size:.8rem;color:var(--muted);
  background:var(--card2);border:1px solid var(--line);transition:background .2s,transform .2s;
}
.hx-more:hover{transform:translateY(-1px);color:var(--brand2)}

/* ---------- الفقاعات ---------- */
.hx-bubble{max-width:96%;padding:1rem 1.1rem;border-radius:1.7rem;border:1px solid var(--line);box-shadow:var(--shadow);position:relative}
@media(min-width:768px){.hx-bubble{max-width:90%;padding:1.2rem 1.3rem}}
.hx-bubble-user{background:linear-gradient(135deg,color-mix(in srgb,var(--brand2) 16%,var(--card)),color-mix(in srgb,var(--brand2) 8%,var(--card)));border-end-end-radius:.35rem}
.hx-bubble-bot{background:var(--card);border-end-start-radius:.35rem}
.hx-avatar{width:1.7rem;height:1.7rem;border-radius:.6rem;display:flex;align-items:center;justify-content:center;color:#fff;background:linear-gradient(135deg,#059669,#0f766e)}
.hx-avatar.user{background:linear-gradient(135deg,#d4a72c,#b8941f)}
.hx-link{
  display:inline-block;padding:.25rem .7rem;border-radius:.6rem;font-weight:700;text-decoration:none;
  font-size:calc(.68rem*var(--fs));color:var(--muted);background:var(--card2);border:1px solid var(--line);transition:.2s;
}
.hx-link:hover{color:var(--brand2);border-color:var(--brand2);transform:translateY(-2px)}

/* ---------- التحميل ---------- */
.hx-dotsload{display:flex;gap:.3rem}
.hx-dotsload i{width:.45rem;height:.45rem;border-radius:50%;background:var(--brand2);animation:hx-dot 1.2s infinite}
.hx-dotsload i:nth-child(2){animation-delay:.15s}.hx-dotsload i:nth-child(3){animation-delay:.3s}
.hx-skel{height:.8rem;border-radius:.5rem;background:linear-gradient(90deg,var(--line) 25%,color-mix(in srgb,var(--brand2) 22%,var(--line)) 50%,var(--line) 75%);background-size:200% 100%;animation:hx-skel 1.4s linear infinite}

/* ---------- الإدخال ---------- */
.hx-footer{position:fixed;inset-inline:0;bottom:0;z-index:40;padding:1rem;background:linear-gradient(to top,var(--bg) 55%,transparent)}
.hx-input{
  display:flex;align-items:flex-end;gap:.6rem;padding:.55rem;border-radius:2rem;background:var(--card);
  border:1px solid var(--line);box-shadow:0 14px 40px -16px rgba(0,0,0,.3);transition:.4s;
}
.hx-input:focus-within{border-color:var(--brand2);box-shadow:0 0 0 5px color-mix(in srgb,var(--brand2) 14%,transparent),0 14px 40px -16px rgba(0,0,0,.3)}
.hx-input textarea{flex:1;border:0;outline:0;resize:none;background:transparent;color:var(--ink);font:inherit;font-size:1rem;line-height:1.7;padding:.8rem 1.1rem;max-height:9rem;min-height:3rem}
.hx-input textarea::placeholder{color:var(--muted);opacity:.6}
.hx-send{
  width:3.2rem;height:3.2rem;border:0;border-radius:1.4rem;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,#10b981,#0f766e);box-shadow:0 8px 20px -6px rgba(16,185,129,.7);transition:transform .25s, box-shadow .25s;
}
.hx-send:hover{transform:translateY(-2px) rotate(-6deg)}
.hx-send:active{transform:scale(.9)}
.hx-send:disabled{background:var(--card2);color:var(--muted);box-shadow:none;cursor:not-allowed;transform:none;border:1px solid var(--line)}
.hx-spin{width:1.3rem;height:1.3rem;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;animation:hx-spin .8s linear infinite}
.hx-credit{
  display:flex;width:fit-content;margin:.6rem auto 0;gap:.3rem;align-items:center;padding:.4rem 1rem;border-radius:1rem;
  font-size:.75rem;color:var(--muted);background:var(--card);border:1px solid var(--line);text-decoration:none;transition:.25s;
}
.hx-credit:hover{transform:translateY(-2px);border-color:var(--gold)}
.hx-heart{display:inline-block;animation:hx-float 1.6s ease-in-out infinite}

/* ---------- نوافذ ---------- */
.hx-backdrop{position:fixed;inset:0;z-index:50;background:rgba(0,0,0,.5);backdrop-filter:blur(5px);animation:hx-fade .25s ease both}
.hx-drawer{position:fixed;inset-block:0;left:0;width:90%;max-width:26rem;background:var(--bg);box-shadow:20px 0 50px rgba(0,0,0,.4);display:flex;flex-direction:column;animation:hx-drawer .35s cubic-bezier(.2,.8,.2,1) both}
.hx-modal{width:90%;max-width:22rem;background:var(--card);border-radius:1.6rem;padding:1.5rem;text-align:center;border:1px solid var(--line);animation:hx-pop .4s cubic-bezier(.2,.9,.3,1.2) both}
.hx-toast{
  position:fixed;left:50%;bottom:8.5rem;z-index:70;transform:translateX(-50%);
  padding:.7rem 1.3rem;border-radius:999px;font-size:.8rem;font-weight:700;color:#fff;
  background:linear-gradient(135deg,#059669,#0f766e);box-shadow:0 12px 30px -8px rgba(5,150,105,.7);
  animation:hx-toast .35s cubic-bezier(.2,.9,.3,1.2) both;
}
.hx-btn{border:0;cursor:pointer;font:inherit;font-weight:800;font-size:.8rem;padding:.55rem 1.2rem;border-radius:.9rem;transition:.2s}
.hx-btn:active{transform:scale(.94)}
.hx-btn.soft{background:var(--card2);color:var(--ink);border:1px solid var(--line)}
.hx-btn.red{background:#f43f5e;color:#fff}
.hx-btn.red:hover{background:#e11d48}
.hx-scrollbtn{
  position:fixed;inset-inline-start:1rem;bottom:9.5rem;z-index:45;width:2.6rem;height:2.6rem;border-radius:50%;border:1px solid var(--line);
  background:var(--card);color:var(--brand2);display:flex;align-items:center;justify-content:center;cursor:pointer;
  box-shadow:var(--shadow);animation:hx-pop .4s both;transition:transform .2s;
}
.hx-scrollbtn:hover{transform:translateY(-3px)}
.hx-badge{position:absolute;top:-.3rem;inset-inline-start:-.3rem;min-width:1.1rem;height:1.1rem;border-radius:999px;background:#fbbf24;color:#052e2b;font-size:.62rem;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 .25rem;animation:hx-pop .4s both}

/* ---------- عام ---------- */
.hx-main::-webkit-scrollbar,.hx-drawer ::-webkit-scrollbar{width:8px}
.hx-main::-webkit-scrollbar-thumb,.hx-drawer ::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--brand2) 35%,transparent);border-radius:8px}
@media (prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
/* ---------- ضبط الهيدر ---------- */
.hx-header{padding:.7rem 1rem}
.hx-hrow{display:flex;align-items:center;justify-content:space-between;gap:.5rem;max-width:64rem;margin:0 auto}
.hx-brand{display:flex;align-items:center;gap:.7rem;min-width:0;flex:1}
.hx-logo{flex-shrink:0;border-radius:1rem;padding:.55rem;display:flex}
.hx-titles{min-width:0}
.hx-title{margin:0;font-size:1.2rem;font-weight:800;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hx-sub{margin:.3rem 0 0;font-size:.7rem;font-weight:500;color:#6ee7b7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hx-tools{display:flex;align-items:center;gap:.3rem;flex-shrink:0}

@media (max-width:640px){
  .hx-header{padding:.75rem .75rem}
  .hx-sub{display:none}
  .hx-brand{gap:.6rem}
  .hx-logo{padding:.5rem;border-radius:.9rem}
  .hx-logo svg{width:24px;height:24px}
  .hx-title{font-size:1.15rem}
  .hx-tools{gap:.25rem}
  .hx-hbtn{padding:.55rem}
  .hx-hbtn svg{width:19px;height:19px}
  .hx-fontbox .hx-hbtn{padding:.4rem}
  .hx-fontbox .hx-hbtn svg{width:16px;height:16px}
  .hx-fontlvl{min-width:1.6rem;padding:0 .15rem}
}
@media (max-width:380px){
  .hx-title{font-size:1rem}
  .hx-fontlvl{display:none}
}
/* ---------- قلب المطوّر ---------- */
.hx-credit{gap:.4rem}
.hx-heartwrap{position:relative;display:inline-flex;align-items:center;justify-content:center;width:1.3em;height:1.3em}
.hx-heart{
  display:inline-block;transform-origin:center;
  animation:hx-beat 1.5s ease-in-out infinite;
  filter:drop-shadow(0 0 5px rgba(52,211,153,.8));
}
@keyframes hx-beat{
  0%,100%{transform:scale(1)}
  12%{transform:scale(1.35)}
  26%{transform:scale(1)}
  40%{transform:scale(1.22)}
  60%{transform:scale(1)}
}
.hx-heartwrap i{
  position:absolute;left:50%;bottom:55%;font-style:normal;font-size:.6rem;line-height:1;
  color:#34d399;opacity:0;pointer-events:none;
  animation:hx-rise 3s ease-out infinite;
}
.hx-heartwrap i:nth-of-type(1){--x:-10px;animation-delay:0s}
.hx-heartwrap i:nth-of-type(2){--x:9px;animation-delay:1s;color:#fbbf24}
.hx-heartwrap i:nth-of-type(3){--x:-2px;animation-delay:2s}
@keyframes hx-rise{
  0%{opacity:0;transform:translate(-50%,0) scale(.4)}
  20%{opacity:.95}
  100%{opacity:0;transform:translate(calc(-50% + var(--x)),-30px) scale(1.1)}
}
.hx-credit:hover .hx-heart{animation-duration:.6s;filter:drop-shadow(0 0 9px rgba(52,211,153,1))}
.hx-credit:hover .hx-heartwrap i{animation-duration:1.6s}
.hx-name{
  font-weight:800;
  background:linear-gradient(90deg,#059669,#d4a72c,#059669);background-size:200% 100%;
  -webkit-background-clip:text;background-clip:text;color:transparent;
  animation:hx-pan 4s linear infinite;
}
`;