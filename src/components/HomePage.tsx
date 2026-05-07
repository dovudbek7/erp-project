import { RiDashboardFill } from "react-icons/ri"
import { Link, Outlet } from "react-router"

const HomePage = () => {
  return (
    <>
      <div className="grid grid-cols-2">
        
        <div className="col">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default HomePage
