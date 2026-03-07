export async function analyzeStyle(images: string[]): Promise<object> {
  // TODO: Integrate with Google Gemini API
  // const response = await fetch(process.env.GEMINI_API_URL, { ... });
  console.log("Gemini analyzeStyle called with", images.length, "images");
  return { keywords: [], style: "unknown" };
}
