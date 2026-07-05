export interface ChatContext {
  userName: string;
  userRole: string;
  userDepartment: string;
  managerName: string;
  leaveBalances: string;
  recentAttendance: string;
}

/**
 * Summarize an announcement card utilizing Gemini 1.5 Flash API
 */
export const generateSummaryFromGemini = async (title: string, content: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }

  const promptText = `You are an HR intranet assistant. Summarize the following corporate announcement in 1 to 2 concise sentences. Maintain a professional, positive tone. Do not add markdown links or citations.
Announcement Title: ${title}
Announcement Body: ${content}

Summary:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response candidate structure from Gemini");
  }
  return text.trim();
};

/**
 * Converse with virtual HR Assistant utilising Gemini 1.5 Flash API with user context injection
 */
export const generateChatResponseFromGemini = async (
  messageText: string,
  history: { sender: 'user' | 'bot'; text: string }[],
  context: ChatContext
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not defined");
  }

  const systemInstructions = `You are a helpful virtual HR assistant in our company's employee intranet portal.
Your job is to answer the employee's queries about leaves, shift check-ins (punches), coworker details, or company guidelines.
Use the following context about the logged-in employee to provide personalized, exact answers:
- Employee Name: ${context.userName}
- Role: ${context.userRole}
- Department: ${context.userDepartment}
- Designated Reporting Manager: ${context.managerName}
- Current Leave Balances:
${context.leaveBalances}
- Recent Attendance logs (last few days):
${context.recentAttendance}

Rules:
1. Always be polite, concise, and helpful.
2. If they ask about their leaves or attendance, read the context numbers carefully and tell them their exact available numbers.
3. If they ask about check-in/attendance, refer to the attendance card on the homepage or tell them their details.
4. Keep answers brief (max 3-4 sentences/bullets) to fit inside a small chat window. Do not invent details not present in the context.
5. If you do not know the answer, politely tell them to email hr@company.com.

Conversation History:
${history.map(h => `${h.sender === 'user' ? 'Employee' : 'HR Assistant'}: ${h.text}`).join('\n')}
Employee: ${messageText}
HR Assistant:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemInstructions
              }
            ]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API returned error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response candidate structure from Gemini");
  }
  return text.trim();
};
