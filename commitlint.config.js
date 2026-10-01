export default {
  extends: ['@commitlint/config-conventional'],
  // Commit-Texte sind deutsch, Substantive am Satzanfang groß.
  rules: { 'subject-case': [0] },
};
