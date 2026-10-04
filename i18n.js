(function () {
  "use strict";

  var STORAGE_KEY = "ob_locale";
  var DEFAULT_LOCALE = "en-GB";
  var SUPPORTED_LOCALES = [
    { code: "system", nativeName: "Use device language", englishName: "Use device language" },
    { code: "en-GB", nativeName: "English", englishName: "English" },
    { code: "es-ES", nativeName: "Español (España)", englishName: "Spanish (Spain)" },
    { code: "fr-FR", nativeName: "Français", englishName: "French" },
    { code: "de-DE", nativeName: "Deutsch", englishName: "German" },
    { code: "it-IT", nativeName: "Italiano", englishName: "Italian" },
    { code: "pt-BR", nativeName: "Português (Brasil)", englishName: "Portuguese (Brazil)" },
    { code: "nl-NL", nativeName: "Nederlands", englishName: "Dutch" },
    { code: "pl-PL", nativeName: "Polski", englishName: "Polish" },
    { code: "zh-Hans", nativeName: "简体中文", englishName: "Simplified Chinese" }
  ];

  var MESSAGES = {
    "en-GB": {
      "nav.track": "Track",
      "nav.understand": "Understand",
      "nav.grow": "Grow",
      "nav.account": "Account",
      "account.preferences": "Preferences",
      "account.preferences.subtitle": "Theme, language, units, widget colour, reminders",
      "language.title": "Language",
      "language.system": "Use device language",
      "language.subtitle": "Core app labels and native shortcuts",
      "language.reviewNote": "Health and safety guidance stays in English until reviewed.",
      "language.updated": "Language updated",
      "language.current": "Current",
      "theme.day": "Day Mode",
      "theme.night": "Night Mode",
      "theme.auto": "Auto-switches 7pm / 7am",
      "theme.dayButton": "Day",
      "theme.nightButton": "Night",
      "gentle.title": "Gentle Mode",
      "gentle.subtitle": "Hides scores, targets & numbers",
      "gentle.on": "On",
      "gentle.off": "Off",
      "gentle.toastOn": "Gentle Mode on. no scores, no pressure.",
      "gentle.toastOff": "Scores visible again",
      "daily.title": "Daily log reminder",
      "daily.off": "Off. choose a gentle daily nudge",
      "daily.onAt": "Every day at {time}",
      "daily.toastOn": "Daily reminder on",
      "daily.toastOff": "Daily reminder off",
      "common.time": "Time",
      "common.set": "Set",
      "common.clear": "Clear",
      "common.save": "Save",
      "common.cancel": "Cancel"
    },
    "es-ES": {
      "nav.track": "Registrar",
      "nav.understand": "Entender",
      "nav.grow": "Crecer",
      "nav.account": "Cuenta",
      "account.preferences": "Preferencias",
      "account.preferences.subtitle": "Tema, idioma, unidades, color del widget, recordatorios",
      "language.title": "Idioma",
      "language.system": "Usar idioma del dispositivo",
      "language.subtitle": "Etiquetas principales de la app y accesos directos",
      "language.reviewNote": "La orientación de salud y seguridad permanece en inglés hasta su revisión.",
      "language.updated": "Idioma actualizado",
      "language.current": "Actual",
      "theme.day": "Modo día",
      "theme.night": "Modo noche",
      "theme.auto": "Cambia automáticamente 19:00 / 7:00",
      "theme.dayButton": "Día",
      "theme.nightButton": "Noche",
      "gentle.title": "Modo suave",
      "gentle.subtitle": "Oculta puntuaciones, objetivos y números",
      "gentle.on": "Activado",
      "gentle.off": "Desactivado",
      "gentle.toastOn": "Modo suave activado. sin puntuaciones, sin presión.",
      "gentle.toastOff": "Las puntuaciones vuelven a estar visibles",
      "daily.title": "Recordatorio diario",
      "daily.off": "Desactivado. elige un recordatorio suave",
      "daily.onAt": "Cada día a las {time}",
      "daily.toastOn": "Recordatorio diario activado",
      "daily.toastOff": "Recordatorio diario desactivado",
      "common.time": "Hora",
      "common.set": "Configurar",
      "common.clear": "Borrar",
      "common.save": "Guardar",
      "common.cancel": "Cancelar"
    },
    "fr-FR": {
      "nav.track": "Suivre",
      "nav.understand": "Comprendre",
      "nav.grow": "Grandir",
      "nav.account": "Compte",
      "account.preferences": "Préférences",
      "account.preferences.subtitle": "Thème, langue, unités, couleur du widget, rappels",
      "language.title": "Langue",
      "language.system": "Utiliser la langue de l’appareil",
      "language.subtitle": "Libellés principaux de l’app et raccourcis",
      "language.reviewNote": "Les conseils de santé et de sécurité restent en anglais jusqu’à révision.",
      "language.updated": "Langue mise à jour",
      "language.current": "Actuelle",
      "theme.day": "Mode jour",
      "theme.night": "Mode nuit",
      "theme.auto": "Bascule automatique 19 h / 7 h",
      "theme.dayButton": "Jour",
      "theme.nightButton": "Nuit",
      "gentle.title": "Mode doux",
      "gentle.subtitle": "Masque les scores, objectifs et chiffres",
      "gentle.on": "Activé",
      "gentle.off": "Désactivé",
      "gentle.toastOn": "Mode doux activé. pas de scores, pas de pression.",
      "gentle.toastOff": "Scores à nouveau visibles",
      "daily.title": "Rappel quotidien",
      "daily.off": "Désactivé. choisissez un rappel doux",
      "daily.onAt": "Tous les jours à {time}",
      "daily.toastOn": "Rappel quotidien activé",
      "daily.toastOff": "Rappel quotidien désactivé",
      "common.time": "Heure",
      "common.set": "Définir",
      "common.clear": "Effacer",
      "common.save": "Enregistrer",
      "common.cancel": "Annuler"
    },
    "de-DE": {
      "nav.track": "Erfassen",
      "nav.understand": "Verstehen",
      "nav.grow": "Wachsen",
      "nav.account": "Konto",
      "account.preferences": "Einstellungen",
      "account.preferences.subtitle": "Design, Sprache, Einheiten, Widget-Farbe, Erinnerungen",
      "language.title": "Sprache",
      "language.system": "Gerätesprache verwenden",
      "language.subtitle": "Wichtige App-Beschriftungen und Kurzbefehle",
      "language.reviewNote": "Gesundheits- und Sicherheitshinweise bleiben bis zur Prüfung auf Englisch.",
      "language.updated": "Sprache aktualisiert",
      "language.current": "Aktuell",
      "theme.day": "Tagmodus",
      "theme.night": "Nachtmodus",
      "theme.auto": "Automatisch 19:00 / 7:00",
      "theme.dayButton": "Tag",
      "theme.nightButton": "Nacht",
      "gentle.title": "Sanfter Modus",
      "gentle.subtitle": "Blendet Werte, Ziele und Zahlen aus",
      "gentle.on": "Ein",
      "gentle.off": "Aus",
      "gentle.toastOn": "Sanfter Modus aktiv. keine Werte, kein Druck.",
      "gentle.toastOff": "Werte sind wieder sichtbar",
      "daily.title": "Tägliche Erinnerung",
      "daily.off": "Aus. wähle eine sanfte tägliche Erinnerung",
      "daily.onAt": "Jeden Tag um {time}",
      "daily.toastOn": "Tägliche Erinnerung ein",
      "daily.toastOff": "Tägliche Erinnerung aus",
      "common.time": "Zeit",
      "common.set": "Festlegen",
      "common.clear": "Löschen",
      "common.save": "Speichern",
      "common.cancel": "Abbrechen"
    },
    "it-IT": {
      "nav.track": "Registra",
      "nav.understand": "Capire",
      "nav.grow": "Crescere",
      "nav.account": "Account",
      "account.preferences": "Preferenze",
      "account.preferences.subtitle": "Tema, lingua, unità, colore widget, promemoria",
      "language.title": "Lingua",
      "language.system": "Usa lingua del dispositivo",
      "language.subtitle": "Etichette principali dell’app e scorciatoie",
      "language.reviewNote": "Le indicazioni su salute e sicurezza restano in inglese finché non vengono riviste.",
      "language.updated": "Lingua aggiornata",
      "language.current": "Attuale",
      "theme.day": "Modalità giorno",
      "theme.night": "Modalità notte",
      "theme.auto": "Cambio automatico 19:00 / 7:00",
      "theme.dayButton": "Giorno",
      "theme.nightButton": "Notte",
      "gentle.title": "Modalità delicata",
      "gentle.subtitle": "Nasconde punteggi, obiettivi e numeri",
      "gentle.on": "Attiva",
      "gentle.off": "Disattiva",
      "gentle.toastOn": "Modalità delicata attiva. niente punteggi, niente pressione.",
      "gentle.toastOff": "Punteggi di nuovo visibili",
      "daily.title": "Promemoria giornaliero",
      "daily.off": "Disattivato. scegli un promemoria delicato",
      "daily.onAt": "Ogni giorno alle {time}",
      "daily.toastOn": "Promemoria giornaliero attivato",
      "daily.toastOff": "Promemoria giornaliero disattivato",
      "common.time": "Ora",
      "common.set": "Imposta",
      "common.clear": "Cancella",
      "common.save": "Salva",
      "common.cancel": "Annulla"
    },
    "pt-BR": {
      "nav.track": "Registrar",
      "nav.understand": "Entender",
      "nav.grow": "Crescer",
      "nav.account": "Conta",
      "account.preferences": "Preferências",
      "account.preferences.subtitle": "Tema, idioma, unidades, cor do widget, lembretes",
      "language.title": "Idioma",
      "language.system": "Usar idioma do dispositivo",
      "language.subtitle": "Rótulos principais do app e atalhos",
      "language.reviewNote": "As orientações de saúde e segurança ficam em inglês até revisão.",
      "language.updated": "Idioma atualizado",
      "language.current": "Atual",
      "theme.day": "Modo dia",
      "theme.night": "Modo noite",
      "theme.auto": "Alterna automaticamente 19:00 / 7:00",
      "theme.dayButton": "Dia",
      "theme.nightButton": "Noite",
      "gentle.title": "Modo suave",
      "gentle.subtitle": "Oculta pontuações, metas e números",
      "gentle.on": "Ativado",
      "gentle.off": "Desativado",
      "gentle.toastOn": "Modo suave ativado. sem pontuações, sem pressão.",
      "gentle.toastOff": "Pontuações visíveis novamente",
      "daily.title": "Lembrete diário",
      "daily.off": "Desativado. escolha um lembrete suave",
      "daily.onAt": "Todos os dias às {time}",
      "daily.toastOn": "Lembrete diário ativado",
      "daily.toastOff": "Lembrete diário desativado",
      "common.time": "Hora",
      "common.set": "Definir",
      "common.clear": "Limpar",
      "common.save": "Salvar",
      "common.cancel": "Cancelar"
    },
    "nl-NL": {
      "nav.track": "Bijhouden",
      "nav.understand": "Begrijpen",
      "nav.grow": "Groeien",
      "nav.account": "Account",
      "account.preferences": "Voorkeuren",
      "account.preferences.subtitle": "Thema, taal, eenheden, widgetkleur, herinneringen",
      "language.title": "Taal",
      "language.system": "Apparaattaal gebruiken",
      "language.subtitle": "Belangrijkste app-labels en snelkoppelingen",
      "language.reviewNote": "Gezondheids- en veiligheidsadvies blijft Engels tot het is nagekeken.",
      "language.updated": "Taal bijgewerkt",
      "language.current": "Huidig",
      "theme.day": "Dagmodus",
      "theme.night": "Nachtmodus",
      "theme.auto": "Schakelt automatisch 19:00 / 7:00",
      "theme.dayButton": "Dag",
      "theme.nightButton": "Nacht",
      "gentle.title": "Zachte modus",
      "gentle.subtitle": "Verbergt scores, doelen en cijfers",
      "gentle.on": "Aan",
      "gentle.off": "Uit",
      "gentle.toastOn": "Zachte modus aan. geen scores, geen druk.",
      "gentle.toastOff": "Scores weer zichtbaar",
      "daily.title": "Dagelijkse herinnering",
      "daily.off": "Uit. kies een zachte dagelijkse herinnering",
      "daily.onAt": "Elke dag om {time}",
      "daily.toastOn": "Dagelijkse herinnering aan",
      "daily.toastOff": "Dagelijkse herinnering uit",
      "common.time": "Tijd",
      "common.set": "Instellen",
      "common.clear": "Wissen",
      "common.save": "Opslaan",
      "common.cancel": "Annuleren"
    },
    "pl-PL": {
      "nav.track": "Rejestruj",
      "nav.understand": "Zrozum",
      "nav.grow": "Rozwój",
      "nav.account": "Konto",
      "account.preferences": "Preferencje",
      "account.preferences.subtitle": "Motyw, język, jednostki, kolor widżetu, przypomnienia",
      "language.title": "Język",
      "language.system": "Użyj języka urządzenia",
      "language.subtitle": "Główne etykiety aplikacji i skróty",
      "language.reviewNote": "Wskazówki dotyczące zdrowia i bezpieczeństwa pozostają po angielsku do czasu weryfikacji.",
      "language.updated": "Język zaktualizowany",
      "language.current": "Bieżący",
      "theme.day": "Tryb dzienny",
      "theme.night": "Tryb nocny",
      "theme.auto": "Automatycznie 19:00 / 7:00",
      "theme.dayButton": "Dzień",
      "theme.nightButton": "Noc",
      "gentle.title": "Tryb łagodny",
      "gentle.subtitle": "Ukrywa wyniki, cele i liczby",
      "gentle.on": "Włączony",
      "gentle.off": "Wyłączony",
      "gentle.toastOn": "Tryb łagodny włączony. bez wyników, bez presji.",
      "gentle.toastOff": "Wyniki znów widoczne",
      "daily.title": "Codzienne przypomnienie",
      "daily.off": "Wyłączone. wybierz łagodne przypomnienie",
      "daily.onAt": "Codziennie o {time}",
      "daily.toastOn": "Codzienne przypomnienie włączone",
      "daily.toastOff": "Codzienne przypomnienie wyłączone",
      "common.time": "Godzina",
      "common.set": "Ustaw",
      "common.clear": "Wyczyść",
      "common.save": "Zapisz",
      "common.cancel": "Anuluj"
    },
    "zh-Hans": {
      "nav.track": "记录",
      "nav.understand": "了解",
      "nav.grow": "成长",
      "nav.account": "账户",
      "account.preferences": "偏好设置",
      "account.preferences.subtitle": "主题、语言、单位、小组件颜色、提醒",
      "language.title": "语言",
      "language.system": "使用设备语言",
      "language.subtitle": "核心应用标签和快捷操作",
      "language.reviewNote": "健康和安全指导在审核前保留英文。",
      "language.updated": "语言已更新",
      "language.current": "当前",
      "theme.day": "日间模式",
      "theme.night": "夜间模式",
      "theme.auto": "自动切换 19:00 / 7:00",
      "theme.dayButton": "日间",
      "theme.nightButton": "夜间",
      "gentle.title": "温和模式",
      "gentle.subtitle": "隐藏评分、目标和数字",
      "gentle.on": "开启",
      "gentle.off": "关闭",
      "gentle.toastOn": "温和模式已开启。没有评分，没有压力。",
      "gentle.toastOff": "评分已重新显示",
      "daily.title": "每日记录提醒",
      "daily.off": "关闭。选择一个温和的每日提醒",
      "daily.onAt": "每天 {time}",
      "daily.toastOn": "每日提醒已开启",
      "daily.toastOff": "每日提醒已关闭",
      "common.time": "时间",
      "common.set": "设置",
      "common.clear": "清除",
      "common.save": "保存",
      "common.cancel": "取消"
    }
  };

  var ALIASES = {
    "en": "en-GB", "en-gb": "en-GB", "en-us": "en-GB", "en-au": "en-GB", "en-ca": "en-GB", "en-nz": "en-GB",
    "es": "es-ES", "es-es": "es-ES", "es-mx": "es-ES", "es-419": "es-ES", "es-us": "es-ES",
    "fr": "fr-FR", "fr-fr": "fr-FR", "fr-ca": "fr-FR",
    "de": "de-DE", "de-de": "de-DE", "de-at": "de-DE", "de-ch": "de-DE",
    "it": "it-IT", "it-it": "it-IT",
    "pt-br": "pt-BR",
    "nl": "nl-NL", "nl-nl": "nl-NL", "nl-be": "nl-NL",
    "pl": "pl-PL", "pl-pl": "pl-PL",
    "zh-cn": "zh-Hans", "zh-hans": "zh-Hans", "zh-sg": "zh-Hans"
  };

  var LANGUAGE_FALLBACKS = {
    "en": "en-GB",
    "es": "es-ES",
    "fr": "fr-FR",
    "de": "de-DE",
    "it": "it-IT",
    "nl": "nl-NL",
    "pl": "pl-PL"
  };

  function normaliseLocale(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    if (raw === "system") return "system";
    var lower = raw.replace(/_/g, "-").toLowerCase();
    if (ALIASES[lower]) return ALIASES[lower];
    if (LANGUAGE_FALLBACKS[lower.split("-")[0]]) return LANGUAGE_FALLBACKS[lower.split("-")[0]];
    return "";
  }

  function getStoredPreference() {
    try {
      return normaliseLocale(localStorage.getItem(STORAGE_KEY)) || "system";
    } catch (_) {
      return "system";
    }
  }

  function resolveSystemLocale() {
    var list = [];
    try {
      if (navigator.languages && navigator.languages.length) list = Array.prototype.slice.call(navigator.languages);
      else if (navigator.language) list = [navigator.language];
    } catch (_) {}
    for (var i = 0; i < list.length; i++) {
      var locale = normaliseLocale(list[i]);
      if (locale && locale !== "system") return locale;
    }
    return DEFAULT_LOCALE;
  }

  function getPreference() {
    return getStoredPreference();
  }

  function getLocale() {
    var preference = getPreference();
    return preference === "system" ? resolveSystemLocale() : (normaliseLocale(preference) || DEFAULT_LOCALE);
  }

  function format(template, vars) {
    return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, key) {
      return vars && Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : "";
    });
  }

  function t(key, vars) {
    var locale = getLocale();
    var table = MESSAGES[locale] || MESSAGES[DEFAULT_LOCALE];
    var english = MESSAGES[DEFAULT_LOCALE] || {};
    return format(table[key] || english[key] || key, vars);
  }

  function applyDocumentLocale() {
    try {
      var locale = getLocale();
      document.documentElement.lang = locale === "zh-Hans" ? "zh-Hans" : locale;
      document.documentElement.dir = "ltr";
    } catch (_) {}
  }

  function setLocale(value) {
    var next = normaliseLocale(value) || "system";
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
    try {
      var prefs = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences;
      if (prefs && typeof prefs.set === "function") prefs.set({ key: STORAGE_KEY, value: next });
    } catch (_) {}
    applyDocumentLocale();
    try {
      window.dispatchEvent(new CustomEvent("ob-locale-change", { detail: { preference: next, locale: getLocale() } }));
    } catch (_) {}
    return next;
  }

  function getSupportedLocales() {
    return SUPPORTED_LOCALES.slice();
  }

  window.OBI18N = {
    defaultLocale: DEFAULT_LOCALE,
    messages: MESSAGES,
    storageKey: STORAGE_KEY,
    getLocale: getLocale,
    getPreference: getPreference,
    getSupportedLocales: getSupportedLocales,
    normaliseLocale: normaliseLocale,
    resolveSystemLocale: resolveSystemLocale,
    setLocale: setLocale,
    t: t
  };

  applyDocumentLocale();
})();
