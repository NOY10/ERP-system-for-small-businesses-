import { AiOutlineBank } from "react-icons/ai";
import { BiHomeAlt2, BiWallet } from "react-icons/bi";
import {
  BsCalendar2Check,
  BsChevronDown,
  BsChevronRight,
  BsEnvelopePaper,
} from "react-icons/bs";
import { GoPeople } from "react-icons/go";
import { HiOutlineDocumentReport } from "react-icons/hi";
import { MdOutlineCancel } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";
import { Link, NavLink } from "react-router-dom";
import { GiPayMoney } from "react-icons/gi";
import { GiReceiveMoney } from "react-icons/gi";
import { GiTakeMyMoney } from "react-icons/gi";
import { GiMoneyStack } from "react-icons/gi";
import { BsFillJournalBookmarkFill } from "react-icons/bs";
import { FaJournalWhills } from "react-icons/fa";
import { SiNubank } from "react-icons/si";
import { useAppContext } from "../contexts/ContextProvider";
import Tooltip from "./Tooltip";
import { useEffect, useState } from "react";
import { RiUserSettingsLine, RiListSettingsFill } from "react-icons/ri";
import useAuthStore from "../store/useAuthStore";
import useAppStore from "../store/useAppStore";

const Drawer = () => {
  const activeMenu = useAppStore((s) => s.activeMenu);
  const setActiveMenu = useAppStore((s) => s.setActiveMenu);
  const screenSize = useAppStore((s) => s.screenSize);
  const { user } = useAuthStore();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeLinkS, setActiveLinkS] = useState(false);
  const [activeLinkP, setActiveLinkP] = useState(false);
  const [activeLinkA, setActiveLinkA] = useState(false);
  const [activeLinkPay, setActiveLinkPay] = useState(false);

  const handleCloseSidebar = () => {
    setActiveSubmenu(null);
    // setActiveMainMenu(null);
    if (activeMenu && screenSize <= 1323) {
      setActiveMenu(false);
    }
    setActiveLinkS(false);
    setActiveLinkP(false);
    setActiveLinkA(false);
    setActiveLinkPay(false);
  };

  const activeLink =
    "flex items-center pl-3 py-2 gap-4 text-primary text-md m-1 border-l-4 border-primary bg-navBg";

  const normalLink =
    "flex items-center pl-4 py-2 gap-4 text-md hover:bg-light-gray m-1 hover:bg-navBg";

  const icon = "text-[22px] text-primary";

  const handleToggleSubmenu = (submenu) => {
    setActiveSubmenu((prev) => (prev === submenu ? null : submenu));
  };

  const handleMainMenuClick = (submenu) => {
    if (!activeMenu) setActiveMenu(true);
    // setActiveMainMenu(mainMenu);
    handleToggleSubmenu(submenu);
  };

  const handleDashboardClick = () => {
    setActiveSubmenu(null);
    // setActiveMainMenu(null);
    setActiveLinkS(false);
    setActiveLinkP(false);
    setActiveLinkA(false);
    setActiveLinkPay(false);
  };

  useEffect(() => {
    if (!activeMenu) {
      setActiveSubmenu(null);
    }
  }, [activeMenu]);

  return (
    <div
      className={`h-screen overflow-auto md:overflow-visible pb-10 shadow-md bg-gray-100 transition-all duration-300 ease-in-out fixed top-0 z-40 ${
        activeMenu ? "w-72" : "w-0 md:w-[70px]"
      }`}
    >
      <div className="flex items-center justify-between md:justify-center p-4 md:p-4 text-center">
        <Link
          to="/"
          className="flex items-center justify-center"
          onClick={handleCloseSidebar}
        >
          <img
            src="/sidebar-logo.svg"
            alt="DRUKBOOKS"
            className={activeMenu ? "h-12 w-52" : "h-10 w-10 object-left"}
          />
        </Link>

        {activeMenu && (
          <div>
            <button
              type="button"
              onClick={() => setActiveMenu(!activeMenu)}
              className="text-xl text-primary rounded-full p-3 hover:bg-navBg block md:hidden"
            >
              <MdOutlineCancel />
            </button>
          </div>
        )}
      </div>

      <div>
        {(user.role === "Accounts" ||
          user.role === "Owner" ||
          user.role === "HR") && (
          <NavLink
            to={`/${user.role}Dashboard`}
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
            onClick={handleDashboardClick}
          >
            <Tooltip tooltip="Home" position="right" visible={!activeMenu}>
              <BiHomeAlt2 className={icon} />
            </Tooltip>
            {activeMenu && (
              <span className="capitalize text-black">Dashboard</span>
            )}
          </NavLink>
        )}

        {(user.role === "Accounts" || user.role === "Owner") && (
          <>
            {activeMenu && (
              <p className="text-gray-400 dark:text-gray-400 ml-3 my-2 uppercase">
                Finance Module
              </p>
            )}

            {/* Sale Submenu */}
            <div>
              <div
                className={`flex py-2 px-5 justify-between items-center cursor-pointer ${
                  activeLinkS ? "bg-navBg text-primary" : ""
                }`}
                onClick={() => handleMainMenuClick("sale")}
              >
                <div className="flex items-center">
                  <Tooltip
                    tooltip="Sales"
                    position="right"
                    visible={!activeMenu}
                  >
                    <HiOutlineDocumentReport className={icon} />
                  </Tooltip>
                  {activeMenu && (
                    <span className="capitalize text-black ml-4">Sales</span>
                  )}
                </div>
                {activeMenu && (
                  <span className="text-primary">
                    {activeSubmenu === "sale" ? (
                      <BsChevronDown />
                    ) : (
                      <BsChevronRight />
                    )}
                  </span>
                )}
              </div>
              <div
                className={`pl-8 overflow-hidden transition-all duration-300 ${
                  activeSubmenu === "sale" ? "max-h-40" : "max-h-0"
                }`}
              >
                <NavLink
                  to={`/Income`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkS(true);
                    setActiveLinkP(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(false);
                  }}
                >
                  <TbMoneybag className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Income</span>
                  )}
                </NavLink>
                <NavLink
                  to={`/Invoice`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkS(true);
                    setActiveLinkP(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(false);
                  }}
                >
                  <HiOutlineDocumentReport className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Invoice</span>
                  )}
                </NavLink>
              </div>
            </div>

            {/* Purchase Submenu */}
            <div>
              <div
                className={`flex py-2 px-5 justify-between items-center cursor-pointer ${
                  activeLinkP ? "bg-navBg text-primary" : ""
                }`}
                onClick={() => handleMainMenuClick("purchase")}
              >
                <div className="flex items-center">
                  <Tooltip
                    tooltip="Purchases"
                    position="right"
                    visible={!activeMenu}
                  >
                    <BiWallet className={icon} />
                  </Tooltip>
                  {activeMenu && (
                    <span className="capitalize text-black ml-4">
                      Purchases
                    </span>
                  )}
                </div>
                {activeMenu && (
                  <span className="text-primary">
                    {activeSubmenu === "purchase" ? (
                      <BsChevronDown />
                    ) : (
                      <BsChevronRight />
                    )}
                  </span>
                )}
              </div>
              <div
                className={`pl-8 overflow-hidden transition-all duration-300 ${
                  activeSubmenu === "purchase" ? "max-h-40" : "max-h-0"
                }`}
              >
                <NavLink
                  to={`/Expense`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(true);
                    setActiveLinkS(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(false);
                  }}
                >
                  <BiWallet className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Expense</span>
                  )}
                </NavLink>
                <NavLink
                  to={`/Quotation`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(true);
                    setActiveLinkS(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(false);
                  }}
                >
                  <HiOutlineDocumentReport className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Quotation</span>
                  )}
                </NavLink>
              </div>
            </div>

            {/* Accountant Submenu */}
            <div>
              <div
                className={`flex py-2 px-5 justify-between items-center cursor-pointer ${
                  activeLinkA ? "bg-navBg text-primary" : ""
                }`}
                onClick={() => handleMainMenuClick("accountant")}
              >
                <div className="flex items-center">
                  <Tooltip
                    tooltip="Accountant"
                    position="right"
                    visible={!activeMenu}
                  >
                    <AiOutlineBank className={icon} />
                  </Tooltip>
                  {activeMenu && (
                    <span className="capitalize text-black ml-4">
                      Accountant
                    </span>
                  )}
                </div>
                {activeMenu && (
                  <span className="text-primary">
                    {activeSubmenu === "accountant" ? (
                      <BsChevronDown />
                    ) : (
                      <BsChevronRight />
                    )}
                  </span>
                )}
              </div>
              <div
                className={`pl-8 overflow-hidden transition-all duration-300 ${
                  activeSubmenu === "accountant" ? "max-h-40" : "max-h-0"
                }`}
              >
                <NavLink
                  to={`/Banking`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(true);
                    setActiveLinkPay(false);
                  }}
                >
                  <SiNubank className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Banking</span>
                  )}
                </NavLink>
                <NavLink
                  to={`/ManualJournal`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(true);
                    setActiveLinkPay(false);
                  }}
                >
                  <FaJournalWhills className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">
                      Manual Journal
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to={`/ChartsOfAccount`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(true);
                    setActiveLinkPay(false);
                  }}
                >
                  <BsFillJournalBookmarkFill className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">
                      Charts of Account
                    </span>
                  )}
                </NavLink>
              </div>
            </div>

            <NavLink
              to={`/Reports`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleDashboardClick}
            >
              <Tooltip tooltip="Reports" position="right" visible={!activeMenu}>
                <HiOutlineDocumentReport className={icon} />
              </Tooltip>
              {activeMenu && (
                <span className="capitalize text-black">Reports</span>
              )}
            </NavLink>
          </>
        )}

        {(user.role === "HR" || user.role === "Owner") && (
          <>
            {activeMenu && (
              <p className="text-gray-400 dark:text-gray-400 ml-3 my-2 uppercase">
                HR Module
              </p>
            )}

            <NavLink
              to={`/staffInfo`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleDashboardClick}
            >
              <Tooltip
                tooltip="Staff Info"
                position="right"
                visible={!activeMenu}
              >
                <GoPeople className={icon} />
              </Tooltip>
              {activeMenu && (
                <span className="capitalize text-black">Staff Information</span>
              )}
            </NavLink>

            {/* payslip Submenu */}
            <div>
              <div
                className={`flex py-2 px-5 justify-between items-center cursor-pointer ${
                  activeLinkPay ? "bg-navBg text-primary" : ""
                }`}
                onClick={() => handleMainMenuClick("payslip")}
              >
                <div className="flex items-center">
                  <Tooltip
                    tooltip="Payslips"
                    position="right"
                    visible={!activeMenu}
                  >
                    <BsEnvelopePaper className={icon} />
                  </Tooltip>
                  {activeMenu && (
                    <span className="capitalize text-black ml-4">Payslip</span>
                  )}
                </div>
                {activeMenu && (
                  <span className="text-primary">
                    {activeSubmenu === "payslip" ? (
                      <BsChevronDown />
                    ) : (
                      <BsChevronRight />
                    )}
                  </span>
                )}
              </div>
              <div
                className={`pl-8 overflow-hidden transition-all duration-300 ${
                  activeSubmenu === "payslip" ? "max-h-50" : "max-h-0"
                }`}
              >
                <NavLink
                  to={`Payslip/Allowances`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(true);
                  }}
                >
                  <GiReceiveMoney className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Allowances</span>
                  )}
                </NavLink>
                <NavLink
                  to={`Payslip/Deductions`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(true);
                  }}
                >
                  <GiPayMoney className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">Deductions</span>
                  )}
                </NavLink>
                <NavLink
                  to={`Payslip/AdvanceSalary`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(true);
                  }}
                >
                  <GiTakeMyMoney className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">
                      Advance Salary
                    </span>
                  )}
                </NavLink>
                <NavLink
                  to={`Payslip/Reimbursements`}
                  className={({ isActive }) =>
                    isActive ? activeLink : normalLink
                  }
                  onClick={() => {
                    setActiveLinkP(false);
                    setActiveLinkS(false);
                    setActiveLinkA(false);
                    setActiveLinkPay(true);
                  }}
                >
                  <GiMoneyStack className={icon} />

                  {activeMenu && (
                    <span className="capitalize text-black">
                      Reimbursements
                    </span>
                  )}
                </NavLink>
              </div>
            </div>

            <NavLink
              to={`/leave`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleDashboardClick}
            >
              <Tooltip tooltip="Leave" position="right" visible={!activeMenu}>
                <BsCalendar2Check className={icon} />
              </Tooltip>
              {activeMenu && (
                <span className="capitalize text-black">Leave</span>
              )}
            </NavLink>
          </>
        )}

        {(user.role === "Owner" || user.role === "HR") && (
          <NavLink
            to={`/RoleAndDepartmentSettings`}
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
            onClick={handleDashboardClick}
          >
            <Tooltip
              tooltip="Users & Roles"
              position="right"
              visible={!activeMenu}
            >
              <RiListSettingsFill className={icon} />
            </Tooltip>
            {activeMenu && (
              <span className="capitalize text-black">
                Role & Department Settings
              </span>
            )}
          </NavLink>
        )}

        {user.role === "Owner" && (
          <NavLink
            to={`/UsersAndRoles`}
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
            onClick={handleDashboardClick}
          >
            <Tooltip
              tooltip="Users & Roles"
              position="right"
              visible={!activeMenu}
            >
              <RiUserSettingsLine className={icon} />
            </Tooltip>
            {activeMenu && (
              <span className="capitalize text-black">Users & Roles</span>
            )}
          </NavLink>
        )}
        {user.role === "Owner" && (
          <NavLink
            to={`/scheduleMeeting`}
            className={({ isActive }) => (isActive ? activeLink : normalLink)}
            onClick={handleDashboardClick}
          >
            <Tooltip
              tooltip="Schedule a Meeting"
              position="right"
              visible={!activeMenu}
            >
              <RiUserSettingsLine className={icon} />
            </Tooltip>
            {activeMenu && (
              <span className="capitalize text-black">Schedule a Meeting</span>
            )}
          </NavLink>
        )}
        {user.role === "Employee" && (
          <>
            <NavLink
              to={`/Leave`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleDashboardClick}
            >
              <Tooltip tooltip="Leave" position="right" visible={!activeMenu}>
                <BsCalendar2Check className={icon} />
              </Tooltip>
              {activeMenu && (
                <span className="capitalize text-black">Leave</span>
              )}
            </NavLink>
            <NavLink
              to={`/Payslip`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleDashboardClick}
            >
              <Tooltip tooltip="Payslip" position="right" visible={!activeMenu}>
                <BsEnvelopePaper className={icon} />
              </Tooltip>
              {activeMenu && (
                <span className="capitalize text-black">PaySlip</span>
              )}
            </NavLink>
            <NavLink
              to={`/AdvanceSalary`}
              className={({ isActive }) => (isActive ? activeLink : normalLink)}
              onClick={handleDashboardClick}
            >
              <Tooltip
                tooltip="AdvanceSalary"
                position="right"
                visible={!activeMenu}
              >
                <GiTakeMyMoney className={icon} />
              </Tooltip>
              {activeMenu && (
                <span className="capitalize text-black">AdvanceSalary</span>
              )}
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Drawer;
