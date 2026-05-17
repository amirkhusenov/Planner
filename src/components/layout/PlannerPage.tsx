import { Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import RightSidebar from './RightSidebar'
import TaskBoardHeader from '../tasks/TaskBoardHeader'
import TaskTable from '../tasks/TaskTable'
import Button from '../ui/Button'
import { COMPLETED_TASKS, TODAY_TASKS } from '../../data/todayTasks'

export default function PlannerPage() {
  return (
    <main className="planner-root">
      <Sidebar />

      <section className="planner-content">
        <header className="planner-mobile-top" aria-label="Мобильная шапка">
          <p className="planner-mobile-top__brand">Planner</p>
          <div className="planner-mobile-top__profile">
            <div className="avatar">И</div>
            <div>
              <p className="sidebar__profile-name">Илья Тяпкин</p>
              <p className="sidebar__profile-time">Вт, 22 апреля, 21:17</p>
            </div>
          </div>
        </header>
        <TaskBoardHeader />
        <TaskTable tasks={TODAY_TASKS} />
        <div className="planner-content__actions">
          <Button icon={<Plus size={14} />}>Добавить задачу</Button>
        </div>

        <section className="completed-tasks" aria-label="Завершенные задачи">
          <h2 className="completed-tasks__title">Завершенные задачи</h2>
          <TaskTable tasks={COMPLETED_TASKS} isCompleted />
        </section>
      </section>

      <RightSidebar />
    </main>
  )
}
