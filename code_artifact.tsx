import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Upload, FileText, Image as ImageIcon, BarChart3, Users, HelpCircle,
  Save, FolderOpen, Trash2, Sparkles, CheckCircle2, AlertCircle,
  Download, Eye, RefreshCw, ChevronRight, ArrowUpRight, Layers,
  TrendingUp, UserCheck, Clock, ShieldAlert, Search, Plus, X,
  Sliders, FileSpreadsheet, Copy, Check, Info, Globe, ArrowLeftRight
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

let db = null;
let auth = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-pyramid-app';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (err) {
  console.warn('Firebase initialization skipped or unavailable:', err);
}

const PRESET_PYRAMIDS = {
  bulgaria_2026: {
    id: 'bulgaria_2026',
    name: 'България (2026 г.)',
    country: 'България',
    year: '2026',
    shapeType: 'regressive',
    description: 'Регресивен (урновиден) тип пирамида с тясна основа и разширена горна част.',
    data: [
      { age: '0-4', male: 138, female: 131 },
      { age: '5-9', male: 148, female: 140 },
      { age: '10-14', male: 158, female: 150 },
      { age: '15-19', male: 155, female: 146 },
      { age: '20-24', male: 142, female: 135 },
      { age: '25-29', male: 160, female: 152 },
      { age: '30-34', male: 195, female: 185 },
      { age: '35-39', male: 235, female: 222 },
      { age: '40-44', male: 248, female: 238 },
      { age: '45-49', male: 262, female: 256 },
      { age: '50-54', male: 250, female: 252 },
      { age: '55-59', male: 225, female: 238 },
      { age: '60-64', male: 215, female: 245 },
      { age: '65-69', male: 198, female: 252 },
      { age: '70-74', male: 165, female: 238 },
      { age: '75-79', male: 118, female: 192 },
      { age: '80-84', male: 64, female: 122 },
      { age: '85+', male: 35, female: 82 }
    ]
  },
  nigeria_2026: {
    id: 'nigeria_2026',
    name: 'Нигерия (2026 г.)',
    country: 'Нигерия',
    year: '2026',
    shapeType: 'progressive',
    description: 'Прогресивен (триъгълен / растящ) тип пирамида с много широка основа и остър връх.',
    data: [
      { age: '0-4', male: 1820, female: 1760 },
      { age: '5-9', male: 1610, female: 1560 },
      { age: '10-14', male: 1420, female: 1380 },
      { age: '15-19', male: 1210, female: 1180 },
      { age: '20-24', male: 1010, female: 990 },
      { age: '25-29', male: 840, female: 830 },
      { age: '30-34', male: 710, female: 705 },
      { age: '35-39', male: 590, female: 585 },
      { age: '40-44', male: 480, female: 480 },
      { age: '45-49', male: 380, female: 385 },
      { age: '50-54', male: 295, female: 305 },
      { age: '55-59', male: 225, female: 240 },
      { age: '60-64', male: 165, female: 180 },
      { age: '65-69', male: 115, female: 130 },
      { age: '70-74', male: 72, female: 85 },
      { age: '75-79', male: 38, female: 48 },
      { age: '80-84', male: 16, female: 22 },
      { age: '85+', male: 6, female: 10 }
    ]
  },
  sweden_2026: {
    id: 'sweden_2026',
    name: 'Швеция (2026 г.)',
    country: 'Швеция',
    year: '2026',
    shapeType: 'stationary',
    description: 'Стационарен (камбановиден) тип пирамида със сравнително равномерни възрастови кохорти.',
    data: [
      { age: '0-4', male: 295, female: 280 },
      { age: '5-9', male: 310, female: 295 },
      { age: '10-14', male: 318, female: 302 },
      { age: '15-19', male: 312, female: 296 },
      { age: '20-24', male: 305, female: 290 },
      { age: '25-29', male: 335, female: 320 },
      { age: '30-34', male: 365, female: 350 },
      { age: '35-39', male: 355, female: 342 },
      { age: '40-44', male: 335, female: 325 },
      { age: '45-49', male: 330, female: 322 },
      { age: '50-54', male: 340, female: 335 },
      { age: '55-59', male: 335, female: 332 },
      { age: '60-64', male: 305, female: 308 },
      { age: '65-69', male: 275, female: 285 },
      { age: '70-74', male: 255, female: 272 },
      { age: '75-79', male: 225, female: 250 },
      { age: '80-84', male: 145, female: 175 },
      { age: '85+', male: 95, female: 148 }
    ]
  },
  japan_2026: {
    id: 'japan_2026',
    name: 'Япония (2026 г.)',
    country: 'Япония',
    year: '2026',
    shapeType: 'regressive',
    description: 'Силно регресивен тип пирамида с изключително висок дял на възрастното население и дълголетие.',
    data: [
      { age: '0-4', male: 205, female: 195 },
      { age: '5-9', male: 235, female: 224 },
      { age: '10-14', male: 262, female: 250 },
      { age: '15-19', male: 280, female: 266 },
      { age: '20-24', male: 305, female: 292 },
      { age: '25-29', male: 318, female: 305 },
      { age: '30-34', male: 332, female: 320 },
      { age: '35-39', male: 365, female: 354 },
      { age: '40-44', male: 410, female: 402 },
      { age: '45-49', male: 475, female: 468 },
      { age: '50-54', male: 495, female: 492 },
      { age: '55-59', male: 430, female: 435 },
      { age: '60-64', male: 385, female: 398 },
      { age: '65-69', male: 390, female: 418 },
      { age: '70-74', male: 435, female: 492 },
      { age: '75-79', male: 410, female: 505 },
      { age: '80-84', male: 295, female: 420 },
      { age: '85+', male: 220, female: 465 }
    ]
  }
};

const QUESTIONS_CONFIG = [
  {
    id: 'q1',
    number: 1,
    title: 'Определете формата на пирамидата',
    subtitle: 'Класифицирайте типа на полово-възрастовата пирамида според нейния геометричен профил.',
    placeholder: 'Опишете формата на пирамидата (напр. триъгълна/прогресивна, камбановидна/стационарна или урновидна/регресивна), очертанията на основата, средата и върха...',
    chips: [
      'Прогресивна (растяща / триъгълна)',
      'Стационарна (камбановидна / равномерна)',
      'Регресивна (намаляваща / урновидна)',
      'Тясна основа и широк връх',
      'Широка основа и остър връх',
      'Асиметрична форма'
    ]
  },
  {
    id: 'q2',
    number: 2,
    title: 'Защо пирамидата има такава форма?',
    subtitle: 'Посочете демографските, социално-икономическите и историческите фактори, които обуславят формата.',
    placeholder: 'Анализирайте влиянието на раждаемостта, смъртността, естествения прираст, миграционните процеси, средната продължителност на живота и социално-икономическите условия...',
    chips: [
      'Ниска раждаемост и отрицателен естествен прираст',
      'Висока раждаемост и висок естествен прираст',
      'Емиграция на население в млада и трудоспособна възраст',
      'Висока средна продължителност на живота',
      'Демографски преход и семейно планиране',
      'Развита здравна система и ниска детска смъртност'
    ]
  },
  {
    id: 'q3',
    number: 3,
    title: 'Отчетете има ли превес на мъжете или на жените',
    subtitle: 'Сравнете дела на мъжете и жените общо и по отделни възрастови пояси.',
    placeholder: 'Посочете кой пол преобладава общо в страната и как се променя съотношението от най-младите (0-14 г.) към най-възрастните групи (65+ г.)...',
    chips: [
      'Общ превес на жените в населението',
      'Лек биологичен превес на момчетата при раждане (0-19 г.)',
      'Отчетлив превес на жените във възрастта над 60-65 г.',
      'По-висока средна продължителност на живота при жените',
      'Превес на мъжете поради трудова имиграция',
      'Относителен баланс в средните възрастови групи'
    ]
  },
  {
    id: 'q4',
    number: 4,
    title: 'Съотношение между трите възрастови групи',
    subtitle: 'Определете дела на подтрудоспособното (0-14 г.), трудоспособното (15-64 г.) и надтрудоспособното (65+ г.) население.',
    placeholder: 'Запишете процентното съотношение между трите основни групи (0-14 г., 15-64 г., 65+ г.) и коментирайте коя група заема най-голям и най-малък дял...',
    chips: [
      'Преобладава трудоспособното население (15-64 г.)',
      'Делът на надтрудоспособното (65+ г.) надвишава подтрудоспособното (0-14 г.)',
      'Много висок дял на подтрудоспособното население (над 35-40%)',
      'Регресивно съотношение (65+ г. > 0-14 г.)',
      'Прогресивно съотношение (0-14 г. > 65+ г.)'
    ]
  },
  {
    id: 'q5',
    number: 5,
    title: 'Достатъчно ли са хората в трудоспособна възраст?',
    subtitle: 'Преценете демографското натоварване и обезпечеността на икономиката с работна сила.',
    placeholder: 'Оценете дали трудоспособният контингент (15-64 г.) е достатъчен да поддържа икономиката, пенсионната и здравната система, и дали се наблюдава дефицит на кадри...',
    chips: [
      'Висок коефициент на демографско натоварване',
      'Нарастващ натиск върху пенсионната и социалната система',
      'Недостиг на млада работна сила, заместваща излизащите в пенсия',
      'Достатъчен трудов потенциал към момента, но с негативна тенденция',
      'Голям брой млади хора, влизащи тепърва на пазара на труда'
    ]
  },
  {
    id: 'q6',
    number: 6,
    title: 'Прогноза за бъдещото разпределение по възрастови групи',
    subtitle: 'Прогнозирайте как ще се трансформира пирамидата през следващите 15–30 години.',
    placeholder: 'Направете прогноза за изменението на трите възрастови групи в бъдеще при запазване на настоящите демографски тенденции...',
    chips: [
      'По-нататъшно стесняване на основата (намаляване на 0-14 г.)',
      'Увеличаване на дела на населението над 65 и 80 години',
      'Свиване на контингента в трудоспособна възраст (15-64 г.)',
      'Постепенно преминаване от прогресивна към стационарна форма',
      'Необходимост от активна демографска и миграционна политика'
    ]
  },
  {
    id: 'q7',
    number: 7,
    title: 'Застарява ли населението на страната? Защо?',
    subtitle: 'Формулирайте заключение за процеса на демографско застаряване и неговите причини.',
    placeholder: 'Посочете дали населението застарява и обяснете причините (застаряване „отдолу“ поради ниска раждаемост и застаряване „отгоре“ поради по-висока продължителност на живота)...',
    chips: [
      'Да, наблюдава се интензивно демографско застаряване',
      'Застаряване „отдолу“ поради трайно ниска раждаемост',
      'Застаряване „отгоре“ поради увеличаване на продължителността на живота',
      'Емиграция на млади хора в репродуктивна възраст',
      'Не, населението е младо поради висока раждаемост'
    ]
  }
];

