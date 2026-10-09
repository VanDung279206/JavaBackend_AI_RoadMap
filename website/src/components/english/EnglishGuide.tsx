import CourseMarkdown from '@/components/CourseMarkdown';

// Render the original source tables without changing the site's Markdown parser.
export default function EnglishGuide({ markdown }: { markdown: string }) {
    return markdown.split(/(\n?\|[^\n]+(?:\n\|[^\n]+)+)/g).map((block, index) => {
        if (!block.trim().startsWith('|')) return <CourseMarkdown key={index}>{block}</CourseMarkdown>;
        const rows = block.trim().split('\n').map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
        const [header, , ...body] = rows;
        return <div className="english-table-scroll" key={index}><table><thead><tr>{header.map((cell, i) => <th key={i}><CourseMarkdown>{cell}</CourseMarkdown></th>)}</tr></thead><tbody>{body.map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}><CourseMarkdown>{cell}</CourseMarkdown></td>)}</tr>)}</tbody></table></div>;
    });
}
