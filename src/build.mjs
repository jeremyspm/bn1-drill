import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRILL = path.resolve(__dirname, '..');
// Bundled copy of the Canvas quiz export, so the repo rebuilds anywhere.
const SRC_TXT = path.join(__dirname, 'source-quizzes.txt');

// ---------- 1. Parse the raw quiz bank ----------
const CODES = [
  ['Anatomical Terminology', 'ANAT'], ['Cell Structure and Function', 'CELLFN'],
  ['Cell Division', 'CELLDIV'], ['Membrane Transport', 'MEMB'],
  ['Tissues (Structure and Function 1)', 'TIS1'],
  ['Tissues of the Human Body (Structure and Function 2)', 'TIS2'],
  ['Microbes 1', 'MIC1'], ['Microbes 2', 'MIC2'],
  ['Microbiology Terminology', 'MICTERM'], ['Microbiology Review', 'MICREV'],
  ['Acidosis and Alkalosis', 'ACID'], ['Blood', 'BLOOD'], ['Buffers', 'BUF'],
  ['The Integumentary System', 'INTEG'], ['Heat and Temperature', 'HEAT'],
  ['Homeostasis', 'HOMEO'], ['Homeostasis and Terminology', 'HOMEOT'],
  ['Osmosis and Fluid Movement', 'OSMO'], ['Fluids, Acids and Bases', 'FLU'],
  ['pH', 'PH'], ['The Urinary System', 'URIN'], ['Nutrients', 'NUTR'],
  ['Nutrition', 'NUTN'], ['Basic Digestive System Structure & Function', 'DIGB'],
  ['Digestive System Structure & Function', 'DIGF'], ['Digestion - SAQs', 'DIGSAQ'],
  ['Digestion (mouth to stomach)', 'DIGMS'], ['Digestion (duodenum to anus)', 'DIGDA'],
  ['Carbohydrate Metabolism', 'CARB'], ['Protein Metabolism', 'PROT'],
  ['Lipid Metabolism', 'LIPID'], ['More Metabolism Questions', 'METAB'],
  ['DNA Protein Synthesis', 'DNA'],
];
const codeMap = new Map(CODES);
const MODULE_NAMES = { 1: 'Module 1 · Cells, Transport, Tissues & Microbes', 2: 'Module 2 · Blood, Acid-Base, Skin, Homeostasis & Fluids', 3: 'Module 3 · Nutrition, Digestion & Metabolism' };

const lines = fs.readFileSync(SRC_TXT, 'utf8').split(/\r?\n/);
const parsed = [];
let module = 0, quiz = null, code = null, cur = null;
const push = () => { if (cur) { parsed.push(cur); cur = null; } };

for (const line of lines) {
  const mMod = line.match(/^#####\s*Module\s*(\d+)/);
  if (mMod) { push(); module = Number(mMod[1]); continue; }
  const mQuiz = line.match(/^QUIZ:\s*(.+?)\s*\((\d+)\s*questions?\)/);
  if (mQuiz) { push(); quiz = mQuiz[1].trim(); code = codeMap.get(quiz); continue; }
  const mQ = line.match(/^Q(\d+)\.\s*(.*)$/);
  if (mQ) { push(); cur = { code: `${code}-${mQ[1]}`, module, quiz, qnum: Number(mQ[1]), stem: mQ[2].trim(), opts: [] }; continue; }
  const mOpt = line.match(/^\s+(.{0,2}?)\)\s*(.*)$/);
  if (mOpt && cur) { cur.opts.push({ marker: mOpt[1], text: mOpt[2].trim() }); continue; }
  if (cur && cur.opts.length === 0 && line.trim() && !line.startsWith('===')) cur.stem += ' ' + line.trim();
}
push();

function cleanOptions(q) {
  const latin = q.opts.filter(o => /^[a-z]$/.test(o.marker));
  const ok = latin.length > 0 && latin[0].marker === 'a' &&
    latin.every((o, i) => o.marker.charCodeAt(0) === 97 + i);
  return ok ? latin.map(o => o.text) : null;
}

