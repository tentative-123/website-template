const PAGE_META = {
  site: { label: "全站設定", preview: "index.html" },
  navigation: { label: "導覽列", preview: "index.html" },
  home: { label: "首頁內容", preview: "index.html" },
  about: { label: "關於我們", preview: "about.html" },
  products: { label: "產品服務", preview: "products.html" },
  technology: { label: "設備技術", preview: "technology.html" },
  quality: { label: "品質認證", preview: "quality.html" },
  contact: { label: "聯絡我們", preview: "contact.html" }
};

const FIELD_LABELS = {
  meta_title: "SEO 標題",
  meta_description: "SEO 描述",
  eyebrow: "小標題",
  page_title: "頁面主標題",
  page_description: "頁面說明文字",
  hero_title: "首頁主標題",
  hero_description: "首頁主說明",
  primary_button: "主按鈕文字",
  secondary_button: "次按鈕文字",
  footer_text: "頁尾說明",
  company_name: "公司簡稱",
  company_name_full: "公司全名",
  english_name: "英文副標",
  phone_value: "電話",
  fax_value: "傳真",
  address_value: "地址",
  email_value: "Email",
  map_href: "地圖連結",
  map_text: "地圖按鈕文字",
  form_alert: "表單送出提示"
};

let currentLanguage = window.ContentStore.getCurrentLanguage();
let currentPage = "home";
let currentContent = null;
let hasUnsavedChanges = false;
let remoteEnabled = false;
let supabaseClient = null;
let currentSession = null;

const pageNav = document.querySelector("#admin-page-nav");
const editorRoot = document.querySelector("#admin-editor-root");
const pageTitle = document.querySelector("#admin-page-title");
const statusPill = document.querySelector("#admin-status-pill");
const statusNote = document.querySelector("#admin-status-note");
const previewTitle = document.querySelector("#admin-preview-title");
const previewFrame = document.querySelector("#admin-preview-frame");
const openPreview = document.querySelector("#admin-open-preview");
const saveButton = document.querySelector("#admin-save");
const resetButton = document.querySelector("#admin-reset");
const exportButton = document.querySelector("#admin-export");
const importInput = document.querySelector("#admin-import-file");
const authCard = document.querySelector("#admin-auth-card");
const loginForm = document.querySelector("#admin-login-form");
const logoutButton = document.querySelector("#admin-logout");
const modeBadge = document.querySelector("#admin-mode-badge");
const toolbarCard = document.querySelector(".admin-toolbar");

function setEditorAvailability(canEdit) {
  toolbarCard.hidden = !canEdit;
  editorRoot.hidden = !canEdit;
  saveButton.disabled = !canEdit;
  resetButton.disabled = !canEdit;
  importInput.disabled = !canEdit;
  logoutButton.hidden = !remoteEnabled || !currentSession;
  authCard.hidden = !remoteEnabled || Boolean(currentSession);
}

