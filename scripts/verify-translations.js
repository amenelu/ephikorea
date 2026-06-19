const fs = require("fs");
const path = require("path");

const translationsPath = path.join(process.cwd(), "src", "lib", "translations.ts");
const source = fs.readFileSync(translationsPath, "utf8");

const MOJIBAKE_MARKERS = [
  "Â",
  "Ã",
  "ì",
  "í",
  "ê",
  "ë",
  "ð",
  "�",
];

function extractLocaleBlock(locale) {
  const startMarker = `  ${locale}: {`;
  const startIndex = source.indexOf(startMarker);

  if (startIndex === -1) {
    throw new Error(`Missing ${locale} translation block.`);
  }

  let index = startIndex + startMarker.length;
  let depth = 1;

  while (index < source.length && depth > 0) {
    const char = source[index];

    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    index += 1;
  }

  return source.slice(startIndex, index);
}

function extractKeys(block) {
  return [...block.matchAll(/"([^"]+)":/g)].map((match) => match[1]);
}

const englishBlock = extractLocaleBlock("en");
const koreanBlock = extractLocaleBlock("ko");
const englishKeys = extractKeys(englishBlock);
const koreanKeys = extractKeys(koreanBlock);
const missingKoreanKeys = englishKeys.filter((key) => !koreanKeys.includes(key));
const extraKoreanKeys = koreanKeys.filter((key) => !englishKeys.includes(key));
const mojibakeHits = MOJIBAKE_MARKERS.filter((marker) => koreanBlock.includes(marker));
const hangulCount = (koreanBlock.match(/[가-힣]/g) || []).length;

if (missingKoreanKeys.length > 0) {
  throw new Error(`Korean translations are missing keys: ${missingKoreanKeys.join(", ")}`);
}

if (extraKoreanKeys.length > 0) {
  throw new Error(`Korean translations include unknown keys: ${extraKoreanKeys.join(", ")}`);
}

if (mojibakeHits.length > 0) {
  throw new Error(`Korean translations appear corrupted: found ${mojibakeHits.join(", ")}`);
}

if (hangulCount < 100) {
  throw new Error("Korean translations do not contain enough Hangul characters.");
}

console.log("Translation integrity check passed.");
