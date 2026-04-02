const STORAGE_NS = "studio-undangan:v1";
const TEXT_TYPES = new Set(["text", "multiline"]);
const IMAGE_TYPES = new Set(["image", "signature"]);
const LINE_TYPES = new Set(["line"]);
const SVG_NS = "http://www.w3.org/2000/svg";
const HISTORY_LIMIT = 120;
const CUSTOM_TEMPLATES_KEY = `${STORAGE_NS}:customTemplates`;
const RESIZE_MIN_SIZE = 20;
const RESIZE_DIRECTIONS = ["n", "ne", "e", "se", "s", "sw", "w", "nw"];
const FONT_FAMILY_OPTIONS = [
  { value: "times-new-roman", label: "Times New Roman" },
  { value: "arial", label: "Arial" },
  { value: "calibri", label: "Calibri" },
  { value: "cambria", label: "Cambria" },
  { value: "georgia", label: "Georgia" },
  { value: "tahoma", label: "Tahoma" },
  { value: "verdana", label: "Verdana" },
  { value: "book-antiqua", label: "Book Antiqua" },
  { value: "body", label: "Body (Nunito)" },
  { value: "display", label: "Display (Cormorant)" },
  { value: "script", label: "Script (Yellowtail)" }
];
const PAPER_PRESETS = {
  auto: { label: "Auto", widthPx: null, heightPx: null },
  "a4-portrait": { label: "A4 Portrait", widthPx: mmToCssPx(210), heightPx: mmToCssPx(297) },
  "a4-landscape": { label: "A4 Landscape", widthPx: mmToCssPx(297), heightPx: mmToCssPx(210) },
  "f4-portrait": { label: "F4 Portrait", widthPx: mmToCssPx(210), heightPx: mmToCssPx(330) },
  "f4-landscape": { label: "F4 Landscape", widthPx: mmToCssPx(330), heightPx: mmToCssPx(210) },
  "letter-portrait": { label: "Letter Portrait", widthPx: mmToCssPx(215.9), heightPx: mmToCssPx(279.4) },
  "letter-landscape": { label: "Letter Landscape", widthPx: mmToCssPx(279.4), heightPx: mmToCssPx(215.9) }
};

const state = {
  templates: [],
  researchCount: 0,
  currentTemplateId: null,
  draft: null,
  layoutMode: "single",
  doubleSourceMode: "same",
  rightTemplateId: null,
  paperPreset: "auto",
  paperMarginMm: 8,
  showCutMarks: true,
  selectedComponentId: null,
  drag: null,
  pointerCache: {},
  saveTimer: null,
  connectorRaf: null,
  historyPast: [],
  historyFuture: []
};

const dom = {
  templateSelect: null,
  layoutModeSelect: null,
  doubleSourceModeSelect: null,
  rightTemplateSelect: null,
  paperPresetSelect: null,
  paperMarginMmInput: null,
  showCutMarksToggle: null,
  newTemplateBtn: null,
  addComponentBtn: null,
  undoBtn: null,
  redoBtn: null,
  resetTemplateBtn: null,
  exportJsonBtn: null,
  importJsonInput: null,
  downloadPngBtn: null,
  downloadPdfBtn: null,
  downloadDocxBtn: null,
  printBtn: null,
  builderPanel: null,
  builderTemplateName: null,
  builderTemplateCategory: null,
  builderTemplateWidth: null,
  builderTemplateHeight: null,
  builderCloneCurrent: null,
  builderCreateTemplateBtn: null,
  builderComponentType: null,
  builderComponentLabel: null,
  builderAddComponentBtn: null,
  editorList: null,
  workspace: null,
  previewStage: null,
  layoutSheet: null,
  canvas: null,
  canvasMirror: null,
  linkLayer: null,
  statusText: null,
  metaText: null,
  printPageStyle: null
};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  bindEvents();
  bootstrap();
});

function cacheDom() {
  dom.templateSelect = document.querySelector("#templateSelect");
  dom.layoutModeSelect = document.querySelector("#layoutModeSelect");
  dom.doubleSourceModeSelect = document.querySelector("#doubleSourceModeSelect");
  dom.rightTemplateSelect = document.querySelector("#rightTemplateSelect");
  dom.paperPresetSelect = document.querySelector("#paperPresetSelect");
  dom.paperMarginMmInput = document.querySelector("#paperMarginMmInput");
  dom.showCutMarksToggle = document.querySelector("#showCutMarksToggle");
  dom.newTemplateBtn = document.querySelector("#newTemplateBtn");
  dom.addComponentBtn = document.querySelector("#addComponentBtn");
  dom.undoBtn = document.querySelector("#undoBtn");
  dom.redoBtn = document.querySelector("#redoBtn");
  dom.resetTemplateBtn = document.querySelector("#resetTemplateBtn");
  dom.exportJsonBtn = document.querySelector("#exportJsonBtn");
  dom.importJsonInput = document.querySelector("#importJsonInput");
  dom.downloadPngBtn = document.querySelector("#downloadPngBtn");
  dom.downloadPdfBtn = document.querySelector("#downloadPdfBtn");
  dom.downloadDocxBtn = document.querySelector("#downloadDocxBtn");
  dom.printBtn = document.querySelector("#printBtn");
  dom.builderPanel = document.querySelector("#builderPanel");
  dom.builderTemplateName = document.querySelector("#builderTemplateName");
  dom.builderTemplateCategory = document.querySelector("#builderTemplateCategory");
  dom.builderTemplateWidth = document.querySelector("#builderTemplateWidth");
  dom.builderTemplateHeight = document.querySelector("#builderTemplateHeight");
  dom.builderCloneCurrent = document.querySelector("#builderCloneCurrent");
  dom.builderCreateTemplateBtn = document.querySelector("#builderCreateTemplateBtn");
  dom.builderComponentType = document.querySelector("#builderComponentType");
  dom.builderComponentLabel = document.querySelector("#builderComponentLabel");
  dom.builderAddComponentBtn = document.querySelector("#builderAddComponentBtn");
  dom.editorList = document.querySelector("#editorList");
  dom.workspace = document.querySelector("#workspace");
  dom.previewStage = document.querySelector("#previewStage");
  dom.layoutSheet = document.querySelector("#layoutSheet");
  dom.canvas = document.querySelector("#invitationCanvas");
  dom.canvasMirror = document.querySelector("#invitationCanvasMirror");
  dom.linkLayer = document.querySelector("#linkLayer");
  dom.statusText = document.querySelector("#statusText");
  dom.metaText = document.querySelector("#metaText");
  dom.printPageStyle = document.querySelector("#dynamicPrintPageStyle");
  if (!dom.printPageStyle) {
    dom.printPageStyle = document.createElement("style");
    dom.printPageStyle.id = "dynamicPrintPageStyle";
    document.head.appendChild(dom.printPageStyle);
  }
}

function bindEvents() {
  dom.templateSelect.addEventListener("change", (event) => activateTemplate(event.target.value));
  dom.layoutModeSelect.addEventListener("change", (event) => setLayoutMode(event.target.value, true));
  dom.doubleSourceModeSelect.addEventListener("change", (event) => setDoubleSourceMode(event.target.value, true));
  dom.rightTemplateSelect.addEventListener("change", (event) => setRightTemplateId(event.target.value, true));
  dom.paperPresetSelect.addEventListener("change", (event) => setPaperPreset(event.target.value, true));
  dom.paperMarginMmInput.addEventListener("input", (event) => setPaperMarginMm(event.target.value, true));
  dom.showCutMarksToggle.addEventListener("change", (event) => setShowCutMarks(Boolean(event.target.checked), true));
  dom.newTemplateBtn.addEventListener("click", createNewTemplate);
  dom.addComponentBtn.addEventListener("click", addNewComponent);
  dom.builderCreateTemplateBtn.addEventListener("click", createNewTemplateFromBuilder);
  dom.builderAddComponentBtn.addEventListener("click", addNewComponentFromBuilder);
  dom.undoBtn.addEventListener("click", undoDraft);
  dom.redoBtn.addEventListener("click", redoDraft);
  dom.resetTemplateBtn.addEventListener("click", resetTemplate);
  dom.exportJsonBtn.addEventListener("click", exportCurrentDraftAsJson);
  dom.importJsonInput.addEventListener("change", importDraftFromFile);
  dom.downloadPngBtn.addEventListener("click", exportCurrentDraftAsPng);
  dom.downloadPdfBtn.addEventListener("click", exportCurrentDraftAsPdf);
  dom.downloadDocxBtn.addEventListener("click", exportCurrentDraftAsDocx);
  dom.printBtn.addEventListener("click", () => window.print());

  dom.editorList.addEventListener("input", handleEditorInput);
  dom.editorList.addEventListener("change", handleEditorChange);
  dom.editorList.addEventListener("click", handleEditorClick);
  dom.editorList.addEventListener("focusin", handleEditorFocusIn);
  dom.editorList.addEventListener("scroll", queueConnectorDraw);

  dom.previewStage.addEventListener("scroll", queueConnectorDraw);
  dom.canvas.addEventListener("pointermove", handleCanvasPointerMove);
  dom.canvas.addEventListener("pointerup", stopDragging);
  dom.canvas.addEventListener("pointercancel", stopDragging);

  document.addEventListener("keydown", handleKeyboardShortcuts);

  window.addEventListener("resize", () => {
    updateCanvasScale();
    queueConnectorDraw();
  });
  document.addEventListener("scroll", queueConnectorDraw, true);
}

