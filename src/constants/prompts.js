export const PROMPTS = {

  generateCase: (difficulty = 'medium') => {
    const lockedClues =
      difficulty === 'easy' ? [false, false, false, false, false] :
      difficulty === 'hard' ? [false, true,  true,  true,  true ] :
                              [false, false, true,  true,  true  ];

    return `You are a mystery case generator for a psychological mystery game inspired by the Japanese drama "Don't Call It Mystery" (ミステリと言う勿れ). Generate a COMPLETE mystery case with rich psychological depth.

Difficulty: ${difficulty.toUpperCase()}
${difficulty === 'easy'   ? '— Make the clues obvious. The motive should be clear from the evidence.' : ''}
${difficulty === 'hard'   ? '— Make it complex with deep red herrings. The motive should be subtle and psychological.' : ''}
${difficulty === 'medium' ? '— Balanced difficulty. Some red herrings but a fair mystery.' : ''}

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
      "locked": ${lockedClues[0]}
    },
    {
      "id": "clue_2",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": ${lockedClues[1]}
    },
    {
      "id": "clue_3",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": ${lockedClues[2]}
    },
    {
      "id": "clue_4",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": ${lockedClues[3]}
    },
    {
      "id": "clue_5",
      "title": "Clue name",
      "description": "What was found and where",
      "significance": "What this clue reveals",
      "locked": ${lockedClues[4]}
    }
  ],
  "triviaQuestions": [
    {
      "clueId": "clue_2",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "clueId": "clue_3",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 2,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "clueId": "clue_4",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "explanation": "Brief explanation of why this is correct"
    },
    {
      "clueId": "clue_5",
      "question": "A psychology/criminology/science/history trivia question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 3,
      "explanation": "Brief explanation of why this is correct"
    }
  ],
  "truth": {
    "culpritId": "suspect_X",
    "method": "How the crime was committed",
    "motive": "Deep psychological motive",
    "explanation": "Full reveal of what really happened"
  },
  "didYouKnow": {
    "fact": "An interesting educational fact related to the case theme",
    "source": "Field or discipline this comes from"
  }
}

Make the mystery psychologically complex. The culprit should be genuinely surprising but fair. Include red herrings.`;
  },

  judgeTheory: (caseData, theory, difficulty = 'medium') => `You are judging a player's theory in a mystery game.

DIFFICULTY: ${difficulty.toUpperCase()}
${difficulty === 'easy' ? '— Be generous. Partial answers deserve good scores.' : ''}
${difficulty === 'hard' ? '— Be strict. Only reward exact culprit AND detailed correct motive.' : ''}
${difficulty === 'medium' ? '— Be fair and balanced.' : ''}

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
  "reaction": "One dramatic sentence reacting to their theory",
  "whatTheyGotRight": "What elements were accurate",
  "whatTheyMissed": "Key things they missed",
  "fullReveal": "The complete truth in 2-3 paragraphs"
}

Scoring guide (adjust based on difficulty):
- Easy:   80-100 for culprit only, 50+ for close guess
- Medium: 80-100 for culprit AND motive, 50-79 for culprit only
- Hard:   80-100 for culprit AND exact motive AND method`,

  interrogate: (caseData, question, history, difficulty = 'medium') => `You are a detective narrator in a mystery game.

DIFFICULTY: ${difficulty.toUpperCase()}
${difficulty === 'easy' ? '— Give helpful, somewhat direct hints. Point toward the right suspects.' : ''}
${difficulty === 'hard' ? '— Give only vague psychological observations. Never hint at the culprit directly.' : ''}
${difficulty === 'medium' ? '— Give thoughtful hints without directly revealing the answer.' : ''}

CASE: ${caseData.title}
SUSPECTS: ${caseData.suspects.map(s => s.name).join(', ')}
CLUES FOUND: ${caseData.clues.filter(c => !c.locked).map(c => c.title).join(', ')}

HISTORY:
${history.map(h => `${h.role}: ${h.content}`).join('\n')}

QUESTION: "${question}"

Keep response under 120 words. Stay in character.`,

  generateDidYouKnow: (caseData) => `Based on this mystery case, generate an interesting educational fact.

Case theme: ${caseData.truth.motive}
Case method: ${caseData.truth.method}

Respond ONLY with a JSON object:
{
  "fact": "A fascinating educational fact related to the psychology, forensics, history, or science in this case.",
  "category": "Psychology | Forensics | History | Science | Criminology"
}`,
};