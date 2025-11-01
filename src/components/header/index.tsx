// import Image from "next/image";
// import Link from "next/link";
import React, { useEffect, useState } from "react";
import Colorlogonobackground from "../../../public/Color logo - no background.png";
// import AddIcCallIcon from "@mui/icons-material/AddIcCall";
// import BookAdemo from "../../../common/bookAdemo";
// import { useRouter } from "next/router";
// import persona_plant from "../../../../public/assets/images/RealSales-user-images/persona-plant.png";
// import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
// import DemoMeeting from "../../modals/DemoMeeting";
// import { useDispatch, useSelector } from "react-redux";
// import { DemoMeetingValue } from "../../../redux/OpenModal";
// import TryRealsales from "../../modals/TryRealsales";
// import LogoutIcon from "@mui/icons-material/Logout";
// import { useLogout } from "../../../hooks/useLogout";
// import { AddAuth, AddUser } from "../../../redux/AuthReducer";
// import { ClickAwayListener } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const Header = (props: any) => {
  // const router = useRouter();
  // const dispatch = useDispatch();
  // const token = useSelector((state) => state.auth.auth);
  let token = localStorage.getItem("token")
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openIndustry, setOpenIndustry] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const ClearCash = () => {
    localStorage.clear();
  }

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  }

  // Helper function to get navigation link classes
  const getNavLinkClasses = (path: string) => {
    const baseClasses = "text-white leading-1 transition-all duration-200";
    const activeClasses = "underline decoration-yellow-400 decoration-2 underline-offset-4";
    const hoverClasses = "hover:underline hover:decoration-yellow-400 hover:decoration-2 hover:underline-offset-4";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : hoverClasses}`;
  }

  return (
    <header className="main-header sticky top-0 z-50 bg-[#060606] h-[60px] flex items-center justify-center">
      <div className="page-container mx-auto px-4 container">
        <nav className="main-nav flex justify-between items-center ">
          <Link
            onClick={() => ClearCash()}
            to="https://www.real-sales.com/" className="logo">
            <img
              src={Colorlogonobackground}
              alt="RealSales Logo"
              width={150}
              height={50}
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="header-links hidden md:block">
            <ul className="flex lg:gap-16 gap-8">
              <div>
                <Link
                  onClick={() => ClearCash()}
                  to="https://www.real-sales.com/"
                  className={getNavLinkClasses("/")}
                >
                  Home
                </Link>
              </div>
              <div>
                <Link
                  onClick={() => ClearCash()}
                  to="https://www.real-sales.com/about"
                  className={getNavLinkClasses("/about")}
                >
                  About
                </Link>
              </div>
              <div className="relative">
                {/* Container that keeps dropdown open on hover */}
                <div className="group inline-block relative">
                  {/* Main Link */}
                  <Link
                    to="#"
                    onClick={(e) => e.preventDefault()} // prevents navigation
                    className={`text-white leading-1 border-b-2 border-transparent hover:border-yellow-400 transition-all duration-300 ${
                      location.pathname === "/industries"
                        ? `nav-underline-yellow`
                        : ``
                    }`}
                  >
                    Case Study & Industries
                  </Link>

                  {/* Dropdown Menu */}
                  <div
                    className="absolute left-0 top-full mt-2 w-48 bg-[#060606] rounded shadow-lg opacity-0 invisible 
                 group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
                    style={{ transitionDelay: "0.15s" }} // keeps dropdown visible a little longer
                  >
                    <Link
                      to="https://www.real-sales.com/industries/food-equipments"
                      onClick={() => ClearCash()}
                      className="block px-4 py-2 text-white hover:bg-[#FFDE5A] hover:text-[#060606] transition-colors duration-200"
                    >
                      Food & Beverage Equipment
                    </Link>
                    <Link
                      to="/industries/industry2"
                      onClick={() => ClearCash()}
                      className="block px-4 py-2 text-white hover:bg-[#FFDE5A] hover:text-[#060606] transition-colors duration-200 cursor-not-allowed"
                    >
                      Healthcare -{" "}
                      <span className="text-gray-400 italic">coming soon</span>
                    </Link>
                  </div>
                </div>
              </div>
              {/* <div className="relative">
                <ClickAwayListener onClickAway={() => setOpenIndustry(false)}>
                  <Link
onClick={()=>ClearCash()}

                    to="#"
                    onClick={() => setOpenIndustry(!openIndustry)}
                    className={`text-white leading-1`}
                  >
                    Industries&nbsp;
                    <ArrowDropDownOutlinedIcon
                      className={`${
                        openIndustry ? `rotate-0` : `rotate-180`
                      } transform duration-300`}
                    />
                  </Link>
                </ClickAwayListener>

                {openIndustry ? (
                  <Link
onClick={()=>ClearCash()}

                    to={`#`}
                    className="absolute flex items-start justify-between top-12 bg-[#FFFFFFCC] shadow-lg p-4 w-[280%]"
                  >
                    <Image
                      src={persona_plant}
                      alt="persona_plant"
                      width={96}
                      className="w-24 h-auto !max-w-auto"
                    />
                    <div className="flex flex-col items-start gap-4">
                      <div>
                        <p>Industry</p>
                        <div className="flex items-center gap-2.5">
                          <hr className="w-16 border border-black" />
                          <div className="h-2.5 w-2.5 bg-black rotate-45" />
                        </div>
                      </div>
                      <p>Food & Beverage</p>
                    </div>
                  </Link>
                ) : null}
              </div> */}
              <div>
                <Link
                  onClick={() => ClearCash()}
                  to="https://www.real-sales.com/faq"
                  className={getNavLinkClasses("/faq")}
                >
                  FAQ
                </Link>
              </div>
              {token !== "" ? (
                <div>
                  <Link
                    to="/dashboard"
                    className={getNavLinkClasses("/dashboard")}
                  >
                    Dashboard
                  </Link>
                </div>
              ) : null}
            </ul>
          </div>
          {/* Call to Action Buttons */}
          {/* <div className="header-btn hidden md:flex items-center space-x-4">
            {token !== "" && (
              <div
                onClick={() => {
                  useLogout({ final: router.push("/") });
                  dispatch(AddAuth(""));
                  dispatch(AddUser({}));
                }}
                className="border border-solid border-white rounded p-0.5 px-4 cursor-pointer text-white"
              >
                <LogoutIcon className="text-white" />
                &nbsp;Logout
              </div>
            )}
            <BookAdemo
              className={`!text-[14px]`}
              onClick={() => dispatch(DemoMeetingValue(true))}
              icon={<AddIcCallIcon style={{ fontSize: "16px" }} />}
            />
          </div> */}

          {/* Mobile Menu Toggle */}
          <div
            className="mobile-toggle md:hidden cursor-pointer"
            onClick={toggleMobileMenu}
          >
            <span className="menu-bar block w-6 h-0.5 bg-white my-1"></span>
            <span className="menu-bar block w-6 h-0.5 bg-white my-1"></span>
            <span className="menu-bar block w-6 h-0.5 bg-white my-1"></span>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="mobile-menu fixed top-0 left-0 w-full h-full bg-[#060606] z-50">
              <div className="flex justify-between p-4">
                <img
                  src={Colorlogonobackground}
                  alt="RealSales Logo"
                  width={120}
                  height={40}
                />
                <button
                  onClick={toggleMobileMenu}
                  className="text-2xl text-white cursor-pointer"
                >
                  &times;
                </button>
              </div>
              <ul className="px-4">
                <li className="py-2 border-b">
                  <Link
                    to="https://www.real-sales.com/" 
                    onClick={() => { ClearCash(); setMobileMenuOpen(false) }}
                    className={getNavLinkClasses("/")}
                  >
                    Home
                  </Link>
                </li>
                <li className="py-2 border-b">
                  <Link
                    to="https://www.real-sales.com/about" 
                    onClick={() => { ClearCash(); setMobileMenuOpen(false) }}
                    className={getNavLinkClasses("/about")}
                  >
                    About
                  </Link>
                </li>
                <li className="py-2 border-b">
                  <div className="text-white">Case Study & Industries</div>
                  <div className="ml-4 mt-2 space-y-2">
                    <Link
                      to="https://www.real-sales.com/industries/food-equipments" 
                      onClick={() => { ClearCash(); setMobileMenuOpen(false) }}
                      className="block text-sm text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                    >
                      Food & Beverage Equipment
                    </Link>
                    <Link
                      to="/industries/industry2" 
                      onClick={() => { ClearCash(); setMobileMenuOpen(false) }}
                      className="block text-sm text-gray-400 cursor-not-allowed"
                    >
                      Healthcare - <span className="italic">coming soon</span>
                    </Link>
                  </div>
                </li>
                <li className="py-2 border-b">
                  <Link
                    to="https://www.real-sales.com/faq" 
                    onClick={() => { ClearCash(); setMobileMenuOpen(false) }}
                    className={getNavLinkClasses("/faq")}
                  >
                    FAQ
                  </Link>
                </li>
                {token !== "" ? (
                  <li className="py-2 border-b">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={getNavLinkClasses("/dashboard")}
                    >
                      Dashboard
                    </Link>
                  </li>
                ) : null}
                {/* <li className="py-4 flex flex-col gap-4">
                  {token !== "" && (
                    <div
                      onClick={() => {
                        useLogout({ final: router.push("/") });
                        dispatch(AddAuth(""));
                        dispatch(AddUser({}));
                      }}
                      className="border border-solid border-white rounded p-0.5 px-4 cursor-pointer text-white"
                    >
                      <LogoutIcon className="text-white" />
                      &nbsp;Logout
                    </div>
                  )}
                  <BookAdemo
                    link={`#`}
                    onClick={() => dispatch(DemoMeetingValue(true))}
                    icon={<AddIcCallIcon style={{ fontSize: "16px" }} />}
                  />
                </li> */}
              </ul>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