function calculateMetricsFromData(pyramidRows) {
  if (!pyramidRows || pyramidRows.length === 0) {
    return {
      total: 0,
      maleTotal: 0,
      femaleTotal: 0,
      malePct: 49.0,
      femalePct: 51.0,
      sexRatio: 96.1,
      underWorkingPct: 14.5,
      workingPct: 63.5,
      overWorkingPct: 22.0,
      dependencyRatio: 57.5,
      agingIndex: 151.7
    };
  }

  let maleTotal = 0;
  let femaleTotal = 0;
  let underWorking = 0; // 0-14
  let working = 0;      // 15-64
  let overWorking = 0;  // 65+

  pyramidRows.forEach((row, idx) => {
    const m = Number(row.male) || 0;
    const f = Number(row.female) || 0;
    const sum = m + f;
    maleTotal += m;
    femaleTotal += f;

    // Parse lower bound of age string (e.g. "0-4" -> 0, "65-69" -> 65, "85+" -> 85)
    const match = String(row.age).match(/\d+/);
    const startAge = match ? parseInt(match[0], 10) : idx * 5;

    if (startAge < 15) {
      underWorking += sum;
    } else if (startAge < 65) {
      working += sum;
    } else {
      overWorking += sum;
    }
  });

  const total = maleTotal + femaleTotal || 1;
  const malePct = Number(((maleTotal / total) * 100).toFixed(1));
  const femalePct = Number(((femaleTotal / total) * 100).toFixed(1));
  const sexRatio = Number(((maleTotal / (femaleTotal || 1)) * 100).toFixed(1));

  const underWorkingPct = Number(((underWorking / total) * 100).toFixed(1));
  const workingPct = Number(((working / total) * 100).toFixed(1));
  const overWorkingPct = Number((100 - underWorkingPct - workingPct).toFixed(1));

  const dependencyRatio = working > 0
    ? Number((((underWorking + overWorking) / working) * 100).toFixed(1))
    : 0;
  const agingIndex = underWorking > 0
    ? Number(((overWorking / underWorking) * 100).toFixed(1))
    : 0;

  return {
    total,
    maleTotal,
    femaleTotal,
    malePct,
    femalePct,
    sexRatio,
    underWorkingPct,
    workingPct,
    overWorkingPct,
    dependencyRatio,
    agingIndex
  };
}

function parseUploadedDemographicCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  const parsedRows = [];
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split(/[;,|\t]/).map((s) => s.trim().replace(/^"|"$/g, ''));
    if (parts.length >= 3) {
      const mVal = parseFloat(parts[1].replace(/\s/g, ''));
      const fVal = parseFloat(parts[2].replace(/\s/g, ''));
      if (!isNaN(mVal) && !isNaN(fVal)) {
        parsedRows.push({
          age: parts[0],
          male: Math.abs(mVal),
          female: Math.abs(fVal)
        });
      }
    }
  }
  return parsedRows.length >= 3 ? parsedRows : null;
}

