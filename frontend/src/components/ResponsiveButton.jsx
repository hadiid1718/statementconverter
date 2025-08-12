import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { AuthContext } from "../context/AuthContext";
import { IoPersonCircleOutline } from "react-icons/io5";
import { CiLogout } from "react-icons/ci";

const ResponsiveButton = ({ isOpen, setOpenMenu }) => {
  if (!isOpen) return null;
  const clostAction = () => {
    setOpenMenu(!isOpen);
  };
  const { user, logout } = useContext(AuthContext);
  return (
    <>
      {user ? (
        <div className="relative  ">
          <div className="absolute top-0 right-0 z-10">
            <div className="border px-10 py-6 shadow-2xl lg:hidden">
              <div className="absolute top-2 right-3">
                <RxCross2
                  className="text-lg cursor-pointer"
                  onClick={clostAction}
                />
              </div>

              <div className="flex lg:hidden flex-col gap-4 ">
                  <div className="flex  items-center gap-2 ">
                    <IoPersonCircleOutline/>
                      <Link to="/dashboard" onClick={clostAction}>User Dashboard</Link>
                  </div>
                  <button className="flex items-center gap-2" onClick={logout}>
                    <CiLogout/>
                       <p>Logout</p>
                  </button>


              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="absolute top-0 right-0">
            <div className="border px-10 py-6 shadow-2xl lg:hidden">
              <div className="absolute top-2 right-3 ">
                <RxCross2
                  className="text-lg cursor-pointer"
                  onClick={clostAction}
                />
              </div>

              <div className="flex lg:hidden flex-col gap-4 ">
                <Link to="/login" onClick={clostAction}>
                  Login
                </Link>
                <Link to="/register" onClick={clostAction}>
                  Register
                </Link>
                <Link
                  to="/admin/login"
                  onClick={clostAction}
                  className="text-red-700 hover:text-red-900 "
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResponsiveButton;
