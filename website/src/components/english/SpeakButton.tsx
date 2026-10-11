"use client";
import { useEffect, useState } from 'react';
import { selectEnglishVoice } from '@/lib/english-speech';

export default function SpeakButton({ text, label = 'Nghe phát âm' }: { text: string; label?: string }) {
    const [available, setAvailable] = useState(false), [message, setMessage] = useState('Đang kiểm tra giọng đọc tiếng Anh…');
    const [rate, setRate] = useState('0.85');
    useEffect(() => {
        if (typeof window.speechSynthesis?.getVoices !== 'function' || typeof SpeechSynthesisUtterance !== 'function') {
            const timer = window.setTimeout(() => setMessage('Thiết bị chưa hỗ trợ phát âm. Bạn vẫn có thể học bằng văn bản.'), 0);
            return () => window.clearTimeout(timer);
        }
        function voices() {
            const voice = selectEnglishVoice(window.speechSynthesis.getVoices());
            setAvailable(!!voice);
            setMessage(voice ? '' : 'Chưa có giọng đọc tiếng Anh trên thiết bị. Có thể bật/cài giọng tiếng Anh trong trình duyệt hoặc hệ điều hành.');
        }
        const timer = window.setTimeout(voices, 0);
        window.speechSynthesis.addEventListener('voiceschanged', voices);
        return () => { window.clearTimeout(timer); window.speechSynthesis.removeEventListener('voiceschanged', voices); window.speechSynthesis.cancel(); };
    }, []);
    function speak() {
        const voice = selectEnglishVoice(window.speechSynthesis.getVoices());
        if (!voice) { setAvailable(false); setMessage('Không có giọng đọc tiếng Anh; dùng câu ví dụ để luyện đọc.'); return; }
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = Number(rate);
            utterance.onerror = () => setMessage('Không phát được âm thanh. Thử lại hoặc kiểm tra giọng đọc và âm lượng thiết bị.');
            window.speechSynthesis.cancel(); window.speechSynthesis.speak(utterance); setMessage('');
        } catch { setMessage('Không phát được âm thanh. Bạn vẫn có thể học bằng văn bản.'); }
    }
    return <div className="english-speech"><button type="button" disabled={!available} onClick={speak}>{label}</button><label>Tốc độ đọc<select value={rate} onChange={event => setRate(event.target.value)}><option value="0.7">Chậm</option><option value="0.85">Vừa</option><option value="1">Bình thường</option></select></label>{message && <small role="status">{message}</small>}</div>;
}
