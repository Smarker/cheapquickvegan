// Function to generate FAQ JSON-LD from Notion-rendered markdown/content
export function generateFaqJsonLd(faqContent: string) {
  const lines = faqContent
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: { "@type": string; text: string }
  }> = [];

  let currentQuestion: string | null = null;

  lines.forEach(line => {
    if (line.startsWith("**Q:")) {
      currentQuestion = line.replace("**Q:", "").replace("**", "").trim();
    } else if (currentQuestion && (line.startsWith("**A:") || line.startsWith("A:"))) {
      // Handle both **A:** and A: formats
      let answerText = line;
      if (line.startsWith("**A:")) {
        answerText = line.replace("**A:", "").replace("**", "").trim();
      } else {
        answerText = line.replace("A:", "").trim();
      }
      mainEntity.push({
        "@type": "Question",
        name: currentQuestion,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerText,
        },
      });
      currentQuestion = null;
    }
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity,
  };
}
