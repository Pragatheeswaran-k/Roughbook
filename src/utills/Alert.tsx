export const Alert = ({ type, message }: { type: "success" | "error"; message: string }) => {
    const style =
      type === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";
    return <div className={`text-center py-2 rounded-lg ${style}`}>{message}</div>;
  };