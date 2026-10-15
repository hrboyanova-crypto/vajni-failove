import React, { useState, useEffect, useRef } from 'react';
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
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';
import {
  Upload,
  Sparkles,
  Database,
  FileText,
  Trash2,
  Check,
  Copy,
  Edit3,
  Save,
  RefreshCw,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Image as ImageIcon,
  MessageSquare,
  Send,
  BarChart3,
  Clock,
  Eye,
  PlusCircle,
  HelpCircle,
  Award,
  Globe,
  Share2,
  Lock
} from 'lucide-react';

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-pyramid-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' && __firebase_config
  ? JSON.parse(__firebase_config)
  : null;

let app = null;
let auth = null;
let db = null;

if (firebaseConfig) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.error('Firebase init error:', err);
  }
}

const QUESTIONS_CONFIG = [
  {
    id: 'q1_shape',
    number: 1,
    title: 'Определете формата на пирамидата',
    subtitle: 'Класификация на типа пирамида (прогресивна, стационарна или регресивна) и визуални белези',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    iconBg: 'bg-indigo-600'
  },
  {
    id: 'q2_reason',
    number: 2,
    title: 'Отговорете на въпроса защо пирамидата има такава форма',
    subtitle: 'Демографски фактори: раждаемост, смъртност, миграции и исторически процеси',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    iconBg: 'bg-blue-600'
  },
  {
    id: 'q3_gender',
    number: 3,
    title: 'Отчетете има ли превес на мъжете или на жените',
    subtitle: 'Съотношение между половете в младите, средните и високите възрастови групи',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    iconBg: 'bg-purple-600'
  },
  {
    id: 'q4_age_groups',
    number: 4,
    title: 'Определете какво е съотношението между трите възрастови групи',
    subtitle: 'Подтрудоспособна (0–14 г.), трудоспособна (15–64 г.) и надтрудоспособна (65+ г.) възраст',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconBg: 'bg-emerald-600'
  },
  {
    id: 'q5_workforce',
    number: 5,
    title: 'Преценете дали в страната има достатъчно хора в трудоспособна възраст',
    subtitle: 'Оценка на работната сила и коефициента на демографско натоварване',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    iconBg: 'bg-amber-600'
  },
  {
    id: 'q6_forecast',
    number: 6,
    title: 'Прогнозирайте как ще се променя в бъдеще разпределението по възрастови групи',
    subtitle: 'Демографска прогноза за следващите 20–30 години при запазване на тенденциите',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    iconBg: 'bg-cyan-600'
  },
  {
    id: 'q7_aging',
    number: 7,
    title: 'Проучете застарява ли населението на страната. Защо?',
    subtitle: 'Анализ на демографското остаряване „отдолу“ и „отгоре“ и социално-икономически последици',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    iconBg: 'bg-rose-600'
  }
];

const SAMPLE_PRESETS = [
  {
    id: 'repressive_bg',
    name: 'Пример 1: Регресивен тип (напр. България / Източна Европа)',
    countryHint: 'България (Регресивен тип)',
    description: 'Тясна основа, разширена среда и висок дял на възрастното население',
    data: [
      { age: '85+', m: 0.6, f: 1.4 },
      { age: '80-84', m: 1.1, f: 2.1 },
      { age: '75-79', m: 1.8, f: 2.9 },
      { age: '70-74', m: 2.7, f: 3.8 },
      { age: '65-69', m: 3.1, f: 3.9 },
      { age: '60-64', m: 3.4, f: 3.8 },
      { age: '55-59', m: 3.5, f: 3.6 },
      { age: '50-54', m: 3.8, f: 3.7 },
      { age: '45-49', m: 4.1, f: 3.9 },
      { age: '40-44', m: 3.9, f: 3.7 },
      { age: '35-39', m: 3.6, f: 3.4 },
      { age: '30-34', m: 3.1, f: 2.9 },
      { age: '25-29', m: 2.5, f: 2.4 },
      { age: '20-24', m: 2.3, f: 2.2 },
      { age: '15-19', m: 2.4, f: 2.3 },
      { age: '10-14', m: 2.5, f: 2.4 },
      { age: '5-9', m: 2.3, f: 2.2 },
      { age: '0-4', m: 2.1, f: 2.0 }
    ]
  },
  {
    id: 'progressive_ng',
    name: 'Пример 2: Прогресивен тип (напр. Нигерия / Развиваща се страна)',
    countryHint: 'Нигерия (Прогресивен тип)',
    description: 'Много широка основа и бързо стесняващ се връх (висока раждаемост)',
    data: [
      { age: '85+', m: 0.1, f: 0.1 },
      { age: '80-84', m: 0.2, f: 0.2 },
      { age: '75-79', m: 0.3, f: 0.4 },
      { age: '70-74', m: 0.5, f: 0.6 },
      { age: '65-69', m: 0.8, f: 0.9 },
      { age: '60-64', m: 1.1, f: 1.2 },
      { age: '55-59', m: 1.4, f: 1.5 },
      { age: '50-54', m: 1.8, f: 1.8 },
      { age: '45-49', m: 2.2, f: 2.2 },
      { age: '40-44', m: 2.7, f: 2.7 },
      { age: '35-39', m: 3.3, f: 3.2 },
      { age: '30-34', m: 3.9, f: 3.8 },
      { age: '25-29', m: 4.5, f: 4.4 },
      { age: '20-24', m: 5.2, f: 5.1 },
      { age: '15-19', m: 6.1, f: 5.9 },
      { age: '10-14', m: 7.0, f: 6.8 },
      { age: '5-9', m: 7.9, f: 7.6 },
      { age: '0-4', m: 8.8, f: 8.5 }
    ]
  },
  {
    id: 'stationary_se',
    name: 'Пример 3: Стационарен тип (напр. Швеция / Камбановидна форма)',
    countryHint: 'Швеция (Стационарен тип)',
    description: 'Сравнително равномерни възрастови групи с плавно стесняване към върха',
    data: [
      { age: '85+', m: 0.9, f: 1.6 },
      { age: '80-84', m: 1.4, f: 1.8 },
      { age: '75-79', m: 2.1, f: 2.3 },
      { age: '70-74', m: 2.5, f: 2.6 },
      { age: '65-69', m: 2.7, f: 2.7 },
      { age: '60-64', m: 2.9, f: 2.9 },
      { age: '55-59', m: 3.2, f: 3.1 },
      { age: '50-54', m: 3.3, f: 3.2 },
      { age: '45-49', m: 3.2, f: 3.1 },
      { age: '40-44', m: 3.3, f: 3.2 },
      { age: '35-39', m: 3.4, f: 3.3 },
      { age: '30-34', m: 3.5, f: 3.4 },
      { age: '25-29', m: 3.3, f: 3.1 },
      { age: '20-24', m: 2.9, f: 2.8 },
      { age: '15-19', m: 2.9, f: 2.7 },
      { age: '10-14', m: 3.0, f: 2.8 },
      { age: '5-9', m: 2.9, f: 2.8 },
      { age: '0-4', m: 2.8, f: 2.7 }
    ]
  }
];

