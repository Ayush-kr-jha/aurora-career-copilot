'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'aurora';
  content: string;
}

const AURORA_SYSTEM_PROMPT = `You are AURORA - a Modular Multi-Agent Career Growth System designed for a 1st-year engineering student. Your role is to help with:

1. Strategic Learning & Planning - DSA roadmaps, weekly plans, skill gap analysis
2. Opportunity Discovery - Hackathons, internships, coding contests
3. Personal Branding - GitHub and LinkedIn optimization
4. Execution & Tracking - Task management and progress logging

Be encouraging, structured, and practical. Use bullet points and tables when helpful. Keep responses concise but actionable.`;

export default function Home() {
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'aurora',
      content: `# Hello! I'm AURORA - Your Career Co-Pilot

I'm here to help you build competitive programming skills, create an impressive developer portfolio, and land high-value internships.

**What I Can Help You With:**

1. Strategic Learning & Planning - DSA progress tracking and roadmaps
2. Opportunity Discovery - Hackathons, coding contests, and fellowships
3. Personal Branding - GitHub portfolio optimization
4. Execution & Tracking - Task management and progress

---

How can I help you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkPexelsConnection = async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags', { method: 'GET' });
      if (res.ok) {
        setOllamaConnected(true);
        return true;
      }
    } catch {
      console.log('Ollama not connected');
    }
    setOllamaConnected(false);
    return false;
  };

  const checkOllamaConnection = checkPexelsConnection;

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2',
          prompt: `${AURORA_SYSTEM_PROMPT}\n\nUser: ${userMessage}\n\nAURORA:`,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOllamaConnected(true);
        setMessages((prev) => [
          ...prev,
          { role: 'aurora', content: data.response || "I'm here! How can I help with your career growth?" },
        ]);
      } else {
        throw new Error('Ollama request failed');
      }
    } catch {
      // Fallback responses when Ollama is not available
      const fallbackResponse = getFallbackResponse(userMessage);
      setMessages((prev) => [...prev, { role: 'aurora', content: fallbackResponse }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('dsa') || input.includes('array') || input.includes('algorithm')) {
      return `## DSA Learning Roadmap

Great choice! Here's a structured approach:

### Week 1: Arrays
- Basic operations (access, traverse, search)
- Practice: Reverse array, find max/min, linear search

### Week 2: Linked Lists
- Singly linked lists, operations
- Practice: Reverse, detect cycle, merge

### Week 3: Stacks & Queues
- Implementation and applications
- Practice: Valid parentheses, stack using queues

### Week 4: Sorting & Searching
- Bubble, selection, insertion, merge, quick sort
- Binary search variations

**Daily Practice:** Solve 2-3 LeetCode easy problems

Would you like me to create a detailed task list for this?`;
    }

    if (input.includes('internship') || input.includes('job') || input.includes('placement')) {
      return `## Internship & Placement Guide

Here's how to prepare:

### For Internships (1st Year)
1. **Build Projects** - 2-3 solid projects (full-stack, ML, etc.)
2. **DSA Basics** - Arrays, strings, basic algorithms
3. **Git & GitHub** - Version control essentials
4. **Profile** - LinkedIn + GitHub ready

### Top Companies Hiring Interns
- Google Summer of Code (check eligibility)
- Microsoft Explore
- Amazon WoW
- College campus drives

### Preparation Strategy
| Month | Focus |
|-------|-------|
| 1-2 | DSA Foundations |
| 3-4 | First Project |
| 5-6 | Apply to internships |

What role are you targeting?`;
    }

    if (input.includes('project') || input.includes('portfolio')) {
      return `## Project Ideas for Portfolio

### Beginner Projects (Start Here)
1. **Portfolio Website** - React/Next.js
2. **Todo App** - CRUD operations
3. **Weather App** - API integration
4. **Calculator** - Basic logic

### Intermediate Projects
1. **Full-stack App** - MERN stack
2. **Chat Application** - Socket.io
3. **Blog Platform** - CMS integration
4. **AI Chatbot** - Integrate LLM API

### Project Checklist
- [ ] Clean code with comments
- [ ] README with setup instructions
- [ ] Deployed live (Vercel/Netlify)
- [ ] GitHub with proper commits

Want project recommendations for a specific domain?`;
    }

    if (input.includes('hackathon') || input.includes('contest')) {
      return `## Hackathons & Coding Contests

### Upcoming Opportunities
- **MLH Local Hack Days** - Year-round
- **Kaggle Competitions** - ML/Data Science
- **LeetCode Weekly** - Every Sunday
- **CodeChef Contests** - Monthly

### Hackathon Tips
1. Start with ideation - solve a real problem
2. Build MVP fast - functionality over design
3. Practice wireframing
4. Team roles: Frontend, Backend, Pitch

### Coding Contest Prep
- Solve 150+ easy LeetCode problems
- Learn time complexity analysis
- Practice under timed conditions

Would you like me to find specific upcoming hackathons?`;
    }

    if (input.includes('github') || input.includes('linkedin')) {
      return `## Personal Branding Guide

### GitHub Optimization
1. **Clean Profile README** - Add intro, skills, stats
2. **Starred Repos** - Curate interesting projects
3. **Commit Activity** - Consistent contributions
4. **Good READMEs** - Every project needs:
   - What it does
   - How to run
   - Screenshots

### LinkedIn Tips
1. Professional photo
2. Compelling headline
3. About section: Your journey + goals
4. Post regularly about learning

### Content Ideas
- Share learning progress
- Post project demos
- Write about challenges faced

Would you like a GitHub profile review?`;
    }

    return `## How Can I Help You?

Here are some things I can assist with:

- **DSA & Coding** - Arrays, linked lists, algorithms
- **Internship Prep** - Roadmap and strategies
- **Project Ideas** - Portfolio builders
- **Hackathons** - Upcoming contests
- **Personal Branding** - GitHub & LinkedIn

What would you like to work on?`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>AURORA</h1>
        <p>Your Career Co-Pilot</p>
      </header>

      <div className="ollama-status connected">
        {ollamaConnected ? '● Ollama Connected (Local AI)' : '○ Ollama Not Connected - Using Smart Responses'}
      </div>

      <div className="chat-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.role === 'aurora' ? (
              <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>').replace(/^# (.+)$/gm, '<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
            ) : (
              msg.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message aurora">
            <div className="typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="quick-actions">
          <button className="quick-btn" onClick={() => handleQuickAction('Create a DSA learning plan')}>
            📚 DSA Plan
          </button>
          <button className="quick-btn" onClick={() => handleQuickAction('Find internship opportunities')}>
            💼 Internships
          </button>
          <button className="quick-btn" onClick={() => handleQuickAction('Suggest project ideas')}>
            💡 Projects
          </button>
          <button className="quick-btn" onClick={() => handleQuickAction('Find hackathons')}>
            🏆 Hackathons
          </button>
        </div>
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your career..."
            disabled={isLoading}
          />
          <button className="send-btn" onClick={sendMessage} disabled={isLoading || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
