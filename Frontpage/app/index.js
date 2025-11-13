import { Redirect } from "expo-router";
import { auth } from "../firebaseConfig";

export default function Index() {
  const user = auth.currentUser;
  return <Redirect href={user ? "/tabs/home" : "/auth/login"} />;
}