async function bootstrap() {
  try {
    const response = await fetch("/api/templates", { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`Gagal memuat API template (${response.status})`);
    }
    const payload = await response.json();
    const baseTemplates = Array.isArray(payload.templates) ? payload.templates : [];
    const normalizedBaseTemplates = baseTemplates.map((template, index) =>
      normalizeTemplate({ ...template, isCustom: false }, index)
    );
    const customTemplates = loadCustomTemplates();
    state.templates = [...normalizedBaseTemplates, ...customTemplates];

    const rememberedLayout = getStorage(storageKey("layoutMode"));
    state.layoutMode = rememberedLayout === "double-horizontal" ? "double-horizontal" : "single";
    const rememberedSourceMode = getStorage(storageKey("doubleSourceMode"));
    state.doubleSourceMode = rememberedSourceMode === "different" ? "different" : "same";
    const rememberedRightTemplateId = getStorage(storageKey("rightTemplateId"));
    state.rightTemplateId = rememberedRightTemplateId || null;
    const rememberedPaperPreset = getStorage(storageKey("paperPreset"));
    state.paperPreset = PAPER_PRESETS[rememberedPaperPreset] ? rememberedPaperPreset : "auto";
    const rememberedMargin = getStorage(storageKey("paperMarginMm"));
    state.paperMarginMm = clamp(toNumber(rememberedMargin, 8), 0, 50);
    const rememberedCutMarks = getStorage(storageKey("showCutMarks"));
    state.showCutMarks = rememberedCutMarks !== "false";

    dom.layoutModeSelect.value = state.layoutMode;
    dom.doubleSourceModeSelect.value = state.doubleSourceMode;
    dom.paperPresetSelect.value = state.paperPreset;
    dom.paperMarginMmInput.value = String(Math.round(state.paperMarginMm));
    dom.showCutMarksToggle.checked = state.showCutMarks;
    document.body.dataset.layoutMode = state.layoutMode;
    updatePrintPageCss();

    renderTemplateSelect();
    syncRightTemplateSelectOptions();
    syncLayoutDependentControls();
    const remembered = getStorage(storageKey("lastTemplateId"));
    const initialTemplate = state.templates.find((template) => template.id === remembered) || state.templates[0];
    if (!initialTemplate) {
      throw new Error("Template tidak ditemukan.");
    }
    activateTemplate(initialTemplate.id);

    state.researchCount = Array.isArray(payload.research_summary) ? payload.research_summary.length : 0;
    refreshMetaText();
  } catch (error) {
    setStatus(`Terjadi kesalahan: ${error.message}`);
    dom.metaText.textContent = "Periksa server Flask dan file data template.";
  }
}

function refreshMetaText() {
  const customCount = state.templates.filter((template) => template.isCustom).length;
  const layoutLabel = state.layoutMode === "double-horizontal" ? "2-up kiri-kanan" : "1-up";
  const sourceLabel = state.doubleSourceMode === "different" ? "beda isi" : "isi sama";
  const paperLabel = PAPER_PRESETS[state.paperPreset]?.label || "Auto";
  const markLabel = state.showCutMarks ? "cut marks on" : "cut marks off";
  dom.metaText.textContent = `${state.templates.length} template (${customCount} kustom) • ${state.researchCount} sumber • ${layoutLabel} (${sourceLabel}) • ${paperLabel}, margin ${Math.round(state.paperMarginMm)}mm, ${markLabel}`;
}

function setLayoutMode(mode, persist = false) {
  state.layoutMode = mode === "double-horizontal" ? "double-horizontal" : "single";
  document.body.dataset.layoutMode = state.layoutMode;
  dom.layoutModeSelect.value = state.layoutMode;
  if (persist) {
    setStorage(storageKey("layoutMode"), state.layoutMode);
  }
  if (state.draft) {
    renderCanvas();
    updateCanvasScale();
    ensureSelectedComponentInPreview("auto");
    queueConnectorDraw();
  }
  syncLayoutDependentControls();
  refreshMetaText();
}

function setDoubleSourceMode(mode, persist = false) {
  state.doubleSourceMode = mode === "different" ? "different" : "same";
  dom.doubleSourceModeSelect.value = state.doubleSourceMode;
  if (persist) {
    setStorage(storageKey("doubleSourceMode"), state.doubleSourceMode);
  }
  syncLayoutDependentControls();
  if (state.draft) {
    renderCanvas();
    updateCanvasScale();
    ensureSelectedComponentInPreview("auto");
  }
  refreshMetaText();
}

function setRightTemplateId(templateId, persist = false) {
  state.rightTemplateId = templateId || null;
  if (persist) {
    setStorage(storageKey("rightTemplateId"), state.rightTemplateId || "");
  }
  if (state.draft) {
    renderCanvas();
    updateCanvasScale();
    ensureSelectedComponentInPreview("auto");
  }
  refreshMetaText();
}

function setPaperPreset(preset, persist = false) {
  state.paperPreset = PAPER_PRESETS[preset] ? preset : "auto";
  dom.paperPresetSelect.value = state.paperPreset;
  if (persist) {
    setStorage(storageKey("paperPreset"), state.paperPreset);
  }
  if (state.draft) {
    updateCanvasScale();
    ensureSelectedComponentInPreview("auto");
  }
  updatePrintPageCss();
  refreshMetaText();
}

function setPaperMarginMm(value, persist = false) {
  state.paperMarginMm = clamp(toNumber(value, state.paperMarginMm), 0, 50);
  dom.paperMarginMmInput.value = String(Math.round(state.paperMarginMm));
  if (persist) {
    setStorage(storageKey("paperMarginMm"), String(state.paperMarginMm));
  }
  if (state.draft) {
    updateCanvasScale();
    ensureSelectedComponentInPreview("auto");
  }
  updatePrintPageCss();
  refreshMetaText();
}

function setShowCutMarks(flag, persist = false) {
  state.showCutMarks = Boolean(flag);
  dom.showCutMarksToggle.checked = state.showCutMarks;
  if (persist) {
    setStorage(storageKey("showCutMarks"), state.showCutMarks ? "true" : "false");
  }
  refreshMetaText();
}

function syncLayoutDependentControls() {
  const isDouble = state.layoutMode === "double-horizontal";
  dom.doubleSourceModeSelect.hidden = !isDouble;
  const sourceLabel = document.querySelector('label[for="doubleSourceModeSelect"]');
  if (sourceLabel) {
    sourceLabel.hidden = !isDouble;
  }
  const showRight = isDouble && state.doubleSourceMode === "different";
  dom.rightTemplateSelect.hidden = !showRight;
  const rightLabel = document.querySelector('label[for="rightTemplateSelect"]');
  if (rightLabel) {
    rightLabel.hidden = !showRight;
  }
}

function updatePrintPageCss() {
  const preset = getPaperPresetDimensions(state.paperPreset);
  if (!preset) {
    dom.printPageStyle.textContent = "";
    return;
  }
  const widthMm = cssPxToMm(preset.widthPx).toFixed(2);
  const heightMm = cssPxToMm(preset.heightPx).toFixed(2);
  const marginMm = clamp(toNumber(state.paperMarginMm, 8), 0, 50).toFixed(1);
  dom.printPageStyle.textContent = `@media print { @page { size: ${widthMm}mm ${heightMm}mm; margin: ${marginMm}mm; } }`;
}

function normalizeTemplate(template, index) {
  const fallbackId = `template_${index + 1}`;
  const paper = template.paper || {};
  return {
    id: template.id || fallbackId,
    name: template.name || `Template ${index + 1}`,
    category: template.category || "Umum",
    isCustom: Boolean(template.isCustom),
    paper: {
      width: toPositiveInt(paper.width, 900),
      height: toPositiveInt(paper.height, 1240),
      background: paper.background || "#ffffff",
      borderColor: paper.borderColor || "#d7d7d7",
      accentColor: paper.accentColor || "#6f988d"
    },
    components: Array.isArray(template.components)
      ? template.components.map((component, cIndex) => normalizeComponent(component, cIndex))
      : []
  };
}

function mergeMissingComponentsFromBaseTemplate(draftTemplate, baseTemplate) {
  if (!draftTemplate || !baseTemplate) {
    return false;
  }
  if (!Array.isArray(draftTemplate.components) || !Array.isArray(baseTemplate.components)) {
    return false;
  }
  const existingIds = new Set(
    draftTemplate.components.map((component) => component?.id).filter((id) => typeof id === "string" && id)
  );
  const missing = baseTemplate.components
    .filter((component) => component && typeof component.id === "string" && !existingIds.has(component.id))
    .map((component, idx) => normalizeComponent(component, draftTemplate.components.length + idx));
  if (missing.length === 0) {
    return false;
  }
  draftTemplate.components.push(...missing);
  return true;
}

function normalizeComponent(component, index) {
  const style = component.style || {};
  const type = component.type || "text";
  const fallbackWidth = type === "line" ? 680 : type === "text" ? 260 : 120;
  const fallbackHeight = type === "line" ? 4 : type === "text" ? 60 : 120;
  const defaultColor = type === "line" ? "#000000" : "#2f403c";
  const defaultRadius = type === "line" ? 0 : 8;
  return {
    id: component.id || `komponen_${index + 1}`,
    label: component.label || `Komponen ${index + 1}`,
    type,
    value: typeof component.value === "string" ? component.value : "",
    placeholder: component.placeholder || component.label || "Komponen",
    x: toInt(component.x, 60),
    y: toInt(component.y, 60),
    width: toPositiveInt(component.width, fallbackWidth),
    height: toPositiveInt(component.height, fallbackHeight),
    hidden: Boolean(component.hidden),
    style: {
      fontSize: toPositiveInt(style.fontSize, 18),
      fontWeight: toPositiveInt(style.fontWeight, 600),
      color: style.color || defaultColor,
      align: style.align || "left",
      fontFamily: normalizeFontFamilyToken(style.fontFamily),
      fit: style.fit || "contain",
      background: style.background || "#f3f8f6",
      borderRadius: toPositiveInt(style.borderRadius, defaultRadius)
    }
  };
}

function renderTemplateSelect() {
  dom.templateSelect.innerHTML = "";
  state.templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.isCustom
      ? `${template.name} (${template.category} • Kustom)`
      : `${template.name} (${template.category})`;
    dom.templateSelect.appendChild(option);
  });
  syncRightTemplateSelectOptions();
}

function syncRightTemplateSelectOptions() {
  if (!dom.rightTemplateSelect) {
    return;
  }

  const previous = state.rightTemplateId;
  dom.rightTemplateSelect.innerHTML = "";
  state.templates.forEach((template) => {
    const option = document.createElement("option");
    option.value = template.id;
    option.textContent = template.name;
    dom.rightTemplateSelect.appendChild(option);
  });

  let nextId = previous;
  if (!nextId || !state.templates.some((template) => template.id === nextId)) {
    nextId = pickDefaultRightTemplateId();
  }
  state.rightTemplateId = nextId;
  dom.rightTemplateSelect.value = nextId || "";
  setStorage(storageKey("rightTemplateId"), nextId || "");
}

function pickDefaultRightTemplateId() {
  if (state.templates.length === 0) {
    return null;
  }
  const nonCurrent = state.templates.find((template) => template.id !== state.currentTemplateId);
  return nonCurrent?.id || state.templates[0].id;
}

function getRightDraft() {
  if (!state.draft) {
    return null;
  }
  if (state.doubleSourceMode !== "different") {
    return state.draft;
  }
  const rightTemplate = state.templates.find((template) => template.id === state.rightTemplateId);
  if (!rightTemplate) {
    return state.draft;
  }
  if (rightTemplate.id === state.currentTemplateId) {
    return state.draft;
  }
  const savedDraft = getStorage(storageKey(`draft:${rightTemplate.id}`));
  if (savedDraft) {
    try {
      return normalizeTemplate(JSON.parse(savedDraft), 0);
    } catch {
      return deepClone(rightTemplate);
    }
  }
  return deepClone(rightTemplate);
}

