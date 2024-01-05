import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import { useTranslation } from "react-i18next";
import SidebarItem from "./SidebarItem";
import SidebarItemCollapse from "./SidebarItemCollapse";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import LogoutIcon from "@mui/icons-material/Logout";
import SidebarItemLogout from "./SidebarItemLogout";
import { useAuth } from "../../auth/AuthProvider";
import { useState } from "react";

function Sidebar({ handleDrawerToggle }) {
  const { t } = useTranslation();

  const auth = useAuth();

  const [activeItem, setActiveItem] = useState("dashboard"); // Nuevo estado para el elemento activo
  const handleItemClick = (itemId) => {
    console.log(itemId);
    setActiveItem(itemId);
    handleDrawerToggle();
  };

  const handleLogout = () => {
    auth.logout();
  };
  const menuItems = [
    {
      id: "dashboard",
      translationKey: "menu_dashboard",
      icon: <DashboardIcon />,
      subItems: null,
    },
    {
      id: "users",
      translationKey: "menu_users",
      icon: <PeopleIcon />,
      subItems: [
        {
          id: "companies",
          translationKey: "menu_companies",
          icon: <BusinessIcon />,
        },
        {
          id: "clients",
          translationKey: "menu_clients",
          icon: <PersonIcon />,
        },
        {
          id: "moderators",
          translationKey: "menu_moderators",
          icon: <SupervisorAccountIcon />,
        },
      ],
    },
    {
      id: "transactions",
      translationKey: "menu_transactions",
      icon: <MonetizationOnIcon />,
    },
    {
      id: "help",
      translationKey: "menu_help",
      icon: <HelpOutlineIcon />,
      subItems: null,
    },
  ];

  return (
    <div className="bg-[#555CB3] h-screen flex flex-col">
      <div className="flex mx-8 justify-center items-center space-x-2 my-8">
        <img src="/logo.png" className="h-12 w-12" alt="" />
        <h2
          style={{ textShadow: "2px 2px 1px #B45946", color: "white" }}
          className="font-semibold text-white text-xl tracking-widest text-shadow-lg"
        >
          PSROCKOLA
        </h2>
      </div>
      <Divider />
      <List>
        {menuItems.map((item, index) =>
          item.subItems ? (
            <SidebarItemCollapse
              item={item}
              t={t}
              key={index}
              handleDrawerToggle={handleDrawerToggle}
              handleItemClick={handleItemClick}
              activeItem={activeItem}
            />
          ) : (
            <SidebarItem
              item={item}
              t={t}
              key={index}
              handleDrawerToggle={handleDrawerToggle}
              handleItemClick={handleItemClick}
              activeItem={activeItem}
            />
          )
        )}
      </List>
      <div className="mt-auto mb-5">
        <SidebarItemLogout
          item={{
            id: "logout",
            translationKey: "menu_logout",
            icon: <LogoutIcon />,
            subItems: null,
          }}
          t={t}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
}

export default Sidebar;
