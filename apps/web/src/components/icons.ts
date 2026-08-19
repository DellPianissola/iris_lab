/**
 * O conjunto de ícones do produto, num arquivo só — dá para auditar o que entra sem varrer
 * os componentes, e o import fica curto no lugar de uso.
 *
 * Emoji saiu daqui de propósito: renderiza diferente em cada sistema, **não herda
 * `currentColor`** (então não acompanha o tema) e leitor de tela anuncia "dado de jogo" no
 * lugar de "aleatório". Heroicons são SVG inline, herdam a cor e recebem tamanho por CSS.
 *
 * O apelido descreve o papel no produto; o nome original fica ao lado porque é por ele que
 * se procura um substituto no catálogo do Heroicons.
 */
export {
  ArrowDownTrayIcon as DownloadIcon, //   heroicons: arrow-down-tray
  ArrowPathIcon as RandomIcon, //         heroicons: arrow-path
  ArrowsRightLeftIcon as InvertIcon, //   heroicons: arrows-right-left
  ArrowUturnLeftIcon as UndoIcon, //      heroicons: arrow-uturn-left
  ArrowUturnRightIcon as RedoIcon, //     heroicons: arrow-uturn-right
  ArrowUpTrayIcon as UploadIcon, //       heroicons: arrow-up-tray
  LinkIcon, //                            heroicons: link
  CheckIcon, //                           heroicons: check
  ExclamationTriangleIcon as WarningIcon, // heroicons: exclamation-triangle
  LanguageIcon, //                        heroicons: language
  MoonIcon, //                            heroicons: moon
  PlusIcon, //                            heroicons: plus
  SparklesIcon as DeriveIcon, //          heroicons: sparkles
  SunIcon, //                             heroicons: sun
  XMarkIcon as CloseIcon, //              heroicons: x-mark
} from '@heroicons/react/24/outline'
