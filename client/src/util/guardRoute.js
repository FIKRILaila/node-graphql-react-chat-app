import React,{useEffect} from "react";
import {  useNavigate } from "react-router-dom";

import { useAuthState } from "../context/auth";

export default function GuardRoute({ authenticated,guest, children }) {
  const navigate = useNavigate();
  const { user } = useAuthState();
  useEffect(() => {
      authenticated && !user ?  navigate("/login", { replace: true }) : console.log('autheticated');
      guest && user ? navigate("/", { replace: true }) :  console.log('Notautheticated');
  }, [authenticated,user,guest])
  
  return <>{children}</>;
}
