import { useParams } from "react-router";

function LotsDetail() {
  const { id } = useParams();
  return <div>Lotsdetail {id}</div>;
}

export default LotsDetail;
