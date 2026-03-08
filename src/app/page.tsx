'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'aurora';
  content: string;
}

const AURORA_SYSTEM_PROMPT = `You are AURORA - a Modular Multi-Agent Career Growth System designed for a 1st-year engineering student.`;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
    checkOllamaConnection();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkOllamaConnection = async () => {
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

  const sendMessage = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setIsLoading(true);
    setShowWelcome(false);

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

**Daily Practice:** Solve 2-3 LeetCode easy problems`;
    }

    if (input.includes('internship') || input.includes('job') || input.includes('placement')) {
      return `## Internship & Placement Guide

### For Internships (1st Year)
1. **Build Projects** - 2-3 solid projects
2. **DSA Basics** - Arrays, strings, algorithms
3. **Git & GitHub** - Version control
4. **Profile** - LinkedIn + GitHub ready

### Top Companies
- Google Summer of Code
- Microsoft Explore
- Amazon WoW
- College campus drives

### Preparation Strategy
| Month | Focus |
|-------|-------|
| 1-2 | DSA Foundations |
| 3-4 | First Project |
| 5-6 | Apply to internships |`;
    }

    if (input.includes('project') || input.includes('portfolio')) {
      return `## Project Ideas for Portfolio

### Beginner Projects
1. **Portfolio Website** - React/Next.js
2. **Todo App** - CRUD operations
3. **Weather App** - API integration
4. **Calculator** - Basic logic

### Intermediate Projects
1. **Full-stack App** - MERN stack
2. **Chat Application** - Socket.io
3. **Blog Platform** - CMS
4. **AI Chatbot** - LLM API integration

### Project Checklist
- Clean code with comments
- README with setup instructions
- Deployed live (Vercel/Netlify)
- GitHub with proper commits`;
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
4. Team roles: Frontend, Backend, Pitch`;
    }

    if (input.includes('github') || input.includes('linkedin')) {
      return `## Personal Branding Guide

### GitHub Optimization
1. Clean Profile README - Add intro, skills
2. Starred Repos - Curate interesting projects
3. Commit Activity - Consistent contributions
4. Good READMEs - Every project needs docs

### LinkedIn Tips
1. Professional photo
2. Compelling headline
3. About section: Your journey + goals
4. Post regularly about learning`;
    }

    return `## How Can I Help You?

Here's what I can assist with:

- **DSA & Coding** - Arrays, linked lists
- **Internship Prep** - Roadmap and strategies
- **Project Ideas** - Portfolio builders
- **Hackathons** - Upcoming contests
- **Personal Branding** - GitHub & LinkedIn`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    let html = content
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
      .replace(/\|(.+)\|/g, (match) => {
        const cells = match.split('|').filter(c => c.trim());
        if (cells.some(c => c.includes('---'))) return '';
        const tag = cells.some(c => c.trim().match(/^(Month|Focus|Day|Topic)/)) ? 'th' : 'td';
        return '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
      })
      .replace(/<li>/g, '<ul><li>')
      .replace(/<\/li>\n<li>/g, '</li><li>')
      .replace(/<\/li>$/g, '</li></ul>')
      .replace(/\n/g, '<br>');
    return html;
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="avatar">A</div>
          <div className="header-text">
            <h1>AURORA</h1>
            <p>Your Career Co-Pilot</p>
          </div>
        </div>
        <div className={`status-badge ${ollamaConnected ? '' : 'offline'}`}>
          <span className="status-dot"></span>
          {ollamaConnected ? 'AI Connected' : 'Smart Mode'}
        </div>
      </header>

      <div className="chat-container">
        {showWelcome && (
          <div className="welcome-section">
            <div className="welcome-icon">🚀</div>
            <h2 className="welcome-title">Welcome to Aurora!</h2>
            <p className="welcome-subtitle">
              Your AI-powered career coach. Ask me anything about DSA, internships, projects, or career growth.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div
              className="message-content"
              dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
            />
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

      <div className="quick-actions">
        <button className="quick-btn" onClick={() => sendMessage('Create a DSA learning plan')}>
          <span className="quick-btn-icon">📚</span> DSA Plan
        </button>
        <button className="quick-btn" onClick={() => sendMessage('Find internship opportunities')}>
          <span className="quick-btn-icon">💼</span> Internships
        </button>
        <button className="quick-btn" onClick={() => sendMessage('Suggest project ideas')}>
          <span className="quick-btn-icon">💡</span> Projects
        </button>
        <button className="quick-btn" onClick={() => sendMessage('Find hackathons')}>
          <span className="quick-btn-icon">🏆</span> Hackathons
        </button>
      </div>

      <div className="input-area">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your career..."
            disabled={isLoading}
          />
          <button className="send-btn" onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
