import React from 'react';
import { Link } from 'react-router-dom';
import pass2 from "../../assets/images/pass2.png";

export default function Repass4() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 py-10 text-center px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-orange-500"> Forgot Your Password!</h1>
        <p className="text-white text-lg mt-2 font-semibold"> Reset the password</p>
      </div>

      {/*************** **/}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between px-4 sm:px-8 md:px-16 py-10 gap-10 flex-1">
        <div className="w-full lg:w-1/2 max-w-md text-center lg:text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-600 mb-14"> Password Reset <br className="hidden sm:block" /> Successfully!</h2>

          <Link to="/login"  className="block w-full bg-orange-600 text-white py-2 rounded-md text-center font-semibold hover:bg-orange-700 transition" > Go to Login  </Link>
        </div>

        {/* image */}
        <div className="w-full lg:w-1/2 flex justify-center">
        <img src={pass2} alt="" className="w-64 sm:w-72 md:w-80 lg:w-96" />
        </div>
      </div>
    </div>
  );
} 