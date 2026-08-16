import { useRef, useState } from 'react';

/**
 * Simple bot-detection for public forms, with no external service needed.
 *
 * Combines two well-established, low-friction techniques:
 * 1. Honeypot — a field that's invisible to real people (hidden via CSS,
 *    not just `type="hidden"`, since many bots skip literal hidden inputs
 *    but still fill in visually-hidden ones) but that simple bots fill in
 *    automatically. If it has a value on submit, the submission is a bot.
 * 2. Minimum fill time — real people take at least a couple of seconds to
 *    read and fill a form; bots often submit instantly. If the form is
 *    submitted faster than `minFillTimeMs`, treat it as automated.
 *
 * On a detected bot, the caller should silently drop the submission
 * (still show a normal "success" message) rather than surfacing an error —
 * that avoids teaching bots how to get past the check.
 */
export function useHoneypot(minFillTimeMs = 1500) {
  const [honeypotValue, setHoneypotValue] = useState('');
  const mountedAt = useRef(Date.now());

  const isBot = () => {
    if (honeypotValue.trim() !== '') return true;
    if (Date.now() - mountedAt.current < minFillTimeMs) return true;
    return false;
  };

  const honeypotFieldProps = {
    name: 'website',
    value: honeypotValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setHoneypotValue(e.target.value),
    tabIndex: -1,
    autoComplete: 'off',
    'aria-hidden': true,
    style: {
      position: 'absolute' as const,
      left: '-9999px',
      width: '1px',
      height: '1px',
      opacity: 0,
      pointerEvents: 'none' as const,
    },
  };

  return { isBot, honeypotFieldProps };
}
