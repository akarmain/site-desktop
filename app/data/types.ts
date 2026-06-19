// Локализованная строка: одно поле на язык. Контент = data + перевод в одном месте.
export type Loc = { ru: string; en: string }

// Поле, которое либо одинаково на всех языках (просто строка), либо переведено.
export type Localizable = string | Loc