function generateSamplePyramidDataUrl(preset) {
  const canvas = document.createElement('canvas');
  canvas.width = 760;
  canvas.height = 540;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Полово-възрастова пирамида: ${preset.countryHint}`, canvas.width / 2, 36);

  ctx.fillStyle = '#475569';
  ctx.font = '13px Inter, sans-serif';
  ctx.fillText('Мъже (вляво, %)  |  Възрастови групи  |  Жени (вдясно, %)', canvas.width / 2, 58);

  const centerX = canvas.width / 2;
  const startY = 82;
  const rowHeight = 22;
  const maxVal = 10; // 10% scale on each side
  const sideWidth = 280;

  // Labels Male / Female
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'left';
  ctx.fillText('♂ МЪЖЕ', centerX - sideWidth, 72);

  ctx.fillStyle = '#db2777';
  ctx.textAlign = 'right';
  ctx.fillText('ЖЕНИ ♀', centerX + sideWidth, 72);

  preset.data.forEach((row, idx) => {
    const y = startY + idx * rowHeight;

    // Subtle grid line
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(centerX - sideWidth - 30, y + rowHeight - 2);
    ctx.lineTo(centerX + sideWidth + 30, y + rowHeight - 2);
    ctx.stroke();

    // Male bar (left)
    const mWidth = (row.m / maxVal) * sideWidth;
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(centerX - 28 - mWidth, y, mWidth, rowHeight - 4);

    // Female bar (right)
    const fWidth = (row.f / maxVal) * sideWidth;
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(centerX + 28, y, fWidth, rowHeight - 4);

    // Age text in center
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(row.age, centerX, y + 13);

    // Values
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${row.m}%`, centerX - 34 - mWidth, y + 13);

    ctx.textAlign = 'left';
    ctx.fillText(`${row.f}%`, centerX + 34 + fWidth, y + 13);
  });

  // Axis bottom
  const axisY = startY + preset.data.length * rowHeight + 8;
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(centerX - sideWidth - 28, axisY);
  ctx.lineTo(centerX + sideWidth + 28, axisY);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

// Create a small thumbnail (<15KB) for safe storage in Firestore documents
function createTinyThumbnail(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 220;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

const SUPPORTED_INLINE_MIMES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf'
];

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function buildFilePartsForGemini(dataUrl, mimeType, fileMeta) {
  if (!dataUrl) return [];
  const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  const normalizedMime = (mimeType === 'image/jpg' ? 'image/jpeg' : mimeType || '').toLowerCase();

  // Natively supported binary formats (Images & PDF)
  if (SUPPORTED_INLINE_MIMES.includes(normalizedMime) && base64Data) {
    return [
      {
        inlineData: {
          mimeType: normalizedMime,
          data: base64Data
        }
      }
    ];
  }

  // If text content was extracted from the file (CSV, TXT, JSON, XML, MD, etc.)
  if (fileMeta?.textContent) {
    return [
      {
        text: `Прикачен файл: "${fileMeta.name}" (Формат: ${fileMeta.extension}, Тип: ${
          fileMeta.type || 'текстов/табличен'
        }).\nИзвлечено съдържание от файла:\n${fileMeta.textContent}`
      }
    ];
  }

  // Fallback for any other arbitrary file format (.docx, .xlsx, .pptx, archives, etc.)
  return [
    {
      text: `Потребителят е прикачил файл с име "${
        fileMeta?.name || 'прикачен файл'
      }" (Формат: ${fileMeta?.extension || 'неизвестен'}, MIME: ${
        mimeType || 'application/octet-stream'
      }, Размер: ${formatFileSize(fileMeta?.size)}). Използвай заглавието, метаданните и бележките за изготвяне на демографския анализ.`
    }
  ];
}