function activateTemplate(templateId, forceBase = false) {
  const template = state.templates.find((item) => item.id === templateId);
  if (!template) {
    return;
  }

  state.currentTemplateId = template.id;
  setStorage(storageKey("lastTemplateId"), template.id);
  if (state.rightTemplateId === template.id && state.templates.length > 1) {
    state.rightTemplateId = pickDefaultRightTemplateId();
  }

  const savedDraft = forceBase ? null : getStorage(storageKey(`draft:${template.id}`));
  if (savedDraft) {
    try {
      state.draft = normalizeTemplate(JSON.parse(savedDraft), 0);
    } catch {
      state.draft = deepClone(template);
    }
  } else {
    state.draft = deepClone(template);
  }
  const mergedMissing = mergeMissingComponentsFromBaseTemplate(state.draft, template);
  if (mergedMissing) {
    setStorage(storageKey(`draft:${template.id}`), JSON.stringify(state.draft));
  }

  state.selectedComponentId = state.draft.components[0]?.id || null;
  state.pointerCache = {};
  state.drag = null;
  initHistory();

  dom.templateSelect.value = template.id;
  syncRightTemplateSelectOptions();
  renderCanvas();
  renderEditorCards();
  syncActiveClasses();
  updateCanvasScale();
  resetPreviewViewport();
  ensureSelectedComponentInPreview("auto");
  queueConnectorDraw();
  updateUndoRedoButtons();
  if (dom.builderTemplateWidth) {
    dom.builderTemplateWidth.value = String(state.draft.paper.width);
  }
  if (dom.builderTemplateHeight) {
    dom.builderTemplateHeight.value = String(state.draft.paper.height);
  }
  if (dom.builderTemplateName) {
    dom.builderTemplateName.value = state.draft.name || template.name;
  }
  if (dom.builderTemplateCategory) {
    dom.builderTemplateCategory.value = state.draft.category || template.category;
  }
  refreshMetaText();
  setStatus(`Template aktif: ${template.name}`);
}

function initHistory() {
  state.historyPast = [];
  state.historyFuture = [];
}

function updateUndoRedoButtons() {
  dom.undoBtn.disabled = state.historyPast.length === 0;
  dom.redoBtn.disabled = state.historyFuture.length === 0;
}

function takeSnapshot() {
  return state.draft ? JSON.stringify(state.draft) : "";
}

function commitHistory(beforeSnapshot) {
  const afterSnapshot = takeSnapshot();
  if (!beforeSnapshot || beforeSnapshot === afterSnapshot) {
    return;
  }
  state.historyPast.push(beforeSnapshot);
  if (state.historyPast.length > HISTORY_LIMIT) {
    state.historyPast.shift();
  }
  state.historyFuture = [];
  updateUndoRedoButtons();
}

function undoDraft() {
  if (!state.draft || state.historyPast.length === 0) {
    return;
  }
  const currentSnapshot = takeSnapshot();
  const previousSnapshot = state.historyPast.pop();
  state.historyFuture.push(currentSnapshot);
  state.draft = normalizeTemplate(JSON.parse(previousSnapshot), 0);
  restoreDraftAfterHistory();
  updateUndoRedoButtons();
  setStatus("Undo berhasil.");
}

function redoDraft() {
  if (!state.draft || state.historyFuture.length === 0) {
    return;
  }
  const currentSnapshot = takeSnapshot();
  const nextSnapshot = state.historyFuture.pop();
  state.historyPast.push(currentSnapshot);
  state.draft = normalizeTemplate(JSON.parse(nextSnapshot), 0);
  restoreDraftAfterHistory();
  updateUndoRedoButtons();
  setStatus("Redo berhasil.");
}

function restoreDraftAfterHistory() {
  const selected = state.selectedComponentId;
  const selectedExists = state.draft.components.some((component) => component.id === selected);
  state.selectedComponentId = selectedExists ? selected : state.draft.components[0]?.id || null;
  renderCanvas();
  renderEditorCards();
  syncActiveClasses();
  updateCanvasScale();
  queueConnectorDraw();
  queuePersist();
}

function resetTemplate() {
  if (!state.currentTemplateId) {
    return;
  }
  removeStorage(storageKey(`draft:${state.currentTemplateId}`));
  activateTemplate(state.currentTemplateId, true);
  setStatus("Template direset ke versi default.");
}

function createNewTemplate() {
  const details = dom.builderPanel?.querySelector("details");
  if (details && !details.open) {
    details.open = true;
  }
  dom.builderTemplateName?.focus();
  dom.builderTemplateName?.select();
  setStatus("Isi parameter di Template Builder Visual, lalu klik 'Buat Template'.");
}

function createNewTemplateFromBuilder() {
  const name = (dom.builderTemplateName?.value || "").trim() || "Template Kustom";
  const category = (dom.builderTemplateCategory?.value || "").trim() || "Kustom";
  const width = clamp(toPositiveInt(dom.builderTemplateWidth?.value, 900), 400, 2200);
  const height = clamp(toPositiveInt(dom.builderTemplateHeight?.value, 1240), 500, 3000);
  const cloneCurrent = Boolean(dom.builderCloneCurrent?.checked);

  const templateId = generateUniqueTemplateId(name);
  const baseComponents = cloneCurrent && state.draft
    ? deepClone(state.draft.components)
    : buildBlankComponents(width);

  const template = normalizeTemplate(
    {
      id: templateId,
      name,
      category,
      isCustom: true,
      paper: {
        width,
        height,
        background: "#fffdf9",
        borderColor: "#d8d7d2",
        accentColor: "#6f988d"
      },
      components: baseComponents
    },
    state.templates.length
  );

  state.templates.push(template);
  saveCustomTemplates();
  renderTemplateSelect();
  refreshMetaText();
  activateTemplate(template.id, true);
  queuePersist();
  setStatus(`Template kustom dibuat: ${template.name}`);
}

function addNewComponent() {
  const details = dom.builderPanel?.querySelector("details");
  if (details && !details.open) {
    details.open = true;
  }
  dom.builderComponentLabel?.focus();
  dom.builderComponentLabel?.select();
  setStatus("Isi tipe + nama komponen di Template Builder Visual, lalu klik 'Tambah Komponen'.");
}

function addNewComponentFromBuilder() {
  if (!state.draft) {
    return;
  }

  const type = (dom.builderComponentType?.value || "text").trim().toLowerCase();
  if (!["text", "multiline", "image", "signature", "line"].includes(type)) {
    setStatus("Tipe komponen tidak valid.");
    return;
  }

  const label = (dom.builderComponentLabel?.value || "").trim() || "Komponen Baru";
  const componentId = generateUniqueComponentId(state.draft.components, label);

  const paperWidth = state.draft.paper.width;
  const baseWidth = type === "line" ? 780 : type === "text" ? 320 : type === "multiline" ? 360 : 220;
  const baseHeight = type === "line" ? 4 : type === "text" ? 52 : type === "multiline" ? 108 : 140;
  const targetX = Math.max(20, Math.round((paperWidth - baseWidth) / 2));

  const component = normalizeComponent(
    {
      id: componentId,
      label,
      type,
      value: type === "text" || type === "multiline" ? label : "",
      placeholder: label,
      x: targetX,
      y: 80,
      width: baseWidth,
      height: baseHeight,
      style: {
        fontSize: type === "text" ? 26 : 18,
        fontWeight: 600,
        color: type === "line" ? "#000000" : "#2f403c",
        align: "left",
        fontFamily: "times-new-roman",
        fit: "contain",
        background: type === "line" ? "transparent" : "#f3f8f6",
        borderRadius: type === "line" ? 0 : 8
      }
    },
    state.draft.components.length + 1
  );

  const beforeSnapshot = takeSnapshot();
  state.draft.components.push(component);
  state.selectedComponentId = component.id;
  renderCanvas();
  renderEditorCards();
  syncActiveClasses();
  queueConnectorDraw();
  commitHistory(beforeSnapshot);
  queuePersist();
  setStatus(`Komponen ditambahkan: ${component.label}`);
  if (dom.builderComponentLabel) {
    dom.builderComponentLabel.value = "Komponen Baru";
  }
}

function buildBlankComponents(paperWidth) {
  const centerX = Math.max(60, Math.round((paperWidth - 540) / 2));
  return [
    {
      id: "judul_utama",
      label: "Judul Undangan",
      type: "text",
      value: "Undangan Acara",
      x: centerX,
      y: 130,
      width: 540,
      height: 68,
      style: {
        fontSize: 48,
        fontWeight: 700,
        color: "#2f403c",
        align: "center",
        fontFamily: "display",
        borderRadius: 8
      }
    },
    {
      id: "isi_singkat",
      label: "Isi Singkat",
      type: "multiline",
      value: "Silakan edit isi undangan ini dari panel kiri.",
      x: centerX,
      y: 230,
      width: 540,
      height: 120,
      style: {
        fontSize: 22,
        fontWeight: 500,
        color: "#3d4d49",
        align: "center",
        fontFamily: "times-new-roman",
        borderRadius: 8
      }
    }
  ];
}

function generateUniqueTemplateId(name) {
  const base = slugify(name) || "template-kustom";
  let id = `custom_${base}`;
  let counter = 2;
  while (state.templates.some((template) => template.id === id)) {
    id = `custom_${base}_${counter}`;
    counter += 1;
  }
  return id;
}

function generateUniqueComponentId(components, label) {
  const base = slugify(label) || "komponen";
  let id = base;
  let counter = 2;
  while (components.some((component) => component.id === id)) {
    id = `${base}_${counter}`;
    counter += 1;
  }
  return id;
}

function renderCanvas() {
  if (!state.draft) {
    return;
  }

  const leftDraft = state.draft;
  const rightDraft = getRightDraft() || leftDraft;
  const isDouble = state.layoutMode === "double-horizontal";
  dom.layoutSheet.classList.toggle("layout-single", !isDouble);
  dom.layoutSheet.classList.toggle("layout-double", isDouble);

  renderCanvasInstance(dom.canvas, leftDraft, true);
  renderCanvasInstance(dom.canvasMirror, rightDraft, false);
  dom.canvasMirror.style.display = isDouble ? "block" : "none";
}

