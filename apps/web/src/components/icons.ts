/**
 * One file so the set can be audited without grepping the components, and the import stays
 * short at the call site.
 *
 * Emoji left on purpose: they render differently on every system, **do not inherit
 * `currentColor`** (so they never follow the theme), and a screen reader announces "game
 * die" where the button means "random". Heroicons are inline SVG, inherit the colour and
 * take their size from CSS.
 *
 * The alias describes the role in the product; the original name sits beside it because that
 * is what you search for in the Heroicons catalogue.
 */
export {
  ArrowDownTrayIcon as DownloadIcon, //   heroicons: arrow-down-tray
  ArrowPathIcon as RandomIcon, //         heroicons: arrow-path
  ArrowsRightLeftIcon as InvertIcon, //   heroicons: arrows-right-left
  ArrowUturnLeftIcon as UndoIcon, //      heroicons: arrow-uturn-left
  ArrowUturnRightIcon as RedoIcon, //     heroicons: arrow-uturn-right
  ArrowUpTrayIcon as UploadIcon, //       heroicons: arrow-up-tray
  ChevronDownIcon, //                     heroicons: chevron-down
  QuestionMarkCircleIcon as HelpIcon, //  heroicons: question-mark-circle
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
