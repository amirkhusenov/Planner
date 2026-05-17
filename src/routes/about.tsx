import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <main className="about-page">
      <section className="about-card">
        <h1>Planner skeleton</h1>
        <p>
          Базовый каркас приложения собран на TanStack Start с отдельными компонентами и Storybook.
        </p>
      </section>
    </main>
  )
}