function renderCanvasInstance(canvasElement, draftData, interactive) {
  if (!draftData) {
    canvasElement.innerHTML = "";
    return;
  }
  const paper = draftData.paper;
  canvasElement.style.setProperty("--paper-width", `${paper.width}px`);
  canvasElement.style.setProperty("--paper-height", `${paper.height}px`);
  canvasElement.style.setProperty("--paper-bg", paper.background);
  canvasElement.style.setProperty("--paper-border", paper.borderColor);
  canvasElement.style.setProperty("--paper-accent", paper.accentColor);
  canvasElement.innerHTML = "";

  draftData.components.forEach((component) => {
    const element = document.createElement("div");
    element.className = `preview-component component-${component.type}`;
    element.dataset.componentId = component.id;
    const content = document.createElement("div");
    content.className = "component-content";
    const sizeIndicator = document.createElement("div");
    sizeIndicator.className = "component-size-indicator";
    sizeIndicator.setAttribute("aria-hidden", "true");
    element.appendChild(content);
    element.appendChild(sizeIndicator);
    if (interactive) {
      element.addEventListener("pointerdown", handleComponentPointerDown);
      attachResizeHandles(element);
    } else {
      element.classList.remove("is-active");
      element.classList.remove("is-resizing");
      element.style.pointerEvents = "none";
    }
    applyComponentToElement(component, element);
    canvasElement.appendChild(element);
  });
}

function attachResizeHandles(componentElement) {
  const directions = componentElement.classList.contains("component-line")
    ? ["w", "e"]
    : RESIZE_DIRECTIONS;
  directions.forEach((dir) => {
    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = `resize-handle resize-${dir}`;
    handle.dataset.dir = dir;
    handle.setAttribute("aria-label", `Resize ${dir}`);
    handle.addEventListener("pointerdown", handleResizePointerDown);
    componentElement.appendChild(handle);
  });
}

function renderEditorCards() {
  if (!state.draft) {
    return;
  }
  dom.editorList.innerHTML = "";
  state.draft.components.forEach((component) => {
    dom.editorList.appendChild(buildEditorCard(component));
  });
}

function buildEditorCard(component) {
  const card = document.createElement("article");
  card.className = "editor-card";
  card.dataset.componentId = component.id;
  const isText = TEXT_TYPES.has(component.type);
  const isImage = IMAGE_TYPES.has(component.type);
  const isLine = LINE_TYPES.has(component.type);
  const contentInput = isText
    ? `<textarea data-component-id="${component.id}" data-field="value">${escapeHtml(component.value)}</textarea>`
    : `<input data-component-id="${component.id}" data-field="value" type="text" value="${escapeHtml(component.value)}" placeholder="URL gambar/data-url (opsional)">`;
  const contentFieldHtml = isLine
    ? ""
    : `
    <div class="field">
      <label>Konten</label>
      ${contentInput}
    </div>`;

  const typeStyleFieldsHtml = isText
    ? `
      <div class="field">
        <label>Ukuran Font (px)</label>
        <input data-component-id="${component.id}" data-style-field="fontSize" type="number" min="8" max="220" value="${toPositiveInt(component.style.fontSize, 18)}">
      </div>
      <div class="field">
        <label>Bobot Font</label>
        <select data-component-id="${component.id}" data-style-field="fontWeight">
          <option value="400" ${component.style.fontWeight <= 450 ? "selected" : ""}>400</option>
          <option value="500" ${component.style.fontWeight > 450 && component.style.fontWeight <= 550 ? "selected" : ""}>500</option>
          <option value="600" ${component.style.fontWeight > 550 && component.style.fontWeight <= 650 ? "selected" : ""}>600</option>
          <option value="700" ${component.style.fontWeight > 650 ? "selected" : ""}>700</option>
        </select>
      </div>
      <div class="field inline-grid">
        <div>
          <label>Warna Teks</label>
          <input data-component-id="${component.id}" data-style-field="color" type="color" value="${toColorInput(component.style.color)}">
        </div>
        <div>
          <label>Rata Teks</label>
          <select data-component-id="${component.id}" data-style-field="align">
            <option value="left" ${component.style.align === "left" ? "selected" : ""}>Kiri</option>
            <option value="center" ${component.style.align === "center" ? "selected" : ""}>Tengah</option>
            <option value="right" ${component.style.align === "right" ? "selected" : ""}>Kanan</option>
            <option value="justify" ${component.style.align === "justify" ? "selected" : ""}>Rata Kiri-Kanan</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Keluarga Font</label>
        <select data-component-id="${component.id}" data-style-field="fontFamily">
          ${buildFontFamilyOptions(component.style.fontFamily)}
        </select>
      </div>`
    : isImage
      ? `
      <div class="field inline-grid">
        <div>
          <label>Mode Gambar</label>
          <select data-component-id="${component.id}" data-style-field="fit">
            <option value="contain" ${component.style.fit === "contain" ? "selected" : ""}>Contain</option>
            <option value="cover" ${component.style.fit === "cover" ? "selected" : ""}>Cover</option>
            <option value="fill" ${component.style.fit === "fill" ? "selected" : ""}>Fill</option>
          </select>
        </div>
        <div>
          <label>Sudut</label>
          <input data-component-id="${component.id}" data-style-field="borderRadius" type="number" min="0" max="80" value="${component.style.borderRadius}">
        </div>
      </div>`
      : `
      <div class="field inline-grid">
        <div>
          <label>Warna Garis</label>
          <input data-component-id="${component.id}" data-style-field="color" type="color" value="${toColorInput(component.style.color || "#000000")}">
        </div>
        <div>
          <label>Ketebalan (px)</label>
          <input data-component-id="${component.id}" data-field="lineThickness" type="number" min="1" max="60" value="${clamp(toPositiveInt(component.height, 4), 1, 60)}">
        </div>
      </div>
      <div class="field helper-note">
        <small>Panjang garis: tarik handle kiri atau kanan di canvas.</small>
      </div>`;

  card.innerHTML = `
    <div class="editor-card-head">
      <strong>${escapeHtml(component.label)}</strong>
      <span class="tag">${escapeHtml(component.type)}</span>
    </div>
    <div class="field">
      <label>Nama Komponen</label>
      <input data-component-id="${component.id}" data-field="label" type="text" value="${escapeHtml(component.label)}">
    </div>
    ${contentFieldHtml}
    ${
      isImage
        ? `
      <div class="field">
        <label>Upload Gambar (logo / tanda tangan)</label>
        <input data-component-id="${component.id}" data-image-upload="1" type="file" accept="image/*">
      </div>
      <div class="field inline-actions">
        <button class="mini-btn" type="button" data-action="focus" data-component-id="${component.id}">Fokus</button>
        <button class="mini-btn danger" type="button" data-action="clear-image" data-component-id="${component.id}">Hapus Gambar</button>
      </div>`
        : ""
    }
    ${typeStyleFieldsHtml}
    <div class="field inline-grid">
      <div><label>X</label><input data-component-id="${component.id}" data-field="x" type="number" value="${component.x}"></div>
      <div><label>Y</label><input data-component-id="${component.id}" data-field="y" type="number" value="${component.y}"></div>
    </div>
    <div class="field">
      <label>
        <input data-component-id="${component.id}" data-field="visible" type="checkbox" ${component.hidden ? "" : "checked"}>
        Komponen tampil
      </label>
    </div>
  `;
  return card;
}

function handleEditorInput(event) {
  const target = event.target;
  const componentId = target.dataset.componentId;
  if (!componentId || !state.draft) {
    return;
  }
  const component = findComponent(componentId);
  if (!component) {
    return;
  }

  const beforeSnapshot = takeSnapshot();
  if (target.dataset.field) {
    applyFieldUpdate(component, target.dataset.field, target);
  }
  if (target.dataset.styleField) {
    applyStyleUpdate(component, target.dataset.styleField, target);
  }
  updateComponent(component);
  if (target.dataset.field === "label") {
    syncEditorCardHeading(component);
  }
  selectComponent(component.id, {
    scrollToPreview: true,
    previewBehavior: "auto"
  });
  commitHistory(beforeSnapshot);
  queuePersist();
}

function handleEditorChange(event) {
  const target = event.target;
  if (target.dataset.imageUpload !== "1") {
    return;
  }
  const component = findComponent(target.dataset.componentId);
  const file = target.files?.[0];
  if (!component || !file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const beforeSnapshot = takeSnapshot();
    component.value = typeof reader.result === "string" ? reader.result : "";
    updateComponent(component);
    selectComponent(component.id, {
      scrollToPreview: true,
      previewBehavior: "auto"
    });
    commitHistory(beforeSnapshot);
    queuePersist();
    setStatus(`Gambar diperbarui: ${component.label}`);
  };
  reader.readAsDataURL(file);
}

function handleEditorClick(event) {
  const actionButton = event.target.closest("button[data-action]");
  const card = event.target.closest(".editor-card");
  if (card?.dataset.componentId) {
    selectComponent(card.dataset.componentId, {
      scrollToPreview: true,
      previewBehavior: "smooth"
    });
  }
  if (!actionButton) {
    return;
  }
  const component = findComponent(actionButton.dataset.componentId);
  if (!component) {
    return;
  }
  const action = actionButton.dataset.action;
  if (action === "focus") {
    selectComponent(component.id, {
      scrollToCard: true,
      scrollToPreview: true,
      previewBehavior: "smooth"
    });
    return;
  }
  if (action === "clear-image") {
    const beforeSnapshot = takeSnapshot();
    component.value = "";
    updateComponent(component);
    commitHistory(beforeSnapshot);
    queuePersist();
  }
}

function applyFieldUpdate(component, field, input) {
  if (field === "label") {
    const nextLabel = input.value.trim();
    if (nextLabel) {
      component.label = nextLabel;
    }
    return;
  }
  if (field === "value") {
    component.value = input.value;
    return;
  }
  if (field === "x" || field === "y") {
    component[field] = toInt(input.value, component[field]);
    return;
  }
  if (field === "lineThickness") {
    component.height = clamp(toPositiveInt(input.value, component.height), 1, 60);
    return;
  }
  if (field === "width" || field === "height") {
    component[field] = toPositiveInt(input.value, component[field]);
    return;
  }
  if (field === "visible") {
    component.hidden = !input.checked;
  }
}

function applyStyleUpdate(component, styleField, input) {
  if (!component.style) {
    component.style = {};
  }
  if (styleField === "fontSize" || styleField === "fontWeight" || styleField === "borderRadius") {
    component.style[styleField] = toPositiveInt(input.value, component.style[styleField]);
    return;
  }
  component.style[styleField] = input.value;
}

function handleComponentPointerDown(event) {
  if (event.pointerType !== "touch" && event.button !== 0) {
    return;
  }
  const componentId = event.currentTarget.dataset.componentId;
  const component = findComponent(componentId);
  if (!component) {
    return;
  }
  selectComponent(componentId, false);

  cachePointer(event, componentId);
  if (event.pointerType === "touch") {
    maybeStartPinch(component);
    if (state.drag?.mode === "pinch") {
      return;
    }
  }

  const scale = getPreviewScale();
  const canvasRect = dom.canvas.getBoundingClientRect();
  const pointerX = (event.clientX - canvasRect.left) / scale;
  const pointerY = (event.clientY - canvasRect.top) / scale;
  state.drag = {
    mode: "move",
    pointerId: event.pointerId,
    componentId,
    offsetX: pointerX - component.x,
    offsetY: pointerY - component.y,
    startClientX: event.clientX,
    startClientY: event.clientY,
    moved: false,
    startSnapshot: takeSnapshot()
  };
  event.currentTarget.setPointerCapture(event.pointerId);
}

