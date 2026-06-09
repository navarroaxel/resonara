'use client'
import { useUI } from '@/store/ui-store'
import { t } from '@/lib/i18n'

export function Footer() {
  const { state: { lang } } = useUI()
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-6 mt-4 text-sm text-neutral-500 dark:text-neutral-400">
      <p className="mb-3">
        {t(lang, 'footerCredit')}{' '}
        <span className="font-medium text-neutral-700 dark:text-neutral-300">Electrotécnica I</span>{' '}
        {lang === 'es' ? 'de la' : 'at'} UTN – FRBA.
      </p>
      <ul className="space-y-1">
        <li>
          {t(lang, 'footerRelaxPrompt')}{' '}
          <a
            href="https://relax-method-viz.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            relax-method-viz.vercel.app
          </a>
        </li>
        <li>
          {t(lang, 'footerKinelabPrompt')}{' '}
          <a
            href="https://kinelab-theta.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            kinelab-theta.vercel.app
          </a>
        </li>
        <li>
          {t(lang, 'footerSagittaPrompt')}{' '}
          <a
            href="https://sagitta-nqm.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            sagitta-nqm.vercel.app
          </a>
        </li>
      </ul>
    </footer>
  )
}
