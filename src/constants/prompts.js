export const PROMPTS = {

  generateCase: () => `You are a mystery case generator for a psychological mystery game inspired by the Japanese drama "Don't Call It Mystery" (ミステリと言う勿れ). Generate a COMPLETE mystery case with rich psychological depth.

Respond ONLY with a valid JSON object — no markdown, no preamble. Use this exact structure:

{
  "title": "Case title (evocative, dramatic)",
  "setting": "One paragraph describing the location, time period, atmosphere",
  "victim": {
    "name": "Full name",
    "age": number,
    "occupation": "Job/role",
    "description": "Physical and personality description",
    "background": "Key backstory relevant to the mystery"
  },
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full name",
      "age": number,
      "occupation": "Job/role",
      "relationship": "Their relationship to the victim",
      "description": "Physical and personality description",
      "sprite": "suspect_tall_male",
      "alibi": "Their stated alibi",
      "secret": "A secret they are hiding (NOT necessarily the murder)"
    },
    {
      "id": "suspect_2",
      "name": "Full name",
      "age": number,
      "occupation": "Job/role",
      "relationship": "Their relationship to the victim",
      "description": "Physical and personality description",
      "sprite": "suspect_female",
      "alibi": "Their stated alibi",
      "secret": "A secret they are hiding"
    },
    {
      "id": "suspect_3",
      "name": "Full name",
      "age": number,
      "occupation": "Job/role",
      "relationship": "Their relationship to the victim",
      "description": "Physical and personality description",
      "sprite": "suspect_hooded",
      "alibi": "Their stated alibi",
      "secret": "A secret they are hiding"
    },
    {
      "id": "suspect_4",
      "name": "Full name",
      "age": number,
      "occupation": "Job/role",
      "relationship": "Their relationship to the victim",
      "description": "Physical and personality description",
      "sprite": "suspect_stocky_male",
      "alibi": "Their stated alibi",
      "secret": "A secret they are hiding"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": false
    },
    {
      "id": "clue_2",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": false
    },
    {
      "id": "clue_3",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": true
    },
    {
      "id": "clue_4",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": true
    },
    {
      "id": "clue_5",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": true
    }
  ],
  "triviaQuestions": [
    {
      "clueId": "clue_3",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "clueId": "clue_4",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "clueId": "clue_5",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Brief explanation of why this is correct"
    }
  ],
  "truth": {
    "culpritId": "suspect_X",
    "method": "How the crime was committed",
    "motive": "Deep psychological motive — explore the human psychology thoroughly",
    "explanation": "Full 3-4 paragraph reveal of what really happened, with psychological depth"
  },
  "didYouKnow": {
    "fact": "An interesting educational fact related to the case theme (psychology, forensics, history, science)",
    "source": "Field or discipline this comes from"
  }
}

Make the mystery psychologically complex. The motive should reflect deep human emotions — jealousy, grief, survival, betrayal, identity. The culprit should be genuinely surprising but fair. Include red herrings.`,

  judgeTheory: (caseData, theory) => `You are judging a player's theory in a mystery game. Be fair, analytical, and dramatically satisfying.

THE CASE:
Title: ${caseData.title}
Culprit: ${caseData.suspects.find(s => s.id === caseData.truth.culpritId)?.name}
True Motive: ${caseData.truth.motive}
True Method: ${caseData.truth.method}

PLAYER'S THEORY:
"${theory}"

Respond ONLY with a valid JSON object:
{
  "score": number between 0-100,
  "verdict": "CORRECT" | "PARTIALLY CORRECT" | "INCORRECT",
  "reaction": "One dramatic sentence reacting to their theory (in the voice of a wise detective)",
  "whatTheyGotRight": "What elements of their theory were accurate (or 'Nothing' if fully wrong)",
  "whatTheyMissed": "Key things they missed or got wrong",
  "fullReveal": "The complete truth, dramatically revealed in 2-3 paragraphs"
}

Scoring guide:
- 80-100: Correctly identified culprit AND motive
- 50-79: Correct culprit but wrong motive, OR wrong culprit but correct psychological insight
- 20-49: Partial credit for identifying relevant suspects or themes
- 0-19: Completely wrong`,

  interrogate: (caseData, question, history) => `You are playing the role of a wise, slightly theatrical detective narrator in a mystery game. The player is asking follow-up questions about the case.

CASE: ${caseData.title}
SETTING: ${caseData.setting}
SUSPECTS: ${caseData.suspects.map(s => s.name).join(', ')}
CLUES FOUND: ${caseData.clues.filter(c => !c.locked).map(c => c.title).join(', ')}

CONVERSATION HISTORY:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

PLAYER QUESTION: "${question}"

Answer helpfully but don't reveal the culprit or full solution outright. Give thoughtful, psychologically-rich hints. Stay in character as a dramatic detective narrator. Keep response under 150 words.`,

  generateDidYouKnow: (caseData) => `Based on this mystery case, generate an interesting educational "Did You Know?" fact.

Case theme: ${caseData.truth.motive}
Case method: ${caseData.truth.method}

Respond ONLY with a JSON object:
{
  "fact": "An interesting, surprising educational fact related to the psychology, forensics, history, or science themes in this case. Make it genuinely fascinating — something the player will remember.",
  "category": "Psychology | Forensics | History | Science | Criminology"
}`,
};