function handleResizePointerDown(event) {
  event.preventDefault();
  event.stopPropagation();
  const handle = event.currentTarget;
  const componentElement = handle.closest(".preview-component");
  const componentId = componentElement?.dataset.componentId;
  if (!componentId) {
    return;
  }
  const component = findComponent(componentId);
  if (!component) {
    return;
  }
  selectComponent(componentId, false);

  state.drag = {
    mode: "resize",
    dir: handle.dataset.dir || "se",
    pointerId: event.pointerId,
    componentId,
    startX: event.clientX,
    startY: event.clientY,
    startClientX: event.clientX,
    startClientY: event.clientY,
    moved: false,
    originX: component.x,
    originY: component.y,
    originWidth: component.width,
    originHeight: component.height,
    startSnapshot: takeSnapshot()
  };
  syncActiveClasses();
  handle.setPointerCapture(event.pointerId);
}

function handleCanvasPointerMove(event) {
  if (!state.draft) {
    return;
  }
  updateCachedPointer(event);

  if (!state.drag) {
    return;
  }
  const component = findComponent(state.drag.componentId);
  if (!component) {
    return;
  }

  if (state.drag.mode === "pinch") {
    state.drag.moved = true;
    applyPinchResize(component);
    updateComponent(component);
    queuePersist();
    return;
  }

  if (state.drag.pointerId !== event.pointerId) {
    return;
  }

  if (
    Math.abs(event.clientX - toNumber(state.drag.startClientX, event.clientX)) > 2 ||
    Math.abs(event.clientY - toNumber(state.drag.startClientY, event.clientY)) > 2
  ) {
    state.drag.moved = true;
  }

  const scale = getPreviewScale();
  if (state.drag.mode === "move") {
    const canvasRect = dom.canvas.getBoundingClientRect();
    const pointerX = (event.clientX - canvasRect.left) / scale;
    const pointerY = (event.clientY - canvasRect.top) / scale;
    const maxX = Math.max(0, state.draft.paper.width - component.width);
    const maxY = Math.max(0, state.draft.paper.height - component.height);
    component.x = clamp(Math.round(pointerX - state.drag.offsetX), 0, maxX);
    component.y = clamp(Math.round(pointerY - state.drag.offsetY), 0, maxY);
    updateComponent(component);
    syncPositionInputs(component);
    queuePersist();
    return;
  }

  if (state.drag.mode === "resize") {
    const dx = (event.clientX - state.drag.startX) / scale;
    const dy = (event.clientY - state.drag.startY) / scale;
    const nextBox = calculateResizeBoxFromDrag(state.drag, dx, dy);
    component.x = nextBox.x;
    component.y = nextBox.y;
    applyComponentResize(component, nextBox.width, nextBox.height);
    updateComponent(component);
    syncPositionInputs(component);
    queuePersist();
  }
}

function stopDragging(event) {
  releaseCachedPointer(event.pointerId);
  if (!state.drag) {
    return;
  }
  if (state.drag.mode === "pinch") {
    const points = getPointersForComponent(state.drag.componentId);
    if (points.length >= 2) {
      return;
    }
  } else if (state.drag.pointerId !== event.pointerId) {
    return;
  }
  const completedDrag = state.drag;
  const shouldFocusEditorCard = completedDrag.mode === "move" && !completedDrag.moved;
  commitHistory(completedDrag.startSnapshot);
  state.drag = null;
  syncActiveClasses();
  if (shouldFocusEditorCard) {
    selectComponent(completedDrag.componentId, {
      scrollToCard: true,
      scrollToPreview: false
    });
    pulseEditorCard(completedDrag.componentId);
  }
  queuePersist();
}

function handleKeyboardShortcuts(event) {
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }
  const key = event.key.toLowerCase();
  if (key === "z" && !event.shiftKey) {
    event.preventDefault();
    undoDraft();
    return;
  }
  if (key === "y" || (key === "z" && event.shiftKey)) {
    event.preventDefault();
    redoDraft();
  }
}

function updateComponent(component) {
  const selector = `.preview-component[data-component-id="${cssEscape(component.id)}"]`;
  const element = dom.canvas.querySelector(selector);
  if (!element) {
    renderCanvas();
    return;
  }
  applyComponentToElement(component, element);
  const rightDraft = getRightDraft();
  if (state.layoutMode === "double-horizontal" && rightDraft && rightDraft.id !== state.draft.id) {
    renderCanvasInstance(dom.canvasMirror, rightDraft, false);
  } else {
    const mirrorElement = dom.canvasMirror.querySelector(selector);
    if (mirrorElement) {
      applyComponentToElement(component, mirrorElement);
      mirrorElement.classList.remove("is-active");
    }
  }
  queueConnectorDraw();
}

function applyComponentToElement(component, element) {
  const content = element.querySelector(".component-content") || element;
  element.style.left = `${component.x}px`;
  element.style.top = `${component.y}px`;
  element.style.width = `${component.width}px`;
  element.style.height = `${component.height}px`;
  element.style.borderRadius = `${toPositiveInt(component.style.borderRadius, 8)}px`;
  element.style.fontSize = "";
  element.style.fontWeight = "";
  element.style.color = "";
  element.style.textAlign = "";
  element.style.fontFamily = "";
  element.style.background = "transparent";
  content.innerHTML = "";

  if (LINE_TYPES.has(component.type)) {
    const lineStroke = document.createElement("div");
    lineStroke.className = "line-stroke";
    lineStroke.style.background = component.style.color || "#000000";
    lineStroke.style.borderRadius = `${toPositiveInt(component.style.borderRadius, 0)}px`;
    content.appendChild(lineStroke);
  } else if (TEXT_TYPES.has(component.type)) {
    element.style.fontSize = `${toPositiveInt(component.style.fontSize, 18)}px`;
    element.style.fontWeight = `${toPositiveInt(component.style.fontWeight, 600)}`;
    element.style.color = component.style.color || "#2f403c";
    element.style.textAlign = component.style.align || "left";
    element.style.fontFamily = resolveCssFont(component.style.fontFamily);
    content.textContent = component.value || component.placeholder || component.label;
  } else if (IMAGE_TYPES.has(component.type)) {
    element.style.background = component.style.background || "#f3f8f6";
    if (component.value) {
      const image = document.createElement("img");
      image.src = component.value;
      image.alt = component.label;
      image.style.objectFit = component.style.fit || "contain";
      content.appendChild(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "component-placeholder";
      placeholder.textContent = component.placeholder || component.label;
      content.appendChild(placeholder);
    }
  } else {
    content.textContent = component.value || component.label;
  }

  const sizeIndicator = element.querySelector(".component-size-indicator");
  if (sizeIndicator) {
    sizeIndicator.textContent = `${Math.round(component.width)} x ${Math.round(component.height)} px`;
  }
  element.classList.toggle("is-hidden", component.hidden);
  const isActive = component.id === state.selectedComponentId;
  const isResizing =
    isActive &&
    state.drag &&
    (state.drag.mode === "resize" || state.drag.mode === "pinch") &&
    state.drag.componentId === component.id;
  element.classList.toggle("is-active", isActive);
  element.classList.toggle("is-resizing", Boolean(isResizing));
}

function handleEditorFocusIn(event) {
  const componentId = event.target?.dataset?.componentId;
  if (!componentId) {
    return;
  }
  selectComponent(componentId, {
    scrollToPreview: true,
    previewBehavior: "smooth"
  });
}

function selectComponent(componentId, options = {}) {
  if (!componentId) {
    return;
  }
  const selectionOptions = normalizeSelectionOptions(options);
  state.selectedComponentId = componentId;
  syncActiveClasses();
  if (selectionOptions.scrollToCard) {
    const card = dom.editorList.querySelector(`.editor-card[data-component-id="${cssEscape(componentId)}"]`);
    card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  if (selectionOptions.scrollToPreview) {
    scrollPreviewToComponent(componentId, selectionOptions.previewBehavior);
  }
  queueConnectorDraw();
}

function normalizeSelectionOptions(options) {
  if (typeof options === "boolean") {
    return {
      scrollToCard: options,
      scrollToPreview: false,
      previewBehavior: "smooth"
    };
  }
  return {
    scrollToCard: Boolean(options.scrollToCard),
    scrollToPreview: Boolean(options.scrollToPreview),
    previewBehavior: options.previewBehavior === "auto" ? "auto" : "smooth"
  };
}

function resetPreviewViewport() {
  dom.previewStage.scrollTop = 0;
  dom.previewStage.scrollLeft = 0;
}

function ensureSelectedComponentInPreview(behavior = "auto") {
  if (!state.selectedComponentId) {
    return;
  }
  scrollPreviewToComponent(state.selectedComponentId, behavior);
}

function scrollPreviewToComponent(componentId, behavior = "smooth") {
  const target = dom.canvas.querySelector(`.preview-component[data-component-id="${cssEscape(componentId)}"]`);
  if (!target) {
    return;
  }
  const stageRect = dom.previewStage.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (stageRect.width < 1 || stageRect.height < 1 || targetRect.width < 1 || targetRect.height < 1) {
    return;
  }

  const padding = 30;
  const visibleHorizontally =
    targetRect.left >= stageRect.left + padding && targetRect.right <= stageRect.right - padding;
  const visibleVertically =
    targetRect.top >= stageRect.top + padding && targetRect.bottom <= stageRect.bottom - padding;
  if (visibleHorizontally && visibleVertically) {
    return;
  }

  const targetCenterX = targetRect.left + targetRect.width / 2;
  const targetCenterY = targetRect.top + targetRect.height / 2;
  const stageCenterX = stageRect.left + stageRect.width / 2;
  const stageCenterY = stageRect.top + stageRect.height / 2;

  const nextLeft = clamp(
    Math.round(dom.previewStage.scrollLeft + (targetCenterX - stageCenterX)),
    0,
    Math.max(0, dom.previewStage.scrollWidth - dom.previewStage.clientWidth)
  );
  const nextTop = clamp(
    Math.round(dom.previewStage.scrollTop + (targetCenterY - stageCenterY)),
    0,
    Math.max(0, dom.previewStage.scrollHeight - dom.previewStage.clientHeight)
  );

  dom.previewStage.scrollTo({
    left: nextLeft,
    top: nextTop,
    behavior: behavior === "auto" ? "auto" : "smooth"
  });
}

function syncActiveClasses() {
  dom.editorList.querySelectorAll(".editor-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.componentId === state.selectedComponentId);
  });
  const resizingId =
    state.drag && (state.drag.mode === "resize" || state.drag.mode === "pinch")
      ? state.drag.componentId
      : null;
  dom.canvas.querySelectorAll(".preview-component").forEach((component) => {
    const isActive = component.dataset.componentId === state.selectedComponentId;
    component.classList.toggle("is-active", isActive);
    component.classList.toggle("is-resizing", Boolean(isActive && resizingId && component.dataset.componentId === resizingId));
  });
  dom.canvasMirror.querySelectorAll(".preview-component").forEach((component) => {
    component.classList.remove("is-active");
    component.classList.remove("is-resizing");
  });
}

function syncPositionInputs(component) {
  const xInput = dom.editorList.querySelector(`input[data-component-id="${cssEscape(component.id)}"][data-field="x"]`);
  const yInput = dom.editorList.querySelector(`input[data-component-id="${cssEscape(component.id)}"][data-field="y"]`);
  if (xInput) {
    xInput.value = String(component.x);
  }
  if (yInput) {
    yInput.value = String(component.y);
  }
}

function syncEditorCardHeading(component) {
  const card = dom.editorList.querySelector(`.editor-card[data-component-id="${cssEscape(component.id)}"]`);
  const heading = card?.querySelector(".editor-card-head strong");
  if (heading) {
    heading.textContent = component.label;
  }
}

function pulseEditorCard(componentId) {
  const card = dom.editorList.querySelector(`.editor-card[data-component-id="${cssEscape(componentId)}"]`);
  if (!card) {
    return;
  }
  const token = String(Date.now());
  card.dataset.pulseToken = token;
  card.classList.remove("is-linked");
  void card.offsetWidth;
  card.classList.add("is-linked");
  window.setTimeout(() => {
    if (card.dataset.pulseToken === token) {
      card.classList.remove("is-linked");
      delete card.dataset.pulseToken;
    }
  }, 920);
}

function getPreviewScale() {
  return clamp(toNumber(dom.layoutSheet.style.getPropertyValue("--preview-scale"), 1), 0.1, 5);
}

function cachePointer(event, componentId) {
  state.pointerCache[event.pointerId] = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    componentId
  };
}

