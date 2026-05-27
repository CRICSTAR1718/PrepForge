const getPlanGenerationPrompt = (domain, durationDays) => {
    const domainContext = {
        DSA: "Data Structures and Algorithms — covering arrays, strings, linked lists, stacks, queues, trees, graphs, dynamic programming, sorting, searching, and problem-solving on platforms like LeetCode.",
        "Full Stack":
            "Full Stack Web Development — covering HTML/CSS, JavaScript, React, Node.js, Express, MongoDB, REST APIs, authentication, and deployment.",
        Aptitude:
            "Aptitude for campus placements — covering quantitative aptitude, logical reasoning, verbal ability, data interpretation, and puzzle-solving.",
    };

    return `You are an expert placement preparation coach for engineering students.

Generate a structured ${durationDays}-day study plan for the domain: ${domain}.
Domain details: ${domainContext[domain]}

Rules:
- Each day must have a clear, focused topic.
- Each day must have 3 to 5 specific, actionable tasks.
- estimatedMinutes should be realistic (between 60 and 180 minutes per day).
- Tasks should progress logically from basics to advanced over the ${durationDays} days.
- Keep task titles concise (under 10 words).

Respond with ONLY a valid JSON array. No explanation, no markdown, no code fences.
The array must have exactly ${durationDays} objects, each in this format:
[
  {
    "day": 1,
    "topic": "Topic name here",
    "tasks": [
      { "title": "Task title", "description": "One sentence description", "resourceUrl": "" },
      { "title": "Task title", "description": "One sentence description", "resourceUrl": "" }
    ],
    "estimatedMinutes": 90
  }
]`;
};

export { getPlanGenerationPrompt };