/**
 * Hard-splits a string into chunks of up to maxLength characters.
 */
export const hardSplit = (text: string, maxLength: number = 10): string[] => {
  const regex = new RegExp(`.{1,${maxLength}}`, "g");
  return text.match(regex) || [];
};

/**
 * Batches an array of words together, trying to get as close as possible
 * to maxLength characters per batch. If a word is too long, it is hard-split.
 */
export const batchWords = (words: string[], maxLength: number = 10): string[] => {
  const result: string[] = [];
  let currentBatch = "";

  for (const word of words) {
    if (word.length > maxLength) {
      // Flush the current batch if any.
      if (currentBatch) {
        result.push(currentBatch);
        currentBatch = "";
      }
      // Hard-split the long word.
      result.push(...hardSplit(word, maxLength));
    } else {
      if (!currentBatch) {
        currentBatch = word;
      } else {
        // Check if adding this word with a space stays within maxLength.
        if (currentBatch.length + 1 + word.length <= maxLength) {
          currentBatch = `${currentBatch} ${word}`;
        } else {
          result.push(currentBatch);
          currentBatch = word;
        }
      }
    }
  }

  if (currentBatch) {
    result.push(currentBatch);
  }

  return result;
};

/**
 * Splits text by spaces first. Then, batches the words together.
 * If no spaces exist, it hard-splits the text directly.
 */
export const splitVariety = (text: string, maxLength: number = 10): string[] => {
  if (text.includes(" ")) {
    const words = text.split(" ");
    return batchWords(words, maxLength);
  }
  // No spaces, so hard split directly.
  return hardSplit(text, maxLength);
};
