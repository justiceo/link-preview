import locales from './locale.json';

/*
 * All supported locales for STT - https://cloud.google.com/speech-to-text/docs/languages
 * https://docs.google.com/spreadsheets/d/109VdbrRIMspIdKzrcxb6tEG0TxJhwfGLU6pex4Y8zrM/edit#gid=0
 */
export type LocaleProperties = {
  name: string;
  bcp_47: string;
  model:
    | 'Default'
    | 'Command and search'
    | 'Phone call'
    | 'Enhanced phone call'
    | 'Medical Dictation'
    | 'Medical Conversation'
    | 'Enhanced video';
  automatic_punctuation: '' | '✔';
  diarization: '' | '✔';
  boost: '' | '✔';
  word_level_confidence: '' | '✔';
  profanity_filter: '' | '✔';
  spoken_punctuation: '' | '✔';
  spoken_emojis: '' | '✔';
};

const SupportedLocalesAndProperties: LocaleProperties[] =
  locales as LocaleProperties[];

export const LocalesForDefaultModel = SupportedLocalesAndProperties.filter(
  (l: LocaleProperties) => l.model === 'Default'
);
export const DefaultLocale = LocalesForDefaultModel.filter(
  (l: LocaleProperties) => l.bcp_47 === 'en-US'
)[0];
