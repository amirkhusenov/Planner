import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import AppLoadingGate from '../components/layout/AppLoadingGate'

import appCss from '../styles/index.css?url'

export const Route = createRootRoute({
  component: RootLayout,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Planner' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
})

function RootLayout() {
  return (
    <AppLoadingGate>
      <Outlet />
    </AppLoadingGate>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
