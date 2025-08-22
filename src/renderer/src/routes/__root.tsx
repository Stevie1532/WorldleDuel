import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="bg-[#f4f4f1] border-b border-gray-200 px-4 py-2">
        <div className="flex gap-4 justify-center">
          <Link 
            to="/" 
            className="px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors [&.active]:bg-black [&.active]:text-white"
          >
            Home
          </Link>
          <Link 
            to="/lobby" 
            className="px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors [&.active]:bg-black [&.active]:text-white"
          >
            Lobby
          </Link>
          <Link 
            to="/about" 
            className="px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors [&.active]:bg-black [&.active]:text-white"
          >
            About
          </Link>
        </div>
      </nav>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
})
