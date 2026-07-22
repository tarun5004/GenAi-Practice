import { FormEvent, KeyboardEvent, useState } from "react";
import ReactMarkdown from "react-markdown";

const suggestions = [
  "Explain async/await",
  "What are generics?",
  "Interface vs type",
];

type ApiResponse = {
  answer?: string;
  error?: string;
};

function SparkLogo() {
  return (
    <svg aria-hidden="true" className="logo-mark" viewBox="0 0 32 32">
      <path d="M16 2l2.6 8.1L26 6l-4.1 7.4L30 16l-8.1 2.6L26 26l-7.4-4.1L16 30l-2.6-8.1L6 26l4.1-7.4L2 16l8.1-2.6L6 6l7.4 4.1L16 2Z" />
      <circle cx="16" cy="16" r="3.2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function App() {
  const [question, setQuestion] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function askTutor(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (trimmedQuestion.length < 3 || isLoading) return;

    setQuestion(trimmedQuestion);
    setSubmittedQuestion(trimmedQuestion);
    setAnswer("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
      });
      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.answer) {
        throw new Error(data.error ?? "The tutor returned an unexpected response.");
      }

      setAnswer(data.answer);
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askTutor(question);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <SparkLogo />
          <strong>TypeTutor</strong>
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-subtitle">Learn TypeScript with Mistral AI</span>
        </div>
        <div className="connection-status">
          <span aria-hidden="true" />
          Mistral connected
        </div>
      </header>

      <main className="workspace">
        <section className="intro" aria-labelledby="page-title">
          <h1 id="page-title">What do you want to understand?</h1>
          <p>Ask any TypeScript question. Get clear explanations and practical examples.</p>
        </section>

        <form className="composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="question">
            Your TypeScript question
          </label>
          <textarea
            id="question"
            value={question}
            maxLength={1000}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about promises, generics, types..."
            rows={3}
          />
          <button
            className="send-button"
            type="submit"
            disabled={question.trim().length < 3 || isLoading}
            aria-label="Ask TypeTutor"
          >
            {isLoading ? <span className="button-spinner" /> : <SendIcon />}
          </button>
        </form>

        <div className="suggestions" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => void askTutor(suggestion)}
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <section className="answer-section" aria-live="polite" aria-busy={isLoading}>
          {!submittedQuestion && !error ? (
            <div className="empty-state">
              <span className="empty-icon">T</span>
              <div>
                <h2>Your explanation will appear here</h2>
                <p>Choose a suggestion or ask your own TypeScript question.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="section-label">You asked</p>
              <p className="asked-question">{submittedQuestion}</p>
              <p className="section-label answer-label">Mistral AI answer</p>

              {isLoading && (
                <div className="loading-answer">
                  <div className="loading-heading" />
                  <div className="loading-line" />
                  <div className="loading-line short" />
                </div>
              )}

              {error && (
                <div className="error-message" role="alert">
                  <strong>Couldn’t get an answer.</strong>
                  <span>{error}</span>
                  <button type="button" onClick={() => void askTutor(submittedQuestion)}>
                    Try again
                  </button>
                </div>
              )}

              {answer && (
                <article className="markdown-answer">
                  <ReactMarkdown>{answer}</ReactMarkdown>
                </article>
              )}
            </>
          )}
        </section>
      </main>

      <footer>Powered by LangChain + Mistral AI</footer>
    </div>
  );
}

export default App;
