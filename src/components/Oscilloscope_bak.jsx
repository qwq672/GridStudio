import React, { useRef, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';

export default function Oscilloscope({ analyserNodeRef, lang = 'zh' }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const t = useTranslation(lang);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let observer = null;

    // 自适应 canvas 尺寸
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resize();
    try {
      observer = new ResizeObserver(resize);
      observer.observe(canvas);
    } catch (e) {
      // ResizeObserver not available
    }

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);

      const analyser = analyserNodeRef?.current;
      if (!analyser || !ctx || !canvas) {
        // 没有分析器时画一条基线
        ctx.clearRect(0, 0, canvas.width || 300, canvas.height || 30);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      try {
        analyser.getByteTimeDomainData(dataArray);
      } catch (e) {
        return;
      }

      // 检查是否有音频信号
      let hasSignal = false;
      for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > 130 || dataArray[i] < 126) { hasSignal = true; break; }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!hasSignal) return;

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#5a7aff';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.stroke();
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div style={{
      height: 40,
      flexShrink: 0,
      borderTop: '1px solid var(--border, #2e2e38)',
      background: 'var(--panel, #1c1c24)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 8px',
    }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted, #787880)', whiteSpace: 'nowrap', flexShrink: 0 }}>
        {t.oscilloscope || '示波器'}
      </span>
      <canvas
        ref={canvasRef}
        style={{
          flex: 1,
          height: '100%',
          borderRadius: 3,
        }}
      />
    </div>
  );
}