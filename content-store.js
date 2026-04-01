(function () {
  const DEFAULT_LANGUAGE = "zh";
  const CONFIG_ENDPOINT = "/api/public-config";
  let supabaseClient = null;
  let runtimeConfig = null;

  function getUrlLanguage() {
    const language = new URLSearchParams(window.location.search).get("lang");
    return language === "zh" || language === "en" ? language : null;
  }

  function getCurrentLanguage() {
    const urlLanguage = getUrlLanguage();
    if (urlLanguage) {
      localStorage.setItem("site-language", urlLanguage);
      return urlLanguage;
    }

    return localStorage.getItem("site-language") || DEFAULT_LANGUAGE;
  }

  function setCurrentLanguage(language) {
    localStorage.setItem("site-language", language);
  }

  function getContentFile(language) {
    return language === "en" ? "content-fields-en.json" : "content-fields.json";
  }

  function getOverrideKey(language) {
    return `site-content-overrides-${language}`;
  }

  function loadOverrides(language) {
    try {
      const raw = localStorage.getItem(getOverrideKey(language));
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error("Failed to parse saved overrides.", error);
      return {};
    }
  }

  function saveLocalOverrides(language, content) {
    localStorage.setItem(getOverrideKey(language), JSON.stringify(content));
  }

  function clearLocalOverrides(language) {
    localStorage.removeItem(getOverrideKey(language));
  }

  function deepMerge(base, override) {
    if (typeof base !== "object" || base === null) {
      return override;
    }

    const result = { ...base };

    Object.entries(override || {}).forEach(([key, value]) => {
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value) &&
        typeof base[key] === "object" &&
        base[key] !== null &&
        !Array.isArray(base[key])
      ) {
        result[key] = deepMerge(base[key], value);
      } else {
        result[key] = value;
      }
    });

    return result;
  }

  async function loadBaseContent(language) {
    const response = await fetch(getContentFile(language));
    if (!response.ok) {
      throw new Error(`Failed to load language content: ${response.status}`);
    }

    return response.json();
  }

  function flattenContent(content) {
    const rows = [];

    Object.entries(content).forEach(([page, section]) => {
      Object.entries(section).forEach(([key, value]) => {
        if (typeof value === "string") {
          rows.push({ page, key, value });
        }
      });
    });

    return rows;
  }

  function expandRows(rows) {
    const result = {};

    rows.forEach(({ page, key, value }) => {
      if (!result[page]) {
        result[page] = {};
      }
      result[page][key] = value;
    });

    return result;
  }

  async function loadRuntimeConfig() {
    if (runtimeConfig) {
      return runtimeConfig;
    }

    try {
      const response = await fetch(CONFIG_ENDPOINT, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Config endpoint unavailable: ${response.status}`);
      }

      runtimeConfig = await response.json();
    } catch (error) {
      runtimeConfig = { supabaseUrl: "", supabaseAnonKey: "" };
    }

    return runtimeConfig;
  }

  async function ensureSupabase() {
    if (supabaseClient) {
      return supabaseClient;
    }

    const config = await loadRuntimeConfig();
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase?.createClient) {
      return null;
    }

    supabaseClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });

    return supabaseClient;
  }

  async function loadRemoteContent(language) {
    const client = await ensureSupabase();
    if (!client) {
      return null;
    }

    const { data, error } = await client
      .from("site_content")
      .select("page,key,value")
      .eq("language", language);

    if (error) {
      console.error("Supabase load failed, fallback to local JSON.", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return expandRows(data);
  }

  async function loadResolvedContent(language) {
    const remote = await loadRemoteContent(language);
    if (remote) {
      return remote;
    }

    const base = await loadBaseContent(language);
    const overrides = loadOverrides(language);
    return deepMerge(base, overrides);
  }

  async function saveRemoteContent(language, content) {
    const client = await ensureSupabase();
    if (!client) {
      return false;
    }

    const rows = flattenContent(content).map((row) => ({
      language,
      page: row.page,
      key: row.key,
      value: row.value
    }));

    const { error } = await client.from("site_content").upsert(rows, {
      onConflict: "language,page,key"
    });

    if (error) {
      console.error("Supabase save failed.", error);
      return false;
    }

    return true;
  }

  async function saveOverrides(language, content) {
    const saved = await saveRemoteContent(language, content);
    if (!saved) {
      saveLocalOverrides(language, content);
    }

    return saved;
  }

  async function clearOverrides(language) {
    const client = await ensureSupabase();
    if (!client) {
      clearLocalOverrides(language);
      return false;
    }

    const { error } = await client.from("site_content").delete().eq("language", language);
    if (error) {
      console.error("Supabase reset failed, fallback to local clear.", error);
      clearLocalOverrides(language);
      return false;
    }

    clearLocalOverrides(language);
    return true;
  }

  async function getSupabaseClient() {
    return ensureSupabase();
  }

  async function isRemoteEnabled() {
    return Boolean(await ensureSupabase());
  }

  window.ContentStore = {
    DEFAULT_LANGUAGE,
    getCurrentLanguage,
    setCurrentLanguage,
    getContentFile,
    loadBaseContent,
    loadOverrides,
    loadResolvedContent,
    saveOverrides,
    clearOverrides,
    getSupabaseClient,
    isRemoteEnabled,
    loadRuntimeConfig
  };
})();
