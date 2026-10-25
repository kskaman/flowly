import { useEffect } from "react";

const SetTitle = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title + " | Flowly";
  }, [title]);

  return null;
};

export default SetTitle;
