import type { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { style, ...rest } = props;
  return (
    <button
      {...rest}
      style={{
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid #2a3a6d",
        background: "#1a2a5a",
        color: "white",
        cursor: "pointer",
        ...style
      }}
    />
  );
}

