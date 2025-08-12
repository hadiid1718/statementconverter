import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ResponsiveButton from "./ResponsiveButton";
import { IoMenu } from "react-icons/io5";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [openMenu, setOpenMenu] = useState(false);

  const openToggleMenu = () => {
    setOpenMenu(true);
  };

  //Logout api Calling

  return (
    <>
      <div>
        <nav className="flex justify-between px-4 py-3 mt-1 border-b border-gray-200 ">
          <Link to="/" className="text-xl font-semibold lg:text-xl">
            Bank Statement Converter
          </Link>

          {user ? (
            <div className="hidden lg:flex items-center gap-4 ">
              <Link onClick={logout}>Logout</Link>

            </div>
          ) : (
            <div className="hidden lg:flex justify-center items-center gap-3">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link
                to="/admin/login"
                className="text-red-700 hover:text-red-800 transition-all duration-75"
              >
                Admin
              </Link>
            </div>
          )}

          <IoMenu
            className="lg:hidden text-xl cursor-pointer"
            onClick={openToggleMenu}
          />
        </nav>
      </div>
      <ResponsiveButton isOpen={openMenu} setOpenMenu={setOpenMenu} />
    </>
  );
};

export default Navbar;