export default function PyramidAnalyzerApp() {
  // Authentication & Firestore Repository State
  const [user, setUser] = useState(null);
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [isStorageLoading, setIsStorageLoading] = useState(true);
  const [storageMode, setStorageMode] = useState('cloud'); // 'cloud' or 'memory'

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState('workspace'); // 'workspace' | 'repository' | 'compare'
  const [activeQuestionStep, setActiveQuestionStep] = useState(0); // 0 to 6, or 'all'
  const [viewAllQuestions, setViewAllQuestions] = useState(true);
  const [toast, setToast] = useState(null);
  const [projectionYears, setProjectionYears] = useState(0); // 0, 15, 30 years projection preview

  // Pyramid Data & Attached Files State
  const [selectedPresetId, setSelectedPresetId] = useState('bulgaria_2026');
  const [pyramidData, setPyramidData] = useState(PRESET_PYRAMIDS.bulgaria_2026.data);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Analysis Metadata & Structured Answers for the 7 Questions
  const [analysisMeta, setAnalysisMeta] = useState({
    title: 'Демографски анализ: България (2026 г.)',
    country: 'България',
    year: '2026',
    author: ''
  });

  const [structuredControls, setStructuredControls] = useState({
    shapeType: 'regressive', // 'progressive' | 'stationary' | 'regressive' | 'asymmetric'
    genderPredominance: 'female', // 'female' | 'male' | 'balanced'
    malePct: 48.2,
    femalePct: 51.8,
    underWorkingPct: 14.2, // 0-14
    workingPct: 63.1,      // 15-64
    overWorkingPct: 22.7,  // 65+
    workforceSufficiency: 'shortage', // 'sufficient' | 'moderate' | 'shortage'
    isAging: 'yes_strong' // 'yes_strong' | 'yes_moderate' | 'no_young'
  });

  const [answers, setAnswers] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
    q6: '',
    q7: ''
  });

  // AI Generation State
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiStatusText, setAiStatusText] = useState('');

  // Repository Filtering & Modal View State
  const [repoSearch, setRepoSearch] = useState('');
  const [repoFilterShape, setRepoFilterShape] = useState('all');
  const [selectedRepoItem, setSelectedRepoItem] = useState(null);
  const [compareItems, setCompareItems] = useState([null, null]);
  const [copiedId, setCopiedId] = useState(null);

  const fileInputRef = useRef(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Compute demographic metrics from active pyramid dataset
  const computedMetrics = useMemo(() => {
    return calculateMetricsFromData(pyramidData);
  }, [pyramidData]);

  // Project pyramid data into future (+15 or +30 years) for Question 6 visualization
  const displayedPyramidData = useMemo(() => {
    if (!pyramidData || projectionYears === 0) return pyramidData;
    const shiftSteps = Math.round(projectionYears / 5);
    const fertilityFactor =
      structuredControls.shapeType === 'progressive'
        ? 1.12
        : structuredControls.shapeType === 'stationary'
        ? 0.98
        : 0.86;

    return pyramidData.map((row, idx) => {
      if (idx < shiftSteps) {
        const baseRow = pyramidData[0];
        const factor = Math.pow(fertilityFactor, shiftSteps - idx);
        return {
          age: row.age,
          male: Math.round(baseRow.male * factor),
          female: Math.round(baseRow.female * factor)
        };
      } else {
        const sourceRow = pyramidData[idx - shiftSteps];
        // Apply survival rate
        const survivalMale = idx > 12 ? 0.78 : 0.96;
        const survivalFemale = idx > 12 ? 0.86 : 0.98;
        return {
          age: row.age,
          male: Math.round(sourceRow.male * survivalMale),
          female: Math.round(sourceRow.female * survivalFemale)
        };
      }
    });
  }, [pyramidData, projectionYears, structuredControls.shapeType]);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      if (!auth || !db) {
        if (isMounted) {
          setStorageMode('memory');
          setIsStorageLoading(false);
        }
        return;
      }

      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn('Auth fallback to memory mode:', err);
        if (isMounted) {
          setStorageMode('memory');
          setIsStorageLoading(false);
        }
      }
    }

    initAuth();

    if (auth) {
      const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      });
      return () => {
        isMounted = false;
        unsubAuth();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // RULE 3: Query Firestore only after user is authenticated
  useEffect(() => {
    if (!user || !db) return;

    setIsStorageLoading(true);
    const analysesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pyramid_analyses');

    const unsubscribe = onSnapshot(
      analysesRef,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        // Sort in JS memory (RULE 2: No orderBy in Firestore query)
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSavedAnalyses(items);
        setIsStorageLoading(false);
      },
      (error) => {
        console.error('Firestore listener error:', error);
        setStorageMode('memory');
        setIsStorageLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSelectPreset = (presetKey) => {
    const preset = PRESET_PYRAMIDS[presetKey];
    if (!preset) return;

    setSelectedPresetId(presetKey);
    setPyramidData(preset.data);
    setProjectionYears(0);

    const metrics = calculateMetricsFromData(preset.data);
    setAnalysisMeta((prev) => ({
      ...prev,
      title: `Демографски анализ: ${preset.name}`,
      country: preset.country,
      year: preset.year
    }));

    setStructuredControls({
      shapeType: preset.shapeType,
      genderPredominance:
        metrics.femalePct > metrics.malePct + 0.8
          ? 'female'
          : metrics.malePct > metrics.femalePct + 0.8
          ? 'male'
          : 'balanced',
      malePct: metrics.malePct,
      femalePct: metrics.femalePct,
      underWorkingPct: metrics.underWorkingPct,
      workingPct: metrics.workingPct,
      overWorkingPct: metrics.overWorkingPct,
      workforceSufficiency:
        metrics.overWorkingPct > 20
          ? 'shortage'
          : metrics.workingPct >= 62
          ? 'sufficient'
          : 'moderate',
      isAging:
        metrics.overWorkingPct >= 18
          ? 'yes_strong'
          : metrics.overWorkingPct >= 12
          ? 'yes_moderate'
          : 'no_young'
    });

    showNotification(`Зареден е демографски модел: ${preset.name}`, 'info');
  };

  // Compress uploaded image into a compact base64 thumbnail for UI preview & AI analysis
  const readImageThumbnail = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve({ dataUrl, width: img.width, height: img.height });
        };
        img.onerror = () => resolve({ dataUrl: e.target.result, width: 0, height: 0 });
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFilesAdded = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    const newlyProcessed = [];

    for (const file of filesArray) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
      const isData = ['csv', 'json', 'txt', 'tsv'].includes(ext);

      if (isImage) {
        const { dataUrl, width, height } = await readImageThumbnail(file);
        newlyProcessed.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: 'image',
          mimeType: 'image/jpeg',
          previewUrl: dataUrl,
          dimensions: width ? `${width}×${height}px` : 'Изображение',
          uploadedAt: new Date().toLocaleTimeString('bg-BG')
        });
      } else if (isData) {
        const textContent = await file.text();
        let parsedRows = null;

        if (ext === 'json') {
          try {
            const jsonObj = JSON.parse(textContent);
            const arr = Array.isArray(jsonObj) ? jsonObj : jsonObj.data;
            if (Array.isArray(arr) && arr.length > 0) {
              parsedRows = arr.map((item) => ({
                age: item.age || item.group || '0-4',
                male: Math.abs(Number(item.male ?? item.men ?? item.m ?? 100)),
                female: Math.abs(Number(item.female ?? item.women ?? item.f ?? 100))
              }));
            }
          } catch (e) {
            console.warn('Invalid JSON pyramid file:', e);
          }
        } else {
          parsedRows = parseUploadedDemographicCSV(textContent);
        }

        if (parsedRows) {
          setPyramidData(parsedRows);
          setSelectedPresetId('custom_uploaded');
          const m = calculateMetricsFromData(parsedRows);
          setStructuredControls((prev) => ({
            ...prev,
            malePct: m.malePct,
            femalePct: m.femalePct,
            underWorkingPct: m.underWorkingPct,
            workingPct: m.workingPct,
            overWorkingPct: m.overWorkingPct,
            shapeType:
              m.underWorkingPct > 30
                ? 'progressive'
                : m.overWorkingPct > m.underWorkingPct + 4
                ? 'regressive'
                : 'stationary',
            genderPredominance:
              m.femalePct > m.malePct + 0.8
                ? 'female'
                : m.malePct > m.femalePct + 0.8
                ? 'male'
                : 'balanced'
          }));
        }

        newlyProcessed.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: 'data',
          mimeType: file.type || 'text/csv',
          rawText: textContent.slice(0, 3000),
          parsedCount: parsedRows ? parsedRows.length : 0,
          parsedData: parsedRows,
          uploadedAt: new Date().toLocaleTimeString('bg-BG')
        });
      } else {
        newlyProcessed.push({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: 'document',
          mimeType: file.type || 'application/octet-stream',
          uploadedAt: new Date().toLocaleTimeString('bg-BG')
        });
      }
    }

    setAttachedFiles((prev) => {
      const updated = [...prev, ...newlyProcessed];
      setActiveFileIndex(updated.length - 1);
      return updated;
    });

    // Update title automatically if first file attached
    if (newlyProcessed.length > 0) {
      const cleanName = newlyProcessed[0].name.replace(/\.[^/.]+$/, '');
      setAnalysisMeta((prev) => ({
        ...prev,
        title: `Анализ на пирамида: ${cleanName}`
      }));
    }

    showNotification(`Прикачени са ${newlyProcessed.length} файла към пирамидата!`);
  };

  const handleAutoFillFromCurrentMetrics = () => {
    const c = structuredControls;
    const depRatio =
      c.workingPct > 0
        ? (((c.underWorkingPct + c.overWorkingPct) / c.workingPct) * 100).toFixed(1)
        : '58.0';

    const shapeLabel =
      c.shapeType === 'progressive'
        ? 'прогресивна (растяща / класическа триъгълна пирамида)'
        : c.shapeType === 'stationary'
        ? 'стационарна (камбановидна / относително равномерна)'
        : c.shapeType === 'asymmetric'
        ? 'асиметрична (деформирана от интензивни миграционни процеси)'
        : 'регресивна (намаляваща / урновидна форма)';

    const q1Text = `Полово-възрастовата пирамида на ${analysisMeta.country || 'изследваната страна'} (${analysisMeta.year} г.) има ${shapeLabel}. ${
      c.shapeType === 'regressive'
        ? 'Основата ѝ е силно стеснена, в средните и високите възрастови групи (40–69 г.) е разширена, а към върха постепенно се стеснява.'
        : c.shapeType === 'progressive'
        ? 'Тя се отличава с много широка основа при детските възрастови групи (0–14 г.) и бързо, стръмно стесняване към върха.'
        : 'Характеризира се с почти еднаква ширина в младите и средните възрастови групи и плавно стесняване едва при високите възрасти над 70 г.'
    }`;

    const q2Text =
      c.shapeType === 'regressive'
        ? `Формата на пирамидата се обуславя от трайно ниската раждаемост през последните десетилетия (което обяснява тясната основа), отрицателния естествен прираст и емиграцията на население в млада и репродуктивна възраст. По-широките средни и горни етажи са резултат от по-високата раждаемост в миналото и нарастващата средна продължителност на живота.`
        : c.shapeType === 'progressive'
        ? `Широката основа се дължи на много високата раждаемост и високия коефициент на плодовитост. Бързото стесняване нагоре е резултат от по-ниската средна продължителност на живота, по-високата смъртност и все още незавършилия демографски преход.`
        : `Стационарната форма е резултат от балансирана демографска структура – умерена и стабилна раждаемост, много ниска детска смъртност, висок жизнен стандарт, развито здравеопазване и положително миграционно салдо, което компенсира естественото стареене.`;

    const q3Text = `От данните в пирамидата се отчита ${
      c.genderPredominance === 'female'
        ? `общ превес на жените (${c.femalePct}%) спрямо мъжете (${c.malePct}%)`
        : c.genderPredominance === 'male'
        ? `превес на мъжете (${c.malePct}%) спрямо жените (${c.femalePct}%)`
        : `относителен баланс между мъжете (${c.malePct}%) и жените (${c.femalePct}%)`
    }. В най-младите възрастови групи (0–19 г.) се наблюдава лек биологичен превес на момчетата, в средните възрасти съотношението се изравнява, а във възрастовите групи над 60–65 години ясно преобладават жените поради по-високата средна продължителност на живота при женския пол и по-високата смъртност сред мъжете.`;

    const q4Text = `Съотношението между трите основни възрастови групи е следното:\n• Подтрудоспособна възраст (0–14 г.): ${c.underWorkingPct}%\n• Трудоспособна възраст (15–64 г.): ${c.workingPct}%\n• Надтрудоспособна възраст (65+ г.): ${c.overWorkingPct}%\n${
      c.overWorkingPct > c.underWorkingPct
        ? 'Делът на надтрудоспособното население значително надвишава дела на децата (0–14 г.), което показва нарушено демографско възпроизводство.'
        : 'Делът на подтрудоспособното население е по-голям от този на възрастното население (65+ г.), което осигурява положителен демографски резерв.'
    }`;

    const q5Text = `Делът на трудоспособното население (15–64 г.) е ${c.workingPct}%, а коефициентът на общо демографско натоварване е около ${depRatio} души в неактивна възраст на 100 души в трудоспособна възраст. ${
      c.workforceSufficiency === 'shortage'
        ? 'В страната се очертава недостиг на хора в трудоспособна възраст, тъй като броят на младежите, влизащи в пазара на труда, е значително по-малък от броя на хората, които излизат в пенсионна възраст. Това създава силен натиск върху пазара на труда, пенсионната и здравната система.'
        : c.workforceSufficiency === 'sufficient'
        ? 'Страната разполага с достатъчен контингент от хора в трудоспособна възраст, който покрива потребностите на икономиката.'
        : 'Към момента трудоспособното население все още формира основния дял, но се наблюдава тенденция към постепенно свиване и застаряване на работната сила.'
    }`;

    const q6Text =
      c.shapeType === 'regressive'
        ? `В бъдеще (през следващите 15–30 години) се прогнозира по-нататъшно намаляване на дела на подтрудоспособното население (0–14 г.) и свиване на трудоспособния контингент (15–64 г.), тъй като малобройните млади поколения ще навлизат в активна възраст. Едновременно с това делът на надтрудоспособното население (65+ г.) ще продължи да нараства, като урновидната форма на пирамидата ще се задълбочи.`
        : c.shapeType === 'progressive'
        ? `В бъдеще многобройните млади поколения от основата ще преминат в трудоспособна възраст (15–64 г.), което ще увеличи трудовия потенциал на страната. С постепенното намаляване на раждаемостта и подобряване на здравеопазването пирамидата плавно ще започне да преминава към камбановидна форма.`
        : `Прогнозира се запазване на относителна стабилност между възрастовите групи с плавно нарастване на дела на населението над 65 и 80 години поради увеличаващата се продължителност на живота.`;

    const q7Text =
      c.isAging === 'no_young'
        ? `Населението на страната не застарява – то е демографски младо, тъй като високата раждаемост поддържа много висок дял на децата и младежите (${c.underWorkingPct}%), а делът на хората над 65 г. е едва ${c.overWorkingPct}%.`
        : `Да, населението на страната застарява ${c.isAging === 'yes_strong' ? 'с високи и ускорени темпове' : 'умерено'}. Причините са двупосочни:\n1. Застаряване „отдолу“ – породено от ниската раждаемост и намаляващия брой новородени деца;\n2. Застаряване „отгоре“ – удължаване на средната продължителност на живота и преминаване на големи поколения от миналото в надтрудоспособна възраст (65+ г. съставляват ${c.overWorkingPct}%);\n3. Допълнителен фактор е емиграцията на млади хора в репродуктивна възраст.`;

    setAnswers({
      q1: q1Text,
      q2: q2Text,
      q3: q3Text,
      q4: q4Text,
      q5: q5Text,
      q6: q6Text,
      q7: q7Text
    });

    showNotification('Всички 7 отговора са генерирани успешно въз основа на показателите на пирамидата!');
  };

  // Call Gemini API (supports attached image analysis + demographic context)
  const handleAiAnalyzeWithGemini = async () => {
    setIsAiGenerating(true);
    setAiStatusText('Анализиране на прикачените файлове и пирамидата с ИИ...');

    const apiKey = '';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

    const activeImageFile = attachedFiles.find((f) => f.type === 'image' && f.previewUrl);

    const systemPrompt = `Ти си експерт по география на населението и демография. Анализирай предоставената полово-възрастова пирамида (изображение и/или демографски данни) и дай точни, структурирани и научно издържани отговори на български език на 7-те въпроса. Върни отговора единствено във валиден JSON обект.`;

    const userPrompt = `Държава/Регион: ${analysisMeta.country || 'Неуточнена'} (${analysisMeta.year || 'Текуща година'}).
Текущи изчислени или зададени стойности:
- Мъже: ${structuredControls.malePct}%, Жени: ${structuredControls.femalePct}%
- Подтрудоспособна (0-14 г.): ${structuredControls.underWorkingPct}%
- Трудоспособна (15-64 г.): ${structuredControls.workingPct}%
- Надтрудоспособна (65+ г.): ${structuredControls.overWorkingPct}%
${ activeImageFile ? 'Прикачено е изображение на полово-възрастовата пирамида. Разчети неговата форма, съотношенията между половете и възрастовите групи директно от изображението.' : '' }

Попълни следните полета в JSON формат:
- shapeType: едно от ["progressive", "stationary", "regressive", "asymmetric"]
- genderPredominance: едно от ["female", "male", "balanced"]
- underWorkingPct: число (процент 0-14 г.)
- workingPct: число (процент 15-64 г.)
- overWorkingPct: число (процент 65+ г.)
- q1: Отговор на "1. Определете формата на пирамидата."
- q2: Отговор на "2. Отговорете на въпроса защо пирамидата има такава форма."
- q3: Отговор на "3. Отчетете има ли превес на мъжете или на жените."
- q4: Отговор на "4. Определете какво е съотношението между трите възрастови групи."
- q5: Отговор на "5. Преценете дали в страната има достатъчно хора в трудоспособна възраст."
- q6: Отговор на "6. Прогнозирайте как ще се променя в бъдеще разпределението на населението по възрастови групи."
- q7: Отговор на "7. Проучете застарява ли населението на страната. Защо?"`;

    const parts = [{ text: userPrompt }];
    if (activeImageFile && activeImageFile.previewUrl) {
      const base64Clean = activeImageFile.previewUrl.split(',')[1];
      if (base64Clean) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Clean
          }
        });
      }
    }

    const payload = {
      contents: [{ role: 'user', parts }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            shapeType: { type: 'STRING' },
            genderPredominance: { type: 'STRING' },
            underWorkingPct: { type: 'NUMBER' },
            workingPct: { type: 'NUMBER' },
            overWorkingPct: { type: 'NUMBER' },
            q1: { type: 'STRING' },
            q2: { type: 'STRING' },
            q3: { type: 'STRING' },
            q4: { type: 'STRING' },
            q5: { type: 'STRING' },
            q6: { type: 'STRING' },
            q7: { type: 'STRING' }
          },
          required: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']
        }
      }
    };

    try {
      let response = null;
      const delays = [1000, 2000, 4000];
      for (let attempt = 0; attempt <= delays.length; attempt++) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) break;
        if (attempt < delays.length) {
          await new Promise((r) => setTimeout(r, delays[attempt]));
        }
      }

      if (!response || !response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        setAnswers({
          q1: parsed.q1 || '',
          q2: parsed.q2 || '',
          q3: parsed.q3 || '',
          q4: parsed.q4 || '',
          q5: parsed.q5 || '',
          q6: parsed.q6 || '',
          q7: parsed.q7 || ''
        });

        setStructuredControls((prev) => ({
          ...prev,
          shapeType: ['progressive', 'stationary', 'regressive', 'asymmetric'].includes(parsed.shapeType)
            ? parsed.shapeType
            : prev.shapeType,
          genderPredominance: ['female', 'male', 'balanced'].includes(parsed.genderPredominance)
            ? parsed.genderPredominance
            : prev.genderPredominance,
          underWorkingPct: typeof parsed.underWorkingPct === 'number' ? parsed.underWorkingPct : prev.underWorkingPct,
          workingPct: typeof parsed.workingPct === 'number' ? parsed.workingPct : prev.workingPct,
          overWorkingPct: typeof parsed.overWorkingPct === 'number' ? parsed.overWorkingPct : prev.overWorkingPct
        }));

        showNotification('ИИ анализът на пирамидата завърши успешно!');
      } else {
        handleAutoFillFromCurrentMetrics();
      }
    } catch (err) {
      // Fallback to deterministic demographic generator if offline or quota reached
      handleAutoFillFromCurrentMetrics();
    } finally {
      setIsAiGenerating(false);
      setAiStatusText('');
    }
  };

  const handleSaveToRepository = async () => {
    const answeredCount = Object.values(answers).filter((v) => v && v.trim().length > 0).length;
    if (answeredCount === 0) {
      showNotification('Моля, попълнете поне един отговор преди запазване в хранилището.', 'error');
      return;
    }

    // Prepare compact file metadata for storage
    const serializedFiles = attachedFiles.map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type,
      dimensions: f.dimensions || '',
      uploadedAt: f.uploadedAt || '',
      // Keep thumbnail if small enough for Firestore document limits
      previewUrl: f.previewUrl && f.previewUrl.length < 180000 ? f.previewUrl : null
    }));

    const recordPayload = {
      title: analysisMeta.title || `Анализ на пирамида (${analysisMeta.country || 'Без име'})`,
      country: analysisMeta.country || 'Неуточнена',
      year: analysisMeta.year || '2026',
      author: analysisMeta.author || 'Анонимен анализатор',
      userId: user?.uid || 'local-user',
      createdAt: Date.now(),
      createdAtFormatted: new Date().toLocaleString('bg-BG'),
      structuredControls: { ...structuredControls },
      answers: { ...answers },
      answeredCount,
      attachedFiles: serializedFiles,
      pyramidDataJson: JSON.stringify(pyramidData || [])
    };

    if (db && user && storageMode === 'cloud') {
      try {
        const analysesRef = collection(db, 'artifacts', appId, 'public', 'data', 'pyramid_analyses');
        await addDoc(analysesRef, recordPayload);
        showNotification('Анализът и отговорите са запазени успешно в Хранилището!');
        setActiveTab('repository');
        return;
      } catch (err) {
        console.error('Error saving to Firestore:', err);
      }
    }

    // Fallback in-memory save if cloud isn't reachable
    const localRecord = { id: crypto.randomUUID(), ...recordPayload };
    setSavedAnalyses((prev) => [localRecord, ...prev]);
    showNotification('Анализът е запазен в хранилището за текущата сесия!');
    setActiveTab('repository');
  };

  const handleLoadFromRepository = (item) => {
    if (!item) return;

    setAnalysisMeta({
      title: item.title || '',
      country: item.country || '',
      year: item.year || '2026',
      author: item.author || ''
    });

    if (item.structuredControls) {
      setStructuredControls(item.structuredControls);
    }

    if (item.answers) {
      setAnswers(item.answers);
    }

    if (item.attachedFiles && Array.isArray(item.attachedFiles)) {
      setAttachedFiles(item.attachedFiles);
      setActiveFileIndex(0);
    }

    if (item.pyramidDataJson) {
      try {
        const parsed = JSON.parse(item.pyramidDataJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPyramidData(parsed);
        }
      } catch (e) {
        console.warn('Could not parse stored pyramid data:', e);
      }
    }

    setSelectedRepoItem(null);
    setActiveTab('workspace');
    showNotification(`Зареден е анализ: "${item.title}"`);
  };

  const handleDeleteFromRepository = async (id) => {
    if (db && user && storageMode === 'cloud') {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'pyramid_analyses', id);
        await deleteDoc(docRef);
        if (selectedRepoItem?.id === id) setSelectedRepoItem(null);
        showNotification('Записът беше изтрит от хранилището.', 'info');
        return;
      } catch (err) {
        console.error('Delete error:', err);
      }
    }

    setSavedAnalyses((prev) => prev.filter((item) => item.id !== id));
    if (selectedRepoItem?.id === id) setSelectedRepoItem(null);
    showNotification('Записът беше премахнат.', 'info');
  };

  const handleExportAnalysisText = (targetItem = null) => {
    const meta = targetItem ? targetItem : analysisMeta;
    const ans = targetItem ? targetItem.answers : answers;
    const ctrl = targetItem ? targetItem.structuredControls : structuredControls;
    const files = targetItem ? targetItem.attachedFiles : attachedFiles;

    const lines = [
      '====================================================================',
      `ДЕМОГРАФСКИ АНАЛИЗ НА ПОЛОВО-ВЪЗРАСТОВА ПИРАМИДА`,
      '====================================================================',
      `Заглавие: ${meta.title}`,
      `Държава / Регион: ${meta.country} (${meta.year} г.)`,
      `Изготвил: ${meta.author || 'Не е посочен'}`,
      `Дата: ${targetItem?.createdAtFormatted || new Date().toLocaleString('bg-BG')}`,
      `Прикачени файлове (${files?.length || 0}): ${(files || []).map((f) => f.name).join(', ') || 'Вграден модел'}`,
      '--------------------------------------------------------------------',
      `ОСНОВНИ ПОКАЗАТЕЛИ:`,
      `- Форма на пирамидата: ${
        ctrl?.shapeType === 'progressive'
          ? 'Прогресивна (растяща)'
          : ctrl?.shapeType === 'stationary'
          ? 'Стационарна (камбановидна)'
          : ctrl?.shapeType === 'asymmetric'
          ? 'Асиметрична'
          : 'Регресивна (намаляваща)'
      }`,
      `- Съотношение по пол: Мъже ${ctrl?.malePct}% | Жени ${ctrl?.femalePct}%`,
      `- Възрастови групи: 0-14 г.: ${ctrl?.underWorkingPct}% | 15-64 г.: ${ctrl?.workingPct}% | 65+ г.: ${ctrl?.overWorkingPct}%`,
      '====================================================================\n',
      ...QUESTIONS_CONFIG.map(
        (q) => `${q.number}. ${q.title.toUpperCase()}\n${ans?.[q.id] || '(Няма въведен отговор)'}\n`
      )
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Анализ_Пирамида_${(meta.country || 'Население').replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Отчетът е изтеглен като текстов файл (.txt)!');
  };

  const handleCopyReportToClipboard = (targetItem = null) => {
    const meta = targetItem ? targetItem : analysisMeta;
    const ans = targetItem ? targetItem.answers : answers;
    const text = QUESTIONS_CONFIG.map(
      (q) => `${q.number}. ${q.title}\n${ans?.[q.id] || '-'}`
    ).join('\n\n');

    const textarea = document.createElement('textarea');
    textarea.value = `${meta.title} (${meta.country}, ${meta.year})\n\n${text}`;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    setCopiedId(targetItem?.id || 'current');
    setTimeout(() => setCopiedId(null), 2500);
    showNotification('Отговорите са копирани в клипборда!');
  };

  const filteredRepoItems = useMemo(() => {
    return savedAnalyses.filter((item) => {
      const matchesSearch =
        !repoSearch.trim() ||
        item.title?.toLowerCase().includes(repoSearch.toLowerCase()) ||
        item.country?.toLowerCase().includes(repoSearch.toLowerCase()) ||
        item.author?.toLowerCase().includes(repoSearch.toLowerCase());

      const matchesShape =
        repoFilterShape === 'all' || item.structuredControls?.shapeType === repoFilterShape;

      return matchesSearch && matchesShape;
    });
  }, [savedAnalyses, repoSearch, repoFilterShape]);

  const completedQuestionsCount = useMemo(() => {
    return Object.values(answers).filter((val) => val && val.trim().length > 5).length;
  }, [answers]);

  // Max value in pyramid rows for scaling the horizontal bars
  const maxCohortValue = useMemo(() => {
    if (!displayedPyramidData || displayedPyramidData.length === 0) return 100;
    return Math.max(
      ...displayedPyramidData.map((r) => Math.max(Number(r.male) || 0, Number(r.female) || 0)),
      1
    );
  }, [displayedPyramidData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 bg-slate-900/95 border-indigo-500/50 text-slate-100">
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  ДемоПирамида Лаб
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Полово-възрастова структура
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Интерактивна система за прикачване на пирамиди, 7-стъпков анализ и хранилище за отговори
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'workspace'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Анализ на пирамида</span>
              <span className="px-1.5 py-0.5 text-[11px] rounded-md bg-black/25">
                {completedQuestionsCount}/7
              </span>
            </button>

            <button
              onClick={() => setActiveTab('repository')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'repository'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>Хранилище за отговори</span>
              <span className="px-1.5 py-0.5 text-[11px] rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {savedAnalyses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              className={`hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'compare'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Сравнение</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            {/* Top Metadata & Quick Actions Bar */}
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Заглавие на изследването / проекта
                  </label>
                  <input
                    type="text"
                    value={analysisMeta.title}
                    onChange={(e) => setAnalysisMeta({ ...analysisMeta, title: e.target.value })}
                    placeholder="Напр. Анализ на пирамидата на България"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Държава / Регион
                  </label>
                  <input
                    type="text"
                    value={analysisMeta.country}
                    onChange={(e) => setAnalysisMeta({ ...analysisMeta, country: e.target.value })}
                    placeholder="България"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Година / Период
                  </label>
                  <input
                    type="text"
                    value={analysisMeta.year}
                    onChange={(e) => setAnalysisMeta({ ...analysisMeta, year: e.target.value })}
                    placeholder="2026"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Изготвил (Име / Клас)
                  </label>
                  <input
                    type="text"
                    value={analysisMeta.author}
                    onChange={(e) => setAnalysisMeta({ ...analysisMeta, author: e.target.value })}
                    placeholder="Иван Петров"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button
                    onClick={handleSaveToRepository}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Запази</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Two-Column Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: File Attachment + Interactive Pyramid & Demographic Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Multi-File Dropzone Card */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-400" />
                      <span>Прикачване на файлове на пирамидата</span>
                    </h2>
                    <span className="text-xs text-slate-400">
                      {attachedFiles.length} прикачени
                    </span>
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(true);
                    }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      handleFilesAdded(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-xl p-5 text-center transition-all ${
                      isDraggingOver
                        ? 'border-indigo-400 bg-indigo-500/10'
                        : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/60 hover:bg-slate-950'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,.csv,.json,.txt,.tsv,.pdf"
                      className="hidden"
                      onChange={(e) => handleFilesAdded(e.target.files)}
                    />
                    <div className="w-10 h-10 rounded-full bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto mb-2.5">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-200">
                      Кликнете или пуснете всички файлове на пирамидата тук
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Поддържа изображения (.PNG, .JPG, .WEBP, .SVG), таблици с данни (.CSV, .JSON) и работни листове
                    </p>
                  </div>

                  {/* Attached Files List & Preview */}
                  {attachedFiles.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {attachedFiles.map((file, idx) => (
                          <div
                            key={file.id}
                            onClick={() => setActiveFileIndex(idx)}
                            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer border shrink-0 transition-all ${
                              activeFileIndex === idx
                                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {file.type === 'image' ? (
                              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                            ) : file.type === 'data' ? (
                              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className="max-w-[130px] truncate">{file.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
                                setActiveFileIndex(0);
                              }}
                              className="opacity-60 hover:opacity-100 hover:text-rose-400"
                              title="Премахни файл"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Active Attached File Preview Box */}
                      {attachedFiles[activeFileIndex] && (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                          {attachedFiles[activeFileIndex].type === 'image' &&
                          attachedFiles[activeFileIndex].previewUrl ? (
                            <div className="space-y-2">
                              <div className="relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 max-h-72 flex items-center justify-center">
                                <img
                                  src={attachedFiles[activeFileIndex].previewUrl}
                                  alt={attachedFiles[activeFileIndex].name}
                                  className="max-h-72 w-auto object-contain"
                                />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400">
                                <span>Файл: {attachedFiles[activeFileIndex].name}</span>
                                <span>{attachedFiles[activeFileIndex].dimensions}</span>
                              </div>
                            </div>
                          ) : attachedFiles[activeFileIndex].type === 'data' ? (
                            <div className="text-xs text-slate-300 space-y-1">
                              <div className="flex items-center justify-between text-emerald-400 font-medium">
                                <span>Заредени таблични данни: {attachedFiles[activeFileIndex].name}</span>
                                <span>{attachedFiles[activeFileIndex].parsedCount} възрастови групи</span>
                              </div>
                              <p className="text-[11px] text-slate-400">
                                Данните от файла са визуализирани автоматично в интерактивната графика по-долу.
                              </p>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-300 flex items-center justify-between">
                              <span>Документ: {attachedFiles[activeFileIndex].name}</span>
                              <span className="text-slate-500">
                                {(attachedFiles[activeFileIndex].size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Built-in Preset Pyramids Selector */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <label className="block text-[11px] font-medium text-slate-400 mb-2">
                      Или изберете еталонна полово-възрастова пирамида за интерактивен анализ:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(PRESET_PYRAMIDS).map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-medium text-left border transition-all flex items-center justify-between ${
                            selectedPresetId === preset.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                              : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate">{preset.name}</span>
                          <Globe className="w-3.5 h-3.5 shrink-0 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                        <span>Полово-възрастова пирамида ({analysisMeta.country})</span>
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Синьо: Мъже ({structuredControls.malePct}%) • Розово: Жени ({structuredControls.femalePct}%)
                      </p>
                    </div>

                    {/* Future Projection Simulator toggle for Question 6 */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-indigo-400 ml-1" />
                      {[0, 15, 30].map((yr) => (
                        <button
                          key={yr}
                          onClick={() => setProjectionYears(yr)}
                          className={`px-2 py-1 rounded-md font-medium transition-all ${
                            projectionYears === yr
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {yr === 0 ? 'Сега' : `+${yr} г.`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pyramid Bars Container */}
                  <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-3 space-y-1">
                    <div className="grid grid-cols-11 text-[10px] font-semibold uppercase tracking-wider text-slate-400 pb-1.5 border-b border-slate-800 mb-1">
                      <div className="col-span-5 text-left text-sky-400">← Мъже</div>
                      <div className="col-span-1 text-center">Възраст</div>
                      <div className="col-span-5 text-right text-rose-400">Жени →</div>
                    </div>

                    <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                      {[...displayedPyramidData].reverse().map((row, rIdx) => {
                        const mVal = Number(row.male) || 0;
                        const fVal = Number(row.female) || 0;
                        const mWidth = Math.min(100, Math.round((mVal / maxCohortValue) * 100));
                        const fWidth = Math.min(100, Math.round((fVal / maxCohortValue) * 100));

                        const matchAge = String(row.age).match(/\d+/);
                        const startAge = matchAge ? parseInt(matchAge[0], 10) : 0;
                        const ageZoneBadge =
                          startAge >= 65
                            ? 'text-amber-300'
                            : startAge >= 15
                            ? 'text-emerald-300'
                            : 'text-indigo-300';

                        return (
                          <div
                            key={row.age + rIdx}
                            className="grid grid-cols-11 items-center gap-1 text-[11px] group hover:bg-slate-900/80 rounded px-1 py-0.5"
                          >
                            {/* Male bar (right-aligned) */}
                            <div className="col-span-5 flex items-center justify-end gap-1.5">
                              <span className="text-[10px] text-slate-500 group-hover:text-sky-300">
                                {mVal}
                              </span>
                              <div className="w-full bg-slate-900 rounded-l h-3.5 flex justify-end overflow-hidden">
                                <div
                                  style={{ width: `${mWidth}%` }}
                                  className="h-full bg-gradient-to-l from-sky-500 to-blue-600 rounded-l transition-all duration-300"
                                />
                              </div>
                            </div>

                            {/* Age Label */}
                            <div className={`col-span-1 text-center font-mono text-[10px] font-semibold ${ageZoneBadge}`}>
                              {row.age}
                            </div>

                            {/* Female bar (left-aligned) */}
                            <div className="col-span-5 flex items-center justify-start gap-1.5">
                              <div className="w-full bg-slate-900 rounded-r h-3.5 flex justify-start overflow-hidden">
                                <div
                                  style={{ width: `${fWidth}%` }}
                                  className="h-full bg-gradient-to-r from-rose-500 to-pink-600 rounded-r transition-all duration-300"
                                />
                              </div>
                              <span className="text-[10px] text-slate-500 group-hover:text-rose-300">
                                {fVal}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Parameters & Sliders for Uploaded Images or Custom Tuning */}
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Интерактивни параметри на пирамидата</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        КДН:{' '}
                        <strong className="text-indigo-300">
                          {structuredControls.workingPct > 0
                            ? (
                                ((structuredControls.underWorkingPct +
                                  structuredControls.overWorkingPct) /
                                  structuredControls.workingPct) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </strong>
                      </span>
                    </div>

                    {/* Visual Stacked Bar for the 3 Age Groups */}
                    <div className="space-y-1.5">
                      <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-950 p-0.5 border border-slate-800">
                        <div
                          style={{ width: `${structuredControls.underWorkingPct}%` }}
                          className="bg-indigo-500 h-full transition-all"
                          title="Подтрудоспособна (0-14 г.)"
                        />
                        <div
                          style={{ width: `${structuredControls.workingPct}%` }}
                          className="bg-emerald-500 h-full transition-all"
                          title="Трудоспособна (15-64 г.)"
                        />
                        <div
                          style={{ width: `${structuredControls.overWorkingPct}%` }}
                          className="bg-amber-500 h-full transition-all"
                          title="Надтрудоспособна (65+ г.)"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2">
                          <label className="block text-[10px] text-indigo-300 font-medium">
                            0–14 г. (Млади %)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="60"
                            value={structuredControls.underWorkingPct}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(70, Number(e.target.value)));
                              const rem = Number((100 - val - structuredControls.overWorkingPct).toFixed(1));
                              setStructuredControls({
                                ...structuredControls,
                                underWorkingPct: val,
                                workingPct: Math.max(0, rem)
                              });
                            }}
                            className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white"
                          />
                        </div>

                        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2">
                          <label className="block text-[10px] text-emerald-300 font-medium">
                            15–64 г. (Трудосп. %)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="20"
                            max="85"
                            value={structuredControls.workingPct}
                            onChange={(e) => {
                              const val = Math.max(10, Math.min(85, Number(e.target.value)));
                              const rem = Number((100 - val - structuredControls.underWorkingPct).toFixed(1));
                              setStructuredControls({
                                ...structuredControls,
                                workingPct: val,
                                overWorkingPct: Math.max(0, rem)
                              });
                            }}
                            className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white"
                          />
                        </div>

                        <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-2">
                          <label className="block text-[10px] text-amber-300 font-medium">
                            65+ г. (Възрастни %)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            max="50"
                            value={structuredControls.overWorkingPct}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(60, Number(e.target.value)));
                              const rem = Number((100 - val - structuredControls.underWorkingPct).toFixed(1));
                              setStructuredControls({
                                ...structuredControls,
                                overWorkingPct: val,
                                workingPct: Math.max(0, rem)
                              });
                            }}
                            className="w-full mt-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-bold text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {}
              <div className="lg:col-span-7 space-y-5">
                {/* Action Header for the 7 Questions */}
                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-400" />
                      <span>Седем стъпки за демографски анализ на пирамидата</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Попълнете отговорите ръчно, използвайте бързите демографски маркери или генерирайте с ИИ
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleAutoFillFromCurrentMetrics}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all"
                      title="Попълва структурирани примерни отговори според текущите проценти и форма"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Авто-попълване по данните</span>
                    </button>

                    <button
                      onClick={handleAiAnalyzeWithGemini}
                      disabled={isAiGenerating}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAiGenerating ? 'Анализиране...' : 'ИИ Анализ на пирамидата'}</span>
                    </button>
                  </div>
                </div>

                {aiStatusText && (
                  <div className="bg-indigo-950/50 border border-indigo-500/40 rounded-xl p-3 text-xs text-indigo-200 flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                    <span>{aiStatusText}</span>
                  </div>
                )}

                {/* View Mode Switcher (All 7 Questions vs Step-by-Step) */}
                <div className="flex items-center justify-between gap-2 bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {QUESTIONS_CONFIG.map((q, idx) => {
                      const isDone = answers[q.id] && answers[q.id].trim().length > 5;
                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setActiveQuestionStep(idx);
                            setViewAllQuestions(false);
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center border transition-all ${
                            !viewAllQuestions && activeQuestionStep === idx
                              ? 'bg-indigo-600 border-indigo-400 text-white'
                              : isDone
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                          title={q.title}
                        >
                          {q.number}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setViewAllQuestions(!viewAllQuestions)}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 shrink-0"
                  >
                    {viewAllQuestions ? 'Режим стъпка по стъпка' : 'Покажи всички 7 въпроса'}
                  </button>
                </div>

                {}
                <div className="space-y-4">
                  {QUESTIONS_CONFIG.map((q, idx) => {
                    if (!viewAllQuestions && idx !== activeQuestionStep) return null;
                    const isAnswered = answers[q.id] && answers[q.id].trim().length > 5;

                    return (
                      <div
                        key={q.id}
                        className={`bg-slate-900/75 border rounded-2xl p-5 transition-all shadow-lg ${
                          isAnswered ? 'border-emerald-500/35' : 'border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            <span
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                                isAnswered
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {q.number}
                            </span>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                                {q.title}
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">{q.subtitle}</p>
                            </div>
                          </div>

                          {isAnswered && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Попълнено
                            </span>
                          )}
                        </div>

                        {/* Interactive Contextual Selector per Question */}
                        {q.id === 'q1' && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {[
                              { id: 'progressive', label: 'Прогресивна', desc: 'Триъгълна (Растяща)' },
                              { id: 'stationary', label: 'Стационарна', desc: 'Камбановидна' },
                              { id: 'regressive', label: 'Регресивна', desc: 'Урновидна (Намаляваща)' },
                              { id: 'asymmetric', label: 'Асиметрична', desc: 'Миграционен профил' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setStructuredControls({ ...structuredControls, shapeType: opt.id })
                                }
                                className={`p-2.5 rounded-xl border text-left transition-all ${
                                  structuredControls.shapeType === opt.id
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                                }`}
                              >
                                <div className="text-xs font-bold">{opt.label}</div>
                                <div className="text-[10px] opacity-75">{opt.desc}</div>
                              </button>
                            ))}
                          </div>
                        )}

                        {q.id === 'q3' && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              { id: 'female', label: `Превес на жените (${structuredControls.femalePct}%)` },
                              { id: 'male', label: `Превес на мъжете (${structuredControls.malePct}%)` },
                              { id: 'balanced', label: 'Относителен баланс' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setStructuredControls({
                                    ...structuredControls,
                                    genderPredominance: opt.id
                                  })
                                }
                                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                                  structuredControls.genderPredominance === opt.id
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.id === 'q4' && (
                          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex flex-wrap items-center gap-3">
                              <span className="text-indigo-300">
                                • 0–14 г.: <strong>{structuredControls.underWorkingPct}%</strong>
                              </span>
                              <span className="text-emerald-300">
                                • 15–64 г.: <strong>{structuredControls.workingPct}%</strong>
                              </span>
                              <span className="text-amber-300">
                                • 65+ г.: <strong>{structuredControls.overWorkingPct}%</strong>
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const text = `Съотношението между трите основни възрастови групи е: подтрудоспособно население (0–14 г.) – ${structuredControls.underWorkingPct}%, трудоспособно население (15–64 г.) – ${structuredControls.workingPct}% и надтрудоспособно население (65+ г.) – ${structuredControls.overWorkingPct}%.`;
                                setAnswers((prev) => ({
                                  ...prev,
                                  q4: prev.q4 ? `${prev.q4} ${text}` : text
                                }));
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30"
                            >
                              + Вмъкни процентите в отговора
                            </button>
                          </div>
                        )}

                        {q.id === 'q5' && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              { id: 'sufficient', label: 'Да, достатъчно работна сила' },
                              { id: 'moderate', label: 'Умерено / Риск в бъдеще' },
                              { id: 'shortage', label: 'Недостиг и високо натоварване' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setStructuredControls({
                                    ...structuredControls,
                                    workforceSufficiency: opt.id
                                  })
                                }
                                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                                  structuredControls.workforceSufficiency === opt.id
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {q.id === 'q7' && (
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              { id: 'yes_strong', label: 'Да, интензивно застарява' },
                              { id: 'yes_moderate', label: 'Плавно застаряване' },
                              { id: 'no_young', label: 'Не, младо население' }
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  setStructuredControls({ ...structuredControls, isAging: opt.id })
                                }
                                className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                                  structuredControls.isAging === opt.id
                                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                                    : 'bg-slate-950/70 border-slate-800 text-slate-400'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Quick-insert helper phrases (Chips) */}
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {q.chips.map((chipText, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => {
                                setAnswers((prev) => {
                                  const current = prev[q.id] || '';
                                  const sep = current.trim().length > 0 ? ' ' : '';
                                  return {
                                    ...prev,
                                    [q.id]: `${current}${sep}${chipText}.`
                                  };
                                });
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/40 transition-all"
                            >
                              + {chipText}
                            </button>
                          ))}
                        </div>

                        {/* Textarea for Answer */}
                        <textarea
                          rows={3}
                          value={answers[q.id]}
                          onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                          placeholder={q.placeholder}
                          className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Save & Export Bar */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-400">
                      Попълнени въпроси:{' '}
                      <strong className="text-white">{completedQuestionsCount} от 7</strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      onClick={() => handleCopyReportToClipboard(null)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      {copiedId === 'current' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>Копирай отговорите</span>
                    </button>

                    <button
                      onClick={() => handleExportAnalysisText(null)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Изтегли отчет (.TXT)</span>
                    </button>

                    <button
                      onClick={handleSaveToRepository}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Запази в Хранилището за отговори</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'repository' && (
          <div className="space-y-6">
            {/* Repository Header & Filters */}
            <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-emerald-400" />
                    <span>Хранилище за отговори и демографски анализи</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Всички запазени анализи на полово-възрастови пирамиди, прикачени файлове и отговори на 7-те въпроса
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('workspace')}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Нов анализ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    placeholder="Търсене по държава, заглавие или автор..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={repoFilterShape}
                    onChange={(e) => setRepoFilterShape(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Всички форми на пирамидата</option>
                    <option value="progressive">Прогресивна (растяща)</option>
                    <option value="stationary">Стационарна (камбановидна)</option>
                    <option value="regressive">Регресивна (намаляваща)</option>
                    <option value="asymmetric">Асиметрична</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Repository Cards Grid */}
            {isStorageLoading ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-300">Зареждане на хранилището за отговори...</p>
              </div>
            ) : filteredRepoItems.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-200">
                  Все още няма запазени отговори в хранилището
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Попълнете 7-те въпроса в работния панел и натиснете бутона „Запази в Хранилището за отговори“, за да съхраните своя анализ.
                </p>
                <button
                  onClick={() => {
                    handleAutoFillFromCurrentMetrics();
                    setActiveTab('workspace');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Генерирай примерен анализ и запази</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRepoItems.map((item) => {
                  const ctrl = item.structuredControls || {};
                  const shapeBadge =
                    ctrl.shapeType === 'progressive'
                      ? { text: 'Прогресивна', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' }
                      : ctrl.shapeType === 'stationary'
                      ? { text: 'Стационарна', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' }
                      : { text: 'Регресивна', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };

                  const firstThumb = item.attachedFiles?.find((f) => f.previewUrl)?.previewUrl;

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                {item.country} ({item.year})
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${shapeBadge.cls}`}>
                                {shapeBadge.text}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-2">{item.title}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Автор: <span className="text-slate-200">{item.author}</span> •{' '}
                              {item.createdAtFormatted}
                            </p>
                          </div>

                          {firstThumb && (
                            <img
                              src={firstThumb}
                              alt="Пирамида"
                              className="w-16 h-16 rounded-lg object-cover border border-slate-700 shrink-0"
                            />
                          )}
                        </div>

                        {/* Summary of ratios */}
                        <div className="grid grid-cols-3 gap-2 bg-slate-950 border border-slate-800/90 rounded-xl p-2.5 text-center my-3">
                          <div>
                            <div className="text-[10px] text-slate-400">0–14 г.</div>
                            <div className="text-xs font-bold text-indigo-300">
                              {ctrl.underWorkingPct ?? '-'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">15–64 г.</div>
                            <div className="text-xs font-bold text-emerald-300">
                              {ctrl.workingPct ?? '-'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-400">65+ г.</div>
                            <div className="text-xs font-bold text-amber-300">
                              {ctrl.overWorkingPct ?? '-'}%
                            </div>
                          </div>
                        </div>

                        {/* Preview of Q1 & Q7 */}
                        <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                          <p className="line-clamp-2">
                            <strong className="text-indigo-300">1. Форма:</strong>{' '}
                            {item.answers?.q1 || '—'}
                          </p>
                          <p className="line-clamp-2">
                            <strong className="text-indigo-300">7. Застаряване:</strong>{' '}
                            {item.answers?.q7 || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedRepoItem(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Преглед на 7-те отговора</span>
                          </button>

                          <button
                            onClick={() => handleLoadFromRepository(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>Зареди</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleExportAnalysisText(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="Изтегли като файл"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFromRepository(item.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20"
                            title="Изтрий"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'compare' && (
          <div className="bg-slate-900/75 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                <span>Сравнителен анализ на полово-възрастови пирамиди</span>
              </h2>
              <p className="text-xs text-slate-400">
                Изберете два запазени анализа от хранилището за директно съпоставяне на показателите и 7-те отговора
              </p>
            </div>

            {savedAnalyses.length < 2 ? (
              <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-sm text-slate-300">
                  Запазете поне 2 анализа в Хранилището, за да ги сравните тук.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1].map((slotIdx) => {
                  const selected = compareItems[slotIdx] || savedAnalyses[slotIdx];
                  return (
                    <div key={slotIdx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
                      <select
                        value={selected?.id || ''}
                        onChange={(e) => {
                          const found = savedAnalyses.find((x) => x.id === e.target.value);
                          const next = [...compareItems];
                          next[slotIdx] = found;
                          setCompareItems(next);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white"
                      >
                        {savedAnalyses.map((sa) => (
                          <option key={sa.id} value={sa.id}>
                            {sa.title} ({sa.country}, {sa.year})
                          </option>
                        ))}
                      </select>

                      {selected && (
                        <div className="space-y-3 text-xs">
                          <div className="grid grid-cols-3 gap-2 bg-slate-900 p-2.5 rounded-lg text-center">
                            <div>
                              <span className="text-slate-400 block">0–14 г.</span>
                              <strong className="text-indigo-300">
                                {selected.structuredControls?.underWorkingPct}%
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">15–64 г.</span>
                              <strong className="text-emerald-300">
                                {selected.structuredControls?.workingPct}%
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">65+ г.</span>
                              <strong className="text-amber-300">
                                {selected.structuredControls?.overWorkingPct}%
                              </strong>
                            </div>
                          </div>

                          {QUESTIONS_CONFIG.map((q) => (
                            <div key={q.id} className="border-b border-slate-800/80 pb-2">
                              <div className="font-semibold text-indigo-300">
                                {q.number}. {q.title}
                              </div>
                              <p className="text-slate-300 mt-1 whitespace-pre-line">
                                {selected.answers?.[q.id] || '—'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {}
      {selectedRepoItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  {selectedRepoItem.country} • {selectedRepoItem.year} г.
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedRepoItem.title}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Изготвил: {selectedRepoItem.author} • Запазено на: {selectedRepoItem.createdAtFormatted}
                </p>
              </div>
              <button
                onClick={() => setSelectedRepoItem(null)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attached files in modal */}
            {selectedRepoItem.attachedFiles?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Прикачени файлове към пирамидата ({selectedRepoItem.attachedFiles.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {selectedRepoItem.attachedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center gap-3"
                    >
                      {f.previewUrl ? (
                        <img
                          src={f.previewUrl}
                          alt={f.name}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                        />
                      ) : (
                        <FileText className="w-8 h-8 text-indigo-400" />
                      )}
                      <div className="text-xs">
                        <div className="font-medium text-slate-200">{f.name}</div>
                        <div className="text-slate-500">{f.dimensions || f.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All 7 Answers */}
            <div className="space-y-3">
              {QUESTIONS_CONFIG.map((q) => (
                <div
                  key={q.id}
                  className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 space-y-1.5"
                >
                  <div className="text-xs sm:text-sm font-bold text-indigo-300">
                    {q.number}. {q.title}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                    {selectedRepoItem.answers?.[q.id] || 'Няма въведен отговор.'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleCopyReportToClipboard(selectedRepoItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                <Copy className="w-4 h-4" />
                <span>Копирай текста</span>
              </button>
              <button
                onClick={() => handleExportAnalysisText(selectedRepoItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Изтегли (.TXT)</span>
              </button>
              <button
                onClick={() => handleLoadFromRepository(selectedRepoItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Зареди в редактора за редакция</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}