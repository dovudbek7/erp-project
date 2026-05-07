import React from "react"
import { RiDashboardFill } from "react-icons/ri"
import { Link } from "react-router"
const sideItems = [
  {
    id: 1,
    icon: <RiDashboardFill />,
    name: "Dashboard",
    route: "/",
  },
  {
    id: 1,
    icon: <RiDashboardFill />,
    name: "Dashboard",
    route: "/register",
  },
]
const Dashboard = () => {
  return (
    <div className="col bg-gray-600 text-white  py-5 h-screen ">
      <div className="border-b pl-5 pb-3 border-gray-400">
        <h2 className="font-bold">Andijan Meat Co</h2>
        <p className="font-thin text-gray-400">Meat ERP</p>
      </div>

      <div className="pl-5 pt-4 flex flex-col gap-3">
        {sideItems.map(item => (
          <Link to={item.route}>
            <div className="flex items-center gap-1">
              <span className="">{item.icon}</span>
              <span className="font-semibold">{item.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Dashboard