function updateCachedPointer(event) {
  const point = state.pointerCache[event.pointerId];
  if (!point) {
    return;
  }
  point.x = event.clientX;
  point.y = event.clientY;
}

function releaseCachedPointer(pointerId) {
  delete state.pointerCache[pointerId];
}

function getPointersForComponent(componentId) {
  return Object.values(state.pointerCache).filter((point) => point.componentId === componentId);
}

function pointerDistance(pointA, pointB) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function maybeStartPinch(component) {
  const points = getPointersForComponent(component.id);
  if (points.length < 2) {
    return;
  }
  const initialDistance = Math.max(1, pointerDistance(points[0], points[1]));
  state.drag = {
    mode: "pinch",
    componentId: component.id,
    initialDistance,
    originWidth: component.width,
    originHeight: component.height,
    startSnapshot: takeSnapshot()
  };
  syncActiveClasses();
}

function applyPinchResize(component) {
  const points = getPointersForComponent(component.id);
  if (points.length < 2 || !state.drag || state.drag.mode !== "pinch") {
    return;
  }
  const nextDistance = Math.max(1, pointerDistance(points[0], points[1]));
  const ratio = clamp(nextDistance / state.drag.initialDistance, 0.3, 4);
  const nextWidth = clamp(
    Math.round(state.drag.originWidth * ratio),
    RESIZE_MIN_SIZE,
    Math.max(RESIZE_MIN_SIZE, state.draft.paper.width - component.x)
  );
  const nextHeight = clamp(
    Math.round(state.drag.originHeight * ratio),
    RESIZE_MIN_SIZE,
    Math.max(RESIZE_MIN_SIZE, state.draft.paper.height - component.y)
  );
  applyComponentResize(component, nextWidth, nextHeight);
}

function calculateResizeBoxFromDrag(dragState, dx, dy) {
  const paperWidth = state.draft?.paper?.width || 0;
  const paperHeight = state.draft?.paper?.height || 0;
  const originX = toInt(dragState.originX, 0);
  const originY = toInt(dragState.originY, 0);
  const originWidth = toPositiveInt(dragState.originWidth, RESIZE_MIN_SIZE);
  const originHeight = toPositiveInt(dragState.originHeight, RESIZE_MIN_SIZE);

  let left = originX;
  let top = originY;
  let right = originX + originWidth;
  let bottom = originY + originHeight;

  const dir = dragState.dir || "se";
  if (dir.includes("w")) {
    left = Math.round(originX + dx);
  }
  if (dir.includes("e")) {
    right = Math.round(originX + originWidth + dx);
  }
  if (dir.includes("n")) {
    top = Math.round(originY + dy);
  }
  if (dir.includes("s")) {
    bottom = Math.round(originY + originHeight + dy);
  }

  if (left < 0) {
    left = 0;
  }
  if (top < 0) {
    top = 0;
  }
  if (right > paperWidth) {
    right = paperWidth;
  }
  if (bottom > paperHeight) {
    bottom = paperHeight;
  }

  if (right - left < RESIZE_MIN_SIZE) {
    if (dir.includes("w") && !dir.includes("e")) {
      left = right - RESIZE_MIN_SIZE;
    } else {
      right = left + RESIZE_MIN_SIZE;
    }
  }
  if (bottom - top < RESIZE_MIN_SIZE) {
    if (dir.includes("n") && !dir.includes("s")) {
      top = bottom - RESIZE_MIN_SIZE;
    } else {
      bottom = top + RESIZE_MIN_SIZE;
    }
  }

  left = clamp(left, 0, Math.max(0, paperWidth - RESIZE_MIN_SIZE));
  top = clamp(top, 0, Math.max(0, paperHeight - RESIZE_MIN_SIZE));
  right = clamp(right, left + RESIZE_MIN_SIZE, Math.max(left + RESIZE_MIN_SIZE, paperWidth));
  bottom = clamp(bottom, top + RESIZE_MIN_SIZE, Math.max(top + RESIZE_MIN_SIZE, paperHeight));

  return {
    x: left,
    y: top,
    width: Math.round(right - left),
    height: Math.round(bottom - top)
  };
}

function applyComponentResize(component, nextWidth, nextHeight) {
  component.width = nextWidth;
  component.height = nextHeight;
}

function updateCanvasScale() {
  if (!state.draft) {
    return;
  }
  const maxWidth = Math.max(280, dom.previewStage.clientWidth - 50);
  const metrics = getPreviewLayoutMetrics();
  const sheetWidth = metrics.width;
  const scale = Math.min(maxWidth / sheetWidth, 1);
  dom.layoutSheet.style.setProperty("--preview-scale", String(scale));
}

function getPreviewLayoutMetrics() {
  const left = state.draft?.paper || { width: 900, height: 1240 };
  if (state.layoutMode !== "double-horizontal") {
    return { width: left.width, height: left.height };
  }
  const rightDraft = getRightDraft() || state.draft;
  const rightPaper = rightDraft?.paper || left;
  const gap = 34;
  return {
    width: left.width + gap + rightPaper.width,
    height: Math.max(left.height, rightPaper.height)
  };
}

function queueConnectorDraw() {
  if (state.connectorRaf) {
    cancelAnimationFrame(state.connectorRaf);
  }
  state.connectorRaf = requestAnimationFrame(drawConnectors);
}

function drawConnectors() {
  state.connectorRaf = null;
  if (!state.draft || window.matchMedia("(max-width: 1024px)").matches) {
    dom.linkLayer.innerHTML = "";
    return;
  }

  const layerRect = dom.linkLayer.getBoundingClientRect();
  const layerWidth = Math.max(1, layerRect.width);
  const layerHeight = Math.max(1, layerRect.height);
  dom.linkLayer.setAttribute("viewBox", `0 0 ${layerWidth} ${layerHeight}`);
  dom.linkLayer.innerHTML = "";

  state.draft.components.forEach((component) => {
    const source = dom.editorList.querySelector(`.editor-card[data-component-id="${cssEscape(component.id)}"]`);
    const target = dom.canvas.querySelector(`.preview-component[data-component-id="${cssEscape(component.id)}"]`);
    if (!source || !target) {
      return;
    }

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const startX = sourceRect.right - layerRect.left;
    const startY = sourceRect.top + sourceRect.height / 2 - layerRect.top;
    const endX = targetRect.left - layerRect.left;
    const endY = targetRect.top + targetRect.height / 2 - layerRect.top;
    if (startY < -20 || startY > layerHeight + 20) {
      return;
    }

    const bend = Math.max(90, (endX - startX) * 0.45);
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", component.id === state.selectedComponentId ? "connector active" : "connector");
    path.setAttribute("d", `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`);

    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("class", "connector-end");
    circle.setAttribute("cx", String(endX));
    circle.setAttribute("cy", String(endY));
    circle.setAttribute("r", component.id === state.selectedComponentId ? "4.2" : "3.1");
    dom.linkLayer.append(path, circle);
  });
}

function queuePersist() {
  clearTimeout(state.saveTimer);
  state.saveTimer = setTimeout(() => {
    if (!state.currentTemplateId || !state.draft) {
      return;
    }
    setStorage(storageKey(`draft:${state.currentTemplateId}`), JSON.stringify(state.draft));
  }, 220);
}

function buildExportRenderOptions() {
  return {
    scale: 3,
    layoutMode: state.layoutMode,
    rightDraft: getRightDraft(),
    paperPreset: state.paperPreset,
    marginMm: state.paperMarginMm,
    showCutMarks: state.showCutMarks
  };
}

