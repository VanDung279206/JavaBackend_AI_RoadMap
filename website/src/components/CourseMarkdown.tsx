import ReactMarkdown from 'react-markdown';

// A course sits under the page heading, so its Markdown starts at level two.
export default function CourseMarkdown({ children }: { children: string }) {
    return <div className="prose exercise-prose"><ReactMarkdown components={{ h1: ({ children }) => <h2>{children}</h2>, h2: ({ children }) => <h3>{children}</h3>, h3: ({ children }) => <h4>{children}</h4> }}>{children}</ReactMarkdown></div>;
}
