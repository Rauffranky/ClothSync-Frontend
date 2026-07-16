import BusinessSignup from "./BusinessSignup";
import LaundrySignup from "./LaundrySignup";

const Signup = ({ portal }) => {
  if (portal.value === "business") return <BusinessSignup portal={portal} />;
  return <LaundrySignup portal={portal} />;
};

export default Signup;
