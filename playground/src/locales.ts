import type { MessageKey, MessageValue } from "ooui-react";
import ar from "ooui-react/locales/ar";
import bn from "ooui-react/locales/bn";
import cs from "ooui-react/locales/cs";
import de from "ooui-react/locales/de";
import es from "ooui-react/locales/es";
import fa from "ooui-react/locales/fa";
import fr from "ooui-react/locales/fr";
import he from "ooui-react/locales/he";
import hi from "ooui-react/locales/hi";
import id from "ooui-react/locales/id";
import it from "ooui-react/locales/it";
import ja from "ooui-react/locales/ja";
import ko from "ooui-react/locales/ko";
import nl from "ooui-react/locales/nl";
import pl from "ooui-react/locales/pl";
import ptBr from "ooui-react/locales/pt-br";
import ru from "ooui-react/locales/ru";
import sv from "ooui-react/locales/sv";
import th from "ooui-react/locales/th";
import tr from "ooui-react/locales/tr";
import uk from "ooui-react/locales/uk";
import vi from "ooui-react/locales/vi";
import yueHant from "ooui-react/locales/yue-hant";
import zhHans from "ooui-react/locales/zh-hans";
import zhHant from "ooui-react/locales/zh-hant";

/** playground 语言切换项：label 为语言自称（切换后自身即为可读状态） */
export interface PlaygroundLocaleOption {
  /** 语言代码，同 `ooui-react/locales/<代码>` 子路径 */
  value: string;
  /** 语言自称 */
  label: string;
  /** 该语言的消息表；`en` 为内建基线，取 undefined（OOUIProvider 不收 messages 即英文默认） */
  messages?: Partial<Record<MessageKey, MessageValue>>;
}

/** 头部语言下拉的选项：从库内建语言包中取常用语种（顺序同选取排行），供语言切换与文案下发 */
export const localeOptions: PlaygroundLocaleOption[] = [
  { value: "en", label: "English" },
  { value: "zh-hans", label: "简体中文", messages: zhHans },
  { value: "zh-hant", label: "繁體中文", messages: zhHant },
  { value: "yue-hant", label: "粵語", messages: yueHant },
  { value: "es", label: "Español", messages: es },
  { value: "pt-br", label: "Português do Brasil", messages: ptBr },
  { value: "ru", label: "Русский", messages: ru },
  { value: "ja", label: "日本語", messages: ja },
  { value: "de", label: "Deutsch", messages: de },
  { value: "fr", label: "Français", messages: fr },
  { value: "ko", label: "한국어", messages: ko },
  { value: "it", label: "Italiano", messages: it },
  { value: "pl", label: "Polski", messages: pl },
  { value: "nl", label: "Nederlands", messages: nl },
  { value: "uk", label: "Українська", messages: uk },
  { value: "tr", label: "Türkçe", messages: tr },
  { value: "vi", label: "Tiếng Việt", messages: vi },
  { value: "id", label: "Bahasa Indonesia", messages: id },
  { value: "fa", label: "فارسی", messages: fa },
  { value: "ar", label: "العربية", messages: ar },
  { value: "he", label: "עברית", messages: he },
  { value: "hi", label: "हिन्दी", messages: hi },
  { value: "bn", label: "বাংলা", messages: bn },
  { value: "th", label: "ไทย", messages: th },
  { value: "cs", label: "Čeština", messages: cs },
  { value: "sv", label: "Svenska", messages: sv },
];
