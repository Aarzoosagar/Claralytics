import { Link, useLocation } from "react-router-dom";

function DashboardLayout({ children }) {

  const location = useLocation();

  const sidebarItems = [
    {
      label: "Upload Dataset",
      path: "/dashboard/upload"
    },

    {
      label: "Analysis",
      path: "/dashboard/Analysis"
    },

    {
      label: "Dashboard",
      path: "/dashboard/overview"
    },

    {
      label: "Predictions",
      path: "/dashboard/predictions"
    },

    {
      label: "Reports",
      path: "/dashboard/reports"
    }
  ];

  return (

    <div className="
      min-h-screen
      bg-[#050505]
      text-white
    ">

      {/* TOPBAR */}
      <header className="
        h-[80px]
        border-b
        border-white/5
        flex
        items-center
        justify-between
        px-10
      ">

        {/* LOGO */}
        <Link to="/">

          <h1 className="
            text-2xl
            font-semibold
            tracking-[0.25em]
          ">
            CLARALYTICS
          </h1>

        </Link>

        {/* RIGHT SIDE */}
        <div className="
          flex
          items-center
          gap-4
        ">

          <button className="
            px-5
            py-2
            border
            border-white/10
            text-sm
            hover:border-white/20
            transition
          ">
            Workspace
          </button>

          <div className="
            w-10
            h-10
            rounded-full
            bg-white
            text-black
            flex
            items-center
            justify-center
            font-semibold
          ">
            A
          </div>

        </div>

      </header>

      {/* MAIN LAYOUT */}
      <div className="
        grid
        grid-cols-[260px_1fr]
      ">

        {/* SIDEBAR */}
        <aside className="
          border-r
          border-white/5
          min-h-[calc(100vh-80px)]
          p-6
        ">

          <div className="
            space-y-3
          ">

            {sidebarItems.map((item, index) => (

              <Link
                key={index}
                to={item.path}
              >

                <button
                  className={`
                    w-full
                    text-left
                    px-4
                    py-3
                    text-sm
                    transition

                    ${
                      location.pathname === item.path
                        ? "bg-white text-black"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  {item.label}
                </button>

              </Link>
            ))}

          </div>

        </aside>

        {/* PAGE CONTENT */}
        <main className="
          p-10
        ">

          {children}

        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;