function exportCurrentDraftAsJson() {
  if (!state.draft || !state.currentTemplateId) {
    return;
  }
  const filename = buildExportFilename("json");
  const blob = new Blob([JSON.stringify(state.draft, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
  setStatus(`Export JSON selesai: ${filename}`);
}

async function exportCurrentDraftAsPng() {
  if (!state.draft || !state.currentTemplateId) {
    return;
  }
  setButtonBusy(dom.downloadPngBtn, true);
  try {
    const render = await renderDraftToCanvas(state.draft, buildExportRenderOptions());
    const blob = await canvasToBlob(render.canvas, "image/png", 1);
    const filename = buildExportFilename("png");
    downloadBlob(blob, filename);
    setStatus(`Export PNG selesai: ${filename}`);
    if (render.warnings.length > 0) {
      setStatus(`PNG dibuat, namun ${render.warnings.length} gambar URL eksternal gagal dirender (CORS).`);
    }
  } catch (error) {
    setStatus(`Export PNG gagal: ${error.message}`);
  } finally {
    setButtonBusy(dom.downloadPngBtn, false);
  }
}

async function exportCurrentDraftAsPdf() {
  if (!state.draft || !state.currentTemplateId) {
    return;
  }
  setButtonBusy(dom.downloadPdfBtn, true);
  try {
    const render = await renderDraftToCanvas(state.draft, buildExportRenderOptions());
    const imageData = render.canvas.toDataURL("image/png");
    const filenameBase = buildExportFilenameBase();
    const response = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/pdf, application/json" },
      body: JSON.stringify({
        image_data: imageData,
        filename: filenameBase,
        page_width_pt: (render.pageCssWidthPx * 72) / 96,
        page_height_pt: (render.pageCssHeightPx * 72) / 96
      })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || `Server error ${response.status}`);
    }
    const blob = await response.blob();
    downloadBlob(blob, `${filenameBase}.pdf`);
    setStatus(`Export PDF selesai: ${filenameBase}.pdf`);
    if (render.warnings.length > 0) {
      setStatus(`PDF dibuat, namun ${render.warnings.length} gambar URL eksternal gagal dirender (CORS).`);
    }
  } catch (error) {
    setStatus(`Export PDF gagal: ${error.message}`);
  } finally {
    setButtonBusy(dom.downloadPdfBtn, false);
  }
}

async function exportCurrentDraftAsDocx() {
  if (!state.draft || !state.currentTemplateId) {
    return;
  }
  setButtonBusy(dom.downloadDocxBtn, true);
  try {
    const filenameBase = buildExportFilenameBase();
    const response = await fetch("/api/export/docx", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/json" },
      body: JSON.stringify({
        filename: filenameBase,
        draft: state.draft
      })
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error || `Server error ${response.status}`);
    }
    const blob = await response.blob();
    downloadBlob(blob, `${filenameBase}.docx`);
    setStatus(`Export DOCX selesai: ${filenameBase}.docx`);
  } catch (error) {
    setStatus(`Export DOCX gagal: ${error.message}`);
  } finally {
    setButtonBusy(dom.downloadDocxBtn, false);
  }
}

function importDraftFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const importedTemplate = Array.isArray(parsed.templates)
        ? normalizeTemplate(parsed.templates[0], 0)
        : normalizeTemplate(parsed, 0);
      importedTemplate.isCustom = true;
      if (!importedTemplate.components.length) {
        throw new Error("Komponen template kosong.");
      }

      const existingIndex = state.templates.findIndex((template) => template.id === importedTemplate.id);
      if (existingIndex >= 0 && state.templates[existingIndex].isCustom) {
        state.templates[existingIndex] = importedTemplate;
      } else {
        importedTemplate.id = generateUniqueTemplateId(importedTemplate.name || "template-import");
        importedTemplate.name = `${importedTemplate.name} (Import)`;
        state.templates.push(importedTemplate);
      }
      saveCustomTemplates();
      renderTemplateSelect();
      refreshMetaText();
      activateTemplate(importedTemplate.id, true);
      queuePersist();
      setStatus("Import JSON berhasil.");
    } catch (error) {
      setStatus(`Import gagal: ${error.message}`);
    } finally {
      dom.importJsonInput.value = "";
    }
  };
  reader.readAsText(file);
}

function findComponent(componentId) {
  return state.draft?.components.find((component) => component.id === componentId);
}

function setStatus(message) {
  dom.statusText.textContent = message;
}

function resolveCssFont(token) {
  const key = String(token || "").trim().toLowerCase();
  if (key === "display") {
    return "var(--font-display)";
  }
  if (key === "script") {
    return "var(--font-script)";
  }
  if (key === "body") {
    return "var(--font-body)";
  }
  if (key === "times-new-roman") {
    return '"Times New Roman", Times, serif';
  }
  if (key === "arial") {
    return 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  }
  if (key === "calibri") {
    return 'Calibri, "Segoe UI", sans-serif';
  }
  if (key === "cambria") {
    return 'Cambria, "Times New Roman", serif';
  }
  if (key === "georgia") {
    return 'Georgia, "Times New Roman", serif';
  }
  if (key === "tahoma") {
    return 'Tahoma, "Segoe UI", sans-serif';
  }
  if (key === "verdana") {
    return "Verdana, Geneva, sans-serif";
  }
  if (key === "book-antiqua") {
    return '"Book Antiqua", Palatino, "Palatino Linotype", serif';
  }
  if (typeof token === "string" && token.trim()) {
    return token;
  }
  return '"Times New Roman", Times, serif';
}

function resolveCanvasFontFamily(token) {
  const key = String(token || "").trim().toLowerCase();
  if (key === "display") {
    return '"Cormorant Garamond", Georgia, serif';
  }
  if (key === "script") {
    return '"Yellowtail", "Brush Script MT", cursive';
  }
  if (key === "body") {
    return '"Nunito", "Segoe UI", sans-serif';
  }
  if (key === "times-new-roman") {
    return '"Times New Roman", Times, serif';
  }
  if (key === "arial") {
    return 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  }
  if (key === "calibri") {
    return 'Calibri, "Segoe UI", sans-serif';
  }
  if (key === "cambria") {
    return 'Cambria, "Times New Roman", serif';
  }
  if (key === "georgia") {
    return 'Georgia, "Times New Roman", serif';
  }
  if (key === "tahoma") {
    return 'Tahoma, "Segoe UI", sans-serif';
  }
  if (key === "verdana") {
    return "Verdana, Geneva, sans-serif";
  }
  if (key === "book-antiqua") {
    return '"Book Antiqua", Palatino, "Palatino Linotype", serif';
  }
  if (typeof token === "string" && token.trim()) {
    return token;
  }
  return '"Times New Roman", Times, serif';
}

function normalizeFontFamilyToken(token) {
  const raw = typeof token === "string" ? token.trim() : "";
  if (!raw) {
    return "times-new-roman";
  }
  const normalized = raw.toLowerCase();
  const known = FONT_FAMILY_OPTIONS.some((option) => option.value === normalized);
  return known ? normalized : raw;
}

function buildFontFamilyOptions(selectedToken) {
  const normalized = normalizeFontFamilyToken(selectedToken);
  const options = FONT_FAMILY_OPTIONS.map((option) => {
    const selected = normalized === option.value ? "selected" : "";
    return `<option value="${option.value}" ${selected}>${option.label}</option>`;
  });

  const hasKnown = FONT_FAMILY_OPTIONS.some((option) => option.value === normalized);
  if (!hasKnown && typeof selectedToken === "string" && selectedToken.trim()) {
    const escaped = escapeHtml(selectedToken.trim());
    options.push(`<option value="${escaped}" selected>Kustom (${escaped})</option>`);
  }
  return options.join("");
}

async function renderDraftToCanvas(draft, options = {}) {
  const qualityScale = clamp(toNumber(options.scale, 2.5), 1, 4);
  const layoutMode = options.layoutMode === "double-horizontal" ? "double-horizontal" : "single";
  const rightDraft = layoutMode === "double-horizontal"
    ? options.rightDraft || draft
    : draft;

  const leftCard = {
    draft,
    width: Math.round(draft.paper.width * qualityScale),
    height: Math.round(draft.paper.height * qualityScale)
  };
  const rightCard = {
    draft: rightDraft,
    width: Math.round(rightDraft.paper.width * qualityScale),
    height: Math.round(rightDraft.paper.height * qualityScale)
  };

  const rawGap = layoutMode === "double-horizontal" ? Math.round(34 * qualityScale) : 0;
  const rawArrangementWidth = layoutMode === "double-horizontal"
    ? leftCard.width + rawGap + rightCard.width
    : leftCard.width;
  const rawArrangementHeight = layoutMode === "double-horizontal"
    ? Math.max(leftCard.height, rightCard.height)
    : leftCard.height;

  const preset = getPaperPresetDimensions(options.paperPreset);
  const defaultPadding = layoutMode === "double-horizontal" ? Math.round(30 * qualityScale) : Math.round(8 * qualityScale);
  const marginMm = clamp(toNumber(options.marginMm, 8), 0, 50);
  const marginPx = preset
    ? Math.round(mmToCssPx(marginMm) * qualityScale)
    : defaultPadding;

  const width = preset
    ? Math.round(preset.widthPx * qualityScale)
    : rawArrangementWidth + marginPx * 2;
  const height = preset
    ? Math.round(preset.heightPx * qualityScale)
    : rawArrangementHeight + marginPx * 2;

  const contentWidth = Math.max(1, width - marginPx * 2);
  const contentHeight = Math.max(1, height - marginPx * 2);
  const fit = Math.min(contentWidth / rawArrangementWidth, contentHeight / rawArrangementHeight, 1);
  const arrangedWidth = rawArrangementWidth * fit;
  const arrangedHeight = rawArrangementHeight * fit;
  const startX = marginPx + (contentWidth - arrangedWidth) / 2;
  const startY = marginPx + (contentHeight - arrangedHeight) / 2;
  const gap = rawGap * fit;

  const leftWidth = leftCard.width * fit;
  const leftHeight = leftCard.height * fit;
  const rightWidth = rightCard.width * fit;
  const rightHeight = rightCard.height * fit;

  const leftX = startX;
  const leftY = startY + (arrangedHeight - leftHeight) / 2;
  const rightX = leftX + leftWidth + gap;
  const rightY = startY + (arrangedHeight - rightHeight) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  await document.fonts.ready;

  const warnings = [];
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  await drawDraftCard(ctx, leftCard.draft, leftX, leftY, leftWidth, leftHeight, warnings);
  if (layoutMode === "double-horizontal") {
    await drawDraftCard(ctx, rightCard.draft, rightX, rightY, rightWidth, rightHeight, warnings);
  }

  const showCutMarks = options.showCutMarks !== false;
  if (showCutMarks) {
    const markLength = Math.max(10, qualityScale * 10);
    drawCutMarksForRect(ctx, leftX, leftY, leftWidth, leftHeight, markLength);
    if (layoutMode === "double-horizontal") {
      drawCutMarksForRect(ctx, rightX, rightY, rightWidth, rightHeight, markLength);
      const cutX = leftX + leftWidth + gap / 2;
      drawCenterCutGuide(ctx, cutX, height, qualityScale);
    }
  }

  return {
    canvas,
    warnings,
    pageWidthPx: width,
    pageHeightPx: height,
    pageCssWidthPx: width / qualityScale,
    pageCssHeightPx: height / qualityScale
  };
}