function prettifyLabel(key) {
  if (FIELD_LABELS[key]) {
    return FIELD_LABELS[key];
  }

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getFieldHelp(path) {
  if (path.includes("image")) {
    return `圖片說明欄位：${path}`;
  }
  if (path.includes("meta")) {
    return `SEO 欄位：${path}`;
  }
  if (path.includes("placeholder")) {
    return `表單提示文字：${path}`;
  }

  return `欄位代號：${path}`;
}

function getInputType(key, value) {
  if (
    typeof value === "string" &&
    (value.length > 40 ||
      key.includes("description") ||
      key.includes("message") ||
      key.includes("note") ||
      key.includes("alert"))
  ) {
    return "textarea";
  }

  return "text";
}

function updateStatus() {
  statusPill.textContent = hasUnsavedChanges ? "尚未儲存" : "已儲存";
  if (remoteEnabled && !currentSession) {
    statusNote.textContent = "目前為 Supabase 雲端模式，請先登入後台帳號才能編輯";
    return;
  }

  statusNote.textContent = hasUnsavedChanges
    ? "你有未儲存的變更，記得按右上角儲存"
    : `目前語言：${currentLanguage === "en" ? "英文" : "中文"}，內容已同步到${remoteEnabled ? "雲端前台" : "本機前台"}`;
}

function updateLanguageButtons() {
  document.querySelectorAll("[data-admin-language]").forEach((button) => {
    const isActive = button.dataset.adminLanguage === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function updatePreview() {
  const previewPage = PAGE_META[currentPage].preview;
  const previewUrl = `${previewPage}?lang=${currentLanguage}&t=${Date.now()}`;
  previewFrame.src = previewUrl;
  openPreview.href = previewUrl;
  previewTitle.textContent = `${PAGE_META[currentPage].label}預覽`;
}

function renderPageNav() {
  pageNav.innerHTML = "";

  Object.entries(PAGE_META).forEach(([pageKey, page]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = page.label;
    button.classList.toggle("is-active", pageKey === currentPage);
    button.addEventListener("click", () => {
      currentPage = pageKey;
      renderPageNav();
      renderEditor();
      updatePreview();
    });
    pageNav.appendChild(button);
  });
}

function createFieldElement(pageKey, fieldKey, value) {
  const wrapper = document.createElement("label");
  wrapper.className = "admin-field";

  if (String(value).length > 60) {
    wrapper.classList.add("admin-field-wide");
  }

  const label = document.createElement("span");
  label.textContent = prettifyLabel(fieldKey);

  const helper = document.createElement("small");
  helper.textContent = getFieldHelp(`${pageKey}.${fieldKey}`);

  const inputType = getInputType(fieldKey, value);
  const input = document.createElement(inputType === "textarea" ? "textarea" : "input");

  if (inputType === "textarea") {
    input.rows = Math.min(Math.max(Math.ceil(String(value).length / 42), 3), 6);
    input.value = value;
  } else {
    input.type = "text";
    input.value = value;
  }

  input.addEventListener("input", () => {
    currentContent[pageKey][fieldKey] = input.value;
    hasUnsavedChanges = true;
    updateStatus();
  });

  wrapper.append(label, helper, input);
  return wrapper;
}

function renderEditor() {
  const section = currentContent[currentPage];
  pageTitle.textContent = PAGE_META[currentPage].label;
  editorRoot.innerHTML = "";

  const card = document.createElement("div");
  card.className = "admin-card";

  const header = document.createElement("div");
  header.className = "admin-section-title";

  const titleWrap = document.createElement("div");
  const tag = document.createElement("p");
  tag.className = "admin-label";
  tag.textContent = currentLanguage === "en" ? "Editing English" : "編輯中文";
  const title = document.createElement("h2");
  title.textContent = PAGE_META[currentPage].label;
  titleWrap.append(tag, title);

  const action = document.createElement("button");
  action.type = "button";
  action.className = "button button-secondary";
  action.textContent = "重新整理預覽";
  action.addEventListener("click", updatePreview);

  header.append(titleWrap, action);

  const formGrid = document.createElement("div");
  formGrid.className = "admin-form-grid";

  Object.entries(section).forEach(([fieldKey, value]) => {
    if (typeof value === "string") {
      formGrid.appendChild(createFieldElement(currentPage, fieldKey, value));
    }
  });

  card.append(header, formGrid);
  editorRoot.appendChild(card);
}

async function loadAdminContent() {
  currentContent = await window.ContentStore.loadResolvedContent(currentLanguage);
  remoteEnabled = await window.ContentStore.isRemoteEnabled();
  supabaseClient = await window.ContentStore.getSupabaseClient();
  modeBadge.textContent = remoteEnabled ? "Supabase 雲端模式" : "本機模式";
  modeBadge.classList.toggle("is-remote", remoteEnabled);
  renderPageNav();
  renderEditor();
  updateLanguageButtons();
  setEditorAvailability(!remoteEnabled || Boolean(currentSession));
  updateStatus();
  updatePreview();
}

async function saveContent() {
  if (remoteEnabled && !currentSession) {
    window.alert("請先登入管理帳號後再儲存內容。");
    return;
  }

  await window.ContentStore.saveOverrides(currentLanguage, currentContent);
  hasUnsavedChanges = false;
  updateStatus();
  updatePreview();
}

async function resetCurrentLanguage() {
  if (remoteEnabled && !currentSession) {
    window.alert("請先登入管理帳號後再還原內容。");
    return;
  }

  await window.ContentStore.clearOverrides(currentLanguage);
  hasUnsavedChanges = false;
  await loadAdminContent();
}

function exportCurrentLanguage() {
  const blob = new Blob([JSON.stringify(currentContent, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = currentLanguage === "en" ? "content-fields-en-custom.json" : "content-fields-custom.json";
  link.click();
  URL.revokeObjectURL(url);
}

function importCurrentLanguage(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      currentContent = JSON.parse(reader.result);
      hasUnsavedChanges = true;
      renderEditor();
      updateStatus();
      updatePreview();
    } catch (error) {
      window.alert("匯入失敗，請確認檔案是有效的 JSON 格式。");
    }
  };
  reader.readAsText(file);
}

document.querySelectorAll("[data-admin-language]").forEach((button) => {
  button.addEventListener("click", async () => {
    currentLanguage = button.dataset.adminLanguage;
    window.ContentStore.setCurrentLanguage(currentLanguage);
    hasUnsavedChanges = false;
    await loadAdminContent();
  });
});

async function refreshSession() {
  if (!supabaseClient) {
    currentSession = null;
    setEditorAvailability(true);
    updateStatus();
    return;
  }

  const { data } = await supabaseClient.auth.getSession();
  currentSession = data.session;
  setEditorAvailability(Boolean(currentSession));
  updateStatus();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabaseClient) {
    window.alert("目前尚未連接 Supabase，仍為本機模式。");
    return;
  }

  const formData = new FormData(loginForm);
  const email = formData.get("email");
  const password = formData.get("password");

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    window.alert(`登入失敗：${error.message}`);
    return;
  }

  loginForm.reset();
  await refreshSession();
});

logoutButton.addEventListener("click", async () => {
  if (!supabaseClient) {
    return;
  }

  await supabaseClient.auth.signOut();
  await refreshSession();
});

saveButton.addEventListener("click", saveContent);
resetButton.addEventListener("click", resetCurrentLanguage);
exportButton.addEventListener("click", exportCurrentLanguage);
importInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) {
    importCurrentLanguage(file);
  }
});

loadAdminContent().catch((error) => {
  console.error(error);
  window.alert("後台內容載入失敗，請確認本地預覽伺服器是否正常啟動。");
});

window.ContentStore.getSupabaseClient().then(async (client) => {
  if (!client) {
    setEditorAvailability(true);
    return;
  }

  supabaseClient = client;
  await refreshSession();

  supabaseClient.auth.onAuthStateChange(async () => {
    await refreshSession();
  });
});