// ---------- 2. Load the authored answer key ----------
const answers = {};
for (const f of ['ans1.json', 'ans2.json', 'ans3.json']) {
  Object.assign(answers, JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')));
}

// ---------- 3. Merge + validate ----------
const errors = [];
const out = [];
for (const q of parsed) {
  const a = answers[q.code];
  if (!a) { errors.push(`MISSING ANSWER: ${q.code} — "${q.stem.slice(0, 60)}"`); continue; }
  if (a.drop) continue; // intentionally removed (unanswerable/junk) — see patch notes
  // a.q overrides the parsed stem: lets us rewrite image/worksheet questions into
  // self-contained concept questions without touching the raw Canvas export.
  const stem = a.q !== undefined ? a.q : q.stem;
  const base = { code: q.code, module: q.module, moduleName: MODULE_NAMES[q.module], quiz: q.quiz, stem };
  if (a.a !== undefined) {
    // MCQ
    const clean = cleanOptions(q);
    if (!clean) { errors.push(`MCQ but no clean options: ${q.code}`); continue; }
    const idx = a.a.charCodeAt(0) - 97;
    if (idx < 0 || idx >= clean.length) { errors.push(`BAD LETTER '${a.a}' for ${q.code} (only ${clean.length} options)`); continue; }
    out.push({ ...base, type: 'mcq', options: clean, answer: idx, why: a.w || '', check: !!a.c });
  } else if (a.r !== undefined) {
    // reveal / flashcard
    out.push({ ...base, type: 'reveal', answerText: a.r, why: a.w || '', check: !!a.c });
  } else {
    errors.push(`UNRECOGNISED ANSWER SHAPE: ${q.code}`);
  }
}

// ---------- 4. Report ----------
console.log('Parsed questions:', parsed.length);
console.log('Answered & wired:', out.length);
console.log('MCQ:', out.filter(q => q.type === 'mcq').length, '| Reveal cards:', out.filter(q => q.type === 'reveal').length);
console.log('Flagged "check" (verify against notes):', out.filter(q => q.check).length);
for (const [m, name] of Object.entries(MODULE_NAMES)) {
  console.log(`  ${name}: ${out.filter(q => q.module == m).length} questions`);
}
if (errors.length) {
  console.log('\n*** VALIDATION ERRORS (' + errors.length + ') ***');
  for (const e of errors) console.log('  ' + e);
} else {
  console.log('\nNo validation errors — every question has a resolved answer.');
}

// review dump for spot-checking
const review = out.map(q => {
  const ans = q.type === 'mcq' ? `[${String.fromCharCode(97 + q.answer)}] ${q.options[q.answer]}` : q.answerText;
  return `${q.code} ${q.check ? '(CHECK) ' : ''}| ${q.stem}\n    => ${ans}${q.why ? '\n    why: ' + q.why : ''}`;
}).join('\n\n');
fs.writeFileSync(path.join(__dirname, 'review.txt'), review);

// check-flagged list
const flagged = out.filter(q => q.check).map(q => `${q.code} | ${q.stem.slice(0, 70)}`).join('\n');
fs.writeFileSync(path.join(__dirname, 'flagged.txt'), flagged);

// ---------- 5. Write final bank + inline into HTML ----------
fs.writeFileSync(path.join(DRILL, 'bn1-questions.json'), JSON.stringify(out, null, 1));

const tpl = path.join(__dirname, 'bn1-drill.template.html');
if (fs.existsSync(tpl)) {
  const BUILD = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
  const html = fs.readFileSync(tpl, 'utf8').replace(
    '/*__BN1_DATA__*/',
    'window.BN1_QUESTIONS=' + JSON.stringify(out) + ';window.BN1_BUILD=' + JSON.stringify(BUILD) + ';'
  );
  fs.writeFileSync(path.join(DRILL, 'bn1-drill.html'), html);
  // index.html is the same file, so GitHub Pages serves the app at the repo root.
  fs.writeFileSync(path.join(DRILL, 'index.html'), html);
  console.log('\nBuilt drill/bn1-drill.html + index.html (' + (html.length / 1024).toFixed(0) + ' KB, self-contained).');
} else {
  console.log('\n(No template yet — wrote bn1-questions.json only.)');
}