async function drawDraftCard(ctx, draftData, cardX, cardY, cardWidth, cardHeight, warnings) {
  const scaleX = cardWidth / Math.max(1, draftData.paper.width);
  const scaleY = cardHeight / Math.max(1, draftData.paper.height);
  const unitScale = (scaleX + scaleY) / 2;

  drawInvitationCardFrame(ctx, draftData, unitScale, cardX, cardY, cardWidth, cardHeight);
  for (const component of draftData.components) {
    if (component.hidden) {
      continue;
    }
    const left = cardX + component.x * scaleX;
    const top = cardY + component.y * scaleY;
    const widthPx = component.width * scaleX;
    const heightPx = component.height * scaleY;

    if (TEXT_TYPES.has(component.type)) {
      drawTextComponent(ctx, component, left, top, widthPx, heightPx, unitScale);
      continue;
    }
    if (LINE_TYPES.has(component.type)) {
      drawLineComponent(ctx, component, left, top, widthPx, heightPx);
      continue;
    }
    if (IMAGE_TYPES.has(component.type)) {
      const warning = await drawImageComponent(ctx, component, left, top, widthPx, heightPx, unitScale);
      if (warning) {
        warnings.push(warning);
      }
    }
  }
}

function drawLineComponent(ctx, component, left, top, width, height) {
  const radius = toPositiveInt(component.style.borderRadius, 0);
  ctx.save();
  roundedRectPath(ctx, left, top, width, Math.max(1, height), Math.max(0, radius));
  ctx.fillStyle = component.style.color || "#000000";
  ctx.fill();
  ctx.restore();
}

function drawCutMarksForRect(ctx, x, y, width, height, length) {
  const offset = Math.max(2, length * 0.25);
  ctx.save();
  ctx.strokeStyle = "#7f9690";
  ctx.lineWidth = Math.max(1, length * 0.08);
  ctx.beginPath();

  ctx.moveTo(x - length, y - offset);
  ctx.lineTo(x - offset, y - offset);
  ctx.moveTo(x - offset, y - length);
  ctx.lineTo(x - offset, y - offset);

  ctx.moveTo(x + width + offset, y - length);
  ctx.lineTo(x + width + offset, y - offset);
  ctx.moveTo(x + width + offset, y - offset);
  ctx.lineTo(x + width + length, y - offset);

  ctx.moveTo(x - length, y + height + offset);
  ctx.lineTo(x - offset, y + height + offset);
  ctx.moveTo(x - offset, y + height + offset);
  ctx.lineTo(x - offset, y + height + length);

  ctx.moveTo(x + width + offset, y + height + offset);
  ctx.lineTo(x + width + length, y + height + offset);
  ctx.moveTo(x + width + offset, y + height + offset);
  ctx.lineTo(x + width + offset, y + height + length);

  ctx.stroke();
  ctx.restore();
}

function drawCenterCutGuide(ctx, x, totalHeight, scale) {
  ctx.save();
  ctx.strokeStyle = "#93aca5";
  ctx.setLineDash([Math.max(6, scale * 4), Math.max(4, scale * 3)]);
  ctx.lineWidth = Math.max(1, scale * 0.6);
  ctx.beginPath();
  ctx.moveTo(x, Math.round(12 * scale));
  ctx.lineTo(x, totalHeight - Math.round(12 * scale));
  ctx.stroke();
  ctx.restore();
}

function getPaperPresetDimensions(presetKey) {
  const preset = PAPER_PRESETS[presetKey];
  if (!preset || presetKey === "auto") {
    return null;
  }
  return preset;
}

function drawInvitationCardFrame(ctx, draft, scale, left, top, width, height) {
  ctx.save();
  ctx.fillStyle = draft.paper.background || "#ffffff";
  ctx.fillRect(left, top, width, height);

  ctx.strokeStyle = draft.paper.borderColor || "#d7d7d7";
  ctx.lineWidth = Math.max(1, scale);
  ctx.strokeRect(left, top, width, height);

  const innerPad = Math.round(20 * scale);
  ctx.strokeStyle = colorMixHex(draft.paper.accentColor || "#6f988d", "#ffffff", 0.3);
  ctx.strokeRect(left + innerPad, top + innerPad, width - innerPad * 2, height - innerPad * 2);

  const orbSize = Math.round(180 * scale);
  const grad = ctx.createRadialGradient(
    left + width - orbSize / 4,
    top + orbSize / 4,
    0,
    left + width - orbSize / 4,
    top + orbSize / 4,
    orbSize / 2
  );
  grad.addColorStop(0, colorMixHex(draft.paper.accentColor || "#6f988d", "#ffffff", 0.5));
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(left + width - Math.round(45 * scale), top + Math.round(45 * scale), orbSize / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawTextComponent(ctx, component, left, top, width, height, scale) {
  const textValue = (component.value || component.placeholder || component.label || "").replace(/\r\n/g, "\n");
  const lines = textValue.split("\n");
  const fontSize = toPositiveInt(component.style.fontSize, 18) * scale;
  const fontWeight = toPositiveInt(component.style.fontWeight, 600);
  const align = component.style.align || "left";
  const color = component.style.color || "#2f403c";
  const lineHeight = Math.max(12, fontSize * 1.35);
  const family = resolveCanvasFontFamily(component.style.fontFamily);

  ctx.save();
  ctx.beginPath();
  ctx.rect(left, top, width, height);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.font = `${fontWeight} ${fontSize}px ${family}`;
  ctx.textBaseline = "top";
  ctx.textAlign = align === "center" ? "center" : align === "right" ? "right" : "left";

  const maxLines = Math.max(1, Math.floor(height / lineHeight));
  const visibleLines = lines.slice(0, maxLines);
  visibleLines.forEach((line, index) => {
    const y = top + index * lineHeight;
    const isLastLine = index === visibleLines.length - 1;
    if (align === "justify" && !isLastLine) {
      drawJustifiedLine(ctx, line, left, y, width);
      return;
    }
    let x = left;
    if (align === "center") {
      x = left + width / 2;
    } else if (align === "right") {
      x = left + width;
    }
    ctx.fillText(line, x, y);
  });
  ctx.restore();
}

function drawJustifiedLine(ctx, line, left, top, width) {
  const words = line.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    ctx.fillText(line, left, top);
    return;
  }
  const wordsWidth = words.reduce((sum, word) => sum + ctx.measureText(word).width, 0);
  const spacing = Math.max(0, (width - wordsWidth) / (words.length - 1));
  let cursor = left;
  words.forEach((word, index) => {
    ctx.fillText(word, cursor, top);
    cursor += ctx.measureText(word).width;
    if (index < words.length - 1) {
      cursor += spacing;
    }
  });
}

async function drawImageComponent(ctx, component, left, top, width, height, scale) {
  const radius = toPositiveInt(component.style.borderRadius, 8) * scale;
  const background = component.style.background || "#f3f8f6";
  ctx.save();
  roundedRectPath(ctx, left, top, width, height, radius);
  ctx.clip();
  ctx.fillStyle = background;
  ctx.fillRect(left, top, width, height);

  if (component.value) {
    try {
      const image = await loadImage(component.value);
      const box = computeObjectFitRect(
        width,
        height,
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
        component.style.fit || "contain"
      );
      ctx.drawImage(image, left + box.x, top + box.y, box.width, box.height);
      ctx.restore();
      return "";
    } catch {
      // Fallback ke placeholder.
    }
  }

  ctx.fillStyle = "#7a958b";
  ctx.font = `${Math.round(11 * scale)}px "Nunito", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(component.placeholder || component.label || "Gambar", left + width / 2, top + height / 2);
  ctx.restore();
  return component.value ? component.label : "";
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function computeObjectFitRect(boxWidth, boxHeight, imageWidth, imageHeight, fit) {
  if (fit === "fill" || imageWidth <= 0 || imageHeight <= 0) {
    return { x: 0, y: 0, width: boxWidth, height: boxHeight };
  }
  const boxRatio = boxWidth / boxHeight;
  const imageRatio = imageWidth / imageHeight;
  const useCover = fit === "cover";
  let drawWidth;
  let drawHeight;

  if ((imageRatio > boxRatio && !useCover) || (imageRatio <= boxRatio && useCover)) {
    drawWidth = boxWidth;
    drawHeight = drawWidth / imageRatio;
  } else {
    drawHeight = boxHeight;
    drawWidth = drawHeight * imageRatio;
  }

  return {
    x: (boxWidth - drawWidth) / 2,
    y: (boxHeight - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight
  };
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gagal load gambar"));
    image.src = source;
  });
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas tidak bisa dikonversi ke file."));
          return;
        }
        resolve(blob);
      }, mimeType, quality);
    } catch {
      reject(new Error("Gambar eksternal tanpa CORS memblokir export. Gunakan upload file lokal."));
    }
  });
}

function setButtonBusy(button, busy) {
  if (!button) {
    return;
  }
  button.disabled = busy;
  button.classList.toggle("is-busy", busy);
}

function buildExportFilename(extension) {
  return `${buildExportFilenameBase()}.${extension}`;
}

function buildExportFilenameBase() {
  const stamp = new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace("T", "-")
    .slice(0, 15);
  return `undangan-${state.currentTemplateId || "draft"}-${stamp}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function colorMixHex(colorA, colorB, ratioA) {
  const a = parseHexColor(colorA);
  const b = parseHexColor(colorB);
  const ratio = clamp(toNumber(ratioA, 0.5), 0, 1);
  const r = Math.round(a.r * ratio + b.r * (1 - ratio));
  const g = Math.round(a.g * ratio + b.g * (1 - ratio));
  const bb = Math.round(a.b * ratio + b.b * (1 - ratio));
  return `rgb(${r}, ${g}, ${bb})`;
}

function parseHexColor(value) {
  const hex = /^#([0-9a-f]{6})$/i.exec(String(value || "").trim());
  if (!hex) {
    return { r: 111, g: 152, b: 141 };
  }
  return {
    r: Number.parseInt(hex[1].slice(0, 2), 16),
    g: Number.parseInt(hex[1].slice(2, 4), 16),
    b: Number.parseInt(hex[1].slice(4, 6), 16)
  };
}

function loadCustomTemplates() {
  const raw = getStorage(CUSTOM_TEMPLATES_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((template, index) => normalizeTemplate({ ...template, isCustom: true }, index));
  } catch {
    return [];
  }
}

function saveCustomTemplates() {
  const customTemplates = state.templates.filter((template) => template.isCustom);
  setStorage(CUSTOM_TEMPLATES_KEY, JSON.stringify(customTemplates));
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_");
}

function storageKey(key) {
  return `${STORAGE_NS}:${key}`;
}

function getStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage errors.
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function toInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : fallback;
}

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.round(parsed));
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mmToCssPx(mm) {
  return Number(mm) * (96 / 25.4);
}

function cssPxToMm(px) {
  return Number(px) * (25.4 / 96);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toColorInput(value) {
  if (typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  return "#2f403c";
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/["\\#.:?+*^$[\]()=>|/@]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
