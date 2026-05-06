import { useEffect } from "react";
import API from "../services/api";

function TestApi() {

  useEffect(() => {
    API.get("/asset")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h2>Check Console</h2>;
}

export default TestApi;