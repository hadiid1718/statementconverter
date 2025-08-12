import React from "react";
import { IoMdPerson } from "react-icons/io";
import { MdOutlineEmail } from "react-icons/md";
import { MdMessage } from "react-icons/md";

const ContactUs = () => {
  return (
    <>
      <div className="">
        <form >
          <div className="flex flex-col gap-4 justify-center items-center h-[60vh]">
            <div className="flex justify-center items-center gap-2 border-gray-300 border w-[300px] bg-white">
              <IoMdPerson />
              <input
                type="text"
                placeholder="Your full Name"
                className="outline-none focus:outline-none border-none focus:border-none focus:ring-0"
              />
            </div>
            <div className="flex justify-center items-center gap-2 border-gray-300 border w-[300px] bg-white">
              <MdOutlineEmail />
              <input
                type="email"
                placeholder="Your Email"
                className="outline-none focus:outline-none border-none focus:border-none focus:ring-0"
              />
            </div>
            <div className="flex w-[300px] justify-center  items-center gap-1 bg-white">
              <MdMessage />
              <input
                name="message"
                id="message"
                placeholder="Your Message"
                rows={2}
                className="border-0 outline-none focus:ring-0  "
              />
            </div>
        <button className="border-violet-900 border px-4 mt-4 rounded py-1 bg-violet-900 text-white cursor-pointer">Send</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ContactUs;
