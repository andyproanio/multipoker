import { useState, useEffect } from "react";

export const useDateFormat = (date) => {

  const [dateFormat, setdateFormat] = useState("")

  useEffect(() => {
    setdateFormat(
      new Intl.DateTimeFormat('es', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: 'numeric', minute: "2-digit", second: "2-digit"
      }).format(new Date(Date.parse(date)))
    );
  }, [date])

  return { dateFormat }
}