async function fetchGeminiWithBackoff(payload, retries = 4) {
  const apiKey = '';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

  let delay = 1000;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (attempt < retries && (response.status === 429 || response.status >= 500)) {
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }
        const errText = await response.text();
        throw new Error(`API грешка (${response.status}): ${errText}`);
      }

      return await response.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

export default function PopulationPyramidAssistant() {
  // Auth & Firestore states
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [privateRecords, setPrivateRecords] = useState([]);
  const [publicRecords, setPublicRecords] = useState([]);
  const [repoScope, setRepoScope] = useState('private'); // 'private' | 'public'

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('analyzer'); // 'analyzer' | 'repository'

  // Image & File Input states
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageMimeType, setImageMimeType] = useState('image/png');
  const [attachedFileMeta, setAttachedFileMeta] = useState(null);
  const [customTitle, setCustomTitle] = useState('');
  const [userNotesContext, setUserNotesContext] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [currentRecordId, setCurrentRecordId] = useState(null);

  // Follow-up AI Q&A states
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAskingFollowUp, setIsAskingFollowUp] = useState(false);

  // UI Notification & Modal states
  const [toast, setToast] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const fileInputRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth sign-in error:', err);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Load saved records from Firestore (Rule 1, 2, 3 compliant)
  useEffect(() => {
    if (!authReady || !user || !db) return;

    // 1. Private user collection
    const privateColRef = collection(db, 'artifacts', appId, 'users', user.uid, 'pyramid_analyses');
    const unsubPrivate = onSnapshot(
      privateColRef,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data(), scope: 'private' });
        });
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPrivateRecords(items);
      },
      (err) => {
        console.error('Private Firestore snapshot error:', err);
      }
    );

    // 2. Public shared collection
    const publicColRef = collection(db, 'artifacts', appId, 'public', 'data', 'pyramid_analyses');
    const unsubPublic = onSnapshot(
      publicColRef,
      (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data(), scope: 'public' });
        });
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setPublicRecords(items);
      },
      (err) => {
        console.error('Public Firestore snapshot error:', err);
      }
    );

    return () => {
      unsubPrivate();
      unsubPublic();
    };
  }, [authReady, user]);

  // Load default sample pyramid on initial mount so the user sees how it works immediately
  useEffect(() => {
    const sampleUrl = generateSamplePyramidDataUrl(SAMPLE_PRESETS[0]);
    setImageDataUrl(sampleUrl);
    setImageMimeType('image/png');
    setAttachedFileMeta({
      name: `${SAMPLE_PRESETS[0].countryHint}.png`,
      size: 0,
      type: 'image/png',
      extension: 'PNG',
      isImage: true,
      textContent: ''
    });
    setCustomTitle(SAMPLE_PRESETS[0].countryHint);
  }, []);

  const handleFileProcess = (file) => {
    if (!file) return;

    const ext = file.name.includes('.')
      ? file.name.split('.').pop().toUpperCase()
      : 'FILE';
    const isImage =
      file.type.startsWith('image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg|ico|avif|heic|heif)$/i.test(file.name);
    const isTextReadable =
      file.type.startsWith('text/') ||
      /\.(csv|tsv|txt|json|xml|md|html|htm|log|yaml|yml|rtf)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const resultDataUrl = e.target.result;
      setImageDataUrl(resultDataUrl);
      setImageMimeType(file.type || (isImage ? 'image/png' : 'application/octet-stream'));
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setCustomTitle(cleanName || 'Нова полово-възрастова пирамида');
      setAnalysisResult(null);
      setCurrentRecordId(null);
      setChatHistory([]);

      if (isTextReadable) {
        const textReader = new FileReader();
        textReader.onload = (te) => {
          const extractedText = String(te.target.result || '').slice(0, 20000);
          setAttachedFileMeta({
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            extension: ext,
            isImage: false,
            textContent: extractedText
          });
        };
        textReader.onerror = () => {
          setAttachedFileMeta({
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            extension: ext,
            isImage: false,
            textContent: ''
          });
        };
        textReader.readAsText(file);
      } else {
        setAttachedFileMeta({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          extension: ext,
          isImage,
          textContent: ''
        });
      }

      showToast(`Файлът „${file.name}“ (${ext}) е прикачен успешно!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileProcess(file);
  };

  const handleLoadSample = (preset) => {
    const dataUrl = generateSamplePyramidDataUrl(preset);
    setImageDataUrl(dataUrl);
    setImageMimeType('image/png');
    setAttachedFileMeta({
      name: `${preset.countryHint}.png`,
      size: 0,
      type: 'image/png',
      extension: 'PNG',
      isImage: true,
      textContent: ''
    });
    setCustomTitle(preset.countryHint);
    setAnalysisResult(null);
    setCurrentRecordId(null);
    setChatHistory([]);
    showToast(`Зареден е пример: ${preset.countryHint}`);
  };

  const runPyramidAnalysis = async () => {
    if (!imageDataUrl) {
      showToast('Моля, прикачете файл или изберете примерна полово-възрастова пирамида.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const systemPrompt = `Ти си експертен демограф и преподавател по география и икономика.
Анализирай предоставения файл (изображение, PDF документ, таблица с данни или документ за полово-възрастова пирамида) задълбочено, точно и на отличен книжовен български език.
Отговори изчерпателно и структурирано на всички 7 задължителни въпроса от заданието, като извличаш конкретни данни от прикачения файл (проценти, брой население, форма на стълбовете по възрасти за мъже и жени).`;

      const userPrompt = `Анализирай тази полово-възрастова пирамида${customTitle ? ` (Заглавие/Насока: ${customTitle})` : ''}${userNotesContext ? `. Допълнителни бележки от потребителя: ${userNotesContext}` : ''}.
Изпълни следните 7 задачи:
1. Определете формата на пирамидата (тип: прогресивна/експанзивна, стационарна/камбановидна или регресивна/контрактивна, и опишете основата, средата и върха).
2. Отговорете на въпроса защо пирамидата има такава форма (обяснете влиянието на раждаемостта, смъртността, продължителността на живота, миграциите и социално-икономическите фактори).
3. Отчетете има ли превес на мъжете или на жените (сравнете лявата и дясната страна при младите, зрелите и възрастните групи над 65 г. и обяснете причините).
4. Определете какво е съотношението между трите възрастови групи: подтрудоспособна (0-14 г.), трудоспособна (15-64 г.) и надтрудоспособна (65+ г.) възраст.
5. Преценете дали в страната има достатъчно хора в трудоспособна възраст (оценете трудовия потенциал и демографското натоварване на работещите).
6. Прогнозирайте как ще се променя в бъдеще разпределението на населението по възрастови групи (какво ще се случи след 15-30 години, когато днешните кохорти се придвижат нагоре).
7. Проучете застарява ли населението на страната. Защо? (аргументирано заключение дали има демографско остаряване и кои са причините за това).`;

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          detectedTitle: {
            type: 'STRING',
            description: 'Открита държава/регион и година от пирамидата или описателно заглавие на български'
          },
          pyramidType: {
            type: 'STRING',
            description: 'Кратко определение на типа: Регресивна, Прогресивна или Стационарна пирамида'
          },
          dominantGender: {
            type: 'STRING',
            description: 'Кратко обобщение: Превес на жените (особено над 60 г.), Превес на мъжете или Балансирано съотношение'
          },
          isAgingStatus: {
            type: 'STRING',
            description: 'Кратка оценка: Да, силно застаряващо / Да, умерено застаряващо / Не, младо население'
          },
          estimatedYoungPct: {
            type: 'NUMBER',
            description: 'Приблизителен процент на подтрудоспособното население (0-14 г.), число между 5 и 55'
          },
          estimatedWorkingPct: {
            type: 'NUMBER',
            description: 'Приблизителен процент на трудоспособното население (15-64 г.), число между 40 и 75'
          },
          estimatedElderlyPct: {
            type: 'NUMBER',
            description: 'Приблизителен процент на надтрудоспособното население (65+ г.), число между 2 и 40'
          },
          q1_shape: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 1: Определете формата на пирамидата'
          },
          q2_reason: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 2: Защо пирамидата има такава форма'
          },
          q3_gender: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 3: Има ли превес на мъжете или на жените'
          },
          q4_age_groups: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 4: Съотношение между трите възрастови групи'
          },
          q5_workforce: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 5: Достатъчно ли са хората в трудоспособна възраст'
          },
          q6_forecast: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 6: Прогноза за бъдещото разпределение по възрастови групи'
          },
          q7_aging: {
            type: 'STRING',
            description: 'Пълен отговор на Въпрос 7: Застарява ли населението на страната и защо'
          }
        },
        required: [
          'detectedTitle',
          'pyramidType',
          'dominantGender',
          'isAgingStatus',
          'estimatedYoungPct',
          'estimatedWorkingPct',
          'estimatedElderlyPct',
          'q1_shape',
          'q2_reason',
          'q3_gender',
          'q4_age_groups',
          'q5_workforce',
          'q6_forecast',
          'q7_aging'
        ]
      };

      const fileParts = buildFilePartsForGemini(imageDataUrl, imageMimeType, attachedFileMeta);

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }, ...fileParts]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      };

      const result = await fetchGeminiWithBackoff(payload);
      const rawJson = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawJson) {
        throw new Error('Не бе получен валиден отговор от AI модела.');
      }

      const parsed = JSON.parse(rawJson);

      // Normalize percentages to sum to 100
      const totalPct =
        (Number(parsed.estimatedYoungPct) || 15) +
        (Number(parsed.estimatedWorkingPct) || 65) +
        (Number(parsed.estimatedElderlyPct) || 20);

      const normalized = {
        ...parsed,
        estimatedYoungPct: Math.round(((Number(parsed.estimatedYoungPct) || 15) / totalPct) * 100),
        estimatedWorkingPct: Math.round(((Number(parsed.estimatedWorkingPct) || 65) / totalPct) * 100),
        estimatedElderlyPct: Math.round(((Number(parsed.estimatedElderlyPct) || 20) / totalPct) * 100)
      };

      setAnalysisResult(normalized);
      if (!customTitle && parsed.detectedTitle) {
        setCustomTitle(parsed.detectedTitle);
      }
      showToast('Анализът по всички 7 точки е генериран успешно!');
    } catch (error) {
      console.error('AI Analysis Error:', error);
      showToast('Възникна грешка при анализа. Моля, опитайте отново.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskFollowUp = async (e) => {
    e.preventDefault();
    if (!chatQuestion.trim() || !imageDataUrl) return;

    const questionText = chatQuestion.trim();
    setChatQuestion('');
    setChatHistory((prev) => [...prev, { role: 'user', text: questionText }]);
    setIsAskingFollowUp(true);

    try {
      const contextSummary = analysisResult
        ? `Текущ анализ на пирамидата (${analysisResult.detectedTitle}): Форма: ${analysisResult.pyramidType}.`
        : '';

      const fileParts = buildFilePartsForGemini(imageDataUrl, imageMimeType, attachedFileMeta);

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${contextSummary}\nПотребителят пита следното относно прикачения файл за полово-възрастовата пирамида: "${questionText}". Отговори кратко, ясно и експертно на български език.`
              },
              ...fileParts
            ]
          }
        ]
      };

      const result = await fetchGeminiWithBackoff(payload);
      const reply =
        result?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Не успях да генерирам отговор на този въпрос.';

      setChatHistory((prev) => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Follow-up error:', err);
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'Възникна грешка при свързване с AI асистента.' }
      ]);
    } finally {
      setIsAskingFollowUp(false);
    }
  };

  const saveToRepository = async (targetScope = 'private') => {
    if (!analysisResult) {
      showToast('Първо генерирайте анализ, за да го запазите в хранилището.', 'error');
      return;
    }

    const recordId = currentRecordId || `pyr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const thumbnail = imageDataUrl ? await createTinyThumbnail(imageDataUrl) : '';

    const recordPayload = {
      title: customTitle || analysisResult.detectedTitle || 'Анализ на пирамида',
      notes: userNotesContext || '',
      thumbnailDataUrl: thumbnail,
      analysisResult: analysisResult,
      chatHistory: chatHistory,
      createdAt: Date.now(),
      authorId: user?.uid || 'anonymous'
    };

    try {
      if (db && user) {
        const docRef =
          targetScope === 'public'
            ? doc(db, 'artifacts', appId, 'public', 'data', 'pyramid_analyses', recordId)
            : doc(db, 'artifacts', appId, 'users', user.uid, 'pyramid_analyses', recordId);

        await setDoc(docRef, recordPayload);
        setCurrentRecordId(recordId);
        showToast(
          targetScope === 'public'
            ? 'Отговорите са запазени в Споделеното хранилище!'
            : 'Отговорите са запазени в Личното хранилище!'
        );
      } else {
        // Fallback in-memory if Firebase is unavailable
        const newEntry = { id: recordId, ...recordPayload, scope: targetScope };
        if (targetScope === 'public') {
          setPublicRecords((prev) => [newEntry, ...prev.filter((i) => i.id !== recordId)]);
        } else {
          setPrivateRecords((prev) => [newEntry, ...prev.filter((i) => i.id !== recordId)]);
        }
        setCurrentRecordId(recordId);
        showToast('Отговорите са запазени в хранилището за сесията!');
      }
    } catch (err) {
      console.error('Error saving to repository:', err);
      showToast('Грешка при запазване в хранилището.', 'error');
    }
  };

  const loadRecordFromRepository = (record) => {
    setCustomTitle(record.title || '');
    setUserNotesContext(record.notes || '');
    if (record.thumbnailDataUrl) {
      setImageDataUrl(record.thumbnailDataUrl);
      setImageMimeType('image/jpeg');
    }
    setAnalysisResult(record.analysisResult);
    setChatHistory(record.chatHistory || []);
    setCurrentRecordId(record.id);
    setActiveTab('analyzer');
    showToast(`Зареден анализ: "${record.title}"`);
  };

  const confirmDeleteRecord = async (record) => {
    try {
      if (db && user) {
        const docRef =
          record.scope === 'public'
            ? doc(db, 'artifacts', appId, 'public', 'data', 'pyramid_analyses', record.id)
            : doc(db, 'artifacts', appId, 'users', user.uid, 'pyramid_analyses', record.id);
        await deleteDoc(docRef);
      } else {
        if (record.scope === 'public') {
          setPublicRecords((prev) => prev.filter((r) => r.id !== record.id));
        } else {
          setPrivateRecords((prev) => prev.filter((r) => r.id !== record.id));
        }
      }
      if (currentRecordId === record.id) {
        setCurrentRecordId(null);
      }
      setDeleteConfirmId(null);
      showToast('Записът беше изтрит от хранилището.');
    } catch (err) {
      console.error('Error deleting record:', err);
      showToast('Грешка при изтриване на записа.', 'error');
    }
  };

  const copyAllAnswersToClipboard = () => {
    if (!analysisResult) return;

    const lines = [
      `ДЕМОГРАФСКИ АНАЛИЗ НА ПОЛОВО-ВЪЗРАСТОВА ПИРАМИДА`,
      `Обект / Държава: ${customTitle || analysisResult.detectedTitle}`,
      `Тип пирамида: ${analysisResult.pyramidType}`,
      `Съотношение по възрастови групи: 0-14 г.: ${analysisResult.estimatedYoungPct}% | 15-64 г.: ${analysisResult.estimatedWorkingPct}% | 65+ г.: ${analysisResult.estimatedElderlyPct}%`,
      `----------------------------------------`,
      ...QUESTIONS_CONFIG.map(
        (q) => `\n${q.number}. ${q.title.toUpperCase()}:\n${analysisResult[q.id] || ''}`
      )
    ];

    const fullText = lines.join('\n');
    const textArea = document.createElement('textarea');
    textArea.value = fullText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Всички 7 отговора са копирани в клипборда!');
    } catch (err) {
      showToast('Неуспешно копиране.', 'error');
    }
    document.body.removeChild(textArea);
  };

  const startEditingQuestion = (qId, currentVal) => {
    setEditingQuestionId(qId);
    setEditBuffer(currentVal || '');
  };

  const saveEditedQuestion = (qId) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      [qId]: editBuffer
    });
    setEditingQuestionId(null);
    showToast('Отговорът е обновен! Не забравяйте да запазите в хранилището.');
  };

  // Filtered repository list
  const activeRepoList = repoScope === 'private' ? privateRecords : publicRecords;
  const filteredRepoList = activeRepoList.filter((item) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.analysisResult?.pyramidType || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === 'ALL' ||
      (item.analysisResult?.pyramidType || '').toLowerCase().includes(filterType.toLowerCase());

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-200 shrink-0" />
            ) : (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                AI Демографски Асистент
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Полово-възрастови пирамиди
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Интелигентен анализ по 7 географски критерия и хранилище за отговори
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'analyzer'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Анализатор</span>
            </button>
            <button
              onClick={() => setActiveTab('repository')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'repository'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Хранилище за отговорите</span>
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-700 font-bold">
                {privateRecords.length + publicRecords.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analyzer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: File Upload & Controls (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Universal File Upload Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-indigo-600" />
                    1. Прикачване на файл (всички формати)
                  </h2>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-lg transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Прикачи файл
                  </button>
                </div>

                {/* Drag & Drop Zone accepting all file formats */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all p-3 text-center overflow-hidden ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50/70'
                      : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="*/*"
                    onChange={(e) => handleFileProcess(e.target.files?.[0])}
                    className="hidden"
                  />

                  {imageDataUrl ? (
                    <div className="space-y-2">
                      {attachedFileMeta && !attachedFileMeta.isImage ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-inner text-left space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xs flex flex-col items-center justify-center shrink-0 shadow-sm">
                              <FileText className="w-5 h-5 mb-0.5" />
                              <span className="text-[10px] tracking-wider">
                                {attachedFileMeta.extension?.slice(0, 5) || 'FILE'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {attachedFileMeta.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Формат: <span className="font-semibold">{attachedFileMeta.extension}</span>
                                {attachedFileMeta.size > 0 && ` • ${formatFileSize(attachedFileMeta.size)}`}
                              </p>
                            </div>
                          </div>

                          {attachedFileMeta.textContent && (
                            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 max-h-32 overflow-y-auto">
                              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                                Преглед на данните от файла:
                              </p>
                              <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap break-words">
                                {attachedFileMeta.textContent.slice(0, 500)}
                                {attachedFileMeta.textContent.length > 500 ? '...' : ''}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg border border-slate-200 p-2 shadow-inner">
                          <img
                            src={imageDataUrl}
                            alt="Полово-възрастова пирамида"
                            className="max-h-72 w-auto mx-auto object-contain rounded"
                          />
                        </div>
                      )}
                      <p className="text-xs text-slate-500">
                        Кликнете или пуснете друг файл тук (поддържат се всички файлови формати)
                      </p>
                    </div>
                  ) : (
                    <div className="py-10 px-4 space-y-2">
                      <Upload className="w-10 h-10 text-indigo-500 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700">
                        Прикачете файл с полово-възрастова пирамида
                      </p>
                      <p className="text-xs text-slate-500">
                        Поддържат се всички формати: изображения (PNG, JPG, WEBP, SVG), PDF, таблици (CSV, XLSX), документи (DOCX, TXT, JSON) и др.
                      </p>
                    </div>
                  )}
                </div>

                {/* Built-in Sample Pyramids for quick testing */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Или изберете примерна пирамида за тест:
                  </p>
                  <div className="space-y-1.5">
                    {SAMPLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadSample(preset)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between border ${
                          customTitle === preset.countryHint
                            ? 'bg-indigo-50/90 border-indigo-300 text-indigo-900'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {preset.description}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata & Analyze Action Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  2. Данни за анализа и стартиране
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Заглавие / Държава или регион (по избор)
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="напр. България (2026 г.), Япония, Нигерия..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Допълнителни насоки или въпроси към AI (по избор)
                  </label>
                  <textarea
                    rows={2}
                    value={userNotesContext}
                    onChange={(e) => setUserNotesContext(e.target.value)}
                    placeholder="напр. Обърни специално внимание на раждаемостта и трудовия пазар..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>

                <button
                  type="button"
                  disabled={isAnalyzing || !imageDataUrl}
                  onClick={runPyramidAnalysis}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>AI анализира пирамидата по 7-те въпроса...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Генерирай пълен анализ (Въпроси 1 – 7)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Checklist Overview of the 7 Questions */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-3 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" />
                  Задължителни задачи на асистента:
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {QUESTIONS_CONFIG.map((q) => {
                    const isDone = Boolean(analysisResult && analysisResult[q.id]);
                    return (
                      <li key={q.id} className="flex items-start gap-2">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            isDone
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {isDone ? '✓' : q.number}
                        </span>
                        <span className={isDone ? 'text-white font-medium' : ''}>{q.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {}
            <div className="lg:col-span-7 space-y-6">
              {!analysisResult && !isAnalyzing ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Готовност за анализ на полово-възрастовата структура
                  </h3>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                    Прикачете изображение на полово-възрастова пирамида или използвайте някоя от
                    готовите примерни пирамиди вляво, след което натиснете бутона{' '}
                    <span className="font-semibold text-indigo-600">
                      „Генерирай пълен анализ (Въпроси 1 – 7)“
                    </span>
                    .
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={runPyramidAnalysis}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow flex items-center gap-2 transition"
                    >
                      <Sparkles className="w-4 h-4" />
                      Анализирай заредената пирамида сега
                    </button>
                    <button
                      onClick={() => setActiveTab('repository')}
                      className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold flex items-center gap-2 transition"
                    >
                      <Database className="w-4 h-4" />
                      Отвори хранилището ({privateRecords.length + publicRecords.length})
                    </button>
                  </div>
                </div>
              ) : isAnalyzing ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center space-y-5">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800">
                      Извършва се визуален и демографски анализ...
                    </h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto">
                      AI асистентът разчита възрастовите кохорти, сравнява дела на мъжете и жените и
                      формулира отговорите по седемте точки.
                    </p>
                  </div>
                  <div className="max-w-md mx-auto bg-slate-50 rounded-xl p-4 border border-slate-200 text-left space-y-2">
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Summary Dashboard & Save Bar */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Резултати от демографския анализ
                        </span>
                        <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                          {customTitle || analysisResult.detectedTitle}
                        </h2>
                      </div>

                      {/* Action Buttons: Save to Private / Public Repository & Copy */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => saveToRepository('private')}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Запази в Лично хранилище</span>
                        </button>
                        <button
                          onClick={() => saveToRepository('public')}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Сподели в Общо хранилище</span>
                        </button>
                        <button
                          onClick={copyAllAnswersToClipboard}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                          title="Копирай всички отговори"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Копирай</span>
                        </button>
                      </div>
                    </div>

                    {/* Key Indicators Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                        <div className="text-[11px] font-semibold text-indigo-600 uppercase">
                          Форма / Тип пирамида
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {analysisResult.pyramidType}
                        </div>
                      </div>
                      <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3">
                        <div className="text-[11px] font-semibold text-purple-600 uppercase">
                          Полов баланс
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {analysisResult.dominantGender}
                        </div>
                      </div>
                      <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-3">
                        <div className="text-[11px] font-semibold text-rose-600 uppercase">
                          Демографско остаряване
                        </div>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">
                          {analysisResult.isAgingStatus}
                        </div>
                      </div>
                    </div>

                    {/* Visual Ratio Bar of the 3 Age Groups */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Оценено съотношение между трите основни възрастови групи:</span>
                        <span className="text-slate-500">Общо 100%</span>
                      </div>

                      <div className="w-full h-6 rounded-lg overflow-hidden flex shadow-inner bg-slate-200">
                        <div
                          style={{ width: `${analysisResult.estimatedYoungPct}%` }}
                          className="bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center transition-all"
                          title={`Подтрудоспособна (0-14 г.): ${analysisResult.estimatedYoungPct}%`}
                        >
                          {analysisResult.estimatedYoungPct >= 8 &&
                            `${analysisResult.estimatedYoungPct}%`}
                        </div>
                        <div
                          style={{ width: `${analysisResult.estimatedWorkingPct}%` }}
                          className="bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center transition-all"
                          title={`Трудоспособна (15-64 г.): ${analysisResult.estimatedWorkingPct}%`}
                        >
                          {analysisResult.estimatedWorkingPct}%
                        </div>
                        <div
                          style={{ width: `${analysisResult.estimatedElderlyPct}%` }}
                          className="bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center transition-all"
                          title={`Надтрудоспособна (65+ г.): ${analysisResult.estimatedElderlyPct}%`}
                        >
                          {analysisResult.estimatedElderlyPct >= 8 &&
                            `${analysisResult.estimatedElderlyPct}%`}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0" />
                          <span className="text-slate-600">
                            <strong>0–14 г.</strong> (Подтрудоспособна):{' '}
                            <strong>{analysisResult.estimatedYoungPct}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-blue-600 shrink-0" />
                          <span className="text-slate-600">
                            <strong>15–64 г.</strong> (Трудоспособна):{' '}
                            <strong>{analysisResult.estimatedWorkingPct}%</strong>
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-sm bg-rose-500 shrink-0" />
                          <span className="text-slate-600">
                            <strong>65+ г.</strong> (Надтрудоспособна):{' '}
                            <strong>{analysisResult.estimatedElderlyPct}%</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="space-y-4">
                    {QUESTIONS_CONFIG.map((q) => {
                      const answerText = analysisResult[q.id] || '';
                      const isEditing = editingQuestionId === q.id;

                      return (
                        <div
                          key={q.id}
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 transition hover:border-slate-300"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3">
                              <span
                                className={`w-8 h-8 rounded-xl ${q.iconBg} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5`}
                              >
                                {q.number}
                              </span>
                              <div>
                                <h3 className="text-base font-bold text-slate-900">{q.title}</h3>
                                <p className="text-xs text-slate-500">{q.subtitle}</p>
                              </div>
                            </div>

                            {!isEditing && (
                              <button
                                onClick={() => startEditingQuestion(q.id, answerText)}
                                className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition shrink-0"
                                title="Редактирай отговора"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Редактирай</span>
                              </button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-3 mt-2">
                              <textarea
                                rows={4}
                                value={editBuffer}
                                onChange={(e) => setEditBuffer(e.target.value)}
                                className="w-full p-3 text-sm rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                                >
                                  Отказ
                                </button>
                                <button
                                  onClick={() => saveEditedQuestion(q.id)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Запази промяната
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="pl-11 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                              {answerText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Interactive Follow-Up Q&A Box */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      Допълнителни въпроси към AI асистента за тази пирамида
                    </h3>

                    {chatHistory.length > 0 && (
                      <div className="space-y-3 max-h-64 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                        {chatHistory.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${
                              msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form onSubmit={handleAskFollowUp} className="flex gap-2">
                      <input
                        type="text"
                        value={chatQuestion}
                        onChange={(e) => setChatQuestion(e.target.value)}
                        placeholder="Попитайте още нещо (напр. Коя възрастова група е най-голяма и какви мерки са нужни?)..."
                        className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="submit"
                        disabled={isAskingFollowUp || !chatQuestion.trim()}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-1.5 transition"
                      >
                        {isAskingFollowUp ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Попитай</span>
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Repository Header & Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-6 h-6 text-indigo-600" />
                    Хранилище за отговорите и анализите
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Преглеждайте, зареждайте, редактирайте или сравнявайте запазените анализи на
                    полово-възрастови пирамиди.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('analyzer')}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Нов анализ на пирамида</span>
                </button>
              </div>

              {/* Scope Switcher (Private vs Public Repository) & Filters */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setRepoScope('private')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      repoScope === 'private'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Мое лично хранилище ({privateRecords.length})</span>
                  </button>
                  <button
                    onClick={() => setRepoScope('public')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      repoScope === 'public'
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Споделено хранилище на класа ({publicRecords.length})</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 flex-1 sm:flex-initial justify-end">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Търсене по държава или заглавие..."
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-60"
                  />

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 font-medium outline-none"
                  >
                    <option value="ALL">Всички типове пирамиди</option>
                    <option value="регресив">Регресивна</option>
                    <option value="прогресив">Прогресивна</option>
                    <option value="стационар">Стационарна</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Repository Cards Grid */}
            {filteredRepoList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Database className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">
                  Няма намерени запазени отговори в това хранилище
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Генерирайте анализ на полово-възрастова пирамида в секцията „AI Анализатор“ и
                  натиснете бутона „Запази в хранилището“.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredRepoList.map((record) => {
                  const res = record.analysisResult || {};
                  const dateFormatted = record.createdAt
                    ? new Date(record.createdAt).toLocaleString('bg-BG', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '';

                  return (
                    <div
                      key={record.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                    >
                      {/* Top Bar with Thumbnail and Summary */}
                      <div className="p-5 flex gap-4 border-b border-slate-100">
                        {record.thumbnailDataUrl ? (
                          <img
                            src={record.thumbnailDataUrl}
                            alt={record.title}
                            className="w-28 h-24 object-contain bg-slate-50 rounded-xl border border-slate-200 p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-28 h-24 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <BarChart3 className="w-8 h-8" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-bold text-slate-900 truncate">
                              {record.title}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                              {res.pyramidType || 'Анализ'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dateFormatted}</span>
                          </div>

                          {/* Mini Ratio Bar */}
                          <div className="mt-3 space-y-1">
                            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                              <div
                                style={{ width: `${res.estimatedYoungPct || 20}%` }}
                                className="bg-emerald-500"
                              />
                              <div
                                style={{ width: `${res.estimatedWorkingPct || 60}%` }}
                                className="bg-blue-600"
                              />
                              <div
                                style={{ width: `${res.estimatedElderlyPct || 20}%` }}
                                className="bg-rose-500"
                              />
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                              <span>0-14г: {res.estimatedYoungPct || 0}%</span>
                              <span>15-64г: {res.estimatedWorkingPct || 0}%</span>
                              <span>65+г: {res.estimatedElderlyPct || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preview of Answers 1-7 */}
                      <div className="p-5 flex-1 space-y-2.5 bg-slate-50/50 text-xs">
                        {QUESTIONS_CONFIG.map((q) => (
                          <div key={q.id} className="bg-white p-2.5 rounded-xl border border-slate-200/80">
                            <div className="font-bold text-slate-800 mb-0.5">
                              {q.number}. {q.title}
                            </div>
                            <div className="text-slate-600 line-clamp-2">
                              {res[q.id] || 'Няма въведен отговор'}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3.5 bg-white border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => loadRecordFromRepository(record)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Отвори и редактирай всички 7 отговора</span>
                        </button>

                        {deleteConfirmId === record.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => confirmDeleteRecord(record)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold"
                            >
                              Потвърди
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                            >
                              Отказ
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(record.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Изтрий записа"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            AI Асистент за анализ на полово-възрастовата структура на населението (Въпроси 1–7)
          </span>
          {user && (
            <span className="font-mono text-[11px] text-slate-400">
              Потребителско ID: {user.uid}